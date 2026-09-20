from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    default_tlp: Mapped[str] = mapped_column(String(20), nullable=False, default="AMBER")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    members: Mapped[list["ProjectMember"]] = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    files: Mapped[list["FileRecord"]] = relationship("FileRecord", back_populates="project", cascade="all, delete-orphan")
    activities: Mapped[list["ActivityEvent"]] = relationship("ActivityEvent", back_populates="project", cascade="all, delete-orphan")
    invitations: Mapped[list["ProjectInvitation"]] = relationship("ProjectInvitation", back_populates="project", cascade="all, delete-orphan")
    share_tokens: Mapped[list["ShareToken"]] = relationship("ShareToken", back_populates="project", cascade="all, delete-orphan")



class ProjectMember(Base):
    __tablename__ = "project_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="Researcher")
    department: Mapped[str] = mapped_column(String(100), nullable=False, default="General")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="members")


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    actor: Mapped[str] = mapped_column(String(100), nullable=False)
    detail: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="activities")


class FileRecord(Base):
    __tablename__ = "file_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_format: Mapped[str] = mapped_column(String(50), nullable=False, default="bin")
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    tlp_label: Mapped[str] = mapped_column(String(20), nullable=False, default="AMBER")
    uploaded_by: Mapped[str] = mapped_column(String(100), nullable=False, default="Researcher")
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    checksum_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    version_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    lifecycle_state: Mapped[str] = mapped_column(String(50), nullable=False, default="DRAFT")  # DRAFT, IN_REVIEW, TLP_EVALUATED, RELEASE_PENDING, RELEASED
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="files")
    share_tokens: Mapped[list["ShareToken"]] = relationship("ShareToken", back_populates="file", cascade="all, delete-orphan")
    versions: Mapped[list["FileVersion"]] = relationship("FileVersion", back_populates="file", cascade="all, delete-orphan")
    review_notes: Mapped[list["FileReviewNote"]] = relationship("FileReviewNote", back_populates="file", cascade="all, delete-orphan")
    transitions: Mapped[list["DocumentStateTransition"]] = relationship("DocumentStateTransition", back_populates="file", cascade="all, delete-orphan")


class FileVersion(Base):
    __tablename__ = "file_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    file_id: Mapped[str] = mapped_column(String(36), ForeignKey("file_records.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number: Mapped[str] = mapped_column(String(20), nullable=False, default="1.0")
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_by: Mapped[str] = mapped_column(String(255), nullable=False)
    change_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    file: Mapped["FileRecord"] = relationship("FileRecord", back_populates="versions")


class FileReviewNote(Base):
    __tablename__ = "file_review_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    file_id: Mapped[str] = mapped_column(String(36), ForeignKey("file_records.id", ondelete="CASCADE"), nullable=False, index=True)
    version_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("file_versions.id", ondelete="SET NULL"), nullable=True)
    author_id: Mapped[str] = mapped_column(String(255), nullable=False)
    author_name: Mapped[str] = mapped_column(String(255), nullable=False)
    note_type: Mapped[str] = mapped_column(String(50), nullable=False, default="PEER_COMMENT") # PEER_COMMENT, SUPERVISOR_JUSTIFICATION, TLP_OVERRIDE_REASON
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    file: Mapped["FileRecord"] = relationship("FileRecord", back_populates="review_notes")


class DocumentStateTransition(Base):
    __tablename__ = "document_state_transitions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    file_id: Mapped[str] = mapped_column(String(36), ForeignKey("file_records.id", ondelete="CASCADE"), nullable=False, index=True)
    from_state: Mapped[str] = mapped_column(String(50), nullable=False)
    to_state: Mapped[str] = mapped_column(String(50), nullable=False)
    actor_id: Mapped[str] = mapped_column(String(255), nullable=False)
    reason_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    file: Mapped["FileRecord"] = relationship("FileRecord", back_populates="transitions")


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="researcher")  # system_admin, supervisor, researcher

    # Profile & Academic KYC
    title: Mapped[str | None] = mapped_column(String(50))         # Dr, Assoc. Prof, Prof, Mr, Mrs, Ms
    name: Mapped[str | None] = mapped_column(String(100))          # Full Name
    edu_status: Mapped[str | None] = mapped_column(String(50))     # Student, Staff, PI
    student_cadre: Mapped[str | None] = mapped_column(String(50))  # Undergraduate, Postgraduate
    student_level: Mapped[str | None] = mapped_column(String(50))  # 100L, 200L, 300L, 400L, 500L, MSc, PhD
    department: Mapped[str | None] = mapped_column(String(100))    # e.g. Environmental Sciences
    faculty: Mapped[str | None] = mapped_column(String(100))       # e.g. Faculty of Science
    profile_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    invitations: Mapped[list["ProjectInvitation"]] = relationship("ProjectInvitation", back_populates="invitee", foreign_keys="ProjectInvitation.invitee_email")


class ProjectInvitation(Base):
    __tablename__ = "project_invitations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    inviter_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invitee_email: Mapped[str] = mapped_column(String(255), ForeignKey("users.email", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, accepted, declined, expired
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="invitations")
    invitee: Mapped["User"] = relationship("User", back_populates="invitations", foreign_keys=[invitee_email])


class ShareToken(Base):
    __tablename__ = "share_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    file_id: Mapped[str] = mapped_column(String(36), ForeignKey("file_records.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_email: Mapped[str] = mapped_column(String(255), nullable=False)
    artifact_type: Mapped[str] = mapped_column(String(20), nullable=False, default="native")  # native, sevr_container
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, revoked, exhausted
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="share_tokens")
    file: Mapped["FileRecord"] = relationship("FileRecord", back_populates="share_tokens")


class DetectionAnomaly(Base):
    __tablename__ = "detection_anomalies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    detector_name: Mapped[str] = mapped_column(String(100), nullable=False)
    target_user: Mapped[str] = mapped_column(String(100), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    evidence_summary: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, approved, dismissed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped["Project"] = relationship("Project")



