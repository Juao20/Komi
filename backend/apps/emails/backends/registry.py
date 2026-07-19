from django.conf import settings

from apps.emails.backends.django_backend import DjangoEmailBackend
from apps.emails.backends.resend_backend import ResendBackend

_BACKENDS = {
    "django": DjangoEmailBackend,
    "resend": ResendBackend,
    # Future: "postmark": PostmarkBackend, "ses": SESBackend
}


def get_email_backend():
    provider = getattr(settings, "EMAIL_PROVIDER", "resend")
    backend_class = _BACKENDS.get(provider, ResendBackend)
    return backend_class()
