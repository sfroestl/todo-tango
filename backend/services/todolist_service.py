from schemas.todolist import TodoList

MOCK_TODOLISTS: list[TodoList] = [
    TodoList(id="tl-1", name="Work"),
    TodoList(id="tl-2", name="Personal"),
    TodoList(id="tl-3", name="Shopping"),
]


def get_all_todolists() -> list[TodoList]:
    """Return all todo lists (mocked)."""
    return MOCK_TODOLISTS
