import { describe, it, expect } from 'vitest';
import { DRUM_VOICES } from '../engine/kit';
import {
  DEFAULT_DRUM_MAP, GROUPS, GROUP_BASE, PADS_PER_GROUP, PAD_LABELS,
  clampChannel, clampOctave, clampVel, padAt, padName, padNote, padTakenBy,
  MIDI_PARTS, sanitizeSettings, transposed, velocityFor,
  type DrumMap,
} from './map';

// The note map is the one thing here that has to match the hardware exactly:
// get it wrong and every pad is off by one, which sounds like a bad drum
// pattern rather than like a bug.
describe('pad addressing', () => {
  it('gives each group its documented octave', () => {
    expect(GROUP_BASE).toEqual({ A: 36, B: 48, C: 60, D: 72 });
  });

  it('covers 36–83 with no gap and no overlap between groups', () => {
    const notes = GROUPS.flatMap((group) =>
      PAD_LABELS.map((_, pad) => padNote({ group, pad })),
    ).sort((a, b) => a - b);
    expect(notes).toEqual(Array.from({ length: 48 }, (_, i) => 36 + i));
  });

  it('round-trips a note back to the pad it came from', () => {
    GROUPS.forEach((group) => {
      PAD_LABELS.forEach((_, pad) => {
        expect(padAt(padNote({ group, pad }))).toEqual({ group, pad });
      });
    });
  });

  it('reports notes outside the four groups as unaddressable', () => {
    expect(padAt(35)).toBeNull();
    expect(padAt(84)).toBeNull();
  });

  it('names pads in panel order, bottom row first', () => {
    // Pad 3 is "1", not "4" — the labels are the panel's, not an index.
    expect(padName({ group: 'A', pad: 0 })).toBe('A.');
    expect(padName({ group: 'A', pad: 3 })).toBe('A1');
    expect(padName({ group: 'D', pad: 11 })).toBe('D9');
  });
});

describe('the default map', () => {
  it('puts every mapped voice on group A', () => {
    Object.values(DEFAULT_DRUM_MAP).forEach((a) => expect(a?.group).toBe('A'));
  });

  it('never doubles two voices onto one pad', () => {
    const seen = new Set<number>();
    Object.values(DEFAULT_DRUM_MAP).forEach((a) => {
      if (!a) return;
      expect(seen.has(padNote(a)), padName(a)).toBe(false);
      seen.add(padNote(a));
    });
  });

  it('fills the group and leaves exactly the overflow unmapped', () => {
    const mapped = Object.keys(DEFAULT_DRUM_MAP).length;
    expect(mapped).toBe(PADS_PER_GROUP);
    expect(DRUM_VOICES.length).toBeGreaterThan(mapped); // the kit is deeper than a group
  });

  it('maps the kick and snare, which every pattern uses', () => {
    expect(DEFAULT_DRUM_MAP.kick).toBeDefined();
    expect(DEFAULT_DRUM_MAP.snare).toBeDefined();
  });
});

describe('padTakenBy', () => {
  const map: DrumMap = { kick: { group: 'A', pad: 3 }, snare: { group: 'A', pad: 4 } };

  it('finds the other voice sitting on a pad', () => {
    expect(padTakenBy(map, { group: 'A', pad: 4 }, 'kick')).toBe('snare');
  });
  it('does not report a voice as clashing with itself', () => {
    expect(padTakenBy(map, { group: 'A', pad: 3 }, 'kick')).toBeNull();
  });
  it('returns null for a free pad', () => {
    expect(padTakenBy(map, { group: 'B', pad: 3 }, 'kick')).toBeNull();
  });
});

// Clamping an out-of-range pitch would pile a whole bassline onto note 0 —
// one buzz instead of a line. Folding keeps the pitch class.
describe('transposed', () => {
  it('shifts by whole octaves', () => {
    expect(transposed(60, -1)).toBe(48);
    expect(transposed(60, 2)).toBe(84);
  });
  it('folds back into range instead of clamping, keeping the pitch class', () => {
    const low = transposed(4, -2);
    expect(low).toBeGreaterThanOrEqual(0);
    expect(low % 12).toBe(4);

    const high = transposed(120, 2);
    expect(high).toBeLessThanOrEqual(127);
    expect(high % 12).toBe(120 % 12);
  });
  it('leaves an in-range note alone at zero transpose', () => {
    expect(transposed(60, 0)).toBe(60);
  });
});

