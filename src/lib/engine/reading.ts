// Sight-reading drill generator. Pure (aside from Math.random) so target
// well-formedness — staff geometry, key signatures, spelling, answer sets —
// can be unit-tested. The staff itself is plain SVG data: the component just
// draws lines, glyphs and noteheads at the coordinates computed here.

import { INTNAME } from './constants';

export type ReadLevel = 'note' | 'interval' | 'chord';
export type ReadClef = 'treble' | 'bass';
export type ReadClefSetting = 'treble' | 'bass' | 'both';
export type ReadRange = 'staff' | 'ledger';
export type ReadKeyMode = 'c' | 'easy' | 'all';
export type ReadAnswerMode = 'name' | 'play';

export interface ReadSettings {
  level: ReadLevel;
  clef: ReadClefSetting;
  range: ReadRange;
  keyMode: ReadKeyMode;
  accidentals: boolean; // inline ♯/♭ on single notes (C-major mode only)
  answer: ReadAnswerMode;
}

// ---- staff geometry ----
// Five lines from y=40 (top) to y=80 (bottom), 10px apart; one diatonic step
// (line→space) is 5px. Everything is placed by "step" — a diatonic ordinal
// (octave * 7 + letter index, C=0..B=6) — then mapped to y against the clef's
// top-line step: F5 on the treble, A3 on the bass.
export const STAFF_TOP = 40;
export const STAFF_BOTTOM = 80;
export const STAFF_STEP = 5;
export const NOTE_X = 168;

const TOP_LINE_STEP: Record<ReadClef, number> = { treble: 38, bass: 26 };
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
const LETTER_SEMI = [0, 2, 4, 5, 7, 9, 11];

export interface ReadNote {
  letter: number; // 0..6 = C..B
  octave: number; // scientific pitch: C4 = middle C
  alt: -1 | 0 | 1;
}

export const noteStep = (n: ReadNote): number => n.octave * 7 + n.letter;
export const noteMidi = (n: ReadNote): number => 12 * (n.octave + 1) + LETTER_SEMI[n.letter] + n.alt;
export const stepY = (clef: ReadClef, step: number): number => STAFF_TOP + (TOP_LINE_STEP[clef] - step) * STAFF_STEP;
const glyph = (alt: number): string => (alt === 1 ? '♯' : alt === -1 ? '♭' : '');
export const noteName = (n: ReadNote): string => LETTERS[n.letter] + glyph(n.alt);
export const noteLabel = (n: ReadNote): string => LETTERS[n.letter] + glyph(n.alt) + n.octave;

/** Ledger-line y positions a note at `step` needs (empty while on the staff). */
export function ledgerYs(clef: ReadClef, step: number): number[] {
  const top = TOP_LINE_STEP[clef];
  const ys: number[] = [];
  for (let s = top + 2; s <= step; s += 2) ys.push(stepY(clef, s));
  for (let s = top - 10; s >= step; s -= 2) ys.push(stepY(clef, s));
  return ys;
}

// ---- key signatures ----
// Sharps enter F C G D A E B; flats B E A D G C F. The staff positions are the
// canonical engraving octaves for the treble clef; the bass clef draws every
// accidental exactly two staff lines (14 diatonic steps) lower.
const SHARP_LETTERS = [3, 0, 4, 1, 5, 2, 6];
const FLAT_LETTERS = [6, 2, 5, 1, 4, 0, 3];
const SHARP_STEPS_TREBLE = [38, 35, 39, 36, 33, 37, 34]; // F5 C5 G5 D5 A4 E5 B4
const FLAT_STEPS_TREBLE = [34, 37, 33, 36, 32, 35, 31]; // B4 E5 A4 D5 G4 C5 F4
const SHARP_MAJ = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯'];
const FLAT_MAJ = ['C', 'F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭'];

export interface ReadKey {
  count: number; // number of accidentals, 0..6
  flat: boolean;
  label: string; // "G major · 1♯"
  altered: Set<number>; // letter indices carrying the key's accidental
}

