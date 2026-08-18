import { describe, it, expect } from 'vitest';
import {
  spell, cname, diatonicList, subsFor, invChord, mod12, gPcs,
  playedIntervals, playedPcs, droppedPcs, keyLabel, keySigStr, isEnharmonicTie,
  parentMajorPc, keyNameStr, scaleNotesStr,
} from './theory';
import { INT, SCALES, type ScaleId } from './constants';

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
  it('defaults to major, matching the spelling table this replaced', () => {
    const wasFlat = [5, 10, 3, 8, 1, 6];
    for (let pc = 0; pc < 12; pc++) {
      expect(spell(1, pc)).toBe(wasFlat.includes(pc) ? 'Db' : 'C#');
    }
  });
});

describe('enharmonic spelling follows the scale, not just the tonic', () => {
  // The five black keys, spelled the way each mode's key signature writes them.
  // Minor is sharper than major but not uniformly so: E♭ and B♭ stay flat in
  // both, which is why a blanket "sharps in minor" rule would be wrong.
  it('spells the black keys per the fewer-accidentals rule', () => {
    const major: Record<number, string> = { 1: 'Db', 3: 'Eb', 6: 'Gb', 8: 'Ab', 10: 'Bb' };
    const minor: Record<number, string> = { 1: 'C#', 3: 'Eb', 6: 'F#', 8: 'G#', 10: 'Bb' };
    for (const [pc, name] of Object.entries(major)) {
      expect(spell(+pc, +pc, 'ionian')).toBe(name);
    }
    for (const [pc, name] of Object.entries(minor)) {
      expect(spell(+pc, +pc, 'aeolian')).toBe(name);
    }
  });

  it('spells F# minor sharp and Gb major flat — the same pitch class', () => {
    expect(keyNameStr(6, 'ionian')).toBe('Gb Major');
    expect(keyNameStr(6, 'aeolian')).toBe('F# Minor');
    expect(scaleNotesStr(6, 'aeolian').split(' · ')[0]).toBe('F#');
  });

  it('gives harmonic and melodic minor the natural-minor signature', () => {
    for (const sc of ['aeolian', 'harmonic', 'melodic'] as ScaleId[]) {
      expect(spell(1, 1, sc)).toBe('C#');
      expect(keySigStr(1, sc)).toBe('4 ♯');
    }
  });

  it('reads a mode off its parent major', () => {
    expect(parentMajorPc(2, 'dorian')).toBe(0); // D dorian ← C major
    expect(keySigStr(2, 'dorian')).toBe('no ♯/♭');
    expect(parentMajorPc(6, 'aeolian')).toBe(9); // F# minor ← A major
    expect(keySigStr(6, 'aeolian')).toBe('3 ♯');
    expect(keySigStr(6, 'ionian')).toBe('6 ♯/♭');
  });

  it('flags only the six-accidental keys as genuine ties', () => {
    expect(isEnharmonicTie(6, 'ionian')).toBe(true); // F# / Gb major
    expect(isEnharmonicTie(3, 'aeolian')).toBe(true); // Eb / D# minor
    expect(isEnharmonicTie(6, 'aeolian')).toBe(false); // F# minor, plainly
    expect(isEnharmonicTie(1, 'ionian')).toBe(false); // Db major, plainly
    // Exactly one tie per scale — the wheel has one spot six steps out.
    for (const sc of Object.keys(SCALES) as ScaleId[]) {
      const ties = Array.from({ length: 12 }, (_, pc) => isEnharmonicTie(pc, sc)).filter(Boolean);
      expect(ties).toHaveLength(1);
    }
  });
});

