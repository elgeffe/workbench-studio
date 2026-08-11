import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

interface Sent { port: string; data: number[]; at: number }

// Web MIDI needs real hardware and a permission grant, so the ports are
// stubbed: what we are testing is that the studio's transport addresses the
// devices correctly — the right note numbers, on the right channel, out of the
// right socket — not that Chromium can talk to USB.
async function stubMidi(page: Page, opts: { ports?: string[] } = {}) {
  await page.addInitScript((names: string[]) => {
    const sent: Sent[] = [];
    (window as unknown as { __midi: Sent[] }).__midi = sent;
    const outputs = new Map<string, unknown>();
    names.forEach((name, i) => {
      const id = 'port-' + i;
      outputs.set(id, {
        id,
        name,
        state: 'connected',
        send(data: number[], at?: number) { sent.push({ port: name, data: [...data], at: at ?? -1 }); },
        clear() { (window as unknown as { __cleared: number }).__cleared = ((window as unknown as { __cleared?: number }).__cleared ?? 0) + 1; },
      });
    });
    (navigator as unknown as { requestMIDIAccess: () => Promise<unknown> }).requestMIDIAccess =
      () => Promise.resolve({ outputs, onstatechange: null });
  }, opts.ports ?? ['EP-133 K.O. II']);
}

const messages = (page: Page) => page.evaluate(() => (window as unknown as { __midi: Sent[] }).__midi);
const notesOn = (out: Sent[], port?: string) =>
  out.filter((m) => (m.data[0] & 0xf0) === 0x90 && (!port || m.port === port));

/** Open the panel and arm the connection. */
async function arm(page: Page) {
  await page.getByTestId('midi-button').click();
  await expect(page.getByTestId('midi-panel')).toBeVisible();
  await page.getByTestId('midi-arm').click();
  await expect(page.getByTestId('midi-status')).toHaveText('EP-133 K.O. II');
}

test('the drum grid plays out as K.O. II pads, wrapped in clock and start/stop', async ({ page }) => {
  await stubMidi(page);
  await page.goto('/');
  await arm(page);
  await page.getByTestId('midi-close').click();

  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(1400);

  const out = await messages(page);
  expect(out.length).toBeGreaterThan(0);

  // Transport: START, then a stream of 24-PPQN clock, all timestamped rather
  // than sent bare — an untimestamped clock is a clock that jitters.
  expect(out.some((m) => m.data[0] === 0xfa), 'no MIDI start').toBe(true);
  const clock = out.filter((m) => m.data[0] === 0xf8);
  expect(clock.length, 'no MIDI clock').toBeGreaterThan(24);
  expect(clock.every((m) => m.at > 0), 'clock sent without a timestamp').toBe(true);

  // Notes: the default map puts the kick on A1, which is 36 + 3.
  const noteOns = notesOn(out);
  expect(noteOns.length, 'no notes sent').toBeGreaterThan(0);
  expect(noteOns.every((m) => (m.data[0] & 0x0f) === 0), 'not all on channel 1').toBe(true);
  expect(noteOns.some((m) => m.data[1] === 39), 'kick never hit A1 (note 39)').toBe(true);
  // Every note lands inside the four groups: an off-by-one in the pad map
  // would show up here as a note the device has no pad for.
  expect(noteOns.every((m) => m.data[1] >= 36 && m.data[1] <= 83), 'a note fell outside groups A–D').toBe(true);
  // Velocity is never zero — that reads as a note-off and the pad stays silent.
  expect(noteOns.every((m) => m.data[2] > 0)).toBe(true);

  // Every note-on is matched by a note-off scheduled after it.
  const noteOffs = out.filter((m) => (m.data[0] & 0xf0) === 0x80);
  expect(noteOffs.length).toBeGreaterThanOrEqual(noteOns.length);

  // Stopping releases the device rather than leaving a pad held.
  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(200);
  const after = await messages(page);
  expect(after.some((m) => m.data[0] === 0xfc), 'no MIDI stop').toBe(true);
  const cleared = await page.evaluate(() => (window as unknown as { __cleared?: number }).__cleared ?? 0);
  expect(cleared, 'the queued bar was never dropped').toBeGreaterThan(0);
});

test('nothing goes out until the connection is armed', async ({ page }) => {
  await stubMidi(page);
  await page.goto('/');

  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(700);
  expect(await messages(page)).toEqual([]);

  await page.getByTestId('studio-play').click();
});

