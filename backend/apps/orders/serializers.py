from rest_framework import serializers

from apps.orders.models import Order, OrderComment, OrderItem, OrderStatusHistory


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.ReadOnlyField()
    product_id = serializers.CharField(source="product.public_id", read_only=True, default=None)

    class Meta:
        model = OrderItem
        fields = ("public_id", "product_id", "product_name", "variant_name", "unit_price", "quantity", "line_total")


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ("from_status", "to_status", "note", "created_at")


class OrderCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.full_name", read_only=True, default=None)

    class Meta:
        model = OrderComment
        fields = ("id", "author_name", "message", "created_at")


class OrderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = (
            "public_id",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "customer_name",
            "customer_phone",
            "total_amount",
            "currency",
            "created_at",
        )


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    comments = OrderCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "public_id",
            "order_number",
            "status",
            "payment_method",
            "payment_status",
            "currency",
            "subtotal_amount",
            "discount_amount",
            "shipping_amount",
            "total_amount",
            "customer_name",
            "customer_phone",
            "customer_email",
            "shipping_address",
            "shipping_city",
            "shipping_country",
            "customer_note",
            "cancelled_reason",
            "items",
            "status_history",
            "comments",
            "created_at",
            "updated_at",
        )


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    variant_id = serializers.UUIDField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=32)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    shipping_city = serializers.CharField(required=False, allow_blank=True)
    shipping_country = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=["mobile_money", "card", "cash_on_delivery", "other"], required=False, default="cash_on_delivery"
    )
    customer_note = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shipping_amount = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, default=0)
    items = OrderItemInputSerializer(many=True)


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["confirmed", "processing", "shipped", "delivered", "cancelled"])
    note = serializers.CharField(required=False, allow_blank=True)


class AddOrderCommentSerializer(serializers.Serializer):
    message = serializers.CharField()
