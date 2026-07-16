// Pure music-theory helpers. Faithful ports of the original Workbench methods,
// rewritten as standalone functions that take explicit state (tonic pitch
// class, scale id, extension) instead of reading `this.state`.

import {
  CS, CF, MAJOR, SCALES, INT, SUF, DIA_TRI, DIA_SEV, ROMAN, ROMAN7, FN,
  type Chord, type Fn, type ScaleId,
} from './constants';

export const mod12 = (n: number): number => ((n % 12) + 12) % 12;

export function prefFlat(tonicPc: number): boolean {
  return [5, 10, 3, 8, 1].includes(tonicPc) || tonicPc === 6;
}

export function spell(pc: number, tonicPc: number): string {
  pc = mod12(pc);
  return prefFlat(tonicPc) ? CF[pc] : CS[pc];
}

export function pcs(r: number, q: string): number[] {
  return INT[q].map((i) => (r % 12 + i) % 12);
}

export function cname(r: number, q: string, tonicPc: number): string {
  return spell(r, tonicPc) + SUF[q];
}

export function gI(ch: Chord): number[] {
  return ch.intervals || (ch.quality ? INT[ch.quality] : undefined) || [0, 4, 7];
}

export function gPcs(ch: Chord): number[] {
  return gI(ch).map((i) => mod12(ch.rootPc + i));
}

// Best-practice voicing: which chord tones actually *sound*. Once a chord
// reaches the 9th or beyond, textbook voicings omit tones that muddy the sound
// or clash — the chord's name is never touched, only the notes we play:
//   • the perfect 5th is dropped as soon as a 9th is present. It is harmonically
//     redundant and just thickens the middle, so a plain C9 sounds C–E–B♭–D.
//   • a natural 11th sits a ♭9 above a major 3rd — a harsh clash. On an 11th
//     chord we drop the 3rd so the 11 rings clean (the classic dominant-11 /
//     "sus" colour); on a 13th chord we keep the guide-tone 3rd and drop the
//     clashing 11th instead.
// Altered / characteristic tones (♭5, ♯5, ♯11, ♭13) are always kept — they
// define the chord. Triads and plain 7ths are returned untouched.
export function playedIntervals(intervals: number[]): number[] {
  const reduce = (iv: number) => iv % 12;
  const hasExtension = intervals.some((iv) => iv >= 12); // a 9th or higher is stacked on
  const has13 = intervals.some((iv) => iv >= 12 && (reduce(iv) === 8 || reduce(iv) === 9));
  const nat11 = intervals.find((iv) => iv >= 12 && reduce(iv) === 5);
  const maj3 = intervals.find((iv) => iv < 12 && reduce(iv) === 4);
  const perf5 = intervals.find((iv) => iv < 12 && reduce(iv) === 7);
  const drop = new Set<number>();
  if (hasExtension && perf5 !== undefined) drop.add(perf5);
  if (nat11 !== undefined && maj3 !== undefined) {
    if (has13) drop.add(nat11); // 13th chord — keep the 3rd, drop the 11th
    else drop.add(maj3); // plain 11th chord — drop the 3rd, keep the 11th
  }
  return drop.size ? intervals.filter((iv) => !drop.has(iv)) : intervals;
}

// Pitch classes actually sounded, after best-practice note dropping.
export function playedPcs(ch: Chord): number[] {
  return playedIntervals(gI(ch)).map((i) => mod12(ch.rootPc + i));
}

// Pitch classes that belong to the chord but are dropped from the voicing —
// shown greyed-out on the instruments so you can still see they belong.
export function droppedPcs(ch: Chord): number[] {
  const played = new Set(playedPcs(ch));
  return [...new Set(gPcs(ch))].filter((pc) => !played.has(pc));
}

export function gMidis(ch: Chord): number[] {
  if (ch.midis) return ch.midis;
  const base = 48 + ch.rootPc;
  return [base - 12, ...playedIntervals(gI(ch)).map((i) => base + i)];
}

