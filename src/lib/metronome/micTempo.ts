// Experimental microphone tempo detection. Listens to the mic, detects note
// onsets via spectral flux with an adaptive threshold, and estimates the tempo
// from the onset timing. Works best with a clear percussive source.

import { getAudioContext } from './context';
import { estimateBpmFromOnsets, type TempoEstimate } from './estimate';

export interface MicTempoOptions {
	sensitivity?: number; // threshold multiplier (lower = more sensitive)
	onTempo?: (e: TempoEstimate) => void;
	onLevel?: (level: number) => void; // 0..1, for a VU meter
	onOnset?: () => void;
}

export class MicTempoDetector {
	private ctx: AudioContext;
	private stream: MediaStream | null = null;
	private source: MediaStreamAudioSourceNode | null = null;
	private analyser: AnalyserNode | null = null;
	// Let the precise `Uint8Array<ArrayBuffer>` type be inferred so it satisfies
	// AnalyserNode.getByteFrequencyData under TypeScript's strict DOM typings.
	private spectrum = new Uint8Array(2048);
	private prev = new Float32Array(2048);
	private fluxHistory: number[] = [];
	private onsets: number[] = [];
	private lastOnset = 0;
	private raf: number | null = null;
	private sensitivity: number;
	private opts: MicTempoOptions;

	running = false;

	constructor(opts: MicTempoOptions = {}) {
		this.ctx = getAudioContext();
		this.opts = opts;
		this.sensitivity = opts.sensitivity ?? 2.2;
	}

	setSensitivity(s: number): void {
		this.sensitivity = s;
	}

	async start(): Promise<void> {
		if (this.running) return;
		this.stream = await navigator.mediaDevices.getUserMedia({
			audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
		});
		if (this.ctx.state !== 'running') await this.ctx.resume();

		this.source = this.ctx.createMediaStreamSource(this.stream);
		this.analyser = this.ctx.createAnalyser();
		this.analyser.fftSize = 2048;
		this.analyser.smoothingTimeConstant = 0;
		this.source.connect(this.analyser);

		const bins = this.analyser.frequencyBinCount;
		this.spectrum = new Uint8Array(bins);
		this.prev = new Float32Array(bins);
		this.fluxHistory = [];
		this.onsets = [];
		this.lastOnset = 0;
		this.running = true;
		this.loop();
	}

	stop(): void {
		this.running = false;
		if (this.raf != null) {
			cancelAnimationFrame(this.raf);
			this.raf = null;
		}
		this.source?.disconnect();
		this.analyser?.disconnect();
		this.stream?.getTracks().forEach((t) => t.stop());
		this.stream = null;
		this.source = null;
		this.analyser = null;
	}

	private loop = (): void => {
		if (!this.running || !this.analyser) return;
		this.analyser.getByteFrequencyData(this.spectrum);

		let flux = 0;
		let energy = 0;
		for (let i = 0; i < this.spectrum.length; i++) {
			const v = this.spectrum[i] / 255;
			energy += v;
			const d = v - this.prev[i];
			if (d > 0) flux += d;
			this.prev[i] = v;
		}
		energy /= this.spectrum.length;
		this.opts.onLevel?.(Math.min(1, energy * 3.5));

		this.fluxHistory.push(flux);
		if (this.fluxHistory.length > 43) this.fluxHistory.shift(); // ~0.7s @ 60fps
		const mean =
			this.fluxHistory.reduce((a, b) => a + b, 0) / Math.max(1, this.fluxHistory.length);
		const threshold = mean * this.sensitivity + 0.5;

		const now = this.ctx.currentTime;
		if (flux > threshold && now - this.lastOnset > 0.12) {
			this.lastOnset = now;
			this.onsets.push(now);
			if (this.onsets.length > 32) this.onsets.shift();
			this.opts.onOnset?.();
			const est = estimateBpmFromOnsets(this.onsets);
			if (est.bpm > 0) this.opts.onTempo?.(est);
		}

		this.raf = requestAnimationFrame(this.loop);
	};
}
