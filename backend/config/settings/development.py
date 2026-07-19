from .base import *  # noqa: F401,F403

DEBUG = True

# Runs Celery tasks synchronously so local dev doesn't require a Redis broker.
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
