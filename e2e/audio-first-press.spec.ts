import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Regression: the store pre-generates an ear-training exercise at boot. It must
// NOT queue audio on the not-yet-resumed AudioContext, or that interval fires on
// the user's first gesture and plays on top of their first chord ("two chords at
// once"). We instrument oscillator scheduling and assert the first press produces
// exactly one burst of sound — the chord itself, nothing else.
test('first chord press plays only the chord, not the queued ear-training exercise', async ({ page }) => {
  await page.addInitScript(() => {
    const rec: Array<{ at: number }> = [];
    (window as unknown as { __osc: typeof rec }).__osc = rec;
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (this: OscillatorNode, when?: number) {
      try { rec.push({ at: this.context.currentTime }); } catch { /* noop */ }
      return start.call(this, when as number);
    };
  });

  await page.goto('/');
  await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();

  // Tap the first diatonic chord (I / C), then wait well past the point where
  // the boot ear-training interval (root, then +520ms, then +1100ms) would sound.
  await page.getByRole('button', { name: 'I C', exact: false }).first().click();
  await page.waitForTimeout(1600);

  const osc = await page.evaluate(() => (window as unknown as { __osc: Array<{ at: number }> }).__osc);
  expect(osc.length).toBeGreaterThan(0);

  // Every oscillator should have been scheduled in a single burst (the chord's
  // strum). A second burst hundreds of ms later would be the ear-training note.
  const first = osc[0].at;
  const stray = osc.filter((o) => Math.abs(o.at - first) > 0.05);
  expect(stray, `unexpected extra notes scheduled at ${stray.map((s) => s.at).join(', ')}`).toEqual([]);
});
