import { describe, it, expect } from 'vitest';
import { spell, cname, diatonicList, subsFor, jazzVoicing, invChord, mod12, gPcs } from './theory';
import { INT } from './constants';

describe('note spelling', () => {
  it('uses sharps for sharp keys and flats for flat keys', () => {
    expect(spell(1, 0)).toBe('C#'); // tonic C → sharps
    expect(spell(1, 5)).toBe('Db'); // tonic F → flats
    expect(spell(6, 6)).toBe('Gb'); // tonic Gb prefers flats
  });
  it('wraps pitch classes', () => {
    expect(spell(12, 0)).toBe('C');
    expect(mod12(-1)).toBe(11);
  });
});

describe('diatonic chords in C major', () => {
  const dia = diatonicList(0, 'ionian', 'triad');
  it('produces seven triads', () => {
    expect(dia).toHaveLength(7);
  });
  it('spells the I, ii, V and vii° correctly', () => {
    expect(dia[0]).toMatchObject({ rootPc: 0, name: 'C', roman: 'I', fn: 'T' });
    expect(dia[1]).toMatchObject({ rootPc: 2, name: 'Dm', roman: 'ii', fn: 'S' });
    expect(dia[4]).toMatchObject({ rootPc: 7, name: 'G', roman: 'V', fn: 'D' });
    expect(dia[6]).toMatchObject({ rootPc: 11, name: 'B°', roman: 'vii°', fn: 'D' });
  });
  it('adds sevenths when ext is "7"', () => {
    const sev = diatonicList(0, 'ionian', '7');
    expect(sev[0].name).toBe('Cmaj7');
    expect(sev[4].name).toBe('G7'); // V becomes a dominant 7
    expect(sev[1].name).toBe('Dm7');
  });
});

describe('chord naming', () => {
  it('names chords relative to the tonic', () => {
    expect(cname(0, 'maj', 0)).toBe('C');
    expect(cname(2, 'min7', 0)).toBe('Dm7');
    expect(cname(7, 'dom7', 0)).toBe('G7');
  });
});

describe('substitutions', () => {
  it('offers a tritone sub for dominant chords', () => {
    const subs = subsFor({ rootPc: 7, intervals: INT.dom7, fn: 'D' }, 0);
    expect(subs).toHaveLength(3);
    expect(subs[0].tag).toBe('TRITONE SUB');
    expect(subs[0].rootPc).toBe(1); // a tritone above G
    expect(subs[0].name).toBe('C#7');
  });
  it('offers relative/mediant subs for major chords', () => {
    const subs = subsFor({ rootPc: 0, intervals: INT.maj, fn: 'T' }, 0);
    expect(subs).toHaveLength(4);
    expect(subs[0].tag).toBe('RELATIVE vi');
    expect(subs[0].name).toBe('Am7');
  });
  it('returns nothing for a null chord', () => {
    expect(subsFor(null, 0)).toEqual([]);
  });
});

describe('voicings', () => {
  it('builds a complete jazz voicing for Cmaj7', () => {
    const voi = jazzVoicing({ rootPc: 0, intervals: INT.maj7 }, 0);
    expect(voi.guitar.length).toBeGreaterThanOrEqual(3);
    expect(voi.bass).toHaveLength(3);
    expect(voi.piano.length).toBeGreaterThanOrEqual(3);
    expect(voi.piano[0].role).toBe('R');
  });
  it('names inversions with a slash bass', () => {
    const root = invChord({ rootPc: 0, intervals: INT.maj, name: 'C' }, 0, 0);
    const first = invChord({ rootPc: 0, intervals: INT.maj, name: 'C' }, 1, 0);
    expect(root.name).toBe('C');
    expect(first.name).toContain('/');
  });
});

describe('pitch classes', () => {
  it('computes chord tones', () => {
    expect(gPcs({ rootPc: 0, intervals: INT.maj })).toEqual([0, 4, 7]);
    expect(gPcs({ rootPc: 7, intervals: INT.dom7 })).toEqual([7, 11, 2, 5]);
  });
});
