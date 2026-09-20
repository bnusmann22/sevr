"""document lifecycle, versions and review notes

Revision ID: 20260920_0006
Revises: 20260920_0005
Create Date: 2026-09-20 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260920_0006'
down_revision: Union[str, None] = '20260920_0005'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add lifecycle_state column to file_records
    op.add_column('file_records', sa.Column('lifecycle_state', sa.String(length=50), nullable=False, server_default='DRAFT'))

    # Create file_versions table
    op.create_table(
        'file_versions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('file_id', sa.String(length=36), nullable=False),
        sa.Column('version_number', sa.String(length=20), nullable=False, server_default='1.0'),
        sa.Column('storage_path', sa.String(length=500), nullable=False),
        sa.Column('checksum_sha256', sa.String(length=64), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_by', sa.String(length=255), nullable=False),
        sa.Column('change_summary', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['file_id'], ['file_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_file_versions_file_id'), 'file_versions', ['file_id'], unique=False)

    # Create file_review_notes table
    op.create_table(
        'file_review_notes',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('file_id', sa.String(length=36), nullable=False),
        sa.Column('version_id', sa.String(length=36), nullable=True),
        sa.Column('author_id', sa.String(length=255), nullable=False),
        sa.Column('author_name', sa.String(length=255), nullable=False),
        sa.Column('note_type', sa.String(length=50), nullable=False, server_default='PEER_COMMENT'),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['file_id'], ['file_records.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['version_id'], ['file_versions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_file_review_notes_file_id'), 'file_review_notes', ['file_id'], unique=False)

    # Create document_state_transitions table
    op.create_table(
        'document_state_transitions',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('file_id', sa.String(length=36), nullable=False),
        sa.Column('from_state', sa.String(length=50), nullable=False),
        sa.Column('to_state', sa.String(length=50), nullable=False),
        sa.Column('actor_id', sa.String(length=255), nullable=False),
        sa.Column('reason_note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['file_id'], ['file_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_state_transitions_file_id'), 'document_state_transitions', ['file_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_document_state_transitions_file_id'), table_name='document_state_transitions')
    op.drop_table('document_state_transitions')
    op.drop_index(op.f('ix_file_review_notes_file_id'), table_name='file_review_notes')
    op.drop_table('file_review_notes')
    op.drop_index(op.f('ix_file_versions_file_id'), table_name='file_versions')
    op.drop_table('file_versions')
    op.drop_column('file_records', 'lifecycle_state')
