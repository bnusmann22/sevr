"""Create initial SeVR metadata tables.

Revision ID: 20260918_0001
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "20260918_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("default_tlp", sa.String(length=20), nullable=False, server_default="AMBER"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "file_records",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("project_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("tlp_label", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_file_records_project_id", "file_records", ["project_id"])


def downgrade() -> None:
    op.drop_index("ix_file_records_project_id", table_name="file_records")
    op.drop_table("file_records")
    op.drop_table("projects")
