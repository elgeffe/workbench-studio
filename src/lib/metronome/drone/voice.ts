// The drone voice: builds the Web Audio graph for a resolved `DroneSound` on
// the metronome's AudioContext, so the drone and the click share one clock.
//
//   oscillators (per pitch × layer × unison) ─ gain ─ pan ─┐
//                                                          ▼
//      pre ─ drive (waveshaper) ─ post ─ filter ─ env ─ trem ─ autopan ─┬─ dry ────┐
//                                                                       ├─ delay ──┤─ out ─ limiter ─ speakers
//                                                                       └─ reverb ─┘
//
// Changing only the key glides the running oscillators to their new pitches —
// now, or at an exact downbeat when a practice plan schedules it; changing the
// preset or the voicing (a different stack of oscillators) crossfades to a
// freshly built graph. Slider moves are applied in place.
//
// Rhythmic sounds (a groove, plucked strings) are driven a beat at a time:
// by the metronome's scheduler while the click runs, so they sit exactly on
// its grid, and by a small clock of the voice's own when the drone plays alone.

import {
	grooveHits,
	midiToHz,
	planOscillators,
	pluckString,
	presetById,
	resolveSound,
	samePlanShape,
	type DroneMacros,
	type DroneSound,
	type OscSpec,
} from './sound';

export interface DroneParams {
	presetId: string;
	macros: DroneMacros;
	midis: number[];
	/** 0..1 */
	volume: number;
}

/** Fixed output trim: the normalised stack peaks well under 1 after the pre-gain. */
const OUT_TRIM = 1.6;
/** Level into the drive stage — low enough that drive 0 stays clean. */
const PRE_GAIN = 0.3;
/** Crossfade used when the preset or voicing changes mid-drone. */
const SWAP_S = 0.4;
const MAX_DELAY_S = 3;
/** Peak of one plucked string into the drive stage, before PRE_GAIN. */
const PLUCK_LEVEL = 0.9;
/** The voice's own clock, when no click drives it: same shape as the engine's. */
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;

interface Graph {
	presetId: string;
	plan: OscSpec[];
	oscs: OscillatorNode[];
	oscGains: GainNode[];
	oscPans: StereoPannerNode[];
	lfos: { osc: OscillatorNode; amt: GainNode; target: string }[];
	pre: GainNode;
	shaper: WaveShaperNode;
	post: GainNode;
	filter: BiquadFilterNode;
	env: GainNode;
	trem: GainNode;
	autopan: StereoPannerNode;
	dry: GainNode;
	delay: DelayNode;
	feedback: GainNode;
	delayWet: GainNode;
	convolver: ConvolverNode;
	reverbWet: GainNode;
	out: GainNode;
	reverbSize: number;
	drive: number;
	sound: DroneSound;
}

function driveCurve(drive: number): Float32Array<ArrayBuffer> {
	const n = 2048;
	const k = 1 + drive * 10;
	const curve = new Float32Array(n);
	for (let i = 0; i < n; i++) {
		const x = (i / (n - 1)) * 2 - 1;
		// tanh(kx)/k keeps unity gain for quiet signals and only squashes peaks
		curve[i] = Math.tanh(k * x) / k;
	}
	return curve;
}

/** Makeup gain after the drive stage, roughly matching loudness as it saturates. */
function driveMakeup(drive: number): number {
	return 1 + drive * 2;
}

export class DroneVoice {
	private ctx: AudioContext;
	private bus: GainNode;
	private graph: Graph | null = null;
	private impulses = new Map<number, AudioBuffer>();
	/** tempo the echo is timed against — follows the click, ramps included */
	private bpm = 120;
	/** the pitches sounding from each time on — so a pluck knows its key */
	private pitches: { time: number; midis: number[] }[] = [];
	/** true while the metronome's scheduler is feeding beats in */
	private external = false;
	private clockTimer: ReturnType<typeof setTimeout> | null = null;
	private clockNext = 0;
	private clockBeat = 0;
	private plucks = 0;

	constructor(ctx: AudioContext) {
		this.ctx = ctx;
		// A gentle limiter on the way out — a triad of a driven Nebula should
		// never clip the shared output on top of the click.
		const limiter = ctx.createDynamicsCompressor();
		limiter.threshold.value = -6;
		limiter.knee.value = 6;
		limiter.ratio.value = 12;
		limiter.attack.value = 0.005;
		limiter.release.value = 0.2;
		this.bus = ctx.createGain();
		this.bus.connect(limiter).connect(ctx.destination);
	}

	get running(): boolean {
		return this.graph != null;
	}

