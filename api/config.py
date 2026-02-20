"""
Configuration settings for the Hedge Fund Tracker API.
"""
import os
from pathlib import Path


class Config:
    """Application configuration."""

    # API Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_CORS_ORIGINS: list[str] = os.getenv(
        "API_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")

    # Database Settings
    DB_FOLDER: Path = Path(os.getenv("DB_FOLDER", "./database"))

    # AI Model Settings
    GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")
    GOOGLE_API_KEY: str | None = os.getenv("GOOGLE_API_KEY")
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    HF_TOKEN: str | None = os.getenv("HF_TOKEN")
    OPENROUTER_API_KEY: str | None = os.getenv("OPENROUTER_API_KEY")

    # Optional: Redis for caching
    REDIS_URL: str | None = os.getenv("REDIS_URL")

    @classmethod
    def ensure_directories(cls) -> None:
        """Ensure all required directories exist."""
        cls.DB_FOLDER.mkdir(parents=True, exist_ok=True)


# Create config instance
config = Config()
