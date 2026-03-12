# /app/schemas/subscription.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubscribeRequest(BaseModel):
    """Corpo da requisição para assinar o plano PRO."""
    billing_type: str = "UNDEFINED"   # UNDEFINED gera link de pagamento flexível
    cpf_cnpj: Optional[str] = None


class SubscriptionStatusResponse(BaseModel):
    """Status da assinatura do usuário."""
    plano: str
    subscription_status: str
    subscription_due_date: Optional[datetime]
    grace_period_end: Optional[datetime]
    asaas_subscription_id: Optional[str]


class SubscriptionCreatedResponse(BaseModel):
    """Resposta ao assinar o plano PRO."""
    message: str
    asaas_subscription_id: str
    payment_link: Optional[str]


class WebhookPayload(BaseModel):
    """Payload genérico recebido nos webhooks do Asaas."""
    event: str
    payment: Optional[dict] = None
    subscription: Optional[dict] = None
