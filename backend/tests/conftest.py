import os

import pytest
from fastapi.testclient import TestClient

# Set auth env so main can import without RuntimeError when .env.local is missing
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "test-client-secret")

from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)
