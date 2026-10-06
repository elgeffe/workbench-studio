// The drone's sound, as plain data. A preset is a recipe — oscillator layers,
// a filter, slow modulation, drive and a bit of room — and five macro sliders
// bend that recipe without exposing a whole synth. Everything here is pure so
// the voicing, the macros and the voice budget can be unit-tested without any
// audio hardware; `voice.ts` turns the result into a Web Audio graph.

import { SCALES, type ScaleId } from '../../engine/constants';

export type DroneWave = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface DroneLayer {
	wave: DroneWave;
	/** octave offset from the drone pitch (-1 = an octave below) */
	octave: number;
	/** extra semitones on top of the octave — an organ's 5⅓' fifth is 7 */
	interval?: number;
	/** relative level; layers are normalised against each other */
	gain: number;
	/** detune spread across the unison stack, in cents (macro: width) */
	detune: number;
	/** oscillators stacked per pitch for a thicker sound (default 1) */
	unison?: number;
}

export type LfoTarget = 'cutoff' | 'pitch' | 'gain' | 'pan';

export interface DroneLfo {
	target: LfoTarget;
	/** Hz */
	rate: number;
	/** cutoff: octaves · pitch: cents · gain: 0..1 · pan: 0..1 */
	depth: number;
}

/**
 * A rhythm the sound moves to, locked to the metronome's beat: each step that
 * fires kicks the filter open and/or the level up, then lets it fall back.
 */
export interface DroneGroove {
	/** steps per beat: 2 = eighths, 4 = sixteenths */
	div: 2 | 4;
	/** accent 0..1 per step, read from the start of each bar and wrapped */
	steps: number[];
	/** 0..0.5 — how far every off-step is pushed late, as a share of a step */
	swing: number;
	/** octaves the filter jumps open on a full accent */
	cutoff: number;
	/** 0..1 how far the level ducks between hits */
	gate: number;
	/** seconds for each kick to fall back */
	decay: number;
}

/** Plucked strings, one per beat, cycling — a tanpura rather than a held tone. */
export interface DronePluck {
	/** semitones from the drone root for each string, in plucking order */
	strings: number[];
	wave: DroneWave;
	/** seconds a string rings */
	decay: number;
	gain: number;
}

export interface DroneSound {
	layers: DroneLayer[];
	groove?: DroneGroove;
	pluck?: DronePluck;
	filter: { type: 'lowpass' | 'bandpass'; cutoff: number; q: number };
	lfos: DroneLfo[];
	/** 0..1 saturation */
	drive: number;
	/** reverb send 0..1 and its length in seconds */
	reverb: { mix: number; size: number };
	/** echo, timed in beats so it follows the click's tempo */
	delay?: { beats: number; feedback: number; mix: number };
	/** seconds to fade in on start, and out on stop */
	attack: number;
	release: number;
	/** seconds a key change takes to glide to its new pitch */
	glide: number;
}

export type DronePresetId = 'warm' | 'sine' | 'organ' | 'bowed' | 'nebula' | 'funky' | 'tanpura';

export interface DronePreset {
	id: DronePresetId;
	name: string;
	blurb: string;
	sound: DroneSound;
}

