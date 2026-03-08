from datetime import datetime, timezone

from pydantic import BaseModel, Field


class TodoList(BaseModel):
    id: str
    name: str
    uncompleted_count: int = 0


class TodoListCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Non-empty list name")


class TodoItem(BaseModel):
    id: str
    todolist_id: str
    title: str
    completed: bool = False
    order: int = 0  # Optional; 0 when empty. Sort items by (order, id) for stable ordering.
    created_at: datetime  # UTC
    completed_at: datetime | None = None  # UTC when completed, None otherwise

class TodoItemCreate(BaseModel):
    title: str
    order: int | None = None  # Optional; defaults to 0 when creating


class TodoItemUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None
    order: int | None = None