test('a part is silent on the wire until its strip is switched on', async ({ page }) => {
  await stubMidi(page);
  await page.goto('/');
  await arm(page);

  // Drums are on by default; bass is not, so a bassline must not leak out.
  await expect(page.getByTestId('midi-part-toggle-drums')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('midi-part-toggle-bass')).toHaveAttribute('aria-pressed', 'false');
  await page.getByTestId('midi-close').click();

  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('studio-play').click();

  const notes = notesOn(await messages(page)).map((m) => m.data[1]);
  expect(notes.length).toBeGreaterThan(0);
  // The bass would be sent chromatically an octave down — well below group A.
  expect(notes.every((n) => n >= 36), 'a pitched part leaked out while switched off').toBe(true);
});

test('remapping a voice moves it to the pad you picked', async ({ page }) => {
  await stubMidi(page);
  await page.goto('/');
  await arm(page);

  // Move the kick to group B, pad "5" — note 48 + 7 = 55.
  const row = page.getByTestId('midi-row-kick');
  await row.getByLabel('Kick group').selectOption('B');
  await row.getByLabel('Kick pad').selectOption('7');
  await expect(row.getByText('B5 · 55')).toBeVisible();

  await page.getByTestId('midi-close').click();
  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(1200);
  await page.getByTestId('studio-play').click();

  const notes = notesOn(await messages(page)).map((m) => m.data[1]);
  expect(notes, 'the kick did not move').toContain(55);
  expect(notes, 'the kick still fired its old pad').not.toContain(39);
});

test('the mapping survives a reload', async ({ page }) => {
  await stubMidi(page);
  await page.goto('/');
  await arm(page);
  await page.getByTestId('midi-row-snare').getByLabel('Snare group').selectOption('');

  await page.reload();
  await page.getByTestId('midi-button').click();
  const row = page.getByTestId('midi-row-snare');
  await expect(row.getByLabel('Snare group')).toHaveValue('');
  // Armed state, though, is deliberately not restored: a page that starts
  // firing at hardware the user has since unplugged is the worse default.
  await expect(page.getByTestId('midi-status')).toHaveText('Not connected');
});

// The reason routing is per part rather than per studio: a sampler takes the
// drums while a synth takes the harmony, on one transport and one clock.
test('two devices: drums to one output, chords and bass to the other', async ({ page }) => {
  await stubMidi(page, { ports: ['EP-133 K.O. II', 'reface CP'] });
  await page.goto('/');

  // Give the chords and the bass something to play.
  const tabs = page.getByTestId('desktop-tabs');
  await tabs.getByRole('tab', { name: 'drums' }).click();
  await page.getByTestId('drum-picker-summary').click();
  await page.getByTestId('drum-genres').getByRole('button', { name: /^Disco & Boogie\s+\d+$/ }).click();
  await page.getByTestId('drum-picker-loadall').click();

  await page.getByTestId('midi-button').click();
  await page.getByTestId('midi-arm').click();
  await expect(page.getByTestId('midi-status')).toHaveText('2 outputs');

  // Drums stay on the sampler; the harmony moves to the synth. The transposes
  // put the three parts in bands that cannot be confused for one another:
  // bass below 36, drum pads 36–47, chords above 83.
  for (const [part, octave] of [['chords', '+2'], ['bass', '-1']] as const) {
    const strip = page.getByTestId(`midi-part-${part}`);
    await page.getByTestId(`midi-part-toggle-${part}`).click();
    await strip.getByLabel(`${part.toUpperCase()} output`).selectOption({ label: 'reface CP' });
    await strip.getByLabel(`${part.toUpperCase()} octave transpose`).selectOption(octave);
  }
  await expect(page.getByTestId('midi-ports')).toContainText('CHORDS · BASS');

  await page.getByTestId('midi-close').click();
  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(2600);
  await page.getByTestId('studio-play').click();

  const out = await messages(page);
  const ko2 = notesOn(out, 'EP-133 K.O. II').map((m) => m.data[1]);
  const reface = notesOn(out, 'reface CP').map((m) => m.data[1]);

  expect(ko2.length, 'the sampler got no drums').toBeGreaterThan(0);
  expect(reface.length, 'the synth got no harmony').toBeGreaterThan(0);

  // Nothing crossed over: the sampler sees only pads.
  expect(ko2.every((n) => n >= 36 && n <= 47), `harmony leaked to the sampler: ${ko2.join()}`).toBe(true);
  // And the synth sees both halves of the harmony and no drums.
  expect(reface.some((n) => n > 83), 'no chords reached the synth').toBe(true);
  expect(reface.some((n) => n < 36), 'no bassline reached the synth').toBe(true);

  // One clock, both boxes — otherwise the two drift apart within a few bars.
  const clocked = new Set(out.filter((m) => m.data[0] === 0xf8).map((m) => m.port));
  expect([...clocked].sort()).toEqual(['EP-133 K.O. II', 'reface CP']);
  const started = new Set(out.filter((m) => m.data[0] === 0xfa).map((m) => m.port));
  expect(started.size, 'start did not reach both devices').toBe(2);
});

