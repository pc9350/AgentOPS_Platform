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
    
    # Debug logging for Render
    print(f"[Supabase Client] URL loaded: {settings.supabase_url[:30]}..." if settings.supabase_url else "[Supabase Client] URL is EMPTY!")
    print(f"[Supabase Client] Secret key loaded: {settings.supabase_secret_key[:30]}..." if settings.supabase_secret_key else "[Supabase Client] Secret key is EMPTY!")
    print(f"[Supabase Client] Secret key length: {len(settings.supabase_secret_key)}")
    
    # Check for common issues
    if not settings.supabase_url or not settings.supabase_secret_key:
        raise ValueError("Supabase URL or Secret Key not loaded from environment variables!")
    
    if " " in settings.supabase_secret_key or "\n" in settings.supabase_secret_key:
        raise ValueError("Supabase Secret Key contains whitespace - check for extra spaces/newlines!")
    
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

