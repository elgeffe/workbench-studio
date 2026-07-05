import { defineConfig, devices } from '@playwright/test';

// The environment ships a pinned Chromium build under PLAYWRIGHT_BROWSERS_PATH
// (browser download is disabled). Point Playwright straight at that binary so
// it never tries to fetch a version-matched build.
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'line',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    launchOptions: { executablePath: CHROMIUM },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: CHROMIUM } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
