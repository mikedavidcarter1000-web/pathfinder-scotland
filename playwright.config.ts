import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(baseURL)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Pathfinder's CSP does not include `unsafe-eval`, which React requires
    // in development mode under WebKit's JavaScriptCore. Without this flag,
    // WebKit aborts React on the auth pages and form submissions never
    // trigger the Supabase fetch. Chromium's V8 does not need eval so the
    // flag is a no-op there, but leaving it enabled project-wide keeps the
    // two browsers symmetric.
    bypassCSP: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // Only auto-start the dev server when targeting localhost. Session 11c
  // will wire CI and a dedicated test project that targets a deployed URL.
  ...(isLocalhost
    ? {
        webServer: {
          command: 'npm run dev',
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      }
    : {}),
})
