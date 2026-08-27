import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('desktop layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
  });

  test('shows the two-column workspace with the side instrument panel', async ({ page }) => {
    await expect(page.getByTestId('desktop-tabs')).toBeVisible();
    // side "Sounding now" panel is desktop-only
    await expect(page.getByText('Sounding now')).toBeVisible();
    await expect(page.getByText('PIANO · C3–C5')).toBeVisible();
    // mobile chrome is hidden on desktop
    await expect(page.getByTestId('mobile-tabs')).toBeHidden();
  });

  test('circle mode: selecting a diatonic chord reveals the detail panel', async ({ page }) => {
    await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();
    await expect(page.getByText(/Tap a key on the wheel/)).toBeVisible();
    // click the tonic (I / C) card in the diatonic row
    await page.getByRole('button', { name: 'I C', exact: false }).first().click();
    await expect(page.getByText(/Tap a key on the wheel/)).toBeHidden();
    await expect(page.getByText('SUBSTITUTIONS', { exact: false }).first()).toBeVisible();
  });

  test('navigates every mode via the top tabs', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');
    await tabs.getByRole('tab', { name: 'chords' }).click();
    await expect(page.getByText('Your progression')).toBeVisible();

    await tabs.getByRole('tab', { name: 'drums' }).click();
    await expect(page.getByTestId('drum-grid')).toBeVisible();

    await tabs.getByRole('tab', { name: 'metronome' }).click();
    await expect(page.getByTestId('metronome-transport')).toBeVisible();

    await tabs.getByRole('tab', { name: 'bass' }).click();
    await expect(page.getByTestId('bass-line')).toBeVisible();

    await tabs.getByRole('tab', { name: 'learn' }).click();
    await expect(page.getByText('Eight building blocks of jazz & groove harmony')).toBeVisible();

    // the drills and the pattern library are subtabs of Learn now
    await page.getByTestId('learn-tabs').getByRole('tab', { name: 'practice' }).click();
    await expect(page.getByText('TAP TO PLAY · LISTEN')).toBeVisible();

    await page.getByTestId('learn-tabs').getByRole('tab', { name: 'patterns' }).click();
    await expect(page.getByText('FORMULA')).toBeVisible();

    await tabs.getByRole('tab', { name: 'circle' }).click();
    await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();
  });

  test('chords: loading a starting point fills the progression', async ({ page }) => {
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'chords' }).click();
    await expect(page.getByText(/Empty — type the changes above/)).toBeVisible();
    // the starting-point shelves stay behind a summary bar so they don't bury
    // the strip; on desktop they expand in place
    await page.getByTestId('ws-picker-summary').click();
    const picker = page.getByTestId('ws-picker');
    await expect(picker).toBeVisible();
    await picker.getByRole('button', { name: /^Blues & Shuffle\s+\d+$/ }).click();
    await picker.getByText('12-Bar Blues').click();
    // expanded in place it stays open, so the next one is one tap away
    await expect(picker).toBeVisible();
    await expect(page.getByText(/Empty — type the changes above/)).toBeHidden();
    // the blues progression places I7 chords into the strip
    await expect(page.getByText('I7').first()).toBeVisible();
  });
});
