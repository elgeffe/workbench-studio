import { describe, expect, it } from 'vitest';
import { analyseChanges } from '../../engine/keycenters';
import { parseChanges } from '../../engine/symbols';
import type { Chord } from '../../engine/constants';
import { chordTriad, guideForChord, guideForKey } from './guide';

describe('guideForKey', () => {
	it('lights the scale, marks the tonic triad, names and spells the key', () => {
		const g = guideForKey({ tonicPc: 3, scale: 'dorian' });
		expect(g.root).toBe(3);
		expect([g.third, g.fifth]).toEqual([3, 7]);
		expect(g.pcs).toEqual([3, 5, 6, 8, 10, 0, 1]);
		expect(g.landmarks).toEqual([3, 6, 10]);
		expect(g.name).toBe('Eb Dorian');
		expect(g.notes).toBe('Eb · F · Gb · Ab · Bb · C · Db');
	});

	it('normalises the tonic', () => {
		expect(guideForKey({ tonicPc: 14, scale: 'ionian' }).root).toBe(2);
	});
});

describe('chordTriad', () => {
	it('reads the 3rd and 5th the chord really has', () => {
		expect(chordTriad([0, 4, 7, 10])).toEqual({ third: 4, fifth: 7 });
		expect(chordTriad([0, 3, 6, 10])).toEqual({ third: 3, fifth: 6 });
		expect(chordTriad([0, 4, 8])).toEqual({ third: 4, fifth: 8 });
		expect(chordTriad([0, 5, 7, 10])).toEqual({ third: 5, fifth: 7 });
		expect(chordTriad([0, 4, 10, 14])).toEqual({ third: 4, fifth: 7 }); // shell voicing: assume a 5th
	});
});

describe('guideForChord', () => {
	const chords: Chord[] = parseChanges('Dm7 G7 Cmaj7').map((p) => ({ rootPc: p!.rootPc, intervals: p!.intervals, name: p!.name }));
	const analysis = analyseChanges(chords);
	const at = (i: number) => guideForChord(chords[i], analysis.find((a) => a.i === i), { tonicPc: 0, scale: 'ionian' });

	it('gives each chord its chord scale in the local key, with its tones as landmarks', () => {
		const dm7 = at(0);
		expect(dm7.root).toBe(2);
		expect(dm7.name).toBe('Dm7 · D dorian');
		expect(dm7.notes).toBe('D · E · F · G · A · B · C');
		expect(new Set(dm7.landmarks)).toEqual(new Set([2, 5, 9, 0]));
		expect([dm7.third, dm7.fifth]).toEqual([3, 7]);

		expect(at(1).name).toBe('G7 · G mixolydian');
		expect(at(2).name).toBe('Cmaj7 · C ionian');
	});

	it('falls back to the chord tones when the chord was not analysed', () => {
		const g = guideForChord(chords[1], undefined, { tonicPc: 0, scale: 'ionian' });
		expect(g.name).toBe('G7');
		expect(new Set(g.pcs)).toEqual(new Set([7, 11, 2, 5]));
		expect(g.notes).toBe('G · B · D · F');
	});
});

describe('guideForKey with a chord', () => {
	it('lights the key but aims the drone and landmarks at the chord', () => {
		const g = guideForKey({ tonicPc: 7, scale: 'mixolydian', chord: 'dom7sus' });
		expect(g.third).toBe(5);
		expect(new Set(g.landmarks)).toEqual(new Set([7, 0, 2, 5]));
	});
});
