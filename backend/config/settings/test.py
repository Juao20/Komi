from .base import *  # noqa: F401,F403

DEBUG = False

# Tests never touch external services: local SQLite, in-process cache, no broker.
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
EMAIL_PROVIDER = "django"
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
FEDAPAY_WEBHOOK_SECRET = "test-webhook-secret"
FRONTEND_URL = "https://komi.test"
LOGGING = {"version": 1, "disable_existing_loggers": False}
