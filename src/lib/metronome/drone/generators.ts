// Ready-made practice plans. Each generator writes a whole run of sections from
// a starting key and a bar count, so a full tour of the keys is one click
// rather than twelve rows typed by hand. The result is an ordinary plan — edit
// it, save it, or replace it with another.

import type { ScaleId } from '../../engine/constants';
import { sectionId, type PlanSection } from './plan';

export type GeneratorId = 'fifths' | 'fourths' | 'chromatic' | 'modes' | 'relative' | 'parallel';

export interface Generator {
	id: GeneratorId;
	name: string;
	blurb: string;
	/** whether the generator keeps one scale throughout (so offers a scale choice) */
	usesScale: boolean;
}

export const GENERATORS: Generator[] = [
	{ id: 'fifths', name: 'Circle of fifths', blurb: 'All 12 keys, each a fifth up — one new sharp at a time.', usesScale: true },
	{ id: 'fourths', name: 'Circle of fourths', blurb: 'All 12 keys, each a fourth up — the way jazz tunes move.', usesScale: true },
	{ id: 'chromatic', name: 'Chromatic', blurb: 'All 12 keys, each a semitone up.', usesScale: true },
	{ id: 'modes', name: 'Modes, bright to dark', blurb: 'Seven modes on one tonic, Lydian down to Locrian — one note darkens each time.', usesScale: false },
	{ id: 'relative', name: 'Relative pairs', blurb: 'Each major key and then its relative minor, round the circle.', usesScale: false },
	{ id: 'parallel', name: 'Parallel pairs', blurb: 'Each major key and then the minor on the same tonic, round the circle.', usesScale: false },
];

// Brightest to darkest: each step flattens exactly one note of the last.
const MODES_BY_BRIGHTNESS: ScaleId[] = ['lydian', 'ionian', 'mixolydian', 'dorian', 'aeolian', 'phrygian', 'locrian'];

const mod12 = (n: number) => ((n % 12) + 12) % 12;

export interface GeneratorOptions {
	tonicPc: number;
	scale: ScaleId;
	bars: number;
}

export function generateSections(id: GeneratorId, opts: GeneratorOptions): PlanSection[] {
	const bars = Math.max(1, Math.min(64, Math.floor(opts.bars) || 4));
	const t = mod12(opts.tonicPc);
	const sec = (tonicPc: number, scale: ScaleId): PlanSection => ({
		id: sectionId(),
		tonicPc: mod12(tonicPc),
		scale,
		bars,
		bpm: null,
		bpmTo: null,
	});
	const twelve = (step: number) => Array.from({ length: 12 }, (_, i) => sec(t + i * step, opts.scale));

	switch (id) {
		case 'fifths':
			return twelve(7);
		case 'fourths':
			return twelve(5);
		case 'chromatic':
			return twelve(1);
		case 'modes':
			return MODES_BY_BRIGHTNESS.map((m) => sec(t, m));
		case 'relative':
			return Array.from({ length: 12 }, (_, i) => t + i * 7).flatMap((pc) => [sec(pc, 'ionian'), sec(pc + 9, 'aeolian')]);
		case 'parallel':
			return Array.from({ length: 12 }, (_, i) => t + i * 7).flatMap((pc) => [sec(pc, 'ionian'), sec(pc, 'aeolian')]);
	}
}
