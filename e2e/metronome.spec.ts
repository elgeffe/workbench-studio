import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test.describe('metronome tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('The Workbench')).toBeVisible();
    await page.getByTestId('desktop-tabs').getByRole('tab', { name: 'metronome' }).click();
    await expect(page.getByTestId('metronome-transport')).toBeVisible();
  });

  test('shows the transport, tracker, automation, mic and log cards', async ({ page }) => {
    await expect(page.getByTestId('metronome-bpm')).toHaveText('120');
    await expect(page.getByTestId('metronome-goal')).toBeVisible();
    await expect(page.getByTestId('metronome-automation')).toBeVisible();
    await expect(page.getByTestId('metronome-mic')).toBeVisible();
    await expect(page.getByTestId('metronome-sound')).toBeVisible();
    await expect(page.getByTestId('metronome-history')).toBeVisible();
  });

  test('nudge buttons change the tempo', async ({ page }) => {
    await page.getByRole('button', { name: '+5' }).click();
    await expect(page.getByTestId('metronome-bpm')).toHaveText('125');
    await page.getByRole('button', { name: '−1' }).click();
    await expect(page.getByTestId('metronome-bpm')).toHaveText('124');
  });

  test('automation modes reveal their settings', async ({ page }) => {
    const auto = page.getByTestId('metronome-automation');
    await auto.getByRole('tab', { name: 'Step' }).click();
    await expect(auto.getByLabel('Start BPM')).toBeVisible();
    await expect(auto.getByLabel('Every (bars)')).toBeVisible();

    await auto.getByRole('tab', { name: 'Ramp / time' }).click();
    await expect(auto.getByLabel('Over (seconds)')).toBeVisible();

    await auto.getByRole('tab', { name: 'Ramp / bars' }).click();
    await expect(auto.getByLabel('Over (bars)')).toBeVisible();

    // gap-click trainer settings appear once enabled
    await auto.getByRole('button', { name: 'Toggle gap-click trainer' }).click();
    await expect(auto.getByLabel('Play (bars)')).toBeVisible();
    await auto.getByRole('button', { name: 'Random' }).click();
    await expect(auto.getByLabel(/Mute chance/)).toBeVisible();
  });

  test('goal by bars shows a target and progress readout', async ({ page }) => {
    const goal = page.getByTestId('metronome-goal');
    await goal.getByRole('tab', { name: 'By bars' }).click();
    await expect(goal.getByLabel('Target — bars to play')).toHaveValue('32');
    await expect(goal.getByText('32 bars left')).toBeVisible();
  });

  test('start runs the click and counts bars; stop logs the session', async ({ page }) => {
    // fast tempo so a bar completes quickly (4 beats at 300 BPM = 0.8 s)
    const bpm = page.getByTestId('metronome-bpm');
    await page.locator('input[aria-label="Tempo in beats per minute"]').fill('300');
    await expect(bpm).toHaveText('300');

    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-play')).toHaveText(/STOP/);
    await expect(page.getByTestId('metronome-bars')).not.toHaveText('0', { timeout: 5000 });

    // let it run past the 1 s session-save threshold, then stop
    await page.waitForTimeout(1200);
    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-play')).toHaveText(/START/);
    await expect(page.getByTestId('metronome-history').getByText(/\d+ bars/).first()).toBeVisible();
  });

  test('the click keeps running while browsing other tabs', async ({ page }) => {
    await page.locator('input[aria-label="Tempo in beats per minute"]').fill('300');
    await page.getByTestId('metronome-play').click();
    await expect(page.getByTestId('metronome-play')).toHaveText(/STOP/);

    const tabs = page.getByTestId('desktop-tabs');
    await tabs.getByRole('tab', { name: 'circle' }).click();
    await expect(page.getByText('CIRCLE OF 5THS')).toBeVisible();
    await page.waitForTimeout(1000);
    await tabs.getByRole('tab', { name: 'metronome' }).click();

    await expect(page.getByTestId('metronome-play')).toHaveText(/STOP/);
    await expect(page.getByTestId('metronome-bars')).not.toHaveText('0');
    await page.getByTestId('metronome-play').click();
  });
});
