from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    cors_allow_origins: list[str] = ["*"]

    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    elevenlabs_api_key: str | None = None

    db_path: str = "the_one.sqlite3"

settings = Settings()
