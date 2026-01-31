import { createFileRoute } from '@tanstack/react-router'
import { TodoListDetail } from '../pages/TodoListDetail'

export const Route = createFileRoute('/todo-lists/$listId')({
  component: TodoListDetail,
})
