import { describe, it, expect } from 'vitest';
import {
  DRUM_VOICES, DRUM_STEPS, DRUM_GROUPS, DRUM_COUNT,
  drumTemplates, composeGrid, emptyGrid, swingDelaySteps,
  RHYTHM_CONCEPTS,
} from './drums';

const voiceIds = new Set(DRUM_VOICES.map((v) => v.id));

describe('drum templates', () => {
  const tpls = drumTemplates();

  it('exist, with unique ids, and every group is represented', () => {
    expect(tpls.length).toBeGreaterThanOrEqual(10);
    expect(new Set(tpls.map((t) => t.id)).size).toBe(tpls.length);
    DRUM_GROUPS.forEach((g) => expect(tpls.some((t) => t.group === g)).toBe(true));
    tpls.forEach((t) => expect(DRUM_GROUPS).toContain(t.group));
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
