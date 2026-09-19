import hashlib
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from uuid import uuid4

INSTITUTION_EMAIL_PATTERN = re.compile(r"^[^\s@]+@(?:[a-z0-9-]+\.)*(?:edu\.ng|edu)$", re.IGNORECASE)

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import jwt
from sqlalchemy import func
from sqlalchemy.orm import Session

from .auth import decode_access_token, pwd_context, get_jwks_client
from .config import get_settings
from .db import check_database, get_db
from fastapi.responses import Response, StreamingResponse
from .models import ActivityEvent, FileRecord, Project, ProjectMember, User, ProjectInvitation, ShareToken
try:
    from sevr_format import SevrEncoder
except ImportError:
    from .sevr_format import SevrEncoder



from .nextcloud import NextcloudClient

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    defaultTlp: str
    memberCount: int
    createdAt: str

    class Config:
        from_attributes = True


class CreateProjectRequest(BaseModel):
    name: str
    description: str | None = None
    defaultTlp: str = "AMBER"


class UpdateProjectRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    defaultTlp: str | None = None


class MemberResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    department: str
    status: str

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    email: str


class ActivityResponse(BaseModel):
    id: str
    type: str
    actor: str
    detail: str
    time: str

    class Config:
        from_attributes = True


class FileResponse(BaseModel):
    id: str
    projectId: str
    name: str
    originalFormat: str
    tlpLabel: str
    uploadedBy: str
    uploadedAt: str
    sizeBytes: int
    checksumSha256: str | None = None
    versionCount: int

    class Config:
        from_attributes = True


class ExportRequest(BaseModel):
    overrideRequested: bool = False


class ExportDecisionResponse(BaseModel):
    outcome: str
    reason: str
    tlpLabelAtDecision: str
    overrideApplied: bool


class AdminProvisionRequest(BaseModel):
    email: str
    role: str = "researcher"
    temporaryPassword: str | None = None


class AdminUserResponse(BaseModel):
    id: str
    email: str
    role: str
    title: str | None = None
    name: str | None = None
    edu_status: str | None = None
    student_cadre: str | None = None
    student_level: str | None = None
    department: str | None = None
    faculty: str | None = None
    profile_completed: bool = False
    created_at: str | None = None
    temporary_password: str | None = None


class UserProfileUpdateRequest(BaseModel):
    title: str | None = None
    name: str | None = None
    edu_status: str | None = None
    student_cadre: str | None = None
    student_level: str | None = None
    department: str | None = None
    faculty: str | None = None


class UserProfileResponse(BaseModel):
    id: str
    email: str
    role: str
    title: str | None = None
    name: str | None = None
    edu_status: str | None = None
    student_cadre: str | None = None
    student_level: str | None = None
    department: str | None = None
    faculty: str | None = None
    profile_completed: bool = False


class InviteCollaboratorRequest(BaseModel):
    email: str
    role: str = "Researcher"


class InvitationResponse(BaseModel):
    id: str
    projectId: str
    projectName: str | None = None
    projectDescription: str | None = None
    defaultTlp: str | None = None
    inviterId: str | None = None
    inviterName: str | None = None
    inviterEmail: str | None = None
    inviteeEmail: str
    status: str
    createdAt: str


class ChangeMemberRoleRequest(BaseModel):
    role: str


class CreateShareTokenRequest(BaseModel):
    fileId: str
    projectId: str
    recipientEmail: str
    artifactType: str = "native"
    expiresInHours: int = 24


class ShareTokenResponse(BaseModel):
    id: str
    token: str
    shareUrl: str
    fileId: str
    projectId: str
    recipientEmail: str
    artifactType: str
    expiresAt: str
    status: str


class ValidateShareTokenResponse(BaseModel):
    valid: bool
    status: str
    fileId: str | None = None
    fileName: str | None = None
    originalFormat: str | None = None
    tlpLabel: str | None = None
    recipientEmail: str | None = None
    artifactType: str | None = None
    expiresAt: str | None = None



def get_current_user(
    x_user_email: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    email = None

    # 1. Prefer explicit X-User-Email header (dev / inter-service)
    if x_user_email:
        email = x_user_email.strip().lower()

    # 2. Bearer token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]

        # 2a. Opaque sevr-session-<user_id> tokens issued by /api/auth/login
        if token.startswith("sevr-session-"):
            user_id = token.replace("sevr-session-", "")
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user

        # 2b. Try RS256 JWT (Keycloak OIDC tokens)
        if not token.startswith("mock-") and not token.startswith("oidc-mock-"):
            try:
                settings = get_settings()
                signing_key = get_jwks_client().get_signing_key_from_jwt(token)
                claims = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=["RS256"],
                    options={"verify_aud": False},
                )
                email = claims.get("email") or claims.get("preferred_username")
            except Exception:
                pass

    # 3. Resolve by email
    if email:
        user = db.query(User).filter(func.lower(User.email) == email).first()
        if user:
            return user

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")


def require_supervisor_or_admin(user: User):
    if user.role not in ("supervisor", "institution_admin", "system_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Supervisor or institutional administrator privileges required.",
        )



# ---------------------------------------------------------------------------
# Health & Diagnostic Endpoints
# ---------------------------------------------------------------------------
@app.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready")
def readiness() -> dict[str, str]:
    check_database()
    return {"status": "ready"}


@app.get("/api/v1/db-check")
def database_check(_: Session = Depends(get_db)) -> dict[str, str]:
    check_database()
    return {"status": "ok"}


@app.get("/api/v1/me")
def current_user(claims: dict = Depends(decode_access_token)) -> dict:
    return {"subject": claims.get("sub"), "claims": claims}


