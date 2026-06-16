import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
      // Forward API calls to the Prism mock. Prism mounts operations at the
      // root (not under the spec's `/api` server base), so strip `/api` here.
      '/api': {
        target: 'http://localhost:4010',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Tests talk to MSW at an absolute origin (Node fetch needs absolute URLs).
    env: {
      VITE_API_BASE_URL: 'http://localhost/api',
    },
  },
})
