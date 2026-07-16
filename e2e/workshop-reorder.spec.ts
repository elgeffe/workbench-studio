import { test, expect, type Page, type Locator } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 }, hasTouch: true });

async function loadProgression(page: Page): Promise<Locator> {
  await page.goto('/');
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'workshop' }).click();
  await page.getByText('12-Bar Blues').first().click();
  const cells = page.locator('[data-chip]');
  await expect(cells.first()).toBeVisible();
  return cells;
}

async function center(loc: Locator): Promise<{ x: number; y: number }> {
  const b = await loc.boundingBox();
  if (!b) throw new Error('no box');
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

// Dragging the last chip onto the first slot: jzMove re-inserts it at index 0,
// so the old last chord leads and everything else shifts right by one.
function expectRotated(before: string[], after: string[]) {
  expect(after.length).toBe(before.length);
  expect(after[0]).toBe(before[before.length - 1]);
  expect(after.slice(1)).toEqual(before.slice(0, -1));
}

test('reorders via mouse drag', async ({ page }) => {
  const cells = await loadProgression(page);
  const before = await cells.allInnerTexts();
  expect(before.length).toBeGreaterThan(2);

  const from = await center(cells.nth(before.length - 1));
  const to = await center(cells.first());
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move((from.x + to.x) / 2, from.y, { steps: 6 });
  await page.mouse.move(to.x, to.y, { steps: 6 });
  await page.mouse.up();

  expectRotated(before, await cells.allInnerTexts());
});

test('reorders via touch after a long-press', async ({ page }) => {
  const cells = await loadProgression(page);
  const before = await cells.allInnerTexts();
  expect(before.length).toBeGreaterThan(2);

  const from = await center(cells.nth(before.length - 1));
  const to = await center(cells.first());
  const client = await page.context().newCDPSession(page);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] });
  await page.waitForTimeout(360); // hold still to pick the chip up before dragging
  for (let s = 1; s <= 8; s++) {
    const x = from.x + ((to.x - from.x) * s) / 8;
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: to.y }] });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  expectRotated(before, await cells.allInnerTexts());
});

test('a quick touch swipe scrolls, it does not reorder', async ({ page }) => {
  const cells = await loadProgression(page);
  const before = await cells.allInnerTexts();
  expect(before.length).toBeGreaterThan(2);

  const from = await center(cells.nth(before.length - 1));
  const to = await center(cells.first());
  const client = await page.context().newCDPSession(page);
  // No hold: swipe immediately. This is a scroll gesture now, so the order
  // must stay exactly as it was.
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] });
  for (let s = 1; s <= 8; s++) {
    const x = from.x + ((to.x - from.x) * s) / 8;
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: to.y }] });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  expect(await cells.allInnerTexts()).toEqual(before);
});
