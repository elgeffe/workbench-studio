// The K.O. II address book: how a part of the studio's band becomes a note
// number on the wire. Pure data and pure functions — no Web MIDI, no DOM — so
// the mapping is unit-testable and the transport can call it on the hot path.
//
// Two different things are being addressed, and conflating them is the mistake
// to avoid:
//
//   * A DRUM voice addresses a *pad*. The EP-133 gives each of its four groups
//     one octave of note numbers, and the twelve pads sit in panel order inside
//     it, so "group B, pad 3" is a note number and nothing more.
//   * A PITCHED part (chords, bass) addresses a *pitch*. It has to be played
//     into a pad set to a melodic sample with KEYS mode on, where the sampler
//     spreads that one sound chromatically across the whole 0–127 range. There
//     is no pad mapping to do — only a channel and an octave.
//
// Which is why the drum map below is a table of pads and the pitched parts get
// a transpose instead.

import { DRUM_VOICES, type DrumVoiceId } from '../engine/kit';

/** The four groups, and the note each one's first pad answers to. */
export type MidiGroup = 'A' | 'B' | 'C' | 'D';
export const GROUPS: readonly MidiGroup[] = ['A', 'B', 'C', 'D'];
export const GROUP_BASE: Record<MidiGroup, number> = { A: 36, B: 48, C: 60, D: 72 };

/**
 * Pad labels in panel order — the order the hardware numbers them, which is
 * NOT reading order: the bottom row (`.`, `0`, `ENTER`) comes first, then 1–9.
 * A pad's index in this list is its offset from the group's base note.
 */
