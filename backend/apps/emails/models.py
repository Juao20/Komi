from django.db import models

from apps.core.models import BaseModel


class EmailLogStatus(models.TextChoices):
    QUEUED = "queued", "En file d'attente"
    SENT = "sent", "Envoyé"
    FAILED = "failed", "Échoué"


class EmailLog(BaseModel):
    recipient = models.EmailField(db_index=True)
    subject = models.CharField(max_length=255)
    template_name = models.CharField(max_length=100)
    status = models.CharField(max_length=16, choices=EmailLogStatus.choices, default=EmailLogStatus.QUEUED)
    provider = models.CharField(max_length=20, blank=True)
    error_message = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = "emails_log"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self):
        return f"{self.recipient} — {self.subject} ({self.status})"
