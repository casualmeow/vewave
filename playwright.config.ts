import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Spike-only projects (Phase 2 glass/lens ADR). Scoped by testMatch to the
    // lens-spike spec so the existing chromium-only suites keep their coverage
    // contract unchanged. Playwright WebKit is automated WebKit evidence only —
    // it does not certify desktop Safari or iOS Safari.
    {
      name: 'firefox',
      testMatch: /(lens-spike|phase-5-motion).spec.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /lens-spike\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
