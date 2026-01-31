import uuid

import pytest
from fastapi.testclient import TestClient


def test_create_todolist_success(client: TestClient) -> None:
    """Creating a todo list returns 201 with the given name and a valid UUID id."""
    response = client.post(
        "/todolists",
        json={"name": "My New List"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "name" in data
    assert data["name"] == "My New List"
    # id must be a valid UUID
    parsed = uuid.UUID(data["id"])
    assert str(parsed) == data["id"]


def test_create_todolist_id_is_uuid(client: TestClient) -> None:
    """Created todo list has an id that is a valid UUID."""
    response = client.post(
        "/todolists",
        json={"name": "Another List"},
    )
    assert response.status_code == 201
    data = response.json()
    uuid.UUID(data["id"])  # raises ValueError if not valid


def test_create_todolist_validates_name_empty(client: TestClient) -> None:
    """Creating a list with empty name returns 422."""
    response = client.post(
        "/todolists",
        json={"name": ""},
    )
    assert response.status_code == 422


def test_create_todolist_validates_name_missing(client: TestClient) -> None:
    """Creating a list without name returns 422."""
    response = client.post(
        "/todolists",
        json={},
    )
    assert response.status_code == 422


def test_create_todolist_name_is_returned(client: TestClient) -> None:
    """Created todo list returns the same non-empty name that was sent."""
    name = "Shopping List"
    response = client.post("/todolists", json={"name": name})
    assert response.status_code == 201
    assert response.json()["name"] == name
