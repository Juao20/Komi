from django.db.models import Count, Q

from apps.products.choices import ProductStatus
from apps.products.models import Category, Product


def get_products_for_store(store):
    return (
        Product.objects.filter(store=store)
        .select_related("category")
        .prefetch_related("images", "variants")
    )


def get_product_by_public_id(store, public_id):
    return get_products_for_store(store).filter(public_id=public_id).first()


def get_categories_for_store(store):
    return Category.objects.filter(store=store).annotate(product_count=Count("products"))


def get_active_products_for_store(store):
    return get_products_for_store(store).filter(status=ProductStatus.ACTIVE)


def get_active_product_by_slug(store, slug):
    return get_active_products_for_store(store).filter(slug=slug).first()


def get_categories_with_active_products(store):
    return (
        Category.objects.filter(store=store, products__status=ProductStatus.ACTIVE)
        .annotate(product_count=Count("products", filter=Q(products__status=ProductStatus.ACTIVE)))
        .distinct()
    )


def get_low_stock_products(store, limit=10):
    return [
        product
        for product in get_products_for_store(store).filter(track_inventory=True)
        if product.is_low_stock or product.is_out_of_stock
    ][:limit]
