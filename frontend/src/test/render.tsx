import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { routes } from '@/routes/router'
import { Toaster } from '@/components/ui/sonner'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

/** Render an isolated subtree (e.g. a single form) with a fresh QueryClient. */
export function renderWithClient(ui: ReactElement) {
  const client = createTestQueryClient()
  return render(
    <QueryClientProvider client={client}>
      {ui}
      <Toaster />
    </QueryClientProvider>,
  )
}

/** Mount the whole app at a route via an in-memory router. */
export function renderApp(initialEntries: string[]) {
  const client = createTestQueryClient()
  const router = createMemoryRouter(routes, { initialEntries })
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>,
  )
}
