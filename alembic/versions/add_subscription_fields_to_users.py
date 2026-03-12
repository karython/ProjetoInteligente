"""add subscription fields to users

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-03-11

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic
revision = "a1b2c3d4e5f6"
down_revision = "269989b3c223"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Cria o tipo enum de status de assinatura (PostgreSQL)
    subscription_status_enum = sa.Enum(
        "INACTIVE", "ACTIVE", "OVERDUE", "EXPIRED",
        name="subscriptionstatus"
    )
    subscription_status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("users", sa.Column("asaas_customer_id", sa.String(), nullable=True))
    op.add_column("users", sa.Column("asaas_subscription_id", sa.String(), nullable=True))
    op.add_column(
        "users",
        sa.Column(
            "subscription_status",
            sa.Enum("INACTIVE", "ACTIVE", "OVERDUE", "EXPIRED", name="subscriptionstatus"),
            nullable=False,
            server_default="INACTIVE",
        ),
    )
    op.add_column("users", sa.Column("subscription_due_date", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("grace_period_end", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "grace_period_end")
    op.drop_column("users", "subscription_due_date")
    op.drop_column("users", "subscription_status")
    op.drop_column("users", "asaas_subscription_id")
    op.drop_column("users", "asaas_customer_id")

    # Remove o tipo enum
    sa.Enum(name="subscriptionstatus").drop(op.get_bind(), checkfirst=True)