export function keyNameStr(tonicPc: number, scale: ScaleId): string {
  return spell(tonicPc, tonicPc) + ' ' + SCALES[scale].short;
}

export function scaleNotesStr(tonicPc: number, scale: ScaleId): string {
  const SI = SCALES[scale].int;
  return SI.map((i) => spell((tonicPc + i) % 12, tonicPc)).join(' · ');
}

export function relMinorStr(tonicPc: number): string {
  return spell((tonicPc + 9) % 12, tonicPc) + ' minor';
}

export function chordMidis(rootPc: number, quality: string): number[] {
  const base = 48 + rootPc;
  const top = INT[quality].map((i) => base + i);
  return [base - 12, ...top];
}

// ---- diatonic chord generation ----

function triadSuf(q: string): string {
  return ({ maj: '', min: 'm', dim: '°', aug: '+', majb5: '(♭5)', mins5: 'm(♯5)' } as Record<string, string>)[q] || '';
}
function triadQual(t3: number, t5: number): string {
  if (t3 === 4 && t5 === 7) return 'maj';
  if (t3 === 3 && t5 === 7) return 'min';
  if (t3 === 3 && t5 === 6) return 'dim';
  if (t3 === 4 && t5 === 8) return 'aug';
  if (t3 === 4 && t5 === 6) return 'majb5';
  if (t3 === 3 && t5 === 8) return 'mins5';
  return 'maj';
}
function sevenSuf(q: string, t7: number): string {
  if (q === 'maj') return t7 === 10 ? '7' : 'maj7';
  if (q === 'min') return t7 === 11 ? 'm(maj7)' : 'm7';
  if (q === 'dim') return t7 === 9 ? '°7' : 'ø7';
  if (q === 'aug') return t7 === 10 ? '+7' : '+maj7';
  return 'maj7';
}
function extSuf(q: string, t7: number, ext: string): string {
  if (q === 'maj') return (t7 === 10 ? '' : 'maj') + ext;
  if (q === 'min') return 'm' + ext;
  if (q === 'dim') return 'ø' + ext;
  if (q === 'aug') return '+' + ext;
  return ext;
}

export interface DiatonicChord extends Chord {
  rootPc: number;
  intervals: number[];
  name: string;
  roman: string;
  fn: Fn;
  degLabels: string[];
}

export function diatonicList(tonicPc: number, scale: ScaleId, ext: string): DiatonicChord[] {
  const t = tonicPc;
  const counts: Record<string, number> = { triad: 3, '7': 4, '9': 5, '11': 6, '13': 7 };
  const count = counts[ext] || 3;
  const SI = SCALES[scale].int;
  const allDeg = ['R', '3', '5', '7', '9', '11', '13'];
  const baseNum = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return SI.map((deg, i) => {
    const r = (t + deg) % 12;
    const rootSemi = SI[i];
    const intervals: number[] = [];
    for (let j = 0; j < count; j++) {
      const idx = i + 2 * j;
      const abs = SI[idx % 7] + 12 * Math.floor(idx / 7);
      intervals.push(abs - rootSemi);
    }
    const q = triadQual(intervals[1], intervals[2]);
    const t7 = intervals[3];
    let suffix: string;
    if (ext === 'triad') suffix = triadSuf(q);
    else if (ext === '7') suffix = sevenSuf(q, t7);
    else suffix = extSuf(q, t7, ext);
    const diff = SI[i] - MAJOR[i];
    const acc = diff < 0 ? '♭' : diff > 0 ? '♯' : '';
    let num = baseNum[i];
    if (q === 'min' || q === 'dim' || q === 'mins5') num = num.toLowerCase();
    const roman = acc + num + (q === 'dim' ? '°' : '') + (q === 'aug' ? '+' : '');
    return { rootPc: r, intervals, name: spell(r, tonicPc) + suffix, roman, fn: FN[i], degLabels: allDeg.slice(0, count) };
  });
}

// ---- substitutions ----

