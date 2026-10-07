import { describe, expect, it } from 'vitest';
import { GENERATORS, generateSections, sectionsFromChords, transformChords, type ChordTransform } from './generators';

const keys = (id: Parameters<typeof generateSections>[0], tonicPc = 0, scale: 'ionian' | 'dorian' = 'ionian') =>
	generateSections(id, { tonicPc, scale, bars: 2 }).map((s) => [s.tonicPc, s.scale]);

describe('generateSections', () => {
	it('tours all twelve keys by fifths, fourths and semitones', () => {
		expect(keys('fifths').map(([t]) => t)).toEqual([0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]);
		expect(keys('fourths', 0, 'dorian').map(([t]) => t)).toEqual([0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7]);
		expect(keys('fourths', 0, 'dorian').every(([, s]) => s === 'dorian')).toBe(true);
		expect(keys('chromatic', 3).map(([t]) => t)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]);
	});

	it('walks the modes from brightest to darkest on one tonic', () => {
		expect(keys('modes', 2)).toEqual([
			[2, 'lydian'], [2, 'ionian'], [2, 'mixolydian'], [2, 'dorian'],
			[2, 'aeolian'], [2, 'phrygian'], [2, 'locrian'],
		]);
	});

	it('pairs each major with its relative or parallel minor, round the circle', () => {
		expect(keys('relative').slice(0, 4)).toEqual([[0, 'ionian'], [9, 'aeolian'], [7, 'ionian'], [4, 'aeolian']]);
		expect(keys('parallel').slice(0, 4)).toEqual([[0, 'ionian'], [0, 'aeolian'], [7, 'ionian'], [7, 'aeolian']]);
		expect(keys('relative')).toHaveLength(24);
	});

	it('uses the bar count, clamped, holds the main tempo, and gives fresh ids', () => {
		const s = generateSections('fifths', { tonicPc: 0, scale: 'ionian', bars: 999 });
		expect(s.every((x) => x.bars === 64 && x.bpm === null && x.bpmTo === null)).toBe(true);
		expect(new Set(s.map((x) => x.id)).size).toBe(12);
		expect(generateSections('modes', { tonicPc: 0, scale: 'ionian', bars: 0 })[0].bars).toBe(4);
	});

	it('every listed generator produces sections', () => {
		for (const g of GENERATORS) expect(generateSections(g.id, { tonicPc: 5, scale: 'ionian', bars: 4 }).length).toBeGreaterThan(0);
	});
});

describe('chords as a plan', () => {
	it('turns a progression into one section per chord, by quality or intervals', () => {
		const secs = sectionsFromChords([{ rootPc: 2, quality: 'min7' }, { rootPc: 7, intervals: [0, 4, 7, 10] }, { rootPc: 0 }], 2);
		expect(secs.map((s) => [s.tonicPc, s.chord, s.scale, s.bars])).toEqual([
			[2, 'min7', 'aeolian', 2],
			[7, 'dom7', 'mixolydian', 2],
			[0, null, 'ionian', 2],
		]);
	});

	it('reshapes chords: triads, sevenths, sus, or none', () => {
		const mk = () => sectionsFromChords([{ rootPc: 0, quality: 'maj7' }, { rootPc: 2, quality: 'min' }, { rootPc: 7, quality: 'dom7' }]);
		const run = (how: ChordTransform) => {
			const s = mk();
			transformChords(s, how);
			return s.map((x) => x.chord);
		};
		expect(run('triads')).toEqual(['maj', 'min', 'maj']);
		expect(run('sevenths')).toEqual(['maj7', 'min7', 'dom7']);
		expect(run('sus')).toEqual(['maj7', 'sus4', 'dom7sus']);
		expect(run('clear')).toEqual([null, null, null]);
	});
});
