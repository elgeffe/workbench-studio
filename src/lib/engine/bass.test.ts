import { describe, it, expect } from 'vitest';
import {
  BASS_GENRES, BASS_PATTERNS, BASS_TRICKS, BASS_TOK_LABEL,
  bassGenreOf, bassPatternsIn, bassRole, bassRootMidi, resolveBassStep,
  bassBarNotes, bassChordIndexAt, bassFallbackChord, midiOctave, nextSounding,
  type BassCell, type BassStep,
} from './bass';
import { INT, type Chord } from './constants';
import { restChord } from './theory';

const ch = (rootPc: number, q: string): Chord => ({ rootPc, intervals: INT[q], fn: 'T' });

/** A 16-cell line with the given cells filled in. */
const line = (at: Record<number, BassCell>): BassCell[] =>
  Array.from({ length: 16 }, (_, s) => at[s] ?? null);

describe('bassRootMidi', () => {
  it('keeps every root inside the 4-string low register (E1..E♭2)', () => {
    for (let pc = 0; pc < 12; pc++) {
      const m = bassRootMidi(pc);
      expect(m).toBeGreaterThanOrEqual(28);
      expect(m).toBeLessThanOrEqual(39);
      expect((m - pc) % 12).toBe(0);
    }
  });
});

describe('resolveBassStep', () => {
  const C7 = ch(0, 'dom7');
  const F7 = ch(5, 'dom7');

  it('resolves the chord-aware third', () => {
    expect(resolveBassStep('3', ch(0, 'maj'), C7, 0)).toBe(bassRootMidi(0) + 4);
    expect(resolveBassStep('3', ch(0, 'min7'), C7, 0)).toBe(bassRootMidi(0) + 3);
  });

  it('resolves literal degrees relative to the chord root', () => {
    const base = bassRootMidi(0);
    expect(resolveBassStep('R', C7, F7, 0)).toBe(base);
    expect(resolveBassStep('b7', C7, F7, 0)).toBe(base + 10);
    expect(resolveBassStep('O', C7, F7, 0)).toBe(base + 12);
    expect(resolveBassStep('5_', C7, F7, 0)).toBe(base - 5);
  });

  it('approaches the NEXT chord root chromatically', () => {
    const nb = bassRootMidi(5);
    expect(resolveBassStep('A', C7, F7, 0)).toBe(nb - 1);
    expect(resolveBassStep('A+', C7, F7, 0)).toBe(nb + 1);
    expect(resolveBassStep('N', C7, F7, 0)).toBe(nb);
  });

  it('pedals the key tonic regardless of the sounding chord', () => {
    expect(resolveBassStep('T', F7, C7, 9)).toBe(bassRootMidi(9));
  });
});

describe('midiOctave', () => {
  it('numbers octaves in scientific pitch', () => {
    expect(midiOctave(60)).toBe(4);   // middle C
    expect(midiOctave(28)).toBe(1);   // low E on a 4-string
    expect(midiOctave(40)).toBe(2);
  });
});

describe('bassChordIndexAt', () => {
  it('holds one change for the whole bar', () => {
    for (let s = 0; s < 16; s++) expect(bassChordIndexAt(s, 2, false, 4)).toBe(2);
  });

  it('splits the bar between two changes on half-bar slots', () => {
    expect(bassChordIndexAt(7, 2, true, 4)).toBe(2);
    expect(bassChordIndexAt(8, 2, true, 4)).toBe(3);
  });

  it('wraps round the end of the progression', () => {
    expect(bassChordIndexAt(8, 3, true, 4)).toBe(0);
    expect(bassChordIndexAt(0, 5, false, 4)).toBe(1);
  });

  it('is safe on an empty progression', () => {
    expect(bassChordIndexAt(9, 0, true, 0)).toBe(0);
  });
});

describe('bassBarNotes', () => {
  const Cm7 = ch(0, 'min7'), F7 = ch(5, 'dom7');

  it('resolves each cell against the change sounding under it', () => {
    const notes = bassBarNotes(line({ 0: { d: 'R' }, 8: { d: 'R' } }), [Cm7, F7], 0, true, 0);
    expect(notes[0].midi).toBe(bassRootMidi(0)); // first half is Cm7
    expect(notes[8].midi).toBe(bassRootMidi(5)); // second half has moved to F7
    expect(notes[0].chordIdx).toBe(0);
    expect(notes[8].chordIdx).toBe(1);
  });

  it('walks an approach note into the change that follows its own', () => {
    const notes = bassBarNotes(line({ 14: { d: 'A' } }), [Cm7, F7], 0, false, 0);
    expect(notes[14].midi).toBe(bassRootMidi(5) - 1);
  });

  it('gives ghosts and rests no pitch, and keeps every step in the bar', () => {
    const notes = bassBarNotes(line({ 2: { g: true } }), [Cm7, F7], 0, false, 0);
    expect(notes).toHaveLength(16);
    expect(notes.map((n) => n.s)).toEqual([...Array(16).keys()]);
    expect(notes[2].g).toBe(true);
    expect(notes[2].midi).toBeUndefined();
    expect(notes[5].d).toBeUndefined();
    expect(notes[5].midi).toBeUndefined();
  });

  it('leaves the line unresolved when there are no changes to resolve against', () => {
    const notes = bassBarNotes(line({ 0: { d: 'R' } }), [], 0, false, 0);
    expect(notes[0].midi).toBeUndefined();
  });
});

