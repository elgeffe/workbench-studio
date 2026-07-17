// Fretboard pattern library: movable shapes — scale boxes, CAGED forms, barre
// chords, bass chords — defined once in shape-relative coordinates and anchored
// to the current tonic, so every diagram transposes with the key. A shape lists
// its dots per string (s = string index, 0 = LOWEST string) at relative frets;
// the builder finds the absolute base fret that lands the anchor dot on the
// tonic and emits a ready-to-render Diagram (display rows are top = highest
// string, matching the app's fretboards).

import { mod12, spell } from './theory';

// ---------- shape + diagram types ----------

export interface ShapeDot {
  s: number; // string index, 0 = lowest (E on guitar and bass)
  f: number; // fret, relative to the shape's own origin
  role: string; // 'R', '3', '♭3', '5', '♭7', … — colours + dot label
  color?: string; // explicit override (e.g. major/minor overlap layers)
}

export interface FretShapeSpec {
  inst: 'guitar' | 'bass';
  dots: ShapeDot[];
  barres?: Array<{ f: number; s0: number; s1: number }>; // inclusive string range
  mutes?: number[]; // string indexes that stay silent
  anchorS: number; // the dot that anchors the shape to the key…
  anchorF: number;
  anchorOff?: number; // …lands on tonic + this many semitones (default 0 = root)
  movable?: boolean; // true = never render at the nut (barre shapes): use fret 12 instead
}

export interface DiagramDot { row: number; col: number; color: string; label: string }
export interface Diagram {
  name: string; // small caption over the diagram, e.g. 'guitar · frets 5–8'
  labels: string[]; // string labels, top row first (high string on top)
  startFret: number;
  frets: number[]; // absolute fret number per column
  dots: DiagramDot[];
  barres: Array<{ col: number; row0: number; row1: number }>;
  mutes: number[]; // display rows marked ×
  midis: number[]; // every dotted note, low → high, for playback
  kind: 'run' | 'chord';
}

export interface FretCard {
  id: string;
  name: string;
  tag: string;
  tip: string;
  diagrams: Diagram[];
}

const GTR_MIDIS = [40, 45, 50, 55, 59, 64]; // E A D G B e
const GTR_LABELS = ['e', 'B', 'G', 'D', 'A', 'E']; // display, top first
const BASS_MIDIS = [28, 33, 38, 43]; // E A D G
const BASS_LABELS = ['G', 'D', 'A', 'E'];

const ROLE_COLOR: Record<string, string> = {
  R: '#c2562e', '3': '#3f6b5f', '♭3': '#3f6b5f', '5': '#97a59c',
  '7': '#b07d23', '♭7': '#b07d23',
  '2': '#7a5ea8', '4': '#7a5ea8', '6': '#7a5ea8', '9': '#7a5ea8',
  '♭2': '#7a5ea8', '♭5': '#7a5ea8', '♭6': '#7a5ea8', '♯4': '#7a5ea8',
};

