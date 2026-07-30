import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Records [wall clock, audio-clock start] for every scheduled source, so a test
// can check where the music actually lands rather than when a timer fired. The
// wall clock identifies the scheduling burst: a bar is queued all at once.
type Ev = [number, number];
const INSTRUMENT = () => {
  (window as unknown as { __ev: Ev[] }).__ev = [];
  const patch = (proto: { start: (t?: number) => void }) => {
    const s = proto.start;
    proto.start = function (this: AudioScheduledSourceNode, t?: number) {
      if (typeof t === 'number') (window as unknown as { __ev: Ev[] }).__ev.push([performance.now(), t]);
      return s.call(this, t);
    };
  };
  patch(OscillatorNode.prototype);
  patch(AudioBufferSourceNode.prototype);
};

/** Bar start times: the earliest scheduled hit of each scheduling burst. */
function barStarts(ev: Ev[]): number[] {
  const bars: number[] = [];
  let burst: Ev[] = [];
  const flush = () => { if (burst.length) bars.push(Math.min(...burst.map((b) => b[1]))); };
  for (const e of ev) {
    if (burst.length && e[0] - burst[burst.length - 1][0] > 20) { flush(); burst = []; }
    burst.push(e);
  }
  flush();
  return bars;
}

async function startDrums(page: import('@playwright/test').Page) {
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).click();
  await expect(page.getByTestId('drum-grid')).toBeVisible();
  await page.getByTestId('studio-play').click();
}

test.describe('transport', () => {
  // The bug: each bar was anchored to `currentTime` at the moment a setInterval
  // happened to fire, so timer jitter landed straight on the loop seam — bars
  // came out up to 35ms early or late, irregularly. Bar starts must sit on an
  // exact grid no matter how the main thread behaves.
  test('loops bar after bar on an exact grid, even under main-thread load', async ({ page }) => {
    await page.addInitScript(INSTRUMENT);
    await page.goto('/');
    await startDrums(page);

    const ev: Ev[] = await page.evaluate(() => new Promise((resolve) => {
      const t0 = performance.now();
      // Keep the main thread busy: this is what used to shift the loop point.
      const burn = () => {
        const end = performance.now() + 20;
        while (performance.now() < end);
        if (performance.now() - t0 < 12000) setTimeout(burn, 30);
      };
      burn();
      setTimeout(() => resolve((window as unknown as { __ev: Ev[] }).__ev), 12000);
    }));

    const BAR = (4 * 60) / 104; // default tempo, 104bpm
    const bars = barStarts(ev);

    expect(bars.length, 'expected several bars in 12s').toBeGreaterThan(3);
    const gaps = bars.slice(1).map((b, i) => b - bars[i]);
    for (const gap of gaps) {
      // Exact to well under a millisecond — it is arithmetic on the audio
      // clock now, not a wall-clock timer.
      expect(Math.abs(gap - BAR) * 1000, `bar gap ${(gap * 1000).toFixed(1)}ms`).toBeLessThan(1);
    }
  });

  // A bar is queued in advance, so stopping has to silence what hasn't sounded
  // yet instead of letting the rest of the bar play out.
  test('stop silences the bar already queued', async ({ page }) => {
    await page.addInitScript(() => {
      const mk = AudioContext.prototype.createWaveShaper;
      AudioContext.prototype.createWaveShaper = function (...a: []) {
        const n = mk.apply(this, a);
        const an = this.createAnalyser();
        an.fftSize = 2048;
        n.connect(an);
        Object.assign(window, { __an: an, __buf: new Float32Array(an.fftSize) });
        return n;
      };
    });
    await page.goto('/');
    await startDrums(page);
    await page.waitForTimeout(1500); // mid-bar: the rest of it is already queued
    await page.getByTestId('studio-play').click();

    // Skip the first 250ms so the hit that had already started can decay, then
    // listen across what would have been the rest of the bar.
    const peak: number = await page.evaluate(() => new Promise((resolve) => {
      const w = window as unknown as { __an: AnalyserNode; __buf: Float32Array };
      let p = 0;
      const t0 = performance.now();
      const tick = () => {
        const el = performance.now() - t0;
        if (el > 250) {
          w.__an.getFloatTimeDomainData(w.__buf);
          for (const v of w.__buf) { const a = Math.abs(v); if (a > p) p = a; }
        }
        if (el < 1200) requestAnimationFrame(tick);
        else resolve(p);
      };
      requestAnimationFrame(tick);
    }));

    // Left queued, the kit would land several more hits in that window.
    expect(peak, 'the queued bar kept playing after stop').toBeLessThan(0.02);
  });
});
