// Pure music-theory helpers. Faithful ports of the original Workbench methods,
// rewritten as standalone functions that take explicit state (tonic pitch
// class, scale id, extension) instead of reading `this.state`.

import {
  CS, CF, MAJOR, SCALES, INT, SUF, DIA_TRI, DIA_SEV, ROMAN, ROMAN7, FN,
  type Chord, type Fn, type ScaleId,
} from './constants';

export const mod12 = (n: number): number => ((n % 12) + 12) % 12;

// ---- enharmonic spelling ----
//
// Every black key has two names, and which one is *right* depends on the key
// you are in — not on a global sharps-or-flats preference. The rule real
// notation follows is "fewer accidentals wins", and you get there from the
// circle of fifths: a major key sitting `i` steps clockwise of C carries `i`
// sharps in its sharp spelling and 12 − i flats in its flat spelling. So flats
// win as soon as i > 6, and i === 6 is a genuine tie — one key signature of six
// sharps against one of six flats, both real, both used.
//
// Modes come along for free, because a mode is notated with its parent major's
// key signature: D dorian is C major's signature, so it spells like C major.
// That is the whole reason this has to know the scale and not just the tonic —
// pitch class 6 is G♭ when it is the major tonic (6♭, tied with F♯) but F♯ when
// it is the minor tonic, where the parent major is A and the signature is a
// mere 3 sharps. Harmonic and melodic minor borrow aeolian's signature and
// write their raised degrees as accidentals, which is why they map to it here.

const MODE_OFFSET: Record<ScaleId, number> = {
  ionian: 0, dorian: 2, phrygian: 4, lydian: 5, mixolydian: 7, aeolian: 9, locrian: 11,
  harmonic: 9, melodic: 9,
};

// Steps clockwise from C on the circle of fifths — i.e. how many sharps this
// major key needs when spelled with sharps. Its flat spelling needs 12 − i.
function fifthsIndex(majorPc: number): number {
  return mod12(majorPc * 7);
}

// The major key whose signature this tonic-and-scale is written with.
export function parentMajorPc(tonicPc: number, scale: ScaleId = 'ionian'): number {
  return mod12(tonicPc - MODE_OFFSET[scale]);
}

// True when this key is one of the two six-accidental spellings — the only
// case where neither name is more correct than the other.
export function isEnharmonicTie(tonicPc: number, scale: ScaleId = 'ionian'): boolean {
  return fifthsIndex(parentMajorPc(tonicPc, scale)) === 6;
}

// Ties resolve to flats: that makes the major tie G♭ (which is what this app has
// always shown) and the minor tie E♭ minor, which is overwhelmingly how it is
// written — D♯ minor's leading tone is C double-sharp, and nobody wants that.
export function prefFlat(tonicPc: number, scale: ScaleId = 'ionian'): boolean {
  return fifthsIndex(parentMajorPc(tonicPc, scale)) >= 6;
}

export function spell(pc: number, tonicPc: number, scale: ScaleId = 'ionian'): string {
  pc = mod12(pc);
  return prefFlat(tonicPc, scale) ? CF[pc] : CS[pc];
}

// The other spelling of the same key — the one the tie does not pick.
export function spellOther(pc: number, tonicPc: number, scale: ScaleId = 'ionian'): string {
  pc = mod12(pc);
  return prefFlat(tonicPc, scale) ? CS[pc] : CF[pc];
}

// Note names carry ASCII accidentals internally (CS/CF above) because that is
// what every note list in the app prints; a key *name* set in the serif face
// gets the real glyphs instead.
export function fmtKey(name: string): string {
  return name.replace('b', '♭').replace('#', '♯');
}

// A key's name split into letter and accidental, so the picker can centre the
// letter and hang the ♭/♯ off it and still have every chip line up.
export function keyLabel(pc: number, scale: ScaleId = 'ionian'): [string, string] {
  const s = spell(pc, pc, scale);
  return [s[0], fmtKey(s.slice(1))];
}

// How many sharps or flats this key signature actually carries, given the
// spelling above — the modes included, since they inherit the parent's.
export function keySigStr(tonicPc: number, scale: ScaleId = 'ionian'): string {
  const i = fifthsIndex(parentMajorPc(tonicPc, scale));
  if (i === 0) return 'no ♯/♭';
  if (i === 6) return '6 ♯/♭';
  return i < 6 ? `${i} ♯` : `${12 - i} ♭`;
}

export function pcs(r: number, q: string): number[] {
  return INT[q].map((i) => (r % 12 + i) % 12);
}

export function cname(r: number, q: string, tonicPc: number, scale: ScaleId = 'ionian'): string {
  return spell(r, tonicPc, scale) + SUF[q];
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
  return spell(tonicPc, tonicPc, scale) + ' ' + SCALES[scale].short;
}

export function scaleNotesStr(tonicPc: number, scale: ScaleId): string {
  const SI = SCALES[scale].int;
  return SI.map((i) => spell((tonicPc + i) % 12, tonicPc, scale)).join(' · ');
}

export function relMinorStr(tonicPc: number, scale: ScaleId = 'ionian'): string {
  return spell((tonicPc + 9) % 12, tonicPc, scale) + ' minor';
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
    return { rootPc: r, intervals, name: spell(r, tonicPc, scale) + suffix, roman, fn: FN[i], degLabels: allDeg.slice(0, count) };
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

export function subsFor(ch: Chord | null, tonicPc: number, scale: ScaleId = 'ionian'): Sub[] {
  if (!ch) return [];
  const r = ch.rootPc;
  const fn = ch.fn || 'T';
  const fam = inferFamily(gI(ch));
  const mk = (iv: number, q: string, tag: string, why: string): Sub => {
    const rp = mod12(r + iv);
    return { rootPc: rp, intervals: INT[q], quality: q, name: spell(rp, tonicPc, scale) + SUF[q], roman: '', tag, why, fn };
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

export function jzNotes(ch: Chord, voicing: string, tonicPc: number, scale: ScaleId = 'ionian'): string {
  return gPcs(jChVoiced(ch, voicing)).map((p) => spell(p, tonicPc, scale)).join(' ');
}

// classical inversion voicing of the selected chord
export function invChord(ch: Chord, which: number, tonicPc: number, scale: ScaleId = 'ionian'): Chord {
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
  const baseName = (ch.name || cname(ch.rootPc, 'maj', tonicPc, scale)).split('/')[0];
  const name = which === 0 ? baseName : baseName + '/' + spell(bassPc, tonicPc, scale);
  return { rootPc: ch.rootPc, intervals: gI(ch), name, roman: ch.roman, fn: ch.fn, midis: mids };
}

