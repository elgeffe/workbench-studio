// Central application store. Svelte 5 runes class: `$state` fields hold the
// app state, methods are the actions, and a single `$derived` view-model
// (`view`) mirrors the original renderVals. Components read `store.view.*`
// and call `store.<action>()` — no handler closures leak out of the store.

import {
  INT, SUF, MAJOR, CIRCLE, SCALES, DIA_TRI, DIA_SEV, ROMAN, ROMAN7, FN,
  FNCOLOR, FNTINT, FNNAME, FNWHY, KEYSIG,
  type Chord, type Fn, type ScaleId,
} from './engine/constants';
import {
  mod12, spell, cname, gI, gPcs, gMidis, chordMidis, keyNameStr, scaleNotesStr,
  diatonicList, subsFor, colorChordDefs, jChVoiced, jzNotes, jFamily, invChord,
  jazzVoicing, type DiatonicChord,
} from './engine/theory';
import {
  genreDefs, patternDefs, jazzChapters, PAT_GROUPS, quickProgDefs, cadenceDefs,
  classicalProgDefs, jzBorrowDefs, jzSecondaryDefs, type ChordDef, type JazzChapter,
} from './engine/data';
import { genEarTarget, type EarLevel, type EarTarget } from './engine/ear';
import { AudioEngine } from './audio';

export type Mode = 'circle' | 'workshop' | 'ear' | 'patterns' | 'jazz';
export type WsStyle = 'classic' | 'jazz' | 'classical';

// ---------- view-model shapes ----------
export interface Chip { name: string; bg: string; fg: string; border: string }
export interface DiatonicView extends DiatonicChord {
  fnColor: string; fnName: string; fnTint: string;
  bg: string; border: string; wsBg: string; wsBorder: string; wsShadow: string; shadow: string;
}
export interface ChordChip { name: string; roman: string; notes: string; fnColor: string; border: string; bg: string; shadow: string; ch: Chord }
export interface PaletteChip { name: string; roman: string; fnColor?: string; tint?: string; border?: string; ch: Chord }
export interface Wedge {
  d: string; fill: string; stroke: string; strokeW: string;
  name: string; numeral: string; nameColor: string; numColor: string; nameSize: string;
  nameL: string; nameT: string; numL: string; numT: string;
  pc: number; ring: 'maj' | 'min';
}
export interface FretCell { showLit: boolean; dot: boolean; barreThru: boolean; litOpacity: string; finger: string; dotColor: string; note: string; bg: string; glow: string }
export interface FretRow { label: string; openDot: { color: string } | null; cells: FretCell[] }
export interface PianoKey { left: string; width: string; note: string; bg: string; fg: string; dot: boolean; dotColor: string; finger: string; pc: number }

export class WorkbenchStore {
  // ---- reactive state ----
  tonicPc = $state(0);
  ext = $state('triad');
  scale = $state<ScaleId>('ionian');
  mode = $state<Mode>('circle');
  soundOn = $state(true);
  activeChord = $state<Chord | null>(null);
  tempo = $state(96);

  earLevel = $state<EarLevel>('interval');
  earTarget = $state<EarTarget | null>(null);
  earRevealed = $state(false);
  earPicked = $state<string | null>(null);
  earScore = $state(0);
  earTotal = $state(0);
  earStreak = $state(0);
  earMsg = $state('');

  wsGenre = $state(0);
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

  dockOpen = $state(false);
  circleView = $state<'maj' | 'min'>('maj');
  circleDir = $state<'fifths' | 'fourths'>('fifths');

  isDesktop = $state(false);

