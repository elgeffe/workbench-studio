import { test, expect, type Page } from '@playwright/test';

// Transcribing a page and reading the harmony back off it. The fixtures are the
// three standards the analysis was built against, because between them they
// cover the three cases a chart can be: one key throughout, two relative keys,
// and a tune that genuinely modulates.

async function openChords(page: Page) {
  await page.goto('/');
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'chords' }).click();
}

async function enter(page: Page, line: string) {
  await page.getByPlaceholder(/Cm7 F7/).fill(line);
  await page.getByTestId('add-typed').click();
}

const keyLabels = (page: Page) =>
  page.evaluate(() => {
    const out: string[] = [];
    document.querySelectorAll('div.mono').forEach((d) => {
      const t = (d.textContent || '').trim();
      if (/^[A-G][b#]? (major|minor)$/.test(t)) out.push(t);
    });
    return out;
  });

test.describe('entering changes off a chart', () => {
  test('places every chord, whatever spelling the page uses', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Em7b5 Eø7 E-7b5 Emin7(b5)');
    // Four ways of writing one chord — all four land, all four named the same.
    await expect(page.locator('[data-chip]')).toHaveCount(4);
    const names = await page.locator('[data-chip]').allInnerTexts();
    for (const n of names) expect(n).toContain('Eø7');
  });

  test('says which token it could not read instead of dropping it', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Cm7 wobble F7');
    await expect(page.locator('[data-chip]')).toHaveCount(2);
    await expect(page.getByText(/Could not read wobble/)).toBeVisible();
  });

  test('takes chords from outside the current key', async ({ page }) => {
    await openChords(page);
    // The app opens in C major; none of these belong to it.
    await enter(page, 'Ebm7 Ab7 DbMaj7');
    await expect(page.locator('[data-chip]')).toHaveCount(3);
    expect(await keyLabels(page)).toEqual(['Db major']);
  });
});

test.describe('the key-centre reading', () => {
  test('reads Autumn Leaves as Bb major then G minor', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Cm7 F7 | BbMaj7 EbMaj7 | Am7b5 D7 | Gm7');
    await expect(page.locator('[data-chip]')).toHaveCount(7);
    expect(await keyLabels(page)).toEqual(['Bb major', 'G minor']);
    await expect(page.getByText('2 key centres')).toBeVisible();
  });

  test('reads Blue Bossa modulating to Db major and back', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Cm6 Fm7 Dm7b5 G7b9 Cm6 Ebm7 Ab7 DbMaj7 Dm7b5 G7 Cm6');
    expect(await keyLabels(page)).toEqual(['C minor', 'Db major', 'C minor']);
  });

  test('keeps a one-key progression in one key', async ({ page }) => {
    await openChords(page);
    await enter(page, 'CMaj7 Am7 Dm7 G7');
    expect(await keyLabels(page)).toEqual(['C major']);
    await expect(page.getByText('One key throughout')).toBeVisible();
  });
});

test.describe('the scale readout', () => {
  test('names the local key, the role and the scale for the selected chord', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Cm7 F7 | BbMaj7 EbMaj7 | Am7b5 D7 | Gm7');
    await page.locator('[data-chip]').nth(4).click(); // the Am7b5

    // Its key centre is G minor, not the Bb the four chords before it were in.
    await expect(page.getByTestId('sel-key')).toHaveText('G minor');
    await expect(page.getByTestId('sel-scale')).toHaveText('A locrian ♮2');
    // And the app's own key was never changed — the analysis is per chord.
    await expect(page.getByText(/^Chords · C Major$/i)).toBeVisible();
  });

  test('shows the fake-book spelling of a chord this app names differently', async ({ page }) => {
    await openChords(page);
    await enter(page, 'Em7b5 A7b9 Dm');
    await page.locator('[data-chip]').nth(0).click();
    await expect(page.getByText(/also written/)).toBeVisible();
    await expect(page.getByText('Em7♭5')).toBeVisible();
  });

  test('reads a minor sixth chord as having a natural sixth', async ({ page }) => {
    await openChords(page);
    // Blue Bossa's Cm6 has an A♮ in it, so its scale must have one too — the
    // three-flat key signature would hand you an A♭.
    await enter(page, 'Cm6 Fm7 Dm7b5 G7b9 Cm6');
    await page.locator('[data-chip]').nth(0).click();
    await expect(page.getByTestId('sel-scale')).toHaveText('C melodic minor');
  });
});
