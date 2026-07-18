import { describe, it, expect } from 'vitest';
import {
  genReadTarget, makeKey, keyAlt, ledgerYs, stepY, stepRange, noteMidi, noteStep, noteName,
  STAFF_TOP, STAFF_BOTTOM,
  type ReadSettings,
} from './reading';
import { INTNAME } from './constants';

const base: ReadSettings = { level: 'note', clef: 'treble', range: 'staff', keyMode: 'c', accidentals: false, answer: 'name' };

describe('staff geometry', () => {
  it('anchors the clefs correctly: treble bottom line E4, bass top line A3', () => {
    expect(stepY('treble', noteStep({ letter: 2, octave: 4, alt: 0 }))).toBe(STAFF_BOTTOM); // E4
    expect(stepY('treble', noteStep({ letter: 3, octave: 5, alt: 0 }))).toBe(STAFF_TOP); // F5
    expect(stepY('bass', noteStep({ letter: 5, octave: 3, alt: 0 }))).toBe(STAFF_TOP); // A3
    expect(stepY('bass', noteStep({ letter: 4, octave: 2, alt: 0 }))).toBe(STAFF_BOTTOM); // G2
  });

  it('middle C takes one ledger line below the treble and one above the bass', () => {
    const c4 = noteStep({ letter: 0, octave: 4, alt: 0 });
    expect(ledgerYs('treble', c4)).toEqual([STAFF_BOTTOM + 10]);
    expect(ledgerYs('bass', c4)).toEqual([STAFF_TOP - 10]);
  });

  it('needs no ledger lines while on the staff', () => {
    const [lo, hi] = stepRange('treble', 'staff');
    for (let s = lo; s <= hi; s++) expect(ledgerYs('treble', s)).toEqual([]);
  });

  it('maps notes to MIDI correctly', () => {
    expect(noteMidi({ letter: 0, octave: 4, alt: 0 })).toBe(60); // C4
    expect(noteMidi({ letter: 5, octave: 3, alt: 0 })).toBe(57); // A3
    expect(noteMidi({ letter: 3, octave: 5, alt: 1 })).toBe(78); // F♯5
  });
});

describe('key signatures', () => {
  it('alters the right letters', () => {
    const g = makeKey(1, false); // G major: F♯
    expect(keyAlt(g, 3)).toBe(1);
    expect(keyAlt(g, 0)).toBe(0);
    const eb = makeKey(3, true); // E♭ major: B♭ E♭ A♭
    expect(keyAlt(eb, 6)).toBe(-1);
    expect(keyAlt(eb, 2)).toBe(-1);
    expect(keyAlt(eb, 5)).toBe(-1);
    expect(keyAlt(eb, 1)).toBe(0);
  });

  it('labels keys by their accidental count', () => {
    expect(makeKey(0, false).label).toBe('C major');
    expect(makeKey(2, false).label).toBe('D major · 2♯');
    expect(makeKey(4, true).label).toBe('A♭ major · 4♭');
  });
});

describe('note targets', () => {
  it('stays on the staff in staff range and draws no key signature in C mode', () => {
    for (let i = 0; i < 60; i++) {
      const t = genReadTarget(base);
      expect(t.staff.keyAcc).toEqual([]);
      const n = t.staff.notes[0];
      expect(n.y).toBeGreaterThanOrEqual(STAFF_TOP);
      expect(n.y).toBeLessThanOrEqual(STAFF_BOTTOM);
      expect(n.ledger).toEqual([]);
      expect(t.options).toContain(t.answer);
      expect(new Set(t.options).size).toBe(t.options.length);
    }
  });

  it('answer name matches the sounded pitch class', () => {
    const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    for (let i = 0; i < 60; i++) {
      const t = genReadTarget({ ...base, keyMode: 'all', range: 'ledger', clef: 'both' });
      const m = /^([A-G])(♯|♭)?$/.exec(t.answer)!;
      const pc = (PC[m[1]] + (m[2] === '♯' ? 1 : m[2] === '♭' ? -1 : 0) + 12) % 12;
      expect(t.pcs).toEqual([pc]);
      expect(t.midis[0] % 12).toBe(pc);
    }
  });

  it('respects the key-mode accidental caps', () => {
    for (let i = 0; i < 40; i++) {
      expect(genReadTarget({ ...base, keyMode: 'easy' }).staff.keyAcc.length).toBeLessThanOrEqual(3);
      expect(genReadTarget({ ...base, keyMode: 'all' }).staff.keyAcc.length).toBeLessThanOrEqual(6);
    }
  });

  it('inline accidentals only appear when asked for', () => {
    for (let i = 0; i < 40; i++) {
      expect(genReadTarget(base).staff.notes[0].acc).toBe('');
    }
    let seen = false;
    for (let i = 0; i < 80; i++) {
      const t = genReadTarget({ ...base, accidentals: true });
      if (t.staff.notes[0].acc) { seen = true; expect(t.answer.length).toBe(2); }
    }
    expect(seen).toBe(true);
  });
});

describe('interval targets', () => {
  it('names the true semitone distance and keeps both notes in range', () => {
    for (let i = 0; i < 80; i++) {
      const t = genReadTarget({ ...base, level: 'interval', keyMode: 'all', clef: 'both' });
      expect(t.midis.length).toBe(2);
      expect(t.midis[1]).toBeGreaterThan(t.midis[0]);
      expect(t.answer).toBe(INTNAME[t.midis[1] - t.midis[0]]);
      expect(t.options).toContain(t.answer);
      t.staff.notes.forEach((n) => expect(n.ledger).toEqual([]));
    }
  });

  it('offsets the upper head of a stacked second', () => {
    for (let i = 0; i < 200; i++) {
      const t = genReadTarget({ ...base, level: 'interval' });
      const [a, b] = t.staff.notes;
      if (Math.abs(a.y - b.y) === 5) expect(b.x).not.toBe(a.x);
      else expect(b.x).toBe(a.x);
    }
  });
});

describe('chord targets', () => {
  it('builds diatonic root-position stacks with a matching name', () => {
    const SUFFIXES = ['', 'm', '°', 'maj7', 'm7', '7', 'ø7'];
    for (let i = 0; i < 80; i++) {
      const t = genReadTarget({ ...base, level: 'chord', keyMode: 'all', clef: 'both' });
      expect([3, 4]).toContain(t.midis.length);
      for (let k = 1; k < t.midis.length; k++) expect(t.midis[k]).toBeGreaterThan(t.midis[k - 1]);
      const m = /^[A-G](♯|♭)?(.*)$/.exec(t.answer)!;
      expect(SUFFIXES).toContain(m[2]);
      expect(t.pcs.length).toBe(t.midis.length);
      expect(t.options).toContain(t.answer);
      expect(new Set(t.options).size).toBe(t.options.length);
      t.staff.notes.forEach((n) => expect(n.ledger).toEqual([]));
    }
  });
});
