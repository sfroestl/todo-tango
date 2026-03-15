"""Tests for user creation and get_or_create_user."""
from sqlalchemy.orm import Session

from models.user import User
from services.user_service import get_or_create_user


def test_get_or_create_user_creates_new_user(db: Session) -> None:
    """First call with a google_sub creates a new user and returns it."""
    user = get_or_create_user(
        db,
        google_sub="google-123",
        email="alice@example.com",
        name="Alice",
        picture="https://example.com/alice.jpg",
    )
    assert user.id is not None
    assert user.google_sub == "google-123"
    assert user.email == "alice@example.com"
    assert user.name == "Alice"
    assert user.picture == "https://example.com/alice.jpg"
    assert user.created_at is not None

    # Only one user in DB
    assert db.query(User).count() == 1


def test_get_or_create_user_returns_existing_user_and_updates_profile(db: Session) -> None:
    """Second call with same google_sub returns same user and updates email/name/picture."""
    first = get_or_create_user(
        db,
        google_sub="google-456",
        email="bob@example.com",
        name="Bob",
        picture="",
    )
    first_id = first.id
    first_created = first.created_at

    updated = get_or_create_user(
        db,
        google_sub="google-456",
        email="bob.new@example.com",
        name="Robert",
        picture="https://example.com/bob.png",
    )
    assert updated.id == first_id
    assert updated.email == "bob.new@example.com"
    assert updated.name == "Robert"
    assert updated.picture == "https://example.com/bob.png"
    assert updated.created_at == first_created

    assert db.query(User).count() == 1


def test_get_or_create_user_id_is_uuid(db: Session) -> None:
    """New user has a UUID primary key."""
    user = get_or_create_user(
        db,
        google_sub="google-789",
        email="uuid@example.com",
    )
    assert user.id is not None
    # UUID type: can be used as string and is 36 chars when stringified
    assert len(str(user.id)) == 36
    # No collision between two users
    user2 = get_or_create_user(db, google_sub="google-999", email="other@example.com")
    assert user.id != user2.id
