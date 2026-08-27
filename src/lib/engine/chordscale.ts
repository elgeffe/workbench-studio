// Which scale to play over one chord.
//
// Once the key centre is known this is nearly mechanical, which is the whole
// point: the searching in this app was never about scales, it was about not
// knowing which key you were in. Given the key, the chord's degree in it names
// the mode, and the answer is a lookup rather than a hunt.
//
//     major key   I ionian · ii dorian · iii phrygian · IV lydian
//                 V mixolydian · vi aeolian · viiø locrian
//     minor key   i melodic/aeolian · iiø locrian ♮2 · ♭III lydian
//                 iv dorian · V altered or phrygian dominant · ♭VI lydian · ♭VII mixolydian
//
// Two things earn their keep beyond the table. First, the *chord* overrules the
// degree when the two disagree: a m6 or m(maj7) tonic has a natural 6th in it,
// so Blue Bossa's Cm6 is dorian or melodic minor and never aeolian, whatever
// the key signature says. Second, chords that belong to no key at all — tritone
// subs, altered dominants, passing diminisheds — are named by their own
// intervals, because that is the only information there is.
//
// The scales here are deliberately NOT the app's `ScaleId`. That union is the
// set of keys you can *select*, and it feeds the key picker, the fretboard
// patterns and the enharmonic spelling table. A chord scale is a different
// thing — you never set the app's key to "altered" — so it gets its own table
// and the two stay uncoupled.

import { mod12 } from './theory';
import type { AnalysedChord, ChordFamily, KeyMode } from './keycenters';

export interface ChordScale {
  id: string;
  /** Display name, already including the root: "D dorian". */
  name: string;
  /** Semitones above the chord root. */
  intervals: number[];
  /** Pitch classes, rooted on the chord. */
  pcs: number[];
  /** One line on why this scale and not another. */
  why: string;
  /** The note that gives this scale its flavour, as a semitone offset. */
  colorTone?: number;
}

interface ScaleDef { label: string; int: number[]; why: string; color?: number }

export const CHORD_SCALES: Record<string, ScaleDef> = {
  ionian: { label: 'ionian', int: [0, 2, 4, 5, 7, 9, 11], why: 'Home. The 4th is the one note to pass through rather than land on — it sits a semitone above the 3rd.', color: 11 },
  dorian: { label: 'dorian', int: [0, 2, 3, 5, 7, 9, 10], why: 'Minor with a natural 6th. That 6th is the whole sound — it is what keeps this from going sad.', color: 9 },
  phrygian: { label: 'phrygian', int: [0, 1, 3, 5, 7, 8, 10], why: 'Minor with a ♭2 — dark and Spanish. The ♭2 is the colour and also the note to place carefully.', color: 1 },
  lydian: { label: 'lydian', int: [0, 2, 4, 6, 7, 9, 11], why: 'Major with a ♯4 — floating and bright. Unlike ionian it has no note to avoid.', color: 6 },
  mixolydian: { label: 'mixolydian', int: [0, 2, 4, 5, 7, 9, 10], why: 'Major with a ♭7 — the plain, unhurried dominant sound before anything is altered.', color: 10 },
  aeolian: { label: 'aeolian', int: [0, 2, 3, 5, 7, 8, 10], why: 'Natural minor. The ♭6 is what separates it from dorian, and it is a darker note.', color: 8 },
  locrian: { label: 'locrian', int: [0, 1, 3, 5, 6, 8, 10], why: 'The ♭5 chord scale. Correct but severe — the ♭2 clashes with the chord, so most players reach for locrian ♮2 instead.', color: 6 },
  locrianNat2: { label: 'locrian ♮2', int: [0, 2, 3, 5, 6, 8, 10], why: 'Locrian with the 2nd restored — a ♮9 over the chord instead of a ♭9. The standard sound over a m7♭5, and much warmer than plain locrian.', color: 2 },
  harmonicMinor: { label: 'harmonic minor', int: [0, 2, 3, 5, 7, 8, 11], why: 'Natural minor with the 7th raised, which is what makes the V a real dominant. The ♭6-to-♮7 leap is its signature.', color: 11 },
  melodicMinor: { label: 'melodic minor', int: [0, 2, 3, 5, 7, 9, 11], why: 'Minor with both the 6th and 7th raised — the smooth jazz-minor tonic, and the parent of the altered and lydian dominant sounds below.', color: 11 },
  phrygianDom: { label: 'phrygian dominant', int: [0, 1, 4, 5, 7, 8, 10], why: 'The 5th mode of harmonic minor — a dominant with a ♭9 and ♭13. The sound of a V7 resolving into a minor chord.', color: 1 },
  altered: { label: 'altered', int: [0, 1, 3, 4, 6, 8, 10], why: 'Every tension a dominant can carry at once: ♭9, ♯9, ♯11, ♭13. Maximum pull toward the chord it resolves to. Melodic minor a semitone above the root.', color: 1 },
  lydianDom: { label: 'lydian dominant', int: [0, 2, 4, 6, 7, 9, 10], why: 'Mixolydian with a ♯11 — the tritone-sub sound, bright and unresolved. Melodic minor a fifth below the root.', color: 6 },
  wholeTone: { label: 'whole tone', int: [0, 2, 4, 6, 8, 10], why: 'Six equal steps, no semitone anywhere — weightless and directionless. The scale for an augmented or 7♯5 chord.', color: 8 },
  halfWhole: { label: 'half-whole diminished', int: [0, 1, 3, 4, 6, 7, 9, 10], why: 'Eight notes alternating semitone and tone. Gives a dominant both a ♭9 and a ♯9 plus a ♯11 and a natural 13.', color: 3 },
  wholeHalf: { label: 'whole-half diminished', int: [0, 2, 3, 5, 6, 8, 9, 11], why: 'The diminished-7th chord scale — the chord itself plus a whole step above each of its notes.', color: 2 },
  mixolydianB13: { label: 'mixolydian ♭13', int: [0, 2, 4, 5, 7, 8, 10], why: 'Mixolydian with a lowered 6th — a dominant leaning minor without going fully altered.', color: 8 },
};

