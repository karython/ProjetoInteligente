# /app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class PlanType(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"


class SubscriptionStatus(str, enum.Enum):
    INACTIVE = "INACTIVE"      # Sem assinatura
    ACTIVE = "ACTIVE"          # Assinatura ativa
    OVERDUE = "OVERDUE"        # Pagamento atrasado (dentro do prazo de 30 dias)
    EXPIRED = "EXPIRED"        # Prazo de 30 dias expirou, aguardando downgrade


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    plano = Column(Enum(PlanType), default=PlanType.FREE, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Campos de assinatura Asaas
    asaas_customer_id = Column(String, nullable=True)
    asaas_subscription_id = Column(String, nullable=True)
    subscription_status = Column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.INACTIVE,
        nullable=False
    )
    subscription_due_date = Column(DateTime, nullable=True)   # Próximo vencimento
    grace_period_end = Column(DateTime, nullable=True)         # Fim do prazo de 30 dias

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")