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
  phrase?: number[]; // diagram-less cards (piano): semitone offsets, played over the tonic
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

// ---------- Soloing: where major and minor pentatonic meet ----------

// Membership colours for the overlap diagrams: notes only in the minor
// pentatonic, only in the major pentatonic, or shared by both.
const MIN_ONLY = '#46617c', MAJ_ONLY = '#b07d23', SHARED = '#3f6b5f';

// The hybrid box: minor pentatonic box 1 and the major pentatonic laid over
// each other in ONE position at the root fret.
const HYBRID_BOX: FretShapeSpec = { inst: 'guitar', anchorS: 0, anchorF: 0, dots: [
  { s: 0, f: 0, role: 'R' }, { s: 0, f: 2, role: '2', color: MAJ_ONLY }, { s: 0, f: 3, role: '♭3', color: MIN_ONLY }, { s: 0, f: 4, role: '3', color: MAJ_ONLY },
  { s: 1, f: 0, role: '4', color: MIN_ONLY }, { s: 1, f: 2, role: '5', color: SHARED }, { s: 1, f: 4, role: '6', color: MAJ_ONLY },
  { s: 2, f: 0, role: '♭7', color: MIN_ONLY }, { s: 2, f: 2, role: 'R' }, { s: 2, f: 4, role: '2', color: MAJ_ONLY },
  { s: 3, f: 0, role: '♭3', color: MIN_ONLY }, { s: 3, f: 1, role: '3', color: MAJ_ONLY }, { s: 3, f: 2, role: '4', color: MIN_ONLY },
  { s: 4, f: 0, role: '5', color: SHARED }, { s: 4, f: 2, role: '6', color: MAJ_ONLY }, { s: 4, f: 3, role: '♭7', color: MIN_ONLY },
  { s: 5, f: 0, role: 'R' }, { s: 5, f: 2, role: '2', color: MAJ_ONLY }, { s: 5, f: 3, role: '♭3', color: MIN_ONLY }, { s: 5, f: 4, role: '3', color: MAJ_ONLY },
] };
// …and the same overlap on a bass (identical to the guitar's four lowest strings).
const HYBRID_BASS: FretShapeSpec = { inst: 'bass', anchorS: 0, anchorF: 0, dots: [
  { s: 0, f: 0, role: 'R' }, { s: 0, f: 2, role: '2', color: MAJ_ONLY }, { s: 0, f: 3, role: '♭3', color: MIN_ONLY }, { s: 0, f: 4, role: '3', color: MAJ_ONLY },
  { s: 1, f: 0, role: '4', color: MIN_ONLY }, { s: 1, f: 2, role: '5', color: SHARED }, { s: 1, f: 4, role: '6', color: MAJ_ONLY },
  { s: 2, f: 0, role: '♭7', color: MIN_ONLY }, { s: 2, f: 2, role: 'R' }, { s: 2, f: 4, role: '2', color: MAJ_ONLY },
  { s: 3, f: 0, role: '♭3', color: MIN_ONLY }, { s: 3, f: 1, role: '3', color: MAJ_ONLY }, { s: 3, f: 2, role: '4', color: MIN_ONLY },
] };

// Minor pentatonic box 1 shape with the roles read as the MAJOR pentatonic —
// the "same fingering, three frets down" half of the famous trick.
const BOX1_AS_MAJOR: FretShapeSpec = { inst: 'guitar', anchorS: 0, anchorF: 3, dots: [
  { s: 0, f: 0, role: '6' }, { s: 0, f: 3, role: 'R' },
  { s: 1, f: 0, role: '2' }, { s: 1, f: 2, role: '3' },
  { s: 2, f: 0, role: '5' }, { s: 2, f: 2, role: '6' },
  { s: 3, f: 0, role: 'R' }, { s: 3, f: 2, role: '2' },
  { s: 4, f: 0, role: '3' }, { s: 4, f: 3, role: '5' },
  { s: 5, f: 0, role: '6' }, { s: 5, f: 3, role: 'R' },
] };

// Blues scale in box-1 position: the minor pentatonic plus the two ♭5 dots.
const BLUES_BOX: FretShapeSpec = { inst: 'guitar', anchorS: 0, anchorF: 0, dots: [
  { s: 0, f: 0, role: 'R' }, { s: 0, f: 3, role: '♭3' },
  { s: 1, f: 0, role: '4' }, { s: 1, f: 1, role: '♭5' }, { s: 1, f: 2, role: '5' },
  { s: 2, f: 0, role: '♭7' }, { s: 2, f: 2, role: 'R' },
  { s: 3, f: 0, role: '♭3' }, { s: 3, f: 2, role: '4' }, { s: 3, f: 3, role: '♭5' },
  { s: 4, f: 0, role: '5' }, { s: 4, f: 3, role: '♭7' },
  { s: 5, f: 0, role: 'R' }, { s: 5, f: 3, role: '♭3' },
] };

