"""Tests for session management: /auth/me and /auth/logout."""
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

# Import _sessions so we can set up authenticated state without calling Google
from api.auth import _sessions


@pytest.fixture(autouse=True)
def clear_sessions() -> None:
    """Clear in-memory sessions before and after each test for isolation."""
    _sessions.clear()
    yield
    _sessions.clear()


def test_auth_me_returns_401_when_no_cookie(client: TestClient) -> None:
    """GET /auth/me returns 401 when no session cookie is sent."""
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_auth_me_returns_401_when_unknown_session(client: TestClient) -> None:
    """GET /auth/me returns 401 when session id is not in the store."""
    response = client.get("/auth/me", cookies={"session": "unknown-session-id"})
    assert response.status_code == 401


def test_auth_me_returns_user_when_valid_session(client: TestClient) -> None:
    """GET /auth/me returns user data when a valid session cookie is sent."""
    session_id = "valid-test-session"
    user_id = uuid4()
    _sessions[session_id] = {
        "user_id": str(user_id),
        "sub": "google-sub-1",
        "email": "me@example.com",
        "name": "Test User",
        "picture": "https://example.com/photo.jpg",
    }

    response = client.get("/auth/me", cookies={"session": session_id})

    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == str(user_id)
    assert data["email"] == "me@example.com"
    assert data["name"] == "Test User"
    assert data["picture"] == "https://example.com/photo.jpg"
    assert data["sub"] == "google-sub-1"


def test_auth_logout_clears_session(client: TestClient) -> None:
    """POST /auth/logout removes the session and clears the cookie."""
    session_id = "to-log-out"
    _sessions[session_id] = {
        "user_id": str(uuid4()),
        "sub": "x",
        "email": "x@x.com",
        "name": "X",
        "picture": "",
    }

    response = client.post("/auth/logout", cookies={"session": session_id})

    assert response.status_code == 200
    assert session_id not in _sessions
    # Cookie should be cleared (Max-Age=0 or Set-Cookie with empty value)
    set_cookie = response.headers.get("set-cookie", "").lower()
    assert "session=" in set_cookie or "session=;" in set_cookie


def test_auth_logout_idempotent_when_not_logged_in(client: TestClient) -> None:
    """POST /auth/logout without a valid session still returns 200."""
    response = client.post("/auth/logout")
    assert response.status_code == 200
