from pydantic import BaseModel, Field


class TodoList(BaseModel):
    id: str
    name: str


class TodoListCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Non-empty list name")


class TodoItem(BaseModel):
    id: str
    todolist_id: str
    title: str
    completed: bool = False


class TodoItemCreate(BaseModel):
    title: str


class TodoItemUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None
