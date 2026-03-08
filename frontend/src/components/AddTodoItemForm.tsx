export interface AddTodoItemFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  isPending?: boolean
  error?: string | null
}

export function AddTodoItemForm({
  value,
  onChange,
  onSubmit,
  isPending = false,
  error = null,
}: AddTodoItemFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add an item…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <button
          type="submit"
          disabled={!value.trim() || isPending}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error != null && error !== '' && (
        <p className="mb-2 text-sm text-red-600">{error}</p>
      )}
    </>
  )
}