export const PAD_LABELS: readonly string[] = ['.', '0', '⏎', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export const PADS_PER_GROUP = PAD_LABELS.length;

export interface PadAddr {
  group: MidiGroup;
  /** 0–11, indexing PAD_LABELS. */
  pad: number;
}

/** Which pad each kit voice hits. A voice absent from the table is not sent. */
export type DrumMap = Partial<Record<DrumVoiceId, PadAddr>>;

/** The three parts of the band, each configured independently. */
export type MidiPart = 'drums' | 'chords' | 'bass';
export const MIDI_PARTS: readonly MidiPart[] = ['drums', 'chords', 'bass'];

export interface PartCfg {
  /** Does this part go out to the device at all? */
  on: boolean;
  /** 1–16. The device receives on one channel unless you assign per-pad ones. */
  channel: number;
  /** Octaves of transpose, −4…+4. Ignored by drums, which address pads. */
  octave: number;
}

export interface MidiSettings {
  portId: string | null;
  enabled: boolean;
  clockOn: boolean;
  velNormal: number;
  velAccent: number;
  drumMap: DrumMap;
  parts: Record<MidiPart, PartCfg>;
}

// Group A, because that is where a K.O. II's drums live in every factory
// project and in nearly every project anyone builds. The nine numbered pads
// take the nine voices you reach for first; the bottom row picks up the
// colour percussion.
//
// The kit has fourteen voices and a group has twelve pads, so two voices start
// unmapped rather than silently colliding with something else. The panel shows
// them as unmapped, and moving them to another group is two clicks.
export const DEFAULT_DRUM_MAP: DrumMap = {
  kick: { group: 'A', pad: 3 },    // A1
  snare: { group: 'A', pad: 4 },   // A2
  chat: { group: 'A', pad: 5 },    // A3
  ohat: { group: 'A', pad: 6 },    // A4
  clap: { group: 'A', pad: 7 },    // A5
  rim: { group: 'A', pad: 8 },     // A6
  ltom: { group: 'A', pad: 9 },    // A7
  htom: { group: 'A', pad: 10 },   // A8
  ride: { group: 'A', pad: 11 },   // A9
  crash: { group: 'A', pad: 0 },   // A.
  shaker: { group: 'A', pad: 1 },  // A0
  tamb: { group: 'A', pad: 2 },    // A⏎
  // cowbell and sub: unmapped by default. See above.
};

// Everything on channel 1, which is what a K.O. II answers to out of the box
// (system code 110 — receive on all channels, send on 1). The pitched parts
// start an octave down: the studio voices chords around middle C, and a sample
// played chromatically from there sits high for a bassline.
export const DEFAULT_PARTS: Record<MidiPart, PartCfg> = {
  drums: { on: true, channel: 1, octave: 0 },
  chords: { on: false, channel: 1, octave: 0 },
  bass: { on: false, channel: 1, octave: -1 },
};

export const DEFAULT_SETTINGS: MidiSettings = {
  portId: null,
  enabled: false,
  clockOn: true,
  velNormal: 84,
  velAccent: 127,
  drumMap: DEFAULT_DRUM_MAP,
  parts: DEFAULT_PARTS,
};

/** The note number a pad answers to. */
export function padNote(a: PadAddr): number {
  return GROUP_BASE[a.group] + a.pad;
}

/** How the pad reads on the panel — "A1", "B⏎". */
export function padName(a: PadAddr): string {
  return a.group + PAD_LABELS[a.pad];
}

/** The pad a note number lands on, or null if it falls outside the four groups. */
export function padAt(note: number): PadAddr | null {
  const g = GROUPS.find((id) => note >= GROUP_BASE[id] && note < GROUP_BASE[id] + PADS_PER_GROUP);
  return g ? { group: g, pad: note - GROUP_BASE[g] } : null;
}

/**
 * Transpose a pitch by whole octaves, folding it back into range rather than
 * clamping. Clamping would pile every out-of-range note onto note 0 or 127 —
 * one buzzing pitch instead of a line. Folding keeps the pitch class, which is
 * the part that carries the music.
 */
export function transposed(midi: number, octaves: number): number {
  let m = Math.round(midi) + octaves * 12;
  while (m < 0) m += 12;
  while (m > 127) m -= 12;
  return m;
}

/** MIDI velocity for a grid cell: accents get their own value. */
export function velocityFor(accent: boolean, s: Pick<MidiSettings, 'velNormal' | 'velAccent'>): number {
  return clampVel(accent ? s.velAccent : s.velNormal);
}

export function clampVel(v: number): number {
  return Math.max(1, Math.min(127, Math.round(v) || 1));
}
export function clampChannel(c: number): number {
  return Math.max(1, Math.min(16, Math.round(c) || 1));
}
export function clampOctave(o: number): number {
  return Math.max(-4, Math.min(4, Math.round(o) || 0));
}

/** Is any voice other than `voice` already sitting on this pad? */
export function padTakenBy(map: DrumMap, addr: PadAddr, voice: DrumVoiceId): DrumVoiceId | null {
  const hit = (Object.keys(map) as DrumVoiceId[]).find(
    (id) => id !== voice && map[id]?.group === addr.group && map[id]?.pad === addr.pad,
  );
  return hit ?? null;
}

/**
 * Read settings back from storage, field by field, keeping the defaults for
 * anything missing or malformed. A shape that drifted between versions must
 * degrade to a working map rather than throwing on load.
 */
export function sanitizeSettings(raw: unknown): MidiSettings {
  const o = (raw ?? {}) as Partial<MidiSettings>;
  const parts = {} as Record<MidiPart, PartCfg>;
  MIDI_PARTS.forEach((p) => {
    const d = DEFAULT_PARTS[p];
    const c = (o.parts as Record<string, Partial<PartCfg>> | undefined)?.[p] ?? {};
    parts[p] = {
      on: typeof c.on === 'boolean' ? c.on : d.on,
      channel: clampChannel(typeof c.channel === 'number' ? c.channel : d.channel),
      octave: clampOctave(typeof c.octave === 'number' ? c.octave : d.octave),
    };
  });

  const map: DrumMap = {};
  const rawMap = (o.drumMap ?? {}) as Record<string, unknown>;
  DRUM_VOICES.forEach(({ id }) => {
    // A voice present in the stored map but set to null was deliberately
    // unmapped — keep it that way instead of restoring the default.
    if (!(id in rawMap)) {
      const d = DEFAULT_DRUM_MAP[id];
      if (d) map[id] = { ...d };
      return;
    }
    const a = rawMap[id] as Partial<PadAddr> | null;
    if (!a || !GROUPS.includes(a.group as MidiGroup)) return;
    const pad = Math.round(a.pad ?? -1);
    if (pad < 0 || pad >= PADS_PER_GROUP) return;
    map[id] = { group: a.group as MidiGroup, pad };
  });

  return {
    portId: typeof o.portId === 'string' ? o.portId : null,
    // Never restore "enabled" from storage: reconnecting to hardware needs a
    // live user gesture anyway, and a page that starts firing at a device the
    // user has since unplugged is a worse default than one that waits.
    enabled: false,
    clockOn: typeof o.clockOn === 'boolean' ? o.clockOn : DEFAULT_SETTINGS.clockOn,
    velNormal: clampVel(typeof o.velNormal === 'number' ? o.velNormal : DEFAULT_SETTINGS.velNormal),
    velAccent: clampVel(typeof o.velAccent === 'number' ? o.velAccent : DEFAULT_SETTINGS.velAccent),
    drumMap: map,
    parts,
  };
}