describe('bassFallbackChord', () => {
  it('is the key’s own dominant 7th, named for the key', () => {
    const c = bassFallbackChord(6);
    expect(c.rootPc).toBe(6);
    expect(c.intervals).toEqual(INT.dom7);
    expect(c.name).toBe('Gb7'); // a flat key spells itself flat
  });
});

describe('bassRole', () => {
  it('classifies ghosts, roots, chord tones, colours and approaches', () => {
    expect(bassRole({ s: 0, g: true })).toBe('ghost');
    expect(bassRole({ s: 0, d: 'R' })).toBe('root');
    expect(bassRole({ s: 0, d: 'O' })).toBe('root');
    expect(bassRole({ s: 0, d: 'b7' })).toBe('chord');
    expect(bassRole({ s: 0, d: '6' })).toBe('color');
    expect(bassRole({ s: 0, d: 'A' })).toBe('approach');
    expect(bassRole({ s: 0, d: 'N' })).toBe('approach');
  });
});

describe('the groove library', () => {
  const validSteps = (steps: BassStep[]) => {
    const seen = new Set<number>();
    steps.forEach((st) => {
      expect(st.s).toBeGreaterThanOrEqual(0);
      expect(st.s).toBeLessThanOrEqual(15);
      expect(seen.has(st.s)).toBe(false); // one event per 16th
      seen.add(st.s);
      if (st.g) expect(st.d).toBeUndefined();
      else {
        expect(st.d).toBeDefined();
        expect(BASS_TOK_LABEL[st.d!]).toBeDefined();
      }
    });
  };

  it('every pattern is well-formed and belongs to a known genre', () => {
    const ids = new Set<string>();
    const genreIds = BASS_GENRES.map((g) => g.id);
    BASS_PATTERNS.forEach((p) => {
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
      expect(genreIds).toContain(p.genre);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.tip.length).toBeGreaterThan(0);
      expect(p.steps.length).toBeGreaterThan(0);
      validSteps(p.steps);
    });
  });

  // The bass workbench and the drum groovebox share one genre taxonomy, so a
  // genre offered in the picker must never open onto an empty shelf.
  it('every genre in the shared taxonomy carries basslines', () => {
    BASS_GENRES.forEach((g) => {
      expect(bassPatternsIn(g.id).length).toBeGreaterThan(0);
    });
  });

  it('resolves a pattern back to the genre shelf it lives on', () => {
    BASS_PATTERNS.forEach((p) => expect(bassGenreOf(p.id)).toBe(p.genre));
    expect(bassGenreOf(null)).toBe(BASS_GENRES[0].id);
    expect(bassGenreOf('custom')).toBe(BASS_GENRES[0].id);
  });

  it('every trick has a unique id and a playable demo', () => {
    const ids = new Set<string>();
    BASS_TRICKS.forEach((tk) => {
      expect(ids.has(tk.id)).toBe(false);
      ids.add(tk.id);
      validSteps(tk.demo);
    });
  });

  it('every pattern resolves to real notes over a real progression', () => {
    const prog = [ch(0, 'min7'), ch(5, 'dom9'), ch(7, 'dom7'), ch(9, 'maj7')];
    BASS_PATTERNS.forEach((p) => {
      prog.forEach((c, i) => {
        p.steps.forEach((st) => {
          if (st.g) return;
          const m = resolveBassStep(st.d!, c, prog[(i + 1) % prog.length], 0);
          expect(m).toBeGreaterThanOrEqual(23); // playable low end
          expect(m).toBeLessThanOrEqual(52);    // octave pops top out at E3
        });
      });
    });
  });
});

describe('a silent slot', () => {
  const REST = restChord();

  it('finds the next slot that actually sounds, wrapping round', () => {
    const chs = [ch(0, 'min7'), REST, REST, ch(5, 'dom7')];
    expect(nextSounding(chs, 0)).toBe(3);
    expect(nextSounding(chs, 3)).toBe(0); // wraps to the top of the loop
    expect(nextSounding([REST, REST], 0)).toBe(0); // nothing sounds anywhere
  });

  it('drops the line out under a rest', () => {
    // Half-bar slots: Cm7 for the first beat and a half, silence for the rest.
    const chs = [ch(0, 'min7'), REST];
    const notes = bassBarNotes(line({ 0: { d: 'R' }, 8: { d: 'R' } }), chs, 0, true, 0);
    expect(notes[0].midi).toBeDefined();
    expect(notes[8].midi).toBeUndefined(); // over the rest — nothing to play
    expect(notes[8].d).toBeUndefined();
  });

  it('silences a ghost note over a rest too', () => {
    const notes = bassBarNotes(line({ 8: { g: true } }), [ch(0, 'min7'), restChord()], 0, true, 0);
    expect(notes[8].g).toBeUndefined();
  });

  it('walks through the silence to the change on the far side of it', () => {
    // 'A' approaches the NEXT chord's root from a semitone below. With a rest
    // in between, "next" is the chord after the silence — F, so E.
    const chs = [ch(0, 'min7'), restChord(), ch(5, 'dom7')];
    const notes = bassBarNotes(line({ 15: { d: 'A' } }), chs, 0, false, 0);
    expect(notes[15].midi).toBe(resolveBassStep('A', chs[0], chs[2], 0));
  });
});

