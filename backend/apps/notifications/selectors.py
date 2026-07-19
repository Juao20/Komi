from apps.notifications.models import Notification


def get_notifications_for_store(store):
    return Notification.objects.filter(store=store)


def get_unread_count(store):
    return Notification.objects.filter(store=store, is_read=False).count()
