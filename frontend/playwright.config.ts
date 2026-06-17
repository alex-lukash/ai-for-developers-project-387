import { defineConfig, devices } from '@playwright/test'

// End-to-end tests against the REAL full stack (Spring backend + Vite frontend).
// Playwright boots both servers below. The backend is a single in-memory H2 with the
// global non-overlap rule (the owner can't be double-booked), so tests run serially
// (`workers: 1`) and use unique slugs to stay independent within one backend lifetime.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // Spring backend on :8080 (codegen runs as part of bootRun).
      command: 'cd ../backend && ./gradlew bootRun',
      url: 'http://localhost:8080/api/owner',
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
    },
    {
      // Vite dev server proxied to the backend (keeps the /api prefix).
      command: 'npm run dev:backend',
      url: 'http://localhost:5173',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
