export interface TodoItem {
  id: string
  todolist_id: string
  title: string
  completed: boolean
  order?: number // optional; 0 when empty. Items are sorted by (order, id).
  created_at?: string // ISO 8601 UTC
  completed_at?: string | null // ISO 8601 UTC when completed, null otherwise
}

export interface TodoList {
  id: string
  name: string
  uncompleted_count?: number
}
