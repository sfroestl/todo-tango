import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface TodoList {
  id: string
  name: string
  uncompleted_count: number
}

async function fetchTodoLists(): Promise<TodoList[]> {
  const res = await fetch(`${API_BASE}/todolists`)
  if (!res.ok) throw new Error('Failed to fetch todo lists')
  return res.json()
}

async function createTodoList(name: string): Promise<TodoList> {
  const res = await fetch(`${API_BASE}/todolists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create todo list')
  return res.json()
}

export function TodoLists() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')

  const { data: todoLists, isLoading, isError, error } = useQuery({
    queryKey: ['todolists'],
    queryFn: fetchTodoLists,
  })

  const createMutation = useMutation({
    mutationFn: () => createTodoList(newName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todolists'] })
      setNewName('')
      setShowForm(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo lists</h1>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo lists</h1>
          <p className="text-red-600">
            Error: {error?.message ?? 'Failed to load todo lists'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800">Todo lists</h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            {showForm ? 'Cancel' : 'Create todo list'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <label htmlFor="new-list-name" className="sr-only">
              List name
            </label>
            <input
              id="new-list-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="List name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newName.trim() || createMutation.isPending}
              className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating…' : 'Create'}
            </button>
            {createMutation.isError && (
              <p className="w-full text-sm text-red-600">
                {createMutation.error?.message}
              </p>
            )}
          </form>
        )}

        {todoLists?.length === 0 ? (
          <p className="text-slate-600">No todo lists yet.</p>
        ) : (
          <ul className="space-y-2">
            {todoLists?.map((list) => (
              <li
                key={list.id}
                className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-slate-300"
              >
                <Link
                  to="/todo-lists/$listId"
                  params={{ listId: list.id }}
                  className="flex items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="font-medium text-slate-800">{list.name}</span>
                  <span className="text-sm text-slate-500">({list.id})</span>
                  {list.uncompleted_count > 0 && (
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {list.uncompleted_count} to do
                    </span>
                  )}
                  <span className="ml-auto text-slate-400">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
