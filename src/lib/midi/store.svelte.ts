// The MIDI sub-store: reactive state for the connection and the mapping, plus
// the handful of send methods the transport calls on the bar line.
//
// It is a sub-store of WorkbenchStore (`store.midi`), the same way the practice
// metronome is, because it is a device the whole studio talks to rather than a
// feature of any one tab.
//
// Everything here takes times already converted into the performance clock —
// the audio clock belongs to WorkbenchStore and does not leak in.

import { MidiOut, PPQN, type MidiPortInfo } from './out';
import {
  DEFAULT_SETTINGS, MIDI_PARTS, clampChannel, clampOctave, clampVel,
  padNote, sanitizeSettings, transposed, velocityFor,
  type DrumMap, type MidiPart, type MidiSettings, type PadAddr,
} from './map';
import type { DrumVoiceId } from '../engine/kit';

const KEY = 'workbench.midi.v1';

/**
 * How long a drum note is held. Pads are one-shots — the sample plays to its
 * end (or its own envelope) regardless — so this only has to be long enough to
 * read as a deliberate press and short enough never to choke the next hit on
 * the same pad. Sixteenths at 200 BPM are 75 ms apart, so 30 is comfortable.
 */
const DRUM_GATE_MS = 30;

export type MidiStatus = 'idle' | 'connecting' | 'ready' | 'error';

