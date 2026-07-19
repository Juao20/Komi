from django.urls import path

from apps.customers import views

urlpatterns = [
    path("customers/", views.CustomerListView.as_view(), name="customer-list"),
    path("customers/<uuid:public_id>/", views.CustomerDetailView.as_view(), name="customer-detail"),
]
