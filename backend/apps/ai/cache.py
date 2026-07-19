import hashlib
import logging

from django.core.cache import cache

logger = logging.getLogger(__name__)

DEFAULT_TTL = 60 * 60 * 6  # 6 hours


def make_key(*parts) -> str:
    raw = "|".join(str(p) for p in parts)
    return "ai:" + hashlib.sha256(raw.encode("utf-8")).hexdigest()


def get_cached(*parts):
    """Cache is a pure optimization here — if Redis is unreachable, treat it as a
    miss rather than failing the whole request (Comy still works, just uncached)."""
    try:
        return cache.get(make_key(*parts))
    except Exception:
        logger.warning("AI cache read failed, continuing without cache.", exc_info=True)
        return None


def set_cached(value, *parts, ttl: int = DEFAULT_TTL):
    try:
        cache.set(make_key(*parts), value, ttl)
    except Exception:
        logger.warning("AI cache write failed, continuing without cache.", exc_info=True)
