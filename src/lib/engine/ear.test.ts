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
});
