import type { TodoItem, TodoList } from '../types/todo'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchTodoLists(): Promise<TodoList[]> {
  const res = await fetch(`${API_BASE}/todolists`)
  if (!res.ok) throw new Error('Failed to fetch todo lists')
  return res.json()
}

export async function fetchTodoList(listId: string): Promise<TodoList | null> {
  const res = await fetch(`${API_BASE}/todolists`)
  if (!res.ok) return null
  const lists: TodoList[] = await res.json()
  return lists.find((l) => l.id === listId) ?? null
}

export async function createTodoList(name: string): Promise<TodoList> {
  const res = await fetch(`${API_BASE}/todolists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create todo list')
  return res.json()
}

export async function fetchItems(listId: string): Promise<TodoItem[]> {
  const res = await fetch(`${API_BASE}/todolists/${listId}/items`)
  if (!res.ok) throw new Error('Failed to fetch items')
  return res.json()
}

export async function createItem(
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

export async function updateItem(
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

export async function deleteItem(
  listId: string,
  itemId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/todolists/${listId}/items/${itemId}`,
    { method: 'DELETE' }
  )
  if (!res.ok) throw new Error('Failed to delete item')
}
