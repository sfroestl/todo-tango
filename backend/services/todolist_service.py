import uuid

from schemas.todolist import TodoList, TodoListCreate

MOCK_TODOLISTS: list[TodoList] = [
    TodoList(id="tl-1", name="Work"),
    TodoList(id="tl-2", name="Personal"),
    TodoList(id="tl-3", name="Shopping"),
]


def get_all_todolists() -> list[TodoList]:
    """Return all todo lists (mocked)."""
    return MOCK_TODOLISTS


def create_todolist(data: TodoListCreate) -> TodoList:
    """Create a new todo list (mocked)."""
    new_list = TodoList(id=f"tl-{uuid.uuid4().hex[:8]}", name=data.name)
    MOCK_TODOLISTS.append(new_list)
    return new_list