/** Anchor a relative shape to the tonic and lay it out as a renderable diagram. */
export function buildDiagram(
  spec: FretShapeSpec, tonicPc: number, kind: 'run' | 'chord', nameHint = '',
): Diagram {
  const midis0 = spec.inst === 'bass' ? BASS_MIDIS : GTR_MIDIS;
  const labels = spec.inst === 'bass' ? BASS_LABELS : GTR_LABELS;
  const n = midis0.length;
  let base = mod12(tonicPc + (spec.anchorOff ?? 0) - midis0[spec.anchorS] - spec.anchorF);
  const fs = spec.dots.map((d) => d.f);
  const lo = Math.min(...fs), hi = Math.max(...fs);
  // Keep the window on the practical neck: barre shapes never sit at the nut,
  // and a box that would run past fret 15 comes down an octave (when that
  // doesn't push it below the nut).
  if (spec.movable && base + lo < 1) base += 12;
  if (base + hi >= 16 && base + lo >= 12) base -= 12;
  const startFret = base + lo;
  const cols = hi - lo + 1;
  const dots: DiagramDot[] = spec.dots.map((d) => ({
    row: n - 1 - d.s,
    col: d.f - lo,
    color: d.color || ROLE_COLOR[d.role] || '#7a5ea8',
    label: d.role,
  }));
  const midis = spec.dots.map((d) => midis0[d.s] + base + d.f).sort((a, b) => a - b);
  return {
    name: nameHint || `${spec.inst} · frets ${startFret}–${startFret + cols - 1}`,
    labels,
    startFret,
    frets: Array.from({ length: cols }, (_, i) => startFret + i),
    dots,
    // A barre that lands at absolute fret 0 is just the nut — drop it, the
    // open strings play themselves (this is what makes CAGED grips render as
    // their open forms in the home key and as barres everywhere else).
    barres: (spec.barres || []).filter((b) => b.f + base > 0)
      .map((b) => ({ col: b.f - lo, row0: n - 1 - b.s1, row1: n - 1 - b.s0 })),
    mutes: (spec.mutes || []).map((s) => n - 1 - s),
    midis,
    kind,
  };
}

// ---------- Fretboard Boxes: pentatonic + scale positions ----------

// The five minor-pentatonic boxes, relative to box 1's root on the low E.
// Two notes per string, exactly as the classic diagrams draw them.
const PENT_BOXES: Array<{ pos: number; anchorS: number; anchorF: number; dots: ShapeDot[] }> = [
  { pos: 1, anchorS: 0, anchorF: 0, dots: [
    { s: 0, f: 0, role: 'R' }, { s: 0, f: 3, role: '♭3' },
    { s: 1, f: 0, role: '4' }, { s: 1, f: 2, role: '5' },
    { s: 2, f: 0, role: '♭7' }, { s: 2, f: 2, role: 'R' },
    { s: 3, f: 0, role: '♭3' }, { s: 3, f: 2, role: '4' },
    { s: 4, f: 0, role: '5' }, { s: 4, f: 3, role: '♭7' },
    { s: 5, f: 0, role: 'R' }, { s: 5, f: 3, role: '♭3' },
  ] },
  { pos: 2, anchorS: 2, anchorF: 2, dots: [
    { s: 0, f: 3, role: '♭3' }, { s: 0, f: 5, role: '4' },
    { s: 1, f: 2, role: '5' }, { s: 1, f: 5, role: '♭7' },
    { s: 2, f: 2, role: 'R' }, { s: 2, f: 5, role: '♭3' },
    { s: 3, f: 2, role: '4' }, { s: 3, f: 4, role: '5' },
    { s: 4, f: 3, role: '♭7' }, { s: 4, f: 5, role: 'R' },
    { s: 5, f: 3, role: '♭3' }, { s: 5, f: 5, role: '4' },
  ] },
  { pos: 3, anchorS: 1, anchorF: 7, dots: [
    { s: 0, f: 5, role: '4' }, { s: 0, f: 7, role: '5' },
    { s: 1, f: 5, role: '♭7' }, { s: 1, f: 7, role: 'R' },
    { s: 2, f: 5, role: '♭3' }, { s: 2, f: 7, role: '4' },
    { s: 3, f: 4, role: '5' }, { s: 3, f: 7, role: '♭7' },
    { s: 4, f: 5, role: 'R' }, { s: 4, f: 8, role: '♭3' },
    { s: 5, f: 5, role: '4' }, { s: 5, f: 7, role: '5' },
  ] },
  { pos: 4, anchorS: 1, anchorF: 7, dots: [
    { s: 0, f: 7, role: '5' }, { s: 0, f: 10, role: '♭7' },
    { s: 1, f: 7, role: 'R' }, { s: 1, f: 10, role: '♭3' },
    { s: 2, f: 7, role: '4' }, { s: 2, f: 9, role: '5' },
    { s: 3, f: 7, role: '♭7' }, { s: 3, f: 9, role: 'R' },
    { s: 4, f: 8, role: '♭3' }, { s: 4, f: 10, role: '4' },
    { s: 5, f: 7, role: '5' }, { s: 5, f: 10, role: '♭7' },
  ] },
  { pos: 5, anchorS: 3, anchorF: 9, dots: [
    { s: 0, f: 10, role: '♭7' }, { s: 0, f: 12, role: 'R' },
    { s: 1, f: 10, role: '♭3' }, { s: 1, f: 12, role: '4' },
    { s: 2, f: 9, role: '5' }, { s: 2, f: 12, role: '♭7' },
    { s: 3, f: 9, role: 'R' }, { s: 3, f: 12, role: '♭3' },
    { s: 4, f: 10, role: '4' }, { s: 4, f: 12, role: '5' },
    { s: 5, f: 10, role: '♭7' }, { s: 5, f: 12, role: 'R' },
  ] },
];

