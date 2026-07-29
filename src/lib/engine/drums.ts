// Drum engine for the DRUMS groovebox. A pattern is one bar on a 16-step grid
// (one 16th per step) across a fixed kit of synthesized voices. Every genre
// template is authored as *layers* — the order a drummer would actually build
// the groove — so stepping through them teaches how the pattern is constructed:
// anchor the kick, answer with the backbeat, fill the subdivision, then add
// the syncopation and ghosts that make the style.

import { DRUM_VOICES, inKitOrder } from './kit';
import type { DrumVoiceId } from './kit';
import { FAMILIES, GENRES, type StudioGenre } from './genres';
import { ROCK_POP_PATTERNS } from './patterns/rockpop';
import { FUNK_SOUL_PATTERNS } from './patterns/funksoul';
import { HIPHOP_PATTERNS } from './patterns/hiphop';
import { HOUSE_PATTERNS } from './patterns/house';
import { TECHNO_PATTERNS } from './patterns/techno';
import { BREAKS_PATTERNS } from './patterns/breaks';
import { HARD_PATTERNS } from './patterns/hard';
import { JAZZ_PATTERNS } from './patterns/jazz';
import { WORLD_PATTERNS } from './patterns/world';

// The instrument table lives in kit.ts — one entry per instrument, carrying its
// row metadata and its synthesis recipe. Re-exported here so callers keep a
// single import for "the drum engine".
export { DRUM_VOICES, drumVoice, inKitOrder } from './kit';
export type {
  DrumVoice, DrumVoiceId, DrumVoiceDef, DrumVoiceKind,
  DrumSynthLayer, DrumNoiseLayer, DrumToneLayer, DrumFilter, DrumWave,
} from './kit';

export const DRUM_STEPS = 16;

/** One row of grid cells: 0 = rest, 1 = normal hit, 2 = accent. */
export type DrumCell = 0 | 1 | 2;
export type DrumGrid = Record<DrumVoiceId, DrumCell[]>;

// One voice's contribution to a layer: which steps turn on, and which of
// those are accented.
export interface DrumLayerPart { v: DrumVoiceId; on: number[]; acc?: number[] }

export interface DrumLayer {
  name: string; // "The backbeat"
  why: string;  // what this layer contributes to the groove
  add: DrumLayerPart[];
}

export interface DrumTemplate {
  id: string;
  name: string;   // the *variation* name inside its genre ("Half-time", "Liquid roller")
  genre: string;  // DrumGenre id — the picker is genre first, variation second
  bpm: number;    // authentic tempo for the style
  swing: number;  // 50 = straight … 75 = hard shuffle (percent of the beat-pair)
  tip: string;    // what defines the variation, read next to the grid
  layers: DrumLayer[];
}

/**
 * A genre groups its variations. The picker is dependent: choose a genre, then
 * one of its patterns. The taxonomy itself lives in `engine/genres.ts` — the
 * same shelf the bassline and progression libraries hang off — so `maschine`
 * (the practical note for programming the style in a groovebox) and `blurb`
 * are read straight from there.
 */
export type DrumGenre = StudioGenre;

export const DRUM_FAMILIES = FAMILIES;
export const DRUM_GENRES: DrumGenre[] = GENRES;

export function drumGenres(): DrumGenre[] { return DRUM_GENRES; }

export function drumTemplates(): DrumTemplate[] {
  return [
    ...ROCK_POP_PATTERNS,
    ...FUNK_SOUL_PATTERNS,
    ...HIPHOP_PATTERNS,
    ...HOUSE_PATTERNS,
    ...TECHNO_PATTERNS,
    ...BREAKS_PATTERNS,
    ...HARD_PATTERNS,
    ...JAZZ_PATTERNS,
    ...WORLD_PATTERNS,
  ];
}

/** Empty 16-step grid across every voice. */
export function emptyGrid(): DrumGrid {
  const g = {} as DrumGrid;
  DRUM_VOICES.forEach((v) => { g[v.id] = Array(DRUM_STEPS).fill(0) as DrumCell[]; });
  return g;
}

/**
 * Materialise the first `nLayers` layers of a template into a playable grid.
 * Accents win over plain hits when layers overlap a step.
 */
export function composeGrid(tpl: DrumTemplate, nLayers: number): DrumGrid {
  const g = emptyGrid();
  tpl.layers.slice(0, Math.max(0, nLayers)).forEach((layer) => {
    layer.add.forEach((part) => {
      part.on.forEach((s) => { if (g[part.v][s] < 1) g[part.v][s] = 1; });
      (part.acc || []).forEach((s) => { g[part.v][s] = 2; });
    });
  });
  return g;
}

