from decimal import Decimal

from django.test import TestCase

from apps.core.exceptions import ServiceError
from apps.core.testing import make_store
from apps.wallets.choices import WalletTransactionType, WithdrawalStatus
from apps.wallets.services import (
    approve_withdrawal,
    credit_wallet,
    get_or_create_wallet,
    reject_withdrawal,
    request_withdrawal,
)


class WithdrawalTests(TestCase):
    def setUp(self):
        self.store = make_store()
        credit_wallet(store=self.store, amount=Decimal("20000"), transaction_type=WalletTransactionType.PAYMENT_RECEIVED)

    def _request(self, amount):
        return request_withdrawal(
            store=self.store,
            amount=Decimal(amount),
            method="mtn_momo",
            mobile_number="+2250700000000",
            account_holder_name="Awa Koné",
        )

    def test_cannot_withdraw_more_than_available(self):
        with self.assertRaises(ServiceError):
            self._request("20001")

    def test_rejected_withdrawal_restores_balance(self):
        withdrawal = self._request("5000")
        wallet = get_or_create_wallet(self.store)
        self.assertEqual((wallet.available_balance, wallet.pending_balance), (Decimal("15000"), Decimal("5000")))

        reject_withdrawal(withdrawal=withdrawal, reason="Numéro invalide")
        wallet.refresh_from_db()
        self.assertEqual((wallet.available_balance, wallet.pending_balance), (Decimal("20000"), Decimal("0")))

    def test_approved_withdrawal_cannot_be_processed_twice(self):
        withdrawal = self._request("5000")
        approve_withdrawal(withdrawal=withdrawal)
        withdrawal.refresh_from_db()
        self.assertEqual(withdrawal.status, WithdrawalStatus.APPROVED)
        with self.assertRaises(ServiceError):
            reject_withdrawal(withdrawal=withdrawal)

        wallet = get_or_create_wallet(self.store)
        self.assertEqual(wallet.total_withdrawn, Decimal("5000"))
        self.assertEqual(wallet.pending_balance, Decimal("0"))
