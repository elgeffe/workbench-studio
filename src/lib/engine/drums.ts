// Drum engine for the DRUMS groovebox. A pattern is one bar on a 16-step grid
// (one 16th per step) across a fixed kit of synthesized voices. Every genre
// template is authored as *layers* — the order a drummer would actually build
// the groove — so stepping through them teaches how the pattern is constructed:
// anchor the kick, answer with the backbeat, fill the subdivision, then add
// the syncopation and ghosts that make the style.

import { DRUM_VOICES, inKitOrder } from './kit';
import type { DrumVoiceId } from './kit';
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
 * one of its patterns. `maschine` is the practical note for programming the
 * style in a groovebox — the swing/velocity/kit settings the grid can't show.
 */
export interface DrumGenre {
  id: string;
  name: string;
  family: string; // shelf label in the genre row
  blurb: string;  // what defines the genre's drum programming
  maschine: string;
}

export const DRUM_FAMILIES = [
  'Rock & Pop',
  'Funk & Soul',
  'Hip-Hop',
  'House & Techno',
  'Bass & Breaks',
  'Hard Dance',
  'Jazz & Blues',
  'World & Latin',
];

export const DRUM_GENRES: DrumGenre[] = [
  // ---- Rock & Pop ----
  {
    id: 'rock', name: 'Rock', family: 'Rock & Pop',
    blurb: 'Kick on the strong beats, snare backbeat on 2 & 4, hats keeping the subdivision. Every groove in this box is a variation of that conversation.',
    maschine: 'Straight 16ths, swing off. Program kick and snare first on separate pads, then hats — and vary hat velocity (accent the quarters) or the loop turns into a machine gun.',
  },
  {
    id: 'metal', name: 'Metal & Punk', family: 'Rock & Pop',
    blurb: 'Rock with the density turned up: double-kick carpets, blast beats, and half-time breakdowns that cut the backbeat in half for weight.',
    maschine: 'Fast repeated kicks need velocity variation and a short sample or they flam into mush. Use Note Repeat at 1/16 or 1/32 to play the double-kick runs in live, then quantize.',
  },
  {
    id: 'pop', name: 'Pop', family: 'Rock & Pop',
    blurb: 'Simplicity engineered for the vocal: one big backbeat sound (clap layered on snare), tight hats, and space where the hook lands.',
    maschine: 'Layer clap + snare on one pad group for the backbeat, and duck the hats under the vocal. Modern pop lives on sound choice more than on note choice.',
  },
  {
    id: 'disco', name: 'Disco & Boogie', family: 'Rock & Pop',
    blurb: 'The ancestor of house: four-on-the-floor kick, open hat on every off-beat, and a hi-hat foot that never stops breathing.',
    maschine: 'Set swing around 54–56% — disco is not dead straight. Open-hat pads should choke the closed hat (same choke group) so the off-beat closes cleanly on the next kick.',
  },
  // ---- Funk & Soul ----
  {
    id: 'funk', name: 'Funk', family: 'Funk & Soul',
    blurb: 'The One is law and the grid is 16ths. Backbeat stays rigid while the kick and ghost snares dance around it.',
    maschine: 'Ghost notes are a velocity story: keep them near 30–45 and the backbeat near 120. Add a touch of swing (54–58%) to grease the 16ths.',
  },
  {
    id: 'soul', name: 'Soul & Motown', family: 'Funk & Soul',
    blurb: 'Backbeat-first songwriting drums: tambourine on every off-beat, side-stick when the singer is quiet, kick simple enough to sing.',
    maschine: 'Tambourine/shaker on their own pads with ±10 velocity randomness gives the hand-played feel. Slight swing (54%) is the Motown lift.',
  },
  {
    id: 'neosoul', name: 'Neo-Soul', family: 'Funk & Soul',
    blurb: 'Funk played sleepy and behind the beat: hats pushed late, snares dragged, the loop feeling almost drunk on purpose.',
    maschine: 'The whole style is nudging notes off the grid. Program straight, then shift the snare 5–15 ms late and swing the hats 58–62% — do not quantize it back.',
  },
  {
    id: 'gospel', name: 'Gospel', family: 'Funk & Soul',
    blurb: 'Church pocket: deep backbeat, busy hats, triplet shuffles, and fills that answer the choir instead of filling space.',
    maschine: 'Gospel triplet feels need swing at 62–66%. Keep the hat pattern dense but quiet — the backbeat should still be the loudest hit in the bar.',
  },
  // ---- Hip-Hop ----
  {
    id: 'hiphop', name: 'Hip-Hop (boom-bap)', family: 'Hip-Hop',
    blurb: '"Boom" kick, "bap" snare, sampled-funk skeleton. Sparse by design — the beat is a bed for the voice.',
    maschine: 'Swing 56–60% is the head-nod. Filter the top off the hats, and let the snare be the loudest thing in the pattern.',
  },
  {
    id: 'trap', name: 'Trap & Drill', family: 'Hip-Hop',
    blurb: 'Half-time snare on beat 3, sub-808 kick doing the bass line, and hats that roll in 16ths, 32nds and triplets.',
    maschine: 'Program the 808 on a pitched pad — the kick IS the bassline, so play notes, not just hits. Hat rolls come from Note Repeat with the rate flipped mid-bar.',
  },
  {
    id: 'oldschool', name: 'Old-School & Electro', family: 'Hip-Hop',
    blurb: 'The 808/909 era: electro syncopation, handclaps on the backbeat, cowbell and rimshot doing the melody work.',
    maschine: 'This is drum-machine music — use the raw 808/909 kit with no layering, long decay on the kick, and quantize hard. Straightness is the sound.',
  },
  // ---- House & Techno ----
  {
    id: 'house', name: 'House', family: 'House & Techno',
    blurb: 'Four-on-the-floor kick, clap on 2 & 4, open hats on every off-beat. The kick is the pulse; everything else decorates it.',
    maschine: 'Swing 52–56% separates a groove from a grid. Keep the kick loud and short, and sidechain the pads to it — house is a mix technique as much as a pattern.',
  },
  {
    id: 'techhouse', name: 'Tech-House & Minimal', family: 'House & Techno',
    blurb: 'Reduction as a technique: fewer elements, more groove, everything rolling off the off-beat. Space is the main instrument.',
    maschine: 'Program less than feels finished, then vary velocity across the loop. Shuffle/swing near 56% plus one percussive tick that moves every bar is the whole trick.',
  },
  {
    id: 'techno', name: 'Techno', family: 'House & Techno',
    blurb: 'Machine time: straight kick, relentless 16th hats, minimal backbeat, and texture instead of melody.',
    maschine: 'Swing off (50%). Length and decay do the work — shorten the kick tail to make room for the sub, and let one long open hat blur the off-beat.',
  },
  {
    id: 'trance', name: 'Trance & Big-Room', family: 'House & Techno',
    blurb: 'Four-on-the-floor built for the drop: rolling off-beat bass, snare rolls that lift into the break, huge open hats.',
    maschine: 'Build a 16-bar arrangement, not a bar. The snare roll (16ths accelerating into 32nds) is programmed with Note Repeat rate changes over the last two bars.',
  },
  // ---- Bass & Breaks ----
  {
    id: 'dnb', name: 'Drum & Bass', family: 'Bass & Breaks',
    blurb: 'Two-step at 170+: kick on 1 and the "and of 3", snare on 2 & 4. Space at speed is what makes it roll.',
    maschine: 'Set the project to 172 and program at 16ths — the pattern looks sparse because it is. Ghost snares at low velocity make it "roll" instead of stomp.',
  },
  {
    id: 'jungle', name: 'Jungle', family: 'Bass & Breaks',
    blurb: 'Chopped breakbeats, not programmed kits: the Amen and Think breaks resliced so the original ghost notes survive.',
    maschine: 'Slice a break across 16 pads, then play the slices out of order — that is jungle. The grid below shows the target rhythm to aim your slices at.',
  },
  {
    id: 'garage', name: 'UK Garage', family: 'Bass & Breaks',
    blurb: 'Shuffled 2-step: the kick skips beat 3, the snare lands on 2 & 4, and every hat is swung hard.',
    maschine: 'Swing 60–66% — garage is the swing setting. Program the shuffle first with hats alone, and only then place the kick against it.',
  },
  {
    id: 'dubstep', name: 'Dubstep & Grime', family: 'Bass & Breaks',
    blurb: '140 BPM played half-time: snare on beat 3 only, sub-heavy kick, and sparse percussion holding a huge amount of space.',
    maschine: 'Same tempo as trap, different attitude. Leave whole beats empty and let the bass patch carry the rhythm.',
  },
  {
    id: 'breaks', name: 'Breakbeat & Bruk', family: 'Bass & Breaks',
    blurb: 'Anything built on a broken (non-four-to-the-floor) kick: big beat, rave hardcore, broken beat.',
    maschine: 'Displace the kick off the strong beats and keep the snare anchored — the tension between them is the genre. Try nudging one kick a 16th late.',
  },
  // ---- Hard Dance ----
  {
    id: 'hardstyle', name: 'Hardstyle', family: 'Hard Dance',
    blurb: 'A distorted kick with a pitched tail on every beat, a reverse-bass answer on the off-beats, and a clap that arrives like a snare.',
    maschine: 'The kick is the instrument: layer a punchy transient with a long pitched-down tail, then distort. The "reverse bass" sits on every off-beat 8th.',
  },
  {
    id: 'hardcore', name: 'Hardcore & Gabber', family: 'Hard Dance',
    blurb: '160–200 BPM, distorted kicks four to the floor (or faster), breakbeats on top in the UK strains.',
    maschine: 'Overdrive the kick until it clips, then tune it — gabber kicks are pitched. Keep everything else out of the low end.',
  },
  // ---- Jazz & Blues ----
  {
    id: 'jazz', name: 'Jazz', family: 'Jazz & Blues',
    blurb: 'Timekeeping moves up to the ride cymbal, the hat foot chicks 2 & 4, and the snare comments instead of keeping time.',
    maschine: 'Swing 62–66% and low velocities everywhere. Programmed jazz only works if you vary the ride velocity every hit — perfect repetition kills it.',
  },
  {
    id: 'fusion', name: 'Jazz-Fusion', family: 'Jazz & Blues',
    blurb: 'Funk 16ths played with jazz phrasing: linear grooves where no two limbs hit together, ghost notes everywhere, ride replacing the hat.',
    maschine: 'Linear means one voice per step — build the pattern so kick, snare and hat never share a step. It instantly sounds "played" rather than programmed.',
  },
  {
    id: 'blues', name: 'Blues & Shuffle', family: 'Jazz & Blues',
    blurb: 'Everything in triplets: the shuffle, the half-time shuffle, the train beat. The notes are rock, the feel is not.',
    maschine: 'Swing 66% is a true triplet. Compare the same pattern at 50% and 66% — that difference is the whole style.',
  },
  // ---- World & Latin ----
  {
    id: 'latin', name: 'Afro-Cuban & Brazilian', family: 'World & Latin',
    blurb: 'No backbeat — a clave timeline that every other part must agree with, and a kick that anticipates rather than lands.',
    maschine: 'Program the clave first on its own pad and never let it move. Everything else is written against it.',
  },
  {
    id: 'afro', name: 'Afrobeat & Amapiano', family: 'World & Latin',
    blurb: 'Interlocking parts instead of one drummer: bell timelines, log drums, shakers, and a kick that converses rather than pulses.',
    maschine: 'Give each percussion part its own pad and its own velocity shape. The groove comes from parts weaving, not from any single pattern.',
  },
  {
    id: 'reggae', name: 'Reggae & Dancehall', family: 'World & Latin',
    blurb: 'Beat 1 is often empty on purpose. Kick and cross-stick move together, and the space is the instrument.',
    maschine: 'Side-stick (rim) is the signature — quiet, dry, no reverb. A little swing (54–58%) keeps it from sounding stiff.',
  },
  {
    id: 'reggaeton', name: 'Reggaeton & Dembow', family: 'World & Latin',
    blurb: 'One riddim runs the whole genre: the dembow — kick on the beats, snare on the "a" of each pair. Learn it once and you own the style.',
    maschine: 'The dembow snare pattern (steps 4, 7, 12, 15 on a 16-grid) is fixed; the variation lives in percussion and 808 movement.',
  },
];

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
