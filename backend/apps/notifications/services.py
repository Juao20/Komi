from apps.notifications.models import Notification


def notify_store(*, store, category, title, message, link=""):
    return Notification.objects.create(store=store, category=category, title=title, message=message, link=link)


def mark_as_read(*, notification):
    if not notification.is_read:
        notification.is_read = True
        notification.save(update_fields=["is_read"])
    return notification


def mark_all_as_read(*, store):
    Notification.objects.filter(store=store, is_read=False).update(is_read=True)
