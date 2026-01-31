import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Nav } from '../components/Nav'

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <Outlet />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
