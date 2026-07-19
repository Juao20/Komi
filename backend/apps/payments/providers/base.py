from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class TransactionResult:
    transaction_id: str
    checkout_url: str
    raw: dict = field(default_factory=dict)


@dataclass
class VerificationResult:
    transaction_id: str
    status: str
    amount: Decimal
    currency: str
    payment_method: str = ""
    raw: dict = field(default_factory=dict)


@dataclass
class WebhookEvent:
    event_type: str
    transaction_id: str
    raw: dict = field(default_factory=dict)


class PaymentProviderBase:
    """Base interface every payment provider integration must implement.

    apps.payments.services.PaymentService is the only caller — nothing else
    in the codebase should import a concrete provider directly.
    """

    provider_name: str = ""

    def create_transaction(self, *, payment, callback_url: str, return_url: str) -> TransactionResult:
        raise NotImplementedError

    def verify_transaction(self, transaction_id: str) -> VerificationResult:
        raise NotImplementedError

    def verify_webhook_signature(self, *, payload: bytes, headers: dict) -> bool:
        raise NotImplementedError

    def parse_webhook_event(self, *, payload: bytes, headers: dict) -> WebhookEvent:
        raise NotImplementedError
