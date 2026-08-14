// Web Audio synth engine. A faithful port of the original Workbench voice —
// a detuned triangle+sine pair through a shared low-pass filter and master
// gain. Isolated from state so it can be reasoned about (and stubbed in tests).

import { drumVoice as drumVoiceDef } from './engine/drums';
import type { DrumVoiceId, DrumFilter, DrumWave, DrumSynthLayer } from './engine/drums';

// How far ahead of the clock a scheduled event is placed: long enough that a
// busy main thread can't push a note into the past, short enough not to feel
// laggy under the finger.
const LEAD = 0.03;

/** Below this the safety clamp is exactly linear; above it, a soft knee to 1.0. */
const CLIP_KNEE = 0.8;

/**
 * Transfer curve for the master safety clamp: identity up to CLIP_KNEE, then a
 * tanh knee that approaches ±1.0 without ever reaching it. Ordinary playing
 * lives entirely in the linear part and comes through bit-for-bit; only a
 * genuine overshoot is bent, and it saturates gently instead of hard-clipping.
 */
export function softClipCurve(n = 2048, knee = CLIP_KNEE) {
  const c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    const a = Math.abs(x);
    c[i] = Math.sign(x) * (a <= knee ? a : knee + (1 - knee) * Math.tanh((a - knee) / (1 - knee)));
  }
  return c;
}

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
      // Safety clamp. Many-voice chords can momentarily sum past ±1.0, and
      // anything beyond full scale hard-clips at the DAC — the fizzy crackle
      // once heard on 9th/13th chords. Per-hit scaling (chordAmp) keeps the
      // average level in check; this catches the transient overshoots.
      //
      // This was a DynamicsCompressor, which was the wrong instrument for the
      // job. A compressor is a time-domain detector, so it turns down the
      // *whole* mix — the kit shares this node — for a release-time after any
      // transient; and Chrome pre-emphasises highs in its detector, so bright
      // chord and hat attacks were pulling it down by more than 10dB even
      // though what reaches it peaks below full scale on its own and never
      // needed limiting at all. That duck, landing right on each change, was
      // the little interruption between chords.
      //
      // A waveshaper has no detector and no memory. It reshapes only the
      // samples that actually approach the ceiling and passes everything below
      // it through untouched, so nothing can ever duck anything else.
      const safety = this.actx.createWaveShaper();
      safety.curve = softClipCurve();
      safety.oversample = '4x';
      this.master.connect(lp);
      lp.connect(safety);
      safety.connect(this.actx.destination);
      this.drumBus = this.actx.createGain();
      this.drumBus.gain.value = 0.9;
      this.drumBus.connect(safety);
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

  // Sources scheduled ahead of the clock. The transport now queues a whole bar
  // in advance, so stopping has to be able to drop what hasn't sounded yet
  // rather than let it ring on.
  private scheduled: Array<{ node: AudioScheduledSourceNode; at: number }> = [];

  private track(node: AudioScheduledSourceNode, at: number): void {
    this.scheduled.push({ node, at });
    if (this.scheduled.length > 512) {
      const now = this.actx!.currentTime;
      this.scheduled = this.scheduled.filter((s) => s.at > now);
    }
  }

  /**
   * Drop everything scheduled that hasn't started yet. Notes already sounding
   * are left to ring out naturally — cutting those would click.
   */
  cancelScheduled(): void {
    if (!this.actx) return;
    const now = this.actx.currentTime;
    this.scheduled.forEach(({ node, at }) => {
      // Per spec a stop at or before the start means the node never sounds.
      if (at > now) { try { node.stop(now); } catch { /* already stopped */ } }
    });
    this.scheduled = [];
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
    this.track(o1, t); this.track(o2, t);
  }

  /** The audio clock, in seconds. Creates the context if it doesn't exist yet. */
  now(): number {
    this.ensure();
    return this.actx!.currentTime;
  }

  /**
   * The device's own output latency: the buffering between a rendered sample
   * and the speaker. Anything visual that has to line up with a sound belongs
   * at its scheduled time plus this — scheduling time is when we hand the note
   * over, not when it arrives.
   */
  latency(): number {
    const ctx = this.actx;
    return ctx ? ctx.outputLatency || ctx.baseLatency || 0 : 0;
  }

  /**
   * Play a set of MIDI notes, optionally strummed with a per-note stagger.
   * `at` places them at an exact time on the audio clock — that's how the
   * transport keeps a loop seamless. Without it they land a lead ahead of now,
   * which is what a one-off preview wants.
   */
  playMidis(midis: number[], dur = 1.2, stagger = 0, at?: number): void {
    this.run(() => {
      const t0 = this.startTime(at);
      const amp = this.chordAmp(midis.length);
      midis.forEach((m, i) => this.voice(m, t0 + i * stagger, dur, amp));
    });
  }

  /**
   * Resolve a requested time against the clock. A context that had to resume
   * first may have moved past it; never schedule into the past.
   */
  private startTime(at?: number): number {
    const now = this.actx!.currentTime;
    return at != null ? Math.max(at, now) : now + LEAD;
  }

  /**
   * Ghost note: the muted, pitchless "chk" a bassist plays between real notes.
   * A very short, quiet, heavily damped pluck at the given register — enough
   * attack to mark the subdivision, gone before it reads as a pitch.
   */
  ghost(midi: number, at?: number): void {
    this.run(() => {
      const ctx = this.actx!;
      const t = this.startTime(at);
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.055, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 0.055);
      g.gain.linearRampToValueAtTime(0, t + 0.08);
      o.connect(g); g.connect(this.master!);
      o.start(t); o.stop(t + 0.1);
      this.track(o, t);
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
  private noiseHit(t: number, dur: number, amp: number, type: DrumFilter, freq: number, q = 1): void {
    const ctx = this.actx!;
    const buf = this.noise();
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    g.gain.linearRampToValueAtTime(0, t + dur + 0.02);
    src.connect(f); f.connect(g); g.connect(this.drumBus!);
    // Enter the loop at a random point. The noise buffer is one fixed second,
    // so starting at 0 every time makes every hit of a voice bit-identical and
    // its own layers perfectly correlated — which is why a repeated cymbal read
    // as one sample retriggering rather than metal being struck again. Same
    // spectrum, different sample: the machine-gun quality goes, nothing else
    // about the voice changes.
    src.start(t, Math.random() * buf.duration); src.stop(t + dur + 0.05);
    this.track(src, t);
  }

  /** A pitched drum body: an oscillator swept down in frequency while decaying. */
  private tonalHit(t: number, dur: number, amp: number, f0: number, f1: number, type: DrumWave = 'sine'): void {
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
    this.track(o, t);
  }

  /**
   * Synthesize one drum voice at absolute context time `t`, velocity 0..1, by
   * playing the layers its kit entry declares. Every instrument — including any
   * you add to DRUM_VOICES — is rendered by this one loop.
   */
  private drumVoice(v: DrumVoiceId, t: number, vel: number): void {
    const layers: readonly DrumSynthLayer[] = drumVoiceDef(v).synth;
    layers.forEach((l) => {
      const at = t + (l.at || 0);
      if (l.kind === 'noise') this.noiseHit(at, l.dur, l.amp * vel, l.filter, l.freq, l.q);
      else this.tonalHit(at, l.dur, l.amp * vel, l.f0, l.f1, l.wave || 'sine');
    });
  }

  /**
   * Schedule one bar of drum hits sample-accurately: `at` is each hit's
   * offset in seconds from the bar start. Called once per bar by the loop,
   * so within-bar timing never depends on setTimeout jitter.
   *
   * `start` pins the bar to an exact time on the audio clock, which is how the
   * transport keeps successive bars on one unbroken grid. Without it the bar
   * simply starts a lead ahead of now.
   */
  playDrums(hits: Array<{ v: DrumVoiceId; at: number; vel: number }>, start?: number): void {
    if (!hits.length) return;
    this.run(() => {
      const t0 = this.startTime(start);
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
