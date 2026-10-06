import { describe, expect, it } from 'vitest';
import {
	DEFAULT_MAX_OSC,
	grooveHits,
	isRhythmic,
	pluckString,
	DRONE_PRESETS,
	NEUTRAL_MACROS,
	droneMidis,
	midiToHz,
	planOscillators,
	presetById,
	resolveSound,
	samePlanShape,
	scaleTriad,
	scalePcs,
	tonicTriadPcs,
	voicingOffsets,
} from './sound';

const rss = (gs: number[]) => Math.sqrt(gs.reduce((a, g) => a + g * g, 0));

describe('voicingOffsets', () => {
	it('uses the 3rd and 5th it is given — from the scale, not a generic major chord', () => {
		const at = (v: Parameters<typeof voicingOffsets>[0], sc: Parameters<typeof scaleTriad>[0]) => {
			const t = scaleTriad(sc);
			return voicingOffsets(v, t.third, t.fifth);
		};
		expect(at('root', 'ionian')).toEqual([0]);
		expect(at('root-fifth', 'ionian')).toEqual([0, 7]);
		expect(at('root-fifth', 'locrian')).toEqual([0, 6]);
		expect(at('octaves', 'dorian')).toEqual([0, 12]);
		expect(at('triad', 'ionian')).toEqual([0, 4, 7]);
		expect(at('triad', 'aeolian')).toEqual([0, 3, 7]);
	});
});

describe('droneMidis', () => {
	it('places the root in the chosen register', () => {
		expect(droneMidis(0, scaleTriad('ionian'), 'root', 'low')).toEqual([36]);
		expect(droneMidis(2, scaleTriad('dorian'), 'root-fifth', 'mid')).toEqual([50, 57]);
		expect(droneMidis(11, scaleTriad('ionian'), 'octaves', 'high')).toEqual([71, 83]);
		expect(droneMidis(7, { third: 5, fifth: 7 }, 'triad', 'mid')).toEqual([55, 60, 62]);
	});

	it('wraps out-of-range pitch classes', () => {
		expect(droneMidis(-1, scaleTriad('ionian'), 'root', 'mid')).toEqual([59]);
		expect(droneMidis(13, scaleTriad('ionian'), 'root', 'mid')).toEqual([49]);
	});
});

describe('midiToHz', () => {
	it('tunes A4 to 440', () => {
		expect(midiToHz(69)).toBeCloseTo(440);
		expect(midiToHz(57)).toBeCloseTo(220);
	});
});

describe('scale helpers', () => {
	it('lists scale and tonic-triad pitch classes', () => {
		expect(scalePcs(2, 'dorian')).toEqual([2, 4, 5, 7, 9, 11, 0]);
		expect(tonicTriadPcs(9, 'aeolian')).toEqual([9, 0, 4]);
	});
});

describe('resolveSound', () => {
	it('returns every preset unchanged at neutral macros', () => {
		for (const p of DRONE_PRESETS) {
			expect(resolveSound(p.sound, NEUTRAL_MACROS)).toEqual(p.sound);
		}
	});

	it('brightness moves the cutoff two octaves either way, within bounds', () => {
		const base = presetById('warm').sound;
		expect(resolveSound(base, { ...NEUTRAL_MACROS, brightness: 1 }).filter.cutoff).toBeCloseTo(base.filter.cutoff * 4);
		expect(resolveSound(base, { ...NEUTRAL_MACROS, brightness: 0 }).filter.cutoff).toBeCloseTo(base.filter.cutoff / 4);
		const sine = presetById('sine').sound;
		expect(resolveSound(sine, { ...NEUTRAL_MACROS, brightness: 1 }).filter.cutoff).toBeLessThanOrEqual(16000);
	});

	it('width and motion at zero leave a still, unison sound', () => {
		const s = resolveSound(presetById('nebula').sound, { ...NEUTRAL_MACROS, width: 0, motion: 0 });
		expect(s.layers.every((l) => l.detune === 0)).toBe(true);
		expect(s.lfos.every((l) => l.depth === 0)).toBe(true);
	});

	it('space and drive past centre add some even to a dry, clean preset', () => {
		const s = resolveSound(presetById('sine').sound, { ...NEUTRAL_MACROS, space: 1, drive: 1 });
		expect(s.reverb.mix).toBeGreaterThan(0);
		expect(s.drive).toBeGreaterThan(0);
		expect(s.reverb.mix).toBeLessThanOrEqual(1);
		expect(s.drive).toBeLessThanOrEqual(1);
	});

	it('treats a non-number slider as neutral', () => {
		const base = presetById('warm').sound;
		expect(resolveSound(base, { ...NEUTRAL_MACROS, brightness: NaN })).toEqual(base);
	});
});

