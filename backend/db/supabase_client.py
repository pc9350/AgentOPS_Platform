"""
Supabase client initialization and utilities.
"""
from functools import lru_cache
from supabase import create_client, Client

from config import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Get cached Supabase client instance.
    Uses secret key for backend operations (bypasses RLS).
    """
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_secret_key,
    )


def get_supabase_publishable_client() -> Client:
    """
    Get Supabase client with publishable key.
    Used for operations that should respect RLS.
    """
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_publishable_key,
    )

