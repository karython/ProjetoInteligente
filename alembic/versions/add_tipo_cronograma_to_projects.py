"""add tipo_cronograma to projects

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-03-12

"""
from alembic import op
import sqlalchemy as sa

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "projects",
        sa.Column(
            "tipo_cronograma",
            sa.String(),
            nullable=False,
            server_default="semanal",
        ),
    )


def downgrade() -> None:
    op.drop_column("projects", "tipo_cronograma")
