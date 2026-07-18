import { describe, expect, it } from 'vitest';
import {
	bpmFromTapIntervalMs,
	clampBpm,
	formatDuration,
	secondsPerBeat
} from './timing';

describe('clampBpm', () => {
	it('clamps to the supported range', () => {
		expect(clampBpm(10)).toBe(20);
		expect(clampBpm(500)).toBe(400);
		expect(clampBpm(120)).toBe(120);
	});
	it('falls back to the minimum for non-finite input', () => {
		expect(clampBpm(NaN)).toBe(20);
		expect(clampBpm(Infinity)).toBe(400);
	});
});

describe('secondsPerBeat', () => {
	it('converts BPM to seconds', () => {
		expect(secondsPerBeat(120)).toBeCloseTo(0.5);
		expect(secondsPerBeat(60)).toBeCloseTo(1);
	});
});

describe('bpmFromTapIntervalMs', () => {
	it('converts a tap interval to BPM', () => {
		expect(bpmFromTapIntervalMs(500)).toBe(120);
		expect(bpmFromTapIntervalMs(1000)).toBe(60);
		expect(bpmFromTapIntervalMs(0)).toBe(0);
	});
});

describe('formatDuration', () => {
	it('formats minutes and seconds', () => {
		expect(formatDuration(0)).toBe('0:00');
		expect(formatDuration(65)).toBe('1:05');
		expect(formatDuration(600)).toBe('10:00');
	});
	it('adds an hours component past 60 minutes', () => {
		expect(formatDuration(3661)).toBe('1:01:01');
	});
});
