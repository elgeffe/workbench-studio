import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

async function openMetronome(page: Page) {
  await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'metronome' }).click();
  await expect(page.getByTestId('metronome-drone')).toBeVisible();
}

test.describe('drone: following the Chords progression', () => {
  test('sounds each chord’s root and lights its chord scale', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'chords' }).click();
    await page.getByPlaceholder(/Cm7 F7/).fill('Dm7 G7 Cmaj7');
    await page.getByTestId('add-typed').click();
    await expect(page.locator('[data-chip]')).toHaveCount(3);

    await openMetronome(page);
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('tab', { name: 'Chords' }).click();
    // the last chord entered is the selected one
    await expect(page.getByTestId('metronome-drone-key')).toContainText('Cmaj7 · C ionian');
    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByText('Cmaj7 · C ionian · drone')).toBeVisible();

    // play the progression: the drone walks the changes with it
    await page.getByTestId('studio-play').click();
    await expect(page.getByText('Dm7 · D dorian · drone')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('D · E · F · G · A · B · C').first()).toBeVisible();
    await expect(page.getByText('G7 · G mixolydian · drone')).toBeVisible({ timeout: 6000 });
    await page.getByTestId('studio-play').click();
    await page.getByTestId('metronome-drone-toggle').click();
  });

  test('the drone changes chord at the moment the studio’s chord sounds', async ({ page }) => {
    // Map every scheduled event to wall-clock time, so events on the studio's
    // and the metronome's separate audio clocks can be compared.
    await page.addInitScript(() => {
      const ev: Array<{ kind: 'start' | 'glide'; v: number; wall: number; ctx: BaseAudioContext }> = [];
      (window as unknown as { __ev: typeof ev }).__ev = ev;
      const wall = (c: BaseAudioContext, t: number) => performance.now() / 1000 + (t - c.currentTime);
      const freqs = new WeakSet<AudioParam>();
      const start = OscillatorNode.prototype.start;
      OscillatorNode.prototype.start = function (this: OscillatorNode, when?: number) {
        freqs.add(this.frequency);
        ev.push({ kind: 'start', v: this.frequency.value, wall: wall(this.context, when ?? this.context.currentTime), ctx: this.context });
        return start.call(this, when as number);
      };
      const setTarget = AudioParam.prototype.setTargetAtTime;
      AudioParam.prototype.setTargetAtTime = function (this: AudioParam, v: number, t: number, c: number) {
        if (freqs.has(this)) {
          // the param's context isn't exposed; the drone lives on the metronome's
          ev.push({ kind: 'glide', v, wall: performance.now() / 1000 + (t - (window as unknown as { __metCtx?: BaseAudioContext }).__metCtx!.currentTime), ctx: null as unknown as BaseAudioContext });
        }
        return setTarget.call(this, v, t, c);
      };
      const Ctor = window.AudioContext;
      let n = 0;
      // the metronome's context is the second one created (the studio's is first)
      window.AudioContext = class extends Ctor {
        constructor(...a: ConstructorParameters<typeof AudioContext>) {
          super(...a);
          if (++n === 2) (window as unknown as { __metCtx?: BaseAudioContext }).__metCtx = this;
        }
      } as typeof AudioContext;
    });
    await page.goto('/');
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'chords' }).click();
    await page.getByPlaceholder(/Cm7 F7/).fill('Dm7 G7 Cmaj7');
    await page.getByTestId('add-typed').click();
    // sound the studio once so its context exists first
    await page.locator('[data-chip]').first().click();
    await openMetronome(page);
    await page.getByTestId('metronome-drone').getByRole('tab', { name: 'Chords' }).click();
    await page.getByTestId('metronome-drone-toggle').click();
    await page.getByTestId('studio-play').click();
    await expect(page.getByText('G7 · G mixolydian · drone')).toBeVisible({ timeout: 6000 });
    await page.waitForTimeout(400);
    await page.getByTestId('studio-play').click();

    const r = await page.evaluate(() => {
      const w = window as unknown as { __ev: Array<{ kind: string; v: number; wall: number; ctx: BaseAudioContext }>; __metCtx: BaseAudioContext };
      const g3 = 196;
      const drone = w.__ev.filter((e) => e.kind === 'glide' && Math.abs(e.v - g3) < 0.05).map((e) => e.wall);
      // the studio's G7: its oscillators start at G (any octave) on the studio clock
      const chord = w.__ev
        .filter((e) => e.kind === 'start' && e.ctx !== w.__metCtx && [49, 98, 196, 392].some((f) => Math.abs(e.v - f) < 0.6))
        .map((e) => e.wall);
      return { drone, chord };
    });
    expect(r.drone.length, 'the drone glided to G').toBeGreaterThan(0);
    expect(r.chord.length, 'the studio played its G7').toBeGreaterThan(0);
    const gap = Math.min(...r.chord.map((c) => Math.abs(c - r.drone[0])));
    expect(gap, `drone vs chord: ${Math.round(gap * 1000)} ms apart`).toBeLessThan(0.015);
  });

  test('with no chords yet it says so and stays in the studio key', async ({ page }) => {
    await page.goto('/');
    await openMetronome(page);
    await page.getByTestId('metronome-drone').getByRole('tab', { name: 'Chords' }).click();
    await expect(page.getByText(/No chords yet/)).toBeVisible();
    await expect(page.getByTestId('metronome-drone-key')).toContainText('C Major');
  });
});

