// A short synthesized "click" — no audio samples to download, perfectly tunable,
// and sample-accurate because it is scheduled directly on the audio clock.

export interface ClickVoice {
	/** oscillator frequency in Hz */
	freq: number;
	/** peak gain 0..1 */
	peak: number;
	/** decay time in seconds */
	decay: number;
	type: OscillatorType;
}

export const VOICES: Record<'accent' | 'beat' | 'sub', ClickVoice> = {
	accent: { freq: 1600, peak: 1.0, decay: 0.05, type: 'triangle' },
	beat: { freq: 1000, peak: 0.6, decay: 0.045, type: 'triangle' },
	sub: { freq: 760, peak: 0.35, decay: 0.04, type: 'triangle' }
};

/**
 * Schedule a single click at an exact AudioContext time.
 * A fast attack and short exponential decay give a clean woodblock-like tick,
 * and a slight downward pitch chirp adds a percussive transient.
 */
export function playClick(
	ctx: AudioContext,
	dest: AudioNode,
	time: number,
	voice: ClickVoice
): void {
	const osc = ctx.createOscillator();
	const env = ctx.createGain();

	osc.type = voice.type;
	osc.frequency.setValueAtTime(voice.freq, time);
	osc.frequency.exponentialRampToValueAtTime(Math.max(60, voice.freq * 0.6), time + voice.decay);

	env.gain.setValueAtTime(0.0001, time);
	env.gain.exponentialRampToValueAtTime(voice.peak, time + 0.001);
	env.gain.exponentialRampToValueAtTime(0.0001, time + voice.decay);

	osc.connect(env).connect(dest);
	osc.start(time);
	osc.stop(time + voice.decay + 0.02);
}
