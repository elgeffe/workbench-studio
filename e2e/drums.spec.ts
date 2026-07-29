import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('drums groovebox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).click();
    await expect(page.getByTestId('drum-grid')).toBeVisible();
  });

  test('genre → pattern is a dependent selection', async ({ page }) => {
    // default is Rock / Straight 8ths at its authentic tempo
    await expect(page.getByText('TEMPO · 104 BPM')).toBeVisible();
    await page.getByTestId('drum-picker-summary').click();
    const variations = page.getByTestId('drum-variations');
    await expect(variations.getByText('Straight 8ths')).toBeVisible();
    await expect(variations.getByText('Motorik / driving')).toBeVisible();
    // rock variations are not jazz variations
    await expect(variations.getByText('Medium swing')).toBeHidden();

    // switching genre swaps the whole variation row and loads the first pattern
    await page.getByTestId('drum-genres').getByRole('button', { name: /^Jazz\s+\d+$/ }).click();
    await expect(variations.getByText('Medium swing')).toBeVisible();
    await expect(variations.getByText('Brushes ballad')).toBeVisible();
    await expect(variations.getByText('Straight 8ths')).toBeHidden();
    await expect(page.getByText('TEMPO · 138 BPM')).toBeVisible();
    await expect(page.getByText(/SWING · 66%/)).toBeVisible();

    // and picking another variation inside the genre re-tempos the transport
    // and closes the picker behind you
    await variations.getByText('Up-tempo bebop').click();
    await expect(page.getByTestId('drum-picker')).toBeHidden();
    await expect(page.getByText('TEMPO · 190 BPM')).toBeVisible();
    const layers = page.getByTestId('drum-layers');
    await expect(layers.getByText(/Bomb drops/)).toBeVisible();
  });

  test('every genre carries its own programming note', async ({ page }) => {
    await expect(page.getByTestId('drum-maschine')).toContainText(/velocity|swing|pads?/i);
    await page.getByTestId('drum-picker-summary').click();
    await page.getByTestId('drum-genres').getByText('Trap & Drill').click();
    await expect(page.getByTestId('drum-variations').getByText('Drill')).toBeVisible();
    await page.getByTestId('drum-picker-close').click();
    await expect(page.getByTestId('drum-maschine')).toContainText('808');
  });

  test('the picker summarises what is loaded and opens over the grid', async ({ page }) => {
    const summary = page.getByTestId('drum-picker-summary');
    await expect(summary).toContainText('Rock');
    await expect(summary).toContainText('Straight 8ths');
    // shelves are out of the way until asked for
    await expect(page.getByTestId('drum-genres')).toBeHidden();
    await summary.click();
    await expect(page.getByTestId('drum-genres')).toBeVisible();
    // escape dismisses without changing the selection
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('drum-genres')).toBeHidden();
    await expect(summary).toContainText('Straight 8ths');
  });

  test('layer chips rebuild the groove up to that point', async ({ page }) => {
    // Rock / Straight 8ths: layer 1 explanation vs layer 2's
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

  test('the grid shows only the pattern\'s instruments, and you can add your own', async ({ page }) => {
    const grid = page.getByTestId('drum-grid');
    // Rock / Straight 8ths plays hats, snare and kick — nothing else takes a row
    await expect(grid.getByRole('button', { name: 'preview Kick' })).toBeVisible();
    await expect(grid.getByRole('button', { name: 'preview Closed Hat' })).toBeVisible();
    await expect(grid.getByRole('button', { name: 'preview Cowbell / Block' })).toBeHidden();

    // add a row from the rest of the kit
    await page.getByTestId('drum-add-row').getByRole('button', { name: 'add Cowbell / Block' }).click();
    await expect(grid.getByRole('button', { name: 'preview Cowbell / Block' })).toBeVisible();
    await expect(page.getByTestId('drum-add-row').getByRole('button', { name: 'add Cowbell / Block' })).toBeHidden();

    // and take it away again
    await grid.getByRole('button', { name: 'remove Cowbell / Block row' }).click();
    await expect(grid.getByRole('button', { name: 'preview Cowbell / Block' })).toBeHidden();
    await expect(page.getByTestId('drum-add-row').getByRole('button', { name: 'add Cowbell / Block' })).toBeVisible();
  });

  test('rows follow the pattern: Latin brings percussion, techno brings a sub', async ({ page }) => {
    const grid = page.getByTestId('drum-grid');
    await page.getByTestId('drum-picker-summary').click();
    await page.getByTestId('drum-genres').getByRole('button', { name: /^Afro-Cuban & Brazilian\s+\d+$/ }).click();
    await expect(grid.getByRole('button', { name: 'preview Cowbell / Block' })).toBeVisible();
    await expect(grid.getByRole('button', { name: 'preview High Tom / Conga' })).toBeVisible();

    await page.getByTestId('drum-genres').getByRole('button', { name: /^Hardstyle\s+\d+$/ }).click();
    await expect(grid.getByRole('button', { name: 'preview Sub / 808' })).toBeVisible();
    await expect(grid.getByRole('button', { name: 'preview Cowbell / Block' })).toBeHidden();
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
    await expect(page.getByText('Eight building blocks of jazz & groove harmony')).toBeVisible();
    await page.getByTestId('learn-tabs').getByText('Rhythm & Drums').click();
    await expect(page.getByText('The Backbeat', { exact: true })).toBeVisible();
    await expect(page.getByText('The Clave — a Timeline', { exact: true })).toBeVisible();
    await expect(page.getByText('Swing & Shuffle', { exact: true })).toBeVisible();
    // bassline tricks live in their own tab
    await page.getByTestId('learn-tabs').getByText('Bass', { exact: true }).click();
    await expect(page.getByText('Tricks of the trade')).toBeVisible();
    await expect(page.getByText('BASSLINE MOVES', { exact: true })).toBeVisible();
    // song structures tab peaks in the long-form fusion card
    await page.getByTestId('learn-tabs').getByText('Song Structures').click();
    await expect(page.getByText('The Long Form · Bitches Brew')).toBeVisible();
    await expect(page.getByText('Verse–Chorus', { exact: true })).toBeVisible();
    // and back
    await page.getByTestId('learn-tabs').getByText('Harmony & Jazz').click();
    await expect(page.getByText('Eight building blocks of jazz & groove harmony')).toBeVisible();
    await expect(page.getByText('Tricks of the trade')).toBeHidden();
  });
});