function soloCards(t: number): FretCard[] {
  const key = spell(t, t);
  const rootFret = mod12(t - 4) || 12; // key root on the low E string
  const majFret = rootFret - 3 < 0 ? rootFret + 9 : rootFret - 3;
  return [
    { id: 'hybrid',
      name: 'The hybrid box · major ∩ minor',
      tag: 'THE JOHN MAYER MOVE',
      tip: `The trick you half-remember, exactly: in ${key} the MINOR pentatonic box sits AT the root fret (${rootFret}) — tough and bluesy — and the identical fingering THREE FRETS DOWN (${majFret}) is the MAJOR pentatonic — sweet and singing. Right at the root fret they overlap into this hybrid: green notes belong to both, gold are the major (sweet) side, blue the minor (blues) side. Rule of thumb: lean major over major/I chords, lean minor for grit, resolve on the green notes.`,
      diagrams: [buildDiagram(HYBRID_BOX, t, 'run')] },
    { id: 'sameshape',
      name: 'Same shape, two sounds',
      tag: 'SLIDE 3 FRETS',
      tip: `Proof by fingering: the left diagram is the minor pentatonic at fret ${rootFret}; the right is the SAME shape moved to fret ${majFret}, where it becomes ${key} major pentatonic (the root moves to a different dot). One box memorised, two complete sounds — switch mid-solo when the band moves from moody to bright.`,
      diagrams: [
        buildDiagram({ inst: 'guitar', anchorS: 0, anchorF: 0, dots: PENT_BOXES[0].dots }, t, 'run', `minor · fret ${rootFret}`),
        buildDiagram(BOX1_AS_MAJOR, t, 'run', `major · fret ${majFret}`),
      ] },
    { id: 'bluesbox',
      name: 'Blues scale · box 1',
      tag: 'THE BLUE NOTE',
      tip: 'Minor pentatonic plus the ♭5 “blue note”. Best practice: bend or slide THROUGH the ♭5, never camp on it — it’s a passing sting that resolves to the 4 or the 5. This is the vocabulary of every blues and rock solo since the ’50s.',
      diagrams: [buildDiagram(BLUES_BOX, t, 'run')] },
    { id: 'hybridbass',
      name: 'The hybrid box on bass',
      tag: 'GUITAR & BASS SHARE THIS',
      tip: 'A bass is the guitar’s four lowest strings, so the whole major/minor overlap transfers 1:1 — same frets, same colours. For fills, bassists live on the gold 6 and blue ♭7 around the root; land back on the R when the ONE comes around.',
      diagrams: [buildDiagram(HYBRID_BASS, t, 'run')] },
    { id: 'pnotarget',
      name: 'Piano · chord-tone targeting',
      tag: 'SOLO LIKE A HORN',
      tip: 'The strongest solo notes are the chord’s own 3rd and 7th. Practise: left hand holds a root+7th shell, right hand runs the scale but LANDS on 3 or 7 at every bar line. This phrase climbs the chord tones and falls back by step — hear how every landing sounds inevitable.',
      diagrams: [], phrase: [0, 4, 7, 11, 12, 11, 9, 7, 5, 4] },
    { id: 'pnofourths',
      name: 'Piano · pentatonic in fourths',
      tag: 'THE HERBIE MOVE',
      tip: 'Run the minor pentatonic but skip every other note, so the line moves in stacked fourths — instantly modern, funky and open. A favourite of Herbie Hancock and every neo-soul keys player. Fingers 1–2 leapfrog up the keyboard.',
      diagrams: [], phrase: [0, 5, 3, 7, 5, 10, 7, 12] },
    { id: 'pnocrush',
      name: 'Piano · the blues crush',
      tag: 'GRACE NOTES',
      tip: 'Piano can’t bend strings — it crushes instead: strike the ♭3 and slide instantly to the 3 (fingers 2→3 on adjacent keys). This phrase seasons a major line with two crushes; it’s the pianist’s translation of a guitar bend.',
      diagrams: [], phrase: [0, 3, 4, 7, 9, 10, 9, 7, 3, 4, 0] },
  ];
}

// ---------- Barre chords: the E and A families ----------

// Every barre chord is one of two families: root on the low E (the E shape)
// or root on the A (the A shape). Four qualities each — the fingers move,
// the barre stays. All movable: at the nut these are open chords, not barres.
const BARRE_E = (dots: ShapeDot[]): FretShapeSpec => (
  { inst: 'guitar', anchorS: 0, anchorF: 0, movable: true, barres: [{ f: 0, s0: 0, s1: 5 }], dots });
const BARRE_A = (dots: ShapeDot[]): FretShapeSpec => (
  { inst: 'guitar', anchorS: 1, anchorF: 0, movable: true, mutes: [0], barres: [{ f: 0, s0: 1, s1: 5 }], dots });

