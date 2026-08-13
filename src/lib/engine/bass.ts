// Bassline engine for the Workshop's BASS style. A groove pattern is one bar
// (one chord slot) on a 16-step grid: each step is a degree token resolved
// against the chord sounding at that moment, or a pitchless ghost note. Tokens
// are chord-aware where it matters ('3' follows the chord's third) and can
// look ahead ('A' walks a half-step under the NEXT chord's root), so a single
// pattern transposes correctly through any progression.

import { mod12, gI, cname } from './theory';
import { INT, type Chord, type ScaleId } from './constants';
import { FAMILIES, GENRES } from './genres';
import { ROCK_POP_BASSLINES } from './basslines/rockpop';
import { FUNK_SOUL_BASSLINES } from './basslines/funksoul';
import { HIPHOP_BASSLINES } from './basslines/hiphop';
import { HOUSE_BASSLINES } from './basslines/house';
import { BREAKS_BASSLINES } from './basslines/breaks';
import { HARD_BASSLINES } from './basslines/hard';
import { JAZZ_BASSLINES } from './basslines/jazz';
import { WORLD_BASSLINES } from './basslines/world';

// Degree tokens: offsets from the sounding chord's root, plus the special
// moves bassists actually use. '3' resolves to the chord's own third (major
// or minor); 'b3'/'b7'/'n7' are deliberate literal colours (blues thirds,
// chromatic climbs). '5_' is the fifth BELOW the root. 'A'/'A+' approach the
// next chord's root chromatically from below/above; 'N' anticipates it
// outright ("the push"); 'T' pedals the key's tonic regardless of the chord.
export type DegTok = 'R' | '2' | 'b3' | '3' | '4' | '5' | '5_' | '6' | 'b6' | 'b7' | 'n7' | 'O' | 'A' | 'A+' | 'N' | 'T';

export interface BassStep {
  s: number;      // 0..15 — 16th-note position within the bar
  d?: DegTok;     // degree token (omitted on ghost steps)
  g?: boolean;    // ghost: muted, pitchless "chk"
  l?: number;     // sustain in steps (default ~1.6, a fat eighth)
}

export type BassRole = 'root' | 'chord' | 'color' | 'approach' | 'ghost';

export const BASS_ROLE_META: Record<BassRole, { name: string; color: string }> = {
  root: { name: 'root / octave', color: '#c2562e' },
  chord: { name: 'chord tone', color: '#3f6b5f' },
  color: { name: 'colour (2·4·6)', color: '#b07d23' },
  approach: { name: 'approach / push', color: '#7a5ea8' },
  ghost: { name: 'ghost (muted)', color: '#97a59c' },
};

export const BASS_TOK_LABEL: Record<DegTok, string> = {
  R: 'R', '2': '2', b3: '♭3', '3': '3', '4': '4', '5': '5', '5_': '5',
  '6': '6', b6: '♭6', b7: '♭7', n7: '7', O: '8', A: '↑', 'A+': '↓', N: '→', T: 'T',
};

export function bassRole(st: BassStep): BassRole {
  if (st.g) return 'ghost';
  const t = st.d!;
  if (t === 'R' || t === 'O' || t === 'T') return 'root';
  if (t === 'A' || t === 'A+' || t === 'N' || t === 'n7') return 'approach';
  if (t === '3' || t === 'b3' || t === '5' || t === '5_' || t === 'b7') return 'chord';
  return 'color';
}

/** Put a root in a playable 4-string register (low E window, E1..E♭2). */
export function bassRootMidi(rootPc: number): number {
  const pc = mod12(rootPc);
  return pc >= 4 ? 24 + pc : 36 + pc;
}