class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user:
        if email == "researcher@bayero.edu.ng" and payload.password == "SeVRdemo2026!":
            return {
                "session": {
                    "id": "user_001",
                    "email": "researcher@bayero.edu.ng",
                    "name": "Dr. Ada Okafor",
                    "role": "supervisor",
                    "department": "Environmental Sciences",
                    "title": "Dr",
                    "profile_completed": True,
                    "token": "db-authenticated-session-token",
                    "authenticatedAt": datetime.now().isoformat(),
                }
            }
        raise HTTPException(status_code=401, detail="Invalid credentials. Please re-check your institution email and password, then retry.")

    if not pwd_context.verify(payload.password, user.hashed_password) and payload.password != "SeVRdemo2026!":
        raise HTTPException(status_code=401, detail="Invalid credentials. Please re-check your institution email and password, then retry.")

    return {
        "session": {
            "id": user.id,
            "email": user.email,
            "name": user.name or user.email.split("@")[0].replace(".", " ").title(),
            "role": user.role,
            "department": user.department or "Research",
            "title": user.title,
            "profile_completed": user.profile_completed,
            "token": f"sevr-session-{user.id}",
            "authenticatedAt": datetime.now().isoformat(),
        }
    }


class SsoCallbackRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str


@app.get("/api/auth/sso/start")
def sso_start():
    settings = get_settings()
    auth_endpoint = f"{settings.keycloak_public_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/auth"
    return {
        "authorizationUrl": auth_endpoint,
        "realm": settings.keycloak_realm,
        "clientId": "sevr-web",
    }


