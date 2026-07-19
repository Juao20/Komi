from django.urls import path

from apps.analytics import views

urlpatterns = [
    path("dashboard/", views.DashboardOverviewView.as_view(), name="analytics-dashboard"),
    path("sales/", views.SalesOverTimeView.as_view(), name="analytics-sales"),
    path("top-products/", views.TopProductsView.as_view(), name="analytics-top-products"),
    path("customers/best/", views.BestCustomersView.as_view(), name="analytics-best-customers"),
]