// Major pentatonic "pattern 1" — the same physical shape as minor box 2, with
// the roles read from the relative-major root (the shape's lowest-E dot).
const MAJ_PENT_BOX: FretShapeSpec = { inst: 'guitar', anchorS: 0, anchorF: 3, dots: [
  { s: 0, f: 3, role: 'R' }, { s: 0, f: 5, role: '2' },
  { s: 1, f: 2, role: '3' }, { s: 1, f: 5, role: '5' },
  { s: 2, f: 2, role: '6' }, { s: 2, f: 5, role: 'R' },
  { s: 3, f: 2, role: '2' }, { s: 3, f: 4, role: '3' },
  { s: 4, f: 3, role: '5' }, { s: 4, f: 5, role: '6' },
  { s: 5, f: 3, role: 'R' }, { s: 5, f: 5, role: '2' },
] };

// Full major scale in position — the box around the E-shape barre (root 6th
// string) and the A-shape barre (root 5th string).
const MAJOR_ROOT6: FretShapeSpec = { inst: 'guitar', anchorS: 0, anchorF: 1, dots: [
  { s: 0, f: 0, role: '7' }, { s: 0, f: 1, role: 'R' }, { s: 0, f: 3, role: '2' },
  { s: 1, f: 0, role: '3' }, { s: 1, f: 1, role: '4' }, { s: 1, f: 3, role: '5' },
  { s: 2, f: 0, role: '6' }, { s: 2, f: 2, role: '7' }, { s: 2, f: 3, role: 'R' },
  { s: 3, f: 0, role: '2' }, { s: 3, f: 2, role: '3' }, { s: 3, f: 3, role: '4' },
  { s: 4, f: 1, role: '5' }, { s: 4, f: 3, role: '6' },
  { s: 5, f: 0, role: '7' }, { s: 5, f: 1, role: 'R' }, { s: 5, f: 3, role: '2' },
] };
const MAJOR_ROOT5: FretShapeSpec = { inst: 'guitar', anchorS: 1, anchorF: 1, dots: [
  { s: 0, f: 1, role: '5' }, { s: 0, f: 3, role: '6' },
  { s: 1, f: 1, role: 'R' }, { s: 1, f: 3, role: '2' },
  { s: 2, f: 0, role: '3' }, { s: 2, f: 1, role: '4' }, { s: 2, f: 3, role: '5' },
  { s: 3, f: 0, role: '6' }, { s: 3, f: 2, role: '7' }, { s: 3, f: 3, role: 'R' },
  { s: 4, f: 1, role: '2' }, { s: 4, f: 3, role: '3' },
  { s: 5, f: 1, role: '5' }, { s: 5, f: 3, role: '6' },
] };

