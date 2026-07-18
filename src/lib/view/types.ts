// View-model shapes shared by the view builders and the components.
import type { Chord } from '../engine/constants';
import type { DiatonicChord } from '../engine/theory';
import type { Pattern } from '../engine/data';

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
export interface FretCell { pc: number; showLit: boolean; dot: boolean; barreThru: boolean; litOpacity: string; finger: string; dotColor: string; note: string; bg: string; glow: string }
export interface FretRow { label: string; openDot: { color: string } | null; cells: FretCell[] }
export interface PianoKey { left: string; width: string; note: string; bg: string; fg: string; dot: boolean; dotColor: string; finger: string; pc: number }

/** What the instruments should light up right now (chord or pattern driven). */
export interface LitInfo { root: number; litSet: Set<number>; chordSet: Set<number>; dropSet: Set<number>; activePat: Pattern }

/** The standard on/off selector-chip trio used across the app's chip rows. */
export function selChip(on: boolean, onColor = '#3f6b5f'): { border: string; bg: string; fg: string } {
  return { border: on ? onColor : '#cbb792', bg: on ? onColor : '#f6efe0', fg: on ? '#fff' : '#5c4a30' };
}