	start(p: DroneParams): void {
		if (this.graph) {
			this.update(p);
			return;
		}
		const sound = resolveSound(presetById(p.presetId).sound, p.macros);
		this.pitches = [{ time: 0, midis: p.midis }];
		this.plucks = 0;
		this.graph = this.build(p, sound, sound.attack);
		if (!this.external) this.startClock();
	}

	stop(): void {
		this.stopClock();
		if (!this.graph) return;
		this.release(this.graph, this.graph.sound.release);
		this.graph = null;
	}

	/**
	 * Hand the beat to the metronome (true) or take it back (false). While the
	 * click runs, `beat()` is called from its scheduler instead.
	 */
	setExternalClock(on: boolean): void {
		this.external = on;
		if (on) this.stopClock();
		else if (this.graph) this.startClock();
	}

	/** One beat from the metronome's scheduler, ahead of time on the audio clock. */
	beat(time: number, secondsPerBeat: number, beatInBar: number): void {
		if (this.external) this.playBeat(time, secondsPerBeat, beatInBar);
	}

	/** Move to new pitches exactly at `time` — a plan's key change on its downbeat. */
	setPitchAt(midis: number[], time: number): void {
		const g = this.graph;
		if (!g || sameMidis(this.pitchAt(time), midis)) return;
		// a later change already queued would now be out of order — drop it
		this.pitches = this.pitches.filter((e) => e.time <= time);
		const plan = planOscillators(g.sound, midis);
		if (!samePlanShape(g.plan, plan)) return;
		const glide = Math.max(0.005, g.sound.glide / 3);
		plan.forEach((o, i) => g.oscs[i].frequency.setTargetAtTime(o.freq, time, glide));
		this.notePitches(midis, time);
	}

	/** Apply new settings to a running drone: glide, tweak in place, or crossfade. */
	update(p: DroneParams): void {
		const g = this.graph;
		if (!g) return;
		const sound = resolveSound(presetById(p.presetId).sound, p.macros);
		const plan = planOscillators(sound, p.midis);
		const swap =
			g.presetId !== p.presetId ||
			!samePlanShape(g.plan, plan) ||
			// a new room size needs a new impulse
			Math.abs(g.reverbSize - sound.reverb.size) > 0.01;
		if (swap) {
			this.release(g, SWAP_S);
			this.notePitches(p.midis, this.ctx.currentTime);
			this.graph = this.build(p, sound, SWAP_S);
			return;
		}

		const t = this.ctx.currentTime;
		const glide = Math.max(0.005, sound.glide / 3);
		// Only glide when the key really moved — a plan's or a chord's change
		// may already be queued for its exact moment, and is only being heard
		// about here; the last pitch queued is what the drone is heading for.
		const moved = !sameMidis(this.pitches.at(-1)?.midis ?? [], p.midis);
		plan.forEach((o, i) => {
			if (moved) g.oscs[i].frequency.setTargetAtTime(o.freq, t, glide);
			g.oscs[i].detune.setTargetAtTime(o.detune, t, 0.05);
			g.oscPans[i].pan.setTargetAtTime(o.pan, t, 0.05);
		});
		if (moved) this.notePitches(p.midis, t);
		g.plan = plan;
		g.sound = sound;
		this.applyTone(g, sound, p);
	}

	setTempo(bpm: number): void {
		if (!Number.isFinite(bpm) || bpm <= 0 || Math.abs(bpm - this.bpm) < 0.5) return;
		this.bpm = bpm;
		const g = this.graph;
		if (g) g.delay.delayTime.setTargetAtTime(this.delaySeconds(g.sound), this.ctx.currentTime, 0.1);
	}

	// ---- rhythm ----

	private startClock(): void {
		if (this.clockTimer != null) return;
		this.clockNext = this.ctx.currentTime + 0.05;
		this.clockBeat = 0;
		this.tick();
	}

	private stopClock(): void {
		if (this.clockTimer != null) clearTimeout(this.clockTimer);
		this.clockTimer = null;
	}

	private tick = (): void => {
		if (!this.graph || this.external) {
			this.clockTimer = null;
			return;
		}
		const spb = 60 / Math.max(20, this.bpm);
		while (this.clockNext < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
			this.playBeat(this.clockNext, spb, this.clockBeat % 4);
			this.clockNext += spb;
			this.clockBeat++;
		}
		this.clockTimer = setTimeout(this.tick, LOOKAHEAD_MS);
	};

