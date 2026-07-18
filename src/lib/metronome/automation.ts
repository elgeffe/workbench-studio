// Tempo & mute automation strategies. Every function here is pure so the
// behaviour can be unit-tested without any audio hardware. They produce the
// `tempo` / `mute` hooks consumed by the metronome engine.

import type { BeatContext, MuteFn, TempoFn } from './engine';

export type StepMode = 'clamp' | 'loop' | 'bounce';

export interface StepConfig {
	startBpm: number;
	step: number; // bpm added each interval (may be negative)
	everyBars: number; // interval length, in bars
	minBpm: number;
	maxBpm: number;
	mode: StepMode;
}

/** Tempo for the step trainer at a given (absolute) bar index. */
export function stepBpmAt(bar: number, cfg: StepConfig): number {
	const everyBars = Math.max(1, Math.floor(cfg.everyBars));
	const steps = Math.floor(Math.max(0, bar) / everyBars);
	const raw = cfg.startBpm + steps * cfg.step;
	const lo = Math.min(cfg.minBpm, cfg.maxBpm);
	const hi = Math.max(cfg.minBpm, cfg.maxBpm);
	const range = hi - lo;

	if (range <= 0) return lo;

	switch (cfg.mode) {
		case 'loop': {
			// wrap back to the bottom once past the top
			let pos = (raw - lo) % range;
			if (pos < 0) pos += range;
			return lo + pos;
		}
		case 'bounce': {
			// ping-pong between lo and hi
			const span = range * 2;
			let pos = (raw - lo) % span;
			if (pos < 0) pos += span;
			return lo + (pos <= range ? pos : span - pos);
		}
		case 'clamp':
		default:
			return Math.min(hi, Math.max(lo, raw));
	}
}

export function stepTempo(cfg: StepConfig): TempoFn {
	return ({ bar }: BeatContext) => stepBpmAt(bar, cfg);
}

/** Linear interpolation. */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp01(t: number): number {
	return Math.min(1, Math.max(0, t));
}

export interface RampConfig {
	startBpm: number;
	endBpm: number;
}

/** Smoothly glide tempo from start to end over a duration in (musical) seconds. */
export function rampTempoByTime(cfg: RampConfig & { seconds: number }): TempoFn {
	const dur = Math.max(0.001, cfg.seconds);
	return ({ elapsedSeconds }: BeatContext) =>
		lerp(cfg.startBpm, cfg.endBpm, clamp01(elapsedSeconds / dur));
}

/** Smoothly glide tempo from start to end over a number of bars. */
export function rampTempoByBars(cfg: RampConfig & { bars: number }): TempoFn {
	const bars = Math.max(0.001, cfg.bars);
	return ({ bar, beatInBar, beatsPerBar }: BeatContext) => {
		const progressed = bar + beatInBar / Math.max(1, beatsPerBar);
		return lerp(cfg.startBpm, cfg.endBpm, clamp01(progressed / bars));
	};
}

export type GapMode = 'cycle' | 'random';

export interface GapConfig {
	mode: GapMode;
	playBars: number; // cycle mode: audible bars
	muteBars: number; // cycle mode: silent bars
	probability: number; // random mode: chance a given bar is muted (0..1)
	seed?: number;
}

/** Deterministic [0,1) hash of an integer — stable per bar, order-independent. */
export function hashUnit(n: number, seed = 1): number {
	let h = (Math.floor(n) ^ Math.floor(seed)) >>> 0;
	h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
	h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
	h ^= h >>> 16;
	return (h >>> 0) / 4294967296;
}

/** Whether a given (absolute) bar is silenced under the gap-click trainer. */
export function gapMutedAt(bar: number, cfg: GapConfig): boolean {
	if (cfg.mode === 'random') {
		return hashUnit(bar, cfg.seed ?? 1) < clamp01(cfg.probability);
	}
	const play = Math.max(0, Math.floor(cfg.playBars));
	const mute = Math.max(0, Math.floor(cfg.muteBars));
	const period = play + mute;
	if (period <= 0 || mute === 0) return false;
	return bar % period >= play;
}

export function gapMute(cfg: GapConfig): MuteFn {
	return ({ bar }: BeatContext) => gapMutedAt(bar, cfg);
}
