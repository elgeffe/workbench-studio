// What the drone is "about" at any moment, in one shape: the note it sits on,
// the 3rd and 5th it can add, the scale the instruments should light, the
// landmark tones inside that scale, and how to spell and name it all.
//
// A guide comes either from a key (the studio's, the drone's own, or a plan
// section's) or from a chord in the Chords progression — where the scale is
// the chord's own chord scale (D dorian over Dm7 in C, G mixolydian over G7),
// read from the progression's key-centre analysis, and the landmarks are the
// chord's tones.

import { INT, SCALES, SUF, type Chord, type ScaleId } from '../../engine/constants';
import { gI, gPcs, keyNameStr, mod12, prefFlat, scaleNotesStr, spell, spellScale } from '../../engine/theory';
import { chordScale } from '../../engine/chordscale';
import type { AnalysedChord } from '../../engine/keycenters';

/** A key as the drone and the instruments read it. */
export interface DroneKey {
	tonicPc: number;
	scale: ScaleId;
	/** a chord quality (a key of `INT`) to hold over the key — a plan section's chord */
	chord?: string | null;
}

export interface DroneGuide {
	/** the drone's note, and the instruments' root */
	root: number;
	/** semitones above the root of the 3rd and 5th the drone may add */
	third: number;
	fifth: number;
	/** the scale to play: pitch classes to light */
	pcs: number[];
	/** the tones to aim for inside it — tonic triad, or the chord itself */
	landmarks: number[];
	/** the key every note name is spelled in */
	spell: DroneKey;
	/** "D Dorian", or "Dm7 · D dorian" */
	name: string;
	/** the scale, spelled: "D · E · F · G · A · B · C" */
	notes: string;
}

export function guideForKey(k: DroneKey): DroneGuide {
	const int = SCALES[k.scale].int;
	const root = mod12(k.tonicPc);
	const chord = k.chord ? INT[k.chord] : undefined;
	if (chord) {
		// the key's scale stays lit; the drone and the landmarks follow the chord
		const { third, fifth } = chordTriad(chord);
		const ch: Chord = { rootPc: root, quality: k.chord ?? undefined };
		return {
			root, third, fifth,
			pcs: int.map((i) => mod12(root + i)),
			landmarks: [...new Set(gPcs(ch).map(mod12))],
			spell: { tonicPc: root, scale: k.scale },
			name: `${spell(root, root, k.scale)}${SUF[k.chord!] ?? ''} · ${keyNameStr(root, k.scale)}`,
			notes: scaleNotesStr(root, k.scale),
		};
	}
	return {
		root,
		third: int[2],
		fifth: int[4],
		pcs: int.map((i) => mod12(root + i)),
		landmarks: [0, int[2], int[4]].map((i) => mod12(root + i)),
		spell: { tonicPc: root, scale: k.scale },
		name: keyNameStr(root, k.scale),
		notes: scaleNotesStr(root, k.scale),
	};
}

/** The 3rd and 5th a chord actually has — a sus chord's 4th stands in for its 3rd. */
export function chordTriad(intervals: number[]): { third: number; fifth: number } {
	const has = (x: number) => intervals.some((i) => mod12(i) === x);
	const third = has(4) ? 4 : has(3) ? 3 : has(5) ? 5 : has(2) ? 2 : 4;
	const fifth = has(7) ? 7 : has(6) ? 6 : has(8) ? 8 : 7;
	return { third, fifth };
}

/**
 * The guide for one chord of a progression. `a` is the chord's key-centre
 * analysis; without it (a chord the analysis skipped) the chord's own tones
 * are all there is to light.
 */
export function guideForChord(chord: Chord, a: AnalysedChord | undefined, fallback: DroneKey): DroneGuide {
	const ints = gI(chord);
	const root = mod12(chord.rootPc);
	const { third, fifth } = chordTriad(ints);
	const spellKey: DroneKey = a
		? { tonicPc: a.tonicPc, scale: a.mode === 'minor' ? 'aeolian' : 'ionian' }
		: fallback;
	const flat = prefFlat(spellKey.tonicPc, spellKey.scale);
	const rootName = spell(root, spellKey.tonicPc, spellKey.scale);
	const chordName = chord.name || rootName;
	const landmarks = gPcs(chord).map(mod12);

	if (!a) {
		const tones = [...new Set(ints.map(mod12))].sort((x, y) => x - y);
		return {
			root, third, fifth, pcs: landmarks, landmarks, spell: spellKey,
			name: chordName,
			notes: spellScale(root, tones, flat).join(' · '),
		};
	}
	const sc = chordScale(a, ints);
	return {
		root, third, fifth,
		pcs: sc.pcs,
		landmarks,
		spell: spellKey,
		name: `${chordName} · ${rootName} ${sc.name}`,
		notes: spellScale(root, sc.intervals, flat).join(' · '),
	};
}