export const DRONE_PRESETS: DronePreset[] = [
	{
		id: 'warm',
		name: 'Warm Pad',
		blurb: 'Soft and neutral — sits under anything.',
		sound: {
			layers: [
				{ wave: 'triangle', octave: 0, gain: 1, detune: 8, unison: 2 },
				{ wave: 'sine', octave: -1, gain: 0.7, detune: 0 },
			],
			filter: { type: 'lowpass', cutoff: 1400, q: 0.7 },
			lfos: [{ target: 'cutoff', rate: 0.08, depth: 0.5 }],
			drive: 0.05,
			reverb: { mix: 0.25, size: 2.5 },
			attack: 1.2,
			release: 1.5,
			glide: 0.25,
		},
	},
	{
		id: 'sine',
		name: 'Pure Sine',
		blurb: 'Nothing but the pitch — hear yourself beat against it.',
		sound: {
			layers: [{ wave: 'sine', octave: 0, gain: 1, detune: 0 }],
			filter: { type: 'lowpass', cutoff: 8000, q: 0.5 },
			lfos: [],
			drive: 0,
			reverb: { mix: 0, size: 1 },
			attack: 0.4,
			release: 0.6,
			glide: 0.05,
		},
	},
	{
		id: 'organ',
		name: 'Organ',
		blurb: "Drawbars 16' 8' 5⅓' 4' with a gentle chorus.",
		sound: {
			layers: [
				{ wave: 'sine', octave: -1, gain: 0.8, detune: 0 },
				{ wave: 'sine', octave: 0, gain: 1, detune: 0 },
				{ wave: 'sine', octave: 0, interval: 7, gain: 0.45, detune: 0 },
				{ wave: 'sine', octave: 1, gain: 0.55, detune: 0 },
			],
			filter: { type: 'lowpass', cutoff: 5000, q: 0.5 },
			lfos: [{ target: 'pitch', rate: 6.2, depth: 6 }],
			drive: 0.2,
			reverb: { mix: 0.3, size: 2.2 },
			attack: 0.08,
			release: 0.4,
			glide: 0.02,
		},
	},
	{
		id: 'bowed',
		name: 'Bowed',
		blurb: 'Cello-ish: slow bow, warm vibrato.',
		sound: {
			layers: [
				{ wave: 'sawtooth', octave: 0, gain: 1, detune: 6, unison: 2 },
				{ wave: 'sawtooth', octave: -1, gain: 0.5, detune: 4 },
			],
			filter: { type: 'lowpass', cutoff: 1800, q: 1.2 },
			lfos: [
				{ target: 'pitch', rate: 5, depth: 9 },
				{ target: 'gain', rate: 0.3, depth: 0.08 },
			],
			drive: 0.1,
			reverb: { mix: 0.3, size: 2.8 },
			attack: 1.8,
			release: 1.6,
			glide: 0.35,
		},
	},
	{
		id: 'nebula',
		name: 'Nebula',
		blurb: 'Spacey: wide supersaw, shimmer, long echoes.',
		sound: {
			layers: [
				{ wave: 'sawtooth', octave: 0, gain: 1, detune: 22, unison: 4 },
				{ wave: 'triangle', octave: 1, gain: 0.35, detune: 12, unison: 2 },
				{ wave: 'sine', octave: -1, gain: 0.6, detune: 0 },
			],
			filter: { type: 'lowpass', cutoff: 1100, q: 2 },
			lfos: [
				{ target: 'cutoff', rate: 0.05, depth: 1.2 },
				{ target: 'pan', rate: 0.11, depth: 0.6 },
			],
			drive: 0.05,
			reverb: { mix: 0.6, size: 6 },
			delay: { beats: 0.75, feedback: 0.45, mix: 0.35 },
			attack: 3,
			release: 4,
			glide: 0.8,
		},
	},
	{
		id: 'funky',
		name: 'Funky',
		blurb: 'A clavinet-ish wah that grooves on the click’s 16ths.',
		sound: {
			layers: [
				{ wave: 'square', octave: 0, gain: 1, detune: 7, unison: 2 },
				{ wave: 'sawtooth', octave: -1, gain: 0.55, detune: 0 },
			],
			groove: {
				div: 4,
				// one bar of 4/4: a syncopated sixteenth-note scratch
				steps: [1, 0, 0.45, 0.7, 0, 0.6, 1, 0, 0.5, 0, 0.85, 0.45, 0, 0.6, 0.9, 0.35],
				swing: 0.14,
				cutoff: 2.6,
				gate: 0.75,
				decay: 0.16,
			},
			filter: { type: 'lowpass', cutoff: 420, q: 9 },
			lfos: [],
			drive: 0.35,
			reverb: { mix: 0.12, size: 1.2 },
			attack: 0.02,
			release: 0.3,
			glide: 0.01,
		},
	},
	{
		id: 'tanpura',
		name: 'Tanpura',
		blurb: 'Four plucked strings — Pa, Sa, Sa, low Sa — one per beat.',
		sound: {
			layers: [],
			pluck: { strings: [-5, 0, 0, -12], wave: 'sawtooth', decay: 3.8, gain: 1 },
			filter: { type: 'lowpass', cutoff: 3200, q: 0.8 },
			lfos: [],
			drive: 0.2,
			reverb: { mix: 0.35, size: 3.2 },
			attack: 0.02,
			release: 2.5,
			glide: 0.01,
		},
	},
];

export function presetById(id: string): DronePreset {
	return DRONE_PRESETS.find((p) => p.id === id) ?? DRONE_PRESETS[0];
}

// ---- macros ----

