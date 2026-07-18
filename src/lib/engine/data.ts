// Static content tables: workshop genres, pattern library, and the Learn-mode
// jazz curriculum. Ported verbatim from the original Workbench.

import { spell, cname } from './theory';
import { FRET_TABS } from './fretpatterns';
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
    { name: 'Funk', items: [
      { name: 'One-Chord I9 (James Brown)', tempo: 104, chords: [{ iv: 0, q: 'dom9', roman: 'I9' }, { iv: 0, q: 'dom9', roman: 'I9' }, { iv: 0, q: 'dom9', roman: 'I9' }, { iv: 5, q: 'dom9', roman: 'IV9', fn: 'S' }] },
      { name: 'Dorian Funk i9–IV9', tempo: 100, chords: [{ iv: 0, q: 'min9', roman: 'i9' }, { iv: 0, q: 'min9', roman: 'i9' }, { iv: 5, q: 'dom9', roman: 'IV9', fn: 'S' }, { iv: 5, q: 'dom9', roman: 'IV9', fn: 'S' }] },
      { name: 'Funk Vamp i7–IV7', tempo: 108, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 0, q: 'min7', roman: 'i7' }] },
      { name: 'P-Funk i7–♭VII9', tempo: 96, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 10, q: 'dom9', roman: '♭VII9', fn: 'S' }, { iv: 0, q: 'min7', roman: 'i7' }] },
    ] },
    { name: 'Soul', items: [
      { name: 'Soul I–iii–IV–V', tempo: 96, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 4, q: 'min', roman: 'iii' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 7, q: 'maj', roman: 'V', fn: 'D' }] },
      { name: 'Sweet Soul I–IV (My Girl)', tempo: 102, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 0, q: 'maj', roman: 'I' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }] },
      { name: 'Southern Soul I–III7–IV–II7', tempo: 104, chords: [{ iv: 0, q: 'maj', roman: 'I' }, { iv: 4, q: 'dom7', roman: 'III7', fn: 'D' }, { iv: 5, q: 'maj', roman: 'IV', fn: 'S' }, { iv: 2, q: 'dom7', roman: 'II7', fn: 'D' }] },
      { name: 'Motown I7–IV7–V7', tempo: 112, chords: [{ iv: 0, q: 'dom7', roman: 'I7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'dom7', roman: 'I7' }] },
    ] },
    { name: 'Neo-Soul', items: [
      { name: 'Neo ii9–V13–Imaj9', tempo: 84, chords: [{ iv: 2, q: 'min9', roman: 'ii9', fn: 'S' }, { iv: 7, q: 'dom13', roman: 'V13', fn: 'D' }, { iv: 0, q: 'maj9', roman: 'Imaj9' }, { iv: 0, q: 'maj9', roman: 'Imaj9' }] },
      { name: 'Lush Descent IVmaj9–iii7–ii9–Imaj9', tempo: 76, chords: [{ iv: 5, q: 'maj9', roman: 'IVmaj9', fn: 'S' }, { iv: 4, q: 'min7', roman: 'iii7' }, { iv: 2, q: 'min9', roman: 'ii9', fn: 'S' }, { iv: 0, q: 'maj9', roman: 'Imaj9' }] },
      { name: 'D’Angelo i9–iv9', tempo: 72, chords: [{ iv: 0, q: 'min9', roman: 'i9' }, { iv: 0, q: 'min9', roman: 'i9' }, { iv: 5, q: 'min9', roman: 'iv9', fn: 'S' }, { iv: 5, q: 'min9', roman: 'iv9', fn: 'S' }] },
      { name: 'Backdoor Imaj9–♭VII9', tempo: 80, chords: [{ iv: 0, q: 'maj9', roman: 'Imaj9' }, { iv: 10, q: 'dom9', roman: '♭VII9', fn: 'D' }, { iv: 0, q: 'maj9', roman: 'Imaj9' }, { iv: 10, q: 'dom9', roman: '♭VII9', fn: 'D' }] },
    ] },
    { name: 'Jazz Fusion', items: [
      { name: 'Headhunters i7–IV7', tempo: 96, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }, { iv: 5, q: 'dom7', roman: 'IV7', fn: 'S' }] },
      { name: 'Sus Voyage I7sus–♭III7sus', tempo: 104, chords: [{ iv: 0, q: 'dom7sus', roman: 'I7sus' }, { iv: 0, q: 'dom7sus', roman: 'I7sus' }, { iv: 3, q: 'dom7sus', roman: '♭III7sus', fn: 'S' }, { iv: 3, q: 'dom7sus', roman: '♭III7sus', fn: 'S' }] },
      { name: 'Cantaloupe i7–♭VI7–vi7', tempo: 112, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 8, q: 'dom7', roman: '♭VI7', fn: 'S' }, { iv: 9, q: 'min7', roman: 'vi7' }, { iv: 0, q: 'min7', roman: 'i7' }] },
      { name: '80s Fusion i11–♭VIImaj7', tempo: 100, chords: [{ iv: 0, q: 'min11', roman: 'i11' }, { iv: 10, q: 'maj7', roman: '♭VIImaj7', fn: 'S' }, { iv: 0, q: 'min11', roman: 'i11' }, { iv: 10, q: 'maj7', roman: '♭VIImaj7', fn: 'S' }] },
    ] },
    { name: 'Disco', items: [
      { name: 'Four-on-the-Floor i7–♭VII', tempo: 116, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 10, q: 'maj', roman: '♭VII', fn: 'S' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 10, q: 'maj', roman: '♭VII', fn: 'S' }] },
      { name: 'Survive Circle (full cycle)', tempo: 112, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 5, q: 'min7', roman: 'iv7', fn: 'S' }, { iv: 10, q: 'dom7', roman: '♭VII7', fn: 'D' }, { iv: 3, q: 'maj7', roman: '♭IIImaj7' }, { iv: 8, q: 'maj7', roman: '♭VImaj7', fn: 'S' }, { iv: 2, q: 'm7b5', roman: 'iiø7', fn: 'S' }, { iv: 7, q: 'dom7', roman: 'V7', fn: 'D' }, { iv: 0, q: 'min7', roman: 'i7' }] },
      { name: 'Chic Groove i7–IV9', tempo: 118, chords: [{ iv: 0, q: 'min7', roman: 'i7' }, { iv: 0, q: 'min7', roman: 'i7' }, { iv: 5, q: 'dom9', roman: 'IV9', fn: 'S' }, { iv: 5, q: 'dom9', roman: 'IV9', fn: 'S' }] },
      { name: 'Uptown ii7–iii7–IVmaj7', tempo: 114, chords: [{ iv: 2, q: 'min7', roman: 'ii7', fn: 'S' }, { iv: 4, q: 'min7', roman: 'iii7' }, { iv: 5, q: 'maj7', roman: 'IVmaj7', fn: 'S' }, { iv: 4, q: 'min7', roman: 'iii7' }] },
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

    { group: 'Bassline Grooves', id: 'bassoct', name: 'Disco Octave Pump', scaleInt: [0, 3, 5, 7, 10], chord: 'min7', deg: ['1', '8'], seq: [0, 12, 0, 12, 0, 12, 10, 12], tip: 'Root–octave eighth notes locked to the four-on-the-floor kick — the engine of disco (Bernard Edwards, “Good Times”). Sneak the ♭7 in as a pickup back to the root.' },
    { group: 'Bassline Grooves', id: 'bassjamerson', name: 'Motown 1–5–6–♭7 Walk', scaleInt: [0, 2, 4, 5, 7, 9, 10], chord: 'dom7', deg: ['1', '5', '6', '♭7'], seq: [0, 7, 9, 10, 12, 10, 9, 7], tip: 'The James Jamerson / boogie cell: walk 1–5–6–♭7 up to the octave and back. Works over any dominant or blues chord — the bedrock of Motown and soul.' },
    { group: 'Bassline Grooves', id: 'bassjackson', name: 'Paul Jackson Dorian Riff', scaleInt: [0, 2, 3, 5, 7, 9, 10], chord: 'min7', deg: ['1', '2', '♭3', '5', '♭7'], seq: [0, 3, 0, 2, 3, 7, 10, 7], tip: 'Headhunters-style: a short, syncopated riff from Dorian that repeats until it’s hypnotic. Paul Jackson’s secret is the space — the rests are as funky as the notes.' },
    { group: 'Bassline Grooves', id: 'bassmarcus', name: 'Marcus Miller Slap Octaves', scaleInt: [0, 3, 5, 7, 10], chord: 'min7', deg: ['1', '♭7', '7', '8'], seq: [0, 12, 10, 12, 0, 12, 11, 12], tip: 'Thumb the root, pluck the octave, and slide in chromatically (♭7–7–8) à la Marcus Miller. On bass, mute the strings for percussive ghost notes between the hits.' },
    { group: 'Bassline Grooves', id: 'basschrom', name: 'Chromatic Approach Walk', scaleInt: [0, 4, 7, 10], chord: 'dom7', deg: ['1', '3', '5', '♭7'], seq: [0, 3, 4, 6, 7, 10, 11, 12], tip: 'Target the chord tones (3, 5, octave) and approach each from a half-step below. Chromatic approach notes are what make a funk line walk instead of hop.' },
  ];
}

