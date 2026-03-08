import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchTodoLists,
  fetchTodoList,
  createTodoList as createTodoListApi,
} from '../api/todolists'
import { todoQueryKeys } from './queryKeys'

export { todoQueryKeys }

export function useTodoLists() {
  return useQuery({
    queryKey: todoQueryKeys.lists(),
    queryFn: fetchTodoLists,
  })
}

export function useTodoList(listId: string | undefined) {
  return useQuery({
    queryKey: todoQueryKeys.list(listId ?? ''),
    queryFn: () => fetchTodoList(listId!),
    enabled: !!listId,
  })
}

export function useCreateTodoList() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createTodoListApi(name.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.lists() })
    },
  })
}
