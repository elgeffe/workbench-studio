import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Drag-to-reorder on the Workshop progression strip.
test('workshop: dragging a chord reorders the progression', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'workshop' }).click();
  await page.getByText('12-Bar Blues').first().click();

  const cells = page.locator('[draggable="true"]');
  await expect(cells.first()).toBeVisible();
  const before = await cells.allInnerTexts();
  expect(before.length).toBeGreaterThan(2);

  // Drag the last chord onto the first slot. jzMove removes it and re-inserts it
  // at index 0, so the old last chord should lead and everything else shift right.
  await cells.nth(before.length - 1).dragTo(cells.first());

  const after = await cells.allInnerTexts();
  expect(after.length).toBe(before.length);
  expect(after[0]).toBe(before[before.length - 1]);
  expect(after.slice(1)).toEqual(before.slice(0, -1));
});
