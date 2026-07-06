import { describe, it, expect } from 'vitest';
import { genEarTarget } from './ear';

describe('ear-training generator', () => {
  it('generates interval questions with four options including the answer', () => {
    for (let i = 0; i < 40; i++) {
      const t = genEarTarget('interval');
      expect(t.type).toBe('interval');
      if (t.type === 'interval') {
        expect(t.root).toBeGreaterThanOrEqual(55);
        expect(t.root).toBeLessThanOrEqual(64);
        expect(t.semis).toBeGreaterThanOrEqual(1);
        expect(t.semis).toBeLessThanOrEqual(12);
      }
      expect(t.options).toHaveLength(4);
      expect(t.options).toContain(t.answer);
      expect(new Set(t.options).size).toBe(4); // no duplicate options
    }
  });

  it('generates chord-quality questions', () => {
    for (let i = 0; i < 40; i++) {
      const t = genEarTarget('chord');
      expect(t.type).toBe('chord');
      expect(t.options).toHaveLength(4);
      expect(t.options).toContain(t.answer);
    }
  });

  it('generates progression questions with a chord sequence', () => {
    for (let i = 0; i < 40; i++) {
      const t = genEarTarget('prog');
      expect(t.type).toBe('prog');
      if (t.type === 'prog') {
        expect(t.seq.length).toBeGreaterThanOrEqual(3);
        expect(t.tonic).toBeGreaterThanOrEqual(0);
        expect(t.tonic).toBeLessThanOrEqual(11);
      }
      expect(t.options).toHaveLength(4);
      expect(t.options).toContain(t.answer);
    }
  });

  it('generates key-signature questions with a matching accidental count', () => {
    for (let i = 0; i < 60; i++) {
      const t = genEarTarget('keysig');
      expect(t.type).toBe('keysig');
      if (t.type === 'keysig') {
        expect(t.keyPc).toBeGreaterThanOrEqual(0);
        expect(t.keyPc).toBeLessThanOrEqual(11);
        expect(t.accidentals.length).toBeLessThanOrEqual(6);
        // every drawn accidental is a single sharp/flat glyph on the staff
        const glyphs = new Set(t.accidentals.map((a) => a.glyph));
        expect(glyphs.size).toBeLessThanOrEqual(1);
        // C major is the only signature with no accidentals
        if (t.accidentals.length === 0) expect(t.answer).toBe('C major');
      }
      expect(t.options).toHaveLength(4);
      expect(t.options).toContain(t.answer);
      expect(new Set(t.options).size).toBe(4);
    }
  });
});
