import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import {
  useTodoItems,
  useCreateTodoItem,
  useUpdateTodoItem,
  useDeleteTodoItem,
  useMoveTodoItem,
} from '../hooks/useTodoItems'
import { useTodoList } from '../hooks/useTodoLists'
import { TodoListItem } from '../components/TodoListItem'
import { CompletionProgress } from '../components/CompletionProgress'
import { AddTodoItemForm } from '../components/AddTodoItemForm'

export function TodoListDetail() {
  const { listId } = useParams({ from: '/todo-lists/$listId' })
  const [newTitle, setNewTitle] = useState('')

  const { data: list, isLoading: listLoading } = useTodoList(listId)
  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErrorObj,
  } = useTodoItems(listId)

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

  const incompleteItems = useMemo(
    () => sortedItems.filter((i) => !i.completed),
    [sortedItems]
  )
  const completedItems = useMemo(
    () => sortedItems.filter((i) => i.completed),
    [sortedItems]
  )

  const createMutation = useCreateTodoItem(listId ?? '')
  const toggleMutation = useUpdateTodoItem(listId ?? '')
  const deleteMutation = useDeleteTodoItem(listId ?? '')
  const moveMutation = useMoveTodoItem(listId ?? '')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createMutation.mutate(newTitle.trim(), {
      onSuccess: () => setNewTitle(''),
    })
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
        <Link
          to="/todo-lists"
          className="mt-2 inline-block text-slate-600 underline"
        >
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
        <Link
          to="/todo-lists"
          className="mt-2 inline-block text-slate-600 underline"
        >
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
        <h1 className="mb-4 text-2xl font-bold text-slate-800">{list.name}</h1>

        {!itemsLoading && (
          <CompletionProgress
            completedCount={completedItems.length}
            totalCount={sortedItems.length}
          />
        )}

        <AddTodoItemForm
          value={newTitle}
          onChange={setNewTitle}
          onSubmit={handleAdd}
          isPending={createMutation.isPending}
          error={createMutation.error?.message}
        />

        {itemsLoading ? (
          <p className="text-slate-600">Loading items…</p>
        ) : sortedItems.length === 0 ? (
          <p className="text-slate-600">No items yet. Add one above.</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                To do ({incompleteItems.length})
              </h2>
              {incompleteItems.length === 0 ? (
                <p className="text-slate-500">No open items.</p>
              ) : (
                <ul className="space-y-2">
                  {incompleteItems.map((item, index) => (
                    <TodoListItem
                      key={item.id}
                      item={item}
                      showReorder
                      isReorderDisabled={moveMutation.isPending}
                      isToggleDisabled={toggleMutation.isPending}
                      isDeleteDisabled={deleteMutation.isPending}
                      canMoveUp={index > 0}
                      canMoveDown={index < incompleteItems.length - 1}
                      onToggle={() =>
                        toggleMutation.mutate({
                          itemId: item.id,
                          patch: { completed: !item.completed },
                        })
                      }
                      onDelete={() => deleteMutation.mutate(item.id)}
                      onMoveUp={() =>
                        moveMutation.mutate({
                          itemId: item.id,
                          direction: 'up',
                          within: incompleteItems,
                        })
                      }
                      onMoveDown={() =>
                        moveMutation.mutate({
                          itemId: item.id,
                          direction: 'down',
                          within: incompleteItems,
                        })
                      }
                    />
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Completed ({completedItems.length})
              </h2>
              {completedItems.length === 0 ? (
                <p className="text-slate-500">No completed items yet.</p>
              ) : (
                <ul className="space-y-2">
                  {completedItems.map((item) => (
                    <TodoListItem
                      key={item.id}
                      item={item}
                      showReorder={false}
                      isToggleDisabled={toggleMutation.isPending}
                      isDeleteDisabled={deleteMutation.isPending}
                      onToggle={() =>
                        toggleMutation.mutate({
                          itemId: item.id,
                          patch: { completed: !item.completed },
                        })
                      }
                      onDelete={() => deleteMutation.mutate(item.id)}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
