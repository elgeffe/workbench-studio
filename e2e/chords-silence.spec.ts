import { test, expect, type Page } from '@playwright/test';

// The silent bar. A progression is not only chords — a stop-time break, the bar
// of air before the head comes back, the hole in a modal vamp are all written
// into the changes, and until now there was no way to put one there. A rest is
// a slot like any other: it is placed, dragged, selected and deleted the same
// way, it holds its share of the loop, and nothing sounds on it.

async function openChords(page: Page) {
  await page.goto('/');
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'chords' }).click();
  await expect(page.getByText('Your progression')).toBeVisible();
}

async function enter(page: Page, line: string) {
  await page.getByPlaceholder(/Cm7 F7/).fill(line);
  await page.getByTestId('add-typed').click();
}

test.describe('placing silence in a progression', () => {
  test('the + REST button places a slot that sounds nothing', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Dm9 G13 Dm9');
    await page.getByTestId('add-rest').click();

    await expect(page.locator('[data-chip]')).toHaveCount(4);
    const rest = page.locator('[data-chip][data-rest]');
    await expect(rest).toHaveCount(1);
    await expect(rest).toContainText('N.C.');
    // It is the fourth slot, after the three chords.
    await expect(page.locator('[data-chip]').nth(3)).toHaveAttribute('data-rest', '1');
  });

  test('a bar marked N.C. on the page comes through as a rest', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Dm9 | G13 | N.C. | Dm9');
    await expect(page.locator('[data-chip]')).toHaveCount(4);
    await expect(page.locator('[data-chip]').nth(2)).toHaveAttribute('data-rest', '1');
    // …and it is not reported as a token the parser choked on.
    await expect(page.getByText(/Could not read/)).toHaveCount(0);
  });

  test('selecting the silence explains it instead of offering chord moves', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Dm9 G13 N.C.');
    await page.locator('[data-chip]').nth(2).click();

    await expect(page.getByTestId('rest-inspector')).toBeVisible();
    await expect(page.getByText(/no chord sounds and the bass/)).toBeVisible();
    // The chord tools are not shown for a slot they cannot act on.
    await expect(page.getByText('COLOUR · change in place')).toHaveCount(0);
    await expect(page.getByText('SUBSTITUTE · swap this chord for…')).toHaveCount(0);
  });

  test('silence does not split the key reading in two', async ({ page }) => {
    await openChords(page);
    // One key throughout, with a bar of nothing in the middle of it — the rest
    // belongs to no key, and must not be read as a modulation.
    await enter(page, 'Dm7 G7 N.C. CMaj7');
    await expect(page.locator('[data-chip]')).toHaveCount(4);
    await expect(page.getByText('One key throughout')).toBeVisible();
    // Every slot is still on the strip, the silent one included.
    await expect(page.locator('[data-chip][data-rest]')).toHaveCount(1);
  });

  test('a progression that opens with silence still shows the silent slot', async ({ page }) => {
    await openChords(page);
    await enter(page, 'N.C. Dm7 G7 CMaj7');
    await expect(page.locator('[data-chip]')).toHaveCount(4);
    await expect(page.locator('[data-chip]').nth(0)).toHaveAttribute('data-rest', '1');
  });

  test('the bass tab shows the silence in what the line walks through', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Dm9 G13 N.C.');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'bass' }).click();
    // The OVER row is the same progression, so the bar the line sits out on is
    // visible from the tab that writes the line.
    await expect(page.getByTestId('bass-over')).toContainText('N.C.');
  });
});
