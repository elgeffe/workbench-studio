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