/** Which instruments actually sound in a grid, in kit (top-to-bottom) order. */
export function voicesInGrid(g: DrumGrid): DrumVoiceId[] {
  return inKitOrder(DRUM_VOICES.filter((v) => g[v.id].some((c) => c !== 0)).map((v) => v.id));
}

/**
 * The rows a template needs: every instrument any of its layers touches, even
 * the ones only introduced by the last layer. Rows stay put while you step the
 * layer stepper, so the grid never reshuffles under your finger.
 */
export function templateVoices(tpl: DrumTemplate): DrumVoiceId[] {
  const used = new Set<DrumVoiceId>();
  tpl.layers.forEach((l) => l.add.forEach((p) => used.add(p.v)));
  return inKitOrder([...used]);
}

/**
 * Swing as groovebox timing: how late a step plays, in fractional steps.
 * `swing` is the percent of each beat-pair the first 8th occupies — 50 is
 * straight, 66⅔ is a true triplet shuffle, 75 a dotted hard-shuffle. Off-beat
 * 8ths (step 2 of each beat) get the full delay; the odd 16ths around them
 * get half, so inner subdivisions stay inside the swung 8ths.
 */
export function swingDelaySteps(s: number, swing: number): number {
  const d = (4 * swing) / 100 - 2;
  if (s % 4 === 2) return d;
  if (s % 2 === 1) return d / 2;
  return 0;
}

/**
 * Where the playhead belongs `elapsed` seconds into a bar: the last step whose
 * hit has actually sounded. Swing is part of the answer — a swung step lights
 * when you hear it, not when its grid line goes by — so the ring stays on the
 * note the ear is hearing instead of running ahead of the kit. Returns -1
 * before the bar starts.
 */
export function stepAtElapsed(elapsed: number, stepSec: number, swing: number): number {
  if (!(stepSec > 0) || elapsed < 0) return -1;
  let s = Math.min(DRUM_STEPS - 1, Math.floor(elapsed / stepSec));
  // Walk back over any step that swings late enough not to have sounded yet.
  while (s > 0 && elapsed < (s + swingDelaySteps(s, swing)) * stepSec) s--;
  return s;
}

// The count along the top of the grid: 16ths are spoken "1 e & a 2 e & a…".
export const DRUM_COUNT = ['1', 'e', '&', 'a', '2', 'e', '&', 'a', '3', 'e', '&', 'a', '4', 'e', '&', 'a'];

// ---------------------------------------------------------------------------
// Rhythm theory for the Learn tab: each concept is a short lesson with a
// one-bar audio demo. Demos reuse the layer-part shape so the store can play
// them through the same drum scheduler as the groovebox.
// ---------------------------------------------------------------------------

export interface RhythmConcept {
  id: string;
  name: string;
  tag: string;
  text: string;
  bpm: number;
  swing: number;
  demo: DrumLayerPart[];
}

