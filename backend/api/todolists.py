from fastapi import APIRouter, HTTPException

from schemas.todolist import (
    TodoItem,
    TodoItemCreate,
    TodoItemUpdate,
    TodoList,
    TodoListCreate,
)
from services.todolist_service import (
    create_item,
    create_todolist,
    delete_item,
    get_all_todolists,
    get_items,
    get_todolist,
    update_item as update_item_svc,
)

router = APIRouter(prefix="/todolists", tags=["todolists"])


@router.get("", response_model=list[TodoList])
def list_todolists() -> list[TodoList]:
    """List all todo lists."""
    return get_all_todolists()


@router.post("", response_model=TodoList, status_code=201)
def create_todolist_endpoint(data: TodoListCreate) -> TodoList:
    """Create a new todo list."""
    return create_todolist(data)


# Nested routes: items under a list
@router.get("/{list_id}/items", response_model=list[TodoItem])
def list_items(list_id: str) -> list[TodoItem]:
    """List all items in a todo list."""
    if get_todolist(list_id) is None:
        raise HTTPException(status_code=404, detail="Todo list not found")
    return get_items(list_id)


@router.post("/{list_id}/items", response_model=TodoItem, status_code=201)
def create_item_endpoint(list_id: str, data: TodoItemCreate) -> TodoItem:
    """Create a new todo item in a list."""
    if get_todolist(list_id) is None:
        raise HTTPException(status_code=404, detail="Todo list not found")
    item = create_item(list_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Todo list not found")
    return item


@router.patch("/{list_id}/items/{item_id}", response_model=TodoItem)
def update_item_endpoint(
    list_id: str, item_id: str, data: TodoItemUpdate
) -> TodoItem:
    """Update a todo item (title and/or completed)."""
    if get_todolist(list_id) is None:
        raise HTTPException(status_code=404, detail="Todo list not found")
    item = update_item_svc(list_id, item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Todo item not found")
    return item


@router.delete("/{list_id}/items/{item_id}", status_code=204)
def delete_item_endpoint(list_id: str, item_id: str) -> None:
    """Delete a todo item."""
    if get_todolist(list_id) is None:
        raise HTTPException(status_code=404, detail="Todo list not found")
    if not delete_item(list_id, item_id):
        raise HTTPException(status_code=404, detail="Todo item not found")