	private playBeat(time: number, spb: number, beatInBar: number): void {
		const g = this.graph;
		if (!g) return;
		const { groove, pluck } = g.sound;
		if (groove) {
			const rest = 1 - groove.gate;
			for (const hit of grooveHits(groove, time, spb, beatInBar)) {
				// kick the filter open and the level up, then let both fall back
				g.filter.detune.setTargetAtTime(groove.cutoff * hit.accent * 1200, hit.time, 0.004);
				g.filter.detune.setTargetAtTime(0, hit.time + 0.012, groove.decay / 3);
				g.trem.gain.setTargetAtTime(rest + groove.gate * hit.accent, hit.time, 0.003);
				g.trem.gain.setTargetAtTime(rest, hit.time + 0.012, groove.decay / 2);
			}
		}
		if (pluck) {
			const root = this.pitchAt(time)[0] ?? 48;
			this.pluckString(g, time, root + pluckString(pluck, this.plucks++), pluck.wave, pluck.decay, pluck.gain);
		}
	}

	private pluckString(g: Graph, time: number, midi: number, wave: OscillatorType, decay: number, gain: number): void {
		const ctx = this.ctx;
		const f = midiToHz(midi);
		const env = ctx.createGain();
		env.gain.setValueAtTime(0.0001, time);
		env.gain.exponentialRampToValueAtTime(Math.max(0.001, gain * PLUCK_LEVEL), time + 0.004);
		env.gain.exponentialRampToValueAtTime(0.0001, time + decay);
		// bright at the pluck, mellowing as it rings — the string's own filter
		const lp = ctx.createBiquadFilter();
		lp.type = 'lowpass';
		lp.Q.value = 1.5;
		lp.frequency.setValueAtTime(Math.min(16000, f * 16), time);
		lp.frequency.exponentialRampToValueAtTime(Math.max(100, f * 3), time + decay * 0.6);
		lp.connect(env).connect(g.pre);
		for (const detune of [-4, 4]) {
			const osc = ctx.createOscillator();
			osc.type = wave;
			osc.frequency.value = f;
			osc.detune.value = detune;
			osc.connect(lp);
			osc.start(time);
			osc.stop(time + decay + 0.05);
		}
	}

	private notePitches(midis: number[], time: number): void {
		const now = this.ctx.currentTime;
		// keep what is sounding now plus anything still to come, in time order
		const keep = this.pitches.filter((e) => e.time > now - 1 || e === this.latestBefore(now));
		keep.push({ time, midis });
		keep.sort((a, b) => a.time - b.time);
		this.pitches = keep;
	}

	private latestBefore(t: number): { time: number; midis: number[] } | undefined {
		let hit: { time: number; midis: number[] } | undefined;
		for (const e of this.pitches) if (e.time <= t) hit = e;
		return hit;
	}

	private pitchAt(t: number): number[] {
		return (this.latestBefore(t) ?? this.pitches[0])?.midis ?? [];
	}

	private delaySeconds(s: DroneSound): number {
		return Math.min(MAX_DELAY_S, ((s.delay?.beats ?? 0.5) * 60) / Math.max(20, this.bpm));
	}

	private impulse(seconds: number): AudioBuffer {
		const key = Math.round(seconds * 10) / 10;
		const hit = this.impulses.get(key);
		if (hit) return hit;
		// Decaying stereo noise is a perfectly serviceable hall — no samples to load.
		const rate = this.ctx.sampleRate;
		const len = Math.max(1, Math.floor(rate * Math.max(0.1, key)));
		const buf = this.ctx.createBuffer(2, len, rate);
		for (let ch = 0; ch < 2; ch++) {
			const d = buf.getChannelData(ch);
			for (let i = 0; i < len; i++) {
				d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
			}
		}
		this.impulses.set(key, buf);
		return buf;
	}

