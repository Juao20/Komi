from decimal import Decimal

from django.db import transaction
from django.db.models import F

from apps.core.exceptions import ServiceError
from apps.customers.services import get_or_create_customer
from apps.orders.choices import ORDER_STATUS_TRANSITIONS, DiscountType, OrderStatus
from apps.orders.choices import PaymentStatus as OrderPaymentStatus
from apps.orders.models import Coupon, Order, OrderComment, OrderItem, OrderStatusHistory
from apps.products.models import Product, ProductVariant
from apps.stores.models import Store


def _resolve_coupon(store, code, subtotal):
    if not code:
        return None, Decimal("0")

    coupon = Coupon.objects.filter(store=store, code__iexact=code).first()
    if coupon is None or not coupon.is_valid:
        raise ServiceError("This coupon is invalid or has expired.", code="invalid_coupon")
    if subtotal < coupon.min_order_amount:
        raise ServiceError(f"This coupon requires a minimum order of {coupon.min_order_amount}.", code="coupon_min_amount")

    if coupon.discount_type == DiscountType.PERCENTAGE:
        discount = subtotal * (coupon.discount_value / Decimal("100"))
    else:
        discount = min(coupon.discount_value, subtotal)

    return coupon, discount


def _build_order_items(store, items_payload):
    order_items = []
    subtotal = Decimal("0")

    for item in items_payload:
        product = Product.objects.select_for_update().filter(store=store, public_id=item["product_id"]).first()
        if product is None:
            raise ServiceError("One of the products in this order no longer exists.", code="product_not_found")

        variant = None
        if item.get("variant_id"):
            variant = product.variants.select_for_update().filter(public_id=item["variant_id"]).first()
            if variant is None:
                raise ServiceError("One of the selected variants no longer exists.", code="variant_not_found")

        quantity = item["quantity"]
        available_stock = variant.stock if variant else product.total_stock
        if product.track_inventory and available_stock < quantity:
            raise ServiceError(f"Not enough stock for {product.name}.", code="insufficient_stock")

        unit_price = variant.effective_price if variant else product.price
        order_items.append(
            {
                "product": product,
                "variant": variant,
                "product_name": product.name,
                "variant_name": variant.name if variant else "",
                "unit_price": unit_price,
                "quantity": quantity,
            }
        )
        subtotal += unit_price * quantity

    return order_items, subtotal


def _decrement_stock(order_items):
    for item in order_items:
        if item["variant"]:
            ProductVariant.objects.filter(pk=item["variant"].pk).update(stock=F("stock") - item["quantity"])
        elif item["product"].track_inventory:
            Product.objects.filter(pk=item["product"].pk).update(stock=F("stock") - item["quantity"])


def _restock(order):
    for item in order.items.select_related("product", "variant").all():
        if item.variant is not None:
            ProductVariant.objects.filter(pk=item.variant_id).update(stock=F("stock") + item.quantity)
        elif item.product is not None and item.product.track_inventory:
            Product.objects.filter(pk=item.product_id).update(stock=F("stock") + item.quantity)


def _next_order_number(store):
    locked_store = Store.objects.select_for_update().get(pk=store.pk)
    locked_store.order_sequence += 1
    locked_store.save(update_fields=["order_sequence"])
    return f"KM-{locked_store.order_sequence:05d}"


@transaction.atomic
def create_order(
    *,
    store,
    customer_name,
    customer_phone,
    items,
    customer_email="",
    shipping_address="",
    shipping_city="",
    shipping_country="",
    payment_method="cash_on_delivery",
    customer_note="",
    coupon_code=None,
    shipping_amount=Decimal("0"),
):
    if not items:
        raise ServiceError("An order must contain at least one item.", code="empty_order")

    order_items_data, subtotal = _build_order_items(store, items)
    coupon, discount_amount = _resolve_coupon(store, coupon_code, subtotal)
    total_amount = subtotal - discount_amount + shipping_amount

    customer = get_or_create_customer(
        store=store, full_name=customer_name, phone_number=customer_phone, email=customer_email
    )

    order = Order.objects.create(
        store=store,
        customer=customer,
        coupon=coupon,
        order_number=_next_order_number(store),
        currency=store.currency,
        subtotal_amount=subtotal,
        discount_amount=discount_amount,
        shipping_amount=shipping_amount,
        total_amount=total_amount,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_email=customer_email,
        shipping_address=shipping_address,
        shipping_city=shipping_city,
        shipping_country=shipping_country,
        payment_method=payment_method,
        customer_note=customer_note,
    )

    OrderItem.objects.bulk_create(
        [OrderItem(order=order, **item_data) for item_data in order_items_data]
    )
    _decrement_stock(order_items_data)

    if coupon:
        Coupon.objects.filter(pk=coupon.pk).update(usage_count=coupon.usage_count + 1)

    OrderStatusHistory.objects.create(order=order, from_status="", to_status=OrderStatus.PENDING)

    from apps.notifications.services import notify_store

    notify_store(
        store=store,
        category="new_order",
        title="Nouvelle commande",
        message=f"Commande #{order.order_number} de {customer_name} — {total_amount} {store.currency}.",
    )

    from apps.emails.services import EmailService

    EmailService.send_new_order_email(store=store, order=order)
    EmailService.send_order_confirmation_email(order=order)

    return order


@transaction.atomic
def update_order_status(*, order, new_status, note="", actor=None):
    current_status = order.status
    allowed = ORDER_STATUS_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise ServiceError(
            f"An order cannot move from '{current_status}' to '{new_status}'.",
            code="invalid_status_transition",
        )

    if new_status == OrderStatus.CANCELLED:
        _restock(order)
        if order.payment_status == OrderPaymentStatus.PAID:
            from apps.wallets.services import reverse_wallet_for_cancelled_order

            reverse_wallet_for_cancelled_order(order=order)

    order.status = new_status
    if new_status == OrderStatus.CANCELLED and note:
        order.cancelled_reason = note
    order.save(update_fields=["status", "cancelled_reason", "updated_at"])

    OrderStatusHistory.objects.create(order=order, from_status=current_status, to_status=new_status, note=note)

    from apps.notifications.services import notify_store

    if new_status == OrderStatus.CONFIRMED:
        notify_store(store=order.store, category="order_confirmed", title="Commande confirmée",
                     message=f"La commande #{order.order_number} a été confirmée.")
    elif new_status == OrderStatus.CANCELLED:
        notify_store(store=order.store, category="order_cancelled", title="Commande annulée",
                     message=f"La commande #{order.order_number} a été annulée.")

    status_labels = {
        OrderStatus.PROCESSING: "En préparation",
        OrderStatus.SHIPPED: "Expédiée",
        OrderStatus.DELIVERED: "Livrée",
        OrderStatus.CANCELLED: "Annulée",
    }
    if new_status in status_labels:
        from apps.emails.services import EmailService

        EmailService.send_order_status_changed_email(order=order, status_label=status_labels[new_status])

    return order


def add_order_comment(*, order, author, message):
    return OrderComment.objects.create(order=order, author=author, message=message)


@transaction.atomic
def mark_order_paid(*, order):
    order.payment_status = OrderPaymentStatus.PAID
    order.save(update_fields=["payment_status", "updated_at"])

    if order.status == OrderStatus.PENDING:
        update_order_status(order=order, new_status=OrderStatus.CONFIRMED, note="Paiement confirmé.")

    return order


def mark_order_payment_failed(*, order):
    order.payment_status = OrderPaymentStatus.FAILED
    order.save(update_fields=["payment_status", "updated_at"])
    return order