export function makeKey(count: number, flat: boolean): ReadKey {
  const order = flat ? FLAT_LETTERS : SHARP_LETTERS;
  const name = (flat ? FLAT_MAJ : SHARP_MAJ)[count];
  return {
    count, flat,
    label: count === 0 ? 'C major' : `${name} major · ${count}${flat ? '♭' : '♯'}`,
    altered: new Set(order.slice(0, count)),
  };
}

/** The key's alteration for a letter: F♯ in G major, B♭ in F major, … */
export const keyAlt = (key: ReadKey, letter: number): -1 | 0 | 1 =>
  key.altered.has(letter) ? (key.flat ? -1 : 1) : 0;

// ---- staff spec (what the component draws) ----
export interface StaffAccidental { glyph: string; x: number; y: number }
export interface StaffNote { x: number; y: number; acc: string; ledger: number[] }
export interface ReadStaff {
  clef: ReadClef;
  keyAcc: StaffAccidental[];
  notes: StaffNote[];
}

function keySigAcc(clef: ReadClef, key: ReadKey): StaffAccidental[] {
  const steps = key.flat ? FLAT_STEPS_TREBLE : SHARP_STEPS_TREBLE;
  const shift = clef === 'bass' ? -14 : 0;
  return steps.slice(0, key.count).map((s, i) => ({
    glyph: key.flat ? '♭' : '♯',
    x: 52 + i * 11,
    y: stepY(clef, s + shift),
  }));
}

function buildStaff(clef: ReadClef, key: ReadKey, notes: ReadNote[], showAcc: boolean): ReadStaff {
  // Notes come low→high. Stacked seconds (only interval drills produce them)
  // shift the upper head to the right of the lower one, engraving-style.
  const sorted = notes.slice().sort((a, b) => noteStep(a) - noteStep(b));
  const staffNotes: StaffNote[] = sorted.map((n, i) => {
    const prev = i > 0 ? sorted[i - 1] : null;
    const x = prev && noteStep(n) - noteStep(prev) === 1 ? NOTE_X + 11 : NOTE_X;
    return {
      x,
      y: stepY(clef, noteStep(n)),
      acc: showAcc && n.alt !== 0 ? glyph(n.alt) : '',
      ledger: ledgerYs(clef, noteStep(n)),
    };
  });
  return { clef, keyAcc: keySigAcc(clef, key), notes: staffNotes };
}

// ---- target generation ----
export interface ReadTarget {
  level: ReadLevel;
  staff: ReadStaff;
  keyLabel: string;
  midis: number[]; // sounded pitches, low→high
  pcs: number[]; // distinct pitch classes — the play-mode answer set
  answer: string;
  options: string[];
}

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

function pickClef(s: ReadClefSetting): ReadClef {
  return s === 'both' ? (Math.random() < 0.5 ? 'treble' : 'bass') : s;
}
function pickKey(mode: ReadKeyMode): ReadKey {
  const max = mode === 'c' ? 0 : mode === 'easy' ? 3 : 6;
  const count = rnd(0, max);
  return makeKey(count, count > 0 && Math.random() < 0.5);
}
/** Inclusive step range for the clef: the 5 lines, or ±2 ledger lines. */
export function stepRange(clef: ReadClef, range: ReadRange): [number, number] {
  const top = TOP_LINE_STEP[clef];
  const pad = range === 'ledger' ? 4 : 0;
  return [top - 8 - pad, top + pad];
}
function noteAt(step: number, key: ReadKey, alt?: -1 | 0 | 1): ReadNote {
  const letter = ((step % 7) + 7) % 7;
  return { letter, octave: Math.floor(step / 7), alt: alt ?? keyAlt(key, letter) };
}

