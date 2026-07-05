// Static content tables: workshop genres, pattern library, and the Learn-mode
// jazz curriculum. Ported verbatim from the original Workbench.

import { spell, cname } from './theory';
import type { Fn } from './constants';

export interface ChordDef {
  iv: number;
  q?: string;
  roman?: string;
  fn?: Fn;
  intervals?: number[];
  name?: string;
  sub?: string;
  midis?: number[];
  deg?: string[];
}

export interface Preset {
  name: string;
  tempo?: number;
  chords: ChordDef[];
}

export interface Genre {
  name: string;
  items: Preset[];
}

export function genreDefs(): Genre[] {
  return [
    { name: 'Blues', items: [
      { name: '12-Bar Blues', tempo: 104, chords: [{ iv: 0, q: 'dom7', roman: 'I7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 0, q: 'dom7', roman: 'I7' }, { iv: 0, q: 'dom7', roman: 'I7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 0, q: 'dom7', roman: 'I7' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'dom7', roman: 'I7' }] },
      { name: 'Quick-Change', tempo: 108, chords: [{ iv: 0, q: 'dom7', roman: 'I7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 0, q: 'dom7', roman: 'I7' }, { iv: 0, q: 'dom7', roman: 'I7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'dom7', roman: 'I7' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }] },
      { name: 'Minor Blues', tempo: 92, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 5, q: 'min7', roman: 'iv7', fn: 'S' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }] },
    ] },
    { name: 'Jazz', items: [
      { name: 'ii–V–I', tempo: 120, chords: [{ iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'maj7', roman: 'Imaj7' }, { iv: 0, q: 'maj7', roman: 'Imaj7' }] },
      { name: 'I–vi–ii–V Turnaround', tempo: 132, chords: [{ iv: 0, q: 'maj7', roman: 'Imaj7' }, { iv: 9, q: 'min7', roman: 'vi7' }, { iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }] },
      { name: 'Bossa Nova', tempo: 128, chords: [{ iv: 0, q: 'maj7', roman: 'Imaj7' }, { iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'maj7', roman: 'Imaj7' }] },
    ] },
    { name: 'Pop', items: [
      { name: 'Axis I–V–vi–IV', tempo: 100, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 9, q: 'min', roman: 'vi' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }] },
      { name: 'Doo-Wop I–vi–IV–V', tempo: 92, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 9, q: 'min', roman: 'vi' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
      { name: 'vi–IV–I–V', tempo: 104, chords: [{ iv: 9, q: 'min', roman: 'vi' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 0, q: 'maj', roman: 'I' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
    ] },
    { name: 'Rock', items: [
      { name: 'Mixolydian I–♭VII–IV', tempo: 124, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 10, q: 'maj', roman: '♭VII' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 0, q: 'maj', roman: 'I' }] },
      { name: 'Lydian Vamp', tempo: 132, chords: [{ iv: 0, q: 'maj7', roman: 'Imaj7' }, { iv: 2, q: 'maj', roman: 'II' }, { iv: 0, q: 'maj7', roman: 'Imaj7' }, { iv: 2, q: 'maj', roman: 'II' }] },
      { name: 'Power I–IV–V', tempo: 140, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 0, q: 'maj', roman: 'I' }] },
    ] },
    { name: 'Funk / Soul', items: [
      { name: 'Funk Vamp', tempo: 108, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 0, q: 'min7', roman: 'i7' }] },
      { name: 'Soul I–iii–IV', tempo: 96, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 4, q: 'min', roman: 'iii' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
    ] },
    { name: 'Latin / Flamenco', items: [
      { name: 'Andalusian', tempo: 96, chords: [{ iv: 0, q: 'min', roman: 'i' }, { iv: 10, q: 'maj', roman: '♭VII' }, { iv: 8, q: 'maj', roman: '♭VI' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
      { name: 'Montuno I–IV–V', tempo: 120, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'maj', roman: 'I' }] },
    ] },
  ];
}

export interface Pattern {
  group: string;
  id: string;
  name: string;
  int?: number[];
  scaleInt?: number[];
  chord: string;
  deg?: string[];
  seq?: number[];
  tip: string;
}

