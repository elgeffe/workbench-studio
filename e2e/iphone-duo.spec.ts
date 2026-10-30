import { test, expect } from '@playwright/test';

// iPhone Duo reports ~466x678 CSS px folded and ~626x890 unfolded (890x626
// turned). The layout keys off size and orientation, not the device.
async function box(page: import('@playwright/test').Page, sel: string) {
  return page.locator(sel).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
  });
}

test.describe('unfolded, turned to landscape (890x626)', () => {
  test.use({ viewport: { width: 890, height: 626 }, hasTouch: true });

  test('keeps the dock and tabs docked at the bottom', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
    const dock = await box(page, '.wb-dockbar');
    expect(dock.bottom).toBe(626);
    expect(dock.left).toBe(0);
    expect(dock.right).toBe(890);
    for (const t of await page.locator('.wb-mtab').all()) {
      const b = (await t.boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(dock.top);
      expect(b.y + b.height).toBeLessThanOrEqual(626);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the dock panel opens above the bar', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('dock-bar').click();
    await expect(page.getByTestId('dock-panel')).toBeVisible();
    const bar = await box(page, '[data-testid=dock-bar]');
    const panel = await box(page, '[data-testid=dock-panel]');
    expect(panel.bottom).toBeLessThanOrEqual(bar.top + 1);
  });
});

test.describe('folded (466x678)', () => {
  test.use({ viewport: { width: 466, height: 678 }, hasTouch: true });

  test('keeps the bottom tab bar with all tabs on screen', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
    for (const t of await page.locator('.wb-mtab').all()) {
      const b = (await t.boundingBox())!;
      expect(b.x + b.width).toBeLessThanOrEqual(466);
      expect(b.y + b.height).toBeLessThanOrEqual(678);
    }
  });
});
