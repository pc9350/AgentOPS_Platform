"""
Centralized configuration management for AgentOps backend.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Supabase
    supabase_url: str
    supabase_publishable_key: str
    supabase_secret_key: str
    supabase_jwt_secret: str
    
    # OpenAI
    openai_api_key: str
    
    # Tavily
    tavily_api_key: str
    
    # Server
    cors_origins: str = "http://localhost:3000"
    debug: bool = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Model pricing (per 1M tokens) - Updated January 2025
# Prices are per 1 million tokens (standard tier, no caching)
MODEL_PRICING = {
    # OpenAI Models
    "gpt-5.2": {"input": 1.75, "output": 14.00},
    "gpt-5.1": {"input": 1.25, "output": 10.00},
    "gpt-5-mini": {"input": 0.25, "output": 2.00},
    "gpt-5-nano": {"input": 0.05, "output": 0.40},
    "o3-pro": {"input": 20.00, "output": 80.00},
    "o3": {"input": 2.00, "output": 8.00},
    "o4-mini": {"input": 1.10, "output": 4.40},
    "gpt-4o": {"input": 2.50, "output": 10.00},  # Legacy model
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},  # Legacy model (for backwards compatibility)
    
    # Anthropic Claude Models (base input pricing, no cache)
    "claude-opus-4.5": {"input": 5.00, "output": 25.00},
    "claude-opus-4.1": {"input": 15.00, "output": 75.00},
    "claude-sonnet-4.5": {"input": 3.00, "output": 15.00},
    "claude-sonnet-4": {"input": 3.00, "output": 15.00},
    "claude-haiku-4.5": {"input": 1.00, "output": 5.00},
    "claude-haiku-3.5": {"input": 0.80, "output": 4.00},
    
    # Google Gemini Models (standard tier, text-only, prompts <= 200k tokens)
    "gemini-3-pro": {"input": 2.00, "output": 12.00},
    "gemini-2.5-pro": {"input": 1.25, "output": 10.00},
    "gemini-2.5-flash": {"input": 0.30, "output": 2.50},
    "gemini-2.5-flash-lite": {"input": 0.10, "output": 0.40},
    "gemini-2.0-flash": {"input": 0.10, "output": 0.40},
}

# Model latency estimates (ms per 1K tokens)
MODEL_LATENCY = {
    # OpenAI Models
    "gpt-5.2": {"base": 700, "per_1k": 140},
    "gpt-5.1": {"base": 650, "per_1k": 130},
    "gpt-5-mini": {"base": 300, "per_1k": 60},
    "gpt-5-nano": {"base": 150, "per_1k": 30},
    "o3-pro": {"base": 2500, "per_1k": 400},  # Reasoning models are slower
    "o3": {"base": 1500, "per_1k": 250},
    "o4-mini": {"base": 1000, "per_1k": 180},
    "gpt-4o": {"base": 500, "per_1k": 100},  # Legacy
    "gpt-4o-mini": {"base": 200, "per_1k": 50},  # Legacy (for backwards compatibility)
    
    # Anthropic Claude Models
    "claude-opus-4.5": {"base": 800, "per_1k": 150},
    "claude-opus-4.1": {"base": 1100, "per_1k": 210},
    "claude-sonnet-4.5": {"base": 600, "per_1k": 120},
    "claude-sonnet-4": {"base": 650, "per_1k": 125},
    "claude-haiku-4.5": {"base": 280, "per_1k": 65},
    "claude-haiku-3.5": {"base": 250, "per_1k": 60},
    
    # Google Gemini Models
    "gemini-3-pro": {"base": 750, "per_1k": 145},
    "gemini-2.5-pro": {"base": 650, "per_1k": 130},
    "gemini-2.5-flash": {"base": 250, "per_1k": 55},
    "gemini-2.5-flash-lite": {"base": 150, "per_1k": 35},
    "gemini-2.0-flash": {"base": 200, "per_1k": 45},
}

