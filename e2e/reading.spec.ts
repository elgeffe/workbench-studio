import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('sight reading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The Workbench')).toBeVisible();
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'reading' }).click();
    await expect(page.getByTestId('reading-staff')).toBeVisible();
  });

  test('shows a staff, settings and four answer options', async ({ page }) => {
    await expect(page.getByTestId('reading-settings')).toBeVisible();
    await expect(page.getByText('KEY · C major')).toBeVisible();
    await expect(page.getByTestId('reading-options').getByRole('button')).toHaveCount(4);
  });

  test('answering an option reveals the result and advances the score total', async ({ page }) => {
    await expect(page.getByText('SCORE 0/0')).toBeVisible();
    await page.getByTestId('reading-options').getByRole('button').first().click();
    await expect(page.getByText(/✓ Correct|✗ It was/)).toBeVisible();
    await expect(page.getByText(/SCORE [01]\/1/)).toBeVisible();
    // NEXT deals a fresh question: the result message clears
    await page.getByTestId('reading-next').click();
    await expect(page.getByText(/✓ Correct|✗ It was/)).toBeHidden();
  });

  test('switching drills and settings re-deals a question', async ({ page }) => {
    await page.getByText('Intervals', { exact: true }).click();
    await expect(page.getByText('Two stacked notes — name the interval')).toBeVisible();
    await page.getByText('Chords', { exact: true }).click();
    await expect(page.getByText('A stacked chord — name it')).toBeVisible();
    await page.getByText('Bass 𝄢').click();
    await expect(page.getByLabel('bass staff')).toBeVisible();
  });

  test('play-it mode: tapping piano keys answers the question', async ({ page }) => {
    await page.getByText('Play it', { exact: true }).click();
    await expect(page.getByText('TAP THE NOTES ON THE PIANO OR FRETBOARDS →')).toBeVisible();
    // Tap all 12 pitch classes: the correct one lands eventually, so a result
    // must appear (a wrong tap reveals a miss, the right one a hit).
    const keys = page.locator('.pkey-white, .pkey-black');
    const n = await keys.count();
    for (let i = 0; i < n; i++) {
      await keys.nth(i).click();
      if (await page.getByText(/✓ Correct|✗ /).isVisible()) break;
    }
    await expect(page.getByText(/SCORE [01]\/1/)).toBeVisible();
  });

  test('the learn-the-staff guide expands with both labelled clefs', async ({ page }) => {
    await page.getByText('𝄞 LEARN THE STAFF').click();
    await expect(page.getByTestId('reading-guide')).toBeVisible();
    await expect(page.getByText(/Every Good Boy Does Fine/)).toBeVisible();
    await expect(page.getByText(/All Cows Eat Grass/)).toBeVisible();
  });
});
