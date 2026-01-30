from pydantic import BaseModel


class TodoList(BaseModel):
    id: str
    name: str
