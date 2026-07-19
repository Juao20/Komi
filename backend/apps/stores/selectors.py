from apps.stores.choices import StoreStatus
from apps.stores.models import Store


def get_store_for_user(user):
    return Store.objects.filter(owner=user).select_related("theme").first()


def get_published_store_by_slug(slug):
    return Store.objects.select_related("theme").filter(slug=slug, status=StoreStatus.PUBLISHED).first()
