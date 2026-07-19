import uuid

from django.db import transaction

from apps.core.cloudinary_client import delete_images
from apps.core.exceptions import ServiceError
from apps.core.utils import generate_unique_slug
from apps.products.choices import ProductStatus
from apps.products.models import Category, Product, ProductImage, ProductReport, ProductVariant
from apps.stores.choices import PLAN_PRODUCT_LIMITS


def _assert_within_plan_limit(store):
    limit = PLAN_PRODUCT_LIMITS.get(store.plan)
    if limit is None:
        return
    current_count = Product.objects.filter(store=store).count()
    if current_count >= limit:
        raise ServiceError(
            f"Your plan is limited to {limit} products. Upgrade to add more.",
            code="plan_limit_reached",
            status_code=402,
        )


def _cleanup_unused_image_urls(urls, exclude_product_id=None):
    urls = [url for url in urls if url]
    if not urls:
        return
    query = ProductImage.objects.filter(image_url__in=urls)
    if exclude_product_id:
        query = query.exclude(product_id=exclude_product_id)
    still_used = set(query.values_list("image_url", flat=True))
    to_delete = [url for url in urls if url not in still_used]
    if to_delete:
        delete_images(to_delete)


@transaction.atomic
def create_product(*, store, images=None, variants=None, **fields):
    _assert_within_plan_limit(store)

    slug = generate_unique_slug(Product, fields.pop("slug", None) or fields["name"], extra_filters={"store": store})
    product = Product.objects.create(store=store, slug=slug, **fields)

    _sync_images(product, images or [])
    _sync_variants(product, variants or [])

    from apps.notifications.services import notify_store

    notify_store(
        store=store,
        category="product_added",
        title="Produit ajouté",
        message=f"« {product.name} » a été ajouté à votre boutique.",
    )

    return product


@transaction.atomic
def update_product(*, product, images=None, variants=None, **fields):
    for field, value in fields.items():
        setattr(product, field, value)
    product.save()

    if images is not None:
        _sync_images(product, images)
    if variants is not None:
        _sync_variants(product, variants)

    return product


def _sync_images(product, images):
    old_urls = list(product.images.values_list("image_url", flat=True))
    product.images.all().delete()
    for position, image_data in enumerate(images):
        ProductImage.objects.create(product=product, position=position, **image_data)
    if images and not any(image.get("is_primary") for image in images):
        first_image = product.images.first()
        if first_image:
            first_image.is_primary = True
            first_image.save(update_fields=["is_primary"])

    new_urls = {image["image_url"] for image in images}
    removed_urls = [url for url in old_urls if url not in new_urls]
    _cleanup_unused_image_urls(removed_urls)


def _sync_variants(product, variants):
    product.variants.all().delete()
    for position, variant_data in enumerate(variants):
        ProductVariant.objects.create(product=product, position=position, **variant_data)


def delete_product(*, product):
    from apps.notifications.services import notify_store

    image_urls = list(product.images.values_list("image_url", flat=True))

    notify_store(
        store=product.store,
        category="product_deleted",
        title="Produit supprimé",
        message=f"« {product.name} » a été supprimé de votre boutique.",
    )
    product.delete()
    _cleanup_unused_image_urls(image_urls, exclude_product_id=product.id)


def duplicate_product(*, product):
    new_product = Product.objects.get(pk=product.pk)
    new_product.pk = None
    new_product.public_id = uuid.uuid4()
    new_product.name = f"{product.name} (copie)"
    new_product.slug = generate_unique_slug(Product, new_product.name, extra_filters={"store": product.store})
    new_product.status = ProductStatus.DRAFT
    new_product.save()

    for image in product.images.all():
        ProductImage.objects.create(
            product=new_product,
            image_url=image.image_url,
            alt_text=image.alt_text,
            is_primary=image.is_primary,
            position=image.position,
        )
    for variant in product.variants.all():
        ProductVariant.objects.create(
            product=new_product,
            name=variant.name,
            sku=variant.sku,
            price=variant.price,
            stock=variant.stock,
            position=variant.position,
        )
    return new_product


def archive_product(*, product):
    product.status = ProductStatus.ARCHIVED
    product.save(update_fields=["status"])
    return product


def adjust_stock(*, product, delta):
    """Adjusts stock for a simple (non-variant) product. Used by the order pipeline."""
    product.stock = max(0, product.stock + delta)
    product.save(update_fields=["stock"])


def create_category(*, store, name, description="", image_url=""):
    slug = generate_unique_slug(Category, name, extra_filters={"store": store})
    return Category.objects.create(store=store, name=name, slug=slug, description=description, image_url=image_url)


def report_product(*, product, reason, message="", reporter_email=""):
    return ProductReport.objects.create(
        product=product, reason=reason, message=message, reporter_email=reporter_email
    )