test.describe('drone: ready-made and saved plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await openMetronome(page);
    await page.getByTestId('metronome-automation').getByRole('tab', { name: 'Plan' }).click();
  });

  test('generates the modes from bright to dark on a chosen tonic', async ({ page }) => {
    const gen = page.getByTestId('metronome-plan-generate');
    await gen.getByText('Start from a ready-made plan').click();
    await gen.getByLabel('Plan', { exact: true }).selectOption({ label: 'Modes, bright to dark' });
    await expect(gen.getByLabel('Scale', { exact: true })).toHaveCount(0); // modes choose their own
    await gen.getByLabel('Start on').selectOption({ label: 'D' });
    await gen.getByLabel('Bars each').fill('2');
    await page.getByTestId('metronome-plan-generate-go').click();

    const plan = page.getByTestId('metronome-plan');
    await expect(plan.locator('li')).toHaveCount(7);
    await expect(plan.getByLabel('Section 1 key')).toHaveValue('2');
    await expect(plan.getByLabel('Section 1 scale')).toHaveValue('lydian');
    await expect(plan.getByLabel('Section 7 scale')).toHaveValue('locrian');
    await expect(plan.getByLabel('Section 3 bars')).toHaveValue('2');
  });

  test('generates a twelve-key circle of fourths in a chosen scale', async ({ page }) => {
    const gen = page.getByTestId('metronome-plan-generate');
    await gen.getByText('Start from a ready-made plan').click();
    await gen.getByLabel('Plan', { exact: true }).selectOption({ label: 'Circle of fourths' });
    await gen.getByLabel('Scale', { exact: true }).selectOption({ label: 'Dorian' });
    await page.getByTestId('metronome-plan-generate-go').click();
    const plan = page.getByTestId('metronome-plan');
    await expect(plan.locator('li')).toHaveCount(12);
    await expect(plan.getByLabel('Section 2 key')).toHaveValue('5');
    await expect(plan.getByLabel('Section 12 scale')).toHaveValue('dorian');
  });

  test('saves a plan by name, loads it back, deletes it — and it survives a reload', async ({ page }) => {
    const gen = page.getByTestId('metronome-plan-generate');
    await gen.getByText('Start from a ready-made plan').click();
    await gen.getByLabel('Plan', { exact: true }).selectOption({ label: 'Relative pairs' });
    await page.getByTestId('metronome-plan-generate-go').click();
    await expect(page.getByTestId('metronome-plan').locator('li')).toHaveCount(24);

    await page.getByLabel('Plan name').fill('Relatives');
    await page.getByRole('button', { name: 'Save plan' }).click();
    const saved = page.getByTestId('metronome-saved-plans');
    await expect(saved.getByRole('button', { name: /^Relatives/ })).toBeVisible();

    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByTestId('metronome-plan').locator('li')).toHaveCount(4);

    await page.reload();
    await openMetronome(page);
    await page.getByTestId('metronome-automation').getByRole('tab', { name: 'Plan' }).click();
    await saved.getByRole('button', { name: /^Relatives/ }).click();
    await expect(page.getByTestId('metronome-plan').locator('li')).toHaveCount(24);

    await saved.getByRole('button', { name: 'Delete plan Relatives' }).click();
    await expect(saved).toHaveCount(0);
  });
});

test.describe('drone: remembered settings and saved sounds', () => {
  test('keeps the drone and the working plan across a reload', async ({ page }) => {
    await page.goto('/');
    await openMetronome(page);
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('tab', { name: 'Nebula' }).click();
    await drone.getByRole('tab', { name: 'Triad' }).click();
    await drone.getByRole('tab', { name: 'Own key' }).click();
    await drone.getByLabel('Key', { exact: true }).selectOption({ label: 'F' });
    await page.getByTestId('metronome-automation').getByRole('tab', { name: 'Plan' }).click();
    await page.getByTestId('metronome-plan-add').click();
    await page.waitForTimeout(600); // settings are written a beat after the last change

    await page.reload();
    await openMetronome(page);
    await expect(drone.getByRole('tab', { name: 'Nebula' })).toHaveAttribute('aria-selected', 'true');
    await expect(drone.getByRole('tab', { name: 'Triad' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByTestId('metronome-drone-key')).toContainText('F Major');
    await page.getByTestId('metronome-automation').getByRole('tab', { name: 'Plan' }).click();
    await expect(page.getByTestId('metronome-plan').locator('li')).toHaveCount(5);
  });

  test('saves a tweaked sound, recalls it, and deletes it', async ({ page }) => {
    await page.goto('/');
    await openMetronome(page);
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('tab', { name: 'Bowed' }).click();
    await drone.getByText('Customize').click();
    await drone.getByLabel(/Brightness/).fill('0.15');
    await drone.getByLabel('Sound name').fill('Dark cello');
    await drone.getByRole('button', { name: 'Save sound' }).click();

    const mine = page.getByTestId('metronome-my-sounds');
    const chip = mine.getByRole('button', { name: 'Dark cello', exact: true });
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    // move away, then back via the saved sound
    await drone.getByRole('tab', { name: 'Warm Pad' }).click();
    await drone.getByRole('button', { name: 'Reset to preset' }).click();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');
    await chip.click();
    await expect(drone.getByRole('tab', { name: 'Bowed' })).toHaveAttribute('aria-selected', 'true');
    await expect(drone.getByLabel(/Brightness/)).toHaveValue('0.15');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await openMetronome(page);
    await expect(mine.getByRole('button', { name: 'Dark cello', exact: true })).toBeVisible();
    await mine.getByRole('button', { name: 'Delete sound Dark cello' }).click();
    await expect(mine).toHaveCount(0);
  });
});
