import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Chord length is a setting of its own. It used to be a hidden consequence of
// the Workshop's style switch — BASS gave every chord a full bar — which read
// as the tempo halving the moment you switched to it. That switch is gone (bass
// is its own tab), so the guard is now that moving between the two tabs leaves
// both the clock and the harmonic rhythm alone.
test.describe('chords: chord length vs tempo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'chords' }).click();
    await expect(page.getByText('Your progression')).toBeVisible();
  });

  test('moving to the Bass tab and back leaves the chord length and the tempo alone', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');
    const half = page.getByTestId('slot-half');
    const bar = page.getByTestId('slot-bar');
    await expect(half).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('2 beats per chord')).toBeVisible();

    const tempo = await page.locator('input[type=range]').first().inputValue();

    await tabs.getByRole('tab', { name: 'bass' }).click();
    await expect(page.getByTestId('bass-line')).toBeVisible();
    // the bass tab rides the same clock and doesn't touch it
    expect(await page.locator('input[type=range]').first().inputValue()).toBe(tempo);

    await tabs.getByRole('tab', { name: 'chords' }).click();
    await expect(half).toHaveAttribute('aria-pressed', 'true');
    await expect(bar).toHaveAttribute('aria-pressed', 'false');
    expect(await page.locator('input[type=range]').first().inputValue()).toBe(tempo);
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
