import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// The Workshop's chord length is a setting of its own. It used to be a hidden
// consequence of the style — BASS gave every chord a full bar — which read as
// the tempo halving the moment you switched to it.
test.describe('workshop: chord length vs tempo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'workshop' }).click();
    await expect(page.getByText('Your progression')).toBeVisible();
  });

  test('switching to BASS leaves the chord length and the tempo alone', async ({ page }) => {
    const half = page.getByTestId('slot-half');
    const bar = page.getByTestId('slot-bar');
    await expect(half).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('2 beats per chord')).toBeVisible();

    const tempo = await page.locator('input[type=range]').first().inputValue();

    await page.getByText('BASS', { exact: true }).click();
    await expect(page.getByText('THE BASSLINE · follows each chord as the loop plays')).toBeVisible();
    // the style switch changed neither the clock nor the harmonic rhythm
    await expect(half).toHaveAttribute('aria-pressed', 'true');
    await expect(bar).toHaveAttribute('aria-pressed', 'false');
    expect(await page.locator('input[type=range]').first().inputValue()).toBe(tempo);

    // and going back to CLASSIC leaves it alone too
    await page.getByText('CLASSIC', { exact: true }).click();
    await expect(half).toHaveAttribute('aria-pressed', 'true');
  });

  test('the chord length is switchable and says what it means in beats', async ({ page }) => {
    await page.getByTestId('slot-bar').click();
    await expect(page.getByTestId('slot-bar')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('slot-half')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('4 beats per chord')).toBeVisible();

    await page.getByTestId('slot-half').click();
    await expect(page.getByText('2 beats per chord')).toBeVisible();
  });
});
