from django.db import models

from apps.core.models import TimeStampedModel


class SystemLogLevel(models.TextChoices):
    DEBUG = "DEBUG", "Debug"
    INFO = "INFO", "Info"
    WARNING = "WARNING", "Warning"
    ERROR = "ERROR", "Error"
    CRITICAL = "CRITICAL", "Critical"


class SystemLog(TimeStampedModel):
    level = models.CharField(max_length=8, choices=SystemLogLevel.choices, db_index=True)
    logger_name = models.CharField(max_length=150)
    message = models.TextField()

    class Meta:
        db_table = "backoffice_system_log"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["level", "created_at"])]

    def __str__(self):
        return f"[{self.level}] {self.message[:60]}"
