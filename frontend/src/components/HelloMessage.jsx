import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function fetchHello() {
  const res = await fetch(`${API_BASE}/hello`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function HelloMessage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hello'],
    queryFn: fetchHello,
  })

  if (isLoading) {
    return (
      <p className="text-slate-500 text-lg">Loading...</p>
    )
  }

  if (isError) {
    return (
      <p className="text-red-600 text-lg">Error: {error?.message ?? 'Something went wrong'}</p>
    )
  }

  return (
    <p className="text-xl font-medium text-slate-800 bg-slate-100 px-4 py-3 rounded-lg border border-slate-200">
      {data?.message ?? 'No message'}
    </p>
  )
}
