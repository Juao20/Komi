from django.core.validators import MinValueValidator
from django.db import models

from apps.core.models import BaseModel, SoftDeleteModel
from apps.products.choices import ProductReportReason, ProductReportStatus, ProductStatus


class Category(BaseModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)
    description = models.CharField(max_length=255, blank=True)
    image_url = models.URLField(blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "products_category"
        ordering = ["position", "name"]
        constraints = [
            models.UniqueConstraint(fields=["store", "slug"], name="unique_category_slug_per_store"),
        ]

    def __str__(self):
        return self.name


class Product(BaseModel, SoftDeleteModel):
    store = models.ForeignKey("stores.Store", on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, related_name="products", null=True, blank=True
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220)
    description = models.TextField(blank=True)

    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    compare_at_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)]
    )

    sku = models.CharField(max_length=64, blank=True)
    stock = models.PositiveIntegerField(default=0)
    track_inventory = models.BooleanField(default=True)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    weight_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=16, choices=ProductStatus.choices, default=ProductStatus.ACTIVE)

    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "products_product"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["store", "slug"], name="unique_product_slug_per_store"),
        ]
        indexes = [
            models.Index(fields=["store", "status"]),
        ]

    def __str__(self):
        return self.name

    @property
    def has_variants(self):
        return self.variants.exists()

    @property
    def total_stock(self):
        if self.has_variants:
            return self.variants.aggregate(total=models.Sum("stock"))["total"] or 0
        return self.stock

    @property
    def is_low_stock(self):
        return self.track_inventory and 0 < self.total_stock <= self.low_stock_threshold

    @property
    def is_out_of_stock(self):
        return self.track_inventory and self.total_stock <= 0

    @property
    def is_on_sale(self):
        return bool(self.compare_at_price and self.compare_at_price > self.price)

    @property
    def primary_image_url(self):
        image = self.images.filter(is_primary=True).first() or self.images.first()
        return image.image_url if image else ""


class ProductVariant(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    name = models.CharField(max_length=120, help_text="e.g. Rouge / M")
    sku = models.CharField(max_length=64, blank=True)
    price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)]
    )
    stock = models.PositiveIntegerField(default=0)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "products_variant"
        ordering = ["position", "id"]

    def __str__(self):
        return f"{self.product.name} — {self.name}"

    @property
    def effective_price(self):
        return self.price if self.price is not None else self.product.price


class ProductImage(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField()
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "products_image"
        ordering = ["position", "id"]

    def __str__(self):
        return f"Image for {self.product.name}"


class ProductReport(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reports")
    reason = models.CharField(max_length=20, choices=ProductReportReason.choices)
    message = models.CharField(max_length=500, blank=True)
    reporter_email = models.EmailField(blank=True)
    status = models.CharField(max_length=16, choices=ProductReportStatus.choices, default=ProductReportStatus.PENDING)

    class Meta:
        db_table = "products_report"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self):
        return f"{self.product.name} — {self.reason}"
