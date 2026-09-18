from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import decode_access_token
from .config import get_settings
from .db import check_database, get_db
from .nextcloud import NextcloudClient


settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/ready")
def readiness() -> dict[str, str]:
    check_database()
    NextcloudClient().healthcheck()
    return {"status": "ready"}


@app.get("/api/v1/me")
def current_user(claims: dict = Depends(decode_access_token)) -> dict:
    return {"subject": claims.get("sub"), "claims": claims}


@app.get("/api/v1/db-check")
def database_check(_: Session = Depends(get_db)) -> dict[str, str]:
    check_database()
    return {"status": "ok"}
