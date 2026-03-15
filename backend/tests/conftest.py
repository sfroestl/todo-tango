import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Set env before any app import so database and auth use test values
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
# File-based SQLite so TestClient (different thread) and fixtures share the same DB
_test_db = Path(__file__).resolve().parent / "tmp" / "test.db"
_test_db.parent.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_test_db}")

from main import app
from database import Base, SessionLocal, engine
import models  # noqa: F401 - register models for create_all
from models.user import User


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db() -> Session:
    """Provide a DB session; ensure tables exist and clear users before each test."""
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    session.query(User).delete()
    session.commit()
    try:
        yield session
    finally:
        session.close()
