# /app/routes/subscriptions.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, PlanType, SubscriptionStatus
from app.repositories.user_repository import UserRepository
from app.services.asaas_service import AsaasService
from app.schemas.subscription import (
    SubscribeRequest,
    SubscriptionStatusResponse,
    SubscriptionCreatedResponse,
    WebhookPayload,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


# ------------------------------------------------------------------ #
# Assinar plano PRO                                                     #
# ------------------------------------------------------------------ #

@router.post("", response_model=SubscriptionCreatedResponse, status_code=201)
def subscribe(
    data: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cria uma assinatura PRO no Asaas e atualiza o usuário."""
    if current_user.plano == PlanType.PRO and current_user.subscription_status == SubscriptionStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já possui uma assinatura PRO ativa.",
        )

    asaas = AsaasService()
    user_repo = UserRepository(db)

    # Cria ou reutiliza o cliente no Asaas
    customer_id = current_user.asaas_customer_id
    if not customer_id:
        customer = asaas.create_customer(
            nome=current_user.nome,
            email=current_user.email,
            cpf_cnpj=data.cpf_cnpj,
        )
        customer_id = customer["id"]

    # Cria a assinatura
    from datetime import date
    next_due = (date.today() + timedelta(days=1)).isoformat()
    subscription = asaas.create_subscription(
        customer_id=customer_id,
        billing_type=data.billing_type,
        next_due_date=next_due,
    )
    subscription_id = subscription["id"]

    # Obtém link de pagamento (primeira cobrança)
    payment_link: Optional[str] = asaas.get_payment_link(subscription_id)

    # Atualiza o usuário (PRO + ACTIVE)
    due_date = datetime.utcnow() + timedelta(days=30)
    user_repo.activate_subscription(
        user=current_user,
        asaas_customer_id=customer_id,
        asaas_subscription_id=subscription_id,
        due_date=due_date,
    )

    return SubscriptionCreatedResponse(
        message="Assinatura PRO criada com sucesso!",
        asaas_subscription_id=subscription_id,
        payment_link=payment_link,
    )


# ------------------------------------------------------------------ #
# Status da assinatura                                                  #
# ------------------------------------------------------------------ #

@router.get("/status", response_model=SubscriptionStatusResponse)
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna o status atual da assinatura do usuário."""
    _check_and_apply_downgrade(current_user, db)
    db.refresh(current_user)
    return SubscriptionStatusResponse(
        plano=current_user.plano,
        subscription_status=current_user.subscription_status,
        subscription_due_date=current_user.subscription_due_date,
        grace_period_end=current_user.grace_period_end,
        asaas_subscription_id=current_user.asaas_subscription_id,
    )


# ------------------------------------------------------------------ #
# Cancelar assinatura                                                   #
# ------------------------------------------------------------------ #

@router.delete("", status_code=200)
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancela a assinatura PRO e faz downgrade para o plano gratuito."""
    if current_user.plano == PlanType.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não possui uma assinatura ativa para cancelar.",
        )

    asaas = AsaasService()
    user_repo = UserRepository(db)

    if current_user.asaas_subscription_id:
        try:
            asaas.cancel_subscription(current_user.asaas_subscription_id)
        except HTTPException:
            pass  # Continua mesmo se a chamada ao Asaas falhar

    user_repo.cancel_subscription(current_user)
    return {"message": "Assinatura cancelada. Seu plano foi alterado para Gratuito."}


# ------------------------------------------------------------------ #
# Webhook Asaas                                                         #
# ------------------------------------------------------------------ #

@router.post("/webhook", status_code=200)
def asaas_webhook(
    payload: WebhookPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Recebe eventos do Asaas via webhook.

    Eventos tratados:
    - PAYMENT_CONFIRMED / PAYMENT_RECEIVED  → mantém/restaura plano PRO
    - PAYMENT_OVERDUE                        → inicia prazo de 30 dias
    - SUBSCRIPTION_DELETED                   → cancela assinatura
    """
    background_tasks.add_task(_process_webhook, payload.dict(), db)
    return {"received": True}


# ------------------------------------------------------------------ #
# Helpers internos                                                      #
# ------------------------------------------------------------------ #

def _process_webhook(payload: dict, db: Session) -> None:
    event = payload.get("event", "")
    payment = payload.get("payment") or {}
    subscription_id = payment.get("subscription") or (payload.get("subscription") or {}).get("id")

    if not subscription_id:
        return

    user_repo = UserRepository(db)
    user = user_repo.get_by_asaas_subscription_id(subscription_id)
    if not user:
        return

    if event in ("PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"):
        due_date = datetime.utcnow() + timedelta(days=30)
        user_repo.confirm_payment(user, due_date)

    elif event == "PAYMENT_OVERDUE":
        grace_end = datetime.utcnow() + timedelta(days=30)
        user_repo.set_overdue(user, grace_end)

    elif event == "SUBSCRIPTION_DELETED":
        user_repo.cancel_subscription(user)


def _check_and_apply_downgrade(user: User, db: Session) -> None:
    """Verifica se o prazo de 30 dias expirou e faz o downgrade automaticamente."""
    if (
        user.subscription_status == SubscriptionStatus.OVERDUE
        and user.grace_period_end
        and datetime.utcnow() >= user.grace_period_end
    ):
        UserRepository(db).downgrade_to_free(user)
