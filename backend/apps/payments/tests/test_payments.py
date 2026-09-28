import hashlib
import hmac
import json
import time
from decimal import Decimal
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from apps.core.testing import make_product, make_store
from apps.orders.choices import OrderStatus
from apps.orders.choices import PaymentStatus as OrderPaymentStatus
from apps.orders.services import create_order
from apps.payments.choices import PaymentStatus
from apps.payments.models import Payment
from apps.payments.providers.base import TransactionResult, VerificationResult
from apps.payments.providers.fedapay import _map_payment_method
from apps.wallets.models import Wallet, WalletTransaction

WEBHOOK_URL = "/api/v1/payments/webhook/fedapay/"
FEDAPAY = "apps.payments.providers.fedapay.FedapayService"


def _signed(body, secret="test-webhook-secret"):
    raw = json.dumps(body)
    timestamp = str(int(time.time()))
    signature = hmac.new(secret.encode(), f"{timestamp}.{raw}".encode(), hashlib.sha256).hexdigest()
    return raw, f"t={timestamp},s={signature}"


def _verification(status, amount):
    return VerificationResult(
        transaction_id="777", status=status, amount=Decimal(amount), currency="XOF", payment_method="mtn_momo", raw={}
    )


class PaymentFlowTests(TestCase):
    def setUp(self):
        cache.clear()
        self.store = make_store()
        product = make_product(self.store, price="15000")
        self.order = create_order(
            store=self.store,
            customer_name="Kofi Mensah",
            customer_phone="+2250700000000",
            payment_method="mobile_money",
            items=[{"product_id": product.public_id, "quantity": 1}],
        )
        self.payment = Payment.objects.create(
            order=self.order,
            store=self.store,
            provider="fedapay",
            payment_reference="KOMI-TEST",
            transaction_id="777",
            amount=self.order.total_amount,
            currency="XOF",
            status=PaymentStatus.PROCESSING,
        )

    def _post_webhook(self, body, signature):
        return APIClient().post(WEBHOOK_URL, body, content_type="application/json", HTTP_X_FEDAPAY_SIGNATURE=signature)

    def test_webhook_with_bad_signature_is_rejected(self):
        raw, _ = _signed({"name": "transaction.approved", "entity": {"id": 777}})
        response = self._post_webhook(raw, "t=1,s=forged")
        self.assertEqual(response.status_code, 401)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.PROCESSING)

    @patch(f"{FEDAPAY}.verify_transaction")
    def test_approved_webhook_pays_order_and_credits_wallet_once(self, verify):
        verify.return_value = _verification(PaymentStatus.SUCCESSFUL, "15000")
        raw, signature = _signed({"name": "transaction.approved", "entity": {"id": 777}})

        for _ in range(2):  # providers retry webhooks
            self.assertEqual(self._post_webhook(raw, signature).status_code, 200)

        self.payment.refresh_from_db()
        self.order.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.SUCCESSFUL)
        self.assertEqual(self.order.payment_status, OrderPaymentStatus.PAID)
        self.assertEqual(self.order.status, OrderStatus.CONFIRMED)
        self.assertEqual(WalletTransaction.objects.filter(payment=self.payment).count(), 1)
        self.assertEqual(Wallet.objects.get(store=self.store).available_balance, Decimal("15000"))

    @patch(f"{FEDAPAY}.verify_transaction")
    def test_amount_mismatch_fails_payment(self, verify):
        verify.return_value = _verification(PaymentStatus.SUCCESSFUL, "100")
        raw, signature = _signed({"name": "transaction.approved", "entity": {"id": 777}})
        self._post_webhook(raw, signature)

        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentStatus.FAILED)
        self.assertFalse(WalletTransaction.objects.exists())

    def test_foreign_return_url_is_rejected(self):
        response = APIClient().post(
            f"/api/v1/payments/orders/{self.order.public_id}/initiate/",
            {"return_url": "https://evil.example/phish"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    @patch(f"{FEDAPAY}.create_transaction")
    def test_own_return_url_is_accepted(self, create_transaction):
        Payment.objects.all().delete()
        create_transaction.return_value = TransactionResult(
            transaction_id="888", checkout_url="https://checkout.fedapay.com/x", raw={}
        )
        response = APIClient().post(
            f"/api/v1/payments/orders/{self.order.public_id}/initiate/",
            {"return_url": "https://komi.test/s/boutique-awa/commande/x/retour"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(Decimal(response.data["amount"]), Decimal("15000"))


class PaymentMethodMappingTests(TestCase):
    def test_operator_modes_map_to_known_choices(self):
        self.assertEqual(_map_payment_method("mtn_open"), "mtn_momo")
        self.assertEqual(_map_payment_method("moov_tg"), "moov_momo")
        self.assertEqual(_map_payment_method("something_new"), "other")
        self.assertEqual(_map_payment_method(""), "")
