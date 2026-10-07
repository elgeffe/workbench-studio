// Ready-made practice plans. Each generator writes a whole run of sections from
// a starting key and a bar count, so a full tour of the keys is one click
// rather than twelve rows typed by hand. The result is an ordinary plan — edit
// it, save it, or replace it with another.

import { INT, type ScaleId } from '../../engine/constants';
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

// ---- chords as a plan ----

export interface ChordLike {
	rootPc: number;
	quality?: string;
	intervals?: number[];
}

/** The `INT` quality a chord is, by name or by its intervals — null if it is none of them. */
export function qualityOfChord(ch: ChordLike): string | null {
	if (ch.quality && ch.quality in INT) return ch.quality;
	const ints = ch.intervals;
	if (!ints) return null;
	const key = (a: number[]) => a.join(',');
	return Object.keys(INT).find((q) => key(INT[q]) === key(ints)) ?? null;
}

/** The scale that fits a chord quality when it is the plan's key: minor-ish → Aeolian, dominant → Mixolydian. */
export function scaleForQuality(q: string | null): ScaleId {
	if (!q) return 'ionian';
	if (/^(min|m7b5|m9b5|m11b5|dim)/.test(q)) return 'aeolian';
	if (/^dom/.test(q)) return 'mixolydian';
	return 'ionian';
}

/** One section per chord — the studio's progression, ready to edit in the plan. */
export function sectionsFromChords(chords: ChordLike[], bars = 1): PlanSection[] {
	const n = Math.max(1, Math.min(64, Math.floor(bars) || 1));
	return chords.slice(0, 96).map((ch) => {
		const q = qualityOfChord(ch);
		return {
			id: sectionId(),
			tonicPc: mod12(ch.rootPc),
			scale: scaleForQuality(q),
			chord: q,
			bars: n,
			bpm: null,
			bpmTo: null,
		};
	});
}

export type ChordTransform = 'triads' | 'sevenths' | 'sus' | 'clear';

const TRIAD_OF: Record<string, string> = { maj7: 'maj', maj6: 'maj', maj9: 'maj', maj11: 'maj', maj13: 'maj', min7: 'min', min6: 'min', min9: 'min', min11: 'min', min13: 'min', minmaj7: 'min', minmaj9: 'min', dom7: 'maj', dom9: 'maj', dom11: 'maj', dom13: 'maj', m7b5: 'dim', m9b5: 'dim', m11b5: 'dim', dim7: 'dim', dom7sus: 'sus4' };
const SEVENTH_OF: Record<string, string> = { maj: 'maj7', min: 'min7', dim: 'm7b5', aug: 'maj7', sus4: 'dom7sus' };

/** Reshape every chord of a plan: strip to triads, stack sevenths, swap the 3rd for a 4th, or drop the chords. */
export function transformChords(sections: PlanSection[], how: ChordTransform): void {
	for (const s of sections) {
		const q = s.chord;
		if (how === 'clear') s.chord = null;
		else if (!q) continue;
		else if (how === 'triads') s.chord = TRIAD_OF[q] ?? q;
		else if (how === 'sevenths') s.chord = SEVENTH_OF[q] ?? q;
		else s.chord = q.startsWith('dom') ? 'dom7sus' : q === 'maj' || q === 'min' ? 'sus4' : q;
	}
}