function storage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export class MidiStore {
  // ---- connection ----
  supported = $state(MidiOut.supported());
  /** Master switch. Off means nothing goes out, whatever else is configured. */
  enabled = $state(false);
  status = $state<MidiStatus>('idle');
  error = $state('');
  ports = $state<MidiPortInfo[]>([]);

  // ---- configuration ----
  clockOn = $state(true);
  velNormal = $state(DEFAULT_SETTINGS.velNormal);
  velAccent = $state(DEFAULT_SETTINGS.velAccent);
  drumMap = $state<DrumMap>({ ...DEFAULT_SETTINGS.drumMap });
  parts = $state({ ...DEFAULT_SETTINGS.parts });

  private out = new MidiOut();

  constructor() {
    const s = this.load();
    this.clockOn = s.clockOn;
    this.velNormal = s.velNormal;
    this.velAccent = s.velAccent;
    this.drumMap = s.drumMap;
    this.parts = s.parts;
  }

  /** Is anything actually going out right now? The guard on every hot path. */
  get live(): boolean {
    return this.enabled && this.status === 'ready';
  }
  /**
   * A part is live only if it is switched on *and* pointed at an output that is
   * really there. Routing is per part, so one unplugged device silences its own
   * part and leaves the rest of the band playing.
   */
  partLive(p: MidiPart): boolean {
    return this.live && this.parts[p].on && this.out.has(this.parts[p].portId);
  }

  /** The distinct outputs the enabled parts are pointed at — where clock goes. */
  private activePorts(): Set<string> {
    const ids = new Set<string>();
    MIDI_PARTS.forEach((p) => {
      const id = this.parts[p].portId;
      if (this.parts[p].on && id && this.out.has(id)) ids.add(id);
    });
    return ids;
  }

  // ---- connection ----
  /**
   * Ask the browser for MIDI and list the outputs, then give any part that has
   * nowhere to go somewhere to go.
   */
  async connect(): Promise<void> {
    if (!this.supported) {
      this.status = 'error';
      this.error = 'This browser has no Web MIDI. Use Chrome, Edge or Brave on a desktop.';
      return;
    }
    this.status = 'connecting';
    this.error = '';
    try {
      this.ports = await this.out.open(() => this.refresh());
      if (this.ports.length) {
        this.route();
        this.status = 'ready';
        this.enabled = true;
      } else {
        this.status = 'error';
        this.error = 'No MIDI outputs found. Connect a device over USB and try again.';
      }
    } catch (e) {
      this.status = 'error';
      this.error = e instanceof Error ? e.message : 'Could not open MIDI.';
    }
    this.save();
  }

  /**
   * Point every part at something sensible without ever silently rerouting one.
   *
   * An unrouted part takes the first output — with one box plugged in that
   * makes the whole thing work with no configuring at all. A part whose
   * remembered output is *missing* is the dangerous case: falling back to
   * "the first one" is how the drums end up hammering a piano. So it only
   * inherits when there is exactly one candidate and therefore no ambiguity;
   * otherwise it is cleared, and the panel shows it wants an answer.
   */
  private route(): void {
    const next = { ...this.parts };
    let changed = false;
    MIDI_PARTS.forEach((p) => {
      const cur = next[p].portId;
      if (cur && this.out.has(cur)) return;
      const want = !cur || this.ports.length === 1 ? this.ports[0]?.id ?? null : null;
      if (want !== cur) { next[p] = { ...next[p], portId: want }; changed = true; }
    });
    if (changed) this.parts = next;
  }

  /** A device was plugged in or pulled out. */
  private refresh(): void {
    this.ports = this.out.ports();
    this.route();
    const orphaned = MIDI_PARTS.filter((p) => this.parts[p].on && !this.out.has(this.parts[p].portId));
    if (orphaned.length) {
      this.error = `No output for ${orphaned.join(', ')} — check the cable, then pick one below.`;
    } else if (this.error.startsWith('No output for')) {
      this.error = '';
    }
  }

  /** Route one part to an output (or to nothing, with an empty id). */
  setPartPort(p: MidiPart, id: string): void {
    // The old device keeps whatever it was holding, so release first.
    this.panic();
    this.parts = { ...this.parts, [p]: { ...this.parts[p], portId: id || null } };
    if (id && this.error.startsWith('No output for')) this.refresh();
    this.save();
  }

  disconnect(): void {
    this.out.close();
    this.enabled = false;
    this.status = 'idle';
    this.error = '';
  }

  toggleEnabled(): void {
    if (this.enabled) {
      // Turning it off mid-bar leaves notes pressed on the device.
      this.panic();
      this.enabled = false;
    } else if (this.status === 'ready') {
      this.enabled = true;
    } else {
      void this.connect();
    }
  }

  panic(): void {
    this.out.panic();
  }

  // ---- configuration ----
  setPartOn(p: MidiPart, on: boolean): void {
    if (!on) this.panic();
    this.parts = { ...this.parts, [p]: { ...this.parts[p], on } };
    this.save();
  }
  setPartChannel(p: MidiPart, channel: number): void {
    // The old channel keeps whatever it was holding, so release first.
    this.panic();
    this.parts = { ...this.parts, [p]: { ...this.parts[p], channel: clampChannel(channel) } };
    this.save();
  }
  setPartOctave(p: MidiPart, octave: number): void {
    this.parts = { ...this.parts, [p]: { ...this.parts[p], octave: clampOctave(octave) } };
    this.save();
  }
  setClock(on: boolean): void {
    this.clockOn = on;
    this.save();
  }
  setVelNormal(v: number): void {
    this.velNormal = clampVel(v);
    this.save();
  }
  setVelAccent(v: number): void {
    this.velAccent = clampVel(v);
    this.save();
  }
  /** Point a kit voice at a pad, or pass null to stop sending it. */
  setPad(voice: DrumVoiceId, addr: PadAddr | null): void {
    const next = { ...this.drumMap };
    if (addr) next[voice] = addr; else delete next[voice];
    this.drumMap = next;
    this.save();
  }
  resetMap(): void {
    this.drumMap = { ...DEFAULT_SETTINGS.drumMap };
    this.save();
  }

  // ---- sending ----
  /**
   * One bar of the kit. `hits` carry times in the performance clock already,
   * and any voice without a pad is simply not sent.
   */
  sendDrums(hits: Array<{ v: DrumVoiceId; at: number; acc: boolean }>): void {
    if (!this.partLive('drums')) return;
    const { portId, channel } = this.parts.drums;
    const vel = { velNormal: this.velNormal, velAccent: this.velAccent };
    hits.forEach((h) => {
      const addr = this.drumMap[h.v];
      if (!addr) return;
      this.out.note(portId, channel, padNote(addr), velocityFor(h.acc, vel), h.at, DRUM_GATE_MS);
    });
  }

  /** A chord or a bass note, as real pitches, transposed by the part's octave. */
  sendPitched(part: 'chords' | 'bass', midis: number[], at: number, durMs: number): void {
    if (!this.partLive(part)) return;
    const cfg = this.parts[part];
    midis.forEach((m) => {
      this.out.note(cfg.portId, cfg.channel, transposed(m, cfg.octave), clampVel(this.velNormal), at, durMs);
    });
  }

  /**
   * Clock for one half-bar slot: 48 ticks, laid out from `at` at the given
   * beat length, to every device the band is playing. Scheduled by timestamp
   * like the notes, so a device's clock cannot drift away from the studio's
   * own — or from the other device's.
   */
  sendClockSlot(at: number, beatMs: number): void {
    if (!this.live || !this.clockOn) return;
    const ports = this.activePorts();
    if (!ports.size) return;
    const tickMs = beatMs / PPQN;
    for (let i = 0; i < PPQN * 2; i++) this.out.clock(ports, at + i * tickMs);
  }

  transportStart(at: number): void {
    if (!this.live || !this.clockOn) return;
    this.out.start(this.activePorts(), at);
  }
  transportStop(): void {
    if (!this.live) return;
    if (this.clockOn) this.out.stop(this.activePorts());
    // Stopping leaves up to a bar of note-ons queued; panic drops the queue
    // and releases anything already pressed.
    this.panic();
  }

  /** Fire a mapped pad once, now — the mapping panel's audition button. */
  testVoice(v: DrumVoiceId): void {
    const addr = this.drumMap[v];
    if (!addr || !this.live) return;
    const { portId, channel } = this.parts.drums;
    this.out.note(portId, channel, padNote(addr), clampVel(this.velAccent), performance.now(), 120);
  }

  /**
   * Play a C major triad on a pitched part — enough to tell whether the device
   * is in KEYS mode on the sound you meant, which is the thing that goes wrong.
   */
  testPitched(part: 'chords' | 'bass'): void {
    if (!this.live) return;
    const cfg = this.parts[part];
    const midis = part === 'bass' ? [36] : [60, 64, 67];
    midis.forEach((m, i) => {
      this.out.note(cfg.portId, cfg.channel, transposed(m, cfg.octave), clampVel(this.velAccent), performance.now() + i * 8, 500);
    });
  }

  destroy(): void {
    this.out.close();
  }

  // ---- persistence ----
  private load(): MidiSettings {
    const s = storage();
    if (!s) return sanitizeSettings(null);
    try {
      const raw = s.getItem(KEY);
      return sanitizeSettings(raw ? JSON.parse(raw) : null);
    } catch {
      return sanitizeSettings(null);
    }
  }
  private save(): void {
    const s = storage();
    if (!s) return;
    const data: MidiSettings = {
      enabled: this.enabled,
      clockOn: this.clockOn,
      velNormal: this.velNormal,
      velAccent: this.velAccent,
      // Persist the unmapped voices too, as explicit nulls: a voice missing
      // from the file means "never configured" and gets its default back.
      drumMap: Object.fromEntries(
        (Object.keys(DEFAULT_SETTINGS.drumMap) as DrumVoiceId[])
          .concat(Object.keys(this.drumMap) as DrumVoiceId[])
          .map((id) => [id, this.drumMap[id] ?? null]),
      ) as DrumMap,
      parts: this.parts,
    };
    try {
      s.setItem(KEY, JSON.stringify(data));
    } catch {
      // quota / private mode — the live session still works
    }
  }
}

export { MIDI_PARTS };
export type { MidiPart };
