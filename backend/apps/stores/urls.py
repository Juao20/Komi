from django.urls import path

from apps.stores import views

urlpatterns = [
    path("", views.CreateStoreView.as_view(), name="store-create"),
    path("me/", views.MyStoreView.as_view(), name="store-me"),
    path("me/publish/", views.PublishStoreView.as_view(), name="store-publish"),
    path("public/<slug:slug>/", views.PublicStoreDetailView.as_view(), name="store-public-detail"),
]
