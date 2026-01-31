import { createFileRoute } from '@tanstack/react-router'
import { TodoLists } from '../pages/TodoLists'

export const Route = createFileRoute('/todo-lists')({
  component: TodoLists,
})
