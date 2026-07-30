// Bass view builders: the genre → groove shelf, the user's line, and the
// annotated library cards.
//
// There is one bassline — `bassLine` — and the 119-groove library is a shelf of
// starting points that load into it. So this builds two different things from
// the same data: the *editable* line (Bass tab) and the *annotated* grooves
// with their descriptions, which read as reference and live in Learn → Bass.
import {
  BASS_PATTERNS, BASS_ROLE_META, BASS_TOK_LABEL,
  bassRole, bassPatternsIn, type BassStep, type BassRole,
} from '../engine/bass';
import { genreById } from '../engine/genres';
import { genreShelves, itemChips } from './picker';
import type { WorkbenchStore } from '../store.svelte';

/** 16 cells, one per 16th: coloured by each note's role, faint for rests. */
function stepCells(stepAt: (s: number) => BassStep | undefined) {
  return Array.from({ length: 16 }, (_, st) => {
    const step = stepAt(st);
    if (!step) return { label: '', bg: st % 4 === 0 ? '#e7d9ba' : '#f0e6cf', fg: 'transparent' };
    const color = BASS_ROLE_META[bassRole(step)].color;
    return { label: step.g ? '×' : BASS_TOK_LABEL[step.d!], bg: color, fg: '#fff' };
  });
}

export function buildBass(s: WorkbenchStore) {
  const bassShelves = genreShelves(BASS_PATTERNS, (p) => p.genre, s.bassGenre);
  const bassInGenre = bassPatternsIn(s.bassGenre);
  // The chip for the groove the line was loaded from stays marked — until you
  // edit it, at which point the line is yours and no library pattern is "on".
  const bassGenreChips = itemChips(bassInGenre, s.bassEdited ? null : s.bassSeedId, (p) => ({ name: p.name }));

  // The annotated library, for Learn: what each groove is and why it works.
  const bassGrooves = bassInGenre.map((p) => ({
    id: p.id, name: p.name, tag: p.tag, tip: p.tip,
    cells: stepCells((st) => p.steps.find((x) => x.s === st)),
    loaded: p.id === s.bassSeedId,
  }));

  const bassLineCells = s.bassLine.map((cell, st) => {
    if (!cell) return { label: '', bg: st % 4 === 0 ? '#e7d9ba' : '#f0e6cf', fg: '#c9ba98' };
    const color = BASS_ROLE_META[bassRole(cell as BassStep)].color;
    return { label: cell.g ? '×' : BASS_TOK_LABEL[cell.d!], bg: color, fg: '#fff' };
  });
  const bassLineEmpty = s.bassLine.every((c) => !c);

  // What the summary bar says is in the line: the groove it came from, marked
  // once you have moved anything, so it never claims a library pattern is
  // loaded when what is actually playing is your edit of it.
  const seed = BASS_PATTERNS.find((p) => p.id === s.bassSeedId);
  const bassLineName = bassLineEmpty ? 'empty'
    : seed ? seed.name + (s.bassEdited ? ' · edited' : '')
    : 'your line';

  return {
    bassShelves, bassGenreChips, bassGrooves,
    bassLegend: (Object.keys(BASS_ROLE_META) as BassRole[]).map((r) => ({ name: BASS_ROLE_META[r].name, color: BASS_ROLE_META[r].color })),
    bassGenreName: genreById(s.bassGenre).name, bassCount: BASS_PATTERNS.length,
    bassGenreTotal: new Set(BASS_PATTERNS.map((p) => p.genre)).size,
    bassLineCells, bassLineEmpty, bassLineName,
    bassPickerOpen: s.picker === 'bass',
    // The part mix, which is what the two toggles have always been — they just
    // used to be buried in the bass palette and gated on the style switch.
    mixChordsBg: s.bassChordsOn ? '#3f6b5f' : '#f6efe0', mixChordsFg: s.bassChordsOn ? '#fff' : '#5c4a30',
    mixBassBg: s.bassOn ? '#3f6b5f' : '#f6efe0', mixBassFg: s.bassOn ? '#fff' : '#5c4a30',
  };
}
