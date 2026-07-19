from rest_framework.exceptions import NotFound
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications import selectors, services
from apps.notifications.serializers import NotificationSerializer
from apps.stores.mixins import StoreScopedMixin


class NotificationListView(StoreScopedMixin, ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return selectors.get_notifications_for_store(self.store)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        response.data["unread_count"] = selectors.get_unread_count(self.store)
        return response


class MarkNotificationReadView(StoreScopedMixin, APIView):
    def post(self, request, public_id):
        notification = selectors.get_notifications_for_store(self.store).filter(public_id=public_id).first()
        if notification is None:
            raise NotFound("Notification not found.")
        notification = services.mark_as_read(notification=notification)
        return Response(NotificationSerializer(notification).data)


class MarkAllNotificationsReadView(StoreScopedMixin, APIView):
    def post(self, request):
        services.mark_all_as_read(store=self.store)
        return Response({"detail": "All notifications marked as read."})