// Velocity is per part because the devices want different things: a sampled
// hit has to cut, and the same number on a weighted piano is a bang.
test('each part carries its own velocity to the wire', async ({ page }) => {
  await stubMidi(page, { ports: ['EP-133 K.O. II', 'reface CP'] });
  await page.goto('/');

  const tabs = page.getByTestId('desktop-tabs');
  await tabs.getByRole('tab', { name: 'drums' }).click();
  await page.getByTestId('drum-picker-summary').click();
  await page.getByTestId('drum-genres').getByRole('button', { name: /^Disco & Boogie\s+\d+$/ }).click();
  await page.getByTestId('drum-picker-loadall').click();

  await page.getByTestId('midi-button').click();
  await page.getByTestId('midi-arm').click();

  // Three distinct values, so every note-on says which part sent it.
  const drums = page.getByTestId('midi-part-drums');
  await drums.getByLabel('DRUMS velocity').fill('40');
  await drums.getByLabel('DRUMS accent velocity').fill('120');

  const bass = page.getByTestId('midi-part-bass');
  await page.getByTestId('midi-part-toggle-bass').click();
  await bass.getByLabel('BASS output').selectOption({ label: 'reface CP' });
  await bass.getByLabel('BASS velocity').fill('70');

  await page.getByTestId('midi-close').click();
  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(2400);
  await page.getByTestId('studio-play').click();

  const out = await messages(page);
  const drumVels = new Set(notesOn(out, 'EP-133 K.O. II').map((m) => m.data[2]));
  const bassVels = new Set(notesOn(out, 'reface CP').map((m) => m.data[2]));

  // The kit sends only its own two values, and the accent is distinguishable
  // from the ordinary hit — a single value would mean accents got flattened.
  expect([...drumVels].sort((a, b) => a - b)).toEqual([40, 120]);
  // The bass is untouched by the drum sliders.
  expect([...bassVels]).toEqual([70]);
});

test('an unrouted part says so rather than looking like it is playing', async ({ page }) => {
  await stubMidi(page, { ports: ['EP-133 K.O. II', 'reface CP'] });
  await page.goto('/');
  await page.getByTestId('midi-button').click();
  await page.getByTestId('midi-arm').click();

  const strip = page.getByTestId('midi-part-drums');
  await strip.getByLabel('DRUMS output').selectOption('');
  await expect(strip).toContainText('not routed');

  await page.getByTestId('midi-close').click();
  await page.getByTestId('studio-play').click();
  await page.waitForTimeout(900);
  await page.getByTestId('studio-play').click();
  expect(notesOn(await messages(page))).toEqual([]);
});

test('the panel says so when the browser has no Web MIDI', async ({ page }) => {
  await page.addInitScript(() => {
    // It lives on the prototype, so deleting it off the instance is a no-op.
    Object.defineProperty(Navigator.prototype, 'requestMIDIAccess', { value: undefined, configurable: true });
  });
  await page.goto('/');
  await page.getByTestId('midi-button').click();
  await expect(page.getByTestId('midi-status')).toHaveText('Web MIDI is not available in this browser');
  await page.getByTestId('midi-arm').click();
  await expect(page.getByTestId('midi-error')).toContainText('Chrome, Edge or Brave');
});

test('MIDI is not offered on a phone, where Safari cannot do it at all', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubMidi(page);
  await page.goto('/');
  await expect(page.getByTestId('midi-button')).toHaveCount(0);
});
