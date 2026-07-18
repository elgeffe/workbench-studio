// Fretboard + piano view builders: turn the current lighting info (and the
// jazz finger-overlay state) into renderable rows/keys.
import { gI, spell, jazzVoicing } from '../engine/theory';
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
    return { pc, showLit: isLit || isDrop, dot: false, barreThru: false, litOpacity: isDrop ? '0.4' : '1', finger: '', dotColor: '', note: spell(pc, s.tonicPc), bg, glow };
  };
  const buildFret = (opens: number[], labels: string[]): FretRow[] =>
    opens.map((o, si) => ({ label: labels[si], openDot: null, cells: Array.from({ length: frets }, (_, f) => cell(o, f)) }));
  const bass = buildFret([43, 38, 33, 28], ['G', 'D', 'A', 'E']);
  const guitar = buildFret([64, 59, 55, 50, 45, 40], ['e', 'B', 'G', 'D', 'A', 'E']);
  const frets13 = Array.from({ length: frets }, (_, f) => ({ m: [3, 5, 7, 9].includes(f) ? String(f) : f === 12 ? '12' : '' }));

  const roleColor = (r: string) => (({ R: '#c2562e', '3': '#3f6b5f', b3: '#3f6b5f', '7': '#b07d23', '5': '#97a59c', b5: '#97a59c', '9': '#7a5ea8', '11': '#7a5ea8', '13': '#7a5ea8' } as Record<string, string>)[r] || '#c2562e');
  const showFingerToggle = s.mode === 'workshop' && s.wsStyle === 'jazz';
  const overlayOn = showFingerToggle && s.fingerOn && !!ac;
  const pianoMark: Record<number, { color: string; finger: string }> = {};
  if (overlayOn && ac) {
    const fingerChord = s.jzSel >= 0 && s.jzChanges[s.jzSel] ? s.jzChanges[s.jzSel] : ac;
    const v = jazzVoicing(fingerChord, s.jzInv);
    v.guitar.forEach((n) => {
      const row = guitar[n.idx]; if (!row) return;
      if (n.fret === 0) { row.openDot = { color: roleColor(n.role) }; if (row.cells[0]) row.cells[0].showLit = false; }
      else { const c = row.cells[n.fret]; if (c) { c.dot = true; c.showLit = false; c.dotColor = roleColor(n.role); c.finger = String(n.finger); } }
    });
    if (v.gbarre) {
      for (let idx = v.gbarre.loIdx; idx <= v.gbarre.hiIdx; idx++) {
        const c = guitar[idx] && guitar[idx].cells[v.gbarre.fret];
        if (c && !c.dot) { c.barreThru = true; c.showLit = false; }
      }
    }
    v.bass.forEach((n) => {
      const row = bass[n.idx]; if (!row) return;
      if (n.fret === 0) { row.openDot = { color: roleColor(n.role) }; if (row.cells[0]) row.cells[0].showLit = false; }
      else { const c = row.cells[n.fret]; if (c) { c.dot = true; c.showLit = false; c.dotColor = roleColor(n.role); c.finger = String(n.finger); } }
    });
    v.piano.forEach((p) => { pianoMark[p.m] = { color: roleColor(p.role), finger: p.finger }; });
    [bass, guitar].forEach((inst) => inst.forEach((row) => row.cells.forEach((c) => { if (c.showLit) c.litOpacity = '0.22'; })));
  }

  // inversion selector
  const relA = ac ? gI(ac) : [];
  const invCount = relA.includes(10) || relA.includes(11) ? 4 : 3;
  const curInv = (((s.jzInv || 0) % invCount) + invCount) % invCount;
  const invOpts = ['Root', '1st', '2nd', '3rd'].slice(0, invCount).map((nm, i) => ({
    name: nm, i, bg: i === curInv ? '#3f6b5f' : '#fff', fg: i === curInv ? '#fff' : '#5c4a30', bd: i === curInv ? '#3f6b5f' : '#cbb792',
  }));

  // piano C3(48)..C5(72)
  const whiteSet = [0, 2, 4, 5, 7, 9, 11];
  const keys: Array<{ m: number; pc: number; white: boolean }> = [];
  for (let m = 48; m <= 72; m++) keys.push({ m, pc: m % 12, white: whiteSet.includes(m % 12) });
  const whiteCount = keys.filter((k) => k.white).length;
  const wp = 100 / whiteCount;
  let wIdx = 0;
  const pianoWhite: PianoKey[] = [], pianoBlack: PianoKey[] = [];
  keys.forEach((k) => {
    const isLit = litSet.has(k.pc), isRoot = k.pc === root, mk = pianoMark[k.m];
    // Dropped chord tone: labelled but greyed, so it reads as "belongs, not played".
    const isDrop = !isLit && dropSet.has(k.pc);
    const dim = overlayOn && isLit && !mk;
    if (k.white) {
      pianoWhite.push({
        left: (wIdx * wp).toFixed(3), width: wp.toFixed(3), pc: k.pc,
        note: isLit || isDrop ? spell(k.pc, s.tonicPc) : '',
        bg: dim ? '#e7d9bf' : isRoot ? '#c2562e' : isLit ? (chordSet.has(k.pc) ? '#3f6b5f' : '#97a59c') : isDrop ? '#e0d4bc' : '#f4ecdb',
        fg: dim ? '#c4b290' : isLit ? '#fff' : isDrop ? '#a2957a' : '#b9a988', dot: !!mk, dotColor: mk ? mk.color : '', finger: mk ? mk.finger : '',
      });
      wIdx++;
    } else {
      pianoBlack.push({
        left: (wIdx * wp - wp * 0.31).toFixed(3), width: (wp * 0.62).toFixed(3), pc: k.pc,
        note: isLit || isDrop ? spell(k.pc, s.tonicPc) : '',
        bg: dim ? '#4a3a28' : isRoot ? '#c2562e' : isLit ? (chordSet.has(k.pc) ? '#3f6b5f' : '#97a59c') : isDrop ? '#5a4c39' : '#241a10',
        fg: dim ? '#8c7a5e' : isLit ? '#fff' : isDrop ? '#9a8a6d' : '#7a6a4e', dot: !!mk, dotColor: mk ? mk.color : '', finger: mk ? mk.finger : '',
      });
    }
  });
  return { bass, guitar, frets13, pianoWhite, pianoBlack, showFingerToggle, overlayOn, invOpts };
}
