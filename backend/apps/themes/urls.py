from django.urls import path

from apps.themes import views

urlpatterns = [
    path("me/", views.MyStoreThemeView.as_view(), name="theme-me"),
]
