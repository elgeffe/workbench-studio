// Patterns-mode view: category tabs, the pattern library chips, chord-shape
// polygons on the circle of fifths, and the fret-diagram tabs.
import { INT, SUF, CIRCLE, QLABEL, type Chord } from '../engine/constants';
import { mod12, spell } from '../engine/theory';
import { patternDefs, PAT_GROUPS, PAT_SHAPES_TAB, PAT_TABS } from '../engine/data';
import { FRET_TABS, fretTab } from '../engine/fretpatterns';
import type { WorkbenchStore } from '../store.svelte';
import type { LitInfo } from './types';

export function buildPatterns(s: WorkbenchStore, activePat: LitInfo['activePat']) {
  const t = s.tonicPc;
  const patCat = PAT_TABS.includes(s.patCat) ? s.patCat : 'Scales';
  const patShapesTab = patCat === PAT_SHAPES_TAB;
  const patFretTab = FRET_TABS.includes(patCat);
  const patLibTab = PAT_GROUPS.includes(patCat);
  const patFret = patFretTab ? fretTab(patCat, t) : { intro: '', cards: [] };
  const patCatChips = PAT_TABS.map((g) => ({ name: g, border: g === patCat ? '#3f6b5f' : '#cbb792', bg: g === patCat ? '#3f6b5f' : '#f6efe0', fg: g === patCat ? '#fff' : '#5c4a30' }));
  const patChips = patternDefs().filter((p) => p.group === patCat).map((p) => ({ id: p.id, name: p.name, weight: p.id === activePat.id ? '700' : '500', border: p.id === activePat.id ? '#c2562e' : '#cbb792', bg: p.id === activePat.id ? '#fbeede' : '#f6efe0' }));
  const patInt = activePat.int || activePat.scaleInt || [];
  const patChordName = spell(t, t) + SUF[activePat.chord];
  const patDegrees = (activePat.deg || []).map((d, i) => ({ d, color: i === 0 ? '#fff' : '#2c261d', bg: i === 0 ? '#c2562e' : '#efe2c8', bd: i === 0 ? '#c2562e' : '#cbb792' }));
  const patNotes = patInt.map((i) => spell((t + i) % 12, t)).join('  ·  ');
  const patSeqNotes = activePat.seq ? activePat.seq.map((o) => spell(t + o, t)).join(' ') : '';

  // chord shapes on the circle of fifths: each quality draws one fixed
  // polygon; changing the root only rotates it. The wheel is rotated so the
  // current tonic sits at 12 o'clock, so a quality's shape never moves.
  const shapeTonicIdx = CIRCLE.indexOf(t);
  const shapePos = (pc: number): [number, number] => {
    const a = ((CIRCLE.indexOf(pc) - shapeTonicIdx) * 30 - 90) * Math.PI / 180;
    return [40 + 30 * Math.cos(a), 40 + 30 * Math.sin(a)];
  };
  const shapeLabels: Record<string, string> = { ...QLABEL, sus4: 'Sus 4', dom7: 'Dominant 7', m7b5: 'Half-dim', dim7: 'Diminished 7' };
  const patShapes = ['maj', 'min', 'dim', 'aug', 'sus4', 'maj7', 'min7', 'dom7', 'm7b5', 'dim7'].map((q) => {
    const pcs = INT[q].map((i) => mod12(t + i));
    const pset = new Set(pcs);
    const dots = CIRCLE.map((pc) => {
      const [x, y] = shapePos(pc);
      return { x: +x.toFixed(1), y: +y.toFixed(1), on: pset.has(pc), root: pc === t };
    });
    const poly = pcs.map((pc) => shapePos(pc).map((n) => n.toFixed(1)).join(',')).join(' ');
    const nm = spell(t, t) + SUF[q];
    const ch: Chord = { rootPc: t, intervals: INT[q], name: nm, fn: 'T' };
    return { q, name: nm, label: shapeLabels[q] || q, poly, dots, ch };
  });

  return {
    patLibTab, patNotes,
    view: {
      patCatChips, patChips, patName: activePat.name, patTip: activePat.tip, patChordName, activePat,
      patDegrees, patSeqNotes, patHasSeq: !!activePat.seq, patShapes, patShapesTab,
      patFretTab, patFretIntro: patFret.intro, patFretCards: patFret.cards,
    },
  };
}