	private build(p: DroneParams, sound: DroneSound, fadeIn: number): Graph {
		const ctx = this.ctx;
		const t = ctx.currentTime;
		const plan = planOscillators(sound, p.midis);

		const pre = ctx.createGain();
		pre.gain.value = PRE_GAIN;
		const shaper = ctx.createWaveShaper();
		shaper.oversample = '2x';
		const post = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		const env = ctx.createGain();
		const trem = ctx.createGain();
		// a groove rests ducked between its hits
		trem.gain.value = sound.groove ? 1 - sound.groove.gate : 1;
		const autopan = ctx.createStereoPanner();
		const dry = ctx.createGain();
		const delay = ctx.createDelay(MAX_DELAY_S);
		const feedback = ctx.createGain();
		const delayWet = ctx.createGain();
		const convolver = ctx.createConvolver();
		convolver.buffer = this.impulse(sound.reverb.size);
		const reverbWet = ctx.createGain();
		const out = ctx.createGain();

		pre.connect(shaper).connect(post).connect(filter).connect(env).connect(trem).connect(autopan);
		autopan.connect(dry).connect(out);
		autopan.connect(delay);
		delay.connect(feedback).connect(delay);
		delay.connect(delayWet).connect(out);
		autopan.connect(convolver).connect(reverbWet).connect(out);
		out.connect(this.bus);

		const oscs: OscillatorNode[] = [];
		const oscGains: GainNode[] = [];
		const oscPans: StereoPannerNode[] = [];
		for (const o of plan) {
			const osc = ctx.createOscillator();
			osc.type = o.wave;
			osc.frequency.value = o.freq;
			osc.detune.value = o.detune;
			const gain = ctx.createGain();
			gain.gain.value = o.gain;
			const pan = ctx.createStereoPanner();
			pan.pan.value = o.pan;
			osc.connect(gain).connect(pan).connect(pre);
			osc.start(t);
			oscs.push(osc);
			oscGains.push(gain);
			oscPans.push(pan);
		}

		const lfos = sound.lfos.map((l) => {
			const osc = ctx.createOscillator();
			osc.type = 'sine';
			const amt = ctx.createGain();
			osc.connect(amt);
			if (l.target === 'pitch') for (const o of oscs) amt.connect(o.detune);
			else if (l.target === 'cutoff') amt.connect(filter.detune);
			else if (l.target === 'gain') amt.connect(trem.gain);
			else amt.connect(autopan.pan);
			osc.start(t);
			return { osc, amt, target: l.target };
		});

		env.gain.setValueAtTime(0, t);
		env.gain.linearRampToValueAtTime(1, t + Math.max(0.01, fadeIn));

		const g: Graph = {
			presetId: p.presetId, plan, oscs, oscGains, oscPans, lfos,
			pre, shaper, post, filter, env, trem, autopan, dry,
			delay, feedback, delayWet, convolver, reverbWet, out,
			reverbSize: sound.reverb.size, drive: -1, sound,
		};
		this.applyTone(g, sound, p, true);
		return g;
	}

	/** Everything a slider can move without rebuilding the graph. */
	private applyTone(g: Graph, s: DroneSound, p: DroneParams, immediate = false): void {
		const t = this.ctx.currentTime;
		const set = (param: AudioParam, v: number) => {
			if (immediate) param.setValueAtTime(v, t);
			else param.setTargetAtTime(v, t, 0.06);
		};

		if (Math.abs(g.drive - s.drive) > 0.001) {
			g.shaper.curve = driveCurve(s.drive);
			g.drive = s.drive;
		}
		set(g.post.gain, driveMakeup(s.drive));
		g.filter.type = s.filter.type;
		set(g.filter.frequency, s.filter.cutoff);
		set(g.filter.Q, s.filter.q);

		s.lfos.forEach((l, i) => {
			const lfo = g.lfos[i];
			if (!lfo) return;
			set(lfo.osc.frequency, l.rate);
			const amt = l.target === 'cutoff' ? l.depth * 1200 : l.target === 'pan' ? Math.min(1, l.depth) : l.depth;
			set(lfo.amt.gain, amt);
		});
		// a fixed autopan centre — the LFO swings around it
		set(g.autopan.pan, 0);

		set(g.dry.gain, 1 - s.reverb.mix * 0.5);
		set(g.reverbWet.gain, s.reverb.mix);
		const d = s.delay;
		set(g.delayWet.gain, d ? d.mix : 0);
		set(g.feedback.gain, d ? Math.min(0.85, d.feedback) : 0);
		set(g.delay.delayTime, this.delaySeconds(s));

		set(g.out.gain, Math.max(0, Math.min(1, p.volume)) * OUT_TRIM);
	}

	private release(g: Graph, seconds: number): void {
		const t = this.ctx.currentTime;
		const env = g.env.gain;
		env.cancelScheduledValues(t);
		env.setValueAtTime(env.value, t);
		env.linearRampToValueAtTime(0, t + Math.max(0.01, seconds));
		// let the reverb and echo tails ring out before tearing the graph down
		const tail = seconds + Math.min(6, g.reverbSize + (g.sound.delay ? 2 : 0));
		const stopAt = t + seconds + 0.05;
		for (const o of g.oscs) o.stop(stopAt);
		for (const l of g.lfos) l.osc.stop(stopAt);
		setTimeout(() => g.out.disconnect(), tail * 1000);
	}
}

function sameMidis(a: number[], b: number[]): boolean {
	return a.length === b.length && a.every((m, i) => m === b[i]);
}
