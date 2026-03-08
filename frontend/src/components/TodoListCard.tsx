import { Link } from '@tanstack/react-router'
import type { TodoList } from '../types/todo'

export interface TodoListCardProps {
  list: TodoList
}

export function TodoListCard({ list }: TodoListCardProps) {
  const uncompletedCount = list.uncompleted_count ?? 0

  return (
    <li className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
      <Link
        to="/todo-lists/$listId"
        params={{ listId: list.id }}
        className="flex items-center gap-3 px-4 py-3 text-left"
      >
        <span className="font-medium text-slate-800">{list.name}</span>
        <span className="text-sm text-slate-500">({list.id})</span>
        {uncompletedCount > 0 && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
            {uncompletedCount} to do
          </span>
        )}
        <span className="ml-auto text-slate-400">→</span>
      </Link>
    </li>
  )
}
