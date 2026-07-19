import logging

import requests
from django.conf import settings

from apps.emails.backends.base import EmailBackendBase

logger = logging.getLogger(__name__)


class ResendBackend(EmailBackendBase):
    """Sends via the Resend HTTP API (https://resend.com/docs/api-reference/emails/send-email)."""

    api_url = "https://api.resend.com/emails"

    def send(self, *, to, subject, html_body, text_body, from_email=None, reply_to=None):
        api_key = settings.RESEND_API_KEY
        if not api_key:
            logger.error("RESEND_API_KEY is not configured; email not sent (subject=%s).", subject)
            return

        recipients = [to] if isinstance(to, str) else list(to)
        payload = {
            "from": from_email or settings.DEFAULT_FROM_EMAIL,
            "to": recipients,
            "subject": subject,
            "html": html_body,
            "text": text_body,
        }
        if reply_to:
            payload["reply_to"] = [reply_to] if isinstance(reply_to, str) else list(reply_to)

        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                timeout=10,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            body = getattr(exc.response, "text", "")
            logger.error("Resend API error sending to %s (subject=%s): %s — %s", recipients, subject, exc, body)
            # Re-raised so the Celery task's own retry/backoff logic can kick in —
            # only truly non-retryable failures (e.g. missing API key, above) are swallowed here.
            raise
