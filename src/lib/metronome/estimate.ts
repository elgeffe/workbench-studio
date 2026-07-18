// Pure tempo-estimation maths. Given a series of onset timestamps (seconds),
// estimate the most likely tempo in BPM. No audio/DOM here so it is testable.

export const MIN_BPM = 40;
export const MAX_BPM = 220;

export interface TempoEstimate {
	bpm: number;
	confidence: number; // 0..1
}

/** Fold a BPM into a sensible range by octave (×2 / ÷2) shifting. */
export function foldToBpmRange(bpm: number, min = MIN_BPM, max = MAX_BPM): number {
	if (!Number.isFinite(bpm) || bpm <= 0) return 0;
	let b = bpm;
	let guard = 0;
	while (b < min && guard++ < 16) b *= 2;
	while (b > max && guard++ < 16) b /= 2;
	return b;
}

export function intervalToBpm(intervalSeconds: number): number {
	if (intervalSeconds <= 0) return 0;
	return 60 / intervalSeconds;
}

/**
 * Estimate tempo from onset times. Builds inter-onset intervals, folds them to
 * a plausible BPM range, then finds the densest cluster (with a ±2 BPM window).
 * Confidence reflects how much of the data agrees with the winning cluster.
 */
export function estimateBpmFromOnsets(
	onsets: number[],
	min = MIN_BPM,
	max = MAX_BPM
): TempoEstimate {
	if (onsets.length < 4) return { bpm: 0, confidence: 0 };

	const iois: number[] = [];
	for (let i = 1; i < onsets.length; i++) {
		const d = onsets[i] - onsets[i - 1];
		if (d > 0.05 && d < 3) iois.push(d); // ignore double-triggers and long gaps
	}
	if (iois.length < 3) return { bpm: 0, confidence: 0 };

	const bpms = iois.map((d) => foldToBpmRange(intervalToBpm(d), min, max)).filter((b) => b > 0);
	if (bpms.length === 0) return { bpm: 0, confidence: 0 };

	const counts = new Map<number, number>();
	for (const b of bpms) {
		const k = Math.round(b);
		counts.set(k, (counts.get(k) ?? 0) + 1);
	}

	let bestBpm = 0;
	let bestScore = 0;
	for (const k of counts.keys()) {
		let score = 0;
		let weighted = 0;
		for (let j = k - 2; j <= k + 2; j++) {
			const c = counts.get(j) ?? 0;
			score += c;
			weighted += c * j;
		}
		if (score > bestScore) {
			bestScore = score;
			bestBpm = weighted / Math.max(1, score);
		}
	}

	return { bpm: bestBpm, confidence: Math.min(1, bestScore / bpms.length) };
}