// Degree of the key → the scale a chord on it usually wants. Read as semitones
// above the *key* tonic, and the chord's own quality gets the final say below.
const MAJOR_DEGREE: Record<number, string> = {
  0: 'ionian', 2: 'dorian', 4: 'phrygian', 5: 'lydian', 7: 'mixolydian', 9: 'aeolian', 11: 'locrianNat2',
};
const MINOR_DEGREE: Record<number, string> = {
  0: 'melodicMinor', 2: 'locrianNat2', 3: 'lydian', 5: 'dorian', 7: 'phrygianDom', 8: 'lydian', 10: 'mixolydian',
};

/**
 * The scale for one analysed chord.
 *
 * `intervals` are the chord's own, so the chord can overrule the key: a m6
 * tonic gets a scale with a ♮6 in it whatever the key signature says.
 */
export function chordScale(a: AnalysedChord, intervals: number[]): ChordScale {
  const id = pickScale(a, intervals);
  const def = CHORD_SCALES[id];
  const rootPc = mod12(a.tonicPc + a.degree);
  return {
    id,
    name: def.label,
    intervals: def.int,
    pcs: def.int.map((iv) => mod12(rootPc + iv)),
    why: def.why,
    colorTone: def.color,
  };
}

function pickScale(a: AnalysedChord, intervals: number[]): string {
  const has = (x: number) => intervals.includes(x);
  const fam: ChordFamily = a.family;
  const mode: KeyMode = a.mode;
  const deg = a.degree;

  // ---- the chord's own alterations win outright ----
  // A written ♯11, ♭9 or ♭13 is an instruction, not a suggestion.
  if (fam === 'dom') {
    const b9 = has(13), s9 = has(15), s11 = has(18), b13 = has(20);
    if (b9 && s9) return 'halfWhole';
    if ((b9 || s9) && (b13 || !has(7))) return 'altered';
    if (s11) return 'lydianDom';
    if (b13) return 'mixolydianB13';
    if (b9) return mode === 'minor' ? 'phrygianDom' : 'altered';
    if (has(8) && !has(7)) return 'wholeTone'; // 7♯5
    // An unaltered dominant that is not the V of this key is a secondary
    // dominant — mixolydian on its own root, and altered if it aims at a minor.
    if (deg !== 7) return 'mixolydian';
    return mode === 'minor' ? 'phrygianDom' : 'mixolydian';
  }
  if (fam === 'dim7') return 'wholeHalf';
  if (fam === 'aug') return 'wholeTone';
  if (fam === 'm7b5') return 'locrianNat2';
  if (fam === 'sus') return 'mixolydian';

  if (fam === 'min') {
    // A natural 6th or a major 7th in the chord rules out aeolian, whatever
    // degree it sits on — this is why Blue Bossa's Cm6 is not the sad minor.
    const nat6 = has(9), maj7 = has(11);
    if (maj7) return 'melodicMinor';
    if (nat6) return deg === 0 && mode === 'minor' ? 'melodicMinor' : 'dorian';
    if (deg === 0 && mode === 'minor') return 'aeolian';
  }
  if (fam === 'maj' && has(6)) return 'lydian'; // a written ♭5/♯11 on a major chord

  const table = mode === 'major' ? MAJOR_DEGREE : MINOR_DEGREE;
  const byDegree = table[deg];
  if (byDegree) {
    // A minor tonic in a minor key defaults to melodic minor in the table, but
    // a plain m7 tonic has a ♭7 and wants the natural minor instead.
    if (byDegree === 'melodicMinor' && fam === 'min' && has(10)) return 'aeolian';
    return byDegree;
  }

  // Off the scale entirely — read the chord alone.
  if (fam === 'maj') return 'lydian';
  return 'dorian';
}

/**
 * A short line naming the chord's job, for the readout above the scale.
 * "ii of B♭ major — the set-up chord" beats a bare numeral.
 */
export function roleOf(a: AnalysedChord): string {
  const d = a.degree;
  if (a.mode === 'major') {
    if (d === 0) return 'home — the chord everything else is measured against';
    if (d === 7) return 'the dominant — it holds the tritone that pulls back to I';
    if (d === 2) return 'the set-up chord — ii leans into V';
    if (d === 5) return 'the lift away from home';
    if (d === 9) return 'the soft substitute for home';
    if (d === 4) return 'a floating, unresolved stand-in for the tonic';
    if (d === 11) return 'the leading-tone chord — dominant function without a root';
  } else {
    if (d === 0) return 'home — the minor tonic';
    if (d === 7) return 'the dominant — its raised 3rd is the leading tone';
    if (d === 2) return 'the minor set-up chord — iiø leans into V';
    if (d === 5) return 'the minor lift away from home';
    if (d === 3) return 'the relative major inside the minor key';
    if (d === 8) return 'the dark step above the dominant';
    if (d === 10) return 'the natural-minor dominant — no leading tone, so it is softer';
  }
  if (a.family === 'dom') return 'a borrowed dominant — it belongs to a key this one is only passing through';
  return 'outside the key — a chromatic colour';
}
