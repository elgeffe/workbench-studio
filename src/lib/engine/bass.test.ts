import { describe, it, expect } from 'vitest';
import {
  BASS_GROUPS, BASS_PATTERNS, BASS_TRICKS, BASS_TOK_LABEL,
  bassRole, bassRootMidi, resolveBassStep, type BassStep,
} from './bass';
import { INT, type Chord } from './constants';

const ch = (rootPc: number, q: string): Chord => ({ rootPc, intervals: INT[q], fn: 'T' });

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

  it('every pattern is well-formed and belongs to a known group', () => {
    const ids = new Set<string>();
    BASS_PATTERNS.forEach((p) => {
      expect(ids.has(p.id)).toBe(false);
      ids.add(p.id);
      expect(BASS_GROUPS).toContain(p.group);
      expect(p.steps.length).toBeGreaterThan(0);
      validSteps(p.steps);
    });
  });

  it('every group has patterns', () => {
    BASS_GROUPS.forEach((g) => {
      expect(BASS_PATTERNS.some((p) => p.group === g)).toBe(true);
    });
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
