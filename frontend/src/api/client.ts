import { Configuration, DefaultApi } from './generated'

/**
 * Single configured API client for the whole app.
 *
 * `basePath` is `/api` to match the spec's `@server("/api")`; in dev the Vite
 * proxy forwards `/api` to the Prism mock on :4010. The generated runtime maps
 * snake_case wire fields <-> camelCase TS models, so app code stays camelCase.
 *
 * Tests set `VITE_API_BASE_URL` to an absolute origin because Node's fetch (in
 * jsdom) rejects relative URLs.
 */
const basePath = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const api = new DefaultApi(new Configuration({ basePath }))
