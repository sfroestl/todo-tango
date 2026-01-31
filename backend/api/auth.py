import os
import secrets
from urllib.parse import urlencode

from fastapi import APIRouter
from fastapi.responses import JSONResponse, RedirectResponse

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
SCOPES = ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]


@router.get("/google")
def auth_google():
    """Redirect the user to Google's OAuth consent screen."""
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

    if not client_id:
        return JSONResponse(
            {"error": "GOOGLE_CLIENT_ID not configured"},
            status_code=500,
        )

    redirect_uri = f"{backend_url}/auth/google/callback"
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"

    response = RedirectResponse(url=url, status_code=302)
    response.set_cookie(
        key="oauth_state",
        value=state,
        max_age=600,
        httponly=True,
        samesite="lax",
    )
    return response
