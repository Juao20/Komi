from rest_framework.settings import api_settings
from rest_framework.throttling import ScopedRateThrottle


def scoped(scope):
    """Throttle classes for a view: the global defaults plus a named scope
    from REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]."""
    return [*api_settings.DEFAULT_THROTTLE_CLASSES, ScopedRateThrottle], scope
