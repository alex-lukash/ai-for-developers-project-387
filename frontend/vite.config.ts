import path from 'node:path'
import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// API proxy target. Defaults to the Prism mock (:4010), which mounts operations at
// the root, so the `/api` prefix is stripped. Point at the real Spring backend with
// `VITE_API_TARGET=http://localhost:8080 VITE_API_KEEP_PREFIX=true` (it already serves
// under `/api`) — see the `dev:backend` script. The client stays on relative `/api`,
// so the browser sees same-origin and no CORS is needed.
const apiTarget = process.env.VITE_API_TARGET ?? 'http://localhost:4010'
const keepApiPrefix = process.env.VITE_API_KEEP_PREFIX === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        ...(keepApiPrefix ? {} : { rewrite: (p: string) => p.replace(/^\/api/, '') }),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Playwright specs under e2e/ are *.spec.ts too — keep them out of Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
    // Tests talk to MSW at an absolute origin (Node fetch needs absolute URLs).
    env: {
      VITE_API_BASE_URL: 'http://localhost/api',
    },
  },
})
