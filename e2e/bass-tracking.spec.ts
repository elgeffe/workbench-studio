import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// A cell of the line holds a *degree*, which is what lets one line follow every
// change — and is why the grid on its own cannot say which note lands where.
// The rows under it answer that: the pitch each step resolves to, the change it
// resolves against, and, live, the note sounding right now.

async function loadALine(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'bass' }).click();
  await page.getByTestId('bass-picker-summary').click();
  await page.getByTestId('bass-picker-loadall').click(); // drums, chords and bass in one tap
  await expect(page.getByText(/Empty — load a groove above/)).toBeHidden();
}

test.describe('the bassline, spelled out', () => {
  test('names the pitch under each step, and the change under each half', async ({ page }) => {
    await loadALine(page);

    // Every written step names a real note; the rests stay blank.
    const notes = page.getByTestId('bass-notes').locator('[aria-label^="note at step"]');
    await expect(notes).toHaveCount(16);
    const written = (await notes.allInnerTexts()).filter((t) => t.trim());
    expect(written.length).toBeGreaterThan(0);
    for (const n of written) expect(n).toMatch(/^(×|[A-G][b#♭♯]?-?\d)$/);

    // The changes read as bands under the steps they own: on the default
    // half-bar slot the bar splits between the progression's first two changes,
    // and holds as one band where those are the same chord.
    const chips = await page.getByTestId('bass-over').locator('> div').allInnerTexts();
    const bands = await page.getByTestId('bass-changes').locator('> div').allInnerTexts();
    expect(bands).toEqual(chips[0] === chips[1] ? [chips[0]] : [chips[0], chips[1]]);
  });

  test('follows the bar as it plays, and stops when the transport does', async ({ page }) => {
    await loadALine(page);
    await page.getByTestId('studio-play').click();

    // 6s at the loaded tempo is at least two bars, so the whole bar must show.
    const seen = await page.evaluate(() => new Promise<number[]>((resolve) => {
      const steps: number[] = [];
      let last = -1;
      const t0 = performance.now();
      const tick = () => {
        let step = -1;
        const lit = document.querySelector('[data-testid="bass-notes"] [aria-current="step"]');
        if (lit) step = +lit.getAttribute('aria-label')!.replace(/\D+/g, '') - 1;
        if (step !== last && step >= 0) { steps.push(step); last = step; }
        if (performance.now() - t0 < 6000) requestAnimationFrame(tick);
        else resolve(steps);
      };
      requestAnimationFrame(tick);
    }));

    for (let s = 0; s < 16; s++) expect(seen, `step ${s} never lit`).toContain(s);
    const wrap = seen.indexOf(0, 1);
    expect(wrap, 'never wrapped to a second bar').toBeGreaterThan(0);
    expect(seen.slice(0, wrap)).toEqual([...Array(wrap).keys()]);

    // …and while it runs, the readout says which note is in your hands.
    await expect(page.getByTestId('bass-now')).toContainText(/the .+ of /);

    await page.getByTestId('studio-play').click();
    await expect(page.getByTestId('bass-now')).toContainText(/press PLAY/);
  });
});
