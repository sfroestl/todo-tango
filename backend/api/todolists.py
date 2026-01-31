from fastapi import APIRouter

from schemas.todolist import TodoList, TodoListCreate
from services.todolist_service import create_todolist, get_all_todolists

router = APIRouter(prefix="/todolists", tags=["todolists"])


@router.get("", response_model=list[TodoList])
def list_todolists() -> list[TodoList]:
    """List all todo lists."""
    return get_all_todolists()


@router.post("", response_model=TodoList, status_code=201)
def create_todolist_endpoint(data: TodoListCreate) -> TodoList:
    """Create a new todo list."""
    return create_todolist(data)
