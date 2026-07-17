import { describe, it, expect } from 'vitest';
import { buildDiagram, fretTab, type Diagram } from './fretpatterns';

const pcs = (d: Diagram) => new Set(d.midis.map((m) => m % 12));

describe('fret pattern diagrams', () => {
  it('anchors minor pentatonic box 1 to the key root on the low E', () => {
    const { cards } = fretTab('Fretboard Boxes', 9); // A
    const box1 = cards.find((c) => c.id === 'pent1')!;
    const d = box1.diagrams[0];
    expect(d.startFret).toBe(5); // A on the low E string
    // every note is in A minor pentatonic: A C D E G
    expect([...pcs(d)].sort((a, b) => a - b)).toEqual([0, 2, 4, 7, 9]);
    // the root dots really are As
    d.dots.filter((x) => x.label === 'R').forEach((x) => {
      const stringMidis = [64, 59, 55, 50, 45, 40]; // display rows, top first
      expect((stringMidis[x.row] + d.frets[x.col]) % 12).toBe(9);
    });
  });

  it('keeps every box inside the C minor pentatonic pitch set', () => {
    const { cards } = fretTab('Fretboard Boxes', 0); // C
    for (const id of ['pent1', 'pent2', 'pent3', 'pent4', 'pent5', 'bassminpent']) {
      const d = cards.find((c) => c.id === id)!.diagrams[0];
      // C minor pentatonic: C Eb F G Bb
      for (const p of pcs(d)) expect([0, 3, 5, 7, 10]).toContain(p);
      expect(d.startFret).toBeGreaterThanOrEqual(0);
      expect(d.frets[d.frets.length - 1]).toBeLessThanOrEqual(15);
    }
  });

  it('major boxes and major pentatonic stay in the major pitch sets', () => {
    const { cards } = fretTab('Fretboard Boxes', 0); // C
    const majScale = [0, 2, 4, 5, 7, 9, 11];
    for (const id of ['majroot6', 'majroot5']) {
      const d = cards.find((c) => c.id === id)!.diagrams[0];
      for (const p of pcs(d)) expect(majScale).toContain(p);
    }
    for (const id of ['majpent1', 'bassmajpent']) {
      const d = cards.find((c) => c.id === id)!.diagrams[0];
      for (const p of pcs(d)) expect([0, 2, 4, 7, 9]).toContain(p);
    }
  });

  it('CAGED shapes climb the neck in order and stay in the major triad', () => {
    const { cards } = fretTab('CAGED', 0); // C
    const at = (id: string) => cards.find((c) => c.id === id)!.diagrams[0];
    expect(at('cagC').startFret).toBe(0);
    expect(at('cagA').startFret).toBe(3);
    expect(at('cagG').startFret).toBe(5);
    expect(at('cagE').startFret).toBe(8);
    expect(at('cagD').startFret).toBe(10);
    for (const id of ['cagC', 'cagA', 'cagG', 'cagE', 'cagD']) {
      for (const p of pcs(at(id))) expect([0, 4, 7]).toContain(p); // C E G only
    }
    // in its home key the C grip is open — the barre falls on the nut and is dropped
    expect(at('cagC').barres).toHaveLength(0);
    // as a barre chord in D, the same grip keeps its barre
    const dKey = fretTab('CAGED', 2).cards.find((c) => c.id === 'cagC')!.diagrams[0];
    expect(dKey.barres).toHaveLength(1);
  });

  it('movable shapes never sit at the nut', () => {
    // A one-dot movable shape anchored on E: tonic E would land at fret 0
    const d = buildDiagram(
      { inst: 'guitar', anchorS: 0, anchorF: 0, movable: true, dots: [{ s: 0, f: 0, role: 'R' }] },
      4, 'chord',
    );
    expect(d.startFret).toBe(12);
  });
});
