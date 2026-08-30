// Reading chord symbols the way a fake book writes them.
//
// Everywhere else in this app a chord is *built* — you pick a key and the
// diatonic list hands you its chords already spelled. Transcribing a page is
// the other direction: the symbol is given, and its notes have to be worked
// out from it. This is that inverse, and it is deliberately forgiving, because
// the same chord is printed a dozen ways across editions and nobody wants
// their transcription rejected over a typo in someone else's engraving:
//
//     Em7b5   Em7♭5   Emin7(b5)   Eø7   Eø   E-7b5   Ehalfdim
//
// are all one chord, and all parse. What it will not do is guess: an unknown
// symbol comes back null so the strip can flag it rather than silently
// sounding something the page never asked for.

import { INT, SUF } from './constants';
import { mod12, REST_NAME } from './theory';

export interface ParsedChord {
  rootPc: number;
  intervals: number[];
  /** An INT key when the notes match one exactly, else 'custom'. */
  quality: string;
  /** Canonical app name (Eø7) — what the wheel and the diatonic chips call it. */
  name: string;
  /** The symbol as written, tidied to real ♭/♯ glyphs (Em7♭5). */
  typed: string;
  /** Slash-chord bass note, when one was written. */
  bassPc: number | null;
  /** A silent slot rather than a chord — N.C. on the page. */
  rest?: boolean;
}

// Silence, as the books mark it: N.C. (no chord) above the staff, or `tacet`
// where a part drops out for a section. A bar that sounds nothing is written
// down as deliberately as one that sounds something, so it parses like any
// other symbol rather than being flagged as a typo.
const REST_TOKEN = /^(n\.?\s?c\.?|no\s?chord|tacet|rest|silence|silent|_+)$/i;

const LETTER: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

