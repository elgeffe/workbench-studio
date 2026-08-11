// The wire. Everything that actually touches the Web MIDI API lives here, so
// the store above it stays reactive state and the map below it stays pure.
//
// The timing model is the same two-clock trick the transport already uses for
// audio: `send()` takes a timestamp and the browser holds the bytes until it
// comes round, so a late wake-up changes when we *queue* a note, never when the
// device *hears* it. The one catch is the domain — Web MIDI schedules on
// `performance.now()` milliseconds while the studio's transport runs on the
// audio clock in seconds. Converting between them is the caller's job (see
// WorkbenchStore.toPerf), because only the caller knows the audio clock.

// `MIDIAccess` and friends come from the DOM library. `requestMIDIAccess` is
// declared on Navigator whether or not the engine implements it, so the
// support check below has to be a runtime one.
type MidiNavigator = Navigator & {
  requestMIDIAccess?: Navigator['requestMIDIAccess'];
};

export interface MidiPortInfo {
  id: string;
  name: string;
}

// System real-time. One byte each, and they ignore the channel entirely.
const CLOCK = 0xf8;
const START = 0xfa;
const CONTINUE = 0xfb;
const STOP = 0xfc;

/** MIDI clock is defined at 24 ticks per quarter note, everywhere, always. */
export const PPQN = 24;

export class MidiOut {
  private access: MIDIAccess | null = null;
  private port: MIDIOutput | null = null;
  // Every (channel, note) this connection has ever sounded. Panic walks it and
  // sends a note-off for each. The EP-133 does not implement all-notes-off
  // (CC 123), so there is no single message that clears a stuck pad — the only
  // reliable way is to release exactly what we pressed.
  private touched = new Set<number>();

  /** Does this browser have Web MIDI at all? Safari and Firefox do not. */
  static supported(): boolean {
    return typeof navigator !== 'undefined' && typeof (navigator as MidiNavigator).requestMIDIAccess === 'function';
  }

  get connected(): boolean {
    return !!this.port;
  }
  get portId(): string | null {
    return this.port?.id ?? null;
  }

  /**
   * Ask for access and list the outputs. Requested without sysex: nothing here
   * sends a system-exclusive message, and asking for the privilege turns a
   * silent grant into a permission prompt on every load.
   *
   * `onChange` fires when a device is plugged in or pulled out.
   */
  async open(onChange?: () => void): Promise<MidiPortInfo[]> {
    const nav = navigator as MidiNavigator;
    if (!nav.requestMIDIAccess) throw new Error('This browser has no Web MIDI. Use Chrome, Edge or Brave.');
    if (!this.access) {
      const access = await nav.requestMIDIAccess({ sysex: false });
      access.onstatechange = () => {
        // A port that vanished under us must not stay selected, or every send
        // after it throws into the transport's hot path.
        if (this.port && this.port.state !== 'connected') this.port = null;
        onChange?.();
      };
      this.access = access;
    }
    return this.ports();
  }

  ports(): MidiPortInfo[] {
    if (!this.access) return [];
    return [...this.access.outputs.values()].map((p) => ({ id: p.id, name: p.name || p.id }));
  }

  /** Point at an output by id. Returns false if it isn't there (any more). */
  select(id: string | null): boolean {
    if (!this.access || !id) {
      this.port = null;
      return false;
    }
    const p = this.access.outputs.get(id);
    this.port = p && p.state === 'connected' ? p : null;
    return !!this.port;
  }

  /**
   * One note, pressed at `at` and released `durMs` later, both on the
   * performance clock. Note-off is a real note-off rather than a zero-velocity
   * note-on so the message reads correctly in a MIDI monitor.
   */
  note(channel: number, note: number, velocity: number, at: number, durMs: number): void {
    const p = this.port;
    if (!p || note < 0 || note > 127) return;
    const ch = (channel - 1) & 0x0f;
    this.touched.add((ch << 8) | note);
    try {
      p.send([0x90 | ch, note, velocity], at);
      p.send([0x80 | ch, note, 0], at + Math.max(1, durMs));
    } catch {
      // A device unplugged between the state-change event and this call throws
      // here. Dropping the note is the right response — the transport must not
      // fall over because someone pulled a cable mid-bar.
    }
  }

  /** A system real-time byte at a scheduled time. */
  private rt(byte: number, at?: number): void {
    try {
      this.port?.send([byte], at);
    } catch { /* see note() */ }
  }
  clock(at: number): void { this.rt(CLOCK, at); }
  start(at?: number): void { this.rt(START, at); }
  continue(at?: number): void { this.rt(CONTINUE, at); }
  stop(at?: number): void { this.rt(STOP, at); }

  /**
   * Silence. Drops everything still queued, then releases every note this
   * connection has ever pressed.
   *
   * The queue has to go first. Stopping the transport leaves up to a bar of
   * note-ons already handed to the browser's scheduler, and releasing notes
   * before those land would be releasing them too early — the note-on would
   * arrive afterwards and hang.
   */
  panic(): void {
    const p = this.port;
    if (!p) return;
    try {
      // `clear()` is in the Web MIDI spec but not in TypeScript's DOM library,
      // and an engine that ships MIDI without it is allowed — so feature-detect
      // rather than assume. Without it the queued note-ons still arrive, but
      // their note-offs arrive too, so nothing hangs; it is only less abrupt.
      (p as MIDIOutput & { clear?: () => void }).clear?.();
      this.touched.forEach((key) => {
        p.send([0x80 | (key >> 8), key & 0xff, 0]);
      });
    } catch { /* see note() */ }
    this.touched.clear();
  }

  close(): void {
    this.panic();
    this.port = null;
    if (this.access) this.access.onstatechange = null;
    this.access = null;
  }
}
