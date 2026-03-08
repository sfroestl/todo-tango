import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface TodoItem {
  id: string
  todolist_id: string
  title: string
  completed: boolean
  order?: number // optional; 0 when empty. Items are sorted by (order, id).
}

export interface TodoList {
  id: string
  name: string
  uncompleted_count?: number
}

function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

async function fetchTodoList(listId: string): Promise<TodoList | null> {
  const res = await fetch(`${API_BASE}/todolists`)
  if (!res.ok) return null
  const lists: TodoList[] = await res.json()
  return lists.find((l) => l.id === listId) ?? null
}

async function fetchItems(listId: string): Promise<TodoItem[]> {
  const res = await fetch(`${API_BASE}/todolists/${listId}/items`)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

async function createItem(
  listId: string,
  title: string
): Promise<TodoItem> {
  const res = await fetch(`${API_BASE}/todolists/${listId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to create item')
  return res.json()
}

async function updateItem(
  listId: string,
  itemId: string,
  patch: { title?: string; completed?: boolean; order?: number }
): Promise<TodoItem> {
  const res = await fetch(
    `${API_BASE}/todolists/${listId}/items/${itemId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }
  )
  if (!res.ok) throw new Error('Failed to update item')
  return res.json()
}

async function deleteItem(listId: string, itemId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/todolists/${listId}/items/${itemId}`,
    { method: 'DELETE' }
  )
  if (!res.ok) throw new Error('Failed to delete item')
}

export function TodoListDetail() {
  const { listId } = useParams({ from: '/todo-lists/$listId' })
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')

  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ['todolists', listId],
    queryFn: () => fetchTodoList(listId),
    enabled: !!listId,
  })

  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErrorObj,
  } = useQuery({
    queryKey: ['todolists', listId, 'items'],
    queryFn: () => fetchItems(listId),
    enabled: !!listId,
  })

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const orderA = a.order ?? 0
        const orderB = b.order ?? 0
        if (orderA !== orderB) return orderA - orderB
        return a.id.localeCompare(b.id)
      }),
    [items]
  )

  const createMutation = useMutation({
    mutationFn: () => createItem(listId, newTitle.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todolists', listId, 'items'],
      })
      setNewTitle('')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({
      itemId,
      completed,
    }: {
      itemId: string
      completed: boolean
    }) => updateItem(listId, itemId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todolists', listId, 'items'],
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => deleteItem(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todolists', listId, 'items'],
      })
    },
  })

  const moveMutation = useMutation({
    mutationFn: async ({
      itemId,
      direction,
    }: {
      itemId: string
      direction: 'up' | 'down'
    }) => {
      const idx = sortedItems.findIndex((i) => i.id === itemId)
      if (idx === -1) throw new Error('Item not found')
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sortedItems.length)
        throw new Error('Cannot move in that direction')
      const item = sortedItems[idx]
      const neighbour = sortedItems[swapIdx]
      // Use list index as order so swap works even when stored order is 0
      await updateItem(listId, item.id, { order: swapIdx })
      await updateItem(listId, neighbour.id, { order: idx })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todolists', listId, 'items'],
      })
    },
  })

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createMutation.mutate()
  }

  if (listLoading || !listId) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <p className="text-red-600">List not found.</p>
        <Link to="/todo-lists" className="mt-2 inline-block text-slate-600 underline">
          Back to todo lists
        </Link>
      </div>
    )
  }

  if (itemsError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <p className="text-red-600">
          Error: {itemsErrorObj?.message ?? 'Failed to load items'}
        </p>
        <Link to="/todo-lists" className="mt-2 inline-block text-slate-600 underline">
          Back to todo lists
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            to="/todo-lists"
            className="text-slate-600 hover:text-slate-800 hover:underline"
          >
            ← Todo lists
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">{list.name}</h1>

        <form onSubmit={handleAdd} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add an item…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            disabled={!newTitle.trim() || createMutation.isPending}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {createMutation.isError && (
          <p className="mb-2 text-sm text-red-600">
            {createMutation.error?.message}
          </p>
        )}

        {itemsLoading ? (
          <p className="text-slate-600">Loading items…</p>
        ) : sortedItems.length === 0 ? (
          <p className="text-slate-600">No items yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {sortedItems.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0 || moveMutation.isPending}
                    onClick={() =>
                      moveMutation.mutate({ itemId: item.id, direction: 'up' })
                    }
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <ChevronUpIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={
                      index === sortedItems.length - 1 ||
                      moveMutation.isPending
                    }
                    onClick={() =>
                      moveMutation.mutate({
                        itemId: item.id,
                        direction: 'down',
                      })
                    }
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <ChevronDownIcon />
                  </button>
                </div>
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() =>
                    toggleMutation.mutate({
                      itemId: item.id,
                      completed: !item.completed,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
                  disabled={toggleMutation.isPending}
                />
                <span
                  className={`flex-1 text-slate-800 ${
                    item.completed ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