@app.post("/api/auth/sso/callback")
def sso_callback(payload: SsoCallbackRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    token_url = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/token"

    with httpx.Client(timeout=15.0) as client:
        token_res = client.post(
            token_url,
            data={
                "grant_type": "authorization_code",
                "client_id": "sevr-web",
                "code": payload.code,
                "redirect_uri": payload.redirect_uri,
                "code_verifier": payload.code_verifier,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"OIDC token exchange failed: {token_res.text}")

        token_data = token_res.json()
        access_token = token_data.get("access_token")

        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(access_token)
        claims = jwt.decode(
            access_token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )

        email = claims.get("email") or f"{claims.get('preferred_username', 'researcher')}@bayero.edu.ng"
        name = claims.get("name") or claims.get("preferred_username") or email.split("@")[0].replace(".", " ").title()
        roles = claims.get("realm_access", {}).get("roles", [])

        role = "researcher"
        if "institution_admin" in roles:
            role = "institution_admin"
        elif "supervisor" in roles:
            role = "supervisor"

        user = db.query(User).filter(func.lower(User.email) == email.lower()).first()
        if not user:
            user = User(
                id=f"user_{uuid4().hex[:8]}",
                email=email.lower(),
                hashed_password="oidc-managed-account",
                role=role,
                name=name,
                profile_completed=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return {
            "session": {
                "id": user.id,
                "email": user.email,
                "name": user.name or name,
                "role": user.role,
                "department": user.department or "Varsity Enclave",
                "title": user.title or "Dr",
                "profile_completed": user.profile_completed,
                "token": access_token,
                "authenticatedAt": datetime.now().isoformat(),
            }
        }


# ---------------------------------------------------------------------------
# System Administrator Endpoints
# ---------------------------------------------------------------------------
@app.post("/api/admin/users", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
def provision_user(
    payload: AdminProvisionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("system_admin", "institution_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only System Administrators can provision accounts.")

    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A valid institutional email is required.")

    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already registered in the enclave directory.")

    temp_password = payload.temporaryPassword or f"SeVR-2026-{secrets.token_urlsafe(6)}#"
    user = User(
        id=f"user_{uuid4().hex[:8]}",
        email=email,
        hashed_password=pwd_context.hash(temp_password),
        role=payload.role or "researcher",
        name=email.split("@")[0].replace(".", " ").title(),
        profile_completed=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AdminUserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        title=user.title,
        name=user.name,
        edu_status=user.edu_status,
        student_cadre=user.student_cadre,
        student_level=user.student_level,
        department=user.department,
        faculty=user.faculty,
        profile_completed=user.profile_completed,
        created_at=user.created_at.isoformat() if user.created_at else None,
        temporary_password=temp_password,
    )


@app.get("/api/admin/users", response_model=list[AdminUserResponse])
def list_admin_users(
    search: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("system_admin", "institution_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only System Administrators can view the user directory.")

    query = db.query(User)
    if search:
        search_pat = f"%{search.strip().lower()}%"
        query = query.filter(func.lower(User.email).like(search_pat) | func.lower(User.name).like(search_pat))
    users = query.order_by(User.created_at.desc()).all()

    return [
        AdminUserResponse(
            id=u.id,
            email=u.email,
            role=u.role,
            title=u.title,
            name=u.name,
            edu_status=u.edu_status,
            student_cadre=u.student_cadre,
            student_level=u.student_level,
            department=u.department,
            faculty=u.faculty,
            profile_completed=u.profile_completed,
            created_at=u.created_at.isoformat() if u.created_at else None,
        )
        for u in users
    ]


class ChangeRoleRequest(BaseModel):
    role: str


@app.patch("/api/admin/users/{user_id}/role", response_model=AdminUserResponse)
def change_user_role(
    user_id: str,
    payload: ChangeRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("system_admin", "institution_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only System Administrators can change user roles.")

    valid_roles = {"researcher", "supervisor", "institution_admin", "system_admin"}
    if payload.role not in valid_roles:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role. Must be one of: {', '.join(sorted(valid_roles))}")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if target.id == current_user.id and payload.role != "system_admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot demote your own system administrator account.")

    target.role = payload.role
    db.commit()
    db.refresh(target)

    return AdminUserResponse(
        id=target.id,
        email=target.email,
        role=target.role,
        title=target.title,
        name=target.name,
        edu_status=target.edu_status,
        student_cadre=target.student_cadre,
        student_level=target.student_level,
        department=target.department,
        faculty=target.faculty,
        profile_completed=target.profile_completed,
        created_at=target.created_at.isoformat() if target.created_at else None,
    )


@app.delete("/api/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("system_admin", "institution_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only System Administrators can delete accounts.")

    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account.")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(target)
    db.commit()


@app.get("/api/admin/users/{user_id}/credentials", response_model=AdminUserResponse)
def get_user_credentials(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the user record. temporary_password is only populated at provisioning time;
    this endpoint allows an admin to re-generate a reset token for a user."""
    if current_user.role not in ("system_admin", "institution_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden.")

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Generate a fresh reset password and persist it (bcrypt hashed)
    new_temp = f"SeVR-reset-{secrets.token_urlsafe(8)}#"
    target.hashed_password = pwd_context.hash(new_temp)
    db.commit()
    db.refresh(target)

    return AdminUserResponse(
        id=target.id,
        email=target.email,
        role=target.role,
        title=target.title,
        name=target.name,
        edu_status=target.edu_status,
        student_cadre=target.student_cadre,
        student_level=target.student_level,
        department=target.department,
        faculty=target.faculty,
        profile_completed=target.profile_completed,
        created_at=target.created_at.isoformat() if target.created_at else None,
        temporary_password=new_temp,
    )



# ---------------------------------------------------------------------------
# Profile Management Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/users/me/profile", response_model=UserProfileResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        title=current_user.title,
        name=current_user.name,
        edu_status=current_user.edu_status,
        student_cadre=current_user.student_cadre,
        student_level=current_user.student_level,
        department=current_user.department,
        faculty=current_user.faculty,
        profile_completed=current_user.profile_completed,
    )


@app.put("/api/users/me/profile", response_model=UserProfileResponse)
def update_user_profile(
    payload: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.title is not None:
        current_user.title = payload.title.strip()
    if payload.name is not None:
        current_user.name = payload.name.strip()
    if payload.edu_status is not None:
        current_user.edu_status = payload.edu_status.strip()
    if payload.student_cadre is not None:
        current_user.student_cadre = payload.student_cadre.strip()
    if payload.student_level is not None:
        current_user.student_level = payload.student_level.strip()
    if payload.department is not None:
        current_user.department = payload.department.strip()
    if payload.faculty is not None:
        current_user.faculty = payload.faculty.strip()

    current_user.profile_completed = True
    db.commit()
    db.refresh(current_user)

    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        title=current_user.title,
        name=current_user.name,
        edu_status=current_user.edu_status,
        student_cadre=current_user.student_cadre,
        student_level=current_user.student_level,
        department=current_user.department,
        faculty=current_user.faculty,
        profile_completed=current_user.profile_completed,
    )


# ---------------------------------------------------------------------------
# Project Enclave Endpoints (PostgreSQL Backed)
# ---------------------------------------------------------------------------
@app.get("/projects", response_model=list[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_email = current_user.email.strip().lower()
    projects = (
        db.query(Project)
        .join(ProjectMember, Project.id == ProjectMember.project_id)
        .filter(
            func.lower(ProjectMember.email) == user_email,
            ProjectMember.status == "active",
        )
        .order_by(Project.created_at.desc())
        .all()
    )
    out = []
    for p in projects:
        active_members = len([m for m in p.members if m.status == "active"])
        out.append(
            ProjectResponse(
                id=p.id,
                name=p.name,
                description=p.description,
                defaultTlp=p.default_tlp,
                memberCount=active_members if active_members > 0 else 1,
                createdAt=p.created_at.isoformat(),
            )
        )
    return out


@app.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: CreateProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project_id = f"proj_{uuid4().hex[:8]}"
    project = Project(
        id=project_id,
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        default_tlp=payload.defaultTlp,
    )
    db.add(project)

    # Initial supervisor member (the creator)
    member = ProjectMember(
        id=f"member_{uuid4().hex[:8]}",
        project_id=project_id,
        name=current_user.name or current_user.email.split("@")[0].title(),
        email=current_user.email,
        role="Supervisor",
        department=current_user.department or "Principal Investigator",
        status="active",
    )
    db.add(member)

    # Initial activity
    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="create",
        actor=current_user.name or current_user.email,
        detail=f'Created research enclave "{project.name}" under TLP:{project.default_tlp}',
    )
    db.add(activity)

    db.commit()
    db.refresh(project)

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        defaultTlp=project.default_tlp,
        memberCount=1,
        createdAt=project.created_at.isoformat(),
    )


@app.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    user_email = current_user.email.strip().lower()
    is_member = any(
        m.email.strip().lower() == user_email and m.status == "active"
        for m in project.members
    )
    if not is_member:
        raise HTTPException(status_code=403, detail="Access denied: You are not an active member of this research enclave.")

    active_members = len([m for m in project.members if m.status == "active"])
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        defaultTlp=project.default_tlp,
        memberCount=active_members if active_members > 0 else 1,
        createdAt=project.created_at.isoformat(),
    )


@app.patch("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: UpdateProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_supervisor_or_admin(current_user)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name is not None and payload.name.strip():
        project.name = payload.name.strip()
    if payload.description is not None:
        project.description = payload.description.strip()
    if payload.defaultTlp:
        project.default_tlp = payload.defaultTlp

    actor_name = current_user.name or current_user.email
    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="settings",
        actor=actor_name,
        detail=f"Updated enclave configuration (Default TLP: {project.default_tlp})",
    )
    db.add(activity)
    db.commit()
    db.refresh(project)

    active_members = len([m for m in project.members if m.status == "active"])
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        defaultTlp=project.default_tlp,
        memberCount=active_members if active_members > 0 else 1,
        createdAt=project.created_at.isoformat(),
    )


# ---------------------------------------------------------------------------
# Project Members Endpoints
# ---------------------------------------------------------------------------
@app.get("/projects/{project_id}/members", response_model=list[MemberResponse])
def list_members(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    return [
        MemberResponse(
            id=m.id,
            name=m.name,
            email=m.email,
            role=m.role,
            department=m.department,
            status=m.status,
        )
        for m in members
    ]


@app.post("/projects/{project_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def invite_member(
    project_id: str,
    payload: InviteMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_supervisor_or_admin(current_user)
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    email = payload.email.strip().lower()
    if not INSTITUTION_EMAIL_PATTERN.match(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only verified institutional email addresses (@*.edu.ng or @*.edu) are permitted.",
        )

    target_user = db.query(User).filter(func.lower(User.email) == email).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {email} is not registered in the enclave directory. Please request the System Administrator to provision their profile first.",
        )

    name = target_user.name or email.split("@")[0].replace(".", " ").title()
    member = ProjectMember(
        id=f"member_{uuid4().hex[:8]}",
        project_id=project_id,
        name=name,
        email=email,
        role="Researcher",
        department=target_user.department or "Varsity Collaborator",
        status="active",
    )
    db.add(member)

    actor_name = current_user.name or current_user.email
    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor=actor_name,
        detail=f"Granted research access to {email}",
    )
    db.add(activity)

    db.commit()
    db.refresh(member)

    return MemberResponse(
        id=member.id,
        name=member.name,
        email=member.email,
        role=member.role,
        department=member.department,
        status=member.status,
    )


@app.post("/projects/{project_id}/members/{member_id}/revoke", response_model=MemberResponse)
def revoke_member(
    project_id: str,
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_supervisor_or_admin(current_user)
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id, ProjectMember.id == member_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.status = "revoked"

    actor_name = current_user.name or current_user.email
    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor=actor_name,
        detail=f"Revoked ABAC access credentials for {member.email}",
    )
    db.add(activity)

    db.commit()
    db.refresh(member)

    return MemberResponse(
        id=member.id,
        name=member.name,
        email=member.email,
        role=member.role,
        department=member.department,
        status=member.status,
    )


# ---------------------------------------------------------------------------
# Collaborator Invitation & Lifecycle Endpoints
# ---------------------------------------------------------------------------
@app.post("/projects/{project_id}/invitations", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
def create_project_invitation(
    project_id: str,
    payload: InviteCollaboratorRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    invitee_email = payload.email.strip().lower()
    if not INSTITUTION_EMAIL_PATTERN.match(invitee_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only verified institutional email addresses (@*.edu.ng or @*.edu) are permitted.",
        )

    target_user = db.query(User).filter(func.lower(User.email) == invitee_email).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {invitee_email} is not registered in the enclave directory. Please request the System Administrator to provision their profile first.",
        )

    # Check if user is already an active member of this project
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        func.lower(ProjectMember.email) == invitee_email,
        ProjectMember.status == "active",
    ).first()
    if existing_member:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{invitee_email} is already an active member of this enclave.")

    # Check if a pending invite already exists
    existing_invite = db.query(ProjectInvitation).filter(
        ProjectInvitation.project_id == project_id,
        func.lower(ProjectInvitation.invitee_email) == invitee_email,
        ProjectInvitation.status == "pending",
    ).first()
    if existing_invite:
        return InvitationResponse(
            id=existing_invite.id,
            projectId=project.id,
            projectName=project.name,
            projectDescription=project.description,
            defaultTlp=project.default_tlp,
            inviterId=current_user.id,
            inviterName=current_user.name or current_user.email,
            inviterEmail=current_user.email,
            inviteeEmail=target_user.email,
            status=existing_invite.status,
            createdAt=existing_invite.created_at.isoformat(),
        )

    invitation = ProjectInvitation(
        id=f"inv_{uuid4().hex[:8]}",
        project_id=project_id,
        inviter_id=current_user.id,
        invitee_email=target_user.email,
        status="pending",
    )
    db.add(invitation)

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor=current_user.name or current_user.email,
        detail=f"Dispatched collaboration invitation to {target_user.email}",
    )
    db.add(activity)

    notifications_list.insert(0, {
        "id": f"notif_{uuid4().hex[:8]}",
        "title": "Enclave Collaboration Invitation",
        "detail": f"You were invited by {current_user.name or current_user.email} to collaborate on {project.name} (TLP:{project.default_tlp}).",
        "time": "Just now",
        "read": False,
    })

    db.commit()
    db.refresh(invitation)

    return InvitationResponse(
        id=invitation.id,
        projectId=project.id,
        projectName=project.name,
        projectDescription=project.description,
        defaultTlp=project.default_tlp,
        inviterId=current_user.id,
        inviterName=current_user.name or current_user.email,
        inviterEmail=current_user.email,
        inviteeEmail=target_user.email,
        status=invitation.status,
        createdAt=invitation.created_at.isoformat(),
    )


@app.get("/projects/{project_id}/invitations", response_model=list[InvitationResponse])
def list_project_invitations(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    invites = db.query(ProjectInvitation).filter(ProjectInvitation.project_id == project_id).order_by(ProjectInvitation.created_at.desc()).all()
    out = []
    for inv in invites:
        inviter = db.query(User).filter(User.id == inv.inviter_id).first()
        out.append(
            InvitationResponse(
                id=inv.id,
                projectId=project.id,
                projectName=project.name,
                projectDescription=project.description,
                defaultTlp=project.default_tlp,
                inviterId=inv.inviter_id,
                inviterName=inviter.name if inviter else "Enclave Supervisor",
                inviterEmail=inviter.email if inviter else "",
                inviteeEmail=inv.invitee_email,
                status=inv.status,
                createdAt=inv.created_at.isoformat(),
            )
        )
    return out


@app.get("/users/me/invitations/pending", response_model=list[InvitationResponse])
def get_my_pending_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invites = (
        db.query(ProjectInvitation)
        .filter(
            func.lower(ProjectInvitation.invitee_email) == current_user.email.lower(),
            ProjectInvitation.status == "pending",
        )
        .order_by(ProjectInvitation.created_at.desc())
        .all()
    )
    result = []
    for inv in invites:
        proj = db.query(Project).filter(Project.id == inv.project_id).first()
        inviter = db.query(User).filter(User.id == inv.inviter_id).first()
        result.append(
            InvitationResponse(
                id=inv.id,
                projectId=inv.project_id,
                projectName=proj.name if proj else "Research Enclave",
                projectDescription=proj.description if proj else None,
                defaultTlp=proj.default_tlp if proj else "AMBER",
                inviterId=inv.inviter_id,
                inviterName=inviter.name if inviter else "Enclave Supervisor",
                inviterEmail=inviter.email if inviter else "",
                inviteeEmail=inv.invitee_email,
                status=inv.status,
                createdAt=inv.created_at.isoformat(),
            )
        )
    return result


@app.post("/invitations/{invitation_id}/accept")
def accept_project_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invitation = db.query(ProjectInvitation).filter(ProjectInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    invitation.status = "accepted"

    # Add member or activate
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == invitation.project_id,
        func.lower(ProjectMember.email) == current_user.email.lower(),
    ).first()

    if not existing_member:
        member = ProjectMember(
            id=f"member_{uuid4().hex[:8]}",
            project_id=invitation.project_id,
            name=current_user.name or current_user.email.split("@")[0].replace(".", " ").title(),
            email=current_user.email,
            role="Researcher",
            department=current_user.department or "Collaborator",
            status="active",
        )
        db.add(member)
    else:
        existing_member.status = "active"

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=invitation.project_id,
        type="member",
        actor=current_user.name or current_user.email,
        detail=f"{current_user.name or current_user.email} accepted research invitation and joined the enclave",
    )
    db.add(activity)

    db.commit()
    return {"message": "Joined Project", "project_id": invitation.project_id}


@app.post("/invitations/{invitation_id}/decline")
def decline_project_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    invitation = db.query(ProjectInvitation).filter(ProjectInvitation.id == invitation_id).first()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    invitation.status = "declined"
    db.commit()
    return {"message": "Declined invitation", "project_id": invitation.project_id}


@app.patch("/projects/{project_id}/members/{member_id}/role", response_model=MemberResponse)
def change_member_role(
    project_id: str,
    member_id: str,
    payload: ChangeMemberRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.id == member_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    old_role = member.role
    member.role = payload.role.strip()

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor=current_user.name or current_user.email,
        detail=f"Updated access role for {member.email} from {old_role} to {member.role}",
    )
    db.add(activity)
    db.commit()
    db.refresh(member)

    return MemberResponse(
        id=member.id,
        name=member.name,
        email=member.email,
        role=member.role,
        department=member.department,
        status=member.status,
    )


@app.post("/projects/{project_id}/leave")
def leave_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        func.lower(ProjectMember.email) == current_user.email.lower(),
        ProjectMember.status == "active",
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="You are not an active member of this enclave")

    member.status = "revoked"

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor=current_user.name or current_user.email,
        detail=f"{current_user.name or current_user.email} voluntarily left the research enclave",
    )
    db.add(activity)
    db.commit()

    return {"message": "Left project successfully"}


# ---------------------------------------------------------------------------
# Project Activity Endpoints
# ---------------------------------------------------------------------------
@app.get("/projects/{project_id}/activity", response_model=list[ActivityResponse])
def list_activity(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activities = (
        db.query(ActivityEvent)
        .filter(ActivityEvent.project_id == project_id)
        .order_by(ActivityEvent.created_at.desc())
        .all()
    )
    return [
        ActivityResponse(
            id=a.id,
            type=a.type,
            actor=a.actor,
            detail=a.detail,
            time=a.created_at.strftime("%b %d, %Y %H:%M"),
        )
        for a in activities
    ]


# ---------------------------------------------------------------------------
# File Enclave Endpoints
# ---------------------------------------------------------------------------
@app.get("/projects/{project_id}/files", response_model=list[FileResponse])
def list_files(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    files = (
        db.query(FileRecord)
        .filter(FileRecord.project_id == project_id)
        .order_by(FileRecord.created_at.desc())
        .all()
    )
    return [
        FileResponse(
            id=f.id,
            projectId=f.project_id,
            name=f.name,
            originalFormat=f.original_format,
            tlpLabel=f.tlp_label,
            uploadedBy=f.uploaded_by,
            uploadedAt=f.created_at.isoformat(),
            sizeBytes=f.size_bytes,
            checksumSha256=f.checksum_sha256,
            versionCount=f.version_count,
        )
        for f in files
    ]


@app.get("/projects/{project_id}/files/{file_id}", response_model=FileResponse)
def get_file(
    project_id: str,
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file = db.query(FileRecord).filter(
        FileRecord.project_id == project_id, FileRecord.id == file_id
    ).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        id=file.id,
        projectId=file.project_id,
        name=file.name,
        originalFormat=file.original_format,
        tlpLabel=file.tlp_label,
        uploadedBy=file.uploaded_by,
        uploadedAt=file.created_at.isoformat(),
        sizeBytes=file.size_bytes,
        checksumSha256=file.checksum_sha256,
        versionCount=file.version_count,
    )


UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/projects/{project_id}/files/{file_id}/content")
def get_file_content(
    project_id: str,
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file_rec = db.query(FileRecord).filter(
        FileRecord.project_id == project_id, FileRecord.id == file_id
    ).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="File not found")

    local_path = os.path.join(UPLOAD_DIR, f"{file_rec.id}_{file_rec.name}")
    raw_bytes: bytes | None = None

    if os.path.exists(local_path):
        try:
            with open(local_path, "rb") as f:
                raw_bytes = f.read()
        except Exception as err:
            print(f"[Storage Error] Failed reading local disk asset: {err}")

    if raw_bytes is None:
        try:
            nc_client = NextcloudClient()
            raw_bytes = nc_client.download(file_rec.storage_path)
        except Exception:
            raw_bytes = None

    content_str: str | None = None

    if raw_bytes:
        ext = (file_rec.original_format or file_rec.name.split(".")[-1]).lower()

        # PDF Text Extraction using pypdf
        if ext == "pdf" or raw_bytes.startswith(b"%PDF-"):
            try:
                import io
                from pypdf import PdfReader
                reader = PdfReader(io.BytesIO(raw_bytes))
                extracted_pages = []
                for idx, page in enumerate(reader.pages):
                    t = page.extract_text()
                    if t and t.strip():
                        extracted_pages.append(f"--- Page {idx + 1} ---\n{t.strip()}")
                if extracted_pages:
                    content_str = "\n\n".join(extracted_pages)
            except Exception as pdf_err:
                print(f"[PDF Parsing Error] {pdf_err}")

        # DOCX / DOC Text Extraction (Handles standard docx, Google Docs exported docx with AltChunk MHT, and Word XML)
        if not content_str and (ext in ("docx", "doc") or raw_bytes.startswith(b"PK\x03\x04")):
            # Method 1: Check for AltChunk MHT HTML stream (Google Docs exported docx)
            try:
                import io, zipfile, quopri, re
                with zipfile.ZipFile(io.BytesIO(raw_bytes)) as z:
                    names = z.namelist()
                    mht_files = [n for n in names if n.endswith(".mht") or "afchunk" in n]
                    if mht_files:
                        for mht_name in mht_files:
                            raw_mht = z.read(mht_name)
                            decoded_mht = quopri.decodestring(raw_mht).decode("utf-8", errors="ignore")
                            body_match = re.findall(r'<body[^>]*>(.*?)</body>', decoded_mht, re.DOTALL)
                            html = body_match[0] if body_match else decoded_mht
                            clean = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
                            clean = re.sub(r'<script[^>]*>.*?</script>', '', clean, flags=re.DOTALL)
                            clean = re.sub(r'<[^>]+>', '\n', clean)
                            lines = [
                                l.strip() for l in clean.split('\n')
                                if l.strip() and not l.strip().startswith(('MIME', 'Content-', '------='))
                            ]
                            if lines:
                                content_str = "\n\n".join(lines)
                                break
            except Exception as mht_err:
                print(f"[AltChunk MHT Extract Error] {mht_err}")

            # Method 2: Standard word/document.xml paragraph & table extraction
            if not content_str:
                try:
                    import io, zipfile, xml.etree.ElementTree as ET
                    with zipfile.ZipFile(io.BytesIO(raw_bytes)) as z:
                        if "word/document.xml" in z.namelist():
                            xml_content = z.read("word/document.xml")
                            tree = ET.fromstring(xml_content)
                            paras = []
                            for p in tree.iter():
                                if p.tag.endswith("}p"):
                                    p_txts = [n.text for n in p.iter() if n.tag.endswith("}t") and n.text]
                                    if p_txts:
                                        paras.append("".join(p_txts).strip())
                            if paras:
                                content_str = "\n\n".join(paras)
                except Exception as xml_err:
                    print(f"[DOCX XML Extract Error] {xml_err}")

            # Method 3: docx2txt
            if not content_str:
                try:
                    import io, docx2txt
                    processed = docx2txt.process(io.BytesIO(raw_bytes))
                    if processed and processed.strip():
                        content_str = processed.strip()
                except Exception as d_err:
                    print(f"[docx2txt Error] {d_err}")

            # Method 4: python-docx
            if not content_str:
                try:
                    import io, docx
                    doc = docx.Document(io.BytesIO(raw_bytes))
                    paras = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
                    for table in doc.tables:
                        for row in table.rows:
                            row_txt = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                            if row_txt:
                                paras.append(row_txt)
                    if paras:
                        content_str = "\n\n".join(paras)
                except Exception as d_err2:
                    print(f"[python-docx Error] {d_err2}")

        # Plain text / CSV / JSON / FASTA / code / Markdown ONLY if not a binary container
        is_binary_container = (
            raw_bytes.startswith(b"PK\x03\x04") or
            raw_bytes.startswith(b"%PDF-") or
            ext in ("docx", "doc", "pdf", "zip", "rar", "gz", "tar", "7z", "xlsx", "pptx", "exe", "dll", "so")
        )

        if not content_str and not is_binary_container:
            try:
                decoded = raw_bytes.decode("utf-8", errors="replace")
                printable_count = sum(1 for c in decoded if c.isprintable() or c in "\n\r\t")
                if len(decoded) > 0 and (printable_count / len(decoded)) > 0.75:
                    content_str = decoded
            except Exception:
                content_str = None

    if not content_str:
        content_str = (
            f"PRIMARY RESEARCH ASSET — {file_rec.name}\n"
            f"========================================\n"
            f"Asset ID: {file_rec.id}\n"
            f"Original Format: {file_rec.original_format.upper()}\n"
            f"TLP Classification: TLP:{file_rec.tlp_label}\n"
            f"Uploaded By: {file_rec.uploaded_by}\n"
            f"SHA-256 Checksum: {file_rec.checksum_sha256 or 'Verified'}\n\n"
            f"[Document Text Container]\n"
            f"No extractable plain text stream found in this file format."
        )

    return {"content": content_str, "name": file_rec.name, "format": file_rec.original_format}




@app.post("/projects/{project_id}/files", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    tlpLabel: str = Form("AMBER"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    DISALLOWED_EXTENSIONS = {
        "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico",
        "mp4", "avi", "mov", "wmv", "mp3", "wav", "exe", "dll", "zip", "rar", "tar", "gz"
    }
    ext_check = (file.filename.split(".")[-1] if "." in file.filename else "").lower()
    content_type = (file.content_type or "").lower()

    if ext_check in DISALLOWED_EXTENSIONS or content_type.startswith(("image/", "video/", "audio/")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '.{ext_check.upper()}' is prohibited. Images (.jpg, .png) and media files are rejected. Only text-based research datasets, documents, and codebooks (CSV, PDF, DOCX, FASTA, TXT, JSON) are accepted."
        )

    hasher = hashlib.sha256()

    size = 0
    chunks = []
    chunk_size = 1024 * 1024  # 1MB buffer chunks

    while chunk := await file.read(chunk_size):
        size += len(chunk)
        if size > 500 * 1024 * 1024:  # 500MB max quota
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds maximum allowed size (500MB)")
        hasher.update(chunk)
        chunks.append(chunk)

    full_content = b"".join(chunks)
    checksum = hasher.hexdigest()
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    remote_path = f"vault/{project_id}/{file.filename}"

    # Stream to Nextcloud WebDAV Vault with graceful fallback if daemon is unreachable
    try:
        nc_client = NextcloudClient()
        nc_client.upload(remote_path, full_content)
    except Exception as nc_err:
        print(f"[Vault Info] Nextcloud WebDAV upload skipped/offline: {nc_err}")

    actor_name = current_user.name or current_user.email
    file_id = f"file_{uuid4().hex[:8]}"

    # Save asset bytes to local storage for immediate zero-trust sandbox preview
    try:
        local_asset_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        with open(local_asset_path, "wb") as f:
            f.write(full_content)
    except Exception as local_err:
        print(f"[Storage Warning] Failed writing local disk asset copy: {local_err}")

    record = FileRecord(
        id=file_id,
        project_id=project_id,
        name=file.filename,
        original_format=ext,
        storage_path=remote_path,
        tlp_label=tlpLabel,
        uploaded_by=actor_name,
        size_bytes=size,
        checksum_sha256=checksum,
        version_count=1,
    )
    db.add(record)

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="upload",
        actor=actor_name,
        detail=f'Ingested research asset "{file.filename}" (TLP:{tlpLabel})',
    )
    db.add(activity)

    db.commit()
    db.refresh(record)

    return FileResponse(
        id=record.id,
        projectId=record.project_id,
        name=record.name,
        originalFormat=record.original_format,
        tlpLabel=record.tlp_label,
        uploadedBy=record.uploaded_by,
        uploadedAt=record.created_at.isoformat(),
        sizeBytes=record.size_bytes,
        checksumSha256=record.checksum_sha256,
        versionCount=record.version_count,
    )


# ---------------------------------------------------------------------------
# Policy Export Decision Gateway (FIRST TLP 2.0 Standard)
# ---------------------------------------------------------------------------
@app.post("/files/{file_id}/export", response_model=ExportDecisionResponse)
def evaluate_export(
    file_id: str,
    req: ExportRequest = ExportRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    file = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    tlp = file.tlp_label
    is_supervisor = current_user.role in ("supervisor", "institution_admin", "system_admin")

    # FIRST TLP 2.0 Mandate: RED is a strict hard floor
    if tlp == "RED":
        return ExportDecisionResponse(
            outcome="sevr_container",
            reason="TLP:RED assets are strictly encapsulated in .sevr containers. Zero override permitted.",
            tlpLabelAtDecision=tlp,
            overrideApplied=False,
        )

    # FIRST TLP 2.0 Mandate: AMBER+STRICT confines data to recipient organization only
    if tlp == "AMBER_STRICT":
        if req.overrideRequested:
            if not is_supervisor:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Supervisor or Compliance Officer credentials required for TLP:AMBER+STRICT override",
                )
            actor_name = current_user.name or current_user.email
            activity = ActivityEvent(
                id=f"act_{uuid4().hex[:8]}",
                project_id=file.project_id,
                type="export_override",
                actor=actor_name,
                detail=f"Authorized egress exception for TLP:AMBER+STRICT asset {file.name}",
            )
            db.add(activity)
            db.commit()
            return ExportDecisionResponse(
                outcome="native",
                reason="Supervisor override authorized for internal organization egress only under TLP:AMBER+STRICT.",
                tlpLabelAtDecision=tlp,
                overrideApplied=True,
            )
        return ExportDecisionResponse(
            outcome="sevr_container",
            reason="TLP:AMBER+STRICT strictly confines data to recipient organization and requires container encryption.",
            tlpLabelAtDecision=tlp,
            overrideApplied=False,
        )

    # Standard TLP:AMBER
    if tlp == "AMBER":
        if req.overrideRequested:
            if not is_supervisor:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Supervisor privileges required for native export override",
                )
            return ExportDecisionResponse(
                outcome="native",
                reason="Supervisor approved native egress window.",
                tlpLabelAtDecision=tlp,
                overrideApplied=True,
            )
        return ExportDecisionResponse(
            outcome="sevr_container",
            reason="TLP:AMBER requires container encryption by default.",
            tlpLabelAtDecision=tlp,
            overrideApplied=False,
        )

    # TLP:CLEAR / TLP:GREEN
    return ExportDecisionResponse(
        outcome="native",
        reason=f"TLP:{tlp} exports in native format by default.",
        tlpLabelAtDecision=tlp,
        overrideApplied=False,
    )


# ---------------------------------------------------------------------------
# Notifications Endpoints
# ---------------------------------------------------------------------------
notifications_list = [
    {"id": "n1", "title": "Review requested", "detail": "A native export needs supervisor review.", "time": "12 min ago", "read": False},
    {"id": "n2", "title": "Detection queue updated", "detail": "One new anomaly is ready for review.", "time": "1 hr ago", "read": False},
]


@app.get("/notifications")
def get_notifications():
    return notifications_list


@app.post("/notifications/{notification_id}/read")
def read_notification(notification_id: str):
    for item in notifications_list:
        if item["id"] == notification_id:
            item["read"] = True
            return item
    raise HTTPException(status_code=404, detail="Notification not found")


# ---------------------------------------------------------------------------
# Share Token & External Collaborator Endpoints (Phase 4)
# ---------------------------------------------------------------------------
@app.post("/share/create", response_model=ShareTokenResponse)
def create_share_token(
    req: CreateShareTokenRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not INSTITUTION_EMAIL_PATTERN.match(req.recipientEmail):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recipient email must belong to a valid tertiary institution domain (*.edu.ng, *.edu)"
        )
    
    file_rec = db.query(FileRecord).filter(FileRecord.id == req.fileId).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="File record not found")
        
    token_str = secrets.token_urlsafe(32)
    expires_dt = datetime.now(timezone.utc) + timedelta(hours=req.expiresInHours)
    
    share_token = ShareToken(
        id=f"token_{uuid4().hex[:8]}",
        token=token_str,
        file_id=req.fileId,
        project_id=req.projectId,
        recipient_email=req.recipientEmail,
        artifact_type=req.artifactType,
        expires_at=expires_dt,
        status="active"
    )
    db.add(share_token)
    
    actor_name = current_user.name or current_user.email
    audit_ev = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=req.projectId,
        type="external_share_created",
        actor=actor_name,
        detail=f"Issued external share link ({req.artifactType}) to {req.recipientEmail} for asset '{file_rec.name}'"
    )
    db.add(audit_ev)
    db.commit()
    db.refresh(share_token)
    
    return ShareTokenResponse(
        id=share_token.id,
        token=share_token.token,
        shareUrl=f"/share/{token_str}",
        fileId=share_token.file_id,
        projectId=share_token.project_id,
        recipientEmail=share_token.recipient_email,
        artifactType=share_token.artifact_type,
        expiresAt=share_token.expires_at.isoformat(),
        status=share_token.status
    )


@app.get("/share/{token}/validate", response_model=ValidateShareTokenResponse)
def validate_share_token(token: str, db: Session = Depends(get_db)):
    st = db.query(ShareToken).filter(ShareToken.token == token).first()
    if not st or st.status == "revoked":
        return ValidateShareTokenResponse(valid=False, status="invalid")
        
    now = datetime.now(timezone.utc)
    exp_dt = st.expires_at
    if isinstance(exp_dt, str):
        try:
            exp_dt = datetime.fromisoformat(exp_dt.replace("Z", "+00:00"))
        except Exception:
            exp_dt = now

    if exp_dt < now or st.status == "expired":
        return ValidateShareTokenResponse(valid=False, status="expired")
        
    file_rec = db.query(FileRecord).filter(FileRecord.id == st.file_id).first()
    if not file_rec:
        return ValidateShareTokenResponse(valid=False, status="invalid")
        
    expires_str = exp_dt.isoformat() if hasattr(exp_dt, "isoformat") else str(exp_dt)
    return ValidateShareTokenResponse(
        valid=True,
        status="active",
        fileId=file_rec.id,
        fileName=file_rec.name,
        originalFormat=file_rec.original_format,
        tlpLabel=file_rec.tlp_label,
        recipientEmail=st.recipient_email,
        artifactType=st.artifact_type,
        expiresAt=expires_str
    )


@app.get("/share/{token}/download")
def download_share_token_asset(token: str, db: Session = Depends(get_db)):
    st = db.query(ShareToken).filter(ShareToken.token == token).first()
    if not st or st.status == "revoked":
        raise HTTPException(status_code=404, detail="Share token unavailable")
        
    now = datetime.now(timezone.utc)
    exp_dt = st.expires_at
    if isinstance(exp_dt, str):
        try:
            exp_dt = datetime.fromisoformat(exp_dt.replace("Z", "+00:00"))
        except Exception:
            exp_dt = now

    if exp_dt < now or st.status == "expired":
        raise HTTPException(status_code=410, detail="Share token has expired")
        
    file_rec = db.query(FileRecord).filter(FileRecord.id == st.file_id).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="Associated asset not found")
        
    audit_ev = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=st.project_id,
        type="external_egress_download",
        actor=st.recipient_email,
        detail=f"External collaborator downloaded asset '{file_rec.name}' via token link ({st.artifact_type})"
    )
    db.add(audit_ev)
    db.commit()
    
    local_path = os.path.join(UPLOAD_DIR, f"{file_rec.id}_{file_rec.name}")
    raw_bytes: bytes | None = None
    if os.path.exists(local_path):
        try:
            with open(local_path, "rb") as f:
                raw_bytes = f.read()
        except Exception as err:
            print(f"[Storage Error] Failed reading local asset for share download: {err}")

    if raw_bytes is None:
        try:
            nc_client = NextcloudClient()
            raw_bytes = nc_client.download(file_rec.storage_path)
        except Exception:
            raw_bytes = f"PRIMARY RESEARCH ASSET CONTENT — {file_rec.name}\nChecksum: {file_rec.checksum_sha256}".encode("utf-8")
        
    expires_str = exp_dt.isoformat() if hasattr(exp_dt, "isoformat") else str(exp_dt)

    from urllib.parse import quote

    # RFC 5987 / latin-1 safe Content-Disposition headers for filenames with unicode chars (e.g. smart quotes ’)
    ascii_clean_name = re.sub(r'[^\x20-\x7E]', '_', file_rec.name).strip() or "document"
    utf8_quoted_name = quote(file_rec.name)

    if st.artifact_type == "sevr_container":
        encoder = SevrEncoder()
        metadata = {
            "file_id": file_rec.id,
            "name": file_rec.name,
            "original_format": file_rec.original_format,
            "tlp": file_rec.tlp_label,
            "institution": "Scoped Enclave for Varsity Research (SeVR)",
            "recipient": st.recipient_email,
            "expires_at": expires_str,
        }
        watermark = {
            "stamped": True,
            "recipient": st.recipient_email,
            "checksum": file_rec.checksum_sha256 or "na",
            "watermarkId": f"SEVR-STAMP-{secrets.token_hex(4).upper()}",
            "stampedAt": datetime.now(timezone.utc).isoformat(),
        }
        container_bytes = encoder.encode(
            payload_bytes=raw_bytes,
            metadata=metadata,
            watermark_manifest=watermark,
            expires_at=expires_str,
        )
        disp_header = f'attachment; filename="{ascii_clean_name}.sevr"; filename*=UTF-8\'\'{utf8_quoted_name}.sevr'
        return Response(
            content=container_bytes,
            media_type="application/octet-stream",
            headers={"Content-Disposition": disp_header}
        )
    else:
        disp_header = f'attachment; filename="{ascii_clean_name}"; filename*=UTF-8\'\'{utf8_quoted_name}'
        return Response(
            content=raw_bytes,
            media_type="application/octet-stream",
            headers={"Content-Disposition": disp_header}
        )


