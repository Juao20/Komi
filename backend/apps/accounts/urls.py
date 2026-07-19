from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("verify-email/", views.VerifyEmailView.as_view(), name="auth-verify-email"),
    path("verify-email/resend/", views.ResendVerificationEmailView.as_view(), name="auth-resend-verification"),
    path("password/reset/", views.RequestPasswordResetView.as_view(), name="auth-password-reset"),
    path("password/reset/confirm/", views.ConfirmPasswordResetView.as_view(), name="auth-password-reset-confirm"),
    path("password/change/", views.ChangePasswordView.as_view(), name="auth-password-change"),
    path("me/", views.MeView.as_view(), name="auth-me"),
]