describe('planOscillators', () => {
	it('builds pitch × layer × unison oscillators', () => {
		const warm = presetById('warm').sound; // 2 + 1 per pitch
		const plan = planOscillators(warm, [48, 55]);
		expect(plan).toHaveLength(6);
		expect(plan.filter((o) => o.pitch === 1)).toHaveLength(3);
		// the sub layer sits an octave below
		expect(plan.find((o) => o.wave === 'sine' && o.pitch === 0)!.freq).toBeCloseTo(midiToHz(36));
	});

	it('spreads unison symmetrically and keeps single voices centred', () => {
		const plan = planOscillators(presetById('warm').sound, [48]);
		const tri = plan.filter((o) => o.wave === 'triangle');
		expect(tri.map((o) => o.detune)).toEqual([-8, 8]);
		expect(plan.find((o) => o.wave === 'sine')!.detune).toBe(0);
		expect(plan.find((o) => o.wave === 'sine')!.pan).toBe(0);
	});

	it('normalises loudness across presets and voicings', () => {
		// Tanpura holds nothing — it only plucks — so it has no stack to level
		for (const p of DRONE_PRESETS.filter((p) => p.sound.layers.length)) {
			for (const midis of [[48], [48, 55], [48, 52, 55]]) {
				expect(rss(planOscillators(p.sound, midis).map((o) => o.gain))).toBeCloseTo(1);
			}
		}
	});

	it('plans nothing for a plucked-only sound', () => {
		expect(planOscillators(presetById('tanpura').sound, [48, 55])).toEqual([]);
	});

	it('thins unison rather than dropping notes when over budget', () => {
		const nebula = presetById('nebula').sound; // 4 + 2 + 1 = 7 per pitch
		const plan = planOscillators(nebula, [48, 52, 55]);
		expect(plan.length).toBeLessThanOrEqual(DEFAULT_MAX_OSC);
		for (let pi = 0; pi < 3; pi++) {
			const mine = plan.filter((o) => o.pitch === pi);
			expect(new Set(mine.map((o) => o.wave))).toEqual(new Set(['sawtooth', 'triangle', 'sine']));
		}
		expect(planOscillators(nebula, [48, 52, 55], 6)).toHaveLength(9); // floor: one voice per layer
	});
});

describe('samePlanShape', () => {
	it('lets a key change glide but forces a rebuild for a new voicing or preset', () => {
		const warm = presetById('warm').sound;
		expect(samePlanShape(planOscillators(warm, [48, 55]), planOscillators(warm, [50, 57]))).toBe(true);
		expect(samePlanShape(planOscillators(warm, [48]), planOscillators(warm, [48, 55]))).toBe(false);
		expect(samePlanShape(planOscillators(warm, [48]), planOscillators(presetById('organ').sound, [48]))).toBe(false);
	});
});

describe('grooveHits', () => {
	const g = { div: 4 as const, steps: [1, 0, 0.5, 0.8], swing: 0.2, cutoff: 2, gate: 0.5, decay: 0.1 };

	it('fires the bar-position steps of one beat, skipping rests', () => {
		const hits = grooveHits(g, 10, 0.5, 0);
		expect(hits.map((h) => h.accent)).toEqual([1, 0.5, 0.8]);
		// step = 0.125 s; the 2nd step is even (on time), the 4th is swung late
		expect(hits[0].time).toBeCloseTo(10);
		expect(hits[1].time).toBeCloseTo(10.25);
		expect(hits[2].time).toBeCloseTo(10.375 + 0.2 * 0.125);
	});

	it('reads the pattern from the bar, wrapping it', () => {
		const long = { ...g, steps: [1, 0, 0, 0, 0, 0, 0.3, 0] };
		expect(grooveHits(long, 0, 1, 1).map((h) => h.accent)).toEqual([0.3]);
		expect(grooveHits(long, 0, 1, 2).map((h) => h.accent)).toEqual([1]);
	});
});

describe('pluckString', () => {
	it('cycles the strings beat by beat', () => {
		const p = presetById('tanpura').sound.pluck!;
		expect([0, 1, 2, 3, 4].map((n) => pluckString(p, n))).toEqual([-5, 0, 0, -12, -5]);
	});
});

describe('rhythmic presets', () => {
	it('only Funky and Tanpura need a beat to drive them', () => {
		expect(DRONE_PRESETS.filter((p) => isRhythmic(p.sound)).map((p) => p.id)).toEqual(['funky', 'tanpura']);
	});

	it('the groove slider scales how hard the groove hits', () => {
		const f = presetById('funky').sound;
		expect(resolveSound(f, { ...NEUTRAL_MACROS, groove: 0 }).groove!.cutoff).toBe(0);
		expect(resolveSound(f, { ...NEUTRAL_MACROS, groove: 1 }).groove!.cutoff).toBeCloseTo(f.groove!.cutoff * 2);
	});
});
