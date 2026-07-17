// Drum engine for the DRUMS groovebox. A pattern is one bar on a 16-step grid
// (one 16th per step) across a fixed kit of synthesized voices. Every genre
// template is authored as *layers* — the order a drummer would actually build
// the groove — so stepping through them teaches how the pattern is constructed:
// anchor the kick, answer with the backbeat, fill the subdivision, then add
// the syncopation and ghosts that make the style.

export type DrumVoiceId = 'ride' | 'ohat' | 'chat' | 'clap' | 'rim' | 'snare' | 'ltom' | 'kick';

export interface DrumVoice {
  id: DrumVoiceId;
  name: string;   // full row label
  short: string;  // compact label for tight layouts
  color: string;  // cell colour when the step is on
}

// Top-to-bottom order of the groovebox rows: cymbals up top, kick on the
// floor — the way a kit is read on paper.
export const DRUM_VOICES: DrumVoice[] = [
  { id: 'ride', name: 'Ride / Bell', short: 'RD', color: '#b07d23' },
  { id: 'ohat', name: 'Open Hat', short: 'OH', color: '#8a6d3b' },
  { id: 'chat', name: 'Closed Hat', short: 'HH', color: '#7a5ea8' },
  { id: 'clap', name: 'Clap', short: 'CP', color: '#a84a6e' },
  { id: 'rim', name: 'Rim / Stick', short: 'RM', color: '#97a59c' },
  { id: 'snare', name: 'Snare', short: 'SD', color: '#3f6b5f' },
  { id: 'ltom', name: 'Low Tom', short: 'LT', color: '#5b7a9e' },
  { id: 'kick', name: 'Kick', short: 'BD', color: '#c2562e' },
];

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
  name: string;
  group: string;  // template family for the picker
  bpm: number;    // authentic tempo for the style
  swing: number;  // 50 = straight … 75 = hard shuffle (percent of the beat-pair)
  tip: string;    // what defines the style, read next to the grid
  layers: DrumLayer[];
}

export const DRUM_GROUPS = ['Core', 'Electronic', 'World & Latin', 'Jazz & Shuffle'];

