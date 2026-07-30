import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// The playhead is drawn against the moment a bar reaches the speakers, which is
// a scheduling lead plus the device's output latency behind the transport tick
// that queued it. A slow output makes that gap wide: the bar being drawn still
// has a step or two of tail left when the next bar is scheduled, so the new
// anchor has to wait its turn. It didn't, and the end of every bar — 4a first,
// then 4& — was never lit.
async function ringCycle(page: import('@playwright/test').Page, outputLatency: number) {
  await page.addInitScript((lat) => {
    Object.defineProperty(AudioContext.prototype, 'outputLatency', { get: () => lat });
  }, outputLatency);
  await page.goto('/');
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'drums' }).click();
  await expect(page.getByTestId('drum-grid')).toBeVisible();
  await page.getByTestId('studio-play').click();

  return page.evaluate(() => new Promise<number[]>((resolve) => {
    const seen: number[] = [];
    let last = -1;
    const t0 = performance.now();
    const tick = () => {
      let step = -1;
      document.querySelectorAll<HTMLElement>('[data-testid="drum-grid"] [aria-label*=" step "]').forEach((c) => {
        const shadow = c.style.boxShadow;
        if (shadow && shadow !== 'none') step = +c.getAttribute('aria-label')!.split(' step ')[1] - 1;
      });
      if (step !== last && step >= 0) { seen.push(step); last = step; }
      if (performance.now() - t0 < 6000) requestAnimationFrame(tick);
      else resolve(seen);
    };
    requestAnimationFrame(tick);
  }));
}

test.describe('drum playhead', () => {
  // 6s at the default 104bpm is ~2.5 bars, so a full cycle must appear whole.
  for (const latency of [0.03, 0.2]) {
    test(`lights all 16 steps and wraps, at ${latency * 1000}ms output latency`, async ({ page }) => {
      const seq = await ringCycle(page, latency);

      // every step of the bar gets its turn — 4a (15) included
      for (let s = 0; s < 16; s++) expect(seq, `step ${s} never lit`).toContain(s);

      // and it counts in order, wrapping 15 → 0 rather than skipping the tail
      const wrap = seq.indexOf(0, 1);
      expect(wrap, 'never wrapped to a second bar').toBeGreaterThan(0);
      expect(seq.slice(0, wrap)).toEqual([...Array(wrap).keys()]);
      expect(seq[wrap - 1]).toBe(15);
    });
  }
});
