import { describe, expect, it } from 'vitest';
import {
	defaultPlan,
	nextSection,
	planAt,
	planBpmAt,
	planLength,
	planUpcoming,
	type DronePlan,
	type PlanSection,
} from './plan';

const sec = (tonicPc: number, bars: number, extra: Partial<PlanSection> = {}): PlanSection => ({
	id: `s${tonicPc}-${bars}`,
	tonicPc,
	scale: 'ionian',
	bars,
	bpm: null,
	bpmTo: null,
	...extra,
});
const plan = (sections: PlanSection[], extra: Partial<DronePlan> = {}): DronePlan => ({
	sections,
	repeat: 'loop',
	loopBpmDelta: 0,
	loopTranspose: 0,
	...extra,
});
const at = (bar: number, beatInBar = 0) => ({ bar, beatInBar, beatsPerBar: 4, baseBpm: 100 });

describe('planAt', () => {
	const p = plan([sec(0, 2), sec(7, 3)]);

	it('walks sections bar by bar', () => {
		expect(planLength(p)).toBe(5);
		expect(planAt(0, p)).toMatchObject({ index: 0, barInSection: 0, loop: 0, key: { tonicPc: 0 } });
		expect(planAt(1, p)).toMatchObject({ index: 0, barInSection: 1 });
		expect(planAt(2, p)).toMatchObject({ index: 1, barInSection: 0, key: { tonicPc: 7 } });
		expect(planAt(4, p)).toMatchObject({ index: 1, barInSection: 2 });
	});

	it('loops, transposing each pass', () => {
		expect(planAt(5, p)).toMatchObject({ index: 0, barInSection: 0, loop: 1, key: { tonicPc: 0 } });
		const up = plan(p.sections, { loopTranspose: 2 });
		expect(planAt(5, up)!.key.tonicPc).toBe(2);
		expect(planAt(12, up)!.key.tonicPc).toBe(11); // pass 2, section 2: 7 + 4
	});

	it('a once-through plan finishes and parks on its last bar', () => {
		const once = plan(p.sections, { repeat: 'once', loopTranspose: 5 });
		expect(planAt(4, once)!.done).toBe(false);
		expect(planAt(5, once)).toMatchObject({ done: true, index: 1, barInSection: 2, loop: 0 });
		expect(planAt(5, once)!.key.tonicPc).toBe(7); // no transposition when not looping
	});

	it('treats empty or broken bar counts as one bar', () => {
		expect(planAt(0, plan([]))).toBeNull();
		const odd = plan([sec(0, 0), sec(2, NaN)]);
		expect(planLength(odd)).toBe(2);
		expect(planAt(1, odd)!.key.tonicPc).toBe(2);
	});
});

describe('planUpcoming', () => {
	it('counts bars to the next key change', () => {
		const p = plan([sec(0, 3), sec(7, 2)]);
		expect(planUpcoming(0, p)).toEqual({ key: { tonicPc: 7, scale: 'ionian' }, inBars: 3 });
		expect(planUpcoming(2, p)!.inBars).toBe(1);
		// wraps round the loop back to the first section
		expect(planUpcoming(3, p)).toEqual({ key: { tonicPc: 0, scale: 'ionian' }, inBars: 2 });
	});

	it('skips sections in the same key and sees scale-only changes', () => {
		const p = plan([sec(0, 2), sec(0, 2), sec(0, 2, { scale: 'dorian' })]);
		expect(planUpcoming(0, p)).toEqual({ key: { tonicPc: 0, scale: 'dorian' }, inBars: 4 });
	});

	it('is null when the key never changes, or the plan has ended', () => {
		expect(planUpcoming(0, plan([sec(0, 2), sec(0, 2)]))).toBeNull();
		const once = plan([sec(0, 2), sec(7, 2)], { repeat: 'once' });
		expect(planUpcoming(2, once)).toBeNull();
		// a transposing loop changes key even with a single section
		expect(planUpcoming(0, plan([sec(0, 2)], { loopTranspose: 7 }))!.inBars).toBe(2);
	});
});

describe('planBpmAt', () => {
	it('holds the main tempo when a section sets none', () => {
		expect(planBpmAt(at(0), plan([sec(0, 2)]))).toBe(100);
	});

	it('holds a section tempo, or ramps across the section', () => {
		const p = plan([sec(0, 2, { bpm: 80 }), sec(7, 2, { bpm: 80, bpmTo: 120 })]);
		expect(planBpmAt(at(1, 3), p)).toBe(80);
		expect(planBpmAt(at(2), p)).toBe(80);
		expect(planBpmAt(at(3), p)).toBe(100);
		expect(planBpmAt(at(3, 2), p)).toBe(110);
	});

	it('adds the per-pass step on loops only', () => {
		const p = plan([sec(0, 2, { bpm: 90 })], { loopBpmDelta: 5 });
		expect(planBpmAt(at(4), p)).toBe(100);
		expect(planBpmAt(at(4), { ...p, repeat: 'once' })).toBe(90);
	});
});

describe('section helpers', () => {
	it('adds the next section a fifth up, same shape', () => {
		const s = nextSection(sec(5, 3, { bpm: 90 }));
		expect(s).toMatchObject({ tonicPc: 0, bars: 3, bpm: 90 });
		expect(s.id).not.toBe('s5-3');
	});

	it('defaults to four bars each of C, G, D, A, looping', () => {
		const p = defaultPlan();
		expect(p.sections.map((s) => s.tonicPc)).toEqual([0, 7, 2, 9]);
		expect(new Set(p.sections.map((s) => s.id)).size).toBe(4);
		expect(p.repeat).toBe('loop');
	});
});
