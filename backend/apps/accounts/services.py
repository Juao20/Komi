from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from apps.accounts.models import User
from apps.accounts.tokens import email_verification_token
from apps.core.exceptions import ServiceError
from apps.emails.services import EmailService

PASSWORD_RESET_ERROR = "This password reset link is invalid or has expired."


def _uid_and_token(user, token_generator):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = token_generator.make_token(user)
    return uid, token


def register_user(*, email, password, full_name, phone_number=""):
    if User.objects.filter(email__iexact=email).exists():
        raise ServiceError("An account with this email already exists.", code="email_taken", status_code=409)

    user = User.objects.create_user(
        email=email,
        password=password,
        full_name=full_name,
        phone_number=phone_number,
    )

    uid, token = _uid_and_token(user, email_verification_token)
    verification_url = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
    EmailService.send_verification_email(user=user, verification_url=verification_url)
    EmailService.send_welcome_email(user=user)

    return user


def resend_verification_email(*, user):
    if user.is_email_verified:
        raise ServiceError("This email address is already verified.", code="already_verified")

    uid, token = _uid_and_token(user, email_verification_token)
    verification_url = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
    EmailService.send_verification_email(user=user, verification_url=verification_url)


def verify_email(*, uid, token):
    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_pk)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError) as exc:
        raise ServiceError("This verification link is invalid.", code="invalid_link") from exc

    if not email_verification_token.check_token(user, token):
        raise ServiceError("This verification link is invalid or has expired.", code="invalid_link")

    if not user.is_email_verified:
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

    return user


def request_password_reset(*, email):
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return

    from django.contrib.auth.tokens import default_token_generator

    uid, token = _uid_and_token(user, default_token_generator)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
    EmailService.send_password_reset_email(user=user, reset_url=reset_url)


def confirm_password_reset(*, uid, token, new_password):
    from django.contrib.auth.tokens import default_token_generator

    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_pk)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError) as exc:
        raise ServiceError(PASSWORD_RESET_ERROR, code="invalid_link") from exc

    if not default_token_generator.check_token(user, token):
        raise ServiceError(PASSWORD_RESET_ERROR, code="invalid_link")

    user.set_password(new_password)
    user.save(update_fields=["password"])
    EmailService.send_password_changed_email(user=user)
    return user


def change_password(*, user, current_password, new_password):
    if not user.check_password(current_password):
        raise ServiceError("Your current password is incorrect.", code="invalid_password")

    user.set_password(new_password)
    user.save(update_fields=["password"])
    EmailService.send_password_changed_email(user=user)
    return user
