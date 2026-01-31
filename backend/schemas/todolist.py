from pydantic import BaseModel


class TodoList(BaseModel):
    id: str
    name: str


class TodoListCreate(BaseModel):
    name: str
