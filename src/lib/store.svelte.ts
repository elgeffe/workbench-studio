// Central application store. Svelte 5 runes class: `$state` fields hold the
// app state, methods are the actions. The render step lives in `lib/view/`:
// a single `$derived` view-model (`view = computeView(this)`) that components
// read as `store.view.*` — no handler closures leak out of the store.

import { INT, SUF, MAJOR, CIRCLE, SCALES, type Chord, type ScaleId } from './engine/constants';
import { mod12, spell, cname, gI, gMidis, chordMidis, diatonicList, jChVoiced } from './engine/theory';
import { patternDefs, progsIn, type ChordDef } from './engine/data';
import { type Diagram } from './engine/fretpatterns';
import { genEarTarget, type EarLevel, type EarTarget } from './engine/ear';
import {
  genReadTarget, type ReadLevel, type ReadClefSetting, type ReadRange, type ReadKeyMode,
  type ReadAnswerMode, type ReadTarget,
} from './engine/reading';
import {
  BASS_PATTERNS, BASS_TRICKS, bassGenreOf, bassPatternsIn, bassChordIndexAt, bassFallbackChord,
  bassLineSteps, bassRootMidi, resolveBassStep, type BassCell, type BassStep, type DegTok,
} from './engine/bass';
import { Playhead, type PlayheadBar } from './engine/playhead';
import {
  DRUM_VOICES, RHYTHM_CONCEPTS,
  drumTemplates, composeGrid, swingDelaySteps, templateVoices, inKitOrder,
  type DrumVoiceId, type DrumGrid, type DrumLayerPart,
} from './engine/drums';
import { AudioEngine } from './audio';
import { MetronomeStore } from './metronome/store.svelte';
import { MidiStore } from './midi/store.svelte';
import { computeView } from './view';
import type { Wedge } from './view/types';

// The six studio tabs. Circle explores, Drums / Chords / Bass build over one
// shared transport, Metronome practises, and Learn teaches — every piece of
// theory copy and every teaching palette lives behind that last tab.
export type Mode = 'circle' | 'drums' | 'chords' | 'bass' | 'metronome' | 'learn';
export type LearnTab = 'theory' | 'rhythm' | 'bass' | 'patterns' | 'practice' | 'forms';
/** The two drills inside Learn → Practice. */
export type PracticeDrill = 'ear' | 'reading';
/** The three parts of the band, each with its own tab and its own mixer strip. */
export type Part = 'drums' | 'chords' | 'bass';
/** How long one chord of the progression holds: half a bar (2 beats) or a full bar. */
export type ChordSlot = 'half' | 'bar';

// The transport is a lookahead scheduler, not a metronome of setTimeouts (the
// same "two clocks" pattern the practice metronome uses). A coarse timer wakes
// us often and we place every slot that falls inside the next SCHEDULE_AHEAD_S
// at an exact time on the audio clock, accumulated from the slot before it.
// A late or jittery wake-up then changes when we *schedule*, never when
// anything *sounds*.
const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;

/**
 * One scheduled bar of the bassline, as its playhead needs to see it. The
 * change the bar was laid out over travels with it: with half-bar slots the
 * progression has already moved on by the time the bar's second half is heard,
 * so reading the live chord index off the transport would slide the tab's note
 * row forward mid-bar, under notes that were resolved against the chord before.
 */
interface BassBar extends PlayheadBar {
  /** index of the change the bar's first half was resolved against */
  first: number;
}
/**
 * The one panel that can be open at a time: a genre shelf (drum machine,
 * progression starting points, bass grooves) or the key/scale picker that the
 * studio bar's key button opens.
 */