/** 0..1 sliders. 0.5 everywhere is the preset exactly as designed. */
export interface DroneMacros {
	brightness: number;
	width: number;
	motion: number;
	space: number;
	drive: number;
	/** how hard a groove or pluck pattern hits */
	groove: number;
}

export const NEUTRAL_MACROS: DroneMacros = {
	brightness: 0.5,
	width: 0.5,
	motion: 0.5,
	space: 0.5,
	drive: 0.5,
	groove: 0.5,
};

/** Whether a sound moves with the beat — and so needs a clock to drive it. */
export function isRhythmic(s: DroneSound): boolean {
	return !!(s.groove || s.pluck);
}

const c01 = (x: number) => Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0.5));

/** Bend a preset's recipe by the macro sliders. 0.5 returns it unchanged. */
export function resolveSound(base: DroneSound, m: DroneMacros): DroneSound {
	const bright = Math.pow(2, (c01(m.brightness) - 0.5) * 4); // ×0.25 … ×4
	const width = c01(m.width) * 2; // ×0 … ×2
	const motion = c01(m.motion) * 2; // ×0 … ×2
	const space = c01(m.space) * 2; // ×0 … ×2
	const drive = c01(m.drive) * 2; // ×0 … ×2
	const groove = c01(m.groove) * 2; // ×0 … ×2

	return {
		...base,
		layers: base.layers.map((l) => ({ ...l, detune: l.detune * width })),
		filter: { ...base.filter, cutoff: Math.min(16000, Math.max(80, base.filter.cutoff * bright)) },
		lfos: base.lfos.map((l) => ({
			...l,
			depth: l.depth * motion,
			// faster as well as deeper, but only gently
			rate: l.rate * Math.pow(2, (c01(m.motion) - 0.5) * 1.2),
		})),
		// a preset with no drive still gets some when the slider goes past centre
		drive: Math.min(1, base.drive * drive + Math.max(0, c01(m.drive) - 0.5) * 0.6),
		reverb: { ...base.reverb, mix: Math.min(1, base.reverb.mix * space + Math.max(0, c01(m.space) - 0.5) * 0.3) },
		delay: base.delay && { ...base.delay, mix: Math.min(1, base.delay.mix * space) },
		groove: base.groove && {
			...base.groove,
			cutoff: base.groove.cutoff * groove,
			gate: Math.min(1, base.groove.gate * groove),
		},
		// harder plucking rings longer
		pluck: base.pluck && { ...base.pluck, decay: base.pluck.decay * (0.5 + c01(m.groove)) },
	};
}

// ---- rhythm ----

/**
 * The groove's hits inside one beat: absolute times and accents. Steps are
 * counted from the bar's downbeat, so the pattern lines up with the click.
 */
export function grooveHits(
	g: DroneGroove,
	beatTime: number,
	secondsPerBeat: number,
	beatInBar: number,
): { time: number; accent: number }[] {
	const div = g.div;
	const step = secondsPerBeat / div;
	const out: { time: number; accent: number }[] = [];
	if (!g.steps.length) return out;
	for (let s = 0; s < div; s++) {
		const accent = g.steps[(beatInBar * div + s) % g.steps.length] ?? 0;
		if (accent <= 0) continue;
		const swing = s % 2 === 1 ? Math.min(0.5, Math.max(0, g.swing)) * step : 0;
		out.push({ time: beatTime + s * step + swing, accent: Math.min(1, accent) });
	}
	return out;
}

/** Semitones from the root of the string plucked on the n-th beat. */
export function pluckString(p: DronePluck, n: number): number {
	const k = p.strings.length;
	return k ? p.strings[((n % k) + k) % k] : 0;
}

// ---- pitch ----

export type DroneVoicing = 'root' | 'root-fifth' | 'octaves' | 'triad';

export const VOICINGS: { id: DroneVoicing; label: string }[] = [
	{ id: 'root', label: 'Root' },
	{ id: 'root-fifth', label: 'Root + 5th' },
	{ id: 'octaves', label: 'Octaves' },
	{ id: 'triad', label: 'Triad' },
];

export type DroneRegister = 'low' | 'mid' | 'high';

/** MIDI note of C in each register: C2, C3, C4. */
export const REGISTER_C: Record<DroneRegister, number> = { low: 36, mid: 48, high: 60 };

