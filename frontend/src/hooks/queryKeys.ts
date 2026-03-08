export const todoQueryKeys = {
  all: ['todolists'] as const,
  lists: () => [...todoQueryKeys.all] as const,
  list: (listId: string) => [...todoQueryKeys.all, listId] as const,
  items: (listId: string) =>
    [...todoQueryKeys.all, listId, 'items'] as const,
}
