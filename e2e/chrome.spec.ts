import { test, expect } from '@playwright/test';

// The studio bar: what used to be a key stepper, an EXT selector and a
// permanently-visible key/scale strip is now a transport, a key button and
// nothing else. These guard the trade — that the transport reaches every tab,
// and that key/scale is still one tap away without owning ~85px of every page.

test.describe('desktop chrome', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
  });

  test('the transport drives the one clock from any tab', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');
    const play = page.getByTestId('studio-play');

    // drums boot with a groove, so play works before visiting the Drums tab
    await expect(play).toHaveText('▶ PLAY');
    await play.click();
    await expect(play).toHaveText('■ STOP');

    // and it keeps running as you move between tabs
    await tabs.getByRole('tab', { name: 'chords' }).click();
    await expect(play).toHaveText('■ STOP');
    await tabs.getByRole('tab', { name: 'bass' }).click();
    await expect(play).toHaveText('■ STOP');
    await play.click();
    await expect(play).toHaveText('▶ PLAY');
  });

  test('tempo is shared, and no tab carries its own', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');
    await page.locator('input[aria-label="studio tempo"]').fill('126');
    await expect(page.getByTestId('studio-bpm')).toHaveText('126');

    await tabs.getByRole('tab', { name: 'chords' }).click();
    await expect(page.getByTestId('studio-bpm')).toHaveText('126');
    // the only tempo slider on the page is the studio's
    await expect(page.locator('input[aria-label="studio tempo"]')).toHaveCount(1);
    await expect(page.getByText('TEMPO', { exact: false })).toHaveCount(1);
  });

  test('key and scale live behind the key button, not on every page', async ({ page }) => {
    // no permanent key/scale strip any more
    await expect(page.locator('.wb-strip')).toHaveCount(0);

    const button = page.getByTestId('key-button');
    await expect(button).toContainText('C Major');
    await expect(page.getByTestId('key-picker')).toBeHidden();

    await button.click();
    const picker = page.getByTestId('key-picker');
    await expect(picker).toBeVisible();

    // pick a new key and a new scale; the button is the readout
    await picker.getByRole('button', { name: 'E♭', exact: true }).click();
    await expect(button).toContainText('Eb Major');
    await picker.getByRole('button', { name: 'aeolian' }).click();
    await expect(button).toContainText('Eb Minor');

    // escape dismisses
    await page.keyboard.press('Escape');
    await expect(picker).toBeHidden();
    await expect(button).toContainText('Eb Minor');
  });

  test('the Circle tab keeps its scale row inline — it is that tab’s subject', async ({ page }) => {
    // Circle is the default tab
    await expect(page.getByRole('button', { name: 'lydian', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'lydian', exact: true }).click();
    await expect(page.getByTestId('key-button')).toContainText('Lydian');

    // …and no other tab shows it inline
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).click();
    await expect(page.getByRole('button', { name: 'lydian', exact: true })).toBeHidden();
  });

  test('space bar starts and stops the studio transport', async ({ page }) => {
    const play = page.getByTestId('studio-play');
    await page.keyboard.press('Space');
    await expect(play).toHaveText('■ STOP');
    await page.keyboard.press('Space');
    await expect(play).toHaveText('▶ PLAY');
  });
});

test.describe('mobile chrome', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the top bar is a single row and the transport rides the dock', async ({ page }) => {
    await page.goto('/');
    // one row: brand, key button and sound share it, ~52px rather than ~106
    const h = await page.locator('.wb-header').evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThan(64);

    // play sits in the dock bar, above the tabs, under the thumb
    const play = page.getByTestId('studio-play');
    await expect(play).toBeVisible();
    await expect(page.getByTestId('studio-bpm')).toHaveText('104');

    // and tapping it plays rather than expanding the dock
    await play.click();
    await expect(play).toHaveText('■');
    await expect(page.getByTestId('dock-panel')).toBeHidden();
    await play.click();

    // the bar itself still opens the dock, where the tempo slider lives
    await page.getByTestId('dock-bar').click();
    await expect(page.getByTestId('dock-panel')).toBeVisible();
    await expect(page.locator('input[aria-label="studio tempo"]')).toBeVisible();
  });

  test('the key picker is a sheet on a phone', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('key-button').click();
    const picker = page.getByTestId('key-picker');
    await expect(picker).toBeVisible();
    await picker.getByRole('button', { name: 'G', exact: true }).click();
    await expect(page.getByTestId('key-button')).toContainText('G Major');
    await page.getByTestId('key-picker-close').click();
    await expect(picker).toBeHidden();
  });
});
