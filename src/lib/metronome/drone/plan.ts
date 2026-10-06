// The practice plan: a timeline of sections, each a number of bars in one key,
// optionally at its own tempo (held, or ramped across the section). The click
// takes its tempo from the plan; the drone and the instruments take its key.
// Pure functions of an absolute bar index, like the step trainer in
// `automation.ts`, so a plan behaves identically under test and on the clock.

import type { ScaleId } from '../../engine/constants';
import type { BeatContext, TempoFn } from '../engine';
import { lerp, clamp01 } from '../automation';

export interface PlanKey {
	tonicPc: number;
	scale: ScaleId;
}

export interface PlanSection extends PlanKey {
	id: string;
	bars: number;
	/** tempo for the section; null holds the metronome's own tempo */
	bpm: number | null;
	/** when set, the tempo ramps from `bpm` to this across the section */
	bpmTo: number | null;
}

export type PlanRepeat = 'loop' | 'once';

export interface DronePlan {
	sections: PlanSection[];
	repeat: PlanRepeat;
	/** tempo added on every pass through the plan (loop only) */
	loopBpmDelta: number;
	/** semitones every pass is transposed by (loop only) */
	loopTranspose: number;
}

export interface PlanPosition {
	index: number;
	section: PlanSection;
	/** 0-based bar within the section */
	barInSection: number;
	/** 0-based pass through the plan */
	loop: number;
	/** the section's key, with the per-pass transposition applied */
	key: PlanKey;
	/** a once-through plan has played its last bar */
	done: boolean;
}

const mod12 = (n: number) => ((n % 12) + 12) % 12;
const barsOf = (s: PlanSection) => Math.max(1, Math.floor(s.bars) || 1);

/** Bars in one pass through the plan. */
export function planLength(plan: DronePlan): number {
	return plan.sections.reduce((a, s) => a + barsOf(s), 0);
}

/** Where an absolute bar falls in the plan, or null for an empty plan. */
export function planAt(bar: number, plan: DronePlan): PlanPosition | null {
	const len = planLength(plan);
	if (len === 0) return null;
	const b = Math.max(0, Math.floor(bar));
	const once = plan.repeat === 'once';
	const done = once && b >= len;
	// a finished once-through plan stays parked on its last bar
	const loop = once ? 0 : Math.floor(b / len);
	let rest = done ? len - 1 : b % len;

	for (let index = 0; index < plan.sections.length; index++) {
		const section = plan.sections[index];
		const n = barsOf(section);
		if (rest < n) {
			const shift = once ? 0 : loop * Math.round(plan.loopTranspose || 0);
			return {
				index,
				section,
				barInSection: rest,
				loop,
				key: { tonicPc: mod12(section.tonicPc + shift), scale: section.scale },
				done,
			};
		}
		rest -= n;
	}
	return null; // unreachable: rest < len
}

export function sameKey(a: PlanKey | null | undefined, b: PlanKey | null | undefined): boolean {
	return !!a && !!b && a.tonicPc === b.tonicPc && a.scale === b.scale;
}

/**
 * The next key change after `bar`: the key, and how many bars away its first
 * bar is (1 = the very next bar). Null when the key never changes again.
 */
export function planUpcoming(bar: number, plan: DronePlan): { key: PlanKey; inBars: number } | null {
	const here = planAt(bar, plan);
	if (!here || here.done) return null;
	// one full pass plus one bar always reaches a different key, if any exists
	const horizon = planLength(plan) + 1;
	for (let k = 1; k <= horizon; k++) {
		const p = planAt(bar + k, plan);
		if (!p || p.done) return null;
		if (!sameKey(p.key, here.key)) return { key: p.key, inBars: k };
	}
	return null;
}

/** Tempo at a beat: the section's own (held or ramped), plus the per-pass step. */
export function planBpmAt(
	ctx: Pick<BeatContext, 'bar' | 'beatInBar' | 'beatsPerBar' | 'baseBpm'>,
	plan: DronePlan,
): number {
	const p = planAt(ctx.bar, plan);
	if (!p) return ctx.baseBpm;
	const s = p.section;
	const from = s.bpm ?? ctx.baseBpm;
	let bpm = from;
	if (s.bpm != null && s.bpmTo != null) {
		const progressed = p.barInSection + ctx.beatInBar / Math.max(1, ctx.beatsPerBar);
		bpm = lerp(from, s.bpmTo, clamp01(progressed / barsOf(s)));
	}
	if (plan.repeat === 'loop') bpm += p.loop * (plan.loopBpmDelta || 0);
	return bpm;
}

export function planTempo(plan: DronePlan): TempoFn {
	return (ctx: BeatContext) => planBpmAt(ctx, plan);
}

let seq = 0;
export function sectionId(): string {
	return 's' + Date.now().toString(36) + (seq++).toString(36);
}

/** A sensible next section: the same shape, a fifth up — the circle's next key. */
export function nextSection(prev: PlanSection | undefined): PlanSection {
	if (!prev) return { id: sectionId(), tonicPc: 0, scale: 'ionian', bars: 4, bpm: null, bpmTo: null };
	return { ...prev, id: sectionId(), tonicPc: mod12(prev.tonicPc + 7) };
}

export function defaultPlan(): DronePlan {
	const sections: PlanSection[] = [];
	for (let i = 0; i < 4; i++) sections.push(nextSection(sections[i - 1]));
	return { sections, repeat: 'loop', loopBpmDelta: 0, loopTranspose: 0 };
}
