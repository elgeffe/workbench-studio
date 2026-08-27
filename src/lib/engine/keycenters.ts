// Finding the key centres a set of changes actually moves through.
//
// The rest of this app assumes one key: you pick a tonic, and the diatonic
// list, the wheel and the fretboard all follow it. That is the right model for
// a vamp and the wrong one for a standard, which is a *chain* of key centres
// spliced together by ii–Vs. Autumn Leaves is two (B♭ major and its relative G
// minor); Blue Bossa modulates a semitone up to D♭ major and back; Alone
// Together passes through four in sixteen bars. Asking "which single key holds
// this chord" has no answer for most of the page, which is exactly why reading
// one off the circle of fifths feels like guessing.
//
// So this does what a player does: it looks for the cadences that *announce* a
// key, and lets everything nearby belong to whichever key its neighbours agreed
// on. Two ideas do the work.
//
//   1. A ii–V pair names a key even when the I never arrives. `Xm7 → Y7` a
//      fourth apart says major; `Xø7 → Y7` says minor. This is the single
//      strongest signal on the page and it is worth more than any chord's own
//      diatonic fit — it is how Bm7 E7 in Alone Together is heard as pointing
//      at A even though A never comes.
//   2. Keys have inertia. Without a cost for changing key, a scorer flips on
//      every chord and reports twenty centres in a chorus. With one, a chord
//      that fits the current key slightly worse than a new one stays put, and
//      only a real cadence is worth the switch.
//
// Both fall out of a Viterbi pass over 24 states (12 tonics × major/minor):
// score every chord against every key, add a penalty on every key change, and
// take the cheapest path through the whole tune. That the answer is global, not
// per-chord, is the point — it is why a lone Gm7 reads as i in Autumn Leaves
// and as ii-of-F eight bars into Alone Together.

import { mod12 } from './theory';
import type { Chord } from './constants';

export type KeyMode = 'major' | 'minor';

export interface KeyCenter {
  tonicPc: number;
  mode: KeyMode;
}

export interface AnalysedChord extends KeyCenter {
  /** Index into the chord list this analysis is for. */
  i: number;
  /** Roman numeral of the chord within its local key. */
  roman: string;
  /** Broad quality family, as the chord-scale mapping wants it. */
  family: ChordFamily;
  /** Scale degree of the root within the local key, 0-11 semitones. */
  degree: number;
  /** True when this chord opens a new key centre. */
  starts: boolean;
  /** How well the chord sits in its key — drives the "outside" marker. */
  fits: boolean;
}

export type ChordFamily = 'maj' | 'min' | 'dom' | 'm7b5' | 'dim7' | 'aug' | 'sus';

/** The broad family a chord belongs to, read off its intervals. */
export function familyOf(intervals: number[]): ChordFamily {
  const has = (x: number) => intervals.includes(x);
  const third = has(4) ? 4 : has(3) ? 3 : 0;
  if (!third && (has(5) || has(2))) return 'sus';
  if (third === 3 && has(6)) return has(9) && !has(10) ? 'dim7' : 'm7b5';
  if (third === 4 && has(8) && !has(7)) return 'aug';
  if (third === 4 && has(10)) return 'dom';
  if (third === 3) return 'min';
  return 'maj';
}

// Scale degrees present in each mode, as semitones above the tonic. The minor
// set is deliberately the *mixture* players actually use — natural, harmonic
// and melodic at once — because a fake book's minor key contains all three: the
// ♮7 of a ♭VII7, the ♯7 of a V7, the ♮6 of a m6 tonic.
const MAJOR_PCS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_PCS = [0, 2, 3, 5, 7, 8, 9, 10, 11];

// The chord each degree is expected to carry, and how strongly that chord
// *identifies* the key — which is not the same as how diatonic it is. I, V and
// ii pin a key down; ♭VI in a minor key barely narrows it at all, since the same
// major seventh is IV of the relative major and I of a third key. Weighting
// them equally is what makes a reading switch key a chord too early: Autumn
// Leaves' E♭maj7 is IV of B♭ and ♭VI of G minor with identical diatonic fit, and
// only the difference in identifying strength says it is still in B♭.
type Roles = Record<number, Partial<Record<ChordFamily, number>>>;

