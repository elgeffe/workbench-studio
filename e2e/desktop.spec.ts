import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('desktop layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The Workbench')).toBeVisible();
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
    await tabs.getByRole('tab', { name: 'workshop' }).click();
    await expect(page.getByText('Your progression')).toBeVisible();

    await tabs.getByRole('tab', { name: 'ear' }).click();
    await expect(page.getByText('TAP TO PLAY · LISTEN')).toBeVisible();

    await tabs.getByRole('tab', { name: 'patterns' }).click();
    await expect(page.getByText('FORMULA')).toBeVisible();

    await tabs.getByRole('tab', { name: 'jazz' }).click();
    await expect(page.getByText('Seven building blocks of jazz & groove harmony')).toBeVisible();

    await tabs.getByRole('tab', { name: 'circle' }).click();
    await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();
  });

  test('workshop: loading a starting point fills the progression', async ({ page }) => {
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'workshop' }).click();
    await expect(page.getByText(/Empty — load a starting point/)).toBeVisible();
    await page.getByText('12-Bar Blues').first().click();
    await expect(page.getByText(/Empty — load a starting point/)).toBeHidden();
    // the blues progression places I7 chords into the strip
    await expect(page.getByText('I7').first()).toBeVisible();
  });
});
