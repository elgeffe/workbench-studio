import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});

test('rapid drum-machine taps do not trigger page zoom', async ({ page }) => {
  await page.goto('/');

  // The app-level gesture policy disables double-tap zoom without blocking
  // deliberate pinch zoom (which `manipulation` continues to allow).
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).touchAction))
    .toBe('manipulation');

  await page.getByTestId('mobile-tabs').getByRole('tab', { name: 'drums' }).tap();
  // `exact` matters here: accessible-name matching is a substring by default,
  // so "kick step 1" also picks up steps 10 through 16.
  const cell = page.getByRole('button', { name: 'kick step 1', exact: true });
  await cell.tap();
  await cell.tap();

  const scale = await page.evaluate(() => window.visualViewport?.scale ?? 1);
  expect(scale).toBe(1);
});
