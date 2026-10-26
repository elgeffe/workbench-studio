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

  test('moves the dock and tabs to a rail on the trailing edge', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
    const rail = await box(page, '.wb-dockbar');
    expect(rail.right).toBe(890);
    expect(rail.left).toBeGreaterThan(890 - 140);
    expect(rail.top).toBe(0);
    // every tab sits inside the rail and on screen
    for (const t of await page.locator('.wb-mtab').all()) {
      const b = (await t.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(rail.left);
      expect(b.y + b.height).toBeLessThanOrEqual(626);
    }
    // content and header stop short of the rail
    expect((await box(page, '.wb-header')).right).toBeLessThanOrEqual(rail.left + 1);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('the dock panel opens beside the rail, not over it', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('dock-bar').click({ position: { x: 20, y: 120 } });
    await expect(page.getByTestId('dock-panel')).toBeVisible();
    const rail = await box(page, '.wb-dockbar');
    const panel = await box(page, '[data-testid=dock-panel]');
    expect(panel.right).toBeLessThanOrEqual(rail.left + 1);
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
