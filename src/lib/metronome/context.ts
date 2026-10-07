// The metronome's handle on the app's single shared AudioContext (see
// ../audioContext). The click scheduler, the drone and the microphone tempo
// detector all run on it, on the same clock as the studio's chords and drums.

import { sharedAudioContext } from '../audioContext';

export const getAudioContext = sharedAudioContext;

/**
 * Mobile browsers start the AudioContext in a "suspended" state and only allow
 * it to resume from inside a user gesture. Call this from a click/tap handler.
 */
export async function resumeAudio(): Promise<void> {
	const c = getAudioContext();
	if (c.state !== 'running') {
		await c.resume();
	}
}