describe('velocity and range guards', () => {
  it('separates accents from ordinary hits', () => {
    const cfg = { vel: 80, velAccent: 127 };
    expect(velocityFor(false, cfg)).toBe(80);
    expect(velocityFor(true, cfg)).toBe(127);
  });
  it('never emits a zero velocity, which would read as a note-off', () => {
    expect(clampVel(0)).toBe(1);
    expect(clampVel(-40)).toBe(1);
    expect(clampVel(NaN)).toBe(1);
  });
  it('keeps channels and octaves inside their legal range', () => {
    expect(clampChannel(0)).toBe(1);
    expect(clampChannel(17)).toBe(16);
    expect(clampOctave(-9)).toBe(-4);
    expect(clampOctave(9)).toBe(4);
  });
});

describe('sanitizeSettings', () => {
  it('returns working defaults for nothing at all', () => {
    const s = sanitizeSettings(null);
    expect(s.drumMap).toEqual(DEFAULT_DRUM_MAP);
    expect(s.parts.drums.on).toBe(true);
  });

  it('never restores the armed state, so a reload cannot fire at stale hardware', () => {
    expect(sanitizeSettings({ enabled: true }).enabled).toBe(false);
  });

  it('keeps a voice the user deliberately unmapped', () => {
    // Stored as an explicit null — the default would otherwise come back and
    // silently re-map a pad the user cleared.
    const s = sanitizeSettings({ drumMap: { kick: null } });
    expect(s.drumMap.kick).toBeUndefined();
    expect(s.drumMap.snare).toEqual(DEFAULT_DRUM_MAP.snare); // untouched voices keep theirs
  });

  it('drops a malformed pad rather than throwing', () => {
    const s = sanitizeSettings({ drumMap: { kick: { group: 'Z', pad: 3 }, snare: { group: 'A', pad: 99 } } });
    expect(s.drumMap.kick).toBeUndefined();
    expect(s.drumMap.snare).toBeUndefined();
  });

  it('repairs out-of-range channels and octaves from an older file', () => {
    const s = sanitizeSettings({ parts: { bass: { on: true, channel: 44, octave: -12 } } });
    expect(s.parts.bass).toMatchObject({ on: true, portId: null, channel: 16, octave: -4 });
  });

  it('repairs an out-of-range velocity rather than sending a silent note', () => {
    const s = sanitizeSettings({ parts: { drums: { vel: 0, velAccent: 999 } } });
    expect(s.parts.drums.vel).toBe(1);
    expect(s.parts.drums.velAccent).toBe(127);
  });

  // Velocity used to be one global pair. Someone who tuned it should not have
  // to tune it again three times when it becomes per part.
  it('carries a pre-split global velocity onto every part', () => {
    const s = sanitizeSettings({ velNormal: 61, velAccent: 99 });
    MIDI_PARTS.forEach((p) => {
      expect(s.parts[p].vel, p).toBe(61);
      expect(s.parts[p].velAccent, p).toBe(99);
    });
  });

  it('prefers a part’s own velocity over the old global one', () => {
    const s = sanitizeSettings({ velNormal: 61, parts: { bass: { vel: 100 } } });
    expect(s.parts.bass.vel).toBe(100);
    expect(s.parts.drums.vel).toBe(61); // still inherits, having none of its own
  });

  it('falls back to defaults for a part the file does not mention', () => {
    const s = sanitizeSettings({ parts: { bass: { on: true } } });
    expect(s.parts.chords.channel).toBe(1);
    expect(s.parts.drums.on).toBe(true);
  });

  it('keeps each part pointed at its own output', () => {
    const s = sanitizeSettings({
      parts: { drums: { on: true, portId: 'ko2' }, chords: { on: true, portId: 'reface' } },
    });
    expect(s.parts.drums.portId).toBe('ko2');
    expect(s.parts.chords.portId).toBe('reface');
    expect(s.parts.bass.portId).toBeNull();
  });

  it('drops a non-string port rather than routing to nonsense', () => {
    const s = sanitizeSettings({ parts: { drums: { portId: 7 } } });
    expect(s.parts.drums.portId).toBeNull();
  });
});
