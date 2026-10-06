import { describe, expect, it } from 'vitest';
import {
	clonePlan,
	loadDroneSettings,
	loadSavedPlans,
	loadUserPresets,
	sanitizeMacros,
	sanitizePlan,
	saveDroneSettings,
	saveSavedPlans,
	saveUserPresets,
	type DroneSettings,
} from './persist';
import { NEUTRAL_MACROS } from './sound';
import { defaultPlan } from './plan';

function memory() {
	const m = new Map<string, string>();
	return {
		getItem: (k: string) => m.get(k) ?? null,
		setItem: (k: string, v: string) => void m.set(k, v),
		raw: m,
	};
}

const settings: DroneSettings = {
	source: 'chords',
	tonicPc: 2,
	scale: 'dorian',
	voicing: 'triad',
	register: 'low',
	preset: 'nebula',
	macros: { ...NEUTRAL_MACROS, space: 0.9 },
	volume: 0.4,
	withClick: true,
	plan: defaultPlan(),
};

describe('drone settings', () => {
	it('round-trips', () => {
		const kv = memory();
		saveDroneSettings(settings, kv);
		const back = loadDroneSettings(kv);
		expect({ ...back, plan: undefined }).toEqual({ ...settings, plan: undefined });
		expect(back.plan!.sections.map((s) => s.tonicPc)).toEqual([0, 7, 2, 9]);
	});

	it('drops anything it does not recognise, keeping the rest', () => {
		const kv = memory();
		kv.setItem('workbench.drone.settings.v1', JSON.stringify({
			source: 'radio', tonicPc: 26, scale: 'bebop', voicing: 'cluster', register: 'mid',
			preset: 'gone', macros: { brightness: 7, width: 'x' }, volume: -3, withClick: 'yes', plan: { sections: [] },
		}));
		expect(loadDroneSettings(kv)).toEqual({
			tonicPc: 2,
			register: 'mid',
			macros: { ...NEUTRAL_MACROS, brightness: 1 },
			volume: 0,
		});
	});

	it('survives missing storage and corrupt JSON', () => {
		expect(loadDroneSettings(null)).toEqual({});
		const kv = memory();
		kv.setItem('workbench.drone.settings.v1', '{nope');
		expect(loadDroneSettings(kv)).toEqual({});
	});
});

describe('sanitizePlan', () => {
	it('keeps valid sections, clamps numbers, and drops broken ones', () => {
		const p = sanitizePlan({
			repeat: 'whatever',
			loopBpmDelta: 99,
			loopTranspose: -3.6,
			sections: [
				{ tonicPc: 7, scale: 'ionian', bars: 200, bpm: 10, bpmTo: 999 },
				{ tonicPc: 'G', scale: 'ionian', bars: 4 },
				{ tonicPc: 2, scale: 'dorian', bars: 3, bpm: null, bpmTo: 120 },
			],
		})!;
		expect(p.repeat).toBe('loop');
		expect(p.loopBpmDelta).toBe(50);
		expect(p.loopTranspose).toBe(-4);
		expect(p.sections).toHaveLength(2);
		expect(p.sections[0]).toMatchObject({ tonicPc: 7, bars: 64, bpm: 20, bpmTo: 400 });
		// a ramp needs a start tempo
		expect(p.sections[1]).toMatchObject({ bpm: null, bpmTo: null });
	});

	it('is null when nothing usable is left', () => {
		expect(sanitizePlan(null)).toBeNull();
		expect(sanitizePlan({ sections: [{ nope: 1 }] })).toBeNull();
	});
});

describe('saved sounds and plans', () => {
	it('round-trip, skipping malformed entries', () => {
		const kv = memory();
		saveUserPresets([{ id: 'a', name: 'Dark pad', base: 'warm', macros: { ...NEUTRAL_MACROS, brightness: 0.1 } }], kv);
		saveSavedPlans([{ id: 'b', name: 'Circle', plan: defaultPlan() }], kv);
		expect(loadUserPresets(kv)).toEqual([{ id: 'a', name: 'Dark pad', base: 'warm', macros: { ...NEUTRAL_MACROS, brightness: 0.1 } }]);
		expect(loadSavedPlans(kv)[0].name).toBe('Circle');

		kv.setItem('workbench.drone.presets.v1', JSON.stringify([{ name: '', base: 'warm' }, { name: 'X', base: 'nope' }, 3]));
		expect(loadUserPresets(kv)).toEqual([]);
	});

	it('sanitizeMacros fills gaps with neutral', () => {
		expect(sanitizeMacros(undefined)).toEqual(NEUTRAL_MACROS);
		expect(sanitizeMacros({ groove: 0.2 }).groove).toBe(0.2);
	});

	it('clonePlan gives every section a fresh id', () => {
		const p = defaultPlan();
		const c = clonePlan(p);
		expect(c.sections.map((s) => s.tonicPc)).toEqual(p.sections.map((s) => s.tonicPc));
		expect(c.sections.some((s, i) => s.id === p.sections[i].id)).toBe(false);
	});
});
