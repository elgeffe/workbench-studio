// The groovebox kit: one table of instruments, each entry carrying BOTH its row
// metadata (name, colour, where it sits in the stack) AND the recipe the audio
// engine uses to synthesize it. Adding an instrument is a single entry here —
// no switch statement to extend, no other file to touch, and the id union and
// grid shape widen automatically.
//
// A voice is built from layers. Each layer is either a filtered noise burst or
// a pitched oscillator swept from f0 to f1, both with an exponential decay:
// stack two or three and you have a convincing drum-machine voice.

/** Filter shapes and waveforms, named here so the engine stays DOM-free. */
export type DrumFilter = 'lowpass' | 'highpass' | 'bandpass';
export type DrumWave = 'sine' | 'square' | 'triangle' | 'sawtooth';

export interface DrumNoiseLayer {
  readonly kind: 'noise';
  readonly dur: number;    // seconds to decay
  readonly amp: number;    // 0..1, scaled by velocity
  readonly filter: DrumFilter;
  readonly freq: number;   // filter cutoff / centre in Hz
  readonly q?: number;     // filter resonance (bandpass width)
  readonly at?: number;    // offset from the hit, for flams and clap spreads
}

export interface DrumToneLayer {
  readonly kind: 'tone';
  readonly dur: number;
  readonly amp: number;
  readonly f0: number;     // start frequency
  readonly f1: number;     // frequency it sweeps down (or up) to
  readonly wave?: DrumWave; // default 'sine'
  readonly at?: number;
}

export type DrumSynthLayer = DrumNoiseLayer | DrumToneLayer;

/** Row families, used to keep the grid stacked the way a kit reads on paper. */
export type DrumVoiceKind = 'cymbal' | 'hat' | 'perc' | 'drum' | 'bass';

export interface DrumVoiceDef {
  readonly id: string;
  readonly name: string;   // full row label
  readonly short: string;  // compact label for tight layouts
  readonly color: string;  // cell colour when the step is on
  readonly kind: DrumVoiceKind;
  readonly hint: string;   // what it is / when to reach for it, shown in the add-row picker
  readonly synth: readonly DrumSynthLayer[];
}