const CHORD_SUF: Record<string, string> = {
  '4,7': '', '3,7': 'm', '3,6': '°', '4,8': '+',
  '4,7,11': 'maj7', '3,7,10': 'm7', '4,7,10': '7', '3,6,10': 'ø7', '3,6,9': '°7', '3,7,11': 'm(maj7)',
};

/** Root-position stack of thirds on `step`, diatonic to the key. */
function diatonicStack(step: number, size: 3 | 4, key: ReadKey): { notes: ReadNote[]; name: string } {
  const notes = Array.from({ length: size }, (_, i) => noteAt(step + 2 * i, key));
  const root = noteMidi(notes[0]);
  const ints = notes.slice(1).map((n) => noteMidi(n) - root).join(',');
  return { notes, name: noteName(notes[0]) + (CHORD_SUF[ints] ?? '') };
}

export function genReadTarget(s: ReadSettings): ReadTarget {
  const clef = pickClef(s.clef);
  const key = pickKey(s.keyMode);
  const [lo, hi] = stepRange(clef, s.range);

  if (s.level === 'interval') {
    // A diatonic dyad: generic 2nd..octave, both notes inside the range.
    const gen = rnd(1, 7);
    const rootStep = rnd(lo, hi - gen);
    const notes = [noteAt(rootStep, key), noteAt(rootStep + gen, key)];
    const midis = notes.map(noteMidi);
    const answer = INTNAME[midis[1] - midis[0]];
    const pool = shuffle(Object.values(INTNAME).filter((n) => n !== answer)).slice(0, 3);
    return {
      level: 'interval',
      staff: buildStaff(clef, key, notes, false),
      keyLabel: key.label,
      midis,
      pcs: [...new Set(midis.map((m) => m % 12))],
      answer,
      options: shuffle([answer, ...pool]),
    };
  }

  if (s.level === 'chord') {
    // A diatonic triad or 7th in root position — the qualities fall out of the
    // key itself (maj/min/dim triads; maj7/m7/dom7/ø7 sevenths).
    const size: 3 | 4 = Math.random() < 0.5 ? 3 : 4;
    const span = 2 * (size - 1);
    const rootStep = rnd(lo, hi - span);
    const { notes, name } = diatonicStack(rootStep, size, key);
    const midis = notes.map(noteMidi);
    // Distractors: the same-size diatonic chords of this key on other degrees.
    const others = [...new Set(
      Array.from({ length: 7 }, (_, d) => diatonicStack(rootStep + d, size, key).name),
    )].filter((n) => n !== name);
    return {
      level: 'chord',
      staff: buildStaff(clef, key, notes, false),
      keyLabel: key.label,
      midis,
      pcs: [...new Set(midis.map((m) => m % 12))],
      answer: name,
      options: shuffle([name, ...shuffle(others).slice(0, 3)]),
    };
  }

  // Single note. In C-major mode the accidentals toggle adds an inline ♯/♭.
  const step = rnd(lo, hi);
  const inline = s.accidentals && key.count === 0;
  const alt = inline ? ([-1, 0, 1][rnd(0, 2)] as -1 | 0 | 1) : undefined;
  const note = noteAt(step, key, alt);
  const answer = noteName(note);
  // Distractors: the other in-key letter names (plus chromatic neighbours of
  // the answer when inline accidentals are on, so ♯/♭ answers have company).
  const pool = new Set<string>();
  for (let l = 0; l < 7; l++) pool.add(noteName(noteAt(l, key)));
  if (inline) {
    pool.add(LETTERS[note.letter] + '♯');
    pool.add(LETTERS[note.letter] + '♭');
    pool.add(LETTERS[note.letter]);
  }
  pool.delete(answer);
  return {
    level: 'note',
    staff: buildStaff(clef, key, [note], inline),
    keyLabel: key.label,
    midis: [noteMidi(note)],
    pcs: [((noteMidi(note) % 12) + 12) % 12],
    answer,
    options: shuffle([answer, ...shuffle([...pool]).slice(0, 3)]),
  };
}
