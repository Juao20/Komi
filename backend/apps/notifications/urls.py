from django.urls import path

from apps.notifications import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("<uuid:public_id>/read/", views.MarkNotificationReadView.as_view(), name="notification-read"),
    path("read-all/", views.MarkAllNotificationsReadView.as_view(), name="notification-read-all"),
]
