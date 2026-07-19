import logging


class DatabaseLogHandler(logging.Handler):
    """Persists ERROR+ log records to SystemLog for the admin Logs page.
    Never allowed to raise — a broken log write must not break the request."""

    def emit(self, record):
        try:
            from apps.backoffice.models import SystemLog

            SystemLog.objects.create(
                level=record.levelname,
                logger_name=record.name,
                message=self.format(record),
            )
        except Exception:
            pass
