import hashlib
import secrets
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from .config import get_settings


class PasswordHasher:
    @staticmethod
    def hash(password: str) -> str:
        salt = secrets.token_hex(16)
        h = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
        return f"pbkdf2_sha256${salt}${h}"

    @staticmethod
    def verify(plain: str, hashed: str) -> bool:
        try:
            if not hashed:
                return False
            if "$" not in hashed:
                return secrets.compare_digest(plain, hashed)
            parts = hashed.split("$")
            if len(parts) != 3 or parts[0] != "pbkdf2_sha256":
                return False
            salt, h = parts[1], parts[2]
            expected = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
            return secrets.compare_digest(expected, h)
        except Exception:
            return False


pwd_context = PasswordHasher()


bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache
def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(get_settings().keycloak_jwks_url)


def decode_access_token(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required")

    settings = get_settings()
    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(credentials.credentials)
        return jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.jwt_audience,
            issuer=settings.keycloak_issuer,
        )
    except (jwt.PyJWTError, Exception) as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token") from error


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = [r.lower() for r in allowed_roles]

    def __call__(self, claims: dict = Depends(decode_access_token)) -> dict:
        user_roles = [
            r.lower()
            for r in claims.get("realm_access", {}).get("roles", [])
            + claims.get("resource_access", {}).get("sevr-api", {}).get("roles", [])
        ]
        if not any(role in user_roles for role in self.allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Principal lacks required institutional role authorization",
            )
        return claims