/**
 * Semitones above the root that the drone sounds, given the 3rd and 5th it
 * should use. Those come from the scale or the chord being played over, so a
 * Locrian drone sounds its ♭5 and a minor triad drone its ♭3 — the drone is
 * the music's colour, not a generic major chord.
 */
export function voicingOffsets(voicing: DroneVoicing, third: number, fifth: number): number[] {
	switch (voicing) {
		case 'root':
			return [0];
		case 'root-fifth':
			return [0, fifth];
		case 'octaves':
			return [0, 12];
		case 'triad':
			return [0, third, fifth];
	}
}

/** The 3rd and 5th of a scale, as the drone's voicing reads them. */
export function scaleTriad(scale: ScaleId): { third: number; fifth: number } {
	const int = SCALES[scale].int;
	return { third: int[2], fifth: int[4] };
}

/** MIDI notes the drone sounds for a root, its 3rd and 5th, voicing and register. */
export function droneMidis(
	rootPc: number,
	triad: { third: number; fifth: number },
	voicing: DroneVoicing,
	register: DroneRegister,
): number[] {
	const root = REGISTER_C[register] + (((rootPc % 12) + 12) % 12);
	return voicingOffsets(voicing, triad.third, triad.fifth).map((o) => root + o);
}

export function midiToHz(m: number): number {
	return 440 * Math.pow(2, (m - 69) / 12);
}

/** The scale's tonic triad (stacked thirds), for colouring the instruments. */
export function tonicTriadPcs(tonicPc: number, scale: ScaleId): number[] {
	const int = SCALES[scale].int;
	return [0, int[2], int[4]].map((i) => (tonicPc + i) % 12);
}

export function scalePcs(tonicPc: number, scale: ScaleId): number[] {
	return SCALES[scale].int.map((i) => (tonicPc + i) % 12);
}

// ---- oscillator plan ----

export interface OscSpec {
	wave: DroneWave;
	/** frequency before detune, Hz */
	freq: number;
	/** cents */
	detune: number;
	/** linear gain, already normalised across the whole stack */
	gain: number;
	/** index of the drone pitch this oscillator belongs to */
	pitch: number;
	/** -1..1 stereo position, spread by unison and width */
	pan: number;
}

/** Oscillators allowed for one drone, so a triad of Nebula doesn't choke a phone. */
export const DEFAULT_MAX_OSC = 24;

/**
 * Every oscillator the voice needs, with gains normalised so any preset at any
 * voicing comes out at about the same loudness. When the stack would exceed
 * `maxOsc`, unison is thinned (widest layers first) before any pitch or layer
 * is dropped — a thinner pad still says the right notes.
 */
export function planOscillators(
	sound: DroneSound,
	midis: number[],
	maxOsc = DEFAULT_MAX_OSC,
): OscSpec[] {
	const unison = sound.layers.map((l) => Math.max(1, Math.floor(l.unison ?? 1)));
	const count = () => midis.length * unison.reduce((a, b) => a + b, 0);
	while (count() > maxOsc) {
		const widest = unison.indexOf(Math.max(...unison));
		if (unison[widest] <= 1) break;
		unison[widest]--;
	}

	const out: OscSpec[] = [];
	midis.forEach((midi, pi) => {
		sound.layers.forEach((layer, li) => {
			const n = unison[li];
			const f = midiToHz(midi + layer.octave * 12 + (layer.interval ?? 0));
			for (let u = 0; u < n; u++) {
				// spread evenly from -1..1 across the stack; a single voice sits centre
				const pos = n === 1 ? 0 : (u / (n - 1)) * 2 - 1;
				out.push({
					wave: layer.wave,
					freq: f,
					detune: pos * layer.detune,
					// a unison voice carries 1/n of its layer
					gain: layer.gain / n,
					pitch: pi,
					pan: pos * Math.min(1, layer.detune / 25),
				});
			}
		});
	});

	// Detuned oscillators add up in power, not amplitude, so normalise by the
	// root-sum-square — that keeps a 1-voice sine and a 24-voice supersaw level.
	const rss = Math.sqrt(out.reduce((a, o) => a + o.gain * o.gain, 0)) || 1;
	for (const o of out) o.gain /= rss;
	return out;
}

/** True when two plans differ only in pitch, so a key change can glide in place. */
export function samePlanShape(a: OscSpec[], b: OscSpec[]): boolean {
	if (a.length !== b.length) return false;
	return a.every((o, i) => o.wave === b[i].wave && o.pitch === b[i].pitch);
}