// Natural minor in position, root on the low E.
const MINOR_ROOT6: FretShapeSpec = { inst: 'guitar', anchorS: 0, anchorF: 0, dots: [
  { s: 0, f: 0, role: 'R' }, { s: 0, f: 2, role: '2' }, { s: 0, f: 3, role: '♭3' },
  { s: 1, f: 0, role: '4' }, { s: 1, f: 2, role: '5' }, { s: 1, f: 3, role: '♭6' },
  { s: 2, f: 0, role: '♭7' }, { s: 2, f: 2, role: 'R' },
  { s: 3, f: 0, role: '♭3' }, { s: 3, f: 2, role: '4' },
  { s: 4, f: 0, role: '5' }, { s: 4, f: 1, role: '♭6' }, { s: 4, f: 3, role: '♭7' },
  { s: 5, f: 0, role: 'R' }, { s: 5, f: 2, role: '2' }, { s: 5, f: 3, role: '♭3' },
] };

// Bass (E A D G) versions — the guitar boxes' four lowest strings, 1:1.
const BASS_MIN_PENT: FretShapeSpec = { inst: 'bass', anchorS: 0, anchorF: 0, dots: [
  { s: 0, f: 0, role: 'R' }, { s: 0, f: 3, role: '♭3' },
  { s: 1, f: 0, role: '4' }, { s: 1, f: 2, role: '5' },
  { s: 2, f: 0, role: '♭7' }, { s: 2, f: 2, role: 'R' },
  { s: 3, f: 0, role: '♭3' }, { s: 3, f: 2, role: '4' },
] };
const BASS_MAJ_PENT: FretShapeSpec = { inst: 'bass', anchorS: 0, anchorF: 1, dots: [
  { s: 0, f: 1, role: 'R' }, { s: 0, f: 3, role: '2' },
  { s: 1, f: 0, role: '3' }, { s: 1, f: 3, role: '5' },
  { s: 2, f: 0, role: '6' }, { s: 2, f: 3, role: 'R' },
  { s: 3, f: 0, role: '2' }, { s: 3, f: 2, role: '3' },
] };

function boxesCards(t: number): FretCard[] {
  const boxTips: Record<number, string> = {
    1: 'THE box — root under your index finger on the low E. Solo here first: every note is safe, the root is always home.',
    2: 'Slides up from box 1 — they share a fret column. Practise crossing the seam mid-phrase so the boxes melt together.',
    3: 'The middle of the neck. The root now lives on the A string — learn where it sits so you can land phrases on it.',
    4: 'Root on the A and D strings. This is the box that hides the “sweet” 5–♭7 bends on the top strings.',
    5: 'The last shape before box 1 returns an octave up (or below the nut, an octave down) — the five boxes tile the whole neck.',
  };
  const cards: FretCard[] = PENT_BOXES.map((b) => ({
    id: 'pent' + b.pos,
    name: `Minor pentatonic · box ${b.pos}`,
    tag: `POSITION ${b.pos} OF 5`,
    tip: boxTips[b.pos],
    diagrams: [buildDiagram({ inst: 'guitar', anchorS: b.anchorS, anchorF: b.anchorF, dots: b.dots }, t, 'run')],
  }));
  cards.push({
    id: 'majpent1',
    name: 'Major pentatonic · pattern 1',
    tag: 'THE SLIDE-DOWN TRICK',
    tip: `Physically the same shape as minor box 2 — but the root is now the lowest-E dot. Equivalently: take minor box 1 and slide it 3 frets DOWN and the identical fingering turns major. ${spell(t, t)} major pentatonic = ${spell(mod12(t + 9), t)} minor pentatonic, one shape, two names.`,
    diagrams: [buildDiagram(MAJ_PENT_BOX, t, 'run')],
  });
  cards.push({
    id: 'majroot6',
    name: 'Major scale · root-6 box',
    tag: 'FULL SCALE IN POSITION',
    tip: `All seven notes of ${spell(t, t)} major under one hand, wrapped around the E-shape barre chord. The relative minor (${spell(mod12(t + 9), t)}) lives in this exact box too — just treat the 6 as home.`,
    diagrams: [buildDiagram(MAJOR_ROOT6, t, 'run')],
  });
  cards.push({
    id: 'majroot5',
    name: 'Major scale · root-5 box',
    tag: 'FULL SCALE IN POSITION',
    tip: 'The same scale with its root on the A string, wrapped around the A-shape barre. Root-6 box + root-5 box = most of the neck covered.',
    diagrams: [buildDiagram(MAJOR_ROOT5, t, 'run')],
  });
  cards.push({
    id: 'minroot6',
    name: 'Natural minor · root-6 box',
    tag: 'FULL SCALE IN POSITION',
    tip: `${spell(t, t)} natural minor in one position — the minor pentatonic box 1 plus the 2 and ♭6. Hear how the two extra colours darken the box.`,
    diagrams: [buildDiagram(MINOR_ROOT6, t, 'run')],
  });
  cards.push({
    id: 'bassminpent',
    name: 'Minor pentatonic · bass',
    tag: 'GUITAR & BASS SHARE THIS',
    tip: 'A bass is tuned like the guitar’s four lowest strings, so the bottom four strings of every guitar box transfer to bass 1:1 — same frets, same fingers. Learn it once, own it on both instruments.',
    diagrams: [buildDiagram(BASS_MIN_PENT, t, 'run')],
  });
  cards.push({
    id: 'bassmajpent',
    name: 'Major pentatonic · bass',
    tag: 'GUITAR & BASS SHARE THIS',
    tip: 'The major pentatonic box on four strings — country, gospel and Motown bass lines live in here. Same shape works on the guitar’s bottom four strings.',
    diagrams: [buildDiagram(BASS_MAJ_PENT, t, 'run')],
  });
  return cards;
}