// Top-to-bottom order of the groovebox rows: cymbals up top, kick on the floor,
// sub below it — the way a kit is read on paper. Insert a new instrument at the
// position where it belongs in that stack.
export const DRUM_VOICES = [
  {
    id: 'ride', name: 'Ride / Crash', short: 'CY', color: '#b07d23', kind: 'cymbal',
    hint: 'The one cymbal: ride timekeeping, the bell for African timelines, and accents on downbeats and phrase ends.',
    synth: [
      { kind: 'tone', dur: 0.4, amp: 0.055, f0: 3150, f1: 3100, wave: 'square' },
      { kind: 'tone', dur: 0.32, amp: 0.045, f0: 4680, f1: 4600, wave: 'square' },
      { kind: 'noise', dur: 0.45, amp: 0.08, filter: 'highpass', freq: 8000 },
    ],
  },
  {
    id: 'ohat', name: 'Open Hat', short: 'OH', color: '#8a6d3b', kind: 'hat',
    hint: 'The off-beat answer in house, techno and disco.',
    synth: [{ kind: 'noise', dur: 0.32, amp: 0.26, filter: 'highpass', freq: 6500 }],
  },
  {
    id: 'chat', name: 'Closed Hat', short: 'HH', color: '#7a5ea8', kind: 'hat',
    hint: 'The default subdivision layer — 8ths or 16ths.',
    synth: [{ kind: 'noise', dur: 0.045, amp: 0.32, filter: 'highpass', freq: 7500 }],
  },
  {
    id: 'shaker', name: 'Shaker / Tambourine', short: 'SH', color: '#9b86c4', kind: 'hat',
    hint: 'The hand percussion layer, softer than a hat: house and samba 16ths, Motown off-beat jingle.',
    synth: [
      { kind: 'noise', dur: 0.07, amp: 0.2, filter: 'bandpass', freq: 6200, q: 0.9 },
      { kind: 'noise', dur: 0.03, amp: 0.1, filter: 'highpass', freq: 9500 },
    ],
  },
  {
    id: 'cowbell', name: 'Cowbell / Block', short: 'CB', color: '#7d8a4f', kind: 'perc',
    hint: 'The 808 bell and the clave/agogo timeline sound.',
    synth: [
      { kind: 'tone', dur: 0.3, amp: 0.13, f0: 540, f1: 535, wave: 'square' },
      { kind: 'tone', dur: 0.26, amp: 0.11, f0: 800, f1: 795, wave: 'square' },
      { kind: 'noise', dur: 0.02, amp: 0.06, filter: 'highpass', freq: 5000 },
    ],
  },
  {
    id: 'clap', name: 'Clap', short: 'CP', color: '#a84a6e', kind: 'perc',
    hint: 'The dance-music backbeat; layer it under a snare to widen it.',
    synth: [
      { kind: 'noise', dur: 0.03, amp: 0.4, filter: 'bandpass', freq: 1400, q: 1.4 },
      { kind: 'noise', dur: 0.03, amp: 0.4, filter: 'bandpass', freq: 1400, q: 1.4, at: 0.011 },
      { kind: 'noise', dur: 0.03, amp: 0.4, filter: 'bandpass', freq: 1400, q: 1.4, at: 0.022 },
      { kind: 'noise', dur: 0.16, amp: 0.35, filter: 'bandpass', freq: 1300, q: 1.2, at: 0.033 },
    ],
  },
  {
    id: 'rim', name: 'Rim / Stick', short: 'RM', color: '#97a59c', kind: 'perc',
    hint: 'Cross-stick backbeats and dry percussive clicks.',
    synth: [
      { kind: 'tone', dur: 0.05, amp: 0.4, f0: 830, f1: 780, wave: 'triangle' },
      { kind: 'noise', dur: 0.02, amp: 0.15, filter: 'highpass', freq: 3200 },
    ],
  },
  {
    id: 'snare', name: 'Snare', short: 'SD', color: '#3f6b5f', kind: 'drum',
    hint: 'The backbeat, and every ghost note around it.',
    synth: [
      { kind: 'tone', dur: 0.12, amp: 0.3, f0: 220, f1: 165, wave: 'triangle' },
      { kind: 'noise', dur: 0.19, amp: 0.45, filter: 'bandpass', freq: 1900, q: 0.7 },
    ],
  },
  {
    id: 'htom', name: 'High Tom / Conga', short: 'HT', color: '#7f9bbd', kind: 'drum',
    hint: 'The higher of two hand drums — conga open tones, tom fills.',
    synth: [{ kind: 'tone', dur: 0.22, amp: 0.55, f0: 300, f1: 180 }],
  },
  {
    id: 'ltom', name: 'Low Tom', short: 'LT', color: '#5b7a9e', kind: 'drum',
    hint: 'Floor tom and the low hand drum answering it.',
    synth: [{ kind: 'tone', dur: 0.28, amp: 0.65, f0: 160, f1: 92 }],
  },
  {
    id: 'kick', name: 'Kick', short: 'BD', color: '#c2562e', kind: 'drum',
    hint: 'The foundation. Start every pattern here.',
    synth: [
      { kind: 'tone', dur: 0.4, amp: 0.85, f0: 150, f1: 48 },
      { kind: 'noise', dur: 0.02, amp: 0.25, filter: 'lowpass', freq: 3500 },
    ],
  },
  {
    id: 'sub', name: 'Sub / 808', short: '808', color: '#8c3a1f', kind: 'bass',
    hint: 'Long pitched sub: 808 lines, hardstyle reverse bass, amapiano log drum.',
    synth: [{ kind: 'tone', dur: 0.6, amp: 0.7, f0: 92, f1: 44 }],
  },
] as const satisfies readonly DrumVoiceDef[];

export type DrumVoice = (typeof DRUM_VOICES)[number];
/** Every instrument id in the kit — widens automatically when you add one. */
export type DrumVoiceId = DrumVoice['id'];

const BY_ID = new Map<DrumVoiceId, DrumVoice>(DRUM_VOICES.map((v) => [v.id, v] as [DrumVoiceId, DrumVoice]));

/** The kit entry for an id — row metadata plus its synthesis recipe. */
export function drumVoice(id: DrumVoiceId): DrumVoice {
  return BY_ID.get(id)!;
}

/** Kit order for an arbitrary set of ids, so rows always stack cymbals→sub. */
export function inKitOrder(ids: readonly DrumVoiceId[]): DrumVoiceId[] {
  const want = new Set<string>(ids);
  return DRUM_VOICES.filter((v) => want.has(v.id)).map((v) => v.id);
}
