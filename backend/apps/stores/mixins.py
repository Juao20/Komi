from rest_framework.exceptions import NotFound

from apps.stores.selectors import get_store_for_user


def get_store_or_404(user):
    store = get_store_for_user(user)
    if store is None:
        raise NotFound("You don't have a store yet.")
    return store


class StoreScopedMixin:
    """Resolves the requesting user's store once per request and exposes it as `self.store`."""

    @property
    def store(self):
        if not hasattr(self, "_store"):
            self._store = get_store_or_404(self.request.user)
        return self._store
