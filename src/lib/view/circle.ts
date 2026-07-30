// Circle-of-fifths wheel geometry and colouring — a pure function of the
// tonic, the maj/min view, and the fifths/fourths direction.
import { CIRCLE } from '../engine/constants';
import { spell } from '../engine/theory';
import type { Wedge } from './types';

export function buildCircle(t: number, circleView: 'maj' | 'min', circleDir: 'fifths' | 'fourths'):
  { wedges: Wedge[]; circleLabel: string; circleHint: string } {
  const isMinView = circleView === 'min';
  const isFourths = circleDir === 'fourths';
  let order = CIRCLE.slice();
  if (isFourths) order = [order[0], ...order.slice(1).reverse()];
  // Two fixed concentric rings, reference-wheel style: major keys outside,
  // each key's relative minor directly inside it. The whole wheel rotates so
  // the active key sits at 12 o'clock, and the 7 diatonic chords of that key
  // light up as one contiguous tinted block with roman numerals:
  // red = major chords, green = minor chords, blue = the diminished one.
  // Colour is reserved for the key: everything outside the arc stays the plain
  // parchment of the wheel, so the seven spokes carry all of the emphasis.
  const cx = 180, cy = 180, rO = 158, rB = 110, rC = 68;
  const rMajName = 131, rMinName = 88;
  // Numerals sit a fixed distance *above* their name rather than one step
  // further out along the spoke. Radial placement reads fine at 12 o'clock but
  // puts the numeral beside the name out at 3 and 9 o'clock, where it collides
  // with it — and now that a key spans seven spokes, both rings reach there.
  // The rise is centre-to-centre and both labels are centred on their point, so
  // it has to clear half a name (18px outer, 12.5px inner) plus half a numeral
  // before any daylight shows between them.
  const numRise = 18, numRiseMin = 15;
  const pol = (r: number, deg: number): [number, number] => { const a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const band = (r1: number, r0: number, a0: number, a1: number): string => {
    const p1 = pol(r1, a0), p2 = pol(r1, a1), p3 = pol(r0, a1), p4 = pol(r0, a0);
    return `M${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A${r1} ${r1} 0 0 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} L${p3[0].toFixed(1)} ${p3[1].toFixed(1)} A${r0} ${r0} 0 0 0 ${p4[0].toFixed(1)} ${p4[1].toFixed(1)} Z`;
  };
  const pct = (p: [number, number]): [string, string] => [(p[0] / 360 * 100).toFixed(2), (p[1] / 360 * 100).toFixed(2)];
  const activeMajPc = isMinView ? (t + 3) % 12 : t;
  const tonicIdx = order.indexOf(activeMajPc);
  const M = activeMajPc;
  const m = (M + 9) % 12; // the relative minor of this wheel's major key
  // Outer ring: all seven degrees of M major, each sitting on its own root.
  // On a circle of fifths those seven roots are seven *adjacent* spokes —
  // IV I V ii vi iii vii° — so a key reads as one unbroken arc. The minor
  // degrees belong out here on their roots too; hiding them a ring in left
  // the whole ii/iii/vi/vii° side of the wheel blank.
  const majNum: Record<number, string> = {
    [(M + 5) % 12]: 'IV', [M]: 'I', [(M + 7) % 12]: 'V',
    [(M + 2) % 12]: 'ii', [(M + 9) % 12]: 'vi', [(M + 4) % 12]: 'iii', [(M + 11) % 12]: 'vii°',
  };
  // Inner ring: the same seven notes read from the relative minor and numbered
  // in its terms, so the two rings are two readings of one key rather than one
  // reading split in half. Also seven adjacent spokes, sitting three steps
  // anticlockwise of the outer arc — which is why the two arcs stagger.
  // The numeral names the chord built on that wedge's root within the relative
  // minor, not the quality of the minor key printed on the wedge: III·VI·VII
  // are major triads (red) even though the wedge itself reads "cm", "fm", "gm".
  const minNum: Record<number, string> = {
    [m]: 'i', [(m + 2) % 12]: 'II°', [(m + 3) % 12]: 'III', [(m + 5) % 12]: 'iv',
    [(m + 7) % 12]: 'v', [(m + 8) % 12]: 'VI', [(m + 10) % 12]: 'VII',
  };
  // A numeral already carries its chord quality: uppercase major, lowercase
  // minor, ° diminished. That is what picks the wedge colour.
  const quality = (n: string): 'maj' | 'min' | 'dim' =>
    n.includes('°') ? 'dim' : n === n.toUpperCase() ? 'maj' : 'min';
  const wedges: Wedge[] = [];
  order.forEach((pc, i) => {
    const c = (i - tonicIdx) * 30, a0 = c - 15, a1 = c + 15;
    const mnPc = (pc + 9) % 12; // relative minor sharing this spoke
    // outer wedge — the major key
    const oNum = majNum[pc] || '';
    let oFill = '#f3e8ce', oStroke = '#f1e7d3', oSw = '2', oName = '#8a7a5c', oNumC = '#8f3c1c';
    if (oNum === 'I' && !isMinView) { oFill = '#c2562e'; oStroke = '#8f3c1c'; oSw = '3'; oName = '#fff'; oNumC = '#ffd9c6'; }
    else if (oNum === 'vii°') { oFill = '#ccdbe9'; oStroke = '#a9c3da'; oName = '#46617c'; oNumC = '#46617c'; }
    else if (quality(oNum) === 'min' && oNum) { oFill = '#bcd8c8'; oStroke = '#a3c4b1'; oName = '#2d5c48'; oNumC = '#2d5c48'; }
    else if (oNum) { oFill = '#eec49f'; oStroke = '#e0ab7e'; oName = '#8f3c1c'; }
    const op = pol(rMajName, c);
    const onp = pct(op), oup = pct([op[0], op[1] - numRise]);
    wedges.push({
      d: band(rO, rB, a0, a1), fill: oFill, stroke: oStroke, strokeW: oSw,
      name: spell(pc, t), numeral: oNum, nameColor: oName, numColor: oNumC, nameSize: '18px',
      nameL: onp[0], nameT: onp[1], numL: oup[0], numT: oup[1], pc, ring: 'maj',
    });
    // inner wedge — its relative minor
    const iNum = minNum[mnPc] || '';
    let iFill = '#ebdfc1', iStroke = '#f1e7d3', iSw = '2', iName = '#95835f', iNumC = '#2d5c48';
    if (iNum === 'i' && isMinView) { iFill = '#3f6b5f'; iStroke = '#2d5045'; iSw = '3'; iName = '#fff'; iNumC = '#cdeeda'; }
    else if (iNum.includes('°')) { iFill = '#ccdbe9'; iStroke = '#a9c3da'; iName = '#46617c'; iNumC = '#46617c'; }
    else if (quality(iNum) === 'maj' && iNum) { iFill = '#eec49f'; iStroke = '#e0ab7e'; iName = '#8f3c1c'; iNumC = '#8f3c1c'; }
    else if (iNum) { iFill = '#bcd8c8'; iStroke = '#a3c4b1'; iName = '#2d5c48'; }
    const ip = pol(rMinName, c);
    const inp = pct(ip), iup = pct([ip[0], ip[1] - numRiseMin]);
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
    ? `Seven adjacent spokes are one key. The inner ring numbers them for ${spell(t, t)} minor — i·iv·v minor (green), III·VI·VII major (red), II° diminished (blue) — and the outer ring reads the same seven from its relative major, ${spell(M, t)}.`
    : `Seven adjacent spokes are one key. The outer ring numbers them for ${spell(t, t)} major — I·IV·V major (red), ii·iii·vi minor (green), vii° diminished (blue) — and the inner ring reads the same seven from its relative minor, ${spell(m, t)} minor.`;
  return { wedges, circleLabel, circleHint: dirHint + ' ' + famHint };
}
