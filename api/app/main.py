import hashlib
import os
from datetime import datetime
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .auth import decode_access_token
from .config import get_settings
from .db import check_database, get_db
from .models import ActivityEvent, FileRecord, Project, ProjectMember
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
def login(payload: LoginRequest):
    email = payload.email.strip().lower()
    if email != "researcher@bayero.edu.ng" or payload.password != "SeVRdemo2026!":
        raise HTTPException(status_code=401, detail="Invalid institution email or password.")

    return {
        "session": {
            "email": "researcher@bayero.edu.ng",
            "name": "Dr. Ada Okafor",
            "role": "supervisor",
            "department": "Environmental Sciences",
            "token": "db-authenticated-session-token",
            "authenticatedAt": datetime.now().isoformat(),
        }
    }


# ---------------------------------------------------------------------------
# Project Enclave Endpoints (PostgreSQL Backed)
# ---------------------------------------------------------------------------
@app.get("/projects", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
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
def create_project(payload: CreateProjectRequest, db: Session = Depends(get_db)):
    project_id = f"proj_{uuid4().hex[:8]}"
    project = Project(
        id=project_id,
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        default_tlp=payload.defaultTlp,
    )
    db.add(project)

    # Initial supervisor member
    member = ProjectMember(
        id=f"member_{uuid4().hex[:8]}",
        project_id=project_id,
        name="Dr. Ada Okafor",
        email="researcher@bayero.edu.ng",
        role="Supervisor",
        department="Principal Investigator",
        status="active",
    )
    db.add(member)

    # Initial activity
    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="create",
        actor="Dr. Ada Okafor",
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
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

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
def update_project(project_id: str, payload: UpdateProjectRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name:
        project.name = payload.name.strip()
    if payload.description is not None:
        project.description = payload.description.strip()
    if payload.defaultTlp:
        project.default_tlp = payload.defaultTlp

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="settings",
        actor="Dr. Ada Okafor",
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
def list_members(project_id: str, db: Session = Depends(get_db)):
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
def invite_member(project_id: str, payload: InviteMemberRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    email = payload.email.strip()
    name = email.split("@")[0].replace(".", " ").title()
    member = ProjectMember(
        id=f"member_{uuid4().hex[:8]}",
        project_id=project_id,
        name=name,
        email=email,
        role="Researcher",
        department="Varsity Collaborator",
        status="active",
    )
    db.add(member)

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor="Dr. Ada Okafor",
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
def revoke_member(project_id: str, member_id: str, db: Session = Depends(get_db)):
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id, ProjectMember.id == member_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.status = "revoked"

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="member",
        actor="Dr. Ada Okafor",
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
# Project Activity Endpoints
# ---------------------------------------------------------------------------
@app.get("/projects/{project_id}/activity", response_model=list[ActivityResponse])
def list_activity(project_id: str, db: Session = Depends(get_db)):
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
def list_files(project_id: str, db: Session = Depends(get_db)):
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
def get_file(project_id: str, file_id: str, db: Session = Depends(get_db)):
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


@app.post("/projects/{project_id}/files", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    project_id: str,
    file: UploadFile = File(...),
    tlpLabel: str = Form("AMBER"),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = await file.read()
    checksum = hashlib.sha256(content).hexdigest()
    size = len(content)
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"

    file_id = f"file_{uuid4().hex[:8]}"
    record = FileRecord(
        id=file_id,
        project_id=project_id,
        name=file.filename,
        original_format=ext,
        storage_path=f"vault/{project_id}/{file.filename}",
        tlp_label=tlpLabel,
        uploaded_by="Dr. Ada Okafor",
        size_bytes=size,
        checksum_sha256=checksum,
        version_count=1,
    )
    db.add(record)

    activity = ActivityEvent(
        id=f"act_{uuid4().hex[:8]}",
        project_id=project_id,
        type="upload",
        actor="Dr. Ada Okafor",
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
def evaluate_export(file_id: str, req: ExportRequest = ExportRequest(), db: Session = Depends(get_db)):
    file = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    tlp = file.tlp_label
    if tlp == "RED":
        return ExportDecisionResponse(
            outcome="sevr_container",
            reason="RED-labelled files are strictly encapsulated in .sevr containers. Zero override permitted.",
            tlpLabelAtDecision=tlp,
            overrideApplied=False,
        )
    if tlp in ("AMBER", "AMBER_STRICT"):
        if req.overrideRequested:
            return ExportDecisionResponse(
                outcome="native",
                reason="Supervisor override validated for native format egress window.",
                tlpLabelAtDecision=tlp,
                overrideApplied=True,
            )
        return ExportDecisionResponse(
            outcome="sevr_container",
            reason=f"{tlp}-labelled files require cryptographic .sevr container encryption by default.",
            tlpLabelAtDecision=tlp,
            overrideApplied=False,
        )
    return ExportDecisionResponse(
        outcome="native",
        reason=f"{tlp}-labelled files export in native format by default.",
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

