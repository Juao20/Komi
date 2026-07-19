from decimal import Decimal

from rest_framework import serializers

from apps.products.choices import ProductReportReason
from apps.products.models import Category, Product, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("public_id", "name", "slug", "description", "image_url", "position", "product_count")
        read_only_fields = ("public_id", "slug")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("public_id", "image_url", "alt_text", "is_primary", "position")
        read_only_fields = ("public_id",)


class ProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = ("public_id", "name", "sku", "price", "effective_price", "stock", "position")
        read_only_fields = ("public_id",)


class ProductListSerializer(serializers.ModelSerializer):
    primary_image_url = serializers.ReadOnlyField()
    total_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Product
        fields = (
            "public_id",
            "name",
            "slug",
            "price",
            "compare_at_price",
            "status",
            "total_stock",
            "is_low_stock",
            "is_out_of_stock",
            "primary_image_url",
            "category_name",
            "created_at",
        )


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("public_id", "name")


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(read_only=True)
    total_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    has_variants = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "public_id",
            "name",
            "slug",
            "description",
            "category",
            "price",
            "compare_at_price",
            "sku",
            "stock",
            "track_inventory",
            "low_stock_threshold",
            "weight_kg",
            "status",
            "seo_title",
            "seo_description",
            "total_stock",
            "is_low_stock",
            "is_out_of_stock",
            "is_on_sale",
            "has_variants",
            "images",
            "variants",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("public_id", "slug", "created_at", "updated_at")


class PublicProductVariantSerializer(serializers.ModelSerializer):
    effective_price = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = ("public_id", "name", "effective_price", "stock")


class PublicProductListSerializer(serializers.ModelSerializer):
    primary_image_url = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Product
        fields = (
            "public_id",
            "name",
            "slug",
            "price",
            "compare_at_price",
            "is_on_sale",
            "is_out_of_stock",
            "is_low_stock",
            "primary_image_url",
            "category_name",
        )


class PublicProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = PublicProductVariantSerializer(many=True, read_only=True)
    category = ProductCategorySerializer(read_only=True)
    total_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    has_variants = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = (
            "public_id",
            "name",
            "slug",
            "description",
            "category",
            "price",
            "compare_at_price",
            "total_stock",
            "is_out_of_stock",
            "is_low_stock",
            "is_on_sale",
            "has_variants",
            "images",
            "variants",
            "seo_title",
            "seo_description",
        )


class ProductImageInputSerializer(serializers.Serializer):
    image_url = serializers.URLField()
    alt_text = serializers.CharField(required=False, allow_blank=True)
    is_primary = serializers.BooleanField(required=False, default=False)


class ProductVariantInputSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    sku = serializers.CharField(required=False, allow_blank=True)
    price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)


class ProductWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    slug = serializers.SlugField(required=False, max_length=220)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.SlugRelatedField(
        slug_field="public_id", queryset=Category.objects.none(), required=False, allow_null=True
    )
    price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0"))
    compare_at_price = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("0"), required=False, allow_null=True
    )
    sku = serializers.CharField(required=False, allow_blank=True)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
    track_inventory = serializers.BooleanField(required=False, default=True)
    low_stock_threshold = serializers.IntegerField(min_value=0, required=False, default=5)
    weight_kg = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, allow_null=True)
    status = serializers.ChoiceField(choices=["draft", "active", "archived"], required=False, default="active")
    seo_title = serializers.CharField(required=False, allow_blank=True)
    seo_description = serializers.CharField(required=False, allow_blank=True)
    images = ProductImageInputSerializer(many=True, required=False)
    variants = ProductVariantInputSerializer(many=True, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        store = self.context.get("store")
        if store is not None:
            self.fields["category"].queryset = Category.objects.filter(store=store)


class ProductReportSerializer(serializers.Serializer):
    reason = serializers.ChoiceField(choices=ProductReportReason.choices)
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)
    reporter_email = serializers.EmailField(required=False, allow_blank=True)
