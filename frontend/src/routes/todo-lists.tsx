import { createFileRoute, Outlet } from '@tanstack/react-router'

function TodoListsLayout() {
  return <Outlet />
}

export const Route = createFileRoute('/todo-lists')({
  component: TodoListsLayout,
})
