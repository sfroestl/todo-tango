from fastapi import APIRouter

from schemas.todolist import TodoList
from services.todolist_service import get_all_todolists

router = APIRouter(prefix="/todolists", tags=["todolists"])


@router.get("", response_model=list[TodoList])
def list_todolists() -> list[TodoList]:
    """List all todo lists."""
    return get_all_todolists()
