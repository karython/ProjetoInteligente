# /app/services/asaas_service.py
import httpx
from typing import Optional
from fastapi import HTTPException, status
from app.core.config import settings


class AsaasService:
    """Serviço de integração com a API Asaas para gestão de assinaturas."""

    def __init__(self):
        self.base_url = settings.ASAAS_BASE_URL
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "access_token": settings.ASAAS_API_KEY,
        }

    def _request(self, method: str, path: str, **kwargs) -> dict:
        url = f"{self.base_url}{path}"
        with httpx.Client(timeout=30) as client:
            resp = client.request(method, url, headers=self.headers, **kwargs)
        if resp.status_code >= 400:
            detail = resp.text
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Erro Asaas ({resp.status_code}): {detail}",
            )
        return resp.json()

    # ------------------------------------------------------------------ #
    # Clientes                                                              #
    # ------------------------------------------------------------------ #

    def create_customer(self, nome: str, email: str, cpf_cnpj: Optional[str] = None) -> dict:
        """Cria um cliente no Asaas e retorna o objeto criado."""
        payload = {"name": nome, "email": email}
        if cpf_cnpj:
            payload["cpfCnpj"] = cpf_cnpj
        return self._request("POST", "/customers", json=payload)

    def get_customer(self, customer_id: str) -> dict:
        return self._request("GET", f"/customers/{customer_id}")

    # ------------------------------------------------------------------ #
    # Assinaturas                                                           #
    # ------------------------------------------------------------------ #

    def create_subscription(
        self,
        customer_id: str,
        billing_type: str = "CREDIT_CARD",
        value: float = None,
        next_due_date: str = None,
        description: str = "Plano PRO – Project Booster",
        cycle: str = "MONTHLY",
    ) -> dict:
        """Cria uma assinatura mensal no Asaas."""
        if value is None:
            value = settings.ASAAS_PLAN_VALUE
        if next_due_date is None:
            from datetime import date, timedelta
            next_due_date = (date.today() + timedelta(days=1)).isoformat()

        payload = {
            "customer": customer_id,
            "billingType": billing_type,
            "value": value,
            "nextDueDate": next_due_date,
            "description": description,
            "cycle": cycle,
        }
        return self._request("POST", "/subscriptions", json=payload)

    def get_subscription(self, subscription_id: str) -> dict:
        return self._request("GET", f"/subscriptions/{subscription_id}")

    def cancel_subscription(self, subscription_id: str) -> dict:
        return self._request("DELETE", f"/subscriptions/{subscription_id}")

    # ------------------------------------------------------------------ #
    # Link de pagamento (checkout)                                          #
    # ------------------------------------------------------------------ #

    def get_payment_link(self, subscription_id: str) -> Optional[str]:
        """Retorna o link de pagamento da primeira cobrança da assinatura."""
        data = self._request("GET", f"/subscriptions/{subscription_id}/payments")
        payments = data.get("data", [])
        if payments:
            return payments[0].get("invoiceUrl") or payments[0].get("bankSlipUrl")
        return None
