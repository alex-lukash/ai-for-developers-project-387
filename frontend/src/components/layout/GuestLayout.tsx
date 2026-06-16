import { Link, Outlet } from 'react-router'
import { useOwner } from '@/features/owner/api'

export function GuestLayout() {
  const { data: owner } = useOwner()

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-semibold">
            {owner ? `Book with ${owner.name}` : 'Book a meeting'}
          </Link>
          <Link
            to="/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
