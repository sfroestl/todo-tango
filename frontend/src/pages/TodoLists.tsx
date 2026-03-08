import { useState } from 'react'
import { useTodoLists, useCreateTodoList } from '../hooks/useTodoLists'
import { TodoListCard } from '../components/TodoListCard'

export function TodoLists() {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')

  const { data: todoLists, isLoading, isError, error } = useTodoLists()
  const createMutation = useCreateTodoList()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createMutation.mutate(newName.trim(), {
      onSuccess: () => {
        setNewName('')
        setShowForm(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold text-slate-800">Todo lists</h1>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold text-slate-800">Todo lists</h1>
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
              <TodoListCard key={list.id} list={list} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
