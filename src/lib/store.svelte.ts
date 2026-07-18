// Central application store. Svelte 5 runes class: `$state` fields hold the
// app state, methods are the actions. The render step lives in `lib/view/`:
// a single `$derived` view-model (`view = computeView(this)`) that components
// read as `store.view.*` — no handler closures leak out of the store.

import { INT, SUF, MAJOR, CIRCLE, SCALES, type Chord, type ScaleId } from './engine/constants';
import { mod12, spell, cname, gI, gMidis, chordMidis, diatonicList, jChVoiced } from './engine/theory';
import { patternDefs, type ChordDef } from './engine/data';
import { type Diagram } from './engine/fretpatterns';
import { genEarTarget, type EarLevel, type EarTarget } from './engine/ear';
import {
  genReadTarget, type ReadLevel, type ReadClefSetting, type ReadRange, type ReadKeyMode,
  type ReadAnswerMode, type ReadTarget,
} from './engine/reading';
import {
  BASS_GROUPS, BASS_PATTERNS, BASS_TRICKS,
  bassRootMidi, resolveBassStep, type BassStep, type DegTok,
} from './engine/bass';
import {
  DRUM_VOICES, RHYTHM_CONCEPTS,
  drumTemplates, composeGrid, swingDelaySteps,
  type DrumVoiceId, type DrumGrid, type DrumLayerPart,
} from './engine/drums';
import { AudioEngine } from './audio';
import { MetronomeStore } from './metronome/store.svelte';
import { computeView } from './view';
import type { Wedge } from './view/types';

export type Mode = 'circle' | 'workshop' | 'drums' | 'metronome' | 'ear' | 'reading' | 'patterns' | 'jazz';
export type LearnTab = 'harmony' | 'rhythm' | 'bass' | 'form';
export type WsStyle = 'classic' | 'jazz' | 'classical' | 'bass';

// Re-exported so components can keep importing view-model types from here.
export type {
  Chip, DiatonicView, ChordChip, PaletteChip, Wedge, FretCell, FretRow, PianoKey,
} from './view/types';
export type { WorkbenchView } from './view';

export class WorkbenchStore {
  // ---- reactive state ----
  tonicPc = $state(0);
  ext = $state('triad');
  scale = $state<ScaleId>('ionian');
  mode = $state<Mode>('circle');
  soundOn = $state(true);
  activeChord = $state<Chord | null>(null);
  // One tempo for the whole app: the drum groove and the chord progression
  // share a single transport clock, so there is only one BPM.
  tempo = $state(104);

  earLevel = $state<EarLevel>('interval');
  earTarget = $state<EarTarget | null>(null);
  earRevealed = $state(false);
  earPicked = $state<string | null>(null);
  earScore = $state(0);
  earTotal = $state(0);
  earStreak = $state(0);
  earMsg = $state('');

  // ---- sight reading ----
  rdLevel = $state<ReadLevel>('note');
  rdClef = $state<ReadClefSetting>('treble');
  rdRange = $state<ReadRange>('staff');
  rdKeyMode = $state<ReadKeyMode>('c');
  rdAccOn = $state(false);
  rdAnswerMode = $state<ReadAnswerMode>('name');
  rdTarget = $state<ReadTarget | null>(null);
  rdRevealed = $state(false);
  rdPicked = $state<string | null>(null);
  // Play-it answering: the distinct pitch classes found so far on the instruments.
  rdHits = $state<number[]>([]);
  rdScore = $state(0);
  rdTotal = $state(0);
  rdStreak = $state(0);
  rdMsg = $state('');

  wsGenre = $state(0);
  bassGroup = $state(BASS_GROUPS[0]);
  bassPatId = $state<string | null>('discopump');
  // The user's hand-built groove: 16 cells (one 16th each), null = a rest. Its
  // id in the pattern list is the special 'custom'. Step lengths are computed
  // (each note sustains to the next), so a cell only holds its degree or ghost.
  bassCustom = $state<Array<{ d?: DegTok; g?: boolean } | null>>(Array(16).fill(null));
  // Bass-style mix: mute either half of the groove to study the other.
  bassChordsOn = $state(true);
  bassOn = $state(true);
  patCat = $state('Scales');
  patId = $state('major');
  jazzCh = $state(0);
  wsStyle = $state<WsStyle>('classic');
  fingerOn = $state(true);
  jzInv = $state(0);

  jzChanges = $state<Chord[]>([]);
  jzSel = $state(-1);
  jzVoicing = $state<'full' | 'shell'>('full');
  jzPlaying = $state(false);
  jzStep = $state(-1);

  // ---- drums groovebox ----
  // The grid is materialised state (not derived) so the user can edit any
  // cell; picking a template or a layer count re-composes it from the source.
  drTplId = $state('rock');
  drLayerN = $state(drumTemplates()[0].layers.length);
  drGrid = $state<DrumGrid>(composeGrid(drumTemplates()[0], drumTemplates()[0].layers.length));
  drMuted = $state<DrumVoiceId[]>([]);
  drPlaying = $state(false);
  drStep = $state(-1);
  drSwing = $state(50);

