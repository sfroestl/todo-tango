import os

import pytest
from fastapi.testclient import TestClient

# Set env before any app import so database and auth use test values
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