export interface Sub extends Chord {
  tag: string;
  why: string;
}

function inferFamily(intervals: number[]): string {
  const has = (x: number) => intervals.includes(x);
  const third = has(4) ? 'maj' : has(3) ? 'min' : 'none';
  const dim5 = has(6) && !has(7);
  if (third === 'min' && dim5) return 'dim';
  if (third === 'maj' && has(10)) return 'dom';
  if (third === 'maj') return 'maj';
  if (third === 'min') return 'min';
  return 'maj';
}

export function subsFor(ch: Chord | null, tonicPc: number): Sub[] {
  if (!ch) return [];
  const r = ch.rootPc;
  const fn = ch.fn || 'T';
  const fam = inferFamily(gI(ch));
  const mk = (iv: number, q: string, tag: string, why: string): Sub => {
    const rp = mod12(r + iv);
    return { rootPc: rp, intervals: INT[q], quality: q, name: spell(rp, tonicPc) + SUF[q], roman: '', tag, why, fn };
  };
  if (fam === 'dom') return [
    mk(6, 'dom7', 'TRITONE SUB', 'Shares the very same tritone (its 3rd & ♭7). The root slides down a half-step into the tonic — slick chromatic bass.'),
    mk(0, 'dom7sus', 'SUS', 'Suspend the 3rd (4 instead of 3). Softens the pull; hang on the sus, then resolve it down a step.'),
    mk(4, 'dim7', '7♭9 / DIM', 'Stack a diminished 7th on the 3rd — the sound of a 7♭9, a darker and tenser dominant.'),
  ];
  if (fam === 'maj') return [
    mk(9, 'min7', 'RELATIVE vi', 'Shares two of its notes — a softer, minor stand-in for the tonic (I → vi).'),
    mk(4, 'min7', 'MEDIANT iii', 'Also shares two notes; an airy, unresolved tonic substitute (I → iii).'),
    mk(0, 'maj7', 'EXTEND maj7', 'Add the major 7th for a lush, jazzy resting chord in place of the plain triad.'),
    mk(0, 'min', 'PARALLEL minor', 'Swap to the parallel minor for a sudden emotional shadow.'),
  ];
  if (fam === 'min') return [
    mk(3, 'maj7', 'RELATIVE ♭III', 'Shares two notes — brightens the minor chord to its relative major.'),
    mk(7, 'dom7', 'SET-UP V7', 'Spotlight it: precede it with its own dominant, a fifth above.'),
    mk(0, 'min9', 'EXTEND m9', 'Stack the ♭7 and 9 for a smoky, modern minor colour.'),
  ];
  return [
    mk(8, 'dom7', 'PARENT V7♭9', 'A diminished 7th is a rootless 7♭9 — its dominant sits a major third below.'),
    mk(3, 'dim7', 'SYMMETRIC', 'Move it up a minor 3rd and it is the same four notes — use any as a passing chord.'),
  ];
}

export function colorChordDefs(tonicPc: number): Array<{ rootPc: number; quality: string; roman: string }> {
  const t = tonicPc;
  return [
    { rootPc: (t + 2) % 12, quality: 'dom7', roman: 'V7/V' },
    { rootPc: (t + 5) % 12, quality: 'min', roman: 'iv' },
    { rootPc: (t + 10) % 12, quality: 'maj', roman: '♭VII' },
    { rootPc: (t + 8) % 12, quality: 'maj', roman: '♭VI' },
  ];
}

// ---- jazz voicing helpers ----

export function jShellInts(intervals: number[]): number[] {
  const third = intervals.find((i) => i === 3 || i === 4);
  const sev = intervals.find((i) => i === 10 || i === 11);
  if (sev === undefined) return intervals;
  return [0, third, sev].filter((x): x is number => x !== undefined);
}

export function jFamily(intervals: number[]): string {
  const has = (x: number) => intervals.includes(x);
  if (has(4) && has(10)) return 'dom';
  if (has(3) && has(6) && has(10)) return 'm7b5';
  if (has(3)) return 'min';
  return 'maj';
}

