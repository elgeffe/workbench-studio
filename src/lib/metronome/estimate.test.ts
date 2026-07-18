import { describe, expect, it } from 'vitest';
import { estimateBpmFromOnsets, foldToBpmRange, intervalToBpm } from './estimate';

describe('foldToBpmRange', () => {
	it('octave-folds into range', () => {
		expect(foldToBpmRange(120)).toBeCloseTo(120);
		expect(foldToBpmRange(240)).toBeCloseTo(120); // too fast, halved
		expect(foldToBpmRange(30)).toBeCloseTo(60); // too slow, doubled
	});
	it('handles bad input', () => {
		expect(foldToBpmRange(0)).toBe(0);
		expect(foldToBpmRange(NaN)).toBe(0);
	});
});

describe('intervalToBpm', () => {
	it('converts an interval in seconds to BPM', () => {
		expect(intervalToBpm(0.5)).toBe(120);
		expect(intervalToBpm(1)).toBe(60);
	});
});

describe('estimateBpmFromOnsets', () => {
	it('returns no estimate without enough data', () => {
		expect(estimateBpmFromOnsets([0, 0.5]).bpm).toBe(0);
	});

	it('detects a steady 120 BPM pulse with high confidence', () => {
		const onsets = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
		const est = estimateBpmFromOnsets(onsets);
		expect(est.bpm).toBeCloseTo(120, 0);
		expect(est.confidence).toBeGreaterThan(0.8);
	});

	it('tolerates mild timing jitter', () => {
		const onsets = [0, 0.51, 0.99, 1.52, 2.0, 2.48, 3.01];
		const est = estimateBpmFromOnsets(onsets);
		expect(est.bpm).toBeGreaterThan(112);
		expect(est.bpm).toBeLessThan(128);
	});
});