export function drumTemplates(): DrumTemplate[] {
  return [
    // ---- Core ----
    {
      id: 'rock', name: 'Rock', group: 'Core', bpm: 104, swing: 50,
      tip: 'The mother pattern of pop and rock: kick anchors beats 1 & 3, snare answers on 2 & 4 (the backbeat), hats keep straight 8ths on top. Nearly every groove in this box is a variation of this conversation.',
      layers: [
        { name: 'Kick on 1 & 3', why: 'The kick lays the foundation on the strong beats — where you would stomp your foot.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
        { name: 'Backbeat snare', why: 'The snare answers on beats 2 & 4 — the backbeat, where an audience claps. Kick and snare now have a call-and-response.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
        { name: '8th-note hats', why: 'Closed hats subdivide the bar into straight 8ths — the timekeeping layer that glues kick and snare together.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
        { name: 'The push', why: 'An extra kick on the “and of 3” pushes the groove forward — the first taste of syncopation.', add: [{ v: 'kick', on: [10] }] },
        { name: 'Ghost 16th', why: 'A quiet snare on the “a of 2” fills the gap before beat 3. Ghost notes are felt more than heard.', add: [{ v: 'snare', on: [7] }] },
      ],
    },
    {
      id: 'funk', name: 'Funk', group: 'Core', bpm: 96, swing: 54,
      tip: 'Funk lives on “The One” and the 16th-note grid. The backbeat stays rock solid while kick and ghost snares dance around it in syncopated 16ths. A hair of swing makes it greasy.',
      layers: [
        { name: 'The One', why: 'Funk’s law: hit beat 1 hard and everything else can float. One accented kick owns the bar.', add: [{ v: 'kick', on: [0], acc: [0] }] },
        { name: 'Backbeat snare', why: 'Beats 2 & 4 stay sacred — the anchor the syncopation plays against.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
        { name: '16th-note hats', why: 'Hats move to 16ths — twice the resolution of rock. Accents on the quarters keep the pulse readable inside the wall of notes.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
        { name: 'Syncopated kick', why: 'Kicks on the “and of 2” and the “e of 3” — off the grid of strong beats. This is where funk gets its limp.', add: [{ v: 'kick', on: [6, 9] }] },
        { name: 'Ghost snares', why: 'Quiet snare taps between the backbeats fill the pocket. Play them at a whisper — they are texture, not statement.', add: [{ v: 'snare', on: [3, 7, 10] }] },
      ],
    },
    {
      id: 'hiphop', name: 'Hip-hop (boom-bap)', group: 'Core', bpm: 90, swing: 58,
      tip: '“Boom” (kick) … “bap” (snare): a laid-back sampled-funk skeleton. The swing is heavy — the off-16ths land late, which is the head-nod. Sparse beats leave room for the vocal.',
      layers: [
        { name: 'Boom', why: 'Kick on beat 1 and the “and of 3” — the classic boom-bap kick placement, one anchor and one push.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
        { name: 'Bap', why: 'The snare cracks on 2 & 4. In hip-hop the backbeat is the loudest thing in the beat.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
        { name: 'Swung 8th hats', why: 'Straight-ish 8th hats, but the swing setting drags every off-beat late. Compare swing 50 vs 58 to hear the head-nod appear.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
        { name: 'Kick answer', why: 'A third kick on the “a of 2” answers the first snare — a little stumble that keeps the loop human.', add: [{ v: 'kick', on: [7] }] },
        { name: 'Last-16th ghost', why: 'A ghost snare on the very last 16th trips into the next bar’s downbeat.', add: [{ v: 'snare', on: [15] }] },
      ],
    },
    {
      id: 'house', name: 'House', group: 'Electronic', bpm: 124, swing: 52,
      tip: 'Four-on-the-floor: kick on every beat, clap on 2 & 4, open hats on every off-beat 8th. The kick IS the pulse — everything else decorates it.',
      layers: [
        { name: 'Four on the floor', why: 'Kick on all four beats — no call-and-response, just relentless pulse. This one layer already says “house”.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
        { name: 'Clap backbeat', why: 'The clap keeps the 2-&-4 backbeat idea from funk, layered on top of the four-to-the-floor kick.', add: [{ v: 'clap', on: [4, 12] }] },
        { name: 'Off-beat open hats', why: 'Open hats on every “and” — the exact opposite of the kick. Kick-hat-kick-hat is the engine of dance music.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
        { name: 'The skip', why: 'Closed hats on the “a” 16ths add a skipping shuffle between the open hats — a garage/house signature.', add: [{ v: 'chat', on: [3, 7, 11, 15] }] },
        { name: 'Perc sparkle', why: 'A rim tick on odd 16ths adds ear candy without touching the groove’s skeleton.', add: [{ v: 'rim', on: [5, 13] }] },
      ],
    },
    // ---- Electronic ----
    {
      id: 'techno', name: 'Techno', group: 'Electronic', bpm: 132, swing: 50,
      tip: 'House’s harder sibling: same four-on-the-floor skeleton, faster, straighter (no swing), with 16th hats as a machine texture and minimal snare — often just a clap.',
      layers: [
        { name: 'Four on the floor', why: 'The kick pulse again, but faster and dead straight — machine time, no swing.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
        { name: 'Off-beat open hats', why: 'Open hats answer the kick on every “and”, pumping the off-beat.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
        { name: '16th hat carpet', why: 'Closed hats on all the in-between 16ths make the relentless texture that defines techno.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
        { name: 'Clap on 2 & 4', why: 'The backbeat survives even here — as a clap buried in the wall of hats.', add: [{ v: 'clap', on: [4, 12] }] },
        { name: 'Rumble tom', why: 'A low tom on the “a of 3” adds sub-level syncopation — the seed of the techno “rumble”.', add: [{ v: 'ltom', on: [11] }] },
      ],
    },
    {
      id: 'dnb', name: 'Drum & Bass', group: 'Electronic', bpm: 172, swing: 50,
      tip: 'The two-step: at 170+ BPM the kick hits 1 and the “and of 3”, snare cracks 2 & 4. Half the density of house at twice the speed — the space is what makes it roll.',
      layers: [
        { name: 'Two-step kick', why: 'Kick on beat 1 and the “and of 3” — the two-step skeleton every D&B break reduces to.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
        { name: 'Snare 2 & 4', why: 'The snare stays on 2 & 4. At this tempo that alone sounds frantic — resist adding more.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
        { name: '8th shuffle hats', why: 'Light 8th hats fill the top end. In a real break these would be the chopped cymbals of the sample.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
        { name: 'Ghost roll', why: 'Ghost snares on the “and of 2” and the final 16th mimic the stumble of the original Amen break.', add: [{ v: 'snare', on: [6, 15] }] },
      ],
    },
    {
      id: 'trap', name: 'Trap', group: 'Electronic', bpm: 140, swing: 50,
      tip: 'Half-time: at 140 BPM the snare lands only on beat 3, so the groove feels like 70. Sparse 808 kicks underneath, busy hats on top — including the signature 16th-note roll.',
      layers: [
        { name: '808 kicks', why: 'Kick on 1, the “a of 2”, and the “and of 3” — a sparse, syncopated 808 line that doubles as the bass.', add: [{ v: 'kick', on: [0, 7, 10], acc: [0] }] },
        { name: 'Half-time snare', why: 'One snare, on beat 3. Halving the backbeat makes 140 BPM feel like a slow 70 — the half-time trick.', add: [{ v: 'snare', on: [8], acc: [8] }] },
        { name: '8th hats', why: 'Straight 8th hats keep the actual tempo audible over the half-time feel.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10] }] },
        { name: 'The hat roll', why: 'The last beat bursts into 16ths — the trap hat-roll. Producers go further with 32nds and triplets.', add: [{ v: 'chat', on: [12, 13, 14, 15], acc: [12] }] },
      ],
    },
    // ---- World & Latin ----
    {
      id: 'clave', name: 'Afro-Cuban (son clave)', group: 'World & Latin', bpm: 105, swing: 50,
      tip: 'Everything sits on the 3-2 son clave — a two-bar key (here folded into one) that every other part must agree with. There is no backbeat; the clave itself is the timeline.',
      layers: [
        { name: '3-2 son clave', why: 'The key pattern: three strikes (“1, and-of-2, 4”) then two (“2, 3” of the next half). Learn to sing this before anything else.', add: [{ v: 'rim', on: [0, 3, 6, 10, 12], acc: [0, 3, 6, 10, 12] }] },
        { name: 'Tumbao kick', why: 'The kick marks the “bombo” — the and-of-2 — and anticipates the next bar on the last 16th, instead of sitting on the downbeats.', add: [{ v: 'kick', on: [7, 15] }] },
        { name: 'Cáscara', why: 'The shell-of-the-timbale pattern rides on top, weaving with the clave. Notice how it avoids fighting the clave’s accents.', add: [{ v: 'ride', on: [0, 3, 4, 6, 8, 10, 12, 14] }] },
        { name: 'Open tones', why: 'Conga open tones (here the low tom) on beat 4 — the warm answer at the end of each cycle.', add: [{ v: 'ltom', on: [12, 14] }] },
      ],
    },
    {
      id: 'afrobeat', name: 'Afrobeat', group: 'World & Latin', bpm: 108, swing: 50,
      tip: 'Tony Allen’s kit style: a bell timeline, a sparse conversational kick, and constant quiet 16th chatter. No backbeat wall — every voice is a percolating, interlocking part.',
      layers: [
        { name: 'Bell timeline', why: 'Like the clave, a bell pattern is the timeline the whole band locks to. This one leans on the off-beats after the downbeat.', add: [{ v: 'ride', on: [0, 3, 6, 10, 12, 14], acc: [0, 6, 12] }] },
        { name: 'Talking kick', why: 'The kick converses with the bell — beat 1, the “a of 2”, the “and of 3” — rather than stating a steady pulse.', add: [{ v: 'kick', on: [0, 7, 10] }] },
        { name: '16th chatter', why: 'Quiet rim taps scattered on off-16ths — the constant undercurrent of an Afrobeat kit.', add: [{ v: 'rim', on: [2, 5, 11, 13] }] },
        { name: 'Hat glue', why: 'Soft 8th hats bind the interlocking parts into one groove.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      ],
    },
    {
      id: 'reggae', name: 'Reggae (one drop)', group: 'World & Latin', bpm: 76, swing: 56,
      tip: 'The one drop: beat 1 is EMPTY — kick and cross-stick land together on beat 3 instead. Dropping the downbeat turns the whole groove inside-out; the space is the point.',
      layers: [
        { name: 'The drop', why: 'Kick and side-stick strike together on beat 3 — and nothing at all on beat 1. That missing downbeat is the “one drop”.', add: [{ v: 'kick', on: [8], acc: [8] }, { v: 'rim', on: [8], acc: [8] }] },
        { name: '8th hats', why: 'Hats mark straight 8ths with a lean on 2 & 4, where the guitar skank lives.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12] }] },
        { name: 'Open-hat lift', why: 'An open hat on the last “and” lifts the bar into the next one.', add: [{ v: 'ohat', on: [14] }] },
        { name: 'Stick chatter', why: 'Sparse side-stick ghosts before the drop — quiet rolls that decorate the space beat 1 left behind.', add: [{ v: 'rim', on: [5, 7] }] },
      ],
    },
    // ---- Jazz & Shuffle ----
    {
      id: 'swing', name: 'Jazz Swing', group: 'Jazz & Shuffle', bpm: 138, swing: 66,
      tip: 'Timekeeping moves UP to the ride cymbal: “ding … ding-ga-ding”. The hat pedal chicks on 2 & 4, the kick “feathers” barely audibly, and the snare only comments. Swing at ~66 makes the 8ths triplet-shaped.',
      layers: [
        { name: 'Ride pattern', why: 'The classic ride: quarter pulse plus the skip note after beats 2 & 4 — “ding, ding-ga-ding”. With swing at 66 the skip lands on the triplet.', add: [{ v: 'ride', on: [0, 4, 6, 8, 12, 14], acc: [4, 12] }] },
        { name: 'Hat on 2 & 4', why: 'The hi-hat foot chicks on 2 & 4 — jazz’s whispered backbeat.', add: [{ v: 'chat', on: [4, 12] }] },
        { name: 'Feathered kick', why: 'The kick brushes all four beats so quietly it is felt, not heard — “feathering”.', add: [{ v: 'kick', on: [0, 4, 8, 12] }] },
        { name: 'Snare comping', why: 'The snare drops sparse off-beat accents — comping, a conversation with the soloist rather than a fixed part.', add: [{ v: 'snare', on: [6, 11] }] },
      ],
    },
    {
      id: 'shuffle', name: 'Shuffle Blues', group: 'Jazz & Shuffle', bpm: 112, swing: 66,
      tip: 'A rock beat poured into triplets: same kick-and-backbeat skeleton, but every 8th is swung hard (66 = true triplet). Toggle swing back to 50 and it stiffens into rock — that difference IS the shuffle.',
      layers: [
        { name: 'Kick pulse', why: 'Kick on all four beats keeps the dance floor moving — common in Chicago-style shuffles.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
        { name: 'Backbeat snare', why: 'Snare cracks 2 & 4, exactly like rock — the skeleton doesn’t change, only the feel.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
        { name: 'Shuffled 8ths', why: 'Hats play 8ths, but the swing drags every off-beat onto the last triplet: “doo-DAT doo-DAT”. This layer carries the shuffle.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12], acc: [0, 4, 8, 12] }] },
        { name: 'Open-hat turn', why: 'An open hat takes over the “and of 4”, turning the bar around into the next chorus.', add: [{ v: 'ohat', on: [14] }] },
      ],
    },
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
    id: 'halftime', name: 'Half-time & Density', tag: 'PERCEPTION', bpm: 140, swing: 50,
    text: 'Tempo is what the clock says; feel is where the backbeat lands. Put the snare only on beat 3 and a fast tempo suddenly feels half as fast — trap does this at 140, and drum & bass stretches a backbeat across 170+. Density works the same way: fewer, better-placed notes groove harder than a full grid. The demo is 140 BPM that feels like 70.',
    demo: [{ v: 'kick', on: [0, 7, 10], acc: [0] }, { v: 'snare', on: [8], acc: [8] }, { v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }],
  },
];
