import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Shared MSW server for tests; per-test overrides via `server.use(...)`. */
export const server = setupServer(...handlers)