// ---------- CAGED: five grips, one system ----------

// The five open-chord grips as movable major shapes. Each carries the barre it
// needs when it leaves the nut; in its "home" position the barre falls on the
// nut and disappears (see buildDiagram), so C major renders as the open C grip.
const CAGED_SHAPES: Array<{ id: string; letter: string; rootStr: string; spec: FretShapeSpec; tip: string }> = [
  { id: 'cagC', letter: 'C', rootStr: 'A', tip: 'The open-C grip made movable: your ring finger carries the root on the A string, index bars where the nut used to be. The stretch buys you the sweetest, most open-sounding voicing of the five.',
    spec: { inst: 'guitar', anchorS: 1, anchorF: 3, mutes: [0], barres: [{ f: 0, s0: 1, s1: 5 }], dots: [
      { s: 1, f: 3, role: 'R' }, { s: 2, f: 2, role: '3' }, { s: 3, f: 0, role: '5' }, { s: 4, f: 1, role: 'R' }, { s: 5, f: 0, role: '3' },
    ] } },
  { id: 'cagA', letter: 'A', rootStr: 'A', tip: 'Root under the barre on the A string; the ring finger (or three fingers) stacks the 5–R–3 column two frets up. With the E shape, this is the workhorse barre chord.',
    spec: { inst: 'guitar', anchorS: 1, anchorF: 0, mutes: [0], barres: [{ f: 0, s0: 1, s1: 5 }], dots: [
      { s: 1, f: 0, role: 'R' }, { s: 2, f: 2, role: '5' }, { s: 3, f: 2, role: 'R' }, { s: 4, f: 2, role: '3' }, { s: 5, f: 0, role: '5' },
    ] } },
  { id: 'cagG', letter: 'G', rootStr: 'E', tip: 'The open-G grip. Players rarely barre all of it — grab the bass side (root + 3rd) or the top three strings. Its root on the low E is the SAME fret where the E shape’s scale box lives.',
    spec: { inst: 'guitar', anchorS: 0, anchorF: 3, barres: [{ f: 0, s0: 0, s1: 5 }], dots: [
      { s: 0, f: 3, role: 'R' }, { s: 1, f: 2, role: '3' }, { s: 2, f: 0, role: '5' }, { s: 3, f: 0, role: 'R' }, { s: 4, f: 0, role: '3' }, { s: 5, f: 3, role: 'R' },
    ] } },
  { id: 'cagE', letter: 'E', rootStr: 'E', tip: 'The king of barre shapes: index flat across the whole fret, roots on both E strings and the octave on the D string. If you learn one movable grip, learn this one.',
    spec: { inst: 'guitar', anchorS: 0, anchorF: 0, barres: [{ f: 0, s0: 0, s1: 5 }], dots: [
      { s: 0, f: 0, role: 'R' }, { s: 1, f: 2, role: '5' }, { s: 2, f: 2, role: 'R' }, { s: 3, f: 1, role: '3' }, { s: 4, f: 0, role: '5' }, { s: 5, f: 0, role: 'R' },
    ] } },
  { id: 'cagD', letter: 'D', rootStr: 'D', tip: 'The treble triangle: root on the D string, melody note (the 3rd) on top. Perfect for chord stabs and double-stop fills high on the neck.',
    spec: { inst: 'guitar', anchorS: 2, anchorF: 0, mutes: [0, 1], barres: [{ f: 0, s0: 2, s1: 5 }], dots: [
      { s: 2, f: 0, role: 'R' }, { s: 3, f: 2, role: '5' }, { s: 4, f: 3, role: 'R' }, { s: 5, f: 2, role: '3' },
    ] } },
];