  // ---- non-reactive ----
  private audio = new AudioEngine();
  private jloop: ReturnType<typeof setInterval> | null = null;
  private seqTimers: ReturnType<typeof setTimeout>[] = [];
  private singleTimers: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.genEar('interval');
  }

  destroy(): void {
    if (this.jloop) clearInterval(this.jloop);
    this.seqTimers.forEach((id) => clearTimeout(id));
    this.singleTimers.forEach((id) => clearTimeout(id));
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
  setWsGenre(i: number): void { this.wsGenre = i; }
  setWsStyle(s: WsStyle): void { this.wsStyle = s; }
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
  selectNote(pc: number): void { this.playMidis([60 + mod12(pc)], 0.9); }

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
  private jc(iv: number, q: string, opts: Partial<ChordDef> = {}): Chord {
    const r = mod12(this.tonicPc + iv);
    const intervals = opts.intervals || INT[q];
    const name = opts.name || spell(r, this.tonicPc) + (SUF[q] !== undefined ? SUF[q] : '');
    const ch: Chord = { rootPc: r, intervals, name, fn: opts.fn || 'T' };
    if (opts.midis) ch.midis = opts.midis.map((m) => m + this.tonicPc);
    return ch;
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
    if (!this.jzPlaying) this.playChord(jChVoiced(arr[i], this.jzVoicing), 0.02);
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
  stopJazz(): void {
    if (this.jloop) { clearInterval(this.jloop); this.jloop = null; }
    this.jzPlaying = false;
    this.jzStep = -1;
  }
  toggleJazzPlay(): void {
    if (this.jzPlaying) this.stopJazz(); else this.startJazz();
  }
  startJazz(): void {
    const chs = this.jzChanges;
    if (!chs.length) return;
    this.audio.resume();
    let i = 0;
    const beat = () => (60000 / this.tempo) * 2;
    const step = () => {
      const ch = chs[i % chs.length];
      this.jzStep = i % chs.length;
      this.activeChord = jChVoiced(ch, this.jzVoicing);
      this.playChord(jChVoiced(ch, this.jzVoicing), 0.02);
      i++;
    };
    this.jzPlaying = true;
    step();
    this.jloop = setInterval(step, beat());
  }
  setTempo(v: number): void {
    this.tempo = v;
    if (this.jzPlaying && this.jloop) {
      clearInterval(this.jloop);
      const ms = (60000 / v) * 2;
      const chs = this.jzChanges;
      let i = (this.jzStep + 1) || 0;
      const step = () => {
        const ch = chs[i % chs.length];
        this.jzStep = i % chs.length;
        this.activeChord = jChVoiced(ch, this.jzVoicing);
        this.playChord(jChVoiced(ch, this.jzVoicing), 0.02);
        i++;
      };
      this.jloop = setInterval(step, ms);
    }
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

  // ---- ear training ----
  genEar(level: EarLevel): void {
    const target = genEarTarget(level);
    this.earLevel = level;
    this.earTarget = target;
    this.earRevealed = false;
    this.earPicked = null;
    this.earMsg = '';
    // Key-signature is a reading drill — don't auto-play the answer aloud.
    if (level !== 'keysig') this.singleTimers.push(setTimeout(() => this.playEar(target), 260));
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

  // ---------- derived view-model ----------
  view = $derived.by(() => this.computeView());

  private litInfo() {
    const t = this.tonicPc;
    const activePat = patternDefs().find((p) => p.id === this.patId) || patternDefs()[0];
    if (this.mode === 'patterns') {
      const ints = activePat.int || activePat.scaleInt || [];
      const lit = ints.map((i) => (t + i) % 12);
      const litSet = new Set(lit);
      const chordSet = new Set(INT[activePat.chord].map((i) => (t + i) % 12));
      return { root: t, litSet, chordSet, activePat };
    }
    const lit = this.activeChord ? gPcs(this.activeChord) : [];
    const root = this.activeChord ? this.activeChord.rootPc : -1;
    const litSet = new Set(lit);
    return { root, litSet, chordSet: litSet, activePat };
  }

  private buildCircle(): { wedges: Wedge[]; circleLabel: string; circleHint: string } {
    const t = this.tonicPc;
    const isMinView = this.circleView === 'min';
    const isFourths = this.circleDir === 'fourths';
    let order = CIRCLE.slice();
    if (isFourths) order = [order[0], ...order.slice(1).reverse()];
    // Two fixed concentric rings, reference-wheel style: major keys outside,
    // each key's relative minor directly inside it. The whole wheel rotates so
    // the active key sits at 12 o'clock, and the 7 diatonic chords of that key
    // light up as one contiguous tinted block with roman numerals:
    // red = major chords, green = minor chords, blue = the diminished one.
    const cx = 180, cy = 180, rO = 158, rB = 110, rC = 68;
    const rMajName = 131, rMajNum = 149, rMinName = 88, rMinNum = 103;
    const pol = (r: number, deg: number): [number, number] => { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const band = (r1: number, r0: number, a0: number, a1: number): string => {
      const p1 = pol(r1, a0), p2 = pol(r1, a1), p3 = pol(r0, a1), p4 = pol(r0, a0);
      return `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${r1} ${r1} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} L${p3[0].toFixed(1)} ${p3[1].toFixed(1)} A${r0} ${r0} 0 0 0 ${p4[0].toFixed(1)} ${p4[1].toFixed(1)} Z`;
    };
    const pct = (p: [number, number]): [string, string] => [(p[0] / 360 * 100).toFixed(2), (p[1] / 360 * 100).toFixed(2)];
    const activeMajPc = isMinView ? (t + 3) % 12 : t;
    const tonicIdx = order.indexOf(activeMajPc);
    const M = activeMajPc;
    // Where each roman numeral lands: outer ring keyed by major root pc,
    // inner ring keyed by minor root pc. Same 7 wedges in both views —
    // only the numerals (and which wedge is "home") change.
    const majNum: Record<number, string> = isMinView
      ? { [M]: 'III', [(t + 8) % 12]: 'VI', [(t + 10) % 12]: 'VII' }
      : { [M]: 'I', [(M + 5) % 12]: 'IV', [(M + 7) % 12]: 'V' };
    const minNum: Record<number, string> = isMinView
      ? { [t]: 'i', [(t + 5) % 12]: 'iv', [(t + 7) % 12]: 'v', [(t + 2) % 12]: 'ii°' }
      : { [(M + 9) % 12]: 'vi', [(M + 2) % 12]: 'ii', [(M + 4) % 12]: 'iii', [(M + 11) % 12]: 'vii°' };
    const wedges: Wedge[] = [];
    order.forEach((pc, i) => {
      const c = (i - tonicIdx) * 30, a0 = c - 15, a1 = c + 15;
      const mnPc = (pc + 9) % 12; // relative minor sharing this spoke
      // outer wedge — the major key
      const oNum = majNum[pc] || '';
      let oFill = '#f3e8ce', oStroke = '#f1e7d3', oSw = '2', oName = '#8a7a5c', oNumC = '#8f3c1c';
      if (oNum === 'I') { oFill = '#c2562e'; oStroke = '#8f3c1c'; oSw = '3'; oName = '#fff'; oNumC = '#ffd9c6'; }
      else if (oNum) { oFill = '#eec49f'; oName = '#8f3c1c'; }
      const onp = pct(pol(rMajName, c)), oup = pct(pol(rMajNum, c));
      wedges.push({
        d: band(rO, rB, a0, a1), fill: oFill, stroke: oStroke, strokeW: oSw,
        name: spell(pc, t), numeral: oNum, nameColor: oName, numColor: oNumC, nameSize: '18px',
        nameL: onp[0], nameT: onp[1], numL: oup[0], numT: oup[1], pc, ring: 'maj',
      });
      // inner wedge — its relative minor
      const iNum = minNum[mnPc] || '';
      let iFill = '#ebdfc1', iStroke = '#f1e7d3', iSw = '2', iName = '#95835f', iNumC = '#2d5c48';
      if (iNum === 'i') { iFill = '#3f6b5f'; iStroke = '#2d5045'; iSw = '3'; iName = '#fff'; iNumC = '#cdeeda'; }
      else if (iNum.includes('°')) { iFill = '#ccdbe9'; iName = '#46617c'; iNumC = '#46617c'; }
      else if (iNum) { iFill = '#c8dfd0'; iName = '#2d5c48'; }
      const inp = pct(pol(rMinName, c)), iup = pct(pol(rMinNum, c));
      wedges.push({
        d: band(rB, rC, a0, a1), fill: iFill, stroke: iStroke, strokeW: iSw,
        name: spell(mnPc, t).toLowerCase() + 'm', numeral: iNum, nameColor: iName, numColor: iNumC, nameSize: '12.5px',
        nameL: inp[0], nameT: inp[1], numL: iup[0], numT: iup[1], pc: mnPc, ring: 'min',
      });
    });
    const circleLabel = isFourths ? 'CIRCLE OF 4THS' : 'CIRCLE OF 5THS';
    const dirHint = isFourths
      ? 'Clockwise now moves up a fourth (down a fifth) — the direction progressions resolve: V→I→IV…'
      : 'Clockwise moves up a fifth and adds one sharp; neighbours share 6 of 7 notes.';
    const famHint = isMinView
      ? `The tinted block is every chord in ${spell(t, t)} minor: i·iv·v minor (green), III·VI·VII major (red), ii° diminished (blue).`
      : `The tinted block is every chord in ${spell(t, t)} major: I·IV·V major (red), ii·iii·vi minor (green), vii° diminished (blue).`;
    return { wedges, circleLabel, circleHint: dirHint + ' ' + famHint };
  }

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

  private buildInstruments(root: number, litSet: Set<number>, chordSet: Set<number>) {
    const ac = this.activeChord;
    const frets = 13;
    const cell = (open: number, f: number): FretCell => {
      const pc = (open + f) % 12;
      const isLit = litSet.has(pc);
      let bg = '#3f6b5f', glow = 'none';
      if (pc === root) { bg = '#c2562e'; glow = '0 0 0 2px rgba(194,86,46,.3)'; }
      else if (!chordSet.has(pc)) { bg = '#97a59c'; }
      return { showLit: isLit, dot: false, barreThru: false, litOpacity: '1', finger: '', dotColor: '', note: spell(pc, this.tonicPc), bg, glow };
    };
    const buildFret = (opens: number[], labels: string[]): FretRow[] =>
      opens.map((o, si) => ({ label: labels[si], openDot: null, cells: Array.from({ length: frets }, (_, f) => cell(o, f)) }));
    const bass = buildFret([43, 38, 33, 28], ['G', 'D', 'A', 'E']);
    const guitar = buildFret([64, 59, 55, 50, 45, 40], ['e', 'B', 'G', 'D', 'A', 'E']);
    const frets13 = Array.from({ length: frets }, (_, f) => ({ m: [3, 5, 7, 9].includes(f) ? String(f) : f === 12 ? '12' : '' }));

    const roleColor = (r: string) => (({ R: '#c2562e', '3': '#3f6b5f', b3: '#3f6b5f', '7': '#b07d23', '5': '#97a59c', b5: '#97a59c', '9': '#7a5ea8', '11': '#7a5ea8', '13': '#7a5ea8' } as Record<string, string>)[r] || '#c2562e');
    const showFingerToggle = this.mode === 'workshop' && this.wsStyle === 'jazz';
    const overlayOn = showFingerToggle && this.fingerOn && !!ac;
    const pianoMark: Record<number, { color: string; finger: string }> = {};
    if (overlayOn && ac) {
      const fingerChord = this.jzSel >= 0 && this.jzChanges[this.jzSel] ? this.jzChanges[this.jzSel] : ac;
      const v = jazzVoicing(fingerChord, this.jzInv);
      v.guitar.forEach((n) => {
        const row = guitar[n.idx]; if (!row) return;
        if (n.fret === 0) { row.openDot = { color: roleColor(n.role) }; if (row.cells[0]) row.cells[0].showLit = false; }
        else { const c = row.cells[n.fret]; if (c) { c.dot = true; c.showLit = false; c.dotColor = roleColor(n.role); c.finger = String(n.finger); } }
      });
      if (v.gbarre) {
        for (let idx = v.gbarre.loIdx; idx <= v.gbarre.hiIdx; idx++) {
          const c = guitar[idx] && guitar[idx].cells[v.gbarre.fret];
          if (c && !c.dot) { c.barreThru = true; c.showLit = false; }
        }
      }
      v.bass.forEach((n) => {
        const row = bass[n.idx]; if (!row) return;
        if (n.fret === 0) { row.openDot = { color: roleColor(n.role) }; if (row.cells[0]) row.cells[0].showLit = false; }
        else { const c = row.cells[n.fret]; if (c) { c.dot = true; c.showLit = false; c.dotColor = roleColor(n.role); c.finger = String(n.finger); } }
      });
      v.piano.forEach((p) => { pianoMark[p.m] = { color: roleColor(p.role), finger: p.finger }; });
      [bass, guitar].forEach((inst) => inst.forEach((row) => row.cells.forEach((c) => { if (c.showLit) c.litOpacity = '0.22'; })));
    }

    // inversion selector
    const relA = ac ? gI(ac) : [];
    const invCount = relA.includes(10) || relA.includes(11) ? 4 : 3;
    const curInv = (((this.jzInv || 0) % invCount) + invCount) % invCount;
    const invOpts = ['Root', '1st', '2nd', '3rd'].slice(0, invCount).map((nm, i) => ({
      name: nm, i, bg: i === curInv ? '#3f6b5f' : '#fff', fg: i === curInv ? '#fff' : '#5c4a30', bd: i === curInv ? '#3f6b5f' : '#cbb792',
    }));

    // piano C3(48)..C5(72)
    const whiteSet = [0, 2, 4, 5, 7, 9, 11];
    const keys: Array<{ m: number; pc: number; white: boolean }> = [];
    for (let m = 48; m <= 72; m++) keys.push({ m, pc: m % 12, white: whiteSet.includes(m % 12) });
    const whiteCount = keys.filter((k) => k.white).length;
    const wp = 100 / whiteCount;
    let wIdx = 0;
    const pianoWhite: PianoKey[] = [], pianoBlack: PianoKey[] = [];
    keys.forEach((k) => {
      const isLit = litSet.has(k.pc), isRoot = k.pc === root, mk = pianoMark[k.m];
      const dim = overlayOn && isLit && !mk;
      if (k.white) {
        pianoWhite.push({
          left: (wIdx * wp).toFixed(3), width: wp.toFixed(3), pc: k.pc,
          note: isLit ? spell(k.pc, this.tonicPc) : '',
          bg: dim ? '#e7d9bf' : isRoot ? '#c2562e' : isLit ? (chordSet.has(k.pc) ? '#3f6b5f' : '#97a59c') : '#f4ecdb',
          fg: dim ? '#c4b290' : isLit ? '#fff' : '#b9a988', dot: !!mk, dotColor: mk ? mk.color : '', finger: mk ? mk.finger : '',
        });
        wIdx++;
      } else {
        pianoBlack.push({
          left: (wIdx * wp - wp * 0.31).toFixed(3), width: (wp * 0.62).toFixed(3), pc: k.pc,
          note: isLit ? spell(k.pc, this.tonicPc) : '',
          bg: dim ? '#4a3a28' : isRoot ? '#c2562e' : isLit ? (chordSet.has(k.pc) ? '#3f6b5f' : '#97a59c') : '#241a10',
          fg: dim ? '#8c7a5e' : isLit ? '#fff' : '#7a6a4e', dot: !!mk, dotColor: mk ? mk.color : '', finger: mk ? mk.finger : '',
        });
      }
    });
    return { bass, guitar, frets13, pianoWhite, pianoBlack, showFingerToggle, overlayOn, invOpts };
  }

  private computeView() {
    const t = this.tonicPc;
    const { root, litSet, chordSet, activePat } = this.litInfo();
    const dia = diatonicList(t, this.scale, this.ext);
    const ac = this.activeChord;

    // circle
    const { wedges, circleLabel, circleHint } = this.buildCircle();

    // diatonic chips
    const diatonic: DiatonicView[] = dia.map((c) => {
      const isAct = !!ac && ac.name === c.name && ac.rootPc === c.rootPc;
      return {
        ...c, fnColor: FNCOLOR[c.fn], fnName: FNNAME[c.fn], fnTint: FNTINT[c.fn],
        bg: isAct ? '#fbeede' : '#f6efe0', border: isAct ? FNCOLOR[c.fn] : '#e0cfae',
        wsBg: isAct ? '#fbeede' : FNTINT[c.fn], wsBorder: FNCOLOR[c.fn],
        wsShadow: isAct ? '0 0 0 2px ' + FNCOLOR[c.fn] : 'none',
        shadow: isAct ? '0 0 0 2px ' + FNCOLOR[c.fn] : 'none',
      };
    });

    // active readout
    let acNotes: Array<{ name: string; deg: string; bd: string }> = [];
    if (ac) {
      const ps = gPcs(ac);
      const labels = ac.degLabels || ['R', '3', '5', '7', '9', '11', '13'];
      acNotes = ps.map((p, i) => ({ name: spell(p, t), deg: labels[i] || '', bd: i === 0 ? '#c2562e' : '#3f6b5f' }));
    }

    // color chords
    const colorChords: PaletteChip[] = colorChordDefs(t).map((c) => {
      const nm = cname(c.rootPc, c.quality, t);
      const ch: Chord = { rootPc: c.rootPc, intervals: INT[c.quality], name: nm, roman: c.roman, fn: 'S' };
      return { name: nm, roman: c.roman, ch };
    });

    // workshop genres
    const GEN = genreDefs();
    const gi = Math.min(this.wsGenre || 0, GEN.length - 1);
    const wsGenres = GEN.map((g, i) => ({ name: g.name, i, border: i === gi ? '#c2562e' : '#cbb792', bg: i === gi ? '#c2562e' : '#f6efe0', fg: i === gi ? '#fff' : '#5c4a30' }));
    const wsGenreName = GEN[gi].name;
    const wsPatterns = GEN[gi].items.map((p) => ({ name: p.name, defs: p.chords }));

    // substitutions for active chord
    const subs = ac ? subsFor(ac, t).map((s) => {
      const ch = { rootPc: s.rootPc, intervals: s.intervals, name: s.name, roman: s.roman, fn: s.fn } as Chord;
      return { name: s.name, tag: s.tag, why: s.why, fnColor: FNCOLOR[s.fn || 'T'], notes: gPcs(ch).map((p) => spell(p, t)), ch };
    }) : [];

    // patterns tab
    const patCat = PAT_GROUPS.includes(this.patCat) ? this.patCat : 'Scales';
    const patCatChips = PAT_GROUPS.map((g) => ({ name: g, border: g === patCat ? '#3f6b5f' : '#cbb792', bg: g === patCat ? '#3f6b5f' : '#f6efe0', fg: g === patCat ? '#fff' : '#5c4a30' }));
    const patChips = patternDefs().filter((p) => p.group === patCat).map((p) => ({ id: p.id, name: p.name, weight: p.id === activePat.id ? '700' : '500', border: p.id === activePat.id ? '#c2562e' : '#cbb792', bg: p.id === activePat.id ? '#fbeede' : '#f6efe0' }));
    const patInt = activePat.int || activePat.scaleInt || [];
    const patChordName = spell(t, t) + SUF[activePat.chord];
    const patDegrees = (activePat.deg || []).map((d, i) => ({ d, color: i === 0 ? '#fff' : '#2c261d', bg: i === 0 ? '#c2562e' : '#efe2c8', bd: i === 0 ? '#c2562e' : '#cbb792' }));
    const patNotes = patInt.map((i) => spell((t + i) % 12, t)).join('  ·  ');
    const patSeqNotes = activePat.seq ? activePat.seq.map((o) => spell(t + o, t)).join(' ') : '';

    // learn (jazz curriculum)
    const JZ = jazzChapters(t);
    const jzi = Math.min(this.jazzCh || 0, JZ.length - 1);
    const jazzNav = JZ.map((c, i) => ({ name: c.name, tag: c.tag, i, border: i === jzi ? '#c2562e' : '#cbb792', bg: i === jzi ? '#fbeede' : '#f6efe0', fg: i === jzi ? '#c2562e' : '#5c4a30' }));
    const jzc: JazzChapter = JZ[jzi];
    const jazzBlocks = jzc.blocks.map((b) => {
      if (b.kind === 'chords') {
        const items = (b.rows || []).map((r) => { const ch = this.jc(r.iv, r.q || 'maj', r); return { name: ch.name!, sub: r.sub || gPcs(ch).map((p) => spell(p, t)).join(' '), fnColor: FNCOLOR[ch.fn || 'T'], tint: FNTINT[ch.fn || 'T'], ch }; });
        return { kind: 'chords' as const, items };
      }
      if (b.kind === 'seq') {
        const chs = (b.rows || []).map((r) => this.jc(r.iv, r.q || 'maj', r));
        const items = chs.map((ch, i) => ({ name: (b.rows || [])[i].name || ch.name!, sub: gPcs(ch).map((p) => spell(p, t)).join(' '), fnColor: FNCOLOR[ch.fn || 'T'], tint: FNTINT[ch.fn || 'T'], ch }));
        return { kind: 'seq' as const, label: b.label || '', items, seqChords: chs };
      }
      return { kind: b.kind, text: b.text || '' };
    });

    // jazz build sandbox
    const jzChangesView: ChordChip[] = this.jzChanges.map((c, i) => {
      const playing = this.jzStep === i, selected = !this.jzPlaying && this.jzSel === i, hl = playing || selected;
      const fc = FNCOLOR[c.fn || 'T'];
      return { name: c.name || '', roman: c.roman || '', notes: jzNotes(c, this.jzVoicing, t), fnColor: fc, border: fc, bg: hl ? '#fbeede' : FNTINT[c.fn || 'T'], shadow: hl ? '0 0 0 2px ' + fc : '0 1px 2px rgba(60,40,16,.12)', ch: c };
    });
    const jzDia: PaletteChip[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const r = (t + MAJOR[d]) % 12, q = DIA_SEV[d], fn = FN[d], nm = cname(r, q, t);
      const ch: Chord = { rootPc: r, intervals: INT[q], name: nm, roman: ROMAN7[d], fn };
      return { name: nm, roman: ROMAN7[d], fnColor: FNCOLOR[fn], tint: FNTINT[fn], border: FNCOLOR[fn], ch };
    });
    const jzBorrow: PaletteChip[] = jzBorrowDefs.map((d) => {
      const r = (t + d.iv) % 12, nm = cname(r, d.q!, t);
      const ch: Chord = { rootPc: r, intervals: INT[d.q!], name: nm, roman: d.roman, fn: 'S' };
      return { name: nm, roman: d.roman || '', ch };
    });
    const jzSecondary: PaletteChip[] = jzSecondaryDefs.map((d) => {
      const r = (t + d.iv) % 12, nm = cname(r, 'dom7', t);
      const ch: Chord = { rootPc: r, intervals: INT.dom7, name: nm, roman: 'V7/' + d.tgt, fn: 'D' };
      return { name: nm, roman: 'V7/' + d.tgt, ch };
    });
    const quickProgs = quickProgDefs(t).map((p) => ({ name: p.name, defs: p.defs }));

    // classical palette
    const clDia: PaletteChip[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const r = (t + MAJOR[d]) % 12, q = DIA_TRI[d], fn = FN[d], nm = cname(r, q, t);
      const ch: Chord = { rootPc: r, intervals: INT[q], name: nm, roman: ROMAN[d], fn };
      return { name: nm, roman: ROMAN[d], fnColor: FNCOLOR[fn], tint: FNTINT[fn], border: FNCOLOR[fn], ch };
    });
    const cadences = cadenceDefs.map((c) => ({ name: c.name, defs: c.defs }));
    const clProgs = classicalProgDefs.map((p) => ({ name: p.name, defs: p.defs }));

    // explore selected
    let exploreOpen = false, selName = '', selRoman = '', showIIV = false, showV = false;
    let extChips: Array<{ label: string; ch: Chord }> = [];
    let invChips: Array<{ label: string; ch: Chord }> = [];
    let buildSubs: Array<{ name: string; tag: string; why: string; fnColor: string; ch: Chord }> = [];
    if (this.jzSel >= 0 && this.jzChanges[this.jzSel]) {
      const sc = this.jzChanges[this.jzSel];
      exploreOpen = true; selName = sc.name || ''; selRoman = sc.roman || '';
      const R = sc.rootPc, fam = jFamily(gI(sc)), sp = spell(R, t);
      const mkExt = (suf: string, ints: number[]) => ({ label: sp + suf, ch: { rootPc: R, intervals: ints, name: sp + suf, fn: sc.fn, roman: sc.roman } as Chord });
      if (this.wsStyle === 'classical') {
        extChips = [mkExt('', INT.maj), mkExt('m', INT.min), mkExt('7', INT.dom7), mkExt('maj7', INT.maj7), mkExt('°', INT.dim)];
        invChips = [{ label: 'Root', w: 0 }, { label: '1st · 6', w: 1 }, { label: '2nd · 6/4', w: 2 }].map((o) => ({ label: o.label, ch: invChord(sc, o.w, t) }));
        showV = true;
      } else if (fam === 'maj') extChips = [mkExt('maj7', INT.maj7), mkExt('maj9', INT.maj9), mkExt('maj13', INT.maj13)];
      else if (fam === 'min') extChips = [mkExt('m7', INT.min7), mkExt('m9', INT.min9), mkExt('m13', INT.min13)];
      else if (fam === 'dom') extChips = [mkExt('7', INT.dom7), mkExt('9', INT.dom9), mkExt('13', INT.dom13), mkExt('7♭9', [0, 4, 7, 10, 13]), mkExt('7♯9', [0, 4, 7, 10, 15])];
      else extChips = [mkExt('ø7', INT.m7b5), mkExt('ø9', INT.m9b5)];
      if (this.wsStyle === 'jazz') showIIV = true;
      buildSubs = subsFor(sc, t).map((s) => ({ name: s.name!, tag: s.tag, why: s.why, fnColor: FNCOLOR[s.fn || 'T'], ch: { rootPc: s.rootPc, intervals: s.intervals, name: s.name, roman: s.roman, fn: s.fn } as Chord }));
    }

    // suggestion
    const filled = this.jzChanges;
    let suggestText = 'Tap a chord to pre-hear it; tap its + to place it. Functional flow: Tonic → Subdominant → Dominant → back to Tonic.';
    if (filled.length) {
      const last = filled[filled.length - 1].fn || 'T';
      const nextMap: Record<Fn, string> = {
        T: 'a Subdominant (ii, IV) to set off, or jump to the Dominant for drama',
        S: 'the Dominant (V, vii°) — the tension chord that wants to resolve',
        D: 'the Tonic (I, vi) for resolution, or deceptively to vi',
      };
      suggestText = 'Last chord is a ' + FNNAME[last] + '. A natural next move: ' + nextMap[last] + '.';
    }

    // ear
    const earLevels = ([['interval', 'Intervals'], ['chord', 'Chord quality'], ['prog', 'Progressions'], ['keysig', 'Key signatures']] as Array<[EarLevel, string]>).map(([id, name]) => {
      const on = this.earLevel === id;
      return { id, name, border: on ? '#3f6b5f' : '#cbb792', bg: on ? '#3f6b5f' : '#f6efe0', fg: on ? '#fff' : '#5c4a30' };
    });
    let earOptions: Array<{ label: string; border: string; bg: string; fg: string }> = [];
    if (this.earTarget) {
      earOptions = this.earTarget.options.map((label) => {
        let border = '#cbb792', bg = '#f6efe0', fg = '#2c261d';
        if (this.earRevealed) {
          if (label === this.earTarget!.answer) { border = '#3f6b5f'; bg = '#e4efe9'; fg = '#2d5046'; }
          else if (label === this.earPicked) { border = '#c2562e'; bg = '#f8e3da'; fg = '#9a3f1f'; }
        }
        return { label, border, bg, fg };
      });
    }
    const earPromptMap: Record<EarLevel, string> = {
      interval: 'Two notes — name the distance between them',
      chord: 'One chord — name its quality',
      prog: 'A short progression — name the roman numerals',
      keysig: 'Read the key signature — name the major key',
    };
    const earStaff = this.earTarget && this.earTarget.type === 'keysig'
      ? { accidentals: this.earTarget.accidentals }
      : null;

    // instruments
    const inst = this.buildInstruments(root, litSet, chordSet);

    const sigPc = this.circleView === 'min' ? (t + 3) % 12 : t;

    return {
      // header / scale
      keyName: keyNameStr(t, this.scale), keySig: KEYSIG[sigPc] || '',
      centerKey: this.circleView === 'min' ? spell(t, t) + 'm' : spell(t, t),
      scaleNotes: scaleNotesStr(t, this.scale), scaleCaption: SCALES[this.scale].char,
      modeList: (Object.keys(SCALES) as ScaleId[]).map((id) => ({ id, name: SCALES[id].short, bg: this.scale === id ? '#3f6b5f' : '#f1e6cf', fg: this.scale === id ? '#fff' : '#5c4a30', border: this.scale === id ? '#3f6b5f' : '#d8c7a8' })),
      // direct key picker — chromatic, labelled with each key's usual spelling
      keyChips: ([[0, 'C'], [1, 'D♭'], [2, 'D'], [3, 'E♭'], [4, 'E'], [5, 'F'], [6, 'F♯'], [7, 'G'], [8, 'A♭'], [9, 'A'], [10, 'B♭'], [11, 'B']] as Array<[number, string]>).map(([pc, label]) => ({ pc, label, active: t === pc, bg: t === pc ? '#c2562e' : '#f1e6cf', fg: t === pc ? '#fff' : '#5c4a30', border: t === pc ? '#c2562e' : '#d8c7a8' })),
      // scale-type picker split into the four everyday scales + the modes
      scalePrimary: (['ionian', 'aeolian', 'harmonic', 'melodic'] as ScaleId[]).map((id) => ({ id, name: SCALES[id].short, bg: this.scale === id ? '#3f6b5f' : '#f1e6cf', fg: this.scale === id ? '#fff' : '#5c4a30', border: this.scale === id ? '#3f6b5f' : '#d8c7a8' })),
      scaleModes: (['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'] as ScaleId[]).map((id) => ({ id, name: SCALES[id].short, bg: this.scale === id ? '#3f6b5f' : '#f1e6cf', fg: this.scale === id ? '#fff' : '#5c4a30', border: this.scale === id ? '#3f6b5f' : '#d8c7a8' })),
      extLevels: ([['triad', '3'], ['7', '7'], ['9', '9'], ['11', '11'], ['13', '13']] as Array<[string, string]>).map(([id, label]) => ({ id, label, bg: this.ext === id ? '#c2562e' : 'transparent', fg: this.ext === id ? '#fff' : '#d8a86f' })),
      extLevelsLight: ([['triad', '3'], ['7', '7'], ['9', '9'], ['11', '11'], ['13', '13']] as Array<[string, string]>).map(([id, label]) => ({ id, label, bg: this.ext === id ? '#c2562e' : 'transparent', fg: this.ext === id ? '#fff' : '#8a7350' })),
      extCaption: ({ triad: 'Triads — root, 3rd, 5th. The skeleton of every chord.', '7': 'Add the 7th — color and forward motion. Where jazz harmony begins.', '9': 'Add the 9th (the 2nd, an octave up) — lush tension stacked over the 7th.', '11': 'Add the 11th (the 4th, an octave up). Natural 11 clashes with a major 3rd, so players raise it (♯11) or drop the 3rd — it sits naturally on minor chords.', '13': 'Add the 13th (the 6th, an octave up) — the tallest tertian stack. Notes get omitted (often the 5th, sometimes the 11) and voiced by feel.' } as Record<string, string>)[this.ext],
      soundLabel: this.soundOn ? '♪ SOUND' : '✕ MUTED',
      soundLabelShort: this.soundOn ? '♪ ON' : '✕ MUTE',
      soundBg: this.soundOn ? 'rgba(216,168,111,.16)' : 'transparent', soundFg: this.soundOn ? '#e9c79b' : '#9c8460',
      // mode flags
      isCircle: this.mode === 'circle', isWorkshop: this.mode === 'workshop', isEar: this.mode === 'ear', isPatterns: this.mode === 'patterns', isJazz: this.mode === 'jazz',
      ringAnim: this.jzPlaying ? 'spin 8s linear infinite' : 'none',
      // circle
      wedges, circleLabel, circleHint, diatonic,
      dirFifthsBg: this.circleDir === 'fourths' ? 'transparent' : '#c2562e', dirFifthsFg: this.circleDir === 'fourths' ? '#5c4a30' : '#fff',
      dirFourthsBg: this.circleDir === 'fourths' ? '#c2562e' : 'transparent', dirFourthsFg: this.circleDir === 'fourths' ? '#fff' : '#5c4a30',
      viewMajBg: this.circleView === 'min' ? 'transparent' : '#3f6b5f', viewMajFg: this.circleView === 'min' ? '#5c4a30' : '#fff',
      viewMinBg: this.circleView === 'min' ? '#3f6b5f' : 'transparent', viewMinFg: this.circleView === 'min' ? '#fff' : '#5c4a30',
      hasActive: !!ac, noActive: !ac,
      acName: ac ? ac.name || cname(ac.rootPc, ac.quality || 'maj', t) : '', acRoman: ac ? ac.roman || '' : '',
      acFnName: ac ? FNNAME[ac.fn || 'T'] : '', acFnColor: ac ? FNCOLOR[ac.fn || 'T'] : '#3f6b5f',
      acNotes, acWhy: ac ? FNWHY[ac.fn || 'T'] : '',
      // workshop
      wsGenres, wsPatterns, wsGenreName, colorChords,
      wsStyleClassic: this.wsStyle === 'classic', wsStyleJazz: this.wsStyle === 'jazz', wsStyleClassical: this.wsStyle === 'classical',
      styClassicBg: this.wsStyle === 'classic' ? '#c2562e' : 'transparent', styClassicFg: this.wsStyle === 'classic' ? '#fff' : '#5c4a30',
      styJazzBg: this.wsStyle === 'jazz' ? '#c2562e' : 'transparent', styJazzFg: this.wsStyle === 'jazz' ? '#fff' : '#5c4a30',
      styClassicalBg: this.wsStyle === 'classical' ? '#c2562e' : 'transparent', styClassicalFg: this.wsStyle === 'classical' ? '#fff' : '#5c4a30',
      clDia, cadences, clProgs, invChips, showIIV, showV,
      subs,
      // patterns
      patCatChips, patChips, patName: activePat.name, patTip: activePat.tip, patChordName, activePat,
      patDegrees, patSeqNotes, patHasSeq: !!activePat.seq,
      // learn
      jazzNav, jazzBlocks, jazzTitle: jzc.name, jazzIntro: jzc.intro, jazzTag: jzc.tag,
      jzChangesView, jzEmpty: this.jzChanges.length === 0,
      jzPlayLabel: this.jzPlaying ? '■ STOP' : '▶ PLAY', jzPlayBg: this.jzPlaying ? '#9a3f1f' : '#c2562e', jzPlayShadow: this.jzPlaying ? '#6e2c12' : '#9a3f1f',
      vFullBg: this.jzVoicing === 'full' ? '#3f6b5f' : '#f6efe0', vFullFg: this.jzVoicing === 'full' ? '#fff' : '#5c4a30',
      vShellBg: this.jzVoicing === 'shell' ? '#3f6b5f' : '#f6efe0', vShellFg: this.jzVoicing === 'shell' ? '#fff' : '#5c4a30',
      quickProgs, jzDia, jzBorrow, jzSecondary,
      exploreOpen, selName, selRoman, extChips, buildSubs,
      tempo: this.tempo, suggestText,
      // ear
      earLevels, earOptions, earPrompt: earPromptMap[this.earLevel], earStaff,
      earScore: this.earScore + '/' + this.earTotal, earStreak: this.earStreak,
      earMsg: this.earMsg, earMsgColor: this.earMsg.indexOf('✓') >= 0 ? '#3f6b5f' : '#c2562e',
      // dock / instruments
      dockExpanded: this.dockOpen, dockChevron: this.dockOpen ? '▼ HIDE' : '▲ SHOW',
      dockName: this.mode === 'patterns' ? spell(t, t) + ' ' + activePat.name : ac ? ac.name || cname(ac.rootPc, ac.quality || 'maj', t) : '—',
      dockNotes: this.mode === 'patterns' ? patNotes + '   ·   over ' + patChordName : ac ? gPcs(ac).map((p) => spell(p, t)).join('  ·  ') : 'pick a chord to see it on the fretboards',
      ...inst,
      fingerBg: this.fingerOn ? '#3f6b5f' : '#f6efe0', fingerFg: this.fingerOn ? '#fff' : '#5c4a30',
      // mobile tab bar
      mtabs: ([['circle', '⟳', 'CIRCLE'], ['workshop', '▦', 'BUILD'], ['ear', '♪', 'EAR'], ['patterns', '▤', 'PATTERNS'], ['jazz', '♭', 'LEARN']] as Array<[Mode, string, string]>).map(([id, icon, label]) => ({ id, icon, label, fg: this.mode === id ? '#f1e7d3' : '#8a7350', bg: this.mode === id ? 'rgba(194,86,46,.32)' : 'transparent' })),
      // desktop top tabs
      tabs: ([['circle', '⟳ Circle'], ['workshop', '▦ Workshop'], ['ear', '♪ Ear'], ['patterns', '▤ Patterns'], ['jazz', '♭ Learn']] as Array<[Mode, string]>).map(([id, label]) => ({ id, label, fg: this.mode === id ? '#c2562e' : '#8a7350', bd: this.mode === id ? '#c2562e' : 'transparent' })),
    };
  }
}

export type WorkbenchView = WorkbenchStore['view'];
