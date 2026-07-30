import { test, expect, type Page } from '@playwright/test';

// What a standalone install on an iPhone 12 Pro reports for
// env(safe-area-inset-*). Chromium does not emulate the insets, so the tests
// override the four custom properties app.css resolves them into — which is
// the whole reason the stylesheet reads them through variables.
const PORTRAIT = { w: 390, h: 844, sat: 47, sar: 0, sab: 34, sal: 0 };
const LANDSCAPE = { w: 844, h: 390, sat: 0, sar: 47, sab: 21, sal: 47 };

async function fakeInsets(page: Page, i: typeof PORTRAIT) {
  await page.addStyleTag({
    content: `:root{--sat:${i.sat}px;--sar:${i.sar}px;--sab:${i.sab}px;--sal:${i.sal}px}`,
  });
}

async function box(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, w: r.width, h: r.height };
  });
}

test.describe('notched phone in portrait', () => {
  test.use({ viewport: { width: PORTRAIT.w, height: PORTRAIT.h } });

  test('keeps the header and tab bar clear of the status bar and home indicator', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The Workbench')).toBeVisible();
    await fakeInsets(page, PORTRAIT);

    // nothing in the header row may reach up into the Dynamic Island
    const brand = await box(page, '.wb-brand-title');
    expect(brand.top).toBeGreaterThanOrEqual(PORTRAIT.sat);
    const stepper = await box(page, '.wb-header-row [role="button"]');
    expect(stepper.top).toBeGreaterThanOrEqual(PORTRAIT.sat);

    // ...and the header still paints the strip behind it, rather than leaving a gap
    const header = await box(page, '.wb-header');
    expect(header.top).toBe(0);

    // the tab row sits above the home indicator
    const tab = await box(page, '.wb-mtab');
    expect(PORTRAIT.h - tab.bottom).toBeGreaterThanOrEqual(PORTRAIT.sab);
  });

  test('the picker close button is a full touch target below the island', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mobile-tabs').getByRole('tab', { name: 'drums' }).click();
    await fakeInsets(page, PORTRAIT);
    await page.getByTestId('drum-picker-summary').click();

    const close = page.getByTestId('drum-picker-close');
    const b = (await close.boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(b.width).toBeGreaterThanOrEqual(44);
    // the sheet is edge to edge, so the button has to clear the status bar
    expect(b.y).toBeGreaterThanOrEqual(PORTRAIT.sat);

    await close.click();
    await expect(page.getByTestId('drum-picker')).toBeHidden();
  });
});

test.describe('phone in landscape', () => {
  test.use({ viewport: { width: LANDSCAPE.w, height: LANDSCAPE.h } });

  test('lays the sounding bar and tab bar on one row to save height', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The Workbench')).toBeVisible();
    await fakeInsets(page, LANDSCAPE);

    const bar = await box(page, '.wb-dock-bar');
    const tabs = await box(page, '.wb-mtabs');
    // side by side, not stacked
    expect(tabs.left).toBeGreaterThanOrEqual(bar.right - 1);
    expect(Math.abs(tabs.top - bar.top)).toBeLessThan(2);

    // the whole fixed chrome, home indicator included, stays under a sixth of
    // the screen — stacked it took about 115px of the 390 available
    const chrome = await box(page, '.wb-dockbar');
    expect(chrome.h).toBeLessThanOrEqual(65);

    // and it respects the left/right insets on a notched phone
    expect(bar.left).toBe(0);
    const firstTab = await box(page, '.wb-mtab');
    expect(firstTab.left).toBeGreaterThanOrEqual(LANDSCAPE.sal);
    const lastTab = await page.locator('.wb-mtab').last().evaluate((el) => el.getBoundingClientRect().right);
    expect(LANDSCAPE.w - lastTab).toBeGreaterThanOrEqual(LANDSCAPE.sar);
  });

  test('never scrolls sideways and keeps every tab reachable', async ({ page }) => {
    await page.goto('/');
    await fakeInsets(page, LANDSCAPE);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(LANDSCAPE.w);

    // the labels must fit the narrower row rather than bleed past the last tab
    const overflow = await page.locator('.wb-mtab').evaluateAll((tabs) =>
      tabs.map((t) => t.querySelector('.wb-mtab-label')!.scrollWidth - t.clientWidth),
    );
    expect(Math.max(...overflow)).toBeLessThanOrEqual(0);

    await page.getByTestId('mobile-tabs').getByRole('tab', { name: 'patterns' }).click();
    await expect(page.getByText('FORMULA')).toBeVisible();
  });
});
