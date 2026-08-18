// Fretboard + piano view builders: turn the current lighting info into
// renderable rows/keys. The instruments show WHICH notes are in the chord —
// every position of every chord tone, named — and deliberately not a fingering:
// one prescribed grip per chord was both misleading and wrong more often than
// it was right.
import { spell } from '../engine/theory';
import type { WorkbenchStore } from '../store.svelte';
import type { FretCell, FretRow, PianoKey, LitInfo } from './types';

export function buildInstruments(s: WorkbenchStore, { root, litSet, chordSet, dropSet }: LitInfo) {
  const ac = s.activeChord;
  const frets = 13;
  const cell = (open: number, f: number): FretCell => {
    const pc = (open + f) % 12;
    const isLit = litSet.has(pc);
    // A chord tone omitted by best-practice voicing: still shown, but greyed
    // and faded so it reads as "belongs to the chord, but not played".
    const isDrop = !isLit && dropSet.has(pc);
    let bg = '#3f6b5f', glow = 'none';
    if (pc === root) { bg = '#c2562e'; glow = '0 0 0 2px rgba(194,86,46,.3)'; }
    else if (isDrop) { bg = '#b3a68f'; }
    else if (!chordSet.has(pc)) { bg = '#97a59c'; }
    return { pc, showLit: isLit || isDrop, litOpacity: isDrop ? '0.4' : '1', note: spell(pc, s.tonicPc, s.scale), bg, glow };
  };
  const buildFret = (opens: number[], labels: string[]): FretRow[] =>
    opens.map((o, si) => ({ label: labels[si], cells: Array.from({ length: frets }, (_, f) => cell(o, f)) }));
  const bass = buildFret([43, 38, 33, 28], ['G', 'D', 'A', 'E']);
  const guitar = buildFret([64, 59, 55, 50, 45, 40], ['e', 'B', 'G', 'D', 'A', 'E']);
  const frets13 = Array.from({ length: frets }, (_, f) => ({ m: [3, 5, 7, 9].includes(f) ? String(f) : f === 12 ? '12' : '' }));

  // piano C3(48)..C5(72)
  const whiteSet = [0, 2, 4, 5, 7, 9, 11];
  const keys: Array<{ m: number; pc: number; white: boolean }> = [];
  for (let m = 48; m <= 72; m++) keys.push({ m, pc: m % 12, white: whiteSet.includes(m % 12) });
  const whiteCount = keys.filter((k) => k.white).length;
  const wp = 100 / whiteCount;
  let wIdx = 0;
  const pianoWhite: PianoKey[] = [], pianoBlack: PianoKey[] = [];
  keys.forEach((k) => {
    const isLit = litSet.has(k.pc), isRoot = k.pc === root;
    // Dropped chord tone: labelled but greyed, so it reads as "belongs, not played".
    const isDrop = !isLit && dropSet.has(k.pc);
    if (k.white) {
      pianoWhite.push({
        left: (wIdx * wp).toFixed(3), width: wp.toFixed(3), pc: k.pc,
        note: isLit || isDrop ? spell(k.pc, s.tonicPc, s.scale) : '',
        bg: isRoot ? '#c2562e' : isLit ? (chordSet.has(k.pc) ? '#3f6b5f' : '#97a59c') : isDrop ? '#e0d4bc' : '#f4ecdb',
        fg: isLit ? '#fff' : isDrop ? '#a2957a' : '#b9a988',
      });
      wIdx++;
    } else {
      pianoBlack.push({
        left: (wIdx * wp - wp * 0.31).toFixed(3), width: (wp * 0.62).toFixed(3), pc: k.pc,
        note: isLit || isDrop ? spell(k.pc, s.tonicPc, s.scale) : '',
        bg: isRoot ? '#c2562e' : isLit ? (chordSet.has(k.pc) ? '#3f6b5f' : '#97a59c') : isDrop ? '#5a4c39' : '#241a10',
        fg: isLit ? '#fff' : isDrop ? '#9a8a6d' : '#7a6a4e',
      });
    }
  });
  return { bass, guitar, frets13, pianoWhite, pianoBlack };
}