export type PickerId = 'drums' | 'progressions' | 'bass' | 'key' | 'midi';

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

  // Progression starting points and bass grooves are both shelved on the
  // studio's shared genre taxonomy (engine/genres.ts) — the same one the drum
  // machine uses — so each is held as a genre id rather than a list index.
  wsGenre = $state('rock');
  wsProgName = $state(''); // the starting point currently loaded, for the picker summary
  bassGenre = $state('disco');
  // THE bassline — there is one, and it is the user's. 16 cells (one 16th
  // each), null = a rest; step lengths are computed (each note sustains to the
  // next), so a cell only carries its degree or a ghost flag.
  //
  // The 119-groove library is a shelf of starting points that load *into* this,
  // not a set of alternatives to it. That is the whole model: you always have
  // one line, and a library groove is just a fast way to fill it in before you
  // start moving notes around.
  bassLine = $state<BassCell[]>(Array(16).fill(null));
  // Which groove it came from, and whether it has been touched since — enough
  // for the picker summary to say "Octave Pump · edited" rather than lying
  // about which library pattern is loaded.
  //
  // It starts empty. The bass used to sound only inside its own corner of the
  // workshop, so a default groove there was harmless; now that it is a part of
  // the band it would play on the first PLAY from a tab the user has never
  // opened.
  bassSeedId = $state<string | null>(null);
  bassEdited = $state(false);
  // Where the line is in its bar, and which change it is walking over — the two
  // things a degree grid cannot tell you by looking at it. Both follow what is
  // in the speakers (see BassBar), not what has just been scheduled.
  bsStep = $state(-1);
  bsFirst = $state(0);
  // ---- the mixer ----
  // Three parts on one clock, so muting is a property of the band, not of any
  // one tab: the two toggles this replaces were buried in the bass palette and
  // could only be reached from there. Solo is a separate field rather than a
  // pattern of mutes, so leaving solo restores exactly what you had muted.
  partOn = $state<Record<Part, boolean>>({ drums: true, chords: true, bass: true });
  soloPart = $state<Part | null>(null);
  patCat = $state('Scales');
  patId = $state('major');
  jazzCh = $state(0);

  // How long each change holds. This is a setting of its own, not a side effect
  // of the style: BASS used to silently give every chord a full bar, which read
  // as the tempo dropping to half speed the moment you switched to it. The
  // clock never changed — only the harmonic rhythm did — so now you say which
  // you want, and switching styles leaves it alone.
  chordSlot = $state<ChordSlot>('half');

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
  // Visible rows: only the instruments this pattern plays, so a 14-piece kit
  // never becomes a wall of empty lanes. You add and remove rows yourself.
  drRowIds = $state<DrumVoiceId[]>(templateVoices(drumTemplates()[0]));
  drMuted = $state<DrumVoiceId[]>([]);
  drPlaying = $state(false);
  drStep = $state(-1);
  drSwing = $state(50);

  learnTab = $state<LearnTab>('theory');
  practiceDrill = $state<PracticeDrill>('ear');

  dockOpen = $state(false);
  circleView = $state<'maj' | 'min'>('maj');
  circleDir = $state<'fifths' | 'fourths'>('fifths');

  isDesktop = $state(false);

  // Which genre picker is open, if any. The libraries are now big enough
  // (31 genres, 100+ templates each) that leaving the shelves on the page
  // buried the actual instrument, so they live behind a modal: the page keeps
  // a one-line summary and the full picker opens over it on demand.
  picker = $state<PickerId | null>(null);

  // ---- practice metronome (its own engine + runes sub-store) ----
  // The click runs on its own AudioContext and keeps ticking when you browse
  // other tabs — practice against it anywhere in the studio.
  met = new MetronomeStore();

  // ---- MIDI out (its own runes sub-store) ----
  // The band, played out to hardware — a teenage engineering EP-133 K.O. II or
  // anything else that takes notes and clock. A device the whole studio talks
  // to rather than a feature of one tab, so it sits here beside the metronome
  // and hangs off the transport below, not off any mode.
  midi = new MidiStore();

  // ---- derived view-model (pure render step, lives in lib/view) ----
  view = $derived.by(() => computeView(this));

  /**
   * Is the sight-reading drill the thing on screen? It now sits three levels
   * down (Learn → Practice → Reading), and several behaviours key off it —
   * instrument taps double as the answer, and generating a target clears the
   * lighting so nothing gives the answer away. One helper, so those sites stay
   * readable instead of repeating a three-term conditional.
   */
  get readingOpen(): boolean {
    return this.mode === 'learn' && this.learnTab === 'practice' && this.practiceDrill === 'reading';
  }
  /** Likewise for the ear drill, which owns the Practice tab's other half. */
  get earOpen(): boolean {
    return this.mode === 'learn' && this.learnTab === 'practice' && this.practiceDrill === 'ear';
  }
  /** The pattern library, which lights the scale on the instruments. */
  get patternsOpen(): boolean {
    return this.mode === 'learn' && this.learnTab === 'patterns';
  }

  // ---- non-reactive ----
  private audio = new AudioEngine();
  // The global transport: ONE timeline, in half-bar (2 beat) slots, driving the
  // drum groove (bar slots), the chord loop (half-bar or bar slots) and the
  // bassline (bar slots) so they stay locked as one band. `trLoop` is only the
  // wake-up; the music's timing lives in `trNext` on the audio clock.
  private trLoop: ReturnType<typeof setInterval> | null = null;
  private trNext = 0; // audio-clock time of the next slot
  private trHalf = 0; // half-bar counter since transport start
  private jIdx = 0; // next progression index the live loop will play
  private seqTimers: ReturnType<typeof setTimeout>[] = [];
  private singleTimers: ReturnType<typeof setTimeout>[] = [];
  // The playheads run off the audio clock, not off timers: a bar carries the
  // moment the ear gets its step 0 and the shape it was laid out with, and one
  // rAF loop reads the clock against both. See draw().
  private raf: number | null = null;
  private drHead = new Playhead<PlayheadBar>();
  private bsHead = new Playhead<BassBar>();

  constructor() {
    // Prepare an ear-training target so the tab isn't empty, but stay silent:
    // playing here would queue notes on the not-yet-resumed AudioContext and
    // fire them on the user's first gesture, doubling their first chord.
    this.genEar('interval', false);
    this.genReading();
  }

  destroy(): void {
    this.met.destroy();
    this.midi.destroy();
    if (this.trLoop) clearInterval(this.trLoop);
    this.stopDraw();
    this.seqTimers.forEach((id) => clearTimeout(id));
    this.singleTimers.forEach((id) => clearTimeout(id));
  }

  // ---- audio wrappers (respect the mute toggle) ----
  // `at` pins a sound to an exact time on the audio clock — how the transport
  // keeps the band locked. Omitted, it plays a lead ahead of now (a preview).
  private playMidis(midis: number[], dur?: number, stagger?: number, at?: number): void {
    if (!this.soundOn) return;
    this.audio.playMidis(midis, dur ?? 1.2, stagger ?? 0, at);
  }
  playChord(ch: Chord | null, stagger = 0.018, at?: number): void {
    if (!ch) return;
    this.playMidis(gMidis(ch), 1.3, stagger, at);
  }

  /**
   * A moment on the audio clock, in the performance clock Web MIDI schedules
   * against. The two run independently, so the offset between them has to be
   * read fresh each time rather than cached at connect.
   *
   * The output latency belongs here for the same reason it belongs on the drum
   * playhead: a note handed to the audio graph at `t` is not *heard* until `t`
   * plus the device's buffering, whereas MIDI leaves more or less at once. Send
   * it at the raw time and the hardware plays ahead of the app by exactly that
   * buffer. Adding the latency lines the two up — and when the app is muted and
   * the hardware is all you can hear, it only shifts everything equally.
   */
  private toPerf(at: number): number {
    return performance.now() + (at + this.audio.latency() - this.audio.now()) * 1000;
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
  // ---- the genre pickers (one modal at a time) ----
  openPicker(id: PickerId): void { this.picker = id; }
  closePicker(): void { this.picker = null; }
  togglePicker(id: PickerId): void { this.picker = this.picker === id ? null : id; }

  setWsGenre(id: string): void { this.wsGenre = id; }

  /**
   * Load a whole style: the genre's first drum groove, its first progression
   * and its first bassline, all at once.
   *
   * The three libraries already shelve off one taxonomy (engine/genres.ts), so
   * "disco" means the same thing to the drum machine, the progression shelf and
   * the bass grooves — which makes assembling a starting point by hand three
   * trips through three pickers for a result the data could have given you in
   * one tap. Anything a genre happens not to carry is left alone rather than
   * cleared, so a partial style tops up what you have instead of emptying it.
   */
  setStyle(genreId: string): void {
    const tpl = drumTemplates().find((t) => t.genre === genreId);
    if (tpl) this.setDrumTpl(tpl.id);

    const prog = progsIn(genreId)[0];
    if (prog) this.setProgression(prog.chords, prog.name);
    this.wsGenre = genreId;

    const groove = bassPatternsIn(genreId)[0];
    if (groove) this.loadBassGroove(groove.id);
    this.bassGenre = genreId;

    this.closePicker();
  }
  /** How long each change holds: half a bar (2 beats) or a full bar (4). */
  setChordSlot(v: ChordSlot): void { this.chordSlot = v; }
  /**
   * Pick a bass genre — which only swaps the shelf you are browsing. It used to
   * load the genre's first groove too, which was harmless when a library
   * pattern *was* the bassline. Now that grooves load into the user's line,
   * browsing the shelf must not overwrite what they have written.
   */
  setBassGenre(id: string): void { this.bassGenre = id; }

  // ---- the mixer ----
  /**
   * Should this part be heard? Solo wins over the mute flags while it is set,
   * and clears back to them — so soloing the drums to check a fill and then
   * releasing it does not silently unmute the bass you had muted.
   *
   * This gates *audio only*. The transport keeps every part scheduled, so a
   * muted drum grid still drives the playhead and the loop stays locked; you
   * are turning a fader down, not stopping a machine.
   */
  audible(p: Part): boolean {
    return this.soloPart ? this.soloPart === p : this.partOn[p];
  }
  togglePart(p: Part): void {
    this.partOn = { ...this.partOn, [p]: !this.partOn[p] };
    // Un-muting the part you are soloing means you wanted it on, not off.
    if (this.soloPart === p && !this.partOn[p]) this.soloPart = null;
  }
  toggleSolo(p: Part): void {
    this.soloPart = this.soloPart === p ? null : p;
  }
  /** Load a library groove into the line as a starting point, and preview it. */
  loadBassGroove(id: string): void {
    const pat = BASS_PATTERNS.find((p) => p.id === id);
    if (!pat) return;
    const arr: Array<{ d?: DegTok; g?: boolean } | null> = Array(16).fill(null);
    pat.steps.forEach((st) => { if (st.s >= 0 && st.s < 16) arr[st.s] = st.g ? { g: true } : { d: st.d }; });
    this.bassLine = arr;
    this.bassSeedId = id;
    this.bassEdited = false;
    // Keep the shelf pointing at what is actually loaded, so the picker reopens
    // on the groove's own genre however you got there.
    this.bassGenre = bassGenreOf(id);
    // Solo one-bar preview so you hear it before committing; a live loop just
    // picks the new line up on its next bar instead.
    if (!this.jzPlaying) { const s = this.lineSteps(); if (s.length) this.playBassBar(s); }
  }
  /** The line as playable steps — see bassLineSteps for how long each rings. */
  private lineSteps(): BassStep[] {
    return bassLineSteps(this.bassLine);
  }
  /** Cycle a grid cell: rest → R → 3 → 5 → ♭7 → octave → ghost → rest. */
  cycleBassCell(i: number): void {
    if (i < 0 || i >= this.bassLine.length) return;
    const order: Array<DegTok | 'ghost' | null> = [null, 'R', '3', '5', 'b7', 'O', 'ghost'];
    const cur = this.bassLine[i];
    const key: DegTok | 'ghost' | null = cur ? (cur.g ? 'ghost' : cur.d ?? null) : null;
    const nextKey = order[(order.indexOf(key) + 1) % order.length];
    const arr = this.bassLine.slice();
    arr[i] = nextKey === null ? null : nextKey === 'ghost' ? { g: true } : { d: nextKey };
    this.bassLine = arr;
    this.bassEdited = true;
    // Give immediate feedback: sound just the edited step over the current chord.
    if (nextKey && !this.jzPlaying) {
      const { ch, next } = this.bassContext();
      if (nextKey === 'ghost') { if (this.soundOn) this.audio.ghost(bassRootMidi(ch.rootPc)); }
      else this.playMidis([resolveBassStep(nextKey, ch, next, this.tonicPc)], 0.32);
    }
  }
  clearBassLine(): void {
    this.bassLine = Array(16).fill(null);
    this.bassSeedId = null;
    this.bassEdited = false;
  }
  // The chord (and the one after) the bass should currently resolve against.
  private bassContext(): { ch: Chord; next: Chord } {
    const chs = this.jzChanges;
    const i = this.jzSel >= 0 ? this.jzSel : 0;
    const ch: Chord = chs.length ? chs[i] : bassFallbackChord(this.tonicPc, this.scale);
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
    this.scheduleBassSteps(steps, this.audio.now() + 0.06, () => ({ ch, next }));
  }
  /**
   * Lay a bar of bass steps out from `at` on the audio clock — sample-accurate,
   * like the kit, so the line can't drift against it. `chordAt` says which
   * chord a step sits on (and which one it should be walking towards), so a bar
   * carrying two changes gets each half resolved against its own chord.
   */
  private scheduleBassSteps(steps: BassStep[], at: number, chordAt: (s: number) => { ch: Chord; next: Chord }, live = false): void {
    // `live` marks the transport's own bar, as opposed to a preview: only that
    // one answers to the mixer strip, and only that one goes out to hardware.
    const hear = this.soundOn && (!live || this.audible('bass'));
    const send = live && this.midi.partLive('bass');
    if (!hear && !send) return;
    const stepSec = this.barMs() / 16000;
    steps.forEach((st) => {
      const { ch, next } = chordAt(st.s);
      const t = at + st.s * stepSec;
      // A ghost is a pitchless thud from a damped string — there is no note to
      // send, so it stays an internal-only detail of the line.
      if (st.g) { if (hear) this.audio.ghost(bassRootMidi(ch.rootPc), t); return; }
      if (!st.d) return;
      const midi = resolveBassStep(st.d, ch, next, this.tonicPc);
      const dur = Math.max(0.16, (st.l ?? 1.6) * stepSec);
      if (hear) this.playMidis([midi], dur, 0, t);
      if (send) this.midi.sendPitched('bass', [midi], this.toPerf(t), dur * 1000);
    });
  }
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
      name: d.name || cname(r, d.q || 'maj', this.tonicPc, this.scale),
      roman: d.roman || '',
      fn: d.fn || 'T',
    };
  }

  // ---- workshop / jazz sandbox ----
  previewChord(ch: Chord): void {
    const c: Chord = { rootPc: ch.rootPc, intervals: gI(ch), name: ch.name || cname(ch.rootPc, ch.quality || 'maj', this.tonicPc, this.scale), roman: ch.roman || '', fn: ch.fn || 'T' };
    this.activeChord = jChVoiced(c, this.jzVoicing);
    if (!this.jzPlaying) this.playChord(jChVoiced(c, this.jzVoicing), 0.02);
  }
  hitChord(ch: Chord): void {
    this.activeChord = ch;
    this.playChord(ch, 0.02);
  }
  // Chord cards are one-shot taps, not press-and-hold. A pointer-held chord
  // sustains at a fixed level with no decay, so several stacked voices sit hot
  // into the tonal low-pass and the master clamp for as long as the finger is
  // down — that is what made the circle-of-fifths chords sound harsh. A tap
  // plays the plucked envelope, which decays and stays clean. Sustained voices
  // (holdMidis/releaseHeld) are still used by the computer-keyboard chords
  // below, where one monophonic chord at a time is the whole point.
  //
  // Computer-keyboard chords: A S D F G H J play the seven diatonic chords of
  // the current key in order, K the tonic an octave up. Press-and-hold sustains
  // the chord for as long as the key is down. Monophonic — a new key releases
  // the one ringing (holdMidis does that for us), so `kbActive` only tracks
  // which key owns the sound, so a stray key-up doesn't cut a later press.
  private kbActive = -1;
  kbHold(deg: number): void {
    if (this.mode !== 'chords') return;
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
  /** Replace the strip with a starting point. `name` labels it in the picker summary. */
  setProgression(defs: ChordDef[], name = ''): void {
    const arr = defs.map((d) => this.chFromDef(d));
    this.wsProgName = name;
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
    this.wsProgName = '';
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
    const v: Chord = { rootPc: (R + 7) % 12, intervals: INT.dom7, name: cname((R + 7) % 12, 'dom7', this.tonicPc, this.scale), roman: 'V7/' + (t.roman || 'x'), fn: 'D' };
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
    const ii: Chord = { rootPc: (R + 2) % 12, intervals: INT.min7, name: cname((R + 2) % 12, 'min7', this.tonicPc, this.scale), roman: 'ii7', fn: 'S' };
    const v: Chord = { rootPc: (R + 7) % 12, intervals: INT.dom7, name: cname((R + 7) % 12, 'dom7', this.tonicPc, this.scale), roman: 'V7', fn: 'D' };
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
  // One chord slot of the live loop. Reads this.jzChanges fresh each tick
  // (never a captured snapshot) so chords swapped, added, or removed
  // mid-playback take effect on the very next slot.
  private jTick = (at: number): void => {
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
    const voiced = jChVoiced(ch, this.jzVoicing);
    this.activeChord = voiced;
    // A muted chord part still lights the instruments and still moves the
    // progression on — only the sound is skipped.
    if (this.audible('chords')) this.playChord(voiced, 0.02, at);
    // Hardware holds the chord for its whole slot rather than the synth's fixed
    // decay: a sampler sustains what you send it, so a 1.3 s note-off would cut
    // a bar-long change short. A hair under the slot keeps the release clear of
    // the next chord's attack on the same pad.
    if (this.midi.partLive('chords')) {
      const slotMs = this.chordSlot === 'half' ? this.halfBarMs() : this.barMs();
      this.midi.sendPitched('chords', gMidis(voiced), this.toPerf(at), slotMs * 0.96);
    }
    this.jIdx = i + 1;
  };
  /**
   * Lay the selected groove under this bar. The line is written as one bar of
   * 16ths, so it always runs bar by bar — however short the chord slots are,
   * each step resolves against the chord actually sounding underneath it, and
   * approach notes at the end of a slot walk into the change that follows.
   * Rebuilt every bar, so groove swaps and chord edits land on the next ONE.
   */
  private barBass(at: number): void {
    // The bass is a part of the band now, not a mode of the chord workshop: the
    // line plays whichever tab you happen to be looking at, and only its mixer
    // strip silences it. The strip is a fader, though — muting it must not also
    // stop the line going out to hardware, since "silence the app and let the
    // K.O. II play it" is exactly what someone does with both connected. So the
    // mute is applied per-step below, alongside the send.
    const steps = this.lineSteps();
    const chs = this.jzChanges;
    if (!steps.length || !chs.length) {
      // Nothing under this bar — drop the playhead rather than leave it parked
      // on the step the line was cleared from.
      this.bsHead.clear();
      this.bsStep = -1;
      return;
    }
    const first = this.jzStep >= 0 ? this.jzStep : 0;
    const half = this.chordSlot === 'half';
    this.scheduleBassSteps(steps, at, (s) => {
      const i = bassChordIndexAt(s, first, half, chs.length);
      return { ch: chs[i], next: chs[(i + 1) % chs.length] };
    }, true);
    // The line is written straight, so the head walks it straight — the swing
    // in the drum grid is the kit's own feel, not the band's clock.
    this.bsHead.push({ heard: at + this.audio.latency(), stepSec: this.barMs() / 16000, swing: 50, first });
    this.startDraw();
  }

  // ---- global transport (Workshop + Drums as one band) ----
  private halfBarMs(): number { return (60000 / this.tempo) * 2; }
  private barMs(): number { return (60000 / this.tempo) * 4; }
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
    // Start far enough out that the first slot is scheduled ahead like every
    // other one, rather than racing the clock the moment PLAY is pressed.
    this.trNext = this.audio.now() + 0.08;
    // START goes out before the first slot's ticks are queued, so a device
    // following the clock starts its own bar on ours.
    this.midi.transportStart(this.toPerf(this.trNext));
    this.pump();
    this.trLoop = setInterval(this.pump, LOOKAHEAD_MS);
  }
  stopTransport(): void {
    if (this.trLoop) { clearInterval(this.trLoop); this.trLoop = null; }
    // A bar is queued in advance, so silence what hasn't sounded yet. Notes
    // already ringing are left alone — cutting those mid-note would click.
    this.audio.cancelScheduled();
    // The same problem on the wire, where it is worse: an un-cancelled note-on
    // with its note-off dropped is a pad that never lets go.
    this.midi.transportStop();
    this.stopDraw();
    this.jzPlaying = false;
    this.jzStep = -1;
    this.drPlaying = false;
    this.drStep = -1;
    this.bsStep = -1;
  }
  /**
   * The wake-up. Schedules every slot now inside the lookahead window, each at
   * a time accumulated from the last, so the grid is exact however unevenly
   * this happens to be called. Tempo changes are picked up here too — the next
   * slot simply lands a new interval later, with no clock to restart.
   */
  private pump = (): void => {
    const now = this.audio.now();
    const slot = this.halfBarMs() / 1000;
    // Backgrounded tab or a long stall: rejoin the grid at the next whole slot
    // instead of firing every missed one at once. Whole slots keep the bar /
    // half-bar alternation intact.
    if (this.trNext < now) {
      const missed = Math.ceil((now - this.trNext) / slot);
      this.trNext += missed * slot;
      this.trHalf += missed;
    }
    const horizon = now + SCHEDULE_AHEAD_S;
    while (this.trNext < horizon) {
      this.trTick(this.trNext);
      this.trNext += this.halfBarMs() / 1000;
    }
  };
  // One half-bar of the band, at an exact time on the audio clock. Bar slots
  // fire the drums and the bassline (both are written a bar at a time); chord
  // slots fire every half bar or every bar, whichever the user asked for. Every
  // part is re-checked each bar so one added mid-play joins on the next ONE.
  private trTick = (at: number): void => {
    const barStart = this.trHalf % 2 === 0;
    // Clock is laid out per slot, timestamped like every note, so the device's
    // sequencer cannot drift away from ours however the main thread behaves.
    this.midi.sendClockSlot(this.toPerf(at), 60000 / this.tempo);
    if (barStart) {
      if (!this.drPlaying && this.gridHasHits()) this.drPlaying = true;
      if (!this.jzPlaying && this.jzChanges.length) { this.jzPlaying = true; this.jIdx = 0; }
      if (this.drPlaying) this.drTick(at);
    }
    if (this.jzPlaying && (this.chordSlot === 'half' || barStart)) this.jTick(at);
    if (barStart && this.jzPlaying) this.barBass(at);
    this.trHalf++;
  };
  setTempo(v: number): void { this.tempo = v; }

  // ---- patterns ----
  playPatChord(): void {
    const activePat = patternDefs().find((p) => p.id === this.patId) || patternDefs()[0];
    const name = spell(this.tonicPc, this.tonicPc, this.scale) + SUF[activePat.chord];
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
  /** Pick a genre: loads its first variation (the picker is genre → pattern). */
  setDrumGenre(id: string): void {
    const first = drumTemplates().find((t) => t.genre === id);
    if (first) this.setDrumTpl(first.id);
  }
  setDrumTpl(id: string): void {
    const tpl = drumTemplates().find((t) => t.id === id);
    if (!tpl) return;
    this.drTplId = id;
    this.drLayerN = tpl.layers.length;
    this.drGrid = composeGrid(tpl, tpl.layers.length);
    // Rows come from the whole template, not the current layer count, so the
    // grid doesn't reshuffle while you step through the layers.
    this.drRowIds = templateVoices(tpl);
    this.drMuted = this.drMuted.filter((v) => this.drRowIds.includes(v));
    this.tempo = tpl.bpm;
    this.drSwing = tpl.swing;
    // A live transport keeps rolling and picks the new tempo up on its next
    // slot — there is no clock to restart.
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
  /** Add an instrument row from the kit, in kit order, and preview it. */
  addDrumRow(v: DrumVoiceId): void {
    if (this.drRowIds.includes(v)) return;
    this.drRowIds = inKitOrder([...this.drRowIds, v]);
    if (this.soundOn) this.audio.playDrumNow(v);
  }
  /** Remove a row: it disappears from the grid and its steps are cleared. */
  removeDrumRow(v: DrumVoiceId): void {
    this.drRowIds = this.drRowIds.filter((x) => x !== v);
    this.drMuted = this.drMuted.filter((x) => x !== v);
    this.drGrid = { ...this.drGrid, [v]: Array(16).fill(0) as DrumGrid[DrumVoiceId] };
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
  /** Turn a grid (minus muted voices) into one bar of scheduled hits. */
  private gridHits(grid: DrumGrid, swing: number, stepSec: number): Array<{ v: DrumVoiceId; at: number; vel: number; acc: boolean }> {
    const hits: Array<{ v: DrumVoiceId; at: number; vel: number; acc: boolean }> = [];
    DRUM_VOICES.forEach(({ id }) => {
      if (this.drMuted.includes(id)) return;
      grid[id].forEach((cell, s) => {
        if (!cell) return;
        // `acc` carries the accent as the grid means it. The synth wants a gain
        // and MIDI wants a velocity, and deriving one from the other by
        // comparing floats is the kind of coupling that breaks quietly.
        hits.push({ v: id, at: (s + swingDelaySteps(s, swing)) * stepSec, vel: cell === 2 ? 1 : 0.55, acc: cell === 2 });
      });
    });
    return hits;
  }
  // One bar of the live loop: schedule every hit sample-accurately against the
  // audio clock, and hand the playhead the same origin. Reads the grid fresh
  // each bar, so edits, mutes and swing changes land on the next ONE.
  private drTick = (at: number): void => {
    const stepSec = this.barMs() / 16000;
    const wantAudio = this.soundOn && this.audible('drums');
    const wantMidi = this.midi.partLive('drums');
    // One layout, both destinations — the kit the hardware plays is the kit on
    // screen, hit for hit, swing and all.
    const hits = wantAudio || wantMidi ? this.gridHits(this.drGrid, this.drSwing, stepSec) : [];
    // Muting the kit silences it without stopping it: the bar below is still
    // laid out, so the playhead keeps sweeping the grid you are editing.
    if (wantAudio) this.audio.playDrums(hits, at);
    // Hit times inside a bar are offsets; the wire wants absolute moments.
    if (wantMidi) this.midi.sendDrums(hits.map((h) => ({ v: h.v, acc: h.acc, at: this.toPerf(at + h.at) })));
    // The playhead follows when the bar is *heard*, not when it was scheduled:
    // it goes out to the speakers an output latency later, and lighting a step
    // the moment we queued it is exactly what put the ring in front of the kit.
    //
    // Which is also why the new bar can't take the playhead over here. The
    // transport ticks on the bar line, but the ring is running that same lead
    // plus output latency behind it, so the bar that is playing still has that
    // much of its tail to show — 4a, and on a slow output 4& too. It queues
    // behind the bar in the speakers, and the playhead promotes it on arrival.
    this.drHead.push({ heard: at + this.audio.latency(), stepSec, swing: this.drSwing });
    this.startDraw();
  };
  // The playheads read the audio clock every frame instead of counting their
  // own timers, so they can't drift away from the notes when the main thread
  // stalls. One loop draws both parts: they share a transport, and a bass line
  // playing under a silent grid still needs its bar tracked.
  private draw = (): void => {
    this.raf = null;
    if (!this.drPlaying && !this.jzPlaying) return;
    const now = this.audio.now();
    if (this.drPlaying) {
      const s = this.drHead.step(now);
      if (s >= 0) this.drStep = s;
    }
    if (this.jzPlaying) {
      const s = this.bsHead.step(now);
      // The chord moves with the bar it was resolved against, so it is read
      // after step() — which is what promotes the bar now being heard.
      const bar = this.bsHead.bar;
      if (bar) this.bsFirst = bar.first;
      if (s >= 0) this.bsStep = s;
    }
    this.startDraw();
  };
  private startDraw(): void {
    if (this.raf != null || typeof requestAnimationFrame !== 'function') return;
    this.raf = requestAnimationFrame(this.draw);
  }
  private stopDraw(): void {
    if (this.raf != null) { cancelAnimationFrame(this.raf); this.raf = null; }
    this.drHead.clear();
    this.bsHead.clear();
  }
  toggleDrumPlay(): void { this.togglePlay(); }
  stopDrums(): void { this.stopTransport(); }

  // ---- learn: rhythm theory ----
  setLearnTab(t: LearnTab): void { this.learnTab = t; }
  /**
   * The `?` on a tool surface: jump to the Learn area that explains it. This is
   * the connective tissue for moving the prose out of the tool tabs — the copy
   * is one tap away rather than permanently in the way.
   */
  openLearn(t: LearnTab): void {
    this.learnTab = t;
    this.mode = 'learn';
  }
  setPracticeDrill(d: PracticeDrill): void {
    this.practiceDrill = d;
    // Reading clears the lighting so the staff can't be answered by looking at
    // the fretboards; leaving the drill should not leave them dark.
    if (d === 'reading') this.genReading();
  }
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
    if (this.readingOpen) this.activeChord = null;
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
    const tapped = tappedPc !== undefined ? 'You played ' + spell(tappedPc, this.tonicPc, this.scale) + ' — it' : 'It';
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
    if (!this.readingOpen || this.rdAnswerMode !== 'play' || this.rdRevealed || !t) return;
    pc = mod12(pc);
    if (!t.pcs.includes(pc)) { this.revealReading(false, pc); return; }
    if (this.rdHits.includes(pc)) return; // already found — no penalty
    this.rdHits = [...this.rdHits, pc];
    if (this.rdHits.length === t.pcs.length) this.revealReading(true);
  }
}
