import hashlib
import hmac
import json
import logging
from decimal import Decimal

import requests
from django.conf import settings

from apps.core.exceptions import ServiceError
from apps.payments.choices import PaymentStatus
from apps.payments.providers.base import PaymentProviderBase, TransactionResult, VerificationResult, WebhookEvent

logger = logging.getLogger(__name__)

# FedaPay wraps single resources as {"v1/transaction": {...}} (JSON:API-flavoured).
# Fall back to a couple of alternate shapes defensively so a minor API version
# difference doesn't hard-crash the integration.
_TRANSACTION_KEYS = ("v1/transaction", "transaction")

_STATUS_MAP = {
    "pending": PaymentStatus.PENDING,
    "approved": PaymentStatus.SUCCESSFUL,
    "declined": PaymentStatus.FAILED,
    "canceled": PaymentStatus.CANCELLED,
    "cancelled": PaymentStatus.CANCELLED,
    "refunded": PaymentStatus.REFUNDED,
    "transferred": PaymentStatus.SUCCESSFUL,
}


def _unwrap_transaction(payload: dict) -> dict:
    for key in _TRANSACTION_KEYS:
        if key in payload:
            return payload[key]
    return payload


class FedapayService(PaymentProviderBase):
    provider_name = "fedapay"

    def __init__(self):
        self.secret_key = settings.FEDAPAY_SECRET_KEY
        self.webhook_secret = settings.FEDAPAY_WEBHOOK_SECRET
        self.base_url = (
            "https://sandbox-api.fedapay.com/v1"
            if settings.FEDAPAY_ENVIRONMENT != "live"
            else "https://api.fedapay.com/v1"
        )

    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _request(self, method: str, path: str, **kwargs) -> dict:
        try:
            response = requests.request(method, f"{self.base_url}{path}", headers=self._headers(), timeout=15, **kwargs)
            response.raise_for_status()
        except requests.RequestException as exc:
            logger.error("FedaPay API error on %s %s: %s", method, path, exc)
            raise ServiceError("Le service de paiement est momentanément indisponible.", code="provider_error") from exc
        return response.json() if response.content else {}

    def create_transaction(self, *, payment, callback_url: str, return_url: str) -> TransactionResult:
        customer = payment.customer
        body = {
            "description": f"Commande {payment.order.order_number} — {payment.store.name}",
            "amount": int(payment.amount),
            "currency": {"iso": payment.currency},
            "callback_url": callback_url,
            "customer": {
                "firstname": (customer.full_name.split(" ")[0] if customer else "Client"),
                "lastname": (" ".join(customer.full_name.split(" ")[1:]) or "KOMI") if customer else "KOMI",
                "email": (customer.email or None) if customer else None,
                "phone_number": {"number": customer.phone_number, "country": payment.store.country.lower()}
                if customer
                else None,
            },
        }

        created = _unwrap_transaction(self._request("POST", "/transactions", json=body))
        transaction_id = str(created["id"])

        token_response = self._request("POST", f"/transactions/{transaction_id}/token", json={"return_url": return_url})
        checkout_url = token_response.get("url") or token_response.get("token", {}).get("url", "")

        return TransactionResult(transaction_id=transaction_id, checkout_url=checkout_url, raw=created)

    def verify_transaction(self, transaction_id: str) -> VerificationResult:
        data = _unwrap_transaction(self._request("GET", f"/transactions/{transaction_id}"))
        status = _STATUS_MAP.get(data.get("status", ""), PaymentStatus.PENDING)
        return VerificationResult(
            transaction_id=str(data.get("id", transaction_id)),
            status=status,
            amount=Decimal(str(data.get("amount", 0))),
            currency=(data.get("currency") or {}).get("iso", ""),
            payment_method=data.get("mode", ""),
            raw=data,
        )

    def verify_webhook_signature(self, *, payload: bytes, headers: dict) -> bool:
        if not self.webhook_secret:
            logger.warning("FEDAPAY_WEBHOOK_SECRET is not configured; refusing webhook.")
            return False

        signature_header = headers.get("X-FEDAPAY-SIGNATURE") or headers.get("x-fedapay-signature", "")
        parts = dict(item.split("=", 1) for item in signature_header.split(",") if "=" in item)
        timestamp, signature = parts.get("t"), parts.get("s")
        if not timestamp or not signature:
            return False

        signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
        expected = hmac.new(self.webhook_secret.encode("utf-8"), signed_payload.encode("utf-8"), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)

    def parse_webhook_event(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        data = json.loads(payload)
        entity = _unwrap_transaction(data.get("entity", {}))
        return WebhookEvent(event_type=data.get("name", ""), transaction_id=str(entity.get("id", "")), raw=data)