export const RHYTHM_CONCEPTS: RhythmConcept[] = [
  {
    id: 'grid', name: 'The Grid & Subdivision', tag: 'FOUNDATION', bpm: 100, swing: 50,
    text: 'A bar of 4/4 divides into 16 sixteenth notes, counted “1 e & a, 2 e & a…”. Every groove is a choice of which of those 16 boxes to fill. Beats (1 2 3 4) are the strong slots; the “&”s are off-beats; the “e”s and “a”s are the in-betweens. The demo accents the beats inside a full 16th carpet — listen for the pulse inside the subdivision.',
    demo: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }],
  },
  {
    id: 'backbeat', name: 'The Backbeat', tag: 'CALL & RESPONSE', bpm: 104, swing: 50,
    text: 'The organising idea of almost all popular music: low drum (kick) on the strong beats 1 & 3, high drum (snare) answering on 2 & 4. The snare side is the backbeat — it is where audiences clap. Rock, funk, hip-hop, house and country are all different decorations of this one call-and-response.',
    demo: [{ v: 'kick', on: [0, 8], acc: [0] }, { v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }],
  },
  {
    id: 'fourfloor', name: 'Four on the Floor', tag: 'PULSE', bpm: 124, swing: 50,
    text: 'Put the kick on every beat and the pulse becomes physical — this is disco, house and techno. With the kick saturated, the interest moves to the off-beats: open hats on every “and” create the see-saw (boom-tss-boom-tss) that drives dance music.',
    demo: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }, { v: 'ohat', on: [2, 6, 10, 14] }, { v: 'clap', on: [4, 12] }],
  },
  {
    id: 'syncopation', name: 'Syncopation', tag: 'TENSION', bpm: 96, swing: 52,
    text: 'Syncopation is accenting where the ear does NOT expect it — the “e”s, “a”s and “and”s instead of the beats. A note just before or after a strong beat creates tension that the next downbeat resolves. The demo plays a funk kick that hits beat 1, then deliberately avoids beats 2 and 3, landing around them instead.',
    demo: [{ v: 'kick', on: [0, 6, 9], acc: [0] }, { v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }],
  },
  {
    id: 'ghost', name: 'Ghost Notes', tag: 'TEXTURE', bpm: 92, swing: 54,
    text: 'Ghost notes are hits played so quietly they are felt rather than heard — usually snare taps tucked between the backbeats. They fill the pocket and make a groove breathe. The rule: accents tell the story, ghosts provide the texture. Listen for the whisper-taps around the loud 2 & 4.',
    demo: [{ v: 'kick', on: [0, 10], acc: [0] }, { v: 'snare', on: [3, 4, 7, 10, 12], acc: [4, 12] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }],
  },
  {
    id: 'clave', name: 'The Clave — a Timeline', tag: 'KEY PATTERN', bpm: 105, swing: 50,
    text: 'Afro-Cuban and much West African music replaces the backbeat with a timeline: one asymmetric key pattern (the clave — Spanish for “key”) that every instrument must agree with. The 3-2 son clave groups the bar as 3+3+4+2+4 sixteenths — count along “1 … a-of-1 … and-of-2 | 2 … 3”. Once you can sing it, you can place any part against it.',
    demo: [{ v: 'rim', on: [0, 3, 6, 10, 12], acc: [0, 3, 6, 10, 12] }, { v: 'kick', on: [7, 15] }],
  },
  {
    id: 'swingfeel', name: 'Swing & Shuffle', tag: 'FEEL', bpm: 112, swing: 66,
    text: 'Swing keeps the same notes but bends time: each pair of 8ths is played long-short (roughly a triplet — “doo-DAT”) instead of even. 50% is straight, 66% a true triplet shuffle, 75% a hard dotted skip. It is a feel, not a pattern — the demo is the rock beat from the Backbeat lesson with its 8ths swung to 66%. In the groovebox, drag the SWING slider on any pattern to morph it yourself.',
    demo: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }, { v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }],
  },
  {
    id: 'tresillo', name: 'The Tresillo (3+3+2)', tag: 'TIMELINE', bpm: 110, swing: 50,
    text: 'Split 8 sixteenths as 3+3+2 instead of 4+4 and you get the tresillo: hits on 1, the “and of 2” and beat 4. It is the single most widespread rhythmic cell on earth — electro, reggaeton, dancehall, Afrobeats, trap 808 lines and Latin bass tumbaos are all built from it. Once you hear it you cannot unhear it; program it on a kick and half of modern music opens up.',
    demo: [{ v: 'kick', on: [0, 6, 12], acc: [0] }, { v: 'rim', on: [0, 3, 6, 10, 12] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }],
  },
  {
    id: 'linear', name: 'Linear Grooves', tag: 'PROGRAMMING', bpm: 104, swing: 52,
    text: 'A linear groove never lets two voices hit on the same step — kick, snare and hat pass a single 16th line between them. Nothing stacks, so nothing sounds like a machine playing chords of drums. If your programmed beats sound stiff, rebuild one linearly: it is the fastest route from “sequenced” to “played”. The demo is one continuous 16th line shared by three drums.',
    demo: [{ v: 'kick', on: [0, 3, 10], acc: [0] }, { v: 'snare', on: [4, 7, 12, 15], acc: [4, 12] }, { v: 'chat', on: [1, 2, 5, 6, 8, 9, 11, 13, 14] }],
  },
  {
    id: 'velocity', name: 'Velocity & Dynamics', tag: 'PROGRAMMING', bpm: 96, swing: 56,
    text: 'The step grid tells you WHERE; velocity tells you whether it grooves. A useful three-tier habit: accents (backbeat, downbeat) near 120, normal hits near 90, ghost notes near 35. Programming every note at the same level is the number-one reason a pattern sounds mechanical. In this box, tapping a cell twice makes it an ACCENT — the demo alternates loud and quiet snares so you can hear the difference the levels alone make.',
    demo: [{ v: 'kick', on: [0, 10], acc: [0] }, { v: 'snare', on: [3, 4, 7, 11, 12, 15], acc: [4, 12] }, { v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }],
  },
  {
    id: 'halftime', name: 'Half-time & Density', tag: 'PERCEPTION', bpm: 140, swing: 50,
    text: 'Tempo is what the clock says; feel is where the backbeat lands. Put the snare only on beat 3 and a fast tempo suddenly feels half as fast — trap does this at 140, and drum & bass stretches a backbeat across 170+. Density works the same way: fewer, better-placed notes groove harder than a full grid. The demo is 140 BPM that feels like 70.',
    demo: [{ v: 'kick', on: [0, 7, 10], acc: [0] }, { v: 'snare', on: [8], acc: [8] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }],
  },
];