const MAJOR_ROLE: Roles = {
  0: { maj: 12, dom: 6 },   // I — and I7, which is the blues tonic
  2: { min: 11, m7b5: 5 },  // ii
  4: { min: 7 },            // iii
  5: { maj: 10, dom: 6 },   // IV — and the blues IV7
  7: { dom: 12, maj: 10 },  // V
  9: { min: 7 },            // vi
  11: { m7b5: 9, dim7: 7 }, // viiø
};
const MINOR_ROLE: Roles = {
  0: { min: 12 },
  2: { m7b5: 11, min: 6 },  // iiø
  3: { maj: 7 },            // ♭III
  5: { min: 10, dom: 5 },   // iv
  7: { dom: 12, min: 9 },   // V — dominant far more often than not
  8: { maj: 6 },            // ♭VI — a weak identifier, see above
  10: { dom: 7, maj: 7 },   // ♭VII
  11: { dim7: 9 },
};

// Roman numerals per degree. Case carries the quality, as the wheel already
// does, so the numeral alone tells you what kind of chord it is.
const MAJOR_NUM: Record<number, string> = {
  0: 'I', 1: '♭II', 2: 'II', 3: '♭III', 4: 'III', 5: 'IV', 6: '♯IV', 7: 'V', 8: '♭VI', 9: 'VI', 10: '♭VII', 11: 'VII',
};
const MINOR_NUM: Record<number, string> = {
  0: 'I', 1: '♭II', 2: 'II', 3: '♭III', 4: 'III', 5: 'IV', 6: '♯IV', 7: 'V', 8: '♭VI', 9: 'VI', 10: '♭VII', 11: 'VII',
};

const LOWER: ChordFamily[] = ['min', 'm7b5', 'dim7'];

function numeralFor(degree: number, mode: KeyMode, family: ChordFamily): string {
  const base = (mode === 'major' ? MAJOR_NUM : MINOR_NUM)[degree] || '?';
  let n = LOWER.includes(family) ? base.toLowerCase() : base;
  // Keep the accidental upper-case — ♭iii, not ♭III lowercased to ♭iii's flat.
  n = n.replace('♭', '♭').replace('♯', '♯');
  if (family === 'm7b5') n += 'ø';
  else if (family === 'dim7') n += '°';
  else if (family === 'aug') n += '+';
  else if (family === 'dom' && degree !== 7) n += '7';
  return n;
}

const KEYS: KeyCenter[] = [];
for (let pc = 0; pc < 12; pc++) {
  KEYS.push({ tonicPc: pc, mode: 'major' });
  KEYS.push({ tonicPc: pc, mode: 'minor' });
}

interface Scored { chord: Chord; family: ChordFamily; nextFifth: boolean }

// How much a chord likes a key, before any cadence bonus.
function fitScore(s: Scored, key: KeyCenter): number {
  const degree = mod12(s.chord.rootPc - key.tonicPc);
  const scale = key.mode === 'major' ? MAJOR_PCS : MINOR_PCS;
  const roles = (key.mode === 'major' ? MAJOR_ROLE : MINOR_ROLE)[degree];

  let score = 0;
  const role = roles?.[s.family];
  if (role !== undefined) score += role; // the chord this degree expects
  else if (scale.includes(degree)) score += 4; // right root, borrowed colour
  else score -= 2; // a chromatic root

  // Every chord tone inside the key is worth something; every one outside costs.
  const inKey = s.chord.intervals || [0, 4, 7];
  for (const iv of inKey) {
    score += scale.includes(mod12(s.chord.rootPc + iv - key.tonicPc)) ? 1 : -1.5;
  }

  // A secondary dominant belongs to the key it is borrowed into, not to the key
  // a fifth below it — V7/ii is still in the home key.
  if (s.family === 'dom' && scale.includes(mod12(degree + 7))) score += 2;
  return score;
}

