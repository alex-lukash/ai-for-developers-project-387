import { NavLink, Outlet } from 'react-router'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:text-foreground',
  )

export function AdminLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <NavLink to="/admin" end className="font-semibold">
            Admin
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/admin" end className={linkClass}>
              Event types
            </NavLink>
            <NavLink to="/admin/bookings" className={linkClass}>
              Bookings
            </NavLink>
            <NavLink
              to="/"
              className="ml-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              View site
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