// Every way the books write the same suffix, folded onto one spelling before
// anything tries to match it. Longest first — 'maj7' must win over 'maj'.
const SYNONYM: Array<[RegExp, string]> = [
  [/[Δ∆]7?/g, 'maj7'],
  [/ø7?/g, 'm7b5'],
  [/[°˚]/g, 'dim'],
  [/[–—]/g, '-'],
  [/halfdim(inished)?/gi, 'm7b5'],
  [/dimin(ished)?/gi, 'dim'],
  [/augmented|aug/gi, '+'],
  // Older engravings use - and + for ♭ and ♯ on a figure (C7-5, C7+9). Only
  // after a digit, though: a leading C-9 is a minor ninth, not a C7♭9.
  [/(\d)-(5|9|13)/g, '$1b$2'],
  [/(\d)\+(5|9|11)/g, '$1#$2'],
  // Capital M is major and lowercase m is minor, so these two cannot be folded
  // case-insensitively — CM7 and Cm7 are different chords.
  [/M(?=aj)/g, 'm'],
  [/M(?=[679])/g, 'maj'],
  [/minmaj|mmaj|-maj|m\(maj/gi, 'mmaj'],
  [/min|mi(?![n])/gi, 'm'],
  [/maj|ma(?![j])/gi, 'maj'],
  [/-/g, 'm'],
];

// Alteration figures, pulled out of the suffix before the core is matched.
// Order matters: b13 and b9 must be seen before a bare b5, and #11 before #1.
const ALTS: Array<[RegExp, number, number]> = [
  // pattern, scale degree, semitones from the root
  [/b13|♭13/g, 13, 20],
  [/#11|♯11/g, 11, 18],
  [/b9|♭9/g, 9, 13],
  [/#9|♯9/g, 9, 15],
  [/b5|♭5/g, 5, 6],
  [/#5|♯5/g, 5, 8],
];

// Which existing tone an alteration displaces, so 13b9 alters the 9 it already
// has rather than sounding both a ♭9 and a ♮9.
const SLOT: Record<number, number[]> = {
  5: [6, 7, 8], 9: [13, 14, 15], 11: [17, 18], 13: [20, 21],
};

// Core qualities, longest spelling first so 'm7' cannot swallow 'm7b5's stem.
const CORE: Array<[string, number[]]> = [
  ['mmaj13', [0, 3, 7, 11, 14, 17, 21]],
  ['mmaj9', [0, 3, 7, 11, 14]],
  ['mmaj7', [0, 3, 7, 11]],
  ['mmaj', [0, 3, 7, 11]],
  ['maj13', INT.maj13], ['maj11', INT.maj11], ['maj9', INT.maj9], ['maj7', INT.maj7],
  ['maj6', INT.maj6], ['maj', INT.maj],
  ['dim7', INT.dim7], ['dim', INT.dim],
  ['m13', INT.min13], ['m11', INT.min11], ['m9', INT.min9], ['m7', INT.min7],
  ['m6', INT.min6], ['m', INT.min],
  ['7sus4', INT.dom7sus], ['7sus', INT.dom7sus], ['sus4', INT.sus4], ['sus2', [0, 2, 7]], ['sus', INT.sus4],
  ['13', INT.dom13], ['11', INT.dom11], ['9', INT.dom9], ['7', INT.dom7], ['6', INT.maj6],
  ['+', INT.aug],
  ['5', [0, 7]],
  ['', INT.maj],
];

// Reverse of the SUF table: the notes decide what the app calls the chord, so
// a typed Em7b5 lands on the same name as the Eø7 the wheel generates.
const BY_INTERVALS = new Map<string, string>(
  Object.keys(INT).map((q) => [INT[q].join(','), q]),
);

function pretty(s: string): string {
  return s.replace(/b/g, '♭').replace(/#/g, '♯');
}

/**
 * Parse one chord symbol. Returns null when the text is not a chord at all,
 * so callers can mark it rather than guess.
 */
export function parseChord(text: string): ParsedChord | null {
  const raw = String(text || '').trim();
  if (!raw) return null;
  if (REST_TOKEN.test(raw)) {
    return { rootPc: -1, intervals: [], quality: 'rest', name: REST_NAME, typed: raw, bassPc: null, rest: true };
  }

  // 6/9 is a chord quality, not a slash chord — take it out of the way first.
  let work = raw.replace(/6\/9|69/g, 'six9');
  let bassPc: number | null = null;
  const slash = work.indexOf('/');
  if (slash >= 0) {
    const bass = work.slice(slash + 1).trim();
    const bm = /^([A-Ga-g])([b#♭♯]*)$/.exec(bass);
    if (!bm) return null; // a slash with something that isn't a note
    bassPc = mod12(LETTER[bm[1].toLowerCase()] + accidental(bm[2]));
    work = work.slice(0, slash);
  }

  const rm = /^([A-Ga-g])([b#♭♯]*)(.*)$/.exec(work.trim());
  if (!rm) return null;
  const rootPc = mod12(LETTER[rm[1].toLowerCase()] + accidental(rm[2]));
  const rootText = rm[1].toUpperCase() + rm[2].replace(/♭/g, 'b').replace(/♯/g, '#');

  // Normalise the suffix, then strip its alterations out so what remains is a
  // plain core quality the table can match.
  let suf = rm[3].replace(/[()\s]/g, '');
  SYNONYM.forEach(([re, to]) => { suf = suf.replace(re, to); });

  const alts: Array<[number, number]> = [];
  if (/alt(ered)?/i.test(suf)) {
    // The altered dominant is a named sound, not a stack of figures.
    suf = suf.replace(/altered|alt/gi, '');
    if (!/\d/.test(suf)) suf += '7';
    alts.push([5, 6], [9, 13], [13, 20]);
  }
  ALTS.forEach(([re, deg, semis]) => {
    if (re.test(suf)) { alts.push([deg, semis]); suf = suf.replace(re, ''); }
    re.lastIndex = 0;
  });

  let six9 = false;
  if (suf.includes('six9')) { six9 = true; suf = suf.replace(/six9/g, ''); }
  let add9 = false;
  if (/add9/.test(suf)) { add9 = true; suf = suf.replace(/add9/g, ''); }
  const noFifth = /no5/.test(suf);
  suf = suf.replace(/no[35]/g, '');

  const core = CORE.find(([k]) => k === suf);
  if (!core) return null;

  let intervals = core[1].slice();
  if (six9) intervals = [0, 4, 7, 9, 14];
  if (add9) intervals = [...intervals, 14];
  alts.forEach(([deg, semis]) => { intervals = applyAlt(intervals, deg, semis); });
  if (noFifth) intervals = intervals.filter((iv) => iv !== 7);
  intervals = [...new Set(intervals)].sort((a, b) => a - b);

  const quality = BY_INTERVALS.get(intervals.join(',')) || 'custom';
  const name = rootText + (quality !== 'custom' ? SUF[quality] : pretty(rm[3].replace(/[()\s]/g, '')));
  return { rootPc, intervals, quality, name: pretty(name), typed: pretty(raw), bassPc };
}

function accidental(s: string): number {
  let n = 0;
  for (const c of s) { if (c === 'b' || c === '♭') n--; else if (c === '#' || c === '♯') n++; }
  return n;
}

// Alterations displace rather than duplicate: a 13♭9 keeps one ninth.
function applyAlt(intervals: number[], deg: number, semis: number): number[] {
  const slots = SLOT[deg] || [];
  const out = intervals.filter((iv) => !slots.includes(iv));
  // A ♭9/♯9/♯11/♭13 on a plain triad or seventh implies the seventh beneath it,
  // which is how the figures are always meant — nobody writes a ♭9 over a triad.
  if (deg > 7 && !out.some((iv) => iv === 10 || iv === 11)) out.push(10);
  out.push(semis);
  return out;
}

/**
 * Split a line of changes into symbols. Bar lines, commas, dashes used as bar
 * separators and runs of whitespace all count as gaps, so a line copied off a
 * page — `Cm7 F7 | BbMaj7 EbMaj7` — comes through as written. A bar the page
 * marks N.C. comes through as a rest. Unparseable tokens come back as null in
 * place, keeping the index aligned with the input.
 */
export function parseChanges(text: string): Array<ParsedChord | null> {
  return String(text || '')
    .split(/[|,;\n\r\t]+|\s+/)
    .map((tok) => tok.trim())
    .filter((tok) => tok.length > 0 && tok !== '%' && tok !== '-')
    .map(parseChord);
}
