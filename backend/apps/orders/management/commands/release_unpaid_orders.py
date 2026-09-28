from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.orders.choices import OrderStatus, PaymentMethod, PaymentStatus
from apps.orders.models import Order
from apps.orders.services import update_order_status

ONLINE_METHODS = (PaymentMethod.MOBILE_MONEY, PaymentMethod.CARD)


class Command(BaseCommand):
    help = (
        "Cancels online-payment orders left unpaid for too long, which puts their "
        "stock back on sale. Meant to be run periodically (cron)."
    )

    def add_arguments(self, parser):
        parser.add_argument("--hours", type=int, default=24, help="Age after which an unpaid order is released.")
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, hours, dry_run, **options):
        cutoff = timezone.now() - timedelta(hours=hours)
        orders = Order.objects.filter(
            status=OrderStatus.PENDING,
            payment_method__in=ONLINE_METHODS,
            created_at__lt=cutoff,
        ).exclude(payment_status=PaymentStatus.PAID)

        released = 0
        for order in orders.iterator():
            if not dry_run:
                update_order_status(order=order, new_status=OrderStatus.CANCELLED, note="Paiement non reçu à temps.")
            released += 1

        prefix = "[dry-run] " if dry_run else ""
        self.stdout.write(self.style.SUCCESS(f"{prefix}{released} unpaid order(s) released."))
