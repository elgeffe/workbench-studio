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

export interface DroneSound {
	layers: DroneLayer[];
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

export type DronePresetId = 'warm' | 'sine' | 'organ' | 'bowed' | 'nebula';

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
];

export function presetById(id: string): DronePreset {
	return DRONE_PRESETS.find((p) => p.id === id) ?? DRONE_PRESETS[0];
}

// ---- macros ----

/** Five 0..1 sliders. 0.5 everywhere is the preset exactly as designed. */
export interface DroneMacros {
	brightness: number;
	width: number;
	motion: number;
	space: number;
	drive: number;
}

export const NEUTRAL_MACROS: DroneMacros = {
	brightness: 0.5,
	width: 0.5,
	motion: 0.5,
	space: 0.5,
	drive: 0.5,
};

const c01 = (x: number) => Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0.5));

/** Bend a preset's recipe by the macro sliders. 0.5 returns it unchanged. */
export function resolveSound(base: DroneSound, m: DroneMacros): DroneSound {
	const bright = Math.pow(2, (c01(m.brightness) - 0.5) * 4); // ×0.25 … ×4
	const width = c01(m.width) * 2; // ×0 … ×2
	const motion = c01(m.motion) * 2; // ×0 … ×2
	const space = c01(m.space) * 2; // ×0 … ×2
	const drive = c01(m.drive) * 2; // ×0 … ×2

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
	};
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
 * Semitones above the tonic that the drone sounds. The fifth and third come
 * from the scale itself, so a Locrian drone sounds its ♭5 and a minor triad
 * drone its ♭3 — the drone is the mode's colour, not a generic major chord.
 */
export function voicingOffsets(voicing: DroneVoicing, scale: ScaleId): number[] {
	const int = SCALES[scale].int;
	switch (voicing) {
		case 'root':
			return [0];
		case 'root-fifth':
			return [0, int[4]];
		case 'octaves':
			return [0, 12];
		case 'triad':
			return [0, int[2], int[4]];
	}
}

/** MIDI notes the drone sounds for a key, voicing and register. */
export function droneMidis(
	tonicPc: number,
	scale: ScaleId,
	voicing: DroneVoicing,
	register: DroneRegister,
): number[] {
	const root = REGISTER_C[register] + (((tonicPc % 12) + 12) % 12);
	return voicingOffsets(voicing, scale).map((o) => root + o);
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
