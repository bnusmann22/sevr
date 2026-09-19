"""Add project_members, activity_events, and extend file_records table.

Revision ID: 20260919_0002
Revises: 20260918_0001
"""
from alembic import op
import sqlalchemy as sa

revision = "20260919_0002"
down_revision = "20260918_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create project_members
    op.create_table(
        "project_members",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False, server_default="Researcher"),
        sa.Column("department", sa.String(length=100), nullable=False, server_default="General"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_project_members_project_id", "project_members", ["project_id"])

    # Create activity_events
    op.create_table(
        "activity_events",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("actor", sa.String(length=100), nullable=False),
        sa.Column("detail", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_activity_events_project_id", "activity_events", ["project_id"])

    # Add extra columns to file_records
    op.add_column("file_records", sa.Column("original_format", sa.String(length=50), nullable=False, server_default="bin"))
    op.add_column("file_records", sa.Column("uploaded_by", sa.String(length=100), nullable=False, server_default="Researcher"))
    op.add_column("file_records", sa.Column("size_bytes", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("file_records", sa.Column("checksum_sha256", sa.String(length=64), nullable=True))
    op.add_column("file_records", sa.Column("version_count", sa.Integer(), nullable=False, server_default="1"))


def downgrade() -> None:
    op.drop_column("file_records", "version_count")
    op.drop_column("file_records", "checksum_sha256")
    op.drop_column("file_records", "size_bytes")
    op.drop_column("file_records", "uploaded_by")
    op.drop_column("file_records", "original_format")
    op.drop_index("ix_activity_events_project_id", table_name="activity_events")
    op.drop_table("activity_events")
    op.drop_index("ix_project_members_project_id", table_name="project_members")
    op.drop_table("project_members")