export const PAT_GROUPS = ['Scales', 'Pentatonic & Blues', 'Arpeggios', 'Genre Licks', 'Bassline Grooves'];

// The chord-shape gallery is its own tab in the Patterns view — it plots chord
// qualities on the circle of fifths rather than listing scale/lick patterns, so
// it lives alongside the pattern groups but is not one of them.
export const PAT_SHAPES_TAB = 'Chord Shapes';
// Fretboard-diagram tabs (scale boxes, CAGED, chord shapes on the neck) are
// defined in engine/fretpatterns.ts and slot in between.
export const PAT_TABS = [...PAT_GROUPS, ...FRET_TABS, PAT_SHAPES_TAB];

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
    { key: 'keychange', name: 'Key Changes', tag: 'MODULATION',
      intro: 'A key change (modulation) moves the whole tonal centre — a new “home” chord, a new set of diatonic chords. Done well it re-lights a song: the final chorus lifts, the bridge breathes different air, a long piece gets a second act. The craft is in the join: how you travel decides whether it feels inevitable or bolted on.',
      blocks: [
        { kind: 'h', text: 'When is a key change appropriate?' },
        { kind: 'p', text: 'Three classic moments: (1) the last chorus — jump up a half or whole step for pure energy; (2) the bridge — slip to a related key (the IV, the V, or the relative minor) for contrast, then come home; (3) a new section of a longer piece — modulate to the dominant key and let it become the temporary home. The common thread: change key at a structural seam, landing the new tonic on a strong downbeat.' },
        { kind: 'h', text: 'The smooth way · pivot chord' },
        { kind: 'p', text: 'Find a chord both keys share and let it change its meaning mid-air. Modulating up a fifth, the vi of the old key is the ii of the new one: the ear enters the chord in the old key and leaves it in the new. Then the new key’s V7 seals it.' },
        { kind: 'seq', label: 'Pivot up a 5th · I → vi (=ii of V) → V7-of-new → new I', rows: [
          { iv: 0, q: 'maj7', name: 'Imaj7', sub: 'old home' },
          { iv: 9, q: 'min7', fn: 'S', name: 'vi7', sub: 'pivot — also ii of the new key' },
          { iv: 2, q: 'dom7', fn: 'D', name: 'II7', sub: 'the NEW key’s V7' },
          { iv: 7, q: 'maj7', name: 'Vmaj7', sub: 'new home, a 5th up' }] },
        { kind: 'h', text: 'The jazz way · ii–V into anywhere' },
        { kind: 'p', text: 'Any key is two chords away: play the new key’s ii–V and land. This is how standards drift through three keys in eight bars — each destination gets its own little ii–V escort. Here’s a lift up a minor third:' },
        { kind: 'seq', label: 'ii–V into ♭III · new key a minor 3rd up', rows: [
          { iv: 5, q: 'min7', fn: 'S', name: 'iv7', sub: 'ii of the new key' },
          { iv: 10, q: 'dom7', fn: 'D', name: '♭VII7', sub: 'V of the new key' },
          { iv: 3, q: 'maj7', name: '♭IIImaj7', sub: 'new home' }] },
        { kind: 'h', text: 'The pop way · the truck-driver lift' },
        { kind: 'p', text: 'For the final chorus, just go — up a semitone (or a whole tone), no pivot, maximum drama. If you want a hint of glue, hit the new key’s V7 for one beat first; the ear snaps to the new centre instantly.' },
        { kind: 'seq', label: 'Semitone lift · I → V7-of-new → new I (♭II)', rows: [
          { iv: 0, q: 'maj', name: 'I', sub: 'last time in the old key' },
          { iv: 8, q: 'dom7', fn: 'D', name: 'V7/♭II', sub: 'one beat of glue' },
          { iv: 1, q: 'maj', name: '♭II', sub: 'everything a fret higher' }] },
        { kind: 'seq', label: 'Whole-tone lift · I → V7-of-new → new I (II)', rows: [
          { iv: 0, q: 'maj', name: 'I' },
          { iv: 9, q: 'dom7', fn: 'D', name: 'V7/II', sub: 'V of the new key' },
          { iv: 2, q: 'maj', name: 'II', sub: 'new home, a tone up' }] },
        { kind: 'h', text: 'The free moves · relative & parallel' },
        { kind: 'p', text: 'Relative keys (C major ↔ A minor) share every note — no accidentals change, you just start treating vi as home. Parallel keys (C major ↔ C minor) keep the root and swap the colour; ending a minor song on the major I is the famous Picardy third. Hear major-home versus its parallel minor-home:' },
        { kind: 'chords', rows: [
          { iv: 0, q: 'maj', name: 'I', sub: 'major home' },
          { iv: 0, q: 'min', name: 'i (parallel)', sub: 'same root, darker world' },
          { iv: 9, q: 'min', name: 'vi (relative)', sub: 'same notes, new home' }] },
        { kind: 'callout', text: 'Rules of thumb: neighbours on the circle of fifths share 6 of 7 notes, so those modulations feel smooth; distant keys feel dramatic. Prepare the arrival with the new key’s V7 (or a full ii–V), land the new I on a strong beat, then confirm it with a cadence. Try it live: in the Workshop’s Jazz palette, the SECONDARY DOMINANTS row is a rack of doorways into other keys — and the key strip up top retunes the whole app when you follow one.' },
      ] },
    { key: 'groove', name: 'Groove Harmony', tag: '70s & 80s',
      intro: 'Funk, soul, neo-soul and disco flipped the rules: instead of travelling through changes, the band parks on one or two rich chords and lets rhythm do the storytelling. The harmony is a texture — extended, modal, hypnotic. This is the sound of the 70s and 80s.',
      blocks: [
        { kind: 'h', text: 'Funk: the vamp is the song' },
        { kind: 'p', text: 'James Brown built entire tunes on a single dominant 9 chord. Herbie Hancock’s Headhunters lived on two chords from Dorian — the minor i with its bright natural 6, answered by a dominant IV. Loop it and the groove IS the form.' },
        { kind: 'seq', label: 'Dorian funk vamp · i9–IV9', rows: [
          { iv: 0, q: 'min9', name: 'i9' },
          { iv: 5, q: 'dom9', fn: 'S', name: 'IV9' },
          { iv: 0, q: 'min9', name: 'i9' },
          { iv: 5, q: 'dom9', fn: 'S', name: 'IV9' }] },
        { kind: 'h', text: 'Soul: gospel triads with grit' },
        { kind: 'p', text: 'Classic 60s–70s soul keeps the church progressions (I–IV, I–iii–IV) but plays every chord with a 7 and a backbeat. Motown even makes the I a dominant 7 — bluesy, not “wrong”.' },
        { kind: 'seq', label: 'Motown vamp · I7–IV7–V7', rows: [
          { iv: 0, q: 'dom7', name: 'I7' },
          { iv: 5, q: 'dom7', fn: 'S', name: 'IV7' },
          { iv: 7, q: 'dom7', fn: 'D', name: 'V7' },
          { iv: 0, q: 'dom7', name: 'I7' }] },
        { kind: 'h', text: 'Neo-soul: extensions as air' },
        { kind: 'p', text: 'D’Angelo, Erykah Badu, Robert Glasper: take the jazz ii–V–I, slow it down, and voice everything with 9s, 11s and 13s. The extensions aren’t tension to resolve — they’re the atmosphere. Nudge chords in half a beat late and let them blur.' },
        { kind: 'seq', label: 'Neo-soul cadence · ii9–V13–Imaj9', rows: [
          { iv: 2, q: 'min9', fn: 'S', name: 'ii9' },
          { iv: 7, q: 'dom13', fn: 'D', name: 'V13' },
          { iv: 0, q: 'maj9', fn: 'T', name: 'Imaj9' }] },
        { kind: 'h', text: 'Disco: minor keys around the circle' },
        { kind: 'p', text: 'Disco loves a minor key on the move — chains of m7 chords falling in fifths (the “I Will Survive” cycle), all glued to a four-on-the-floor kick. Here’s the first half of the full circle.' },
        { kind: 'seq', label: 'Disco cycle · i7–iv7–♭VII7–♭IIImaj7', rows: [
          { iv: 0, q: 'min7', name: 'i7' },
          { iv: 5, q: 'min7', fn: 'S', name: 'iv7' },
          { iv: 10, q: 'dom7', fn: 'D', name: '♭VII7' },
          { iv: 3, q: 'maj7', name: '♭IIImaj7' }] },
        { kind: 'callout', text: 'The 70s/80s recipe: pick ONE or TWO chords, extend them (9s and 13s), choose a mode with character (Dorian, Mixolydian), and repeat until it feels inevitable. Load the Funk, Neo-Soul and Disco templates in the Workshop and jam over them.' },
      ] },
    { key: 'bass', name: 'Funky Basslines', tag: 'THE POCKET',
      intro: 'A funky bassline is rhythm first, notes second. Paul Jackson (Headhunters), James Jamerson (Motown), Bernard Edwards (Chic) and Marcus Miller all obey the same laws: land the root on the ONE, decorate with a small set of trusted notes, and leave space for the groove to breathe.',
      blocks: [
        { kind: 'h', text: 'Law 1 · own the ONE' },
        { kind: 'p', text: 'Whatever else happens, the root lands on beat one — that’s James Brown’s law. Everything after the downbeat is syncopation, ghost notes and anticipation, but the ONE anchors the whole band.' },
        { kind: 'h', text: 'Law 2 · a small trusted palette' },
        { kind: 'p', text: 'Funk bass rarely uses the whole scale. The core palette over any groove chord: root, 5, 6, ♭7 and the octave — plus chromatic passing notes squeezed between them. Hear the key colour-pairs:' },
        { kind: 'chords', rows: [
          { iv: 0, q: 'maj', intervals: [0, 12], name: 'R + octave', sub: 'the disco pump' },
          { iv: 0, q: 'maj', intervals: [0, 10], name: 'R + ♭7', sub: 'the funk growl' },
          { iv: 0, q: 'maj', intervals: [0, 7, 9], name: 'R · 5 · 6', sub: 'the Motown walk cell' },
          { iv: 0, q: 'maj', intervals: [0, 3, 5], name: 'R · ♭3 · 4', sub: 'the dorian riff cell' }] },
        { kind: 'h', text: 'Law 3 · ghost notes are the funk' },
        { kind: 'p', text: 'Between the real notes, funk bassists mute the string and pluck anyway — a pitchless “chk”. A line like 1 · (ghost) · ♭7 · (ghost) · 1 turns the bass into a drum. On the workbench, imagine the rests in every pattern as ghosted 16ths.' },
        { kind: 'h', text: 'Paul Jackson · the riff that never quits' },
        { kind: 'p', text: 'On Headhunters, Paul Jackson plays short Dorian riffs — heavily syncopated, full of space — and repeats them until they’re hypnotic, shifting one note at a time as the groove evolves. Try it: Patterns → Bassline Grooves → “Paul Jackson Dorian Riff”, looped over the Workshop’s “Headhunters i7–IV7” template.' },
        { kind: 'h', text: 'Marcus Miller · slap, octaves, chromatics' },
        { kind: 'p', text: 'Marcus Miller’s slap style: thumb the root, pluck the octave, connect targets with chromatic approach notes (♭7–7–8), and pepper everything with dead-note 16ths. The pattern “Marcus Miller Slap Octaves” walks the shape; the “Chromatic Approach Walk” drills the connective tissue.' },
        { kind: 'h', text: 'Jamerson & Edwards · the walking pocket' },
        { kind: 'p', text: 'James Jamerson walks 1–5–6–♭7 cells with chromatic pickups under Motown; Bernard Edwards drives disco with relentless root–octave eighths (“Good Times” — the line hip-hop was born over). Both live in the Bassline Grooves patterns.' },
        { kind: 'seq', label: 'Groove to practise over · i9–IV9', rows: [
          { iv: 0, q: 'min9', name: 'i9' },
          { iv: 5, q: 'dom9', fn: 'S', name: 'IV9' }] },
        { kind: 'callout', text: 'Practise with the metronome on 2 and 4, lock your root to the imaginary kick drum, and remember Jackson’s rule: if it doesn’t groove as two bars looped forever, it doesn’t groove. Then build your own: Workshop → BASS lays any of these grooves under your chord changes, live.' },
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

// ---- Learn-mode song structures ----
// Each form is a proportional timeline: `n` is the section's relative length
// (any unit — bars or minutes — consistent within one form), `k` picks the
// section colour. The peak of the arc is the long-form fusion epic.

export type FormKind = 'intro' | 'verse' | 'pre' | 'chorus' | 'bridge' | 'solo' | 'vamp' | 'free' | 'outro';

export interface SongForm {
  id: string;
  name: string;
  genre: string;
  dur: string; // human duration, e.g. '~3:30'
  text: string;
  listen: string; // "hear it in the wild" pointer
  sections: Array<{ l: string; n: number; k: FormKind }>;
}

export const SONG_FORMS: SongForm[] = [
  { id: 'pop', name: 'Verse–Chorus', genre: 'POP / ROCK', dur: '~3:30',
    text: 'Radio economics: reach the hook fast, repeat it often, be gone before anyone tires. Verses tell the story on lower energy, the pre-chorus tightens the spring, the chorus is the payoff — same words, same melody, every time. The bridge exists to make the LAST chorus feel new again; that final chorus is often doubled or lifted a key (see Key Changes).',
    listen: 'Almost any chart single since The Beatles. Count along: sections nearly always come in 4- and 8-bar blocks.',
    sections: [
      { l: 'Intro', n: 4, k: 'intro' }, { l: 'Verse 1', n: 16, k: 'verse' }, { l: 'Pre', n: 8, k: 'pre' }, { l: 'Chorus', n: 8, k: 'chorus' },
      { l: 'Verse 2', n: 16, k: 'verse' }, { l: 'Pre', n: 8, k: 'pre' }, { l: 'Chorus', n: 8, k: 'chorus' },
      { l: 'Bridge', n: 8, k: 'bridge' }, { l: 'Final chorus ×2', n: 16, k: 'chorus' }, { l: 'Out', n: 4, k: 'outro' },
    ] },
  { id: 'blues', name: 'The 12-Bar Loop', genre: 'BLUES', dur: 'loops forever',
    text: 'Here the form IS the harmony: one 12-bar chorus of I–IV–V, repeated until the night ends. Nobody arranges sections — the band counts choruses. Verse, guitar solo, harp solo: all the SAME twelve bars, distinguished only by who is on top. That is why strangers can play blues together instantly: everyone already knows the map.',
    listen: 'Load Workshop → Blues → 12-Bar Blues and let it cycle; every repeat is one “chorus”.',
    sections: [
      { l: 'Chorus 1 · sing', n: 12, k: 'verse' }, { l: 'Chorus 2 · sing', n: 12, k: 'verse' },
      { l: 'Chorus 3 · guitar solo', n: 12, k: 'solo' }, { l: 'Chorus 4 · solo', n: 12, k: 'solo' },
      { l: 'Chorus 5 · sing out', n: 12, k: 'verse' },
    ] },
  { id: 'aaba', name: 'AABA · the 32-bar standard', genre: 'JAZZ STANDARD', dur: '~5:00',
    text: 'The Great American Songbook shape: an 8-bar A theme stated twice, an 8-bar B section (“the bridge” — new key area, fresh air), then A again. Jazz musicians play the 32-bar “head” once, then improvise full choruses OVER the invisible repeating form, and close with the head again. The listener’s skill is hearing the form under the solos — the soloist is always somewhere in AABA.',
    listen: '“Autumn Leaves”, “I Got Rhythm” (whose changes became a form of their own), most Real Book tunes.',
    sections: [
      { l: 'Head A', n: 8, k: 'verse' }, { l: 'A', n: 8, k: 'verse' }, { l: 'B bridge', n: 8, k: 'bridge' }, { l: 'A', n: 8, k: 'verse' },
      { l: 'Solos over the form ×N', n: 32, k: 'solo' }, { l: 'Head out · AABA', n: 32, k: 'verse' },
    ] },
  { id: 'funk', name: 'The Vamp & the Cue', genre: 'FUNK / SOUL', dur: '~5:00 (or all night)',
    text: 'Funk replaces the songwriter’s map with the bandleader’s hand: the band parks on ONE groove and the “form” is a set of live cues — “take it to the bridge!”, a horn hit, four to the ONE. Sections are open-ended; the drop to the bridge lands wherever the leader feels the room peak. Structure becomes a social act, not a chart.',
    listen: 'James Brown, “Sex Machine” — listen for the shouted cues steering the band between groove and bridge.',
    sections: [
      { l: 'Count-in hits', n: 2, k: 'intro' }, { l: 'The groove · vamp', n: 16, k: 'vamp' }, { l: 'Bridge!', n: 8, k: 'bridge' },
      { l: 'Groove again', n: 12, k: 'vamp' }, { l: 'Breakdown · drums', n: 6, k: 'free' }, { l: 'Groove out', n: 10, k: 'vamp' },
    ] },
  { id: 'edm', name: 'Build & Drop', genre: 'ELECTRONIC / DANCE', dur: '~6:00',
    text: 'Dance music is engineered in 8-, 16- and 32-bar phrase blocks for one reason: the DJ. Long percussion-only intros and outros are handles for beat-matching into the next record. Inside, tension is manufactured mechanically — filters open, drums thin out, a riser climbs — and released at the drop, where the kick and bass slam back. Energy over melody, phrase-math over storytelling.',
    listen: 'Any club track: count 32 bars from the intro and the first new element arrives almost on schedule.',
    sections: [
      { l: 'DJ intro · drums only', n: 16, k: 'intro' }, { l: 'Groove +bass', n: 16, k: 'vamp' }, { l: 'Build', n: 8, k: 'pre' }, { l: 'DROP', n: 16, k: 'chorus' },
      { l: 'Breakdown', n: 16, k: 'free' }, { l: 'Build', n: 8, k: 'pre' }, { l: 'DROP 2', n: 16, k: 'chorus' }, { l: 'DJ outro', n: 16, k: 'outro' },
    ] },
  { id: 'fusion', name: 'The Long Form · Bitches Brew', genre: 'JAZZ FUSION · THE PEAK', dur: '15–27 min',
    text: 'Miles Davis’ Bitches Brew (1970) throws away the map entirely. No verses, no 32 bars — a piece is a LANDSCAPE: a rhythm section (two basses, multiple keyboards, two drummers) locks a modal one-chord vamp, and time is organised by texture and density instead of bar counts. Miles conducts in real time — a trumpet phrase or a raised hand cues the next zone: a soloist enters, the groove thickens, a composed theme surfaces for a moment and dissolves, a free section lets the pulse evaporate, then the vamp reassembles. And a second composer works after the fact: producer Teo Macero cut and spliced the tapes, looping and re-ordering sections — studio editing as musical form. How to listen: don’t count bars. Hold on to the bass vamp, notice each arrival and departure, and feel the 20 minutes as one long tide coming in and going out.',
    listen: '“Bitches Brew” (27 min) and “Pharaoh’s Dance” (20 min). Then build your own: park the Workshop on the Dorian i9–IV9 vamp, drums rolling, and improvise entrances and exits.',
    sections: [
      { l: 'Open · textures gather', n: 2, k: 'intro' }, { l: 'Bass vamp locks in', n: 2, k: 'vamp' }, { l: 'Trumpet solo over the vamp', n: 3, k: 'solo' },
      { l: 'Cued theme', n: 1, k: 'bridge' }, { l: 'Guitar & keys solos', n: 3, k: 'solo' }, { l: 'Free · time dissolves', n: 2, k: 'free' },
      { l: 'Vamp returns', n: 1.5, k: 'vamp' }, { l: 'Theme cue · fade', n: 1.5, k: 'outro' },
    ] },
];
