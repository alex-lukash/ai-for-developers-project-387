/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the API base URL (tests use an absolute origin; dev/prod use the `/api` proxy). */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