const BARRE_SHAPES: Array<{ id: string; name: string; tag: string; tip: string; e: FretShapeSpec; a: FretShapeSpec }> = [
  { id: 'barmaj', name: 'Major barre', tag: 'THE TWO FAMILIES',
    tip: 'Root on the low E (E shape) or on the A string (A shape) — every major barre chord is one of these two. Learn the root notes of both bass strings and you can grab any major chord anywhere: just pick whichever shape is closer.',
    e: BARRE_E([{ s: 0, f: 0, role: 'R' }, { s: 1, f: 2, role: '5' }, { s: 2, f: 2, role: 'R' }, { s: 3, f: 1, role: '3' }, { s: 4, f: 0, role: '5' }, { s: 5, f: 0, role: 'R' }]),
    a: BARRE_A([{ s: 1, f: 0, role: 'R' }, { s: 2, f: 2, role: '5' }, { s: 3, f: 2, role: 'R' }, { s: 4, f: 2, role: '3' }, { s: 5, f: 0, role: '5' }]) },
  { id: 'barmin', name: 'Minor barre', tag: 'ONE FINGER LESS',
    tip: 'One semitone from major: the 3rd drops onto the barre and becomes ♭3. In the E shape your middle finger simply lifts off; in the A shape the ring-finger column shrinks by one. Feel how one note flips the whole mood.',
    e: BARRE_E([{ s: 0, f: 0, role: 'R' }, { s: 1, f: 2, role: '5' }, { s: 2, f: 2, role: 'R' }, { s: 3, f: 0, role: '♭3' }, { s: 4, f: 0, role: '5' }, { s: 5, f: 0, role: 'R' }]),
    a: BARRE_A([{ s: 1, f: 0, role: 'R' }, { s: 2, f: 2, role: '5' }, { s: 3, f: 2, role: 'R' }, { s: 4, f: 1, role: '♭3' }, { s: 5, f: 0, role: '5' }]) },
  { id: 'bardom7', name: 'Dominant 7 barre', tag: 'LIFT THE OCTAVE',
    tip: 'Start from the major barre and lift the octave off the D (E shape) or G (A shape) string — the ♭7 hiding under the barre is exposed. Blues rhythm playing is basically this chord marched around the neck.',
    e: BARRE_E([{ s: 0, f: 0, role: 'R' }, { s: 1, f: 2, role: '5' }, { s: 2, f: 0, role: '♭7' }, { s: 3, f: 1, role: '3' }, { s: 4, f: 0, role: '5' }, { s: 5, f: 0, role: 'R' }]),
    a: BARRE_A([{ s: 1, f: 0, role: 'R' }, { s: 2, f: 2, role: '5' }, { s: 3, f: 0, role: '♭7' }, { s: 4, f: 2, role: '3' }, { s: 5, f: 0, role: '5' }]) },
  { id: 'barmin7', name: 'Minor 7 barre', tag: 'THE LAZY LUXURY',
    tip: 'Minor and dominant tricks combined: ♭3 AND ♭7 both live on or under the barre, so the E shape needs just two fingers besides the bar. The most-used comping grip in funk and soul — light, quick, easy to move.',
    e: BARRE_E([{ s: 0, f: 0, role: 'R' }, { s: 1, f: 2, role: '5' }, { s: 2, f: 0, role: '♭7' }, { s: 3, f: 0, role: '♭3' }, { s: 4, f: 0, role: '5' }, { s: 5, f: 0, role: 'R' }]),
    a: BARRE_A([{ s: 1, f: 0, role: 'R' }, { s: 2, f: 2, role: '5' }, { s: 3, f: 0, role: '♭7' }, { s: 4, f: 1, role: '♭3' }, { s: 5, f: 0, role: '5' }]) },
];

function barreCards(t: number): FretCard[] {
  return BARRE_SHAPES.map((b) => {
    const e = buildDiagram(b.e, t, 'chord');
    const a = buildDiagram(b.a, t, 'chord');
    return {
      id: b.id, name: b.name, tag: b.tag, tip: b.tip,
      diagrams: [
        { ...e, name: `E shape · fret ${e.startFret}` },
        { ...a, name: `A shape · fret ${a.startFret}` },
      ],
    };
  });
}

// ---------- tab registry ----------

export const FRET_TABS = ['Fretboard Boxes', 'CAGED', 'Soloing', 'Barre Chords'];

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
  if (tab === 'Soloing') {
    return {
      intro: `Best-practice soloing patterns for guitar, bass and piano in ${key} — built around the spot where the major and minor pentatonics overlap. In the overlap diagrams the colours mean membership: green = in both scales, gold = major-only (sweet), blue = minor-only (blues). Tap a diagram or phrase to hear it.`,
      cards: soloCards(tonicPc),
    };
  }
  if (tab === 'Barre Chords') {
    return {
      intro: `Every barre chord in ${key}, visually: the dark bar is your index finger laid flat, the dots are the other fingers. Technique first — thumb LOW behind the neck, index rolled slightly onto its bony edge, elbow tucked in; practise around frets 5–7 where the string tension is friendliest, and squeeze only as hard as the clean note needs. Then learn the four qualities in both families below. Tap to strum.`,
      cards: barreCards(tonicPc),
    };
  }
  return { intro: '', cards: [] };
}
