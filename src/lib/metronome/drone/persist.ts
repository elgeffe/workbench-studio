// Persistence for the drone: its settings (so a reload picks up where you
// left off, plan included), the sounds you save, and the plans you name.
// localStorage, guarded like the practice log in `history.ts`, and every read
// is checked field by field — a stale or hand-edited entry falls back to a
// default rather than breaking the page.

import { SCALES, type ScaleId } from '../../engine/constants';
import { DRONE_PRESETS, NEUTRAL_MACROS, VOICINGS, type DroneMacros, type DronePresetId, type DroneRegister, type DroneVoicing } from './sound';
import { sectionId, type DronePlan, type PlanSection } from './plan';

export type DroneSource = 'studio' | 'own' | 'chords';

export interface DroneSettings {
	source: DroneSource;
	tonicPc: number;
	scale: ScaleId;
	voicing: DroneVoicing;
	register: DroneRegister;
	preset: DronePresetId;
	macros: DroneMacros;
	volume: number;
	withClick: boolean;
	plan: DronePlan;
}

export interface UserPreset {
	id: string;
	name: string;
	base: DronePresetId;
	macros: DroneMacros;
}

export interface SavedPlan {
	id: string;
	name: string;
	plan: DronePlan;
}

const SETTINGS_KEY = 'workbench.drone.settings.v1';
const PRESETS_KEY = 'workbench.drone.presets.v1';
const PLANS_KEY = 'workbench.drone.plans.v1';
const MAX_SAVED = 50;

type KV = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): KV | null {
	try {
		return typeof localStorage !== 'undefined' ? localStorage : null;
	} catch {
		return null;
	}
}

function read(key: string, kv: KV | null): unknown {
	if (!kv) return null;
	try {
		const raw = kv.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

function write(key: string, value: unknown, kv: KV | null): void {
	if (!kv) return;
	try {
		kv.setItem(key, JSON.stringify(value));
	} catch {
		// quota / private mode — the live session still works
	}
}

// ---- field checks ----

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown, lo: number, hi: number): number | null =>
	typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : null;
const pc = (x: unknown): number | null => {
	const n = num(x, -1e6, 1e6);
	return n == null ? null : ((Math.round(n) % 12) + 12) % 12;
};
const scaleId = (x: unknown): ScaleId | null => (typeof x === 'string' && x in SCALES ? (x as ScaleId) : null);
const presetId = (x: unknown): DronePresetId | null =>
	DRONE_PRESETS.some((p) => p.id === x) ? (x as DronePresetId) : null;
const str = (x: unknown, max = 60): string | null =>
	typeof x === 'string' && x.trim() ? x.trim().slice(0, max) : null;

export function sanitizeMacros(x: unknown): DroneMacros {
	const m = isObj(x) ? x : {};
	const out = { ...NEUTRAL_MACROS };
	for (const k of Object.keys(out) as (keyof DroneMacros)[]) out[k] = num(m[k], 0, 1) ?? NEUTRAL_MACROS[k];
	return out;
}

function sanitizeSection(x: unknown): PlanSection | null {
	if (!isObj(x)) return null;
	const tonicPc = pc(x.tonicPc);
	const scale = scaleId(x.scale);
	if (tonicPc == null || !scale) return null;
	const bpm = num(x.bpm, 20, 400);
	return {
		id: sectionId(),
		tonicPc,
		scale,
		bars: Math.round(num(x.bars, 1, 64) ?? 4),
		bpm,
		bpmTo: bpm == null ? null : num(x.bpmTo, 20, 400),
	};
}

/** A plan from storage, or null if nothing usable is left of it. */
export function sanitizePlan(x: unknown): DronePlan | null {
	if (!isObj(x) || !Array.isArray(x.sections)) return null;
	const sections = x.sections.map(sanitizeSection).filter((s): s is PlanSection => !!s).slice(0, 96);
	if (!sections.length) return null;
	return {
		sections,
		repeat: x.repeat === 'once' ? 'once' : 'loop',
		loopBpmDelta: Math.round(num(x.loopBpmDelta, -50, 50) ?? 0),
		loopTranspose: Math.round(num(x.loopTranspose, -11, 11) ?? 0),
	};
}

// ---- settings ----

export function loadDroneSettings(kv: KV | null = storage()): Partial<DroneSettings> {
	const x = read(SETTINGS_KEY, kv);
	if (!isObj(x)) return {};
	const out: Partial<DroneSettings> = {};
	if (x.source === 'studio' || x.source === 'own' || x.source === 'chords') out.source = x.source;
	const t = pc(x.tonicPc);
	if (t != null) out.tonicPc = t;
	const sc = scaleId(x.scale);
	if (sc) out.scale = sc;
	if (VOICINGS.some((v) => v.id === x.voicing)) out.voicing = x.voicing as DroneVoicing;
	if (x.register === 'low' || x.register === 'mid' || x.register === 'high') out.register = x.register;
	const p = presetId(x.preset);
	if (p) out.preset = p;
	if (isObj(x.macros)) out.macros = sanitizeMacros(x.macros);
	const v = num(x.volume, 0, 1);
	if (v != null) out.volume = v;
	if (typeof x.withClick === 'boolean') out.withClick = x.withClick;
	const plan = sanitizePlan(x.plan);
	if (plan) out.plan = plan;
	return out;
}

export function saveDroneSettings(s: DroneSettings, kv: KV | null = storage()): void {
	write(SETTINGS_KEY, s, kv);
}

// ---- your sounds ----

export function loadUserPresets(kv: KV | null = storage()): UserPreset[] {
	const x = read(PRESETS_KEY, kv);
	if (!Array.isArray(x)) return [];
	return x
		.map((e): UserPreset | null => {
			if (!isObj(e)) return null;
			const name = str(e.name);
			const base = presetId(e.base);
			if (!name || !base) return null;
			return { id: str(e.id) ?? sectionId(), name, base, macros: sanitizeMacros(e.macros) };
		})
		.filter((e): e is UserPreset => !!e)
		.slice(0, MAX_SAVED);
}

export function saveUserPresets(list: UserPreset[], kv: KV | null = storage()): void {
	write(PRESETS_KEY, list.slice(0, MAX_SAVED), kv);
}

// ---- your plans ----

export function loadSavedPlans(kv: KV | null = storage()): SavedPlan[] {
	const x = read(PLANS_KEY, kv);
	if (!Array.isArray(x)) return [];
	return x
		.map((e): SavedPlan | null => {
			if (!isObj(e)) return null;
			const name = str(e.name);
			const plan = sanitizePlan(e.plan);
			if (!name || !plan) return null;
			return { id: str(e.id) ?? sectionId(), name, plan };
		})
		.filter((e): e is SavedPlan => !!e)
		.slice(0, MAX_SAVED);
}

export function saveSavedPlans(list: SavedPlan[], kv: KV | null = storage()): void {
	write(PLANS_KEY, list.slice(0, MAX_SAVED), kv);
}

/** A copy of a plan with fresh section ids, so editing it never touches the original. */
export function clonePlan(p: DronePlan): DronePlan {
	return { ...p, sections: p.sections.map((s) => ({ ...s, id: sectionId() })) };
}
