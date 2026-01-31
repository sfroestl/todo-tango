import os
import secrets
from typing import Optional
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Query
from fastapi.responses import JSONResponse, RedirectResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# Load Google OAuth credentials from environment (set in .env.local)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    raise RuntimeError(
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env.local"
    )

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
SCOPES = ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]


@router.get("/google")
def auth_google():
    """Redirect the user to Google's OAuth consent screen."""
    redirect_uri = f"{BACKEND_URL}/auth/google/callback"
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": GOOGLE_CLIENT_ID,
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


@router.get("/google/callback")
async def auth_google_callback(
    code: str = Query(...),
    state: str = Query(...),
    oauth_state: Optional[str] = Cookie(None),
):
    """Handle Google OAuth callback and exchange code for tokens."""
    # Verify state to prevent CSRF
    if not oauth_state or state != oauth_state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    redirect_uri = f"{BACKEND_URL}/auth/google/callback"

    # Exchange code for tokens
    token_data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_response = await client.post(GOOGLE_TOKEN_URL, data=token_data)
        token_response.raise_for_status()
        tokens = token_response.json()

    # Log the response from Google (for debugging)
    print("Google token response:", tokens)

    # Return the tokens as JSON for now (so you can see what Google returns)
    return JSONResponse({"tokens": tokens, "message": "Login successful (tokens logged)"})