function cagedCards(t: number): FretCard[] {
  const key = spell(t, t);
  const built = CAGED_SHAPES.map((c) => ({ ...c, d: buildDiagram(c.spec, t, 'chord') }));
  const cards: FretCard[] = built.map((c) => ({
    id: c.id,
    name: `${c.letter} shape · ${key} major`,
    tag: c.d.startFret === 0 ? `ROOT ON ${c.rootStr} · OPEN` : `ROOT ON ${c.rootStr} · FRET ${c.d.startFret}`,
    tip: c.tip,
    diagrams: [c.d],
  }));
  const orderedDiagrams = [...built].sort((a, b) => a.d.startFret - b.d.startFret)
    .map((c) => ({ ...c.d, name: `${c.letter} shape` }));
  cards.push({
    id: 'cagmap',
    name: `The CAGED map of ${key}`,
    tag: 'HOW TO APPLY IT',
    tip: `One chord, five doors — ${key} major everywhere on the neck, in this order low to high (then the cycle repeats an octave up). Where one shape ends, the next begins: the C shape's top notes are the A shape's bottom notes, and so on through C→A→G→E→D. Apply it three ways: (1) grab whichever shape is nearest instead of jumping down the neck; (2) each shape is an anchor for its scale box (Fretboard Boxes tab) — chord under the fingers, scale around it; (3) play the same chord through all five shapes in time to hear one harmony climb the register.`,
    diagrams: orderedDiagrams,
  });
  return cards;
}

// ---------- tab registry ----------

export const FRET_TABS = ['Fretboard Boxes', 'CAGED'];

export function fretTab(tab: string, tonicPc: number): { intro: string; cards: FretCard[] } {
  const key = spell(tonicPc, tonicPc);
  if (tab === 'Fretboard Boxes') {
    return {
      intro: `The neck in hand-sized sections. Each card is one position — a dotted box you can play without moving your hand — anchored to ${key}: change key up top and every box slides to the right fret. Orange is the root. Learn one box deeply, then join its neighbours; the five pentatonic boxes tile the entire fretboard. Tap a diagram to hear it.`,
      cards: boxesCards(tonicPc),
    };
  }
  if (tab === 'CAGED') {
    return {
      intro: `The five open grips every guitarist knows — C, A, G, E, D — are secretly one system. Slide any grip up the neck (your index finger barring where the nut used to be) and it still plays a major chord; the five shapes chain together so ${key} major lives in five positions that tile the whole fretboard. Diagrams below are anchored to ${key} — the dark bar is the barre. Tap to strum.`,
      cards: cagedCards(tonicPc),
    };
  }
  return { intro: '', cards: [] };
}
