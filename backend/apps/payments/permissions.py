from rest_framework.permissions import BasePermission


class IsOrderOwnerStore(BasePermission):
    """Restricts merchant-facing payment views to the order's own store owner."""

    def has_object_permission(self, request, view, obj):
        return obj.store.owner_id == request.user.id
