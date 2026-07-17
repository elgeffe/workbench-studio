// Web Audio synth engine. A faithful port of the original Workbench voice —
// a detuned triangle+sine pair through a shared low-pass filter and master
// gain. Isolated from state so it can be reasoned about (and stubbed in tests).

import type { DrumVoiceId } from './engine/drums';

export class AudioEngine {
  private actx: AudioContext | null = null;
  private master: GainNode | null = null;
  // Drums route around the tonal chain's 3 kHz low-pass (which would dull the
  // hats and cymbals) straight into the limiter.
  private drumBus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  volume = 0.78;

  private ensure(): void {
    if (!this.actx) {
      // iOS silences Web Audio when the ring/silent switch is set to mute,
      // because Safari treats it as "ambient" sound by default. Declaring the
      // session as 'playback' — the category for media the user came to hear —
      // makes it play through the mute switch, like a music or video app.
      // Safari 16.4+ / iOS 16.4+; harmless (and ignored) elsewhere.
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      if (nav.audioSession) {
        try { nav.audioSession.type = 'playback'; } catch { /* unsupported value */ }
      }
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.actx = new AC();
      this.master = this.actx.createGain();
      this.master.gain.value = this.volume;
      const lp = this.actx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3000;
      // Safety limiter. Many-voice chords can momentarily sum past ±1.0, and
      // anything beyond full scale hard-clips at the DAC — the fizzy crackle
      // once heard on 9th/13th chords. Per-hit scaling (chordAmp) keeps the
      // average level in check; this catches the transient overshoots. The
      // high threshold leaves triads untouched.
      const lim = this.actx.createDynamicsCompressor();
      lim.threshold.value = -3;
      lim.knee.value = 3;
      lim.ratio.value = 20;
      lim.attack.value = 0.001;
      lim.release.value = 0.1;
      this.master.connect(lp);
      lp.connect(lim);
      lim.connect(this.actx.destination);
      this.drumBus = this.actx.createGain();
      this.drumBus.gain.value = 0.9;
      this.drumBus.connect(lim);
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

  /**
   * Per-voice level for an n-note hit. Triads (with their doubled bass root,
   * 4 voices) keep the classic Workbench level; bigger stacks scale down so
   * the summed signal stays clear of full scale instead of clipping. The 0.7
   * exponent sits between equal-peak and equal-power, so a 13th chord sounds
   * about as loud as a triad — just clean.
   */
  private chordAmp(n: number): number {
    return n <= 4 ? 0.22 : 0.22 * Math.pow(4 / n, 0.7);
  }

  private voice(midi: number, t: number, dur: number, amp = 0.22): void {
    const ctx = this.actx!;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f; o2.detune.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.012);
    g.gain.exponentialRampToValueAtTime(amp * 0.59, t + 0.1);
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
      const amp = this.chordAmp(midis.length);
      midis.forEach((m, i) => this.voice(m, t0 + i * stagger, dur, amp));
    });
  }

  /**
   * Ghost note: the muted, pitchless "chk" a bassist plays between real notes.
   * A very short, quiet, heavily damped pluck at the given register — enough
   * attack to mark the subdivision, gone before it reads as a pitch.
   */
  ghost(midi: number): void {
    this.run(() => {
      const ctx = this.actx!;
      const t = ctx.currentTime + 0.02;
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.055, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 0.055);
      g.gain.linearRampToValueAtTime(0, t + 0.08);
      o.connect(g); g.connect(this.master!);
      o.start(t); o.stop(t + 0.1);
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
      const amp = this.chordAmp(midis.length);
      midis.forEach((m, i) => {
        const t = t0 + i * stagger;
        const f = 440 * Math.pow(2, (m - 69) / 12);
        const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = f;
        const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f; o2.detune.value = 5;
        const g = ctx.createGain();
        g.gain.value = 0.0001; // silent from creation — the default of 1 pops if released before t
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(amp, t + 0.012);
        g.gain.exponentialRampToValueAtTime(amp * 0.73, t + 0.12); // settle to a sustain level and hold
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
        const gain = g.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
        const rel = Math.max(t, start + 0.15);
        if (rel > t && typeof gain.cancelAndHoldAtTime === 'function') {
          // Quick tap: let the attack settle so the note still rings, then decay.
          gain.cancelAndHoldAtTime(rel);
        } else {
          // Sustained release: decay from the note's exact current level.
          // Anchoring at the real value — rather than holding a scheduled point
          // and ramping off it — avoids the corner discontinuity (a harsh tick)
          // that cancelAndHold + ramp can leave on a loud, settled note.
          gain.cancelScheduledValues(t);
          gain.setValueAtTime(Math.max(gain.value, 0.0002), t);
        }
        // Exponential body decay, then a long linear glide to TRUE zero: an
        // exponential ramp never reaches 0, so stopping on its residual clicks.
        gain.exponentialRampToValueAtTime(0.02, rel + 0.18);
        gain.linearRampToValueAtTime(0, rel + 0.6);
        o1.stop(rel + 0.62); o2.stop(rel + 0.62);
      } catch { /* voice already stopped */ }
    });
  }

  // ---------------------------------------------------------------------
  // Drum kit — 808/909-flavoured voices synthesized from oscillators and
  // filtered noise, in the spirit of the tonal synth: no samples, everything
  // derivable from first principles.
  // ---------------------------------------------------------------------

  /** Shared 1s white-noise buffer (source material for snare/hats/clap). */
  private noise(): AudioBuffer {
    if (!this.noiseBuf) {
      const ctx = this.actx!;
      const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    }
    return this.noiseBuf;
  }

  /** A noise burst through a filter with an exponential decay envelope. */
  private noiseHit(t: number, dur: number, amp: number, type: BiquadFilterType, freq: number, q = 1): void {
    const ctx = this.actx!;
    const src = ctx.createBufferSource(); src.buffer = this.noise(); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
    src.connect(f); f.connect(g); g.connect(this.drumBus!);
    src.start(t); src.stop(t + dur + 0.05);
  }

  /** A pitched drum body: an oscillator swept down in frequency while decaying. */
  private tonalHit(t: number, dur: number, amp: number, f0: number, f1: number, type: OscillatorType = 'sine'): void {
    const ctx = this.actx!;
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
    o.connect(g); g.connect(this.drumBus!);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /** Synthesize one drum voice at absolute context time `t`, velocity 0..1. */
  private drumVoice(v: DrumVoiceId, t: number, vel: number): void {
    switch (v) {
      case 'kick':
        // 808-style: sine swept from a punchy attack down to sub, plus a
        // tiny filtered-noise tick so it cuts through on small speakers.
        this.tonalHit(t, 0.4, 0.85 * vel, 150, 48);
        this.noiseHit(t, 0.02, 0.25 * vel, 'lowpass', 3500);
        break;
      case 'snare':
        // Tonal shell + bright noise "snares".
        this.tonalHit(t, 0.12, 0.3 * vel, 220, 165, 'triangle');
        this.noiseHit(t, 0.19, 0.45 * vel, 'bandpass', 1900, 0.7);
        break;
      case 'rim':
        // Side-stick: a short woody blip, almost no noise tail.
        this.tonalHit(t, 0.05, 0.4 * vel, 830, 780, 'triangle');
        this.noiseHit(t, 0.02, 0.15 * vel, 'highpass', 3200);
        break;
      case 'clap': {
        // Three fast retriggered noise bursts then a longer tail — the 909
        // clap's "spread" that distinguishes it from a snare.
        [0, 0.011, 0.022].forEach((dt) => this.noiseHit(t + dt, 0.03, 0.4 * vel, 'bandpass', 1400, 1.4));
        this.noiseHit(t + 0.033, 0.16, 0.35 * vel, 'bandpass', 1300, 1.2);
        break;
      }
      case 'chat':
        this.noiseHit(t, 0.045, 0.32 * vel, 'highpass', 7500);
        break;
      case 'ohat':
        this.noiseHit(t, 0.32, 0.26 * vel, 'highpass', 6500);
        break;
      case 'ltom':
        this.tonalHit(t, 0.28, 0.65 * vel, 160, 92);
        break;
      case 'ride':
        // Metallic ping: two inharmonic squares through a highpass plus a
        // noise shimmer — a cheap but convincing cymbal.
        this.tonalHit(t, 0.4, 0.055 * vel, 3150, 3100, 'square');
        this.tonalHit(t, 0.32, 0.045 * vel, 4680, 4600, 'square');
        this.noiseHit(t, 0.45, 0.08 * vel, 'highpass', 8000);
        break;
    }
  }

  /**
   * Schedule one bar of drum hits sample-accurately: `at` is each hit's
   * offset in seconds from the bar start. Called once per bar by the loop,
   * so within-bar timing never depends on setTimeout jitter.
   */
  playDrums(hits: Array<{ v: DrumVoiceId; at: number; vel: number }>): void {
    if (!hits.length) return;
    this.run(() => {
      const t0 = this.actx!.currentTime + 0.03;
      hits.forEach((h) => this.drumVoice(h.v, t0 + h.at, h.vel));
    });
  }

  /** One immediate drum hit (cell-edit feedback, voice preview). */
  playDrumNow(v: DrumVoiceId, vel = 1): void {
    this.run(() => this.drumVoice(v, this.actx!.currentTime + 0.02, vel));
  }

  /** Resume the context in response to a user gesture (autoplay policies). */
  resume(): void {
    this.ensure();
  }
}
