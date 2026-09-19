"""Add share_tokens table for external collaborator links.

Revision ID: 20260920_0004
Revises: 20260919_0003
"""
from alembic import op
import sqlalchemy as sa

revision = "20260920_0004"
down_revision = "20260919_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "share_tokens",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("token", sa.String(length=64), nullable=False),
        sa.Column("file_id", sa.String(length=36), sa.ForeignKey("file_records.id", ondelete="CASCADE"), nullable=False),
        sa.Column("project_id", sa.String(length=36), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipient_email", sa.String(length=255), nullable=False),
        sa.Column("artifact_type", sa.String(length=20), nullable=False, server_default="native"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_share_tokens_token", "share_tokens", ["token"], unique=True)
    op.create_index("ix_share_tokens_file_id", "share_tokens", ["file_id"])
    op.create_index("ix_share_tokens_project_id", "share_tokens", ["project_id"])


def downgrade() -> None:
    op.drop_index("ix_share_tokens_project_id", table_name="share_tokens")
    op.drop_index("ix_share_tokens_file_id", table_name="share_tokens")
    op.drop_index("ix_share_tokens_token", table_name="share_tokens")
    op.drop_table("share_tokens")
