import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface User {
  name: string
  email: string
  sub: string
}

export function LoginSuccess() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 p-6">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-center text-xl font-bold text-slate-800">
          You have successfully logged in
        </h1>
        {user?.name && (
          <p className="mt-2 text-center text-slate-600">
            Welcome, {user.name}
            {user.email && (
              <span className="block text-sm text-slate-500">{user.email}</span>
            )}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-2">
          <Link
            to="/"
            className="rounded-md bg-slate-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
          >
            Go to home
          </Link>
          <Link
            to="/todo-lists"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Todo lists
          </Link>
        </div>
      </div>
    </div>
  )
}
