from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from apps.emails.backends.base import EmailBackendBase


class DjangoEmailBackend(EmailBackendBase):
    """Sends through Django's configured EMAIL_BACKEND (SMTP by default).

    Works unchanged with Gmail, Resend, Brevo, Postmark or SES SMTP relays —
    switching providers is an env var change (EMAIL_HOST/USER/PASSWORD).
    """

    def send(self, *, to, subject, html_body, text_body, from_email=None, reply_to=None):
        recipients = [to] if isinstance(to, str) else list(to)
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=from_email or settings.DEFAULT_FROM_EMAIL,
            to=recipients,
            reply_to=reply_to,
        )
        message.attach_alternative(html_body, "text/html")
        message.send()