describe('key picker labels', () => {
  // The bug this all started from: the picker's chip said F♯ while every note
  // the app spelled underneath it said Gb.
  it('labels every chip the way spell() writes that key', () => {
    for (const sc of Object.keys(SCALES) as ScaleId[]) {
      for (let pc = 0; pc < 12; pc++) {
        const [note, acc] = keyLabel(pc, sc);
        const plain = note + (acc === '♭' ? 'b' : acc === '♯' ? '#' : '');
        expect(plain).toBe(spell(pc, pc, sc));
      }
    }
  });
  it('splits the accidental off so the letters can line up', () => {
    expect(keyLabel(0, 'ionian')).toEqual(['C', '']);
    expect(keyLabel(6, 'ionian')).toEqual(['G', '♭']);
    expect(keyLabel(6, 'aeolian')).toEqual(['F', '♯']);
  });
});

describe('key signatures', () => {
  it('counts the accidentals of every major key', () => {
    const sigs = ['no ♯/♭', '5 ♭', '2 ♯', '3 ♭', '4 ♯', '1 ♭', '6 ♯/♭', '1 ♯', '4 ♭', '3 ♯', '2 ♭', '5 ♯'];
    sigs.forEach((sig, pc) => expect(keySigStr(pc, 'ionian')).toBe(sig));
  });
  it('counts them for minor keys off the relative major', () => {
    expect(keySigStr(9, 'aeolian')).toBe('no ♯/♭'); // A minor
    expect(keySigStr(0, 'aeolian')).toBe('3 ♭'); // C minor
    expect(keySigStr(10, 'aeolian')).toBe('5 ♭'); // Bb minor
    expect(keySigStr(8, 'aeolian')).toBe('5 ♯'); // G# minor
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

describe('best-practice note dropping for extended chords', () => {
  it('leaves triads and plain 7ths untouched', () => {
    expect(playedIntervals(INT.maj)).toEqual([0, 4, 7]);
    expect(playedIntervals(INT.dom7)).toEqual([0, 4, 7, 10]);
    expect(playedIntervals(INT.maj7)).toEqual([0, 4, 7, 11]);
    expect(playedIntervals(INT.min7)).toEqual([0, 3, 7, 10]);
  });

  it('drops the perfect 5th on 9th chords', () => {
    expect(playedIntervals(INT.dom9)).toEqual([0, 4, 10, 14]); // C9 → C E B♭ D
    expect(playedIntervals(INT.maj9)).toEqual([0, 4, 11, 14]);
    expect(playedIntervals(INT.min9)).toEqual([0, 3, 10, 14]);
  });

  it('keeps a diminished 5th on a half-diminished 9th (it defines the chord)', () => {
    expect(playedIntervals(INT.m9b5)).toEqual([0, 3, 6, 10, 14]);
  });

  it('drops the 3rd on a dominant/major 11th (the 11 clashes with the 3rd)', () => {
    expect(playedIntervals(INT.dom11)).toEqual([0, 10, 14, 17]); // no 3rd, no 5th
    expect(playedIntervals(INT.maj11)).toEqual([0, 11, 14, 17]);
  });

  it('keeps the 3rd on a minor 11th (a minor 3rd and 11 do not clash)', () => {
    expect(playedIntervals(INT.min11)).toEqual([0, 3, 10, 14, 17]);
  });

  it('drops the 11th on a 13th chord, keeping the guide-tone 3rd', () => {
    // a contiguously stacked dominant 13th: R 3 5 7 9 11 13
    const dom13full = [0, 4, 7, 10, 14, 17, 21];
    expect(playedIntervals(dom13full)).toEqual([0, 4, 10, 14, 21]); // 5th and 11th gone
    // the app's own dom13 table already omits the 11th; only the 5th drops
    expect(playedIntervals(INT.dom13)).toEqual([0, 4, 10, 14, 21]);
  });

  it('exposes the sounded and greyed-out pitch classes for the instruments', () => {
    const c9 = { rootPc: 0, intervals: INT.dom9 };
    expect(playedPcs(c9)).toEqual([0, 4, 10, 2]); // C E B♭ D
    expect(droppedPcs(c9)).toEqual([7]); // G is shown greyed, not played
  });
});
