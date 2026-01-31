"""
Google OAuth: tokens stay server-side only.

- Backend exchanges the code for tokens; access/refresh tokens are never sent to the browser.
- Session is a random id stored in an httpOnly cookie; user data lives in server-side store.
- Frontend calls /auth/me with credentials: 'include'; use VITE_API_URL=http://localhost:8000
  so the cookie (set by the backend origin) is sent. Proxy requests from the frontend origin
  do not send the backend cookie.
"""
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
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    raise RuntimeError(
        "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env.local"
    )

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
SCOPES = ["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]

# In-memory session store (use Redis/DB in production). session_id -> {user data}
_sessions: dict[str, dict] = {}


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
    """Exchange code for tokens, fetch user info, create session, redirect to frontend success page."""
    # Verify state to prevent CSRF
    if not oauth_state or state != oauth_state:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    redirect_uri = f"{BACKEND_URL}/auth/google/callback"

    # Exchange code for tokens (tokens stay server-side, never sent to browser)
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

    access_token = tokens.get("access_token")
    if not access_token:
        raise HTTPException(status_code=500, detail="No access token in response")

    # Fetch user info from Google (no tokens sent to client)
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        user_response.raise_for_status()
        user_info = user_response.json()

    # Create server-side session (store only what we need; never store raw tokens in cookie)
    session_id = secrets.token_urlsafe(32)
    _sessions[session_id] = {
        "sub": user_info.get("id"),
        "email": user_info.get("email"),
        "name": user_info.get("name", ""),
    }

    # Redirect to frontend success page; set httpOnly session cookie (browser can't read it)
    success_url = f"{FRONTEND_URL}/login/success"
    response = RedirectResponse(url=success_url, status_code=302)
    response.set_cookie(
        key="session",
        value=session_id,
        max_age=60 * 60 * 24 * 7,  # 7 days
        httponly=True,
        samesite="lax",
    )
    # Clear the one-time oauth_state cookie
    response.delete_cookie("oauth_state")
    return response


@router.get("/me")
def auth_me(session: Optional[str] = Cookie(None)):
    """Return current user from session; 401 if not logged in."""
    if not session or session not in _sessions:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return _sessions[session]


@router.post("/logout")
def auth_logout(session: Optional[str] = Cookie(None)):
    """Clear session cookie and invalidate server-side session."""
    if session and session in _sessions:
        del _sessions[session]
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie("session")
    return response

