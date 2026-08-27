import { describe, it, expect } from 'vitest';
import { parseChord, parseChanges } from './symbols';
import { INT } from './constants';

const ints = (s: string) => parseChord(s)?.intervals;
const root = (s: string) => parseChord(s)?.rootPc;

describe('roots', () => {
  it('reads letters and accidentals', () => {
    expect(root('C')).toBe(0);
    expect(root('Bb7')).toBe(10);
    expect(root('F#m7')).toBe(6);
    expect(root('Dbmaj7')).toBe(1);
    expect(root('D♭Maj7')).toBe(1);
  });
  it('rejects things that are not chords', () => {
    expect(parseChord('')).toBeNull();
    expect(parseChord('%')).toBeNull();
    expect(parseChord('Hm7')).toBeNull();
    expect(parseChord('Cwobble')).toBeNull();
  });
});

describe('the same chord written every way a book writes it', () => {
  // The half-diminished chord is the one this app and the fake books disagree
  // about most, so it gets the full spread.
  it('parses every spelling of Em7b5 to one chord', () => {
    const want = [0, 3, 6, 10];
    for (const s of ['Em7b5', 'Em7♭5', 'Emin7(b5)', 'Eø7', 'Eø', 'E-7b5', 'Ehalfdim', 'Em7-5']) {
      expect(ints(s), s).toEqual(want);
      expect(root(s), s).toBe(4);
    }
  });
  it('parses every spelling of a major seventh', () => {
    for (const s of ['Cmaj7', 'CMaj7', 'CM7', 'CΔ7', 'CΔ', 'Cma7']) {
      expect(ints(s), s).toEqual(INT.maj7);
    }
  });
  it('parses every spelling of a minor seventh', () => {
    for (const s of ['Cm7', 'Cmin7', 'C-7', 'Cmi7']) {
      expect(ints(s), s).toEqual(INT.min7);
    }
  });
  it('keeps capital M major and lowercase m minor', () => {
    expect(ints('CM7')).toEqual(INT.maj7);
    expect(ints('Cm7')).toEqual(INT.min7);
  });
  it('parses diminished spellings', () => {
    for (const s of ['C°7', 'Cdim7', 'Cdiminished7']) expect(ints(s), s).toEqual(INT.dim7);
    expect(ints('C°')).toEqual(INT.dim);
  });
});

describe('alterations', () => {
  it('adds a flat ninth over the seventh', () => {
    expect(ints('A7(b9)')).toEqual([0, 4, 7, 10, 13]);
    expect(ints('A7b9')).toEqual([0, 4, 7, 10, 13]);
    expect(ints('A7♭9')).toEqual([0, 4, 7, 10, 13]);
  });
  it('reads a bare accidental after the letter as part of the root', () => {
    // Cb9 is genuinely ambiguous, and the root reading is the defensible one:
    // books write C7b9 when they mean the altered dominant.
    expect(root('Cb9')).toBe(11);
    expect(ints('Cb9')).toEqual(INT.dom9);
  });
  it('reads the older - and + figures', () => {
    expect(ints('C7-5')).toEqual([0, 4, 6, 10]);
    expect(ints('C7+9')).toEqual([0, 4, 7, 10, 15]);
    expect(ints('C-9'), 'a leading dash is minor, not a flat').toEqual(INT.min9);
  });
  it('displaces the ninth rather than sounding two of them', () => {
    expect(ints('C13b9')).toEqual([0, 4, 7, 10, 13, 21]);
    expect(ints('C13b9')).not.toContain(14);
  });
  it('reads sharp elevens and flat thirteens', () => {
    expect(ints('C7#11')).toContain(18);
    expect(ints('C7b13')).toContain(20);
    expect(ints('Cmaj7#11')).toEqual([0, 4, 7, 11, 18]);
  });
  it('expands the altered dominant shorthand', () => {
    const alt = ints('C7alt')!;
    expect(alt).toContain(13); // ♭9
    expect(alt).toContain(20); // ♭13
    expect(alt).not.toContain(7); // no natural fifth
  });
});

describe('other qualities', () => {
  it('reads sixths, sus and 6/9', () => {
    expect(ints('Cm6')).toEqual(INT.min6);
    expect(ints('C6')).toEqual(INT.maj6);
    expect(ints('C7sus4')).toEqual(INT.dom7sus);
    expect(ints('Csus')).toEqual(INT.sus4);
    expect(ints('C6/9')).toEqual([0, 4, 7, 9, 14]);
  });
  it('reads minor-major sevenths', () => {
    for (const s of ['Cm(maj7)', 'CmMaj7', 'Cminmaj7', 'C-maj7']) {
      expect(ints(s), s).toEqual([0, 3, 7, 11]);
    }
  });
  it('reads a slash bass without mistaking 6/9 for one', () => {
    expect(parseChord('C/G')?.bassPc).toBe(7);
    expect(parseChord('C/G')?.rootPc).toBe(0);
    expect(parseChord('C6/9')?.bassPc).toBeNull();
  });
});

describe('naming', () => {
  it('canonicalises onto the names the rest of the app uses', () => {
    // A typed Em7b5 must land on the Eø7 the wheel generates, or the same
    // chord would read as two different chords in two places.
    expect(parseChord('Em7b5')?.name).toBe('Eø7');
    expect(parseChord('Cmin7')?.name).toBe('Cm7');
    expect(parseChord('CM7')?.name).toBe('Cmaj7');
  });
  it('keeps the root spelled as the page spells it', () => {
    expect(parseChord('Bb7')?.name).toBe('B♭7');
    expect(parseChord('A#7')?.name).toBe('A♯7');
  });
  it('remembers what was typed', () => {
    expect(parseChord('Em7b5')?.typed).toBe('Em7♭5');
  });
  it('names altered chords by their figures', () => {
    expect(parseChord('A7(b9)')?.name).toBe('A7♭9');
  });
});

describe('reading a line off the page', () => {
  it('splits on bar lines and whitespace', () => {
    const out = parseChanges('Cm7 F7 | BbMaj7 EbMaj7');
    expect(out).toHaveLength(4);
    expect(out.map((c) => c?.name)).toEqual(['Cm7', 'F7', 'B♭maj7', 'E♭maj7']);
  });
  it('marks what it cannot read instead of guessing', () => {
    const out = parseChanges('Cm7 wat F7');
    expect(out.map((c) => c?.name ?? null)).toEqual(['Cm7', null, 'F7']);
  });
  it('reads the head of each of the three sheets', () => {
    const autumn = parseChanges('Cm7 F7 BbMaj7 EbMaj7 Am7b5 D7 Gm7');
    expect(autumn.every((c) => c !== null)).toBe(true);
    const bossa = parseChanges('Cm6 Fm7 Dm7b5 G7(b9) Cm6 Ebm7 Ab7 DbMaj7');
    expect(bossa.every((c) => c !== null)).toBe(true);
    const alone = parseChanges('Dm Em7b5 A7(b9) D Am7b5 D7(b9) Gm Bm7 E7 Gm7 C7 F F7 DMaj7');
    expect(alone.every((c) => c !== null)).toBe(true);
  });
});
