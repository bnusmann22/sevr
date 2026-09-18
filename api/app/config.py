from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SeVR API"
    environment: str = "development"
    database_url: str
    cors_origins: str = "http://localhost:5173"
    keycloak_url: str = "http://keycloak:8080"
    keycloak_realm: str = "sevr"
    keycloak_client_id: str = "sevr-api"
    jwt_audience: str = "sevr-api"
    nextcloud_url: str = "http://nextcloud"
    nextcloud_service_user: str
    nextcloud_service_password: str

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def keycloak_issuer(self) -> str:
        return f"{self.keycloak_url.rstrip('/')}/realms/{self.keycloak_realm}"

    @property
    def keycloak_jwks_url(self) -> str:
        return f"{self.keycloak_issuer}/protocol/openid-connect/certs"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
