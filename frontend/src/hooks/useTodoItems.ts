import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TodoItem } from '../types/todo'
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem as deleteItemApi,
} from '../api/todolists'
import { todoQueryKeys } from './queryKeys'

export function useTodoItems(listId: string | undefined) {
  return useQuery({
    queryKey: todoQueryKeys.items(listId ?? ''),
    queryFn: () => fetchItems(listId!),
    enabled: !!listId,
  })
}

export function useCreateTodoItem(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createItem(listId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: todoQueryKeys.items(listId),
      })
    },
  })
}

export function useUpdateTodoItem(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      itemId,
      patch,
    }: {
      itemId: string
      patch: { title?: string; completed?: boolean; order?: number }
    }) => updateItem(listId, itemId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: todoQueryKeys.items(listId),
      })
    },
  })
}

export function useDeleteTodoItem(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => deleteItemApi(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: todoQueryKeys.items(listId),
      })
    },
  })
}

export function useMoveTodoItem(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      itemId,
      direction,
      within,
    }: {
      itemId: string
      direction: 'up' | 'down'
      within: TodoItem[]
    }) => {
      const idx = within.findIndex((i) => i.id === itemId)
      if (idx === -1) throw new Error('Item not found')
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= within.length)
        throw new Error('Cannot move in that direction')
      const item = within[idx]
      const neighbour = within[swapIdx]
      const orderA = item.order ?? 0
      const orderB = neighbour.order ?? 0
      await updateItem(listId, item.id, { order: orderB })
      await updateItem(listId, neighbour.id, { order: orderA })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: todoQueryKeys.items(listId),
      })
    },
  })
}
