from django.contrib import admin

from apps.products.models import Category, Product, ProductImage, ProductReport, ProductVariant


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "store", "price", "stock", "status", "created_at")
    list_filter = ("status", "track_inventory")
    search_fields = ("name", "sku", "store__name")
    readonly_fields = ("public_id", "created_at", "updated_at")
    inlines = [ProductImageInline, ProductVariantInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "store", "position")
    search_fields = ("name", "store__name")


@admin.register(ProductReport)
class ProductReportAdmin(admin.ModelAdmin):
    list_display = ("product", "reason", "status", "reporter_email", "created_at")
    list_filter = ("reason", "status")
    search_fields = ("product__name", "reporter_email")
    readonly_fields = ("public_id", "product", "reason", "message", "reporter_email", "created_at", "updated_at")
