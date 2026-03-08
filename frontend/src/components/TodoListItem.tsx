import type { TodoItem } from '../types/todo'
import { formatLocalDateTime } from '../lib/date'
import { ChevronUpIcon, ChevronDownIcon } from './icons'

export interface TodoListItemProps {
  item: TodoItem
  showReorder: boolean
  isReorderDisabled?: boolean
  isToggleDisabled?: boolean
  isDeleteDisabled?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  onToggle: () => void
  onDelete: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function TodoListItem({
  item,
  showReorder,
  isReorderDisabled = false,
  isToggleDisabled = false,
  isDeleteDisabled = false,
  canMoveUp = false,
  canMoveDown = false,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: TodoListItemProps) {
  const titleClass = item.completed
    ? 'text-slate-500 line-through'
    : 'text-slate-800'

  return (
    <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex w-8 flex-shrink-0 flex-col items-center">
        {showReorder && onMoveUp != null && onMoveDown != null ? (
          <>
            <button
              type="button"
              aria-label="Move up"
              disabled={!canMoveUp || isReorderDisabled}
              onClick={onMoveUp}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              <ChevronUpIcon />
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={!canMoveDown || isReorderDisabled}
              onClick={onMoveDown}
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
            >
              <ChevronDownIcon />
            </button>
          </>
        ) : (
          <div className="w-8 flex-shrink-0" aria-hidden role="presentation" />
        )}
      </div>
      <input
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
        disabled={isToggleDisabled}
      />
      <div className="min-w-0 flex-1">
        <span className={titleClass}>{item.title}</span>
        {item.created_at != null && (
          <p className="mt-0.5 text-xs text-slate-500">
            Created: {formatLocalDateTime(item.created_at)}
            {item.completed_at != null && (
              <> · Completed: {formatLocalDateTime(item.completed_at)}</>
            )}
          </p>
        )}
        {item.completed && item.created_at == null && item.completed_at != null && (
          <p className="mt-0.5 text-xs text-slate-500">
            Completed: {formatLocalDateTime(item.completed_at)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleteDisabled}
        className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  )
}
