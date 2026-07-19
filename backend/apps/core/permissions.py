from rest_framework.permissions import BasePermission


class IsStoreOwner(BasePermission):
    """Grants access only to objects belonging to the requesting user's store.

    Works both for objects that ARE a store (checks `.owner`) and objects
    that HAVE a store (checks `.store.owner`).
    """

    message = "You do not have permission to access this store's resources."

    def has_object_permission(self, request, view, obj):
        store = obj if obj.__class__.__name__ == "Store" else getattr(obj, "store", None)
        if store is None:
            return False
        return store.owner_id == request.user.id