export function patternDefs(): Pattern[] {
  return [
    { group: 'Scales', id: 'major', name: 'Major (Ionian)', int: [0, 2, 4, 5, 7, 9, 11], chord: 'maj7', deg: ['1', '2', '3', '4', '5', '6', '7'], tip: 'The home base. Resolve melodies onto the 1, 3 or 5. Sits over major and maj7 chords.' },
    { group: 'Scales', id: 'natmin', name: 'Natural Minor', int: [0, 2, 3, 5, 7, 8, 10], chord: 'min7', deg: ['1', '2', '♭3', '4', '5', '♭6', '♭7'], tip: 'The default serious/sad minor. Land on 1, ♭3 or 5. Over minor and m7 chords.' },
    { group: 'Scales', id: 'dorian', name: 'Dorian', int: [0, 2, 3, 5, 7, 9, 10], chord: 'min7', deg: ['1', '2', '♭3', '4', '5', '6', '♭7'], tip: 'Minor with a bright natural 6 — jazzy, funky. Great over a static m7 vamp.' },
    { group: 'Scales', id: 'mixo', name: 'Mixolydian', int: [0, 2, 4, 5, 7, 9, 10], chord: 'dom7', deg: ['1', '2', '3', '4', '5', '6', '♭7'], tip: 'Major with a ♭7 — the dominant-chord scale. Rock, funk and blues vamps.' },
    { group: 'Scales', id: 'lydian', name: 'Lydian', int: [0, 2, 4, 6, 7, 9, 11], chord: 'maj7', deg: ['1', '2', '3', '♯4', '5', '6', '7'], tip: 'Major with a ♯4 — floating and cinematic. Over maj7 / maj7♯11 chords.' },
    { group: 'Scales', id: 'phryg', name: 'Phrygian', int: [0, 1, 3, 5, 7, 8, 10], chord: 'min7', deg: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'], tip: 'Dark, Spanish ♭2 colour. Over minor chords for flamenco / metal tension.' },
    { group: 'Scales', id: 'harmmin', name: 'Harmonic Minor', int: [0, 2, 3, 5, 7, 8, 11], chord: 'min', deg: ['1', '2', '♭3', '4', '5', '♭6', '7'], tip: 'Natural minor with a raised 7 — use over the V7 of a minor key for that exotic pull.' },

    { group: 'Pentatonic & Blues', id: 'minpent', name: 'Minor Pentatonic', int: [0, 3, 5, 7, 10], chord: 'min7', deg: ['1', '♭3', '4', '5', '♭7'], tip: 'THE rock/blues box — five notes, no wrong ones. Works over minor and dominant chords.' },
    { group: 'Pentatonic & Blues', id: 'majpent', name: 'Major Pentatonic', int: [0, 2, 4, 7, 9], chord: 'maj', deg: ['1', '2', '3', '5', '6'], tip: 'Bright, open five notes — country, pop and rock solos over major chords.' },
    { group: 'Pentatonic & Blues', id: 'blues', name: 'Blues Scale', int: [0, 3, 5, 6, 7, 10], chord: 'dom7', deg: ['1', '♭3', '4', '♭5', '5', '♭7'], tip: 'Minor pentatonic plus the ♭5 “blue note”. Bend into the ♭5; resolve to 5 or 1.' },
    { group: 'Pentatonic & Blues', id: 'majblues', name: 'Major Blues', int: [0, 2, 3, 4, 7, 9], chord: 'dom7', deg: ['1', '2', '♭3', '3', '5', '6'], tip: 'Major pentatonic plus the ♭3 blue note — slide ♭3→3 for that sweet country sound.' },

    { group: 'Arpeggios', id: 'arpmaj', name: 'Major Triad', int: [0, 4, 7], chord: 'maj', deg: ['1', '3', '5'], tip: 'Outline the chord itself — the safest target notes over any major chord.' },
    { group: 'Arpeggios', id: 'arpmin', name: 'Minor Triad', int: [0, 3, 7], chord: 'min', deg: ['1', '♭3', '5'], tip: 'The three tones of any minor chord — strong, in-the-pocket melody anchors.' },
    { group: 'Arpeggios', id: 'arpdom7', name: 'Dominant 7', int: [0, 4, 7, 10], chord: 'dom7', deg: ['1', '3', '5', '♭7'], tip: 'Add the ♭7 — the 3 and ♭7 are the tension tones that define a dominant.' },
    { group: 'Arpeggios', id: 'arpmaj7', name: 'Major 7', int: [0, 4, 7, 11], chord: 'maj7', deg: ['1', '3', '5', '7'], tip: 'Lush resting arpeggio — the 7 is one half-step under the root, very sweet.' },
    { group: 'Arpeggios', id: 'arpmin7', name: 'Minor 7', int: [0, 3, 7, 10], chord: 'min7', deg: ['1', '♭3', '5', '♭7'], tip: 'The workhorse jazz/funk arpeggio — pairs with Dorian and natural minor.' },

    { group: 'Genre Licks', id: 'lickblues', name: 'Blues Box Lick', scaleInt: [0, 3, 5, 6, 7, 10], chord: 'dom7', seq: [0, 3, 5, 6, 7, 5, 3, 0], tip: 'A box-1 blues phrase: climb to the ♭5 blue note and fall back home. Bend the ♭3 and ♭5.' },
    { group: 'Genre Licks', id: 'lickrock', name: 'Rock Pentatonic Run', scaleInt: [0, 3, 5, 7, 10], chord: 'min7', seq: [0, 3, 5, 7, 10, 12, 10, 7], tip: 'Straight up minor-pentatonic box 1 and back — the bread-and-butter rock solo move.' },
    { group: 'Genre Licks', id: 'lickfunk', name: 'Funk Dorian Riff', scaleInt: [0, 2, 3, 5, 7, 9, 10], chord: 'min7', seq: [0, 3, 5, 7, 9, 7, 5, 3], tip: 'Dorian’s natural 6 gives the funk lift — loop it over a m7 vamp and stay in the pocket.' },
    { group: 'Genre Licks', id: 'lickjazz', name: 'Bebop Enclosure', scaleInt: [0, 2, 4, 5, 7, 9, 10], chord: 'dom7', seq: [-1, 1, 0, 4, 7, 10], tip: 'Chromatically box in the root (below & above), then arpeggiate up to the ♭7 — instant bebop.' },
  ];
}

export const PAT_GROUPS = ['Scales', 'Pentatonic & Blues', 'Arpeggios', 'Genre Licks'];

// ---- Learn-mode jazz curriculum ----

export interface JazzBlock {
  kind: 'h' | 'p' | 'chords' | 'seq' | 'callout';
  text?: string;
  label?: string;
  rows?: ChordDef[];
}
export interface JazzChapter {
  key: string;
  name: string;
  tag: string;
  intro: string;
  blocks: JazzBlock[];
}

export function jazzChapters(tonicPc: number): JazzChapter[] {
  const sp = (pc: number) => spell(pc, tonicPc);
  return [
    { key: 'ext', name: 'Extensions', tag: 'COLOR',
      intro: 'Jazz keeps stacking thirds past the 7th — adding the 9th, 11th and 13th. These are colour notes: they don’t change what the chord *does*, they change how rich it sounds. Click each to hear the colour deepen.',
      blocks: [
        { kind: 'h', text: 'Building up the I chord' },
        { kind: 'chords', rows: [{ iv: 0, q: 'maj', sub: 'triad' }, { iv: 0, q: 'maj7' }, { iv: 0, q: 'maj9' }, { iv: 0, q: 'maj13' }] },
        { kind: 'p', text: 'Same root, same function — each added third just floats another colour on top. maj7 is the basic jazz resting chord; the 9 and 13 make it lush.' },
        { kind: 'h', text: 'Building up the V (dominant)' },
        { kind: 'chords', rows: [{ iv: 7, q: 'dom7', fn: 'D' }, { iv: 7, q: 'dom9', fn: 'D' }, { iv: 7, q: 'dom13', fn: 'D' }] },
        { kind: 'h', text: '…and altering it for tension' },
        { kind: 'chords', rows: [
          { iv: 7, q: 'dom7', fn: 'D', intervals: [0, 4, 7, 10, 13], name: sp((tonicPc + 7) % 12) + '7♭9', sub: '♭9 — darker, dramatic' },
          { iv: 7, q: 'dom7', fn: 'D', intervals: [0, 4, 7, 10, 15], name: sp((tonicPc + 7) % 12) + '7♯9', sub: '♯9 — the “Hendrix” crunch' },
          { iv: 7, q: 'dom7', fn: 'D', intervals: [0, 4, 8, 10], name: sp((tonicPc + 7) % 12) + '7♯5', sub: '♯5 — whole-tone tension' }] },
        { kind: 'callout', text: 'Rule of thumb: extensions are decoration. A G13 sits anywhere a G7 does. Skip the natural 11 on major & dominant chords (it clashes with the 3rd) — use ♯11 instead.' },
      ] },
    { key: 'shell', name: 'Shell Chords', tag: 'COMPING',
      intro: 'You don’t need all the notes. The 3rd and 7th — the “guide tones” — are what your ear hears as the chord’s quality (major? minor? dominant?). The bass covers the root, so a comping pianist or guitarist can play just root + 3rd + 7th, or even only the 3rd & 7th. That’s a shell.',
      blocks: [
        { kind: 'h', text: 'Full chord vs. shell' },
        { kind: 'chords', rows: [
          { iv: 2, q: 'min7', fn: 'S', sub: 'full m7' },
          { iv: 2, q: 'min7', fn: 'S', intervals: [0, 3, 10], name: sp((tonicPc + 2) % 12) + 'm7 shell', sub: 'root 3 7' }] },
        { kind: 'chords', rows: [
          { iv: 7, q: 'dom7', fn: 'D', sub: 'full 7' },
          { iv: 7, q: 'dom7', fn: 'D', intervals: [0, 4, 10], name: sp((tonicPc + 7) % 12) + '7 shell', sub: 'root 3 ♭7' }] },
        { kind: 'p', text: 'Drop the 5th and you lose nothing essential — the chord still reads clearly. This leaves space for the melody and bass and sounds open, not muddy.' },
        { kind: 'h', text: 'Guide-tone voice leading' },
        { kind: 'p', text: 'The magic: across a ii–V–I the guide tones barely move. The 7th of one chord slides a half-step into the 3rd of the next. Play the shells and listen to the top voices step down.' },
        { kind: 'seq', label: 'ii–V–I shells', rows: [
          { iv: 2, q: 'min7', fn: 'S', intervals: [0, 3, 10], name: 'ii7' },
          { iv: 7, q: 'dom7', fn: 'D', intervals: [0, 4, 10], name: 'V7' },
          { iv: 0, q: 'maj7', fn: 'T', intervals: [0, 4, 11], name: 'Imaj7' }] },
        { kind: 'callout', text: 'This is how jazz is actually comped: two or three notes per chord, voice-led so the inner lines move as little as possible. Master shells before worrying about big lush voicings.' },
      ] },
    { key: 'inv', name: 'Inversions & Voice Leading', tag: 'MOTION',
      intro: 'An inversion is the same chord with a different note in the bass. They exist to make voices move smoothly — small steps instead of leaps — and to put a chosen note on the bottom.',
      blocks: [
        { kind: 'h', text: 'Three positions of the I chord' },
        { kind: 'chords', rows: [
          { iv: 0, q: 'maj', name: 'root', sub: '1 in bass', midis: [48, 52, 55, 60] },
          { iv: 0, q: 'maj', name: '1st inv', sub: '3 in bass', midis: [52, 55, 60, 64] },
          { iv: 0, q: 'maj', name: '2nd inv', sub: '5 in bass', midis: [55, 60, 64, 67] }] },
        { kind: 'p', text: 'Same three notes each time — only the lowest changes. The dock shows the same notes lit; your ear hears the bass move.' },
        { kind: 'h', text: 'Hear the difference voice leading makes' },
        { kind: 'seq', label: 'I–IV–V in root position (leaps)', rows: [
          { iv: 0, q: 'maj', name: 'I', midis: [48, 52, 55] },
          { iv: 5, q: 'maj', fn: 'S', name: 'IV', midis: [53, 57, 60] },
          { iv: 7, q: 'maj', fn: 'D', name: 'V', midis: [55, 59, 62] }] },
        { kind: 'seq', label: '…same chords, smooth voice leading', rows: [
          { iv: 0, q: 'maj', name: 'I', midis: [48, 52, 55] },
          { iv: 5, q: 'maj', fn: 'S', name: 'IV', midis: [48, 53, 57] },
          { iv: 7, q: 'maj', fn: 'D', name: 'V', midis: [50, 55, 59] }] },
        { kind: 'callout', text: 'Principle: move each voice to the nearest available note. Keep common tones, let the rest step. Smooth voice leading is what makes a progression sound “played” rather than “typed”.' },
      ] },
    { key: 'borrow', name: 'Borrowing', tag: 'MODAL INTERCHANGE',
      intro: 'Borrowing (modal interchange) means pulling a chord from the parallel minor key into your major key — same tonic, darker palette. It adds bittersweet colour without leaving the key.',
      blocks: [
        { kind: 'h', text: 'The famous one: minor iv' },
        { kind: 'chords', rows: [
          { iv: 5, q: 'maj', fn: 'S', name: 'IV (diatonic)', sub: 'bright' },
          { iv: 5, q: 'min', fn: 'S', name: 'iv (borrowed)', sub: 'bittersweet' },
          { iv: 0, q: 'maj', fn: 'T', name: 'I (home)' }] },
        { kind: 'p', text: 'Play IV→I, then iv→I. That minor-four melting back home is one of the most-loved sounds in music — Beatles, jazz ballads, film scores.' },
        { kind: 'h', text: 'More chords borrowed from the parallel minor' },
        { kind: 'chords', rows: [
          { iv: 8, q: 'maj', fn: 'S', name: '♭VI' },
          { iv: 10, q: 'maj', fn: 'D', name: '♭VII' },
          { iv: 3, q: 'maj', fn: 'T', name: '♭III' },
          { iv: 2, q: 'm7b5', fn: 'S', name: 'iiø7' }] },
        { kind: 'seq', label: 'A borrowed progression: I–♭VII–♭VI–V', rows: [
          { iv: 0, q: 'maj', name: 'I' },
          { iv: 10, q: 'maj', fn: 'D', name: '♭VII' },
          { iv: 8, q: 'maj', fn: 'S', name: '♭VI' },
          { iv: 7, q: 'dom7', fn: 'D', name: 'V7' }] },
        { kind: 'callout', text: 'You’re still in your major key — borrowing just recolours individual chords. The iiø7 (half-diminished two) borrowed from minor is also the gateway into a minor ii–V.' },
      ] },
    { key: 'iiv', name: 'The ii–V–I', tag: 'THE ENGINE',
      intro: 'The ii–V–I is the sentence of jazz. ii sets off (subdominant), V builds tension (dominant), I resolves home (tonic). Most standards are just chains of these. Learn it cold in every key and you can play jazz.',
      blocks: [
        { kind: 'h', text: 'The basic cadence' },
        { kind: 'seq', label: 'ii7 – V7 – Imaj7', rows: [
          { iv: 2, q: 'min7', fn: 'S', name: 'ii7' },
          { iv: 7, q: 'dom7', fn: 'D', name: 'V7' },
          { iv: 0, q: 'maj7', fn: 'T', name: 'Imaj7' }] },
        { kind: 'h', text: 'Dressed up with extensions' },
        { kind: 'seq', label: 'ii9 – V13 – Imaj9', rows: [
          { iv: 2, q: 'min9', fn: 'S', name: 'ii9' },
          { iv: 7, q: 'dom13', fn: 'D', name: 'V13' },
          { iv: 0, q: 'maj9', fn: 'T', name: 'Imaj9' }] },
        { kind: 'h', text: 'Tritone substitution' },
        { kind: 'p', text: 'Swap the V7 for a dominant 7 a tritone away — it shares the same guide tones, and the bass slides down chromatically into the I.' },
        { kind: 'seq', label: 'ii7 – ♭II7 – Imaj7', rows: [
          { iv: 2, q: 'min7', fn: 'S', name: 'ii7' },
          { iv: 1, q: 'dom7', fn: 'D', name: '♭II7 (sub)' },
          { iv: 0, q: 'maj7', fn: 'T', name: 'Imaj7' }] },
        { kind: 'h', text: 'Minor ii–V–i' },
        { kind: 'seq', label: 'iiø7 – V7♭9 – i', rows: [
          { iv: 2, q: 'm7b5', fn: 'S', name: 'iiø7' },
          { iv: 7, q: 'dom7', fn: 'D', intervals: [0, 4, 7, 10, 13], name: 'V7♭9' },
          { iv: 0, q: 'min7', fn: 'T', name: 'i7' }] },
        { kind: 'callout', text: 'Spotting ii–V–Is is reading jazz. A tune in C might tonicise other keys for a bar or two — each is its own little ii–V. Once your hands know the shape, the changes stop looking scary.' },
      ] },
  ];
}

// ---- Workshop palette definitions (quick progressions, cadences, etc.) ----

export const quickProgDefs = (tonicPc: number): Array<{ name: string; defs: ChordDef[] }> => [
  { name: 'ii–V–I', defs: [{ iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'maj7', roman: 'Imaj7', fn: 'T' }] },
  { name: 'ii–V', defs: [{ iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }] },
  { name: 'I–vi–ii–V', defs: [{ iv: 0, q: 'maj7', roman: 'Imaj7', fn: 'T' }, { iv: 9, q: 'min7', roman: 'vi7', fn: 'T' }, { iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }] },
  { name: 'Minor ii–V–i', defs: [{ iv: 2, q: 'm7b5', roman: 'iiø7', fn: 'S' }, { iv: 7, intervals: [0, 4, 7, 10, 13], name: cname((tonicPc + 7) % 12, 'dom7', tonicPc) + '♭9', roman: 'V7♭9', fn: 'D' }, { iv: 0, q: 'min7', roman: 'i7', fn: 'T' }] },
];

export const cadenceDefs: Array<{ name: string; defs: ChordDef[] }> = [
  { name: 'Authentic · V–I', defs: [{ iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 0, q: 'maj', roman: 'I', fn: 'T' }] },
  { name: 'Plagal · IV–I', defs: [{ iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 0, q: 'maj', roman: 'I', fn: 'T' }] },
  { name: 'Half · ii–V', defs: [{ iv: 2, q: 'min', roman: 'ii', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
  { name: 'Deceptive · V–vi', defs: [{ iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 9, q: 'min', roman: 'vi', fn: 'T' }] },
];

export const classicalProgDefs: Array<{ name: string; defs: ChordDef[] }> = [
  { name: 'I–IV–V–I', defs: [{ iv: 0, q: 'maj', roman: 'I', fn: 'T' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 0, q: 'maj', roman: 'I', fn: 'T' }] },
  { name: 'I–vi–IV–V', defs: [{ iv: 0, q: 'maj', roman: 'I', fn: 'T' }, { iv: 9, q: 'min', roman: 'vi', fn: 'T' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
  { name: 'Pachelbel', defs: [{ iv: 0, q: 'maj', roman: 'I', fn: 'T' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 9, q: 'min', roman: 'vi', fn: 'T' }, { iv: 4, q: 'min', roman: 'iii', fn: 'T' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 0, q: 'maj', roman: 'I', fn: 'T' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
  { name: 'Circle vi–ii–V–I', defs: [{ iv: 9, q: 'min', roman: 'vi', fn: 'T' }, { iv: 2, q: 'min', roman: 'ii', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 0, q: 'maj', roman: 'I', fn: 'T' }] },
  { name: 'Neapolitan ♭II–V–i', defs: [{ iv: 1, q: 'maj', roman: '♭II', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }, { iv: 0, q: 'min', roman: 'i', fn: 'T' }] },
];

export const jzBorrowDefs: ChordDef[] = [
  { iv: 5, q: 'min7', roman: 'iv7' }, { iv: 10, q: 'dom7', roman: '♭VII7' }, { iv: 8, q: 'maj7', roman: '♭VImaj7' }, { iv: 2, q: 'm7b5', roman: 'iiø7' },
];

export const jzSecondaryDefs: Array<{ tgt: string; iv: number }> = [
  { tgt: 'ii', iv: 9 }, { tgt: 'iii', iv: 11 }, { tgt: 'IV', iv: 0 }, { tgt: 'V', iv: 2 }, { tgt: 'vi', iv: 4 },
];
