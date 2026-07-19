from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from apps.core.models import BaseModel
from apps.orders.choices import DiscountType, OrderStatus, PaymentMethod, PaymentStatus


class Coupon(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="coupons")
    code = models.CharField(max_length=32)
    discount_type = models.CharField(max_length=16, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "orders_coupon"
        constraints = [models.UniqueConstraint(fields=["store", "code"], name="unique_coupon_code_per_store")]

    def __str__(self):
        return self.code

    @property
    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False
        return True


class Order(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="orders")
    customer = models.ForeignKey("customers.Customer", on_delete=models.PROTECT, related_name="orders")
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")

    order_number = models.CharField(max_length=32, db_index=True)
    status = models.CharField(max_length=16, choices=OrderStatus.choices, default=OrderStatus.PENDING)

    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH_ON_DELIVERY)
    payment_status = models.CharField(max_length=16, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)

    currency = models.CharField(max_length=3)
    subtotal_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=32)
    customer_email = models.EmailField(blank=True)
    shipping_address = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=120, blank=True)
    shipping_country = models.CharField(max_length=8, blank=True)

    customer_note = models.TextField(blank=True)
    cancelled_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "orders_order"
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["store", "order_number"], name="unique_order_number_per_store")]
        indexes = [models.Index(fields=["store", "status"]), models.Index(fields=["store", "created_at"])]

    def __str__(self):
        return f"#{self.order_number}"


class OrderItem(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.SET_NULL, null=True, related_name="order_items")
    variant = models.ForeignKey(
        "products.ProductVariant", on_delete=models.SET_NULL, null=True, blank=True, related_name="order_items"
    )

    product_name = models.CharField(max_length=200)
    variant_name = models.CharField(max_length=120, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = "orders_item"

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=16, choices=OrderStatus.choices, blank=True)
    to_status = models.CharField(max_length=16, choices=OrderStatus.choices)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders_status_history"
        ordering = ["-created_at"]
        verbose_name_plural = "order status histories"


class OrderComment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "orders_comment"
        ordering = ["-created_at"]
