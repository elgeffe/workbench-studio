import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Record, on the audio clock, every oscillator start (with the frequency it
// was set to) and every frequency glide — enough to check that the drone's
// key changes and plucks land exactly on the click's beats.
type Rec = {
  starts: Array<{ freq: number; type: string; at: number }>;
  glides: Array<{ v: number; t: number }>;
};
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const rec: Rec = { starts: [], glides: [] };
    (window as unknown as { __rec: Rec }).__rec = rec;
    const lastSet = new WeakMap<AudioParam, number>();
    const freqs = new WeakSet<AudioParam>();
    const setValue = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function (this: AudioParam, v: number, t: number) {
      lastSet.set(this, v);
      return setValue.call(this, v, t);
    };
    const setTarget = AudioParam.prototype.setTargetAtTime;
    AudioParam.prototype.setTargetAtTime = function (this: AudioParam, v: number, t: number, c: number) {
      if (freqs.has(this)) rec.glides.push({ v, t });
      return setTarget.call(this, v, t, c);
    };
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (this: OscillatorNode, when?: number) {
      freqs.add(this.frequency);
      rec.starts.push({
        freq: lastSet.get(this.frequency) ?? this.frequency.value,
        type: this.type,
        at: when ?? this.context.currentTime,
      });
      return start.call(this, when as number);
    };
  });
}
const rec = (page: Page) => page.evaluate(() => (window as unknown as { __rec: Rec }).__rec);

// the metronome's click voices: accent 1600 Hz on downbeats, 1000 Hz on beats
const isAccent = (s: { freq: number; type: string }) => s.type === 'triangle' && s.freq === 1600;
const isClick = (s: { freq: number; type: string }) => s.type === 'triangle' && (s.freq === 1600 || s.freq === 1000);

