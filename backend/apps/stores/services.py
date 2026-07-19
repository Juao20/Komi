from apps.core.cloudinary_client import delete_image
from apps.core.exceptions import ServiceError
from apps.core.utils import generate_unique_slug
from apps.stores.models import Store
from apps.themes.models import StoreTheme


def create_store(*, owner, name, sector, country, currency, phone_number="", description="", primary_color="#6C5CE7", slug=None):
    if Store.objects.filter(owner=owner).exists():
        raise ServiceError("You already have a store.", code="store_exists", status_code=409)

    slug = generate_unique_slug(Store, slug or name)

    store = Store.objects.create(
        owner=owner,
        name=name,
        slug=slug,
        sector=sector,
        country=country,
        currency=currency,
        phone_number=phone_number,
        description=description,
        primary_color=primary_color,
    )
    StoreTheme.objects.create(store=store)

    from apps.emails.services import EmailService

    EmailService.send_store_created_email(user=owner, store=store)

    return store


def update_store(*, store, **fields):
    stale_image_urls = []
    for field in ("logo_url", "banner_url"):
        if field in fields and fields[field] != getattr(store, field) and getattr(store, field):
            stale_image_urls.append(getattr(store, field))

    for field, value in fields.items():
        setattr(store, field, value)
    store.save(update_fields=list(fields.keys()) + ["updated_at"])

    for url in stale_image_urls:
        delete_image(url)

    return store


def publish_store(*, store):
    store.publish()
    return store
