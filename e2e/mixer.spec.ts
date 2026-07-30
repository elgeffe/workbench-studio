import { test, expect } from '@playwright/test';

// The mixer gates audio and nothing else. That is the whole risk in it: if
// muting a part stopped it being *scheduled* rather than being *heard*, the
// playhead would freeze on a muted kit and un-muting mid-loop would drop the
// part back in out of phase. These tests watch what reaches the audio clock.

type Ev = number[];
const INSTRUMENT = () => {
  (window as unknown as { __ev: Ev }).__ev = [];
  const patch = (proto: { start: (t?: number) => void }) => {
    const s = proto.start;
    proto.start = function (this: AudioScheduledSourceNode, t?: number) {
      if (typeof t === 'number') (window as unknown as { __ev: Ev }).__ev.push(t);
      return s.call(this, t);
    };
  };
  patch(OscillatorNode.prototype);
  patch(AudioBufferSourceNode.prototype);
};
const scheduled = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (window as unknown as { __ev: Ev }).__ev.length);
const reset = (page: import('@playwright/test').Page) =>
  page.evaluate(() => ((window as unknown as { __ev: Ev }).__ev.length = 0));

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('mixer', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(INSTRUMENT);
    await page.goto('/');
    await expect(page.getByTestId('mixer')).toBeVisible();
  });

  test('muting a part silences it without stopping the transport', async ({ page }) => {
    // drums boot with a groove loaded, so the kit is the audible part
    await page.getByTestId('studio-play').click();
    await expect(page.getByTestId('studio-play')).toHaveText('■ STOP');
    await page.waitForTimeout(700);
    expect(await scheduled(page)).toBeGreaterThan(0);

    await page.getByTestId('mix-drums').click();
    await page.waitForTimeout(500); // let the bar already queued drain
    await reset(page);
    // A bar at 104bpm is ~2.3s, so this has to span one to prove anything.
    await page.waitForTimeout(2800);
    expect(await scheduled(page)).toBe(0);

    // …but the clock never stopped: the transport is still running, and the
    // playhead is still sweeping the grid we just silenced
    await expect(page.getByTestId('studio-play')).toHaveText('■ STOP');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).click();
    const lit = await page
      .locator('[data-testid="drum-grid"] [aria-label*=" step "]')
      .evaluateAll((cells) => cells.filter((c) => getComputedStyle(c).boxShadow !== 'none').length);
    expect(lit).toBeGreaterThan(0);

    // un-muting brings it straight back
    await page.getByTestId('mix-drums').click();
    await reset(page);
    await page.waitForTimeout(2800);
    expect(await scheduled(page)).toBeGreaterThan(0);
    await page.getByTestId('studio-play').click();
  });

  test('solo overrides the mutes, and leaving it restores them', async ({ page }) => {
    const drums = page.getByTestId('mix-drums');
    const chords = page.getByTestId('mix-chords');

    // mute the chords by hand, then solo the drums and come back
    await chords.click();
    await expect(chords).toHaveAttribute('aria-pressed', 'false');

    await page.getByTestId('solo-drums').click();
    await expect(drums).toHaveAttribute('aria-pressed', 'true');
    await expect(chords).toHaveAttribute('aria-pressed', 'false');

    await page.getByTestId('solo-drums').click();
    // the hand-muted chord part is still muted — solo did not overwrite it
    await expect(chords).toHaveAttribute('aria-pressed', 'false');
    await expect(drums).toHaveAttribute('aria-pressed', 'true');
  });

  test('soloing one part mutes the others', async ({ page }) => {
    await page.getByTestId('solo-bass').click();
    await expect(page.getByTestId('mix-bass')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('mix-drums')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('mix-chords')).toHaveAttribute('aria-pressed', 'false');

    // solo is exclusive: soloing another part moves it rather than adding
    await page.getByTestId('solo-drums').click();
    await expect(page.getByTestId('mix-drums')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('mix-bass')).toHaveAttribute('aria-pressed', 'false');
  });

  test('the mixer reaches every tab, and lives in the dock on a phone', async ({ page }) => {
    const tabs = page.getByTestId('desktop-tabs');
    for (const t of ['circle', 'chords', 'bass', 'learn']) {
      await tabs.getByRole('tab', { name: t }).click();
      await expect(page.getByTestId('mixer')).toBeVisible();
    }
  });
});

test.describe('mixer on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('rides in the dock panel with the tempo slider', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('mixer')).toBeHidden();
    await page.getByTestId('dock-bar').click();
    await expect(page.getByTestId('mixer')).toBeVisible();
    await page.getByTestId('mix-bass').click();
    await expect(page.getByTestId('mix-bass')).toHaveAttribute('aria-pressed', 'false');
  });
});
