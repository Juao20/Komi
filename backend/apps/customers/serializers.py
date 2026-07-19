from rest_framework import serializers

from apps.customers.models import Address, Customer


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ("public_id", "label", "full_address", "city", "country", "is_default")
        read_only_fields = ("public_id",)


class CustomerListSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True, default=0)

    class Meta:
        model = Customer
        fields = ("public_id", "full_name", "phone_number", "email", "order_count", "total_spent", "created_at")


class CustomerDetailSerializer(serializers.ModelSerializer):
    order_count = serializers.IntegerField(read_only=True)
    total_spent = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True, default=0)
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = Customer
        fields = (
            "public_id",
            "full_name",
            "phone_number",
            "email",
            "notes",
            "order_count",
            "total_spent",
            "addresses",
            "created_at",
        )


class UpdateCustomerSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
