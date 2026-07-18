// The metronome engine. It uses the "A Tale of Two Clocks" pattern:
//   - a low-resolution setTimeout loop wakes periodically and schedules the
//     next slice of beats slightly ahead of time, directly on the audio clock
//     (sample-accurate, jitter-free even when the main thread is busy);
//   - a requestAnimationFrame "draw" loop fires UI callbacks at the moment each
//     scheduled beat is actually heard.
//
// This module is framework-free so it can be unit-reasoned about and reused.

import { getAudioContext } from './context';
import { playClick, VOICES } from './click';
import { clampBpm, secondsPerBeat } from './timing';

export interface BeatContext {
	/** absolute bar index since playback started (0-based) */
	bar: number;
	/** beat index within the current bar (0-based) */
	beatInBar: number;
	beatsPerBar: number;
	/** total beats scheduled since start (0-based index of this beat) */
	elapsedBeats: number;
	/** musical seconds elapsed since the first beat, at this beat */
	elapsedSeconds: number;
	/** the user-set base tempo */
	baseBpm: number;
}

export interface BeatInfo extends BeatContext {
	/** tempo actually used for this beat (after automation) */
	bpm: number;
	/** true on the downbeat (beat 0) when accents are enabled */
	accent: boolean;
	/** true when this beat is silenced (gap-click trainer) */
	muted: boolean;
	/** AudioContext time at which the beat sounds */
	time: number;
}

export type TempoFn = (ctx: BeatContext) => number;
export type MuteFn = (ctx: BeatContext) => boolean;

export interface MetronomeHooks {
	tempo?: TempoFn;
	mute?: MuteFn;
}

export interface MetronomeConfig {
	bpm: number;
	beatsPerBar: number;
	beatUnit: number;
	accentFirst: boolean;
	subdivision: number; // clicks per beat (1 = none)
	volume: number; // 0..1
}

const LOOKAHEAD_MS = 25; // how often the scheduler wakes
const SCHEDULE_AHEAD_S = 0.12; // how far ahead audio is scheduled

export class MetronomeEngine {
	private ctx: AudioContext | null = null;
	private master: GainNode | null = null;
	private timer: ReturnType<typeof setTimeout> | null = null;
	private rafId: number | null = null;

	private cfg: MetronomeConfig = {
		bpm: 120,
		beatsPerBar: 4,
		beatUnit: 4,
		accentFirst: true,
		subdivision: 1,
		volume: 0.9
	};
	private hooks: MetronomeHooks = {};

	private nextBeatTime = 0;
	private elapsedBeats = 0;
	private elapsedSeconds = 0;
	private startTime = 0;
	private queue: BeatInfo[] = [];
	private _playing = false;

	onBeat: (info: BeatInfo) => void = () => {};
	onBar: (info: BeatInfo) => void = () => {};

	get playing(): boolean {
		return this._playing;
	}

	setConfig(patch: Partial<MetronomeConfig>): void {
		this.cfg = { ...this.cfg, ...patch };
		if (this.master && this.ctx && patch.volume != null) {
			this.master.gain.setTargetAtTime(this.cfg.volume, this.ctx.currentTime, 0.02);
		}
	}

	getConfig(): MetronomeConfig {
		return { ...this.cfg };
	}

	setHooks(hooks: MetronomeHooks): void {
		this.hooks = hooks ?? {};
	}

	/** Wall-clock seconds elapsed since the first beat, from the audio clock. */
	getElapsedSeconds(): number {
		if (!this.ctx || !this._playing) return 0;
		return Math.max(0, this.ctx.currentTime - this.startTime);
	}

	async start(): Promise<void> {
		if (this._playing) return;
		this.ctx = getAudioContext();
		if (this.ctx.state !== 'running') await this.ctx.resume();
		if (!this.master) {
			this.master = this.ctx.createGain();
			this.master.connect(this.ctx.destination);
		}
		this.master.gain.value = this.cfg.volume;

		this.elapsedBeats = 0;
		this.elapsedSeconds = 0;
		this.queue = [];
		this.nextBeatTime = this.ctx.currentTime + 0.08;
		this.startTime = this.nextBeatTime;
		this._playing = true;
		this.scheduleLoop();
		this.drawLoop();
	}

	stop(): void {
		if (!this._playing) return;
		this._playing = false;
		if (this.timer != null) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (this.rafId != null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
		this.queue = [];
	}

	private computeBeat(): BeatInfo {
		// `|| 1` guards against an empty/NaN input clearing the time signature.
		const beatsPerBar = Math.max(1, Math.floor(this.cfg.beatsPerBar) || 1);
		const beatInBar = this.elapsedBeats % beatsPerBar;
		const bar = Math.floor(this.elapsedBeats / beatsPerBar);
		const beatCtx: BeatContext = {
			bar,
			beatInBar,
			beatsPerBar,
			elapsedBeats: this.elapsedBeats,
			elapsedSeconds: this.elapsedSeconds,
			baseBpm: this.cfg.bpm
		};
		const bpm = clampBpm(this.hooks.tempo ? this.hooks.tempo(beatCtx) : this.cfg.bpm);
		const muted = this.hooks.mute ? !!this.hooks.mute(beatCtx) : false;
		const accent = this.cfg.accentFirst && beatInBar === 0;
		return { ...beatCtx, bpm, accent, muted, time: this.nextBeatTime };
	}

	private scheduleLoop = (): void => {
		if (!this._playing || !this.ctx || !this.master) return;
		while (this.nextBeatTime < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
			const info = this.computeBeat();
			if (!info.muted) {
				const voice = info.accent ? VOICES.accent : VOICES.beat;
				playClick(this.ctx, this.master, info.time, voice);
				// optional subdivisions between this beat and the next
				const sub = Math.max(1, Math.floor(this.cfg.subdivision) || 1);
				if (sub > 1) {
					const step = secondsPerBeat(info.bpm) / sub;
					for (let s = 1; s < sub; s++) {
						playClick(this.ctx, this.master, info.time + step * s, VOICES.sub);
					}
				}
			}
			this.queue.push(info);
			const spb = secondsPerBeat(info.bpm);
			this.nextBeatTime += spb;
			this.elapsedSeconds += spb;
			this.elapsedBeats += 1;
		}
		this.timer = setTimeout(this.scheduleLoop, LOOKAHEAD_MS);
	};

	private drawLoop = (): void => {
		if (!this._playing || !this.ctx) return;
		const now = this.ctx.currentTime;
		while (this.queue.length && this.queue[0].time <= now) {
			const info = this.queue.shift()!;
			this.onBeat(info);
			if (info.beatInBar === 0) this.onBar(info);
			if (!this._playing) return; // a callback may have stopped us
		}
		if (this._playing) this.rafId = requestAnimationFrame(this.drawLoop);
	};
}
