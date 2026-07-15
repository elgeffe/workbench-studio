// Web Audio synth engine. A faithful port of the original Workbench voice —
// a detuned triangle+sine pair through a shared low-pass filter and master
// gain. Isolated from state so it can be reasoned about (and stubbed in tests).

export class AudioEngine {
  private actx: AudioContext | null = null;
  private master: GainNode | null = null;
  volume = 0.78;

  private ensure(): void {
    if (!this.actx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.actx = new AC();
      this.master = this.actx.createGain();
      this.master.gain.value = this.volume;
      const lp = this.actx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3000;
      this.master.connect(lp);
      lp.connect(this.actx.destination);
    }
    if (this.actx.state === 'suspended') void this.actx.resume();
  }

  /**
   * Run scheduling work only once the context clock is actually advancing.
   * A freshly created context starts suspended with currentTime frozen at 0,
   * and resume() completes asynchronously; scheduling immediately would place
   * the first note's start and envelope in the past, glitching on first play.
   */
  private run(fn: () => void): void {
    this.ensure();
    const ctx = this.actx!;
    if (ctx.state === 'running') fn();
    else void ctx.resume().then(fn, fn);
  }

  private voice(midi: number, t: number, dur: number): void {
    const ctx = this.actx!;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f; o2.detune.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.13, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
    // Exponential ramps never reach zero; ease to true silence before the
    // oscillator stops so it isn't cut mid-waveform (which clicks).
    g.gain.linearRampToValueAtTime(0, t + dur + 0.03);
    o1.connect(g); o2.connect(g); g.connect(this.master!);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  /** Play a set of MIDI notes, optionally strummed with a per-note stagger. */
  playMidis(midis: number[], dur = 1.2, stagger = 0): void {
    this.run(() => {
      const t0 = this.actx!.currentTime + 0.03;
      midis.forEach((m, i) => this.voice(m, t0 + i * stagger, dur));
    });
  }

  // Voices currently sustained by a press-and-hold gesture.
  private held: Array<{ o1: OscillatorNode; o2: OscillatorNode; g: GainNode; start: number }> = [];
  // Bumped on every release; lets a hold that is still waiting for the context
  // to resume abort if it was superseded by a newer press or a quick release.
  private holdSeq = 0;

  /**
   * Start a set of notes and hold them indefinitely (press-and-hold). Any
   * previously held notes are released first. Call releaseHeld() on pointer-up.
   */
  holdMidis(midis: number[], stagger = 0): void {
    this.releaseHeld(); // silences previous notes and bumps holdSeq
    const id = this.holdSeq;
    this.run(() => {
      if (this.holdSeq !== id) return; // superseded before the context was ready
      const ctx = this.actx!;
      const t0 = ctx.currentTime + 0.02;
      midis.forEach((m, i) => {
        const t = t0 + i * stagger;
        const f = 440 * Math.pow(2, (m - 69) / 12);
        const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f; o2.detune.value = 5;
        const g = ctx.createGain();
        g.gain.value = 0.0001; // silent from creation — the default of 1 pops if released before t
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.12); // settle to a sustain level and hold
        o1.connect(g); o2.connect(g); g.connect(this.master!);
        o1.start(t); o2.start(t);
        this.held.push({ o1, o2, g, start: t });
      });
    });
  }

  /** Release any held notes with a short, natural tail (also covers quick taps). */
  releaseHeld(): void {
    this.holdSeq++; // cancel any hold still waiting for the context to resume
    if (!this.actx || !this.held.length) return;
    const ctx = this.actx;
    const t = ctx.currentTime;
    const voices = this.held;
    this.held = [];
    voices.forEach(({ o1, o2, g, start }) => {
      try {
        // Never release mid-attack: a quick tap still rings until the envelope
        // has settled, then decays with the same natural tail as a long hold.
        const rel = Math.max(t, start + 0.15);
        const gain = g.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
        if (typeof gain.cancelAndHoldAtTime === 'function') gain.cancelAndHoldAtTime(rel);
        else {
          gain.cancelScheduledValues(rel);
          gain.setValueAtTime(rel > t ? 0.16 : Math.max(gain.value, 0.0002), rel);
        }
        gain.exponentialRampToValueAtTime(0.0006, rel + 0.5);
        // Ease to true silence before stopping — an exponential ramp never
        // reaches zero, so cutting the oscillator here would click.
        gain.linearRampToValueAtTime(0, rel + 0.55);
        o1.stop(rel + 0.56); o2.stop(rel + 0.56);
      } catch { /* voice already stopped */ }
    });
  }

  /** Resume the context in response to a user gesture (autoplay policies). */
  resume(): void {
    this.ensure();
  }
}
