import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export interface TodoList {
  id: string
  name: string
}

async function fetchTodoLists(): Promise<TodoList[]> {
  const res = await fetch(`${API_BASE}/todolists`)
  if (!res.ok) throw new Error('Failed to fetch todo lists')
  return res.json()
}

export function TodoLists() {
  const { data: todoLists, isLoading, isError, error } = useQuery({
    queryKey: ['todolists'],
    queryFn: fetchTodoLists,
  })

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
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo lists</h1>
        {todoLists?.length === 0 ? (
          <p className="text-slate-600">No todo lists yet.</p>
        ) : (
          <ul className="space-y-2">
            {todoLists?.map((list) => (
              <li
                key={list.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <span className="font-medium text-slate-800">{list.name}</span>
                <span className="text-sm text-slate-500">({list.id})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
