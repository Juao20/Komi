from datetime import timedelta
from decimal import Decimal
from io import StringIO
from unittest.mock import patch

from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle

from apps.core.exceptions import ServiceError
from apps.core.testing import make_product, make_store
from apps.notifications.models import Notification
from apps.orders.choices import DiscountType, OrderStatus
from apps.orders.models import Coupon, Order
from apps.orders.services import create_order, mark_order_paid, update_order_status


def _order(store, product, quantity=1, **extra):
    return create_order(
        store=store,
        customer_name="Kofi Mensah",
        customer_phone="+2250700000000",
        items=[{"product_id": product.public_id, "quantity": quantity}],
        **extra,
    )


class PublicCheckoutTests(TestCase):
    def setUp(self):
        cache.clear()
        self.store = make_store()
        self.product = make_product(self.store, price="50000", stock=5)
        self.url = f"/api/v1/public/stores/{self.store.slug}/orders/"

    def test_client_cannot_lower_total_with_shipping_amount(self):
        response = APIClient().post(
            self.url,
            {
                "customer_name": "Kofi",
                "customer_phone": "+2250700000000",
                "shipping_amount": "-49000",
                "items": [{"product_id": str(self.product.public_id), "quantity": 1}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.data)
        order = Order.objects.get()
        self.assertEqual(order.shipping_amount, Decimal("0"))
        self.assertEqual(order.total_amount, Decimal("50000"))

    def test_checkout_is_rate_limited(self):
        payload = {
            "customer_name": "Kofi",
            "customer_phone": "+2250700000000",
            "items": [{"product_id": str(self.product.public_id), "quantity": 1}],
        }
        rates = {**ScopedRateThrottle.THROTTLE_RATES, "checkout": "2/hour"}
        with patch.object(ScopedRateThrottle, "THROTTLE_RATES", rates):
            codes = [APIClient().post(self.url, payload, format="json").status_code for _ in range(3)]
        self.assertEqual(codes[-1], 429)

    def test_empty_order_rejected(self):
        response = APIClient().post(
            self.url, {"customer_name": "Kofi", "customer_phone": "1", "items": []}, format="json"
        )
        self.assertEqual(response.status_code, 400)


class CreateOrderServiceTests(TestCase):
    def setUp(self):
        self.store = make_store()
        self.product = make_product(self.store, price="10000", stock=3)

    def test_stock_is_decremented(self):
        _order(self.store, self.product, quantity=2)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 1)

    def test_insufficient_stock_rejected(self):
        with self.assertRaises(ServiceError):
            _order(self.store, self.product, quantity=4)

    def test_percentage_coupon_is_capped_at_100_percent(self):
        Coupon.objects.create(
            store=self.store, code="ALL", discount_type=DiscountType.PERCENTAGE, discount_value=Decimal("150")
        )
        order = _order(self.store, self.product, coupon_code="ALL")
        self.assertEqual(order.discount_amount, Decimal("10000"))
        self.assertEqual(order.total_amount, Decimal("0"))

    def test_coupon_usage_limit_is_enforced(self):
        coupon = Coupon.objects.create(
            store=self.store, code="ONCE", discount_type=DiscountType.FIXED, discount_value=Decimal("1000"), usage_limit=1
        )
        _order(self.store, self.product, coupon_code="ONCE")
        coupon.refresh_from_db()
        self.assertEqual(coupon.usage_count, 1)
        with self.assertRaises(ServiceError):
            _order(self.store, self.product, coupon_code="ONCE")

    def test_cancelling_restocks(self):
        order = _order(self.store, self.product, quantity=2)
        update_order_status(order=order, new_status=OrderStatus.CANCELLED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

    def test_payment_after_cancellation_warns_merchant(self):
        order = _order(self.store, self.product)
        update_order_status(order=order, new_status=OrderStatus.CANCELLED)
        mark_order_paid(order=order)
        order.refresh_from_db()
        self.assertEqual(order.status, OrderStatus.CANCELLED)
        self.assertTrue(Notification.objects.filter(store=self.store, title__icontains="annulée", category="system").exists())


class ReleaseUnpaidOrdersCommandTests(TestCase):
    def test_releases_only_stale_unpaid_online_orders(self):
        store = make_store()
        product = make_product(store, stock=5)
        stale_online = _order(store, product, payment_method="mobile_money")
        fresh_online = _order(store, product, payment_method="mobile_money")
        stale_cod = _order(store, product, payment_method="cash_on_delivery")
        Order.objects.filter(pk__in=[stale_online.pk, stale_cod.pk]).update(
            created_at=timezone.now() - timedelta(hours=48)
        )

        call_command("release_unpaid_orders", "--hours", "24", stdout=StringIO())

        statuses = dict(Order.objects.values_list("pk", "status"))
        self.assertEqual(statuses[stale_online.pk], OrderStatus.CANCELLED)
        self.assertEqual(statuses[fresh_online.pk], OrderStatus.PENDING)
        self.assertEqual(statuses[stale_cod.pk], OrderStatus.PENDING)
        product.refresh_from_db()
        self.assertEqual(product.stock, 3)
