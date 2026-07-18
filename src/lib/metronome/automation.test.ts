import { describe, expect, it } from 'vitest';
import type { BeatContext } from './engine';
import {
	clamp01,
	gapMutedAt,
	hashUnit,
	lerp,
	rampTempoByBars,
	rampTempoByTime,
	stepBpmAt,
	type StepConfig
} from './automation';

function ctx(partial: Partial<BeatContext>): BeatContext {
	return {
		bar: 0,
		beatInBar: 0,
		beatsPerBar: 4,
		elapsedBeats: 0,
		elapsedSeconds: 0,
		baseBpm: 120,
		...partial
	};
}

describe('stepBpmAt', () => {
	const base: StepConfig = {
		startBpm: 100,
		step: 10,
		everyBars: 2,
		minBpm: 60,
		maxBpm: 130,
		mode: 'clamp'
	};

	it('increments every N bars and holds at the max (clamp)', () => {
		expect(stepBpmAt(0, base)).toBe(100);
		expect(stepBpmAt(1, base)).toBe(100);
		expect(stepBpmAt(2, base)).toBe(110);
		expect(stepBpmAt(4, base)).toBe(120);
		expect(stepBpmAt(6, base)).toBe(130);
		expect(stepBpmAt(100, base)).toBe(130); // clamped
	});

	it('wraps around in loop mode', () => {
		const cfg: StepConfig = { ...base, startBpm: 60, step: 20, everyBars: 1, minBpm: 60, maxBpm: 120, mode: 'loop' };
		expect(stepBpmAt(0, cfg)).toBe(60);
		expect(stepBpmAt(2, cfg)).toBe(100);
		expect(stepBpmAt(3, cfg)).toBe(60); // 120 wraps to 60
	});

	it('ping-pongs in bounce mode', () => {
		const cfg: StepConfig = { ...base, startBpm: 60, step: 20, everyBars: 1, minBpm: 60, maxBpm: 120, mode: 'bounce' };
		expect(stepBpmAt(3, cfg)).toBe(120); // peak
		expect(stepBpmAt(4, cfg)).toBe(100); // coming back down
		expect(stepBpmAt(6, cfg)).toBe(60); // back to bottom
	});
});

describe('lerp / clamp01', () => {
	it('interpolates', () => {
		expect(lerp(80, 120, 0)).toBe(80);
		expect(lerp(80, 120, 0.5)).toBe(100);
		expect(lerp(80, 120, 1)).toBe(120);
	});
	it('clamps to 0..1', () => {
		expect(clamp01(-1)).toBe(0);
		expect(clamp01(2)).toBe(1);
	});
});

describe('ramp tempo', () => {
	it('ramps by time', () => {
		const fn = rampTempoByTime({ startBpm: 80, endBpm: 120, seconds: 100 });
		expect(fn(ctx({ elapsedSeconds: 0 }))).toBeCloseTo(80);
		expect(fn(ctx({ elapsedSeconds: 50 }))).toBeCloseTo(100);
		expect(fn(ctx({ elapsedSeconds: 200 }))).toBeCloseTo(120); // clamped at end
	});

	it('ramps by bars', () => {
		const fn = rampTempoByBars({ startBpm: 80, endBpm: 120, bars: 8 });
		expect(fn(ctx({ bar: 0, beatInBar: 0 }))).toBeCloseTo(80);
		expect(fn(ctx({ bar: 4, beatInBar: 0 }))).toBeCloseTo(100);
		expect(fn(ctx({ bar: 8, beatInBar: 0 }))).toBeCloseTo(120);
	});
});

describe('gapMutedAt', () => {
	it('mutes on a cycle', () => {
		const cfg = { mode: 'cycle' as const, playBars: 2, muteBars: 2, probability: 0 };
		expect(gapMutedAt(0, cfg)).toBe(false);
		expect(gapMutedAt(1, cfg)).toBe(false);
		expect(gapMutedAt(2, cfg)).toBe(true);
		expect(gapMutedAt(3, cfg)).toBe(true);
		expect(gapMutedAt(4, cfg)).toBe(false);
	});

	it('is deterministic per bar in random mode', () => {
		const always = { mode: 'random' as const, playBars: 1, muteBars: 1, probability: 1 };
		const never = { mode: 'random' as const, playBars: 1, muteBars: 1, probability: 0 };
		expect(gapMutedAt(7, always)).toBe(true);
		expect(gapMutedAt(7, never)).toBe(false);
	});
});

describe('hashUnit', () => {
	it('is stable and in [0,1)', () => {
		const a = hashUnit(42);
		const b = hashUnit(42);
		expect(a).toBe(b);
		expect(a).toBeGreaterThanOrEqual(0);
		expect(a).toBeLessThan(1);
	});
});
