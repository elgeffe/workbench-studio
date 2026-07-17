import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('drums groovebox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).click();
    await expect(page.getByTestId('drum-grid')).toBeVisible();
  });

  test('loads a genre template with its tempo, swing and layer chips', async ({ page }) => {
    // default template is Rock at its authentic tempo
    await expect(page.getByText('TEMPO · 104 BPM')).toBeVisible();
    // pick Jazz Swing — tempo and swing follow the template
    await page.getByText('Jazz Swing', { exact: false }).first().click();
    await expect(page.getByText('TEMPO · 138 BPM')).toBeVisible();
    await expect(page.getByText(/SWING · 66%/)).toBeVisible();
    // its build-up layers appear
    const layers = page.getByTestId('drum-layers');
    await expect(layers.getByText(/Ride pattern/)).toBeVisible();
    await expect(layers.getByText(/Feathered kick/)).toBeVisible();
  });

  test('layer chips rebuild the groove up to that point', async ({ page }) => {
    // Rock layer 1 explanation vs layer 2's
    await page.getByTestId('drum-layers').getByText(/Kick on 1 & 3/).click();
    await expect(page.getByText(/lays the foundation on the strong beats/)).toBeVisible();
    await page.getByTestId('drum-layers').getByText(/Backbeat snare/).click();
    await expect(page.getByText(/where an audience claps/)).toBeVisible();
  });

  test('play toggles to stop and the playhead advances', async ({ page }) => {
    const play = page.getByTestId('drums-play');
    await play.click();
    await expect(play).toHaveText('■ STOP');
    await play.click();
    await expect(play).toHaveText('▶ PLAY');
  });

  test('cells cycle rest → hit → accent on tap', async ({ page }) => {
    const cell = page.getByRole('button', { name: 'kick step 2', exact: true });
    const bg = () => cell.evaluate((el) => getComputedStyle(el).backgroundColor);
    const rest = await bg();
    await cell.click();
    const hit = await bg();
    expect(hit).not.toBe(rest);
    await cell.click();
    const accent = await bg();
    expect(accent).not.toBe(hit);
    await cell.click();
    expect(await bg()).toBe(rest);
  });
});

test.describe('learn: rhythm & drums tab', () => {
  test('shows the rhythm theory concepts alongside the harmony curriculum', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'jazz' }).click();
    // harmony curriculum is the default
    await expect(page.getByText('Seven building blocks of jazz & groove harmony')).toBeVisible();
    await page.getByTestId('learn-tabs').getByText('Rhythm & Drums').click();
    await expect(page.getByText('The Backbeat', { exact: true })).toBeVisible();
    await expect(page.getByText('The Clave — a Timeline', { exact: true })).toBeVisible();
    await expect(page.getByText('Swing & Shuffle', { exact: true })).toBeVisible();
    // bassline tricks live in their own tab
    await page.getByTestId('learn-tabs').getByText('Bass', { exact: true }).click();
    await expect(page.getByText('Tricks of the trade')).toBeVisible();
    await expect(page.getByText('BASSLINE MOVES', { exact: true })).toBeVisible();
    // and back
    await page.getByTestId('learn-tabs').getByText('Harmony & Jazz').click();
    await expect(page.getByText('Seven building blocks of jazz & groove harmony')).toBeVisible();
    await expect(page.getByText('Tricks of the trade')).toBeHidden();
  });
});