test.describe('drone practice plan', () => {
  test.beforeEach(async ({ page }) => {
    await instrument(page);
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'metronome' }).click();
    await page.getByTestId('metronome-automation').getByRole('tab', { name: 'Plan' }).click();
    await expect(page.getByTestId('metronome-plan')).toBeVisible();
  });

  async function setBars(page: Page, bars: number) {
    const plan = page.getByTestId('metronome-plan');
    const n = await plan.locator('li').count();
    for (let i = 1; i <= n; i++) await plan.getByLabel(`Section ${i} bars`).fill(String(bars));
  }

  test('edits sections: add a fifth up, move, remove', async ({ page }) => {
    const plan = page.getByTestId('metronome-plan');
    await expect(plan.locator('li')).toHaveCount(4);
    await page.getByTestId('metronome-plan-add').click();
    await expect(plan.locator('li')).toHaveCount(5);
    // C G D A → E
    await expect(plan.getByLabel('Section 5 key')).toHaveValue('4');
    await plan.getByRole('button', { name: 'Move section 5 up' }).click();
    await expect(plan.getByLabel('Section 4 key')).toHaveValue('4');
    await plan.getByRole('button', { name: 'Remove section 1' }).click();
    await expect(plan.locator('li')).toHaveCount(4);
    await expect(plan.getByLabel('Section 1 key')).toHaveValue('7');
  });

  test('key changes are scheduled exactly on the click’s downbeats', async ({ page }) => {
    await setBars(page, 1);
    await page.locator('input[aria-label="Tempo in beats per minute"]').fill('300');
    await page.getByTestId('metronome-plan-drone').click();
    await page.getByTestId('metronome-play').click();
    // four one-bar sections at 300 BPM: 0.8 s each — run past two changes
    await expect(page.getByTestId('metronome-drone-now')).toContainText('D Major', { timeout: 5000 });
    await page.getByTestId('metronome-play').click();

    const r = await rec(page);
    const downbeats = r.starts.filter(isAccent).map((s) => s.at);
    expect(downbeats.length).toBeGreaterThan(2);
    // Warm Pad, root + 5th, mid register: G3 = 196 Hz, D3 = 146.8 Hz
    for (const hz of [196, 146.83]) {
      const changes = r.glides.filter((g) => Math.abs(g.v - hz) < 0.05);
      expect(changes.length, `a glide to ${hz} Hz`).toBeGreaterThan(0);
      for (const g of changes) {
        expect(downbeats.some((d) => Math.abs(d - g.t) < 1e-6), `${hz} Hz at ${g.t} is on a downbeat`).toBe(true);
      }
    }
  });

  test('the instruments warn a bar ahead, then follow the new key', async ({ page }) => {
    // first section C major for 2 bars, then G major
    await setBars(page, 2);
    await page.locator('input[aria-label="Tempo in beats per minute"]').fill('200');
    await page.getByTestId('metronome-plan-drone').click();
    await page.getByTestId('metronome-play').click();

    await expect(page.getByText('C Major · drone')).toBeVisible();
    await expect(page.getByTestId('metronome-plan-now')).toContainText('G Major in 2 bars');
    const sharp = page.locator('.pkey-black', { hasText: 'F#' });
    await expect(sharp).toHaveCount(0);

    // the last bar of C: the warning, with F# arriving on the piano
    await expect(page.getByText('C Major → G Major')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('metronome-plan-now')).toContainText('G Major next bar');
    await expect(sharp.first()).toBeVisible();

    // and then G major itself
    await expect(page.getByText('G Major · drone')).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId('metronome-drone-now')).toContainText('G Major');
    await page.getByTestId('metronome-play').click();
    await expect(page.getByText('G Major · drone')).toHaveCount(0);
  });

  test('the plan sets the click tempo per section', async ({ page }) => {
    await setBars(page, 1);
    const plan = page.getByTestId('metronome-plan');
    await plan.getByLabel('Section 1 BPM').fill('240');
    await plan.getByLabel('Section 2 BPM').fill('300');
    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-plan-now')).toContainText('section 2/4', { timeout: 4000 });
    await expect(page.locator('.live', { hasText: 'playing' })).toContainText('300');
    await page.getByTestId('metronome-play').click();
  });

  test('a plan set to stop ends the session when it runs out', async ({ page }) => {
    await setBars(page, 1);
    await page.locator('input[aria-label="Tempo in beats per minute"]').fill('300');
    await page.getByLabel('At the end').selectOption('once');
    await page.getByTestId('metronome-play').click();
    await expect(page.getByText('✓ Plan complete')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('metronome-play')).toHaveText(/START/);
    await expect(page.getByTestId('metronome-history').getByText(/Plan 4 sections/)).toBeVisible();
  });

  test('Tanpura plucks one string per beat, exactly on the click', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('tab', { name: 'Tanpura' }).click();
    await page.locator('input[aria-label="Tempo in beats per minute"]').fill('240');
    await page.getByTestId('metronome-plan-drone').click();
    await page.getByTestId('metronome-play').click();
    await page.waitForTimeout(1500);
    await page.getByTestId('metronome-play').click();

    const r = await rec(page);
    const beats = r.starts.filter(isClick).map((s) => s.at);
    const plucks = [...new Set(r.starts.filter((s) => s.type === 'sawtooth').map((s) => s.at))];
    expect(plucks.length).toBeGreaterThan(3);
    for (const t of plucks) {
      expect(beats.some((b) => Math.abs(b - t) < 1e-6), `pluck at ${t} is on a beat`).toBe(true);
    }
    // Pa, Sa, Sa, low Sa over C3: G2, C3, C3, C2
    const first = r.starts.filter((s) => s.type === 'sawtooth').filter((_, i) => i % 2 === 0).slice(0, 4);
    expect(first.map((s) => Math.round(s.freq))).toEqual([98, 131, 131, 65]);
  });

  test('a rhythmic drone keeps its own beat when played without the click', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('tab', { name: 'Tanpura' }).click();
    await page.getByTestId('metronome-drone-toggle').click();
    await page.waitForTimeout(1300); // 120 BPM: two or three plucks
    await page.getByTestId('metronome-drone-toggle').click();
    const r = await rec(page);
    const plucks = [...new Set(r.starts.filter((s) => s.type === 'sawtooth').map((s) => s.at))].sort();
    expect(plucks.length).toBeGreaterThanOrEqual(2);
    expect(plucks[1] - plucks[0]).toBeCloseTo(0.5, 3);
  });
});
