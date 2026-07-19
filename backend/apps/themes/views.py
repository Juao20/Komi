from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveUpdateAPIView

from apps.stores.selectors import get_store_for_user
from apps.themes.serializers import StoreThemeSerializer


class MyStoreThemeView(RetrieveUpdateAPIView):
    serializer_class = StoreThemeSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        store = get_store_for_user(self.request.user)
        if store is None or not hasattr(store, "theme"):
            raise NotFound("You don't have a store yet.")
        return store.theme