const CADENCE = 14;   // a ii–V pair is worth more than any single chord's fit
const RESOLVE = 7;    // …and more again when the I actually lands
const SWITCH = 11;    // what it costs to change key: keys have inertia
// Where a tune sits still says something. Progressions end on their tonic far
// more often than not, and a looping one usually starts there too — which is
// the only thing that puts a blues in its own key, since I7, IV7 and V7 are
// none of them diatonic and a purely diatonic scorer hears C7 F7 C7 G7 as
// belonging to F. Weaker than a cadence, so it never overrules a real ii–V.
const ENDS_TONIC = 6;
const OPENS_TONIC = 4;

/**
 * Analyse a progression into key centres.
 *
 * Returns one entry per chord, each naming the local key, the chord's roman
 * numeral in it, and whether it opens a new centre. `switchCost` tunes how
 * eagerly the reading modulates — raise it to keep a tune in one key, lower it
 * to let every ii–V pull its own centre.
 */
export function analyseChanges(chords: Chord[], switchCost = SWITCH): AnalysedChord[] {
  const n = chords.length;
  if (!n) return [];

  const scored: Scored[] = chords.map((chord, i) => {
    const family = familyOf(chord.intervals || [0, 4, 7]);
    const next = chords[i + 1];
    // Is the next chord a dominant a fourth above this root? That is the shape
    // of every ii–V on the page, major or minor.
    const nextFifth = !!next
      && familyOf(next.intervals || [0, 4, 7]) === 'dom'
      && mod12(next.rootPc - chord.rootPc) === 5;
    return { chord, family, nextFifth };
  });

  // Cadence bonuses, computed once over the whole line: a ii–V pair votes for
  // its target key at both of its chords, so the pair moves together.
  const bonus: Array<Map<string, number>> = scored.map(() => new Map());
  const vote = (i: number, key: KeyCenter, amount: number) => {
    if (i < 0 || i >= n) return;
    const k = `${key.tonicPc}:${key.mode}`;
    bonus[i].set(k, (bonus[i].get(k) || 0) + amount);
  };
  scored.forEach((s, i) => {
    if (!s.nextFifth) return;
    // The dominant sits on the 5th, so its target tonic is a fourth above it.
    const target = mod12(s.chord.rootPc + 5 + 5);
    // A minor ii is half-diminished; a major ii is a plain minor seventh.
    const mode: KeyMode = s.family === 'm7b5' ? 'minor' : s.family === 'min' ? 'major' : 'major';
    if (s.family !== 'min' && s.family !== 'm7b5') return;
    vote(i, { tonicPc: target, mode }, CADENCE);
    vote(i + 1, { tonicPc: target, mode }, CADENCE);
    // …and if the target actually arrives, that seals it.
    const landing = scored[i + 2];
    if (landing && landing.chord.rootPc === target) {
      const lands = mode === 'minor'
        ? landing.family === 'min'
        : landing.family === 'maj';
      if (lands) { vote(i + 2, { tonicPc: target, mode }, RESOLVE); vote(i, { tonicPc: target, mode }, RESOLVE); }
    }
  });
  // I7 → IV7 is the blues signature, and it needs naming as a pattern for the
  // same reason ii–V does: a blues tonic is a dominant seventh, so its ♭7 is
  // outside every major scale and a note-counting scorer will always prefer to
  // hear C7 as the V of F rather than the I of C. The tell is that the chord it
  // moves to is *also* a dominant — a real V7 → I lands on a tonic chord.
  scored.forEach((s, i) => {
    const next = scored[i + 1];
    if (!next || s.family !== 'dom' || next.family !== 'dom') return;
    if (mod12(next.chord.rootPc - s.chord.rootPc) !== 5) return;
    vote(i, { tonicPc: s.chord.rootPc, mode: 'major' }, CADENCE / 2);
    vote(i + 1, { tonicPc: s.chord.rootPc, mode: 'major' }, CADENCE / 2);
  });

  // A lone dominant resolving down a fifth to a chord that is present also
  // names a key, more weakly — it is the V7 of wherever it lands. The landing
  // has to be a *tonic* chord, though: a dominant seventh is never one, and
  // counting it as one is what makes a blues read as the key a fourth up. C7
  // going to F7 is I7 → IV7 in C, not V7 → I in F, and the giveaway is that
  // the F is itself a dominant.
  scored.forEach((s, i) => {
    if (s.family !== 'dom') return;
    const next = scored[i + 1];
    if (!next || mod12(next.chord.rootPc - s.chord.rootPc) !== 5) return;
    if (next.family !== 'maj' && next.family !== 'min') return;
    const mode: KeyMode = next.family === 'min' ? 'minor' : 'major';
    vote(i, { tonicPc: next.chord.rootPc, mode }, CADENCE / 2);
    vote(i + 1, { tonicPc: next.chord.rootPc, mode }, CADENCE / 2);
  });

  const score = (i: number, key: KeyCenter): number => {
    let v = fitScore(scored[i], key) + (bonus[i].get(`${key.tonicPc}:${key.mode}`) || 0);
    if (scored[i].chord.rootPc === key.tonicPc) {
      if (i === n - 1) v += ENDS_TONIC;
      if (i === 0) v += OPENS_TONIC;
    }
    return v;
  };

  // ---- Viterbi over the 24 keys ----
  const K = KEYS.length;
  const best: number[][] = Array.from({ length: n }, () => new Array(K).fill(-Infinity));
  const from: number[][] = Array.from({ length: n }, () => new Array(K).fill(-1));
  for (let k = 0; k < K; k++) best[0][k] = score(0, KEYS[k]);
  for (let i = 1; i < n; i++) {
    // The best predecessor is either "stay in k" or "switch from the overall
    // best", so the whole step is O(K) rather than O(K²).
    let topK = 0;
    for (let k = 1; k < K; k++) if (best[i - 1][k] > best[i - 1][topK]) topK = k;
    for (let k = 0; k < K; k++) {
      const stay = best[i - 1][k];
      const move = best[i - 1][topK] - switchCost;
      const useStay = stay >= move || k === topK;
      best[i][k] = (useStay ? stay : move) + score(i, KEYS[k]);
      from[i][k] = useStay ? k : topK;
    }
  }

  let end = 0;
  for (let k = 1; k < K; k++) if (best[n - 1][k] > best[n - 1][end]) end = k;
  const path: number[] = new Array(n);
  path[n - 1] = end;
  for (let i = n - 1; i > 0; i--) path[i - 1] = from[i][path[i]];

  return scored.map((s, i) => {
    const key = KEYS[path[i]];
    const degree = mod12(s.chord.rootPc - key.tonicPc);
    const scale = key.mode === 'major' ? MAJOR_PCS : MINOR_PCS;
    return {
      i,
      tonicPc: key.tonicPc,
      mode: key.mode,
      degree,
      family: s.family,
      roman: numeralFor(degree, key.mode, s.family),
      starts: i === 0 || path[i] !== path[i - 1],
      fits: (s.chord.intervals || [0, 4, 7])
        .every((iv) => scale.includes(mod12(s.chord.rootPc + iv - key.tonicPc))),
    };
  });
}

/** The analysis collapsed into runs, for a ribbon over the progression strip. */
export interface KeySpan extends KeyCenter {
  start: number;
  end: number; // inclusive
}

export function keySpans(analysis: AnalysedChord[]): KeySpan[] {
  const spans: KeySpan[] = [];
  analysis.forEach((a) => {
    const last = spans[spans.length - 1];
    if (last && !a.starts) last.end = a.i;
    else spans.push({ tonicPc: a.tonicPc, mode: a.mode, start: a.i, end: a.i });
  });
  return spans;
}
