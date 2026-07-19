from celery import shared_task

from apps.emails.backends.registry import get_email_backend


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_email_task(self, *, log_id, to, subject, html_body, text_body, from_email=None):
    from django.conf import settings

    from apps.emails.models import EmailLog, EmailLogStatus

    try:
        get_email_backend().send(to=to, subject=subject, html_body=html_body, text_body=text_body, from_email=from_email)
    except Exception as exc:
        if self.request.retries >= self.max_retries:
            EmailLog.objects.filter(pk=log_id).update(status=EmailLogStatus.FAILED, error_message=str(exc)[:500])
            return
        raise self.retry(exc=exc)
    else:
        EmailLog.objects.filter(pk=log_id).update(status=EmailLogStatus.SENT, provider=settings.EMAIL_PROVIDER)
