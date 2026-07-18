// The metronome "brain": a Svelte 5 runes store that owns the reactive UI
// state and wires together the metronome engine, automation strategies, the
// microphone tempo detector, and practice-session tracking + persistence.
// Ported from the standalone Metrognome app; here it lives as a sub-store of
// the WorkbenchStore (`store.met`) behind the Metronome tab.

import { MetronomeEngine, type BeatInfo, type MetronomeHooks } from './engine';
import { resumeAudio } from './context';
import { bpmFromTapIntervalMs, clampBpm, formatDuration } from './timing';
import {
  gapMute,
  rampTempoByBars,
  rampTempoByTime,
  stepTempo,
  type StepMode,
  type GapMode,
} from './automation';
import { MicTempoDetector } from './micTempo';
import { addSession, aggregate, clearSessions, deleteSession, loadSessions } from './history';
import type { GoalType, PracticeGoal, PracticeSession } from './types';

export type AutomationMode = 'off' | 'step' | 'ramp-time' | 'ramp-bars';

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export class MetronomeStore {
  // ---- transport / config ----
  bpm = $state(120);
  beatsPerBar = $state(4);
  beatUnit = $state(4);
  accentFirst = $state(true);
  subdivision = $state(1);
  volume = $state(0.9);
  isPlaying = $state(false);

  // ---- live beat readout ----
  currentBeat = $state(-1); // beatInBar of last fired beat
  currentBarIndex = $state(0); // absolute bar index
  beatTick = $state(0); // increments every beat (drives animation)
  liveBpm = $state(120); // tempo actually playing right now

  // ---- session counters ----
  sessionBars = $state(0); // completed bars
  sessionSeconds = $state(0); // elapsed seconds (smooth)
  goalJustReached = $state(false);

  // ---- practice goal ----
  goalType = $state<GoalType>('none');
  goalBars = $state(32);
  goalMinutes = $state(5);

  // ---- automation ----
  automationMode = $state<AutomationMode>('off');
  stepStartBpm = $state(80);
  stepAmount = $state(5);
  stepEveryBars = $state(4);
  stepMinBpm = $state(60);
  stepMaxBpm = $state(160);
  stepMode = $state<StepMode>('clamp');
  rampStartBpm = $state(80);
  rampEndBpm = $state(140);
  rampSeconds = $state(120);
  rampBars = $state(32);

  gapEnabled = $state(false);
  gapMode = $state<GapMode>('cycle');
  gapPlayBars = $state(2);
  gapMuteBars = $state(2);
  gapProbability = $state(0.3);

  // ---- microphone ----
  micActive = $state(false);
  micFollow = $state(true);
  micLevel = $state(0);
  micDetectedBpm = $state(0);
  micConfidence = $state(0);
  micError = $state<string | null>(null);

  // ---- history ----
  sessions = $state<PracticeSession[]>([]);

  // ---- non-reactive internals ----
  private engine: MetronomeEngine | null = null;
  private mic: MicTempoDetector | null = null;
  private clockRaf: number | null = null;
  private taps: number[] = [];
  private initialised = false;
  private cleanup: (() => void) | null = null;

  private sessionStartEpoch = 0;
  private sessionStartBpm = 120;
  private sessionMinBpm = Infinity;
  private sessionMaxBpm = 0;

  /** Call once on the client (e.g. when the tab first mounts). Idempotent. */
  init(): void {
    if (this.initialised || typeof window === 'undefined') return;
    this.initialised = true;
    this.sessions = loadSessions();

    this.engine = new MetronomeEngine();
    this.engine.onBeat = (info) => this.handleBeat(info);
    this.engine.onBar = (info) => this.handleBar(info);

    // Reactively push config + automation hooks into the engine whenever any
    // relevant setting changes. Reading the fields inside pushConfig() makes
    // the effect track exactly those dependencies.
    this.cleanup = $effect.root(() => {
      $effect(() => {
        this.pushConfig();
      });
    });
  }

  destroy(): void {
    this.stop({ save: false });
    this.stopMic();
    this.cleanup?.();
    this.cleanup = null;
    this.initialised = false;
  }

  // ----- engine wiring -----

  private buildHooks(): MetronomeHooks {
    const hooks: MetronomeHooks = {};
    const micDriving = this.micActive && this.micFollow;

    if (!micDriving) {
      switch (this.automationMode) {
        case 'step':
          hooks.tempo = stepTempo({
            startBpm: this.stepStartBpm,
            step: this.stepAmount,
            everyBars: this.stepEveryBars,
            minBpm: this.stepMinBpm,
            maxBpm: this.stepMaxBpm,
            mode: this.stepMode,
          });
          break;
        case 'ramp-time':
          hooks.tempo = rampTempoByTime({
            startBpm: this.rampStartBpm,
            endBpm: this.rampEndBpm,
            seconds: this.rampSeconds,
          });
          break;
        case 'ramp-bars':
          hooks.tempo = rampTempoByBars({
            startBpm: this.rampStartBpm,
            endBpm: this.rampEndBpm,
            bars: this.rampBars,
          });
          break;
      }
    }

    if (this.gapEnabled) {
      hooks.mute = gapMute({
        mode: this.gapMode,
        playBars: this.gapPlayBars,
        muteBars: this.gapMuteBars,
        probability: this.gapProbability,
      });
    }

    return hooks;
  }

  private pushConfig(): void {
    if (!this.engine) return;
    this.engine.setConfig({
      bpm: this.bpm,
      beatsPerBar: this.beatsPerBar,
      beatUnit: this.beatUnit,
      accentFirst: this.accentFirst,
      subdivision: this.subdivision,
      volume: this.volume,
    });
    this.engine.setHooks(this.buildHooks());
  }

  private handleBeat(info: BeatInfo): void {
    this.currentBeat = info.beatInBar;
    this.currentBarIndex = info.bar;
    this.liveBpm = Math.round(info.bpm);
    this.beatTick++;
    if (info.bpm < this.sessionMinBpm) this.sessionMinBpm = info.bpm;
    if (info.bpm > this.sessionMaxBpm) this.sessionMaxBpm = info.bpm;
  }

  private handleBar(info: BeatInfo): void {
    // At the downbeat of absolute bar N, exactly N bars have been completed.
    this.sessionBars = info.bar;
    if (this.goalType === 'bars' && info.bar >= this.goalBars && this.isPlaying) {
      this.finishByGoal();
    }
  }

  // ----- transport -----

  async start(): Promise<void> {
    this.init();
    if (!this.engine) return;
    await resumeAudio();

    this.sessionBars = 0;
    this.sessionSeconds = 0;
    this.currentBeat = -1;
    this.currentBarIndex = 0;
    this.goalJustReached = false;
    this.sessionStartEpoch = Date.now();
    this.sessionStartBpm = this.startingBpm();
    this.sessionMinBpm = Infinity;
    this.sessionMaxBpm = 0;

    this.pushConfig();
    await this.engine.start();
    this.isPlaying = true;
    this.runClock();
  }

  stop(opts: { save?: boolean; goalReached?: boolean } = {}): void {
    if (!this.engine) return;
    const wasPlaying = this.isPlaying;
    this.engine.stop();
    this.isPlaying = false;
    this.currentBeat = -1;
    if (this.clockRaf != null) {
      cancelAnimationFrame(this.clockRaf);
      this.clockRaf = null;
    }
    if (wasPlaying && (opts.save ?? true) && this.sessionSeconds >= 1) {
      this.recordSession(opts.goalReached ?? false);
    }
  }

  toggle(): void {
    if (this.isPlaying) this.stop();
    else void this.start();
  }

  private finishByGoal(): void {
    this.stop({ save: true, goalReached: true });
    this.goalJustReached = true;
  }

  private runClock = (): void => {
    if (!this.isPlaying || !this.engine) return;
    this.sessionSeconds = this.engine.getElapsedSeconds();
    if (this.goalType === 'time' && this.sessionSeconds >= this.goalMinutes * 60) {
      this.finishByGoal();
      return;
    }
    this.clockRaf = requestAnimationFrame(this.runClock);
  };

  // ----- tempo controls -----

  setBpm(bpm: number): void {
    this.bpm = Math.round(clampBpm(bpm));
  }

  nudgeBpm(delta: number): void {
    this.setBpm(this.bpm + delta);
  }

  tap(): void {
    const now = performance.now();
    const last = this.taps[this.taps.length - 1];
    if (last != null && now - last > 2000) this.taps = [];
    this.taps.push(now);
    if (this.taps.length > 6) this.taps.shift();
    if (this.taps.length >= 2) {
      let sum = 0;
      for (let i = 1; i < this.taps.length; i++) sum += this.taps[i] - this.taps[i - 1];
      const bpm = bpmFromTapIntervalMs(sum / (this.taps.length - 1));
      if (bpm >= 20 && bpm <= 400) this.setBpm(bpm);
    }
  }

  // ----- microphone -----

  async toggleMic(): Promise<void> {
    if (this.micActive) {
      this.stopMic();
      return;
    }
    this.init();
    try {
      this.micError = null;
      if (!this.mic) {
        this.mic = new MicTempoDetector({
          onLevel: (l) => (this.micLevel = l),
          onTempo: (e) => {
            this.micDetectedBpm = Math.round(e.bpm);
            this.micConfidence = e.confidence;
            if (this.micFollow && e.confidence > 0.35) {
              // ease towards the detected tempo to avoid jitter
              this.setBpm(this.bpm * 0.6 + e.bpm * 0.4);
            }
          },
        });
      }
      await this.mic.start();
      this.micActive = true;
    } catch (err) {
      this.micError =
        err instanceof Error ? err.message : 'Microphone unavailable or permission denied.';
      this.micActive = false;
    }
  }

  stopMic(): void {
    this.mic?.stop();
    this.micActive = false;
    this.micLevel = 0;
  }

  adoptMicTempo(): void {
    if (this.micDetectedBpm > 0) this.setBpm(this.micDetectedBpm);
  }

  // ----- history -----

  private recordSession(goalReached: boolean): void {
    const session: PracticeSession = {
      id: uid(),
      startedAt: this.sessionStartEpoch,
      endedAt: Date.now(),
      durationSeconds: Math.round(this.sessionSeconds),
      bars: this.sessionBars,
      startBpm: Math.round(this.sessionStartBpm),
      endBpm: this.liveBpm,
      minBpm: Math.round(Number.isFinite(this.sessionMinBpm) ? this.sessionMinBpm : this.bpm),
      maxBpm: Math.round(this.sessionMaxBpm || this.bpm),
      timeSignature: `${this.beatsPerBar}/${this.beatUnit}`,
      goal: this.currentGoal(),
      goalReached,
      automation: this.automationLabel(),
    };
    this.sessions = addSession(session);
  }

  removeSession(id: string): void {
    this.sessions = deleteSession(id);
  }

  clearHistory(): void {
    this.sessions = clearSessions();
  }

  // ----- derived helpers (reactive when read in templates) -----

  private startingBpm(): number {
    if (this.micActive && this.micFollow) return this.bpm;
    switch (this.automationMode) {
      case 'step':
        return this.stepStartBpm;
      case 'ramp-time':
      case 'ramp-bars':
        return this.rampStartBpm;
      default:
        return this.bpm;
    }
  }

  currentGoal(): PracticeGoal {
    if (this.goalType === 'bars') return { type: 'bars', bars: this.goalBars };
    if (this.goalType === 'time') return { type: 'time', seconds: this.goalMinutes * 60 };
    return { type: 'none' };
  }

  get goalProgress(): number {
    if (this.goalType === 'bars') return Math.min(1, this.sessionBars / Math.max(1, this.goalBars));
    if (this.goalType === 'time')
      return Math.min(1, this.sessionSeconds / Math.max(1, this.goalMinutes * 60));
    return 0;
  }

  get elapsedLabel(): string {
    return formatDuration(this.sessionSeconds);
  }

  get goalRemainingLabel(): string {
    if (this.goalType === 'bars') {
      return `${Math.max(0, this.goalBars - this.sessionBars)} bars left`;
    }
    if (this.goalType === 'time') {
      return `${formatDuration(Math.max(0, this.goalMinutes * 60 - this.sessionSeconds))} left`;
    }
    return 'No goal — open practice';
  }

  automationLabel(): string {
    const parts: string[] = [];
    switch (this.automationMode) {
      case 'step':
        parts.push(
          `Step ${this.stepAmount >= 0 ? '+' : ''}${this.stepAmount}bpm / ${this.stepEveryBars} bars`,
        );
        break;
      case 'ramp-time':
        parts.push(
          `Ramp ${this.rampStartBpm}→${this.rampEndBpm} over ${formatDuration(this.rampSeconds)}`,
        );
        break;
      case 'ramp-bars':
        parts.push(`Ramp ${this.rampStartBpm}→${this.rampEndBpm} over ${this.rampBars} bars`);
        break;
      default:
        parts.push('Manual');
    }
    if (this.gapEnabled) parts.push('gap-click');
    if (this.micActive && this.micFollow) parts.push('mic-follow');
    return parts.join(' · ');
  }

  get stats() {
    return aggregate(this.sessions);
  }
}
