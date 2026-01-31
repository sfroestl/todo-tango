"""Tests for todo item ordering: no order property, same order, stable ordering."""

from fastapi.testclient import TestClient


def _create_list(client: TestClient) -> str:
    """Create a todo list and return its id."""
    r = client.post("/todolists", json={"name": "Order Test List"})
    assert r.status_code == 201
    return r.json()["id"]


def test_create_item_without_order_property(client: TestClient) -> None:
    """When 'order' is omitted, item gets order 0 and appears in list with order 0."""
    list_id = _create_list(client)
    r = client.post(
        f"/todolists/{list_id}/items",
        json={"title": "No order"},
    )
    assert r.status_code == 201
    data = r.json()
    assert data.get("order") == 0
    assert data["title"] == "No order"

    list_r = client.get(f"/todolists/{list_id}/items")
    assert list_r.status_code == 200
    items = list_r.json()
    assert len(items) == 1
    assert items[0]["order"] == 0
    assert items[0]["title"] == "No order"


def test_create_item_with_explicit_order(client: TestClient) -> None:
    """When 'order' is provided, item stores and returns that order."""
    list_id = _create_list(client)
    r = client.post(
        f"/todolists/{list_id}/items",
        json={"title": "Second", "order": 10},
    )
    assert r.status_code == 201
    assert r.json()["order"] == 10

    list_r = client.get(f"/todolists/{list_id}/items")
    assert list_r.status_code == 200
    assert list_r.json()[0]["order"] == 10


def test_same_order_returns_stable_order_by_id(client: TestClient) -> None:
    """Multiple items with the same order are returned in stable order by id (ascending)."""
    list_id = _create_list(client)
    for title in ["First", "Second", "Third"]:
        r = client.post(
            f"/todolists/{list_id}/items",
            json={"title": title, "order": 5},
        )
        assert r.status_code == 201

    list_r = client.get(f"/todolists/{list_id}/items")
    assert list_r.status_code == 200
    items = list_r.json()
    assert len(items) == 3
    assert all(i["order"] == 5 for i in items)
    returned_ids = [i["id"] for i in items]
    assert returned_ids == sorted(returned_ids), "Items with same order must be ordered by id (ascending)"


def test_ordering_is_stable_across_list_calls(client: TestClient) -> None:
    """GET items returns the same order on repeated calls (stable sort)."""
    list_id = _create_list(client)
    for title in ["A", "B", "C"]:
        r = client.post(
            f"/todolists/{list_id}/items",
            json={"title": title},  # no order → 0
        )
        assert r.status_code == 201

    first = client.get(f"/todolists/{list_id}/items").json()
    second = client.get(f"/todolists/{list_id}/items").json()
    assert [i["id"] for i in first] == [i["id"] for i in second]
    assert [i["title"] for i in first] == [i["title"] for i in second]


def test_mixed_orders_returned_sorted_by_order_then_id(client: TestClient) -> None:
    """Items with different order values are sorted by order first, then id for ties."""
    list_id = _create_list(client)
    # Create: order 10, then 0, then 10 again (same order tie)
    client.post(f"/todolists/{list_id}/items", json={"title": "High1", "order": 10})
    client.post(f"/todolists/{list_id}/items", json={"title": "Low", "order": 0})
    client.post(f"/todolists/{list_id}/items", json={"title": "High2", "order": 10})

    items = client.get(f"/todolists/{list_id}/items").json()
    assert len(items) == 3
    assert items[0]["title"] == "Low" and items[0]["order"] == 0
    assert items[1]["order"] == 10 and items[2]["order"] == 10
    assert items[1]["id"] <= items[2]["id"], "Same order: tie broken by id (ascending)"
