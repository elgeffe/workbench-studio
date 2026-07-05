// Ear-training question generator. Pure (aside from Math.random) so it can be
// unit-tested for well-formed targets.

import { INTNAME, QLABEL } from './constants';

export type EarLevel = 'interval' | 'chord' | 'prog';

export interface IntervalTarget {
  type: 'interval';
  root: number;
  semis: number;
  answer: string;
  options: string[];
}
export interface ChordTarget {
  type: 'chord';
  rootPc: number;
  quality: string;
  answer: string;
  options: string[];
}
export interface ProgTarget {
  type: 'prog';
  tonic: number;
  seq: Array<[number, string]>;
  answer: string;
  options: string[];
}
export type EarTarget = IntervalTarget | ChordTarget | ProgTarget;

function rnd(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}
function shuffle<T>(a: T[]): T[] {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PROG_BANK: Array<{ label: string; ch: Array<[number, string]> }> = [
  { label: 'I–IV–V–I', ch: [[0, 'maj'], [5, 'maj'], [7, 'maj'], [0, 'maj']] },
  { label: 'I–V–vi–IV', ch: [[0, 'maj'], [7, 'maj'], [9, 'min'], [5, 'maj']] },
  { label: 'ii–V–I', ch: [[2, 'min7'], [7, 'dom7'], [0, 'maj7']] },
  { label: 'I–vi–IV–V', ch: [[0, 'maj'], [9, 'min'], [5, 'maj'], [7, 'maj']] },
  { label: 'i–♭VII–♭VI–V', ch: [[0, 'min'], [10, 'maj'], [8, 'maj'], [7, 'maj']] },
  { label: 'I–IV–I–V', ch: [[0, 'maj'], [5, 'maj'], [0, 'maj'], [7, 'maj']] },
];

export function genEarTarget(level: EarLevel): EarTarget {
  if (level === 'interval') {
    const root = rnd(55, 64);
    const semis = rnd(1, 12);
    const ans = INTNAME[semis];
    const pool = shuffle(Object.values(INTNAME).filter((n) => n !== ans)).slice(0, 3);
    return { type: 'interval', root, semis, answer: ans, options: shuffle([ans, ...pool]) };
  }
  if (level === 'chord') {
    const qs = ['maj', 'min', 'dim', 'aug', 'dom7', 'maj7', 'min7'];
    const q = qs[rnd(0, qs.length - 1)];
    const r = rnd(0, 11);
    const ans = QLABEL[q];
    const pool = shuffle(qs.filter((x) => x !== q).map((x) => QLABEL[x])).slice(0, 3);
    return { type: 'chord', rootPc: r, quality: q, answer: ans, options: shuffle([ans, ...pool]) };
  }
  const pick = PROG_BANK[rnd(0, PROG_BANK.length - 1)];
  const tonic = rnd(0, 11);
  const pool = shuffle(PROG_BANK.filter((b) => b.label !== pick.label).map((b) => b.label)).slice(0, 3);
  return { type: 'prog', tonic, seq: pick.ch, answer: pick.label, options: shuffle([pick.label, ...pool]) };
}
