from rest_framework import serializers

from apps.stores.choices import PLAN_PRODUCT_LIMITS, StorePlan
from apps.stores.models import Store
from apps.themes.serializers import StoreThemeSerializer


class StoreSerializer(serializers.ModelSerializer):
    theme = StoreThemeSerializer(read_only=True)
    public_url = serializers.ReadOnlyField()
    is_published = serializers.ReadOnlyField()
    product_limit = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = (
            "public_id",
            "name",
            "slug",
            "description",
            "sector",
            "country",
            "currency",
            "phone_number",
            "email",
            "address",
            "city",
            "logo_url",
            "banner_url",
            "primary_color",
            "social_facebook",
            "social_instagram",
            "social_tiktok",
            "social_whatsapp",
            "status",
            "plan",
            "public_url",
            "is_published",
            "product_limit",
            "theme",
            "created_at",
        )
        read_only_fields = ("public_id", "slug", "status", "plan", "created_at")

    def get_product_limit(self, obj):
        return PLAN_PRODUCT_LIMITS.get(obj.plan, PLAN_PRODUCT_LIMITS[StorePlan.FREE])


class CreateStoreSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    sector = serializers.CharField(max_length=32)
    country = serializers.CharField(max_length=8)
    currency = serializers.CharField(max_length=3)
    phone_number = serializers.CharField(max_length=32, required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    primary_color = serializers.CharField(max_length=7, required=False)
    slug = serializers.SlugField(required=False, max_length=63)


class PublicStoreSerializer(serializers.ModelSerializer):
    theme = StoreThemeSerializer(read_only=True)

    class Meta:
        model = Store
        fields = (
            "name",
            "slug",
            "description",
            "logo_url",
            "banner_url",
            "primary_color",
            "currency",
            "phone_number",
            "email",
            "address",
            "city",
            "social_facebook",
            "social_instagram",
            "social_tiktok",
            "social_whatsapp",
            "theme",
        )
