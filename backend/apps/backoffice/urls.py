from django.urls import path

from apps.backoffice import views

urlpatterns = [
    path("dashboard/", views.DashboardView.as_view(), name="backoffice-dashboard"),
    path("analytics/", views.AnalyticsView.as_view(), name="backoffice-analytics"),
    path("stores/", views.StoreListView.as_view(), name="backoffice-stores"),
    path("stores/<uuid:public_id>/suspend/", views.StoreSuspendView.as_view(), name="backoffice-store-suspend"),
    path("stores/<uuid:public_id>/activate/", views.StoreActivateView.as_view(), name="backoffice-store-activate"),
    path("users/", views.UserListView.as_view(), name="backoffice-users"),
    path("users/<uuid:public_id>/suspend/", views.UserSuspendView.as_view(), name="backoffice-user-suspend"),
    path("users/<uuid:public_id>/activate/", views.UserActivateView.as_view(), name="backoffice-user-activate"),
    path("orders/", views.OrderListView.as_view(), name="backoffice-orders"),
    path("payments/", views.PaymentListView.as_view(), name="backoffice-payments"),
    path("products/", views.ProductListView.as_view(), name="backoffice-products"),
    path("subscriptions/", views.SubscriptionsView.as_view(), name="backoffice-subscriptions"),
    path("comy/", views.ComyUsageView.as_view(), name="backoffice-comy"),
    path("reports/", views.ReportListView.as_view(), name="backoffice-reports"),
    path("reports/<uuid:public_id>/resolve/", views.ReportResolveView.as_view(), name="backoffice-report-resolve"),
    path("reports/<uuid:public_id>/dismiss/", views.ReportDismissView.as_view(), name="backoffice-report-dismiss"),
    path("logs/", views.SystemLogListView.as_view(), name="backoffice-logs"),
    path("emails/", views.EmailLogListView.as_view(), name="backoffice-emails"),
    path("emails/stats/", views.EmailStatsView.as_view(), name="backoffice-emails-stats"),
    path("settings/", views.PlatformSettingsView.as_view(), name="backoffice-settings"),
]
