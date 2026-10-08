import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1600, height: 900 } });

test('number keys switch tabs and ? opens the shortcut list', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await expect(page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('?');
  await expect(page.getByTestId('shortcut-help')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('shortcut-help')).toBeHidden();
});

test('command palette filters and runs a command', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await expect(page.getByTestId('command-palette')).toBeVisible();
  await page.keyboard.type('go to bass');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('desktop-tabs').getByRole('tab', { name: 'bass' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('command-palette')).toBeHidden();
});

test('arrow keys walk the drum grid', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await page.locator('[aria-label="kick step 1"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('[aria-label="snare step 2"]')).toBeFocused();
});

test('the instrument panel folds away and the choice survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('side-fold').click();
  await expect(page.getByTestId('side-open')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('side-open')).toBeVisible();
  await page.getByTestId('side-open').click();
  await expect(page.getByTestId('side-fold')).toBeVisible();
});

test('the timeline shows the progression on Drums and jumps the loop on click', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('3');
  await page.getByLabel('Enter chord changes').fill('Dm7 G7 Cmaj7 A7');
  await page.getByTestId('add-typed').click();
  await page.keyboard.press('2');
  const bars = page.getByTestId('timeline-bar');
  await expect(bars).toHaveCount(4);
  await page.getByTestId('studio-play').click();
  await bars.nth(3).click();
  await expect(bars.nth(3)).toHaveClass(/on/, { timeout: 4000 });
});

test('undo and redo step through grid edits, and the song survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  const cell = page.locator('[aria-label="kick step 2"]');
  const bg = () => cell.evaluate((el) => getComputedStyle(el).backgroundColor);
  const before = await bg();
  await cell.click();
  const edited = await bg();
  expect(edited).not.toBe(before);
  await page.waitForTimeout(600); // let the edit settle into one undo step
  await page.keyboard.press('Control+z');
  await expect.poll(bg).toBe(before);
  await page.keyboard.press('Control+Shift+z');
  await expect.poll(bg).toBe(edited);
  await page.waitForTimeout(700); // autosave is debounced
  await page.reload();
  await page.keyboard.press('2');
  await expect.poll(() => page.locator('[aria-label="kick step 2"]').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(edited);
  await expect(page.getByTestId('undo')).toBeDisabled();
});

test('the BPM readout is typeable and the slider resets on double-click', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('studio-bpm').click();
  await page.getByTestId('studio-bpm-input').fill('133');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('studio-bpm')).toHaveText('133');
  await page.getByLabel('studio tempo').dblclick();
  await expect(page.getByTestId('studio-bpm')).toHaveText('104');
});

test('empty progression and bassline each offer a one-tap starter', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('3');
  await page.getByTestId('progression-starter').click();
  await expect(page.locator('[data-chip]').first()).toBeVisible();
  await page.keyboard.press('4');
  await page.getByTestId('bass-starter').click();
  await expect(page.getByTestId('bass-starter')).toBeHidden();
});

test('a tab shows a live dot while its part plays', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('2');
  await page.locator('[aria-label="kick step 1"]').click();
  await page.getByTestId('studio-play').click();
  await expect(page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).locator('.wb-tab-live')).toBeVisible();
});

test('the Metronome tab brings the fretboards back while the drone sounds', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('5');
  await expect(page.getByText('BASS · EADG')).toBeHidden();
  await page.getByRole('button', { name: /Play drone/ }).click();
  await expect(page.getByText('BASS · EADG')).toBeVisible();
  await expect(page.getByText('GUITAR · EADGBE')).toBeVisible();
});
