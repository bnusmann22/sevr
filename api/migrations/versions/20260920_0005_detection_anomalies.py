"""create detection_anomalies table

Revision ID: 20260920_0005
Revises: 20260920_0004
Create Date: 2026-09-20 00:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '20260920_0005'
down_revision: Union[str, None] = '20260920_0004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'detection_anomalies',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('project_id', sa.String(length=36), nullable=False),
        sa.Column('detector_name', sa.String(length=100), nullable=False),
        sa.Column('target_user', sa.String(length=100), nullable=False),
        sa.Column('risk_score', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('evidence_summary', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='open'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_detection_anomalies_project_id'), 'detection_anomalies', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_detection_anomalies_project_id'), table_name='detection_anomalies')
    op.drop_table('detection_anomalies')
