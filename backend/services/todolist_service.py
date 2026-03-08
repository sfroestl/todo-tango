import uuid
from datetime import datetime, timezone

from schemas.todolist import (
    TodoItem,
    TodoItemCreate,
    TodoItemUpdate,
    TodoList,
    TodoListCreate,
)

MOCK_TODOLISTS: list[TodoList] = [
    TodoList(id="tl-1", name="Work"),
    TodoList(id="tl-2", name="Personal"),
    TodoList(id="tl-3", name="Shopping"),
]

MOCK_TODO_ITEMS: list[TodoItem] = []


def get_all_todolists() -> list[TodoList]:
    """Return all todo lists (mocked) with uncompleted item count."""
    return [
        TodoList(
            id=lst.id,
            name=lst.name,
            uncompleted_count=sum(
                1 for i in MOCK_TODO_ITEMS if i.todolist_id == lst.id and not i.completed
            ),
        )
        for lst in MOCK_TODOLISTS
    ]


def get_todolist(list_id: str) -> TodoList | None:
    """Return a todo list by id or None."""
    for lst in MOCK_TODOLISTS:
        if lst.id == list_id:
            return lst
    return None


def create_todolist(data: TodoListCreate) -> TodoList:
    """Create a new todo list (mocked)."""
    new_list = TodoList(
        id=str(uuid.uuid4()), name=data.name.strip(), uncompleted_count=0
    )
    MOCK_TODOLISTS.append(new_list)
    return new_list


def get_items(list_id: str) -> list[TodoItem]:
    """Return all items for a todo list, sorted by order then id (stable when order ties)."""
    if get_todolist(list_id) is None:
        return []
    items = [i for i in MOCK_TODO_ITEMS if i.todolist_id == list_id]
    return sorted(items, key=lambda i: (getattr(i, "order", 0), i.id))


def create_item(list_id: str, data: TodoItemCreate) -> TodoItem | None:
    """Create a new todo item in a list. Returns None if list not found."""
    if get_todolist(list_id) is None:
        return None
    existing = get_items(list_id)
    order = data.order if data.order is not None else len(existing)
    now = datetime.now(timezone.utc)
    new_item = TodoItem(
        id=f"ti-{uuid.uuid4().hex[:8]}",
        todolist_id=list_id,
        title=data.title.strip(),
        completed=False,
        order=order,
        created_at=now,
        completed_at=None,
    )
    MOCK_TODO_ITEMS.append(new_item)
    return new_item


def get_item(list_id: str, item_id: str) -> TodoItem | None:
    """Return a todo item by list and item id."""
    for i in MOCK_TODO_ITEMS:
        if i.todolist_id == list_id and i.id == item_id:
            return i
    return None


def update_item(
    list_id: str, item_id: str, data: TodoItemUpdate
) -> TodoItem | None:
    """Update a todo item. Returns None if list or item not found."""
    item = get_item(list_id, item_id)
    if item is None:
        return None
    idx = next(
        (i for i, x in enumerate(MOCK_TODO_ITEMS) if x.id == item_id), None
    )
    if idx is None:
        return None
    payload = item.model_dump()
    if data.title is not None:
        payload["title"] = data.title.strip()
    if data.completed is not None:
        payload["completed"] = data.completed
        if data.completed:
            payload["completed_at"] = datetime.now(timezone.utc)
        else:
            payload["completed_at"] = None
    if data.order is not None:
        payload["order"] = data.order
    updated = TodoItem(**payload)
    MOCK_TODO_ITEMS[idx] = updated
    return updated


def delete_item(list_id: str, item_id: str) -> bool:
    """Remove a todo item. Returns False if list or item not found."""
    item = get_item(list_id, item_id)
    if item is None:
        return False
    MOCK_TODO_ITEMS[:] = [i for i in MOCK_TODO_ITEMS if i.id != item_id]
    return True
