import os
from datetime import datetime, timedelta, timezone
from hmac import compare_digest
from uuid import uuid4

import jwt
from fastapi import FastAPI, HTTPException, status
from jwt import ExpiredSignatureError, InvalidTokenError
from pydantic import BaseModel


app = FastAPI(title="JWT Demo API", version="1.0.0")

ACCESS_TOKEN_EXPIRE_SECONDS = 300
REFRESH_TOKEN_EXPIRE_SECONDS = int(os.getenv("JWT_REFRESH_EXPIRE_SECONDS", "3600"))
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
VALID_USERNAME = os.getenv("JWT_DEMO_USERNAME", "admin")
VALID_PASSWORD = os.getenv("JWT_DEMO_PASSWORD", "admin123")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable must be set.")


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = ACCESS_TOKEN_EXPIRE_SECONDS


def create_token(subject: str, expires_in: int, token_type: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "jti": str(uuid4()),
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def validate_token(token: str, expected_type: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        ) from exc

    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for this operation.",
        )

    return payload


def build_token_response(subject: str) -> TokenResponse:
    return TokenResponse(
        access_token=create_token(subject, ACCESS_TOKEN_EXPIRE_SECONDS, "access"),
        refresh_token=create_token(subject, REFRESH_TOKEN_EXPIRE_SECONDS, "refresh"),
    )


@app.post("/auth/token", response_model=TokenResponse)
def login(credentials: LoginRequest) -> TokenResponse:
    if not (
        compare_digest(credentials.username, VALID_USERNAME)
        and compare_digest(credentials.password, VALID_PASSWORD)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials.",
        )

    return build_token_response(credentials.username)


@app.post("/auth/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshRequest) -> TokenResponse:
    payload = validate_token(request.refresh_token, expected_type="refresh")
    return build_token_response(payload["sub"])