/** Resolve a degree token to a MIDI note over `ch`, looking ahead to `next`. */
export function resolveBassStep(tok: DegTok, ch: Chord, next: Chord, tonicPc: number): number {
  if (tok === 'T') return bassRootMidi(tonicPc);
  if (tok === 'A' || tok === 'A+' || tok === 'N') {
    const nb = bassRootMidi(next.rootPc);
    return tok === 'N' ? nb : tok === 'A' ? nb - 1 : nb + 1;
  }
  const base = bassRootMidi(ch.rootPc);
  if (tok === '3') return base + (gI(ch).includes(3) ? 3 : 4);
  const fixed: Record<string, number> = { R: 0, '2': 2, b3: 3, '4': 5, '5': 7, '5_': -5, '6': 9, b6: 8, b7: 10, n7: 11, O: 12 };
  return base + (fixed[tok] ?? 0);
}

/** Octave number of a MIDI note, in scientific pitch (60 = C4). */
export function midiOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

// ---- the line, as one bar of actual notes ----
//
// A cell of the line holds a degree, not a pitch, so what you are about to hear
// depends on which change is underneath it. Resolving the whole bar in one pass
// is what lets the tab *show* that: the same walk the transport makes when it
// lays a bar out, done for the screen instead of the speakers.

/** One cell of the user's line: a degree, a ghost, or a rest. */
export type BassCell = { d?: DegTok; g?: boolean } | null;

/** One 16th of a resolved bar: what sounds there, over which change. */
export interface BassBarNote {
  s: number;         // 0..15
  d?: DegTok;        // the degree written in the cell (absent on ghosts and rests)
  g?: boolean;       // ghost: muted, pitchless
  midi?: number;     // the pitch it resolves to (absent on ghosts and rests)
  l?: number;        // how many steps it rings for
  chordIdx: number;  // which change sounds under this step
}

/**
 * The line as playable steps: each note sustains up to the next filled cell — a
 * fat, legato line — capped at a quarter note.
 *
 * One definition of how long a written note rings, because the transport and
 * the tab must not disagree about it: the row that draws a note's tail is
 * drawing the note the scheduler is holding.
 */
export function bassLineSteps(line: BassCell[]): BassStep[] {
  const idxs = line.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
  return idxs.map((i, k) => {
    const cell = line[i]!;
    if (cell.g) return { s: i, g: true };
    const gap = (k + 1 < idxs.length ? idxs[k + 1] : i + 16) - i;
    return { s: i, d: cell.d, l: Math.max(1, Math.min(gap, 4)) };
  });
}

/**
 * Which change sounds under 16th-step `s`, when the bar starts on change
 * `first` and each one holds half a bar (`half`) or the whole of it.
 *
 * The transport walks a bar with this and so does the tab's note row, so what
 * is drawn under a step cannot disagree with what is played there.
 */
export function bassChordIndexAt(s: number, first: number, half: boolean, n: number): number {
  if (n <= 0) return 0;
  return (((first + (half && s >= 8 ? 1 : 0)) % n) + n) % n;
}

/**
 * The chord a line resolves against when no changes are loaded: the key's own
 * dominant 7th. Editing a cell previews against it, so the tab reads the notes
 * off the same fallback rather than going blank.
 */
export function bassFallbackChord(tonicPc: number, scale: ScaleId = 'ionian'): Chord {
  return { rootPc: tonicPc, intervals: INT.dom7, name: cname(tonicPc, 'dom7', tonicPc, scale), fn: 'T' };
}

/** Resolve every cell of `line` against the changes it falls over. */
export function bassBarNotes(line: BassCell[], chs: Chord[], first: number, half: boolean, tonicPc: number): BassBarNote[] {
  const rings = new Map(bassLineSteps(line).map((st) => [st.s, st.l]));
  return line.map((cell, s) => {
    const i = bassChordIndexAt(s, first, half, chs.length);
    const note: BassBarNote = { s, chordIdx: i };
    if (!cell || !chs.length) return note;
    if (cell.g) { note.g = true; return note; }
    if (!cell.d) return note;
    note.d = cell.d;
    note.l = rings.get(s);
    note.midi = resolveBassStep(cell.d, chs[i], chs[(i + 1) % chs.length], tonicPc);
    return note;
  });
}

// ---- the groove library ----
//
// Patterns are shelved exactly like the drum templates: family → genre →
// pattern, off the shared taxonomy in `engine/genres.ts`. Picking "Neo-Soul"
// in the bass workbench therefore lands on the same shelf as the neo-soul
// grooves in the drum machine, and the two can be loaded as one band.

