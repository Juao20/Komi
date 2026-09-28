"""Shared fixtures for the test suite."""

from decimal import Decimal

from apps.accounts.models import User
from apps.products.models import Product
from apps.stores.choices import StoreStatus
from apps.stores.models import Store


def make_user(email="merchant@komi.test", password="S3cure-pass!", **extra):
    return User.objects.create_user(email=email, password=password, full_name="Awa Koné", **extra)


def make_store(owner=None, slug="boutique-awa", **extra):
    owner = owner or make_user()
    defaults = {"name": "Boutique Awa", "country": "CI", "currency": "XOF", "status": StoreStatus.PUBLISHED}
    return Store.objects.create(owner=owner, slug=slug, **{**defaults, **extra})


def make_product(store, name="Pagne wax", price="10000", stock=10, **extra):
    return Product.objects.create(
        store=store, name=name, slug=name.lower().replace(" ", "-"), price=Decimal(price), stock=stock, **extra
    )
