import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Some sandboxes ship a pinned Chromium under PLAYWRIGHT_BROWSERS_PATH with
// browser download disabled; there, Playwright has to be pointed straight at
// that binary so it never tries to fetch a version-matched build. A CI runner
// has no such binary — it installs its own — so the path is used only when it
// actually exists, and otherwise Playwright resolves the browser itself.
// PLAYWRIGHT_CHROMIUM_PATH overrides the location for any other environment
// that pins one somewhere else.
const PINNED = process.env.PLAYWRIGHT_CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const launchOptions = existsSync(PINNED) ? { executablePath: PINNED } : {};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    launchOptions,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