  learnTab = $state<LearnTab>('harmony');

  dockOpen = $state(false);
  circleView = $state<'maj' | 'min'>('maj');
  circleDir = $state<'fifths' | 'fourths'>('fifths');

  isDesktop = $state(false);

  // ---- practice metronome (its own engine + runes sub-store) ----
  // The click runs on its own AudioContext and keeps ticking when you browse
  // other tabs — practice against it anywhere in the studio.
  met = new MetronomeStore();

  // ---- derived view-model (pure render step, lives in lib/view) ----
  view = $derived.by(() => computeView(this));

  // ---- non-reactive ----
  private audio = new AudioEngine();
  // The global transport: ONE interval, ticking every half bar (2 beats),
  // drives both the drum groove (bar ticks) and the chord loop (half-bar
  // slots, or bar slots in bass style) so the two stay locked as one band.
  private trLoop: ReturnType<typeof setInterval> | null = null;
  private trHalf = 0; // half-bar counter since transport start
  private jIdx = 0; // next progression index the live loop will play
  private seqTimers: ReturnType<typeof setTimeout>[] = [];
  private singleTimers: ReturnType<typeof setTimeout>[] = [];
  private bassTimers: ReturnType<typeof setTimeout>[] = [];
  private drTimers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    // Prepare an ear-training target so the tab isn't empty, but stay silent:
    // playing here would queue notes on the not-yet-resumed AudioContext and
    // fire them on the user's first gesture, doubling their first chord.
    this.genEar('interval', false);
    this.genReading();
  }

  destroy(): void {
    this.met.destroy();
    if (this.trLoop) clearInterval(this.trLoop);
    this.seqTimers.forEach((id) => clearTimeout(id));
    this.singleTimers.forEach((id) => clearTimeout(id));
    this.bassTimers.forEach((id) => clearTimeout(id));
    this.drTimers.forEach((id) => clearTimeout(id));
  }

  // ---- audio wrappers (respect the mute toggle) ----
  private playMidis(midis: number[], dur?: number, stagger?: number): void {
    if (!this.soundOn) return;
    this.audio.playMidis(midis, dur ?? 1.2, stagger ?? 0);
  }
  playChord(ch: Chord | null, stagger = 0.018): void {
    if (!ch) return;
    this.playMidis(gMidis(ch), 1.3, stagger);
  }

  // ---- key navigation ----
  stepKey(d: number): void {
    const ci = CIRCLE.indexOf(this.tonicPc);
    const ni = mod12(ci + d);
    this.tonicPc = CIRCLE[ni];
  }
  setTonic(pc: number, scale?: ScaleId): void {
    this.tonicPc = pc;
    if (scale) this.scale = scale;
  }
  // Direct key pick from the top strip — keep the current scale flavour, just
  // move the tonic (so "C" + "harmonic minor" stays harmonic when you retune).
  setTonicKey(pc: number): void { this.tonicPc = pc; }

  toggleSound(): void { this.soundOn = !this.soundOn; }
  // Choosing a scale also swings the circle to the matching tonality so the
  // wheel and the diatonic harmonisation always agree (minor scales → min view).
  setScale(id: ScaleId): void {
    this.scale = id;
    this.circleView = SCALES[id].int.includes(3) ? 'min' : 'maj';
  }
  setExt(id: string): void { this.ext = id; }
  setMode(m: Mode): void { this.mode = m; }
  setDock(open: boolean): void { this.dockOpen = open; }
  toggleDock(): void { this.dockOpen = !this.dockOpen; }
  setCircleView(v: 'maj' | 'min'): void {
    this.circleView = v;
    if (v === 'maj') { if (SCALES[this.scale].int.includes(3)) this.scale = 'ionian'; }
    else if (!SCALES[this.scale].int.includes(3)) this.scale = 'aeolian';
  }
  setCircleDir(d: 'fifths' | 'fourths'): void { this.circleDir = d; }
  wedgeClick(w: Wedge): void {
    const minorFamily: ScaleId[] = ['aeolian', 'dorian', 'phrygian', 'locrian', 'harmonic', 'melodic'];
    const majorFamily: ScaleId[] = ['ionian', 'lydian', 'mixolydian'];
    this.tonicPc = w.pc;
    if (w.ring === 'min') {
      this.scale = minorFamily.includes(this.scale) ? this.scale : 'aeolian';
      this.circleView = 'min';
    } else {
      this.scale = majorFamily.includes(this.scale) ? this.scale : 'ionian';
      this.circleView = 'maj';
    }
  }
  setWsGenre(i: number): void { this.wsGenre = i; }
  setWsStyle(s: WsStyle): void {
    this.wsStyle = s;
    // No retiming needed: the transport ticks every half bar regardless of
    // style — bass style simply advances chords on bar ticks only.
  }
  setBassGroup(g: string): void { this.bassGroup = g; }
  toggleBassChords(): void { this.bassChordsOn = !this.bassChordsOn; }
  toggleBassOn(): void { this.bassOn = !this.bassOn; }
  setBassPat(id: string | null): void {
    this.bassPatId = id;
    // Solo one-bar preview so you hear the groove before committing; a live
    // loop just picks the new pattern up on its next bar instead.
    if (id && !this.jzPlaying) {
      const steps = this.activeBassSteps();
      if (steps) this.playBassBar(steps);
    }
  }
  // The groove the loop and previews should play: the user's custom line when
  // 'custom' is selected, otherwise the chosen library pattern.
  private activeBassSteps(): BassStep[] | null {
    if (this.bassPatId === 'custom') { const s = this.customSteps(); return s.length ? s : null; }
    const pat = BASS_PATTERNS.find((p) => p.id === this.bassPatId);
    return pat ? pat.steps : null;
  }
  // Turn the 16-cell editor grid into playable steps: each note sustains up to
  // the next filled cell (a fat, legato line), capped at a quarter note.
  private customSteps(): BassStep[] {
    const cells = this.bassCustom;
    const idxs = cells.map((c, i) => (c ? i : -1)).filter((i) => i >= 0);
    return idxs.map((i, k) => {
      const cell = cells[i]!;
      if (cell.g) return { s: i, g: true };
      const gap = (k + 1 < idxs.length ? idxs[k + 1] : i + 16) - i;
      return { s: i, d: cell.d, l: Math.max(1, Math.min(gap, 4)) };
    });
  }
  /** Cycle a grid cell: rest → R → 3 → 5 → ♭7 → octave → ghost → rest. */
  cycleBassCell(i: number): void {
    if (i < 0 || i >= this.bassCustom.length) return;
    const order: Array<DegTok | 'ghost' | null> = [null, 'R', '3', '5', 'b7', 'O', 'ghost'];
    const cur = this.bassCustom[i];
    const key: DegTok | 'ghost' | null = cur ? (cur.g ? 'ghost' : cur.d ?? null) : null;
    const nextKey = order[(order.indexOf(key) + 1) % order.length];
    const arr = this.bassCustom.slice();
    arr[i] = nextKey === null ? null : nextKey === 'ghost' ? { g: true } : { d: nextKey };
    this.bassCustom = arr;
    this.bassPatId = 'custom'; // editing makes the custom line the active groove
    // Give immediate feedback: sound just the edited step over the current chord.
    if (nextKey && !this.jzPlaying) {
      const { ch, next } = this.bassContext();
      if (nextKey === 'ghost') { if (this.soundOn) this.audio.ghost(bassRootMidi(ch.rootPc)); }
      else this.playMidis([resolveBassStep(nextKey, ch, next, this.tonicPc)], 0.32);
    }
  }
  /** Copy a library groove into the editable grid as a starting point. */
  seedBassCustom(id: string): void {
    const pat = BASS_PATTERNS.find((p) => p.id === id);
    const arr: Array<{ d?: DegTok; g?: boolean } | null> = Array(16).fill(null);
    if (pat) pat.steps.forEach((st) => { if (st.s >= 0 && st.s < 16) arr[st.s] = st.g ? { g: true } : { d: st.d }; });
    this.bassCustom = arr;
    this.bassPatId = 'custom';
    if (!this.jzPlaying) { const s = this.customSteps(); if (s.length) this.playBassBar(s); }
  }
  clearBassCustom(): void {
    this.bassCustom = Array(16).fill(null);
    this.bassPatId = 'custom';
  }
  // The chord (and the one after) the bass should currently resolve against.
  private bassContext(): { ch: Chord; next: Chord } {
    const chs = this.jzChanges;
    const i = this.jzSel >= 0 ? this.jzSel : 0;
    const ch: Chord = chs.length ? chs[i] : { rootPc: this.tonicPc, intervals: INT.dom7, name: '', fn: 'T' };
    const next = chs.length ? chs[(i + 1) % chs.length] : ch;
    return { ch, next };
  }
  playTrick(id: string): void {
    const tk = BASS_TRICKS.find((t) => t.id === id);
    if (tk) this.playBassBar(tk.demo);
  }
  /** One bar of steps, solo, over the current harmonic context. */
  private playBassBar(steps: BassStep[]): void {
    const { ch, next } = this.bassContext();
    this.scheduleBassSteps(steps, ch, next, (60000 / this.tempo) * 4);
  }
  private scheduleBassSteps(steps: BassStep[], ch: Chord, next: Chord, barMs: number): void {
    this.bassTimers.forEach((id) => clearTimeout(id));
    this.bassTimers = [];
    const stepMs = barMs / 16;
    steps.forEach((st) => {
      this.bassTimers.push(setTimeout(() => {
        if (!this.soundOn) return;
        if (st.g) this.audio.ghost(bassRootMidi(ch.rootPc));
        else if (st.d) this.playMidis([resolveBassStep(st.d, ch, next, this.tonicPc)], Math.max(0.16, ((st.l ?? 1.6) * stepMs) / 1000));
      }, Math.round(st.s * stepMs)));
    });
  }
  toggleFinger(): void { this.fingerOn = !this.fingerOn; }
  setJzInv(i: number): void { this.jzInv = i; }
  setVoicing(v: 'full' | 'shell'): void { this.jzVoicing = v; }
  setPatCat(g: string): void {
    const first = patternDefs().find((p) => p.group === g);
    this.patCat = g;
    if (first) this.patId = first.id;
  }
  setPatId(id: string): void { this.patId = id; }
  setJazzCh(i: number): void { this.jazzCh = i; }
  // Instrument taps (piano keys, fret cells) always sound the note; in Reading
  // mode with play-it answering they double as the answer input.
  selectNote(pc: number): void {
    this.playMidis([60 + mod12(pc)], 0.9);
    this.readingTapPc(pc);
  }

  // ---- build a chord relative to the current tonic ----
  private chFromDef(d: ChordDef): Chord {
    const r = mod12(this.tonicPc + d.iv);
    return {
      rootPc: r,
      intervals: d.intervals || (d.q ? INT[d.q] : undefined),
      name: d.name || cname(r, d.q || 'maj', this.tonicPc),
      roman: d.roman || '',
      fn: d.fn || 'T',
    };
  }

  // ---- workshop / jazz sandbox ----
  previewChord(ch: Chord): void {
    const c: Chord = { rootPc: ch.rootPc, intervals: gI(ch), name: ch.name || cname(ch.rootPc, ch.quality || 'maj', this.tonicPc), roman: ch.roman || '', fn: ch.fn || 'T' };
    this.activeChord = jChVoiced(c, this.jzVoicing);
    if (!this.jzPlaying) this.playChord(jChVoiced(c, this.jzVoicing), 0.02);
  }
  hitChord(ch: Chord): void {
    this.activeChord = ch;
    this.playChord(ch, 0.02);
  }
  // Press-and-hold: select the chord and sustain it for as long as the pointer
  // stays down (great on touch — press to hear, hold to let it ring).
  private holding = false;
  holdChord(ch: Chord): void {
    const c: Chord = { rootPc: ch.rootPc, intervals: gI(ch), name: ch.name || cname(ch.rootPc, ch.quality || 'maj', this.tonicPc), roman: ch.roman || '', fn: ch.fn || 'T' };
    const voiced = jChVoiced(c, this.jzVoicing);
    this.activeChord = voiced;
    if (this.soundOn && !this.jzPlaying) { this.audio.holdMidis(gMidis(voiced), 0.02); this.holding = true; }
  }
  releaseChord(): void {
    if (!this.holding) return;
    this.holding = false;
    this.audio.releaseHeld();
  }
  // Computer-keyboard chords: A S D F G H J play the seven diatonic chords of
  // the current key in order, K the tonic an octave up. Press-and-hold sustains
  // the chord for as long as the key is down. Monophonic — a new key releases
  // the one ringing (holdMidis does that for us), so `kbActive` only tracks
  // which key owns the sound, so a stray key-up doesn't cut a later press.
  private kbActive = -1;
  kbHold(deg: number): void {
    if (this.mode !== 'workshop') return;
    const dia = diatonicList(this.tonicPc, this.scale, this.ext);
    if (!dia.length) return;
    const src = dia[Math.min(deg, dia.length - 1)]; // K (deg 7) reuses the tonic
    const c: Chord = { rootPc: src.rootPc, intervals: src.intervals, name: src.name, roman: src.roman || '', fn: src.fn || 'T' };
    const voiced = jChVoiced(c, this.jzVoicing);
    this.activeChord = voiced;
    this.kbActive = deg;
    if (this.soundOn && !this.jzPlaying) {
      const octUp = deg >= dia.length;
      this.audio.holdMidis(gMidis(voiced).map((m) => (octUp ? m + 12 : m)), 0.018);
    }
  }
  kbRelease(deg: number): void {
    if (this.kbActive !== deg) return; // an older key that was already superseded
    this.kbActive = -1;
    this.audio.releaseHeld();
  }
  addChange(ch: Chord): void {
    const c: Chord = { rootPc: ch.rootPc, intervals: gI(ch), name: ch.name, roman: ch.roman || '', fn: ch.fn || 'T' };
    this.jzChanges = [...this.jzChanges, c];
    this.jzSel = this.jzChanges.length - 1;
    this.activeChord = jChVoiced(c, this.jzVoicing);
    if (!this.jzPlaying) this.playChord(jChVoiced(c, this.jzVoicing), 0.02);
  }
  addProg(defs: ChordDef[]): void {
    const arr = this.jzChanges.slice();
    defs.forEach((d) => arr.push(this.chFromDef(d)));
    this.jzChanges = arr;
    this.jzSel = arr.length - 1;
    this.activeChord = jChVoiced(arr[this.jzSel], this.jzVoicing);
  }
  setProgression(defs: ChordDef[]): void {
    const arr = defs.map((d) => this.chFromDef(d));
    this.jzChanges = arr;
    this.jzSel = 0;
    this.jzStep = -1;
    this.activeChord = arr.length ? jChVoiced(arr[0], this.jzVoicing) : null;
  }
  jzRemove(i: number): void {
    const arr = this.jzChanges.slice();
    arr.splice(i, 1);
    this.jzChanges = arr;
    this.jzSel = -1;
    this.jzStep = -1;
  }
  /** Reorder the progression: move the chord at `from` to sit at index `to`. */
  jzMove(from: number, to: number): void {
    const n = this.jzChanges.length;
    if (from < 0 || from >= n || to < 0 || to >= n || from === to) return;
    const arr = this.jzChanges.slice();
    const selRef = this.jzSel >= 0 ? arr[this.jzSel] : null; // follow the selection by identity
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    this.jzChanges = arr;
    this.jzSel = selRef ? arr.indexOf(selRef) : -1;
    this.jzStep = -1;
  }
  jzSelect(i: number): void {
    const ch = this.jzChanges[i];
    if (!ch) return;
    this.jzSel = i;
    this.activeChord = jChVoiced(ch, this.jzVoicing);
    if (!this.jzPlaying) this.playChord(jChVoiced(ch, this.jzVoicing), 0.02);
  }
  jzClear(): void {
    this.stopJazz();
    this.jzChanges = [];
    this.jzSel = -1;
    this.jzStep = -1;
  }
  replaceSel(ch: Chord): void {
    const i = this.jzSel;
    if (i < 0) return;
    const arr = this.jzChanges.slice();
    const nc: Chord = { rootPc: ch.rootPc, intervals: gI(ch), name: ch.name, roman: ch.roman || arr[i].roman, fn: ch.fn || arr[i].fn };
    if (ch.midis) nc.midis = ch.midis;
    arr[i] = nc;
    this.jzChanges = arr;
    this.activeChord = jChVoiced(arr[i], this.jzVoicing);
    // The live loop reads this.jzChanges directly, so it already picks up the
    // swap on its next tick. If the chord being replaced is the one sounding
    // right now, re-strike it so the change is heard immediately.
    if (!this.jzPlaying || i === this.jzStep) this.playChord(jChVoiced(arr[i], this.jzVoicing), 0.02);
  }
  insertV(): void {
    const i = this.jzSel;
    if (i < 0) return;
    const t = this.jzChanges[i];
    const R = t.rootPc;
    const v: Chord = { rootPc: (R + 7) % 12, intervals: INT.dom7, name: cname((R + 7) % 12, 'dom7', this.tonicPc), roman: 'V7/' + (t.roman || 'x'), fn: 'D' };
    const arr = this.jzChanges.slice();
    arr.splice(i, 0, v);
    this.jzChanges = arr;
    this.jzSel = i + 1;
    if (!this.jzPlaying) this.playSeq([jChVoiced(v, this.jzVoicing), jChVoiced(t, this.jzVoicing)]);
  }
  insertIIV(): void {
    const i = this.jzSel;
    if (i < 0) return;
    const t = this.jzChanges[i];
    const R = t.rootPc;
    const ii: Chord = { rootPc: (R + 2) % 12, intervals: INT.min7, name: cname((R + 2) % 12, 'min7', this.tonicPc), roman: 'ii7', fn: 'S' };
    const v: Chord = { rootPc: (R + 7) % 12, intervals: INT.dom7, name: cname((R + 7) % 12, 'dom7', this.tonicPc), roman: 'V7', fn: 'D' };
    const arr = this.jzChanges.slice();
    arr.splice(i, 0, ii, v);
    this.jzChanges = arr;
    this.jzSel = i + 2;
    if (!this.jzPlaying) this.playSeq([jChVoiced(ii, this.jzVoicing), jChVoiced(v, this.jzVoicing), jChVoiced(t, this.jzVoicing)]);
  }
  playSeq(chs: Chord[]): void {
    if (!this.soundOn || !chs.length) return;
    this.seqTimers.forEach((id) => clearTimeout(id));
    this.seqTimers = [];
    chs.forEach((ch, i) => {
      this.seqTimers.push(setTimeout(() => { this.activeChord = ch; this.playChord(ch, 0.02); }, i * 900));
    });
  }
  stopJazz(): void { this.stopTransport(); }
  toggleJazzPlay(): void { this.togglePlay(); }
  // Bass style gives each chord a full 4-beat bar so the groove pattern has
  // room to breathe; the other styles keep the original brisk 2-beat slots.
  private jBeatMs(): number { return (60000 / this.tempo) * (this.wsStyle === 'bass' ? 4 : 2); }
  // One chord slot of the live loop. Reads this.jzChanges fresh each tick
  // (never a captured snapshot) so chords swapped, added, or removed
  // mid-playback take effect on the very next slot.
  private jTick = (): void => {
    const chs = this.jzChanges;
    if (!chs.length) {
      // Progression emptied mid-play: the chords drop out; the drums (if any)
      // keep the transport rolling, otherwise everything stops.
      this.jzPlaying = false;
      this.jzStep = -1;
      if (!this.drPlaying) this.stopTransport();
      return;
    }
    const i = this.jIdx % chs.length;
    const ch = chs[i];
    this.jzStep = i;
    this.activeChord = jChVoiced(ch, this.jzVoicing);
    // Bass-style mix: the chord comp can be muted to hear the line alone
    // (the chord still lights the instruments — only the sound is skipped).
    if (this.wsStyle !== 'bass' || this.bassChordsOn) this.playChord(jChVoiced(ch, this.jzVoicing), 0.02);
    this.jIdx = i + 1;
    // Bass style: lay the selected groove under this bar's chord, resolved
    // fresh each bar so pattern swaps and chord edits land on the next ONE.
    if (this.wsStyle === 'bass' && this.bassOn && this.bassPatId) {
      const steps = this.activeBassSteps();
      if (steps) this.scheduleBassSteps(steps, ch, chs[(i + 1) % chs.length], this.jBeatMs());
    }
  };

  // ---- global transport (Workshop + Drums as one band) ----
  private halfBarMs(): number { return (60000 / this.tempo) * 2; }
  private gridHasHits(): boolean { return DRUM_VOICES.some((v) => this.drGrid[v.id].some((c) => c !== 0)); }
  /** Both play buttons drive this: one clock, everything starts and stops together. */
  togglePlay(): void {
    if (this.jzPlaying || this.drPlaying) this.stopTransport(); else this.startTransport();
  }
  startTransport(): void {
    this.audio.resume();
    this.jIdx = 0;
    this.trHalf = 0;
    this.jzPlaying = this.jzChanges.length > 0;
    this.drPlaying = this.gridHasHits();
    if (!this.jzPlaying && !this.drPlaying) return; // nothing to play yet
    this.trTick();
    this.trLoop = setInterval(this.trTick, this.halfBarMs());
  }
  stopTransport(): void {
    if (this.trLoop) { clearInterval(this.trLoop); this.trLoop = null; }
    this.bassTimers.forEach((id) => clearTimeout(id));
    this.bassTimers = [];
    this.drTimers.forEach((id) => clearTimeout(id));
    this.drTimers = [];
    this.jzPlaying = false;
    this.jzStep = -1;
    this.drPlaying = false;
    this.drStep = -1;
  }
  private retimeTransport(): void {
    if (!this.trLoop) return;
    clearInterval(this.trLoop);
    this.trLoop = setInterval(this.trTick, this.halfBarMs());
  }
  // One half-bar of the band. Bar ticks fire the drums; chord slots fire every
  // half bar (classic/jazz/classical) or every bar (bass style). Both halves
  // are re-checked each bar so a part added mid-play joins on the next ONE.
  private trTick = (): void => {
    const barStart = this.trHalf % 2 === 0;
    if (barStart) {
      if (!this.drPlaying && this.gridHasHits()) this.drPlaying = true;
      if (!this.jzPlaying && this.jzChanges.length) { this.jzPlaying = true; this.jIdx = 0; }
      if (this.drPlaying) this.drTick();
    }
    if (this.jzPlaying && (this.wsStyle !== 'bass' || barStart)) this.jTick();
    this.trHalf++;
  };
  setTempo(v: number): void {
    this.tempo = v;
    this.retimeTransport();
  }

  // ---- patterns ----
  playPatChord(): void {
    const activePat = patternDefs().find((p) => p.id === this.patId) || patternDefs()[0];
    const name = spell(this.tonicPc, this.tonicPc) + SUF[activePat.chord];
    this.playChord({ rootPc: this.tonicPc, intervals: INT[activePat.chord], name, fn: 'T' }, 0.02);
  }
  playPattern(p: { seq?: number[]; int?: number[]; scaleInt?: number[] }): void {
    if (!this.soundOn) return;
    const base = 48 + this.tonicPc;
    this.singleTimers.forEach((id) => clearTimeout(id));
    this.singleTimers = [];
    if (p.seq) {
      p.seq.forEach((o, i) => this.singleTimers.push(setTimeout(() => this.playMidis([base + o], 0.5), i * 155)));
      return;
    }
    const ints = p.int || p.scaleInt || [];
    const up = [...ints, 12].map((i) => base + i);
    const down = up.slice(0, -1).reverse();
    [...up, ...down].forEach((m, i) => this.singleTimers.push(setTimeout(() => this.playMidis([m], 0.45), i * 135)));
  }
  /** Sound a fretboard diagram: scale boxes run note-by-note, chords strum. */
  playFretDiagram(d: Diagram): void {
    if (!this.soundOn) return;
    this.singleTimers.forEach((id) => clearTimeout(id));
    this.singleTimers = [];
    if (d.kind === 'chord') { this.playMidis(d.midis, 1.5, 0.045); return; }
    d.midis.forEach((m, i) => this.singleTimers.push(setTimeout(() => this.playMidis([m], 0.45), i * 140)));
  }

  // ---- drums groovebox ----
  private drTpl() {
    const tpls = drumTemplates();
    return tpls.find((t) => t.id === this.drTplId) || tpls[0];
  }
  setDrumTpl(id: string): void {
    const tpl = drumTemplates().find((t) => t.id === id);
    if (!tpl) return;
    this.drTplId = id;
    this.drLayerN = tpl.layers.length;
    this.drGrid = composeGrid(tpl, tpl.layers.length);
    this.tempo = tpl.bpm;
    this.drSwing = tpl.swing;
    // A live transport keeps rolling but at the new tempo and pattern.
    this.retimeTransport();
  }
  /** Show the groove built up to layer `n` (1-based); re-composes the grid. */
  setDrLayers(n: number): void {
    const tpl = this.drTpl();
    this.drLayerN = Math.max(1, Math.min(n, tpl.layers.length));
    this.drGrid = composeGrid(tpl, this.drLayerN);
  }
  /** Cycle a cell: rest → hit → accent → rest. Editing is always allowed. */
  toggleDrumCell(v: DrumVoiceId, s: number): void {
    if (s < 0 || s >= 16) return;
    const g: DrumGrid = { ...this.drGrid, [v]: this.drGrid[v].slice() };
    g[v][s] = ((g[v][s] + 1) % 3) as 0 | 1 | 2;
    this.drGrid = g;
    // Immediate feedback when the loop isn't already sounding the grid.
    if (g[v][s] && !this.drPlaying && this.soundOn) this.audio.playDrumNow(v, g[v][s] === 2 ? 1 : 0.6);
  }
  previewDrumVoice(v: DrumVoiceId): void {
    if (this.soundOn) this.audio.playDrumNow(v);
  }
  toggleDrMute(v: DrumVoiceId): void {
    this.drMuted = this.drMuted.includes(v) ? this.drMuted.filter((x) => x !== v) : [...this.drMuted, v];
  }
  clearDrums(): void {
    const g: DrumGrid = { ...this.drGrid };
    DRUM_VOICES.forEach((v) => { g[v.id] = Array(16).fill(0); });
    this.drGrid = g;
  }
  setDrTempo(v: number): void { this.setTempo(v); } // one shared transport tempo
  setDrSwing(v: number): void { this.drSwing = v; } // picked up on the next bar
  private drBarMs(): number { return (60000 / this.tempo) * 4; }
  /** Turn a grid (minus muted voices) into one bar of scheduled hits. */
  private gridHits(grid: DrumGrid, swing: number, stepSec: number): Array<{ v: DrumVoiceId; at: number; vel: number }> {
    const hits: Array<{ v: DrumVoiceId; at: number; vel: number }> = [];
    DRUM_VOICES.forEach(({ id }) => {
      if (this.drMuted.includes(id)) return;
      grid[id].forEach((cell, s) => {
        if (!cell) return;
        hits.push({ v: id, at: (s + swingDelaySteps(s, swing)) * stepSec, vel: cell === 2 ? 1 : 0.55 });
      });
    });
    return hits;
  }
  // One bar of the live loop: schedule every hit sample-accurately against the
  // audio clock, and step the UI playhead with plain timers (visual only, so
  // jitter is fine there). Reads the grid fresh each bar, so edits, mutes and
  // swing changes land on the next ONE.
  private drTick = (): void => {
    const barMs = this.drBarMs();
    if (this.soundOn) this.audio.playDrums(this.gridHits(this.drGrid, this.drSwing, barMs / 16000));
    this.drTimers.forEach((id) => clearTimeout(id));
    this.drTimers = [];
    for (let s = 0; s < 16; s++) {
      this.drTimers.push(setTimeout(() => { this.drStep = s; }, Math.round((s * barMs) / 16)));
    }
  };
  toggleDrumPlay(): void { this.togglePlay(); }
  stopDrums(): void { this.stopTransport(); }

  // ---- learn: rhythm theory ----
  setLearnTab(t: LearnTab): void { this.learnTab = t; }
  /** Play a rhythm concept's one-bar demo at its own tempo and feel. */
  playRhythmDemo(id: string): void {
    const c = RHYTHM_CONCEPTS.find((x) => x.id === id);
    if (!c || !this.soundOn) return;
    const grid: DrumGrid = {} as DrumGrid;
    DRUM_VOICES.forEach((v) => { grid[v.id] = Array(16).fill(0); });
    c.demo.forEach((part: DrumLayerPart) => {
      part.on.forEach((s) => { grid[part.v][s] = 1; });
      (part.acc || []).forEach((s) => { grid[part.v][s] = 2; });
    });
    const stepSec = (60 / c.bpm) * 4 / 16;
    const hits: Array<{ v: DrumVoiceId; at: number; vel: number }> = [];
    DRUM_VOICES.forEach(({ id: vid }) => grid[vid].forEach((cell, s) => {
      if (cell) hits.push({ v: vid, at: (s + swingDelaySteps(s, c.swing)) * stepSec, vel: cell === 2 ? 1 : 0.55 });
    }));
    this.audio.playDrums(hits);
  }

  // ---- ear training ----
  genEar(level: EarLevel, play = true): void {
    const target = genEarTarget(level);
    this.earLevel = level;
    this.earTarget = target;
    this.earRevealed = false;
    this.earPicked = null;
    this.earMsg = '';
    // Key-signature is a reading drill — don't auto-play the answer aloud.
    if (play && level !== 'keysig') this.singleTimers.push(setTimeout(() => this.playEar(target), 260));
  }
  playEar(t?: EarTarget | null): void {
    t = t || this.earTarget;
    if (!t) return;
    if (t.type === 'interval') {
      this.playMidis([t.root], 0.7);
      this.singleTimers.push(setTimeout(() => this.playMidis([t.root + t.semis], 0.7), 520));
      this.singleTimers.push(setTimeout(() => this.playMidis([t.root, t.root + t.semis], 1.1), 1100));
    } else if (t.type === 'chord') {
      this.playMidis(chordMidis(t.rootPc, t.quality), 1.3, 0.02);
    } else if (t.type === 'keysig') {
      const base = 60 + t.keyPc;
      [...MAJOR, 12].forEach((iv, i) => this.singleTimers.push(setTimeout(() => this.playMidis([base + iv], 0.4), i * 150)));
    } else {
      let d = 0;
      t.seq.forEach((c) => {
        const midis = chordMidis((t.tonic + c[0]) % 12, c[1]);
        this.singleTimers.push(setTimeout(() => this.playMidis(midis, 0.95, 0.015), d));
        d += 620;
      });
    }
  }
  pickEar(label: string): void {
    if (this.earRevealed) return;
    const t = this.earTarget;
    if (!t) return;
    const ok = label === t.answer;
    let ac = this.activeChord;
    if (t.type === 'chord') ac = { rootPc: t.rootPc, quality: t.quality, roman: '?', fn: 'T' };
    if (t.type === 'prog') { const c = t.seq[0]; ac = { rootPc: (t.tonic + c[0]) % 12, quality: c[1], roman: '?', fn: 'T' }; }
    if (t.type === 'keysig') ac = { rootPc: t.keyPc, quality: 'maj', roman: 'I', fn: 'T' };
    this.earRevealed = true;
    this.earPicked = label;
    this.earScore += ok ? 1 : 0;
    this.earTotal += 1;
    this.earStreak = ok ? this.earStreak + 1 : 0;
    this.earMsg = ok ? '✓ Correct — ' + t.answer : '✗ It was ' + t.answer;
    this.activeChord = ac;
  }

  // ---- sight reading ----
  genReading(): void {
    this.rdTarget = genReadTarget({
      level: this.rdLevel, clef: this.rdClef, range: this.rdRange,
      keyMode: this.rdKeyMode, accidentals: this.rdAccOn, answer: this.rdAnswerMode,
    });
    this.rdRevealed = false;
    this.rdPicked = null;
    this.rdHits = [];
    this.rdMsg = '';
    // Clear the instrument lighting so nothing gives the answer away.
    if (this.mode === 'reading') this.activeChord = null;
  }
  setRdLevel(l: ReadLevel): void { this.rdLevel = l; this.genReading(); }
  setRdClef(c: ReadClefSetting): void { this.rdClef = c; this.genReading(); }
  setRdRange(r: ReadRange): void { this.rdRange = r; this.genReading(); }
  setRdKeyMode(k: ReadKeyMode): void { this.rdKeyMode = k; this.genReading(); }
  toggleRdAcc(): void { this.rdAccOn = !this.rdAccOn; this.genReading(); }
  setRdAnswerMode(m: ReadAnswerMode): void {
    this.rdAnswerMode = m;
    // On mobile the instruments live in the collapsed dock — open it so the
    // play-it answer surface is actually on screen.
    if (m === 'play' && !this.isDesktop) this.dockOpen = true;
    this.genReading();
  }
  private revealReading(ok: boolean, tappedPc?: number): void {
    const t = this.rdTarget;
    if (!t) return;
    this.rdRevealed = true;
    this.rdScore += ok ? 1 : 0;
    this.rdTotal += 1;
    this.rdStreak = ok ? this.rdStreak + 1 : 0;
    const tapped = tappedPc !== undefined ? 'You played ' + spell(tappedPc, this.tonicPc) + ' — it' : 'It';
    this.rdMsg = ok ? '✓ Correct — ' + t.answer : '✗ ' + tapped + ' was ' + t.answer;
    // Light the answer on all three instruments and sound it.
    const root = t.midis[0];
    this.activeChord = { rootPc: mod12(root), intervals: t.midis.map((m) => m - root), name: t.answer, fn: 'T', midis: t.midis };
    this.playMidis(t.midis, 1.2, t.midis.length > 1 ? 0.03 : 0);
  }
  pickReading(label: string): void {
    if (this.rdRevealed || !this.rdTarget) return;
    this.rdPicked = label;
    this.revealReading(label === this.rdTarget.answer);
  }
  private readingTapPc(pc: number): void {
    const t = this.rdTarget;
    if (this.mode !== 'reading' || this.rdAnswerMode !== 'play' || this.rdRevealed || !t) return;
    pc = mod12(pc);
    if (!t.pcs.includes(pc)) { this.revealReading(false, pc); return; }
    if (this.rdHits.includes(pc)) return; // already found — no penalty
    this.rdHits = [...this.rdHits, pc];
    if (this.rdHits.length === t.pcs.length) this.revealReading(true);
  }
}
