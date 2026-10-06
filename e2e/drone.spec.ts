import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

// Record every oscillator the page starts, with the frequency it starts at, so
// the tests can check the drone really sounds — and at the right pitch.
async function recordOscillators(page: Page) {
  await page.addInitScript(() => {
    const rec: Array<{ freq: number; type: string }> = [];
    (window as unknown as { __osc: typeof rec }).__osc = rec;
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (this: OscillatorNode, when?: number) {
      try { rec.push({ freq: this.frequency.value, type: this.type }); } catch { /* noop */ }
      return start.call(this, when as number);
    };
  });
}
const oscillators = (page: Page) =>
  page.evaluate(() => (window as unknown as { __osc: Array<{ freq: number; type: string }> }).__osc);

test.describe('metronome drone', () => {
  test.beforeEach(async ({ page }) => {
    await recordOscillators(page);
    await page.goto('/');
    await expect(page.getByText('Workbench Studio')).toBeVisible();
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'metronome' }).click();
    await expect(page.getByTestId('metronome-drone')).toBeVisible();
  });

  test('plays a drone in the studio key and shows its scale on the instruments', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await expect(page.getByTestId('metronome-drone-key')).toContainText('C Major');
    await expect(page.getByText('C Major · drone')).toHaveCount(0);

    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Stop drone/);
    await expect(page.getByTestId('metronome-drone-now')).toContainText('C Major');
    // the instruments' header reads the drone's key and scale
    await expect(page.getByText('C Major · drone')).toBeVisible();
    await expect(page.getByText('C · D · E · F · G · A · B').first()).toBeVisible();
    await expect(drone.getByText('● C Major')).toBeVisible();

    expect((await oscillators(page)).length).toBeGreaterThan(0);

    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Play drone/);
    await expect(page.getByText('C Major · drone')).toHaveCount(0);
  });

  test('sounds the right pitch: a Pure Sine root in the mid register is C3', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('tab', { name: 'Pure Sine' }).click();
    await drone.getByRole('tab', { name: 'Root', exact: true }).click();
    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Stop drone/);

    const osc = await oscillators(page);
    const sines = osc.filter((o) => o.type === 'sine');
    expect(sines.map((o) => Math.round(o.freq * 100) / 100)).toEqual([130.81]);
    await page.getByTestId('metronome-drone-toggle').click();
  });

  test('its own key overrides the studio key and updates the instruments live', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByText('C Major · drone')).toBeVisible();

    await drone.getByRole('button', { name: 'Toggle drone follows studio key' }).click();
    await drone.getByLabel('Key', { exact: true }).selectOption({ label: 'D' });
    await drone.getByLabel('Scale', { exact: true }).selectOption({ label: 'Dorian' });

    await expect(page.getByText('D Dorian · drone')).toBeVisible();
    await expect(page.getByText('D · E · F · G · A · B · C').first()).toBeVisible();
    await expect(page.getByTestId('metronome-drone-now')).toContainText('D Dorian');
    await page.getByTestId('metronome-drone-toggle').click();
  });

  test('starts and stops with the metronome when asked to', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('button', { name: 'Toggle drone with metronome' }).click();

    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Stop drone/);
    await expect(page.getByText('C Major · drone')).toBeVisible();

    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Play drone/);
  });

  test('a drone started on its own outlives the click', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await drone.getByRole('button', { name: 'Toggle drone with metronome' }).click();
    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Stop drone/);

    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-play')).toHaveText(/STOP/);
    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Stop drone/);
    await page.getByTestId('metronome-drone-toggle').click();
  });

  test('customize sliders mark the preset tweaked and reset back', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await drone.getByText('Customize').click();
    await expect(drone.getByText('tweaked')).toHaveCount(0);
    await drone.getByLabel(/Brightness/).fill('0.9');
    await expect(drone.getByText('tweaked')).toBeVisible();
    await drone.getByRole('button', { name: 'Reset to preset' }).click();
    await expect(drone.getByText('tweaked')).toHaveCount(0);
  });

  test('switching presets while sounding rebuilds the voice', async ({ page }) => {
    const drone = page.getByTestId('metronome-drone');
    await page.getByTestId('metronome-drone-toggle').click();
    await expect(page.getByTestId('metronome-drone-toggle')).toHaveText(/Stop drone/);
    const before = (await oscillators(page)).length;
    await drone.getByRole('tab', { name: 'Nebula' }).click();
    await expect.poll(async () => (await oscillators(page)).some((o, i) => i >= before && o.type === 'sawtooth')).toBe(true);
    await page.getByTestId('metronome-drone-toggle').click();
  });
});
