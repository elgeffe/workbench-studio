// Pure timing helpers — no Web Audio, no DOM. Unit-tested.

export const MIN_TEMPO = 20;
export const MAX_TEMPO = 400;

export function clampBpm(bpm: number, min = MIN_TEMPO, max = MAX_TEMPO): number {
	if (Number.isNaN(bpm)) return min;
	// ±Infinity naturally clamp to max/min via Math.min/Math.max below.
	return Math.min(max, Math.max(min, bpm));
}

/** Seconds between successive beats at a given tempo. */
export function secondsPerBeat(bpm: number): number {
	return 60 / clampBpm(bpm);
}

/** Convert an average tap interval (ms) into a rounded BPM. */
export function bpmFromTapIntervalMs(ms: number): number {
	if (ms <= 0) return 0;
	return Math.round(60000 / ms);
}

/** Format a number of seconds as m:ss (or h:mm:ss past an hour). */
export function formatDuration(totalSeconds: number): string {
	const s = Math.max(0, Math.floor(totalSeconds));
	const hours = Math.floor(s / 3600);
	const minutes = Math.floor((s % 3600) / 60);
	const seconds = s % 60;
	const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
	const ss = String(seconds).padStart(2, '0');
	return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