export function jChVoiced(ch: Chord, voicing: string): Chord {
  if (voicing === 'shell') return { ...ch, intervals: jShellInts(gI(ch)) };
  return ch;
}

export function jzNotes(ch: Chord, voicing: string, tonicPc: number): string {
  return gPcs(jChVoiced(ch, voicing)).map((p) => spell(p, tonicPc)).join(' ');
}

// classical inversion voicing of the selected chord
export function invChord(ch: Chord, which: number, tonicPc: number): Chord {
  const tones = gI(ch).slice(0, 3);
  const base = 48 + ch.rootPc;
  const mids: number[] = [];
  for (let k = 0; k < tones.length; k++) {
    let off = tones[(which + k) % tones.length];
    if (which + k >= tones.length) off += 12;
    mids.push(base + off);
  }
  mids.push(mids[0] + 12);
  const bassPc = mod12(ch.rootPc + tones[which]);
  const baseName = (ch.name || cname(ch.rootPc, 'maj', tonicPc)).split('/')[0];
  const name = which === 0 ? baseName : baseName + '/' + spell(bassPc, tonicPc);
  return { rootPc: ch.rootPc, intervals: gI(ch), name, roman: ch.roman, fn: ch.fn, midis: mids };
}

export interface VoicingNote { idx: number; fret: number; role: string; finger: number }
export interface Voicing {
  guitar: VoicingNote[];
  gbarre: { fret: number; loIdx: number; hiIdx: number } | null;
  bass: VoicingNote[];
  piano: Array<{ m: number; role: string; finger: string }>;
}

