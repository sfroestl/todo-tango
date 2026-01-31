import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface AuthUser {
  name: string
  email: string
  sub: string
  picture?: string
}

async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
  if (!res.ok) return null
  return res.json()
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/todo-lists', label: 'Todo lists' },
] as const

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { data: user } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    retry: false,
  })

  const isActive = (path: string): boolean =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)

  return (
    <nav className="bg-slate-800 text-slate-100 shadow-lg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-white hover:text-slate-200"
          >
            Todo Tango
          </Link>

          {/* Desktop: nav links + profile or login */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <Link
                to="/login/success"
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800"
                title={user.name || user.email}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name || 'Profile'}
                    className="h-8 w-8 rounded-full border-2 border-slate-600 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-medium text-white">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`overflow-hidden transition-all duration-200 ease-out md:hidden ${
            menuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 border-t border-slate-700 pb-3 pt-2">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  isActive(to)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <Link
                to="/login/success"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-600 text-xs font-medium text-white">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