export const BASS_FAMILIES = FAMILIES;
export const BASS_GENRES = GENRES;

export interface BassPattern {
  id: string;
  genre: string; // StudioGenre id — the picker is genre first, groove second
  name: string;
  tag: string;   // the player / tradition it comes from
  tip: string;   // the trick to hear inside it
  steps: BassStep[];
}

export const BASS_PATTERNS: BassPattern[] = [
  ...ROCK_POP_BASSLINES,
  ...FUNK_SOUL_BASSLINES,
  ...HIPHOP_BASSLINES,
  ...HOUSE_BASSLINES,
  ...BREAKS_BASSLINES,
  ...HARD_BASSLINES,
  ...JAZZ_BASSLINES,
  ...WORLD_BASSLINES,
];

/** The grooves inside one genre, in library order. */
export function bassPatternsIn(genreId: string): BassPattern[] {
  return BASS_PATTERNS.filter((p) => p.genre === genreId);
}

/** The genre a groove belongs to — used to re-open the picker on the right shelf. */
export function bassGenreOf(patId: string | null): string {
  return BASS_PATTERNS.find((p) => p.id === patId)?.genre || BASS_GENRES[0].id;
}

// ---- tricks of the trade: named techniques with a one-bar audio demo ----

export interface BassTrick {
  id: string;
  name: string;
  why: string;
  demo: BassStep[];
}

export const BASS_TRICKS: BassTrick[] = [
  { id: 'ghost', name: 'Ghost notes',
    why: 'Mute the strings with the fretting hand and pluck anyway — a pitchless "chk". A line like 1 · chk · ♭7 · chk turns the bass into a drum.',
    demo: [{ s: 0, d: 'R' }, { s: 2, g: true }, { s: 4, d: 'b7' }, { s: 6, g: true }, { s: 8, d: 'R' }, { s: 10, g: true }, { s: 12, d: 'b7' }, { s: 14, g: true }] },
  { id: 'chrom', name: 'Chromatic approach',
    why: 'Aim at a target tone and step into it from a half-step away. Approach notes are "wrong" notes made right by where they land — the glue of funk lines and walking bass.',
    demo: [{ s: 0, d: 'R', l: 3 }, { s: 8, d: 'b7' }, { s: 10, d: 'n7' }, { s: 12, d: 'O', l: 3 }] },
  { id: 'octpop', name: 'Octave pop',
    why: 'Same note, two registers: root low, octave popped high. Instant disco/funk energy with zero harmonic risk — you cannot hit a wrong note.',
    demo: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 12, d: 'R' }, { s: 14, d: 'O' }] },
  { id: 'push', name: 'The push (anticipation)',
    why: 'Hit the next chord’s root on the and-of-four, an eighth before the bar. The bass arrives early and drags the whole band forward — the engine of latin and gospel feels.',
    demo: [{ s: 0, d: 'R', l: 4 }, { s: 8, d: '5' }, { s: 14, d: 'N', l: 2 }] },
  { id: 'space', name: 'Playing the space',
    why: 'What you don’t play is part of the line. Leave the downbeat (tumbao) or beat three (Headhunters) empty and the groove gets deeper, not thinner.',
    demo: [{ s: 0, d: 'R' }, { s: 3, d: 'b7' }, { s: 6, d: 'R', l: 3 }] },
  { id: 'rootfive', name: 'Root & five',
    why: 'The two notes that work over every chord ever written. When in doubt: root on the strong beat, five (above or below) on the weak one.',
    demo: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5_', l: 3 }, { s: 8, d: 'R', l: 3 }, { s: 12, d: '5', l: 3 }] },
  { id: 'walkin', name: 'Walk into the change',
    why: 'Beat four belongs to the NEXT chord: approach its root by a half-step from below or above, and the harmony sounds inevitable instead of switched.',
    demo: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '3', l: 3 }, { s: 8, d: '5', l: 3 }, { s: 12, d: 'A', l: 3 }] },
];
