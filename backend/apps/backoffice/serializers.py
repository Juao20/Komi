from rest_framework import serializers

from apps.accounts.models import User
from apps.backoffice.models import SystemLog
from apps.emails.models import EmailLog
from apps.orders.models import Order
from apps.payments.models import Payment
from apps.products.models import Product, ProductReport
from apps.stores.models import Store


class AdminStoreSerializer(serializers.ModelSerializer):
    owner_email = serializers.CharField(source="owner.email", read_only=True)
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)
    orders_count = serializers.IntegerField(read_only=True)
    products_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Store
        fields = (
            "public_id",
            "name",
            "slug",
            "sector",
            "country",
            "currency",
            "status",
            "plan",
            "owner_email",
            "owner_name",
            "orders_count",
            "products_count",
            "published_at",
            "created_at",
        )


class AdminUserSerializer(serializers.ModelSerializer):
    has_store = serializers.SerializerMethodField()
    store_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "public_id",
            "email",
            "full_name",
            "phone_number",
            "is_active",
            "is_staff",
            "is_email_verified",
            "has_store",
            "store_name",
            "last_login",
            "created_at",
        )

    def get_has_store(self, obj):
        return hasattr(obj, "store")

    def get_store_name(self, obj):
        return obj.store.name if hasattr(obj, "store") else None


class AdminOrderSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Order
        fields = (
            "public_id",
            "order_number",
            "store_name",
            "status",
            "payment_method",
            "payment_status",
            "currency",
            "total_amount",
            "customer_name",
            "created_at",
        )


class AdminPaymentSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)
    order_number = serializers.CharField(source="order.order_number", read_only=True, default=None)

    class Meta:
        model = Payment
        fields = (
            "public_id",
            "payment_reference",
            "store_name",
            "order_number",
            "provider",
            "payment_method",
            "amount",
            "currency",
            "status",
            "paid_at",
            "created_at",
        )


class AdminProductSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Product
        fields = ("public_id", "name", "store_name", "price", "stock", "status", "is_deleted", "created_at")


class AdminProductReportSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    store_name = serializers.CharField(source="product.store.name", read_only=True)

    class Meta:
        model = ProductReport
        fields = (
            "public_id",
            "product_name",
            "store_name",
            "reason",
            "message",
            "reporter_email",
            "status",
            "created_at",
        )


class SystemLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemLog
        fields = ("id", "level", "logger_name", "message", "created_at")


class AdminEmailLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailLog
        fields = (
            "public_id",
            "recipient",
            "subject",
            "template_name",
            "status",
            "provider",
            "error_message",
            "created_at",
        )
