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
  portId = $state<string | null>(null);

  // ---- configuration ----
  clockOn = $state(true);
  velNormal = $state(DEFAULT_SETTINGS.velNormal);
  velAccent = $state(DEFAULT_SETTINGS.velAccent);
  drumMap = $state<DrumMap>({ ...DEFAULT_SETTINGS.drumMap });
  parts = $state({ ...DEFAULT_SETTINGS.parts });

  private out = new MidiOut();

  constructor() {
    const s = this.load();
    this.portId = s.portId;
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
  partLive(p: MidiPart): boolean {
    return this.live && this.parts[p].on;
  }

  // ---- connection ----
  /**
   * Ask the browser for MIDI, list the outputs and take the remembered one if
   * it is still there (a single output gets taken regardless — with one device
   * plugged in there is nothing to choose).
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
      const want = this.portId && this.ports.some((p) => p.id === this.portId) ? this.portId
        : this.ports.length === 1 ? this.ports[0].id
        : null;
      if (want && this.out.select(want)) {
        this.portId = want;
        this.status = 'ready';
        this.enabled = true;
      } else {
        // Access granted, nothing chosen yet — the panel lists what it found.
        this.status = this.ports.length ? 'idle' : 'error';
        if (!this.ports.length) this.error = 'No MIDI outputs found. Connect the K.O. II over USB-C and try again.';
      }
    } catch (e) {
      this.status = 'error';
      this.error = e instanceof Error ? e.message : 'Could not open MIDI.';
    }
    this.save();
  }

  /** A device was plugged in or pulled out. */
  private refresh(): void {
    this.ports = this.out.ports();
    if (this.portId && !this.ports.some((p) => p.id === this.portId)) {
      this.status = 'error';
      this.error = 'The MIDI output disappeared — check the cable, then reconnect.';
    }
  }

  selectPort(id: string): void {
    if (this.out.select(id)) {
      this.portId = id;
      this.status = 'ready';
      this.error = '';
      this.enabled = true;
    } else {
      this.status = 'error';
      this.error = 'That output is no longer available.';
    }
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
    const ch = this.parts.drums.channel;
    const vel = { velNormal: this.velNormal, velAccent: this.velAccent };
    hits.forEach((h) => {
      const addr = this.drumMap[h.v];
      if (!addr) return;
      this.out.note(ch, padNote(addr), velocityFor(h.acc, vel), h.at, DRUM_GATE_MS);
    });
  }

  /** A chord or a bass note, as real pitches, transposed by the part's octave. */
  sendPitched(part: 'chords' | 'bass', midis: number[], at: number, durMs: number): void {
    if (!this.partLive(part)) return;
    const cfg = this.parts[part];
    midis.forEach((m) => {
      this.out.note(cfg.channel, transposed(m, cfg.octave), clampVel(this.velNormal), at, durMs);
    });
  }

  /**
   * Clock for one half-bar slot: 48 ticks, laid out from `at` at the given
   * beat length. Scheduled by timestamp like the notes, so the device's clock
   * cannot drift away from the studio's own.
   */
  sendClockSlot(at: number, beatMs: number): void {
    if (!this.live || !this.clockOn) return;
    const tickMs = beatMs / PPQN;
    for (let i = 0; i < PPQN * 2; i++) this.out.clock(at + i * tickMs);
  }

  transportStart(at: number): void {
    if (!this.live || !this.clockOn) return;
    this.out.start(at);
  }
  transportStop(): void {
    if (!this.live) return;
    if (this.clockOn) this.out.stop();
    // Stopping leaves up to a bar of note-ons queued; panic drops the queue
    // and releases anything already pressed.
    this.panic();
  }

  /** Fire a mapped pad once, now — the mapping panel's audition button. */
  testVoice(v: DrumVoiceId): void {
    const addr = this.drumMap[v];
    if (!addr || !this.live) return;
    this.out.note(this.parts.drums.channel, padNote(addr), clampVel(this.velAccent), performance.now(), 120);
  }

  /**
   * Play a C major triad on a pitched part — enough to tell whether the device
   * is in KEYS mode on the sound you meant, which is the thing that goes wrong.
   */
  testPitched(part: 'chords' | 'bass'): void {
    if (!this.live) return;
    const cfg = this.parts[part];
    const midis = part === 'bass' ? [48] : [60, 64, 67];
    midis.forEach((m, i) => {
      this.out.note(cfg.channel, transposed(m, cfg.octave), clampVel(this.velAccent), performance.now() + i * 8, 500);
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
      portId: this.portId,
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
