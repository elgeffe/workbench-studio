import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// One taxonomy shelves all three libraries, so a genre means the same thing to
// the drum machine, the progression shelf and the bass grooves. "Load the whole
// style" cashes that in: one tap instead of three trips through three pickers.

test.describe('load the whole style', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
  });

  test('seeds drums, chords and bass from one genre', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');

    // start from a blank progression and an empty bassline
    await tabs.getByRole('tab', { name: 'chords' }).click();
    await expect(page.getByText(/Empty — type the changes above/)).toBeVisible();
    await tabs.getByRole('tab', { name: 'bass' }).click();
    await expect(page.getByText(/Empty — load a groove above/)).toBeVisible();

    // pick a genre in the drum picker, then take the whole style
    await tabs.getByRole('tab', { name: 'drums' }).click();
    await page.getByTestId('drum-picker-summary').click();
    await page.getByTestId('drum-genres').getByRole('button', { name: /^Disco & Boogie\s+\d+$/ }).click();
    await page.getByTestId('drum-picker-loadall').click();

    // the drum groove is disco…
    await expect(page.getByTestId('drum-picker-summary')).toContainText('Disco & Boogie');
    // …the progression came with it…
    await tabs.getByRole('tab', { name: 'chords' }).click();
    await expect(page.getByText(/Empty — type the changes above/)).toBeHidden();
    await expect(page.getByTestId('ws-picker-summary')).toContainText('Disco & Boogie');
    // …and so did the bassline
    await tabs.getByRole('tab', { name: 'bass' }).click();
    await expect(page.getByText(/Empty — load a groove above/)).toBeHidden();
    await expect(page.getByTestId('bass-picker-summary')).toContainText('Disco & Boogie');
  });

  test('is offered from every part’s picker, and closes behind itself', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');

    await tabs.getByRole('tab', { name: 'chords' }).click();
    await page.getByTestId('ws-picker-summary').click();
    await expect(page.getByTestId('ws-picker-loadall')).toBeVisible();
    await page.getByTestId('ws-picker-loadall').click();
    // taking a whole style is the end of the errand, so the shelf closes
    await expect(page.getByTestId('ws-picker')).toBeHidden();

    await tabs.getByRole('tab', { name: 'bass' }).click();
    await page.getByTestId('bass-picker-summary').click();
    await expect(page.getByTestId('bass-picker-loadall')).toBeVisible();
  });

  test('a genre missing a part tops up rather than clearing it', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');

    // load a full style first
    await tabs.getByRole('tab', { name: 'bass' }).click();
    await page.getByTestId('bass-picker-summary').click();
    await page.getByTestId('bass-picker-loadall').click();
    await expect(page.getByText(/Empty — load a groove above/)).toBeHidden();

    // every genre in the taxonomy carries all three, so the line survives a
    // second style load rather than being emptied by a missing part
    await page.getByTestId('bass-picker-summary').click();
    await page.getByTestId('bass-picker-genres').getByRole('button', { name: /^Jazz\s+\d+$/ }).click();
    await page.getByTestId('bass-picker-loadall').click();
    await expect(page.getByText(/Empty — load a groove above/)).toBeHidden();
    await expect(page.getByTestId('bass-picker-summary')).toContainText('Jazz');
  });
});
