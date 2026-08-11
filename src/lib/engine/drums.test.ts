import { describe, it, expect } from 'vitest';
import {
  DRUM_VOICES, DRUM_STEPS, DRUM_FAMILIES, DRUM_GENRES, DRUM_COUNT,
  drumTemplates, drumGenres, drumVoice, inKitOrder, composeGrid, emptyGrid,
  swingDelaySteps, stepAtElapsed, templateVoices, voicesInGrid, RHYTHM_CONCEPTS,
} from './drums';
import type { DrumSynthLayer } from './drums';

const voiceIds = new Set(DRUM_VOICES.map((v) => v.id));

describe('the kit', () => {
  it('is a table of instruments with unique ids and complete metadata', () => {
    expect(DRUM_VOICES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(DRUM_VOICES.map((v) => v.id)).size).toBe(DRUM_VOICES.length);
    DRUM_VOICES.forEach((v) => {
      expect(v.name).toBeTruthy();
      expect(v.short).toBeTruthy();
      expect(v.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(v.hint.length).toBeGreaterThan(10);
      expect(drumVoice(v.id)).toBe(v);
    });
  });

  it('every instrument declares a playable synth recipe', () => {
    DRUM_VOICES.forEach((v) => {
      expect(v.synth.length, v.id).toBeGreaterThan(0);
      // DRUM_VOICES is `as const`, so a layer that omits the optional `at`
      // has no such property in its literal type — widen to read it.
      v.synth.forEach((l: DrumSynthLayer) => {
        expect(l.dur).toBeGreaterThan(0);
        expect(l.amp).toBeGreaterThan(0);
        expect(l.amp).toBeLessThanOrEqual(1);
        expect(l.at === undefined || l.at >= 0).toBe(true);
        if (l.kind === 'noise') {
          expect(['lowpass', 'highpass', 'bandpass']).toContain(l.filter);
          expect(l.freq).toBeGreaterThan(20);
        } else {
          expect(l.f0).toBeGreaterThan(20);
          expect(l.f1).toBeGreaterThan(20);
        }
      });
    });
  });

  it('inKitOrder sorts any set of ids top-to-bottom, ignoring duplicates', () => {
    const order = DRUM_VOICES.map((v) => v.id);
    const picked = inKitOrder(['kick', 'chat', 'ride', 'kick']);
    expect(picked).toEqual(['ride', 'chat', 'kick']);
    expect(picked.map((id) => order.indexOf(id))).toEqual([...picked.map((id) => order.indexOf(id))].sort((a, b) => a - b));
  });
});

describe('rows for a pattern', () => {
  const rock = drumTemplates().find((t) => t.id === 'rock')!;

  it('templateVoices covers every instrument any layer touches, in kit order', () => {
    expect(templateVoices(rock)).toEqual(['chat', 'snare', 'kick']);
    drumTemplates().forEach((t) => {
      const rows = templateVoices(t);
      expect(rows.length, t.id).toBeGreaterThanOrEqual(2);
      // a row exists for every voice used by every layer, including the last
      t.layers.forEach((l) => l.add.forEach((p) => expect(rows, t.id).toContain(p.v)));
    });
  });

  it('voicesInGrid reports only what actually sounds', () => {
    expect(voicesInGrid(emptyGrid())).toEqual([]);
    expect(voicesInGrid(composeGrid(rock, 1))).toEqual(['kick']);
    expect(voicesInGrid(composeGrid(rock, 2))).toEqual(['snare', 'kick']);
    expect(voicesInGrid(composeGrid(rock, rock.layers.length))).toEqual(templateVoices(rock));
  });

  it('keeps every pattern to a readable number of rows', () => {
    drumTemplates().forEach((t) => expect(templateVoices(t).length, t.id).toBeLessThanOrEqual(7));
  });
});

describe('drum genres', () => {
  const tpls = drumTemplates();

  it('have unique ids and sit in a known family', () => {
    expect(DRUM_GENRES.length).toBeGreaterThanOrEqual(20);
    expect(new Set(DRUM_GENRES.map((g) => g.id)).size).toBe(DRUM_GENRES.length);
    DRUM_GENRES.forEach((g) => {
      expect(DRUM_FAMILIES).toContain(g.family);
      expect(g.blurb.length).toBeGreaterThan(40);
      expect(g.maschine.length).toBeGreaterThan(40);
    });
    expect(drumGenres()).toBe(DRUM_GENRES);
  });

  it('every family and every genre carries at least two variations', () => {
    DRUM_FAMILIES.forEach((f) => expect(DRUM_GENRES.some((g) => g.family === f)).toBe(true));
    DRUM_GENRES.forEach((g) => {
      expect(tpls.filter((t) => t.genre === g.id).length, g.id).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('drum templates', () => {
  const tpls = drumTemplates();
  const genreIds = new Set(DRUM_GENRES.map((g) => g.id));

  it('exist in quantity, with unique ids, all pointing at a real genre', () => {
    expect(tpls.length).toBeGreaterThanOrEqual(60);
    expect(new Set(tpls.map((t) => t.id)).size).toBe(tpls.length);
    tpls.forEach((t) => {
      expect(genreIds.has(t.genre), `${t.id} → ${t.genre}`).toBe(true);
      expect(t.name).toBeTruthy();
      expect(t.tip.length).toBeGreaterThan(60);
    });
  });

  it('names are unique inside each genre, so the variation picker is unambiguous', () => {
    DRUM_GENRES.forEach((g) => {
      const names = tpls.filter((t) => t.genre === g.id).map((t) => t.name);
      expect(new Set(names).size, g.id).toBe(names.length);
    });
  });

  it('use sane tempos and swing values', () => {
    tpls.forEach((t) => {
      expect(t.bpm).toBeGreaterThanOrEqual(60);
      expect(t.bpm).toBeLessThanOrEqual(200);
      expect(t.swing).toBeGreaterThanOrEqual(50);
      expect(t.swing).toBeLessThanOrEqual(75);
    });
  });

  it('every layer references real voices and in-range steps, accents ⊆ hits', () => {
    tpls.forEach((t) => {
      expect(t.layers.length).toBeGreaterThanOrEqual(3);
      t.layers.forEach((layer) => {
        expect(layer.name).toBeTruthy();
        expect(layer.why).toBeTruthy();
        expect(layer.add.length).toBeGreaterThan(0);
        layer.add.forEach((part) => {
          expect(voiceIds.has(part.v)).toBe(true);
          expect(part.on.length).toBeGreaterThan(0);
          part.on.forEach((s) => { expect(s).toBeGreaterThanOrEqual(0); expect(s).toBeLessThan(DRUM_STEPS); });
          (part.acc || []).forEach((s) => expect(part.on).toContain(s));
        });
      });
    });
  });

  it('never stacks open and closed hat on the same step (they choke each other)', () => {
    tpls.forEach((t) => {
      const g = composeGrid(t, t.layers.length);
      for (let s = 0; s < DRUM_STEPS; s++) {
        expect(g.chat[s] > 0 && g.ohat[s] > 0, `${t.id} step ${s}`).toBe(false);
      }
    });
  });

  it('every pattern actually plays something on the downbeat side of the bar', () => {
    tpls.forEach((t) => {
      const g = composeGrid(t, t.layers.length);
      const hits = DRUM_VOICES.reduce((n, v) => n + g[v.id].filter((c) => c > 0).length, 0);
      expect(hits, t.id).toBeGreaterThanOrEqual(6);
      expect(DRUM_VOICES.some((v) => g[v.id].slice(0, 8).some((c) => c > 0)), t.id).toBe(true);
    });
  });
});

describe('composeGrid', () => {
  const rock = drumTemplates().find((t) => t.id === 'rock')!;

  it('builds up cumulatively layer by layer', () => {
    const l1 = composeGrid(rock, 1);
    expect(l1.kick[0]).toBe(2); // accented downbeat
    expect(l1.snare.every((c) => c === 0)).toBe(true);
    const l2 = composeGrid(rock, 2);
    expect(l2.snare[4]).toBe(2);
    expect(l2.snare[12]).toBe(2);
    // layer 2 keeps layer 1 intact
    expect(l2.kick[0]).toBe(2);
    expect(l2.kick[8]).toBe(1);
  });

  it('zero layers yields an empty grid; full count fills every layer', () => {
    const none = composeGrid(rock, 0);
    DRUM_VOICES.forEach((v) => expect(none[v.id].every((c) => c === 0)).toBe(true));
    const full = composeGrid(rock, rock.layers.length);
    expect(full.snare[7]).toBe(1); // last layer's ghost note landed
  });

  it('emptyGrid covers every voice with 16 silent steps', () => {
    const g = emptyGrid();
    DRUM_VOICES.forEach((v) => {
      expect(g[v.id]).toHaveLength(DRUM_STEPS);
      expect(g[v.id].every((c) => c === 0)).toBe(true);
    });
  });
});

describe('swingDelaySteps', () => {
  it('is zero everywhere when straight', () => {
    for (let s = 0; s < 16; s++) expect(swingDelaySteps(s, 50)).toBe(0);
  });

  it('never delays downbeats', () => {
    [0, 4, 8, 12].forEach((s) => expect(swingDelaySteps(s, 66)).toBe(0));
  });

  it('lands off-beat 8ths on the triplet at 66⅔ and dotted at 75', () => {
    expect(swingDelaySteps(2, 200 / 3)).toBeCloseTo(2 / 3, 5); // step 2+2/3 of 4 = triplet
    expect(swingDelaySteps(2, 75)).toBeCloseTo(1, 5);          // step 3 of 4 = dotted
  });

  it('gives odd 16ths half the off-beat delay', () => {
    expect(swingDelaySteps(1, 75)).toBeCloseTo(0.5, 5);
    expect(swingDelaySteps(3, 75)).toBeCloseTo(0.5, 5);
  });
});

describe('stepAtElapsed (the playhead)', () => {
  const STEP = 0.125; // 16ths at 120bpm

  it('is silent before the bar starts', () => {
    expect(stepAtElapsed(-0.01, STEP, 50)).toBe(-1);
    expect(stepAtElapsed(0.4, 0, 50)).toBe(-1);
  });

  it('lights a step exactly when its hit sounds, never before', () => {
    for (let s = 0; s < DRUM_STEPS; s++) {
      expect(stepAtElapsed(s * STEP, STEP, 50)).toBe(s);
      // a hair earlier is still the step before — the ring must not lead the kit
      if (s > 0) expect(stepAtElapsed(s * STEP - 0.001, STEP, 50)).toBe(s - 1);
    }
  });

  it('holds the last step until the next bar re-anchors it', () => {
    expect(stepAtElapsed(DRUM_STEPS * STEP + 1, STEP, 50)).toBe(DRUM_STEPS - 1);
  });

  it('waits for a swung step instead of lighting on its grid line', () => {
    // At 66% the off-beat 8th plays 0.64 of a step late.
    const late = swingDelaySteps(2, 66) * STEP;
    expect(late).toBeGreaterThan(0);
    expect(stepAtElapsed(2 * STEP, STEP, 66)).toBe(1);            // grid line — not yet heard
    expect(stepAtElapsed(2 * STEP + late, STEP, 66)).toBe(2);     // the hit itself
  });

  it('agrees with the hit times it is drawn against, at every swing', () => {
    [50, 58, 66, 75].forEach((swing) => {
      for (let s = 0; s < DRUM_STEPS; s++) {
        const at = (s + swingDelaySteps(s, swing)) * STEP;
        expect(stepAtElapsed(at, STEP, swing), `step ${s} @ ${swing}%`).toBe(s);
      }
    });
  });
});

describe('rhythm concepts (Learn tab)', () => {
  it('have unique ids and valid demo parts', () => {
    expect(RHYTHM_CONCEPTS.length).toBeGreaterThanOrEqual(6);
    expect(new Set(RHYTHM_CONCEPTS.map((c) => c.id)).size).toBe(RHYTHM_CONCEPTS.length);
    RHYTHM_CONCEPTS.forEach((c) => {
      expect(c.text.length).toBeGreaterThan(80);
      expect(c.bpm).toBeGreaterThanOrEqual(60);
      expect(c.bpm).toBeLessThanOrEqual(200);
      c.demo.forEach((part) => {
        expect(voiceIds.has(part.v)).toBe(true);
        part.on.forEach((s) => { expect(s).toBeGreaterThanOrEqual(0); expect(s).toBeLessThan(DRUM_STEPS); });
        (part.acc || []).forEach((s) => expect(part.on).toContain(s));
      });
    });
  });

  it('DRUM_COUNT spells a full bar of 16ths', () => {
    expect(DRUM_COUNT).toHaveLength(16);
    expect(DRUM_COUNT[0]).toBe('1');
    expect(DRUM_COUNT[12]).toBe('4');
  });
});
