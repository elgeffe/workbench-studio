import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('mobile layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The Workbench')).toBeVisible();
  });

  test('shows the bottom tab bar and hides the desktop chrome', async ({ page }) => {
    await expect(page.getByTestId('mobile-tabs')).toBeVisible();
    await expect(page.getByTestId('desktop-tabs')).toBeHidden();
    // the fixed dock bar is present
    await expect(page.getByTestId('dock-bar')).toBeVisible();
  });

  test('expands the instrument dock when the sounding bar is tapped', async ({ page }) => {
    await expect(page.getByText('PIANO · C3–C5')).toBeHidden();
    await page.getByTestId('dock-bar').click();
    await expect(page.getByText('PIANO · C3–C5')).toBeVisible();
    await expect(page.getByText('GUITAR · EADGBE')).toBeVisible();
  });

  test('navigates modes via the bottom tab bar', async ({ page }) => {
    const tabs = page.getByTestId('mobile-tabs');
    await tabs.getByRole('tab', { name: 'workshop' }).click();
    await expect(page.getByText('Your progression')).toBeVisible();

    await tabs.getByRole('tab', { name: 'drums' }).click();
    await expect(page.getByTestId('drum-grid')).toBeVisible();

    await tabs.getByRole('tab', { name: 'ear' }).click();
    await expect(page.getByText('TAP TO PLAY · LISTEN')).toBeVisible();

    await tabs.getByRole('tab', { name: 'patterns' }).click();
    await expect(page.getByText('FORMULA')).toBeVisible();

    await tabs.getByRole('tab', { name: 'jazz' }).click();
    await expect(page.getByText('Seven building blocks of jazz & groove harmony')).toBeVisible();

    await tabs.getByRole('tab', { name: 'circle' }).click();
    await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();
  });

  test('circle: fifths/fourths toggle updates the wheel label', async ({ page }) => {
    await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();
    await page.getByRole('button', { name: 'FOURTHS' }).click();
    await expect(page.getByText('CIRCLE OF 4THS')).toBeVisible();
  });
});