// recommended comping fingering (guitar drop-2, bass box, piano shell)
export function jazzVoicing(ac: Chord, jzInv: number): Voicing {
  const rootPc = ac.rootPc;
  const rel = gI(ac);
  const has = (x: number) => rel.includes(x);
  const maj3 = has(4), min3 = has(3), b7 = has(10), M7 = has(11), b5 = has(6);
  const ext = has(14) ? 9 : has(21) ? 13 : null;
  let tones: number[], roles: string[];
  const R = 'R';
  if (maj3 && M7) { tones = [0, 7, 11, 4]; roles = [R, '5', '7', '3']; }
  else if (maj3 && b7) { tones = [0, 7, 10, 4]; roles = [R, '5', '7', '3']; }
  else if (min3 && b5 && b7) { tones = [0, 6, 10, 3]; roles = [R, 'b5', '7', 'b3']; }
  else if (min3 && b7) { tones = [0, 7, 10, 3]; roles = [R, '5', '7', 'b3']; }
  else if (min3 && M7) { tones = [0, 7, 11, 3]; roles = [R, '5', '7', 'b3']; }
  else if (maj3) { tones = [0, 7, 4]; roles = [R, '5', '3']; }
  else if (min3) { tones = [0, 7, 3]; roles = [R, '5', 'b3']; }
  else { tones = [0, 7, 4]; roles = [R, '5', '3']; }
  if (ext !== null) {
    if (maj3 && M7) { tones = [0, 4, 11, 14]; roles = [R, '3', '7', '9']; }
    else if (maj3 && b7) { tones = [0, 4, 10, 14]; roles = [R, '3', '7', '9']; }
    else if (min3) { tones = [0, 3, 10, 14]; roles = [R, 'b3', '7', '9']; }
    else { tones = [0, 4, 11, 14]; roles = [R, '3', '7', '9']; }
  }
  const nv = tones.length;
  const k = ((((jzInv || 0) % nv) + nv) % nv);
  if (k > 0) {
    const t2: number[] = [], r2: string[] = [];
    for (let i = 0; i < nv; i++) {
      const idx = (i + k) % nv;
      let off = tones[idx];
      if (i + k >= nv) off += 12;
      t2.push(off); r2.push(roles[idx]);
    }
    tones = t2; roles = r2;
  }
  const openG: Record<number, number> = { 6: 4, 5: 9, 4: 2, 3: 7, 2: 11, 1: 4 };
  const idxMap: Record<number, number> = { 6: 5, 5: 4, 4: 3, 3: 2, 2: 1, 1: 0 };
  const lowPc = mod12(rootPc + tones[0]);
  const a5 = mod12(lowPc - 9), a6 = mod12(lowPc - 4);
  let anchor: number, order: number[];
  if (a5 >= 1 && a5 <= 9) { anchor = a5; order = [5, 4, 3, 2]; } else { anchor = a6; order = [6, 5, 4, 3]; }
  order = order.slice(0, tones.length);
  const gnotes = order.map((st, i) => {
    const tonePc = mod12(rootPc + tones[i]);
    let fret: number;
    if (i === 0) fret = anchor;
    else {
      fret = mod12(tonePc - openG[st]);
      while (fret < anchor - 2) fret += 12;
      while (fret > anchor + 3) fret -= 12;
      if (fret < 0) fret += 12;
    }
    return { st, fret, role: roles[i], finger: 0 };
  });
  const distinct = [...new Set(gnotes.filter((n) => n.fret > 0).map((n) => n.fret))].sort((a, b) => a - b);
  gnotes.forEach((n) => { n.finger = n.fret === 0 ? 0 : Math.min(distinct.indexOf(n.fret) + 1, 4); });
  const fretted = gnotes.filter((n) => n.fret > 0);
  const minFret = fretted.length ? Math.min(...fretted.map((n) => n.fret)) : 99;
  const atMin = gnotes.filter((n) => n.fret === minFret);
  let gbarre: Voicing['gbarre'] = null;
  if (minFret >= 1 && minFret < 99 && atMin.length >= 2) {
    const ids = atMin.map((n) => idxMap[n.st]);
    gbarre = { fret: minFret, loIdx: Math.min(...ids), hiIdx: Math.max(...ids) };
  }
  const guitar = gnotes.map((n) => ({ idx: idxMap[n.st], fret: n.fret, role: n.role, finger: n.finger }));
  const bIdx = { E: 3, A: 2, D: 1, G: 0 };
  const aE = mod12(rootPc - 4), aA = mod12(rootPc - 9);
  let bass: VoicingNote[];
  if (aE <= 9) {
    bass = [
      { idx: bIdx.E, fret: aE, role: 'R', finger: 1 },
      { idx: bIdx.A, fret: aE + 2, role: '5', finger: 3 },
      { idx: bIdx.D, fret: aE + 2, role: 'R', finger: 4 },
    ];
  } else {
    bass = [
      { idx: bIdx.A, fret: aA, role: 'R', finger: 1 },
      { idx: bIdx.D, fret: aA + 2, role: '5', finger: 3 },
      { idx: bIdx.G, fret: aA + 2, role: 'R', finger: 4 },
    ];
  }
  const piano: Voicing['piano'] = [{ m: 48 + (rootPc % 12), role: 'R', finger: '5' }];
  piano.push({ m: 60 + mod12(rootPc + (maj3 ? 4 : 3)), role: maj3 ? '3' : 'b3', finger: '1' });
  const sev = M7 ? 11 : b7 ? 10 : null;
  if (sev !== null) piano.push({ m: 60 + mod12(rootPc + sev), role: '7', finger: '2' });
  const exts: Array<[number, number]> = [];
  if (has(14)) exts.push([9, 14]);
  if (has(17)) exts.push([11, 17]);
  if (has(21)) exts.push([13, 21]);
  if (exts.length) {
    let fg = 3;
    exts.forEach(([deg, off]) => { piano.push({ m: 60 + mod12(rootPc + off), role: String(deg), finger: String(Math.min(fg++, 5)) }); });
  } else {
    piano.push({ m: 60 + mod12(rootPc + 7), role: '5', finger: '3' });
  }
  return { guitar, gbarre, bass, piano };
}
