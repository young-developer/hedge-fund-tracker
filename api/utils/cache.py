"""
Simple in-memory cache decorator with time-based expiration.
"""
import time
import threading
import logging
from functools import wraps
from typing import Any, Callable

logger = logging.getLogger(__name__)


class TimeCache:
    """Simple in-memory cache with time-based expiration."""

    def __init__(self, ttl_seconds: int = 3600):
        """
        Initialize cache with TTL.

        Args:
            ttl_seconds: Time to live for cache entries in seconds (default: 1 hour)
        """
        self._cache: dict[str, tuple[Any, float]] = {}
        self._lock = threading.Lock()
        self.ttl_seconds = ttl_seconds

    def get(self, key: str) -> Any | None:
        """
        Get value from cache if not expired.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        with self._lock:
            if key in self._cache:
                value, timestamp = self._cache[key]
                if time.time() - timestamp < self.ttl_seconds:
                    logger.info(f"Cache HIT for key: {key}")
                    return value
                else:
                    del self._cache[key]
                    logger.debug(f"Cache EXPIRED for key: {key}")
            else:
                logger.debug(f"Cache MISS for key: {key}")
        return None

    def set(self, key: str, value: Any) -> None:
        """
        Set value in cache.

        Args:
            key: Cache key
            value: Value to cache
        """
        with self._lock:
            self._cache[key] = (value, time.time())
            logger.debug(f"Cache SET for key: {key}")

    def clear(self, key: str | None = None) -> None:
        """
        Clear cache entry or entire cache.

        Args:
            key: Specific key to clear, or None to clear all
        """
        with self._lock:
            if key is None:
                self._cache.clear()
            elif key in self._cache:
                del self._cache[key]

    def cleanup_expired(self) -> int:
        """
        Remove all expired entries from cache.

        Returns:
            Number of entries removed
        """
        with self._lock:
            current_time = time.time()
            expired_keys = [
                key for key, (_, timestamp) in self._cache.items()
                if current_time - timestamp >= self.ttl_seconds
            ]
            for key in expired_keys:
                del self._cache[key]
            return len(expired_keys)


def cached(ttl_seconds: int = 3600, key_prefix: str = ""):
    """
    Decorator for caching function results with time-based expiration.

    Args:
        ttl_seconds: Time to live for cached results in seconds
        key_prefix: Optional prefix for cache keys

    Returns:
        Decorated function
    """
    cache = TimeCache(ttl_seconds)

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            key = key_prefix + func.__name__ + str(args) + str(kwargs)
            cached_value = cache.get(key)

            if cached_value is not None:
                return cached_value

            result = func(*args, **kwargs)
            cache.set(key, result)
            return result

        wrapper.clear_cache = lambda: cache.clear()
        wrapper.clear_key = lambda k: cache.clear(k)
        wrapper.get_cache_info = lambda: {
            'size': len(cache._cache),
            'ttl': cache.ttl_seconds
        }

        return wrapper

    return decorator
