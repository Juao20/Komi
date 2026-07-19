from django.conf import settings

from apps.emails.models import EmailLog
from apps.emails.tasks import send_email_task
from apps.emails.utils import render_email_template


def _dispatch(*, to, subject, template_name, context):
    if not to:
        return
    html_body, text_body = render_email_template(template_name, {"frontend_url": settings.FRONTEND_URL, **context})
    log = EmailLog.objects.create(recipient=to, subject=subject, template_name=template_name)
    send_email_task.delay(log_id=log.id, to=to, subject=subject, html_body=html_body, text_body=text_body)


class EmailService:
    """Single entrypoint for all outgoing email. No other app should call
    django.core.mail or an email backend directly — always go through here."""

    @classmethod
    def send_welcome_email(cls, *, user):
        _dispatch(
            to=user.email,
            subject="Bienvenue sur KOMI",
            template_name="welcome",
            context={"full_name": user.full_name},
        )

    @classmethod
    def send_verification_email(cls, *, user, verification_url):
        _dispatch(
            to=user.email,
            subject="Confirmez votre adresse email",
            template_name="verify_email",
            context={"full_name": user.full_name, "verification_url": verification_url},
        )

    @classmethod
    def send_password_reset_email(cls, *, user, reset_url):
        _dispatch(
            to=user.email,
            subject="Réinitialisez votre mot de passe",
            template_name="password_reset",
            context={"full_name": user.full_name, "reset_url": reset_url},
        )

    @classmethod
    def send_password_changed_email(cls, *, user):
        _dispatch(
            to=user.email,
            subject="Votre mot de passe a été modifié",
            template_name="password_changed",
            context={"full_name": user.full_name},
        )

    @classmethod
    def send_email_changed_email(cls, *, user, old_email):
        _dispatch(
            to=old_email,
            subject="Votre adresse email a été modifiée",
            template_name="email_changed",
            context={"full_name": user.full_name, "new_email": user.email},
        )

    @classmethod
    def send_store_created_email(cls, *, user, store):
        _dispatch(
            to=user.email,
            subject="Votre boutique est prête",
            template_name="store_created",
            context={"full_name": user.full_name, "store_name": store.name},
        )

    @classmethod
    def send_new_order_email(cls, *, store, order):
        _dispatch(
            to=store.owner.email,
            subject=f"Nouvelle commande #{order.order_number}",
            template_name="new_order",
            context={
                "store_name": store.name,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "total_amount": order.total_amount,
                "currency": order.currency,
            },
        )

    @classmethod
    def send_order_confirmation_email(cls, *, order):
        if not order.customer_email:
            return
        _dispatch(
            to=order.customer_email,
            subject=f"Confirmation de votre commande #{order.order_number}",
            template_name="order_confirmation",
            context={
                "store_name": order.store.name,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "items": list(order.items.all()),
                "total_amount": order.total_amount,
                "currency": order.currency,
            },
        )

    @classmethod
    def send_order_status_changed_email(cls, *, order, status_label):
        if not order.customer_email:
            return
        _dispatch(
            to=order.customer_email,
            subject=f"Votre commande #{order.order_number} — {status_label}",
            template_name="order_status_changed",
            context={
                "store_name": order.store.name,
                "order_number": order.order_number,
                "customer_name": order.customer_name,
                "status_label": status_label,
            },
        )

    @classmethod
    def send_generic_notification_email(cls, *, to, full_name, title, message, action_url=None, action_label=None):
        _dispatch(
            to=to,
            subject=title,
            template_name="generic_notification",
            context={
                "full_name": full_name,
                "title": title,
                "message": message,
                "action_url": action_url,
                "action_label": action_label,
            },
        )
