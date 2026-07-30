// Bass-tab view builders: the genre → groove picker, the pattern cards with
// their 16-step previews, the build-your-own grid and the part mix.
//
// The bassline used to be a mode of the chord workshop, which meant it only
// sounded while you were looking at it. It is a part of the band now: this
// builds the tab, and `store.barBass` lays the line down every bar whichever
// tab is open.
import {
  BASS_PATTERNS, BASS_ROLE_META, BASS_TOK_LABEL,
  bassRole, bassPatternsIn, type BassStep, type BassRole,
} from '../engine/bass';
import { genreById } from '../engine/genres';
import { genreShelves, itemChips } from './picker';
import type { WorkbenchStore } from '../store.svelte';

export function buildBass(s: WorkbenchStore) {
  const bassShelves = genreShelves(BASS_PATTERNS, (p) => p.genre, s.bassGenre);
  const bassInGenre = bassPatternsIn(s.bassGenre);
  const bassGenreChips = itemChips(bassInGenre, s.bassPatId, (p) => ({ name: p.name }));
  const bassPats = bassInGenre.map((p) => {
    const sel = p.id === s.bassPatId;
    // 16 cells, one per 16th: coloured by the note's role in the line, a
    // grey × for ghosts, faint for rests (downbeats slightly darker).
    const cells = Array.from({ length: 16 }, (_, st) => {
      const step = p.steps.find((x) => x.s === st);
      if (!step) return { label: '', bg: st % 4 === 0 ? '#e7d9ba' : '#f0e6cf', fg: 'transparent' };
      const color = BASS_ROLE_META[bassRole(step)].color;
      return { label: step.g ? '×' : BASS_TOK_LABEL[step.d!], bg: color, fg: '#fff' };
    });
    return { id: p.id, name: p.name, tag: p.tag, tip: p.tip, cells, border: sel ? '#c2562e' : '#e0cfae', bg: sel ? '#fbeede' : '#fbf6ea', shadow: sel ? '0 0 0 2px #c2562e' : 'none' };
  });
  const bassLegend = (Object.keys(BASS_ROLE_META) as BassRole[]).map((r) => ({ name: BASS_ROLE_META[r].name, color: BASS_ROLE_META[r].color }));
  const bassActive = BASS_PATTERNS.find((p) => p.id === s.bassPatId);

  // Build-your-own line: the 16 editable cells, coloured like the pattern
  // previews, plus seed chips (the current genre's grooves) to start from.
  const bassCustomSelected = s.bassPatId === 'custom';
  const bassCustomCells = s.bassCustom.map((cell, st) => {
    if (!cell) return { label: '', bg: st % 4 === 0 ? '#e7d9ba' : '#f0e6cf', fg: '#c9ba98' };
    const color = BASS_ROLE_META[bassRole(cell as BassStep)].color;
    return { label: cell.g ? '×' : BASS_TOK_LABEL[cell.d!], bg: color, fg: '#fff' };
  });
  const bassCustomEmpty = s.bassCustom.every((c) => !c);
  const bassSeedChips = bassInGenre.map((p) => ({ id: p.id, name: p.name }));

  return {
    bassShelves, bassGenreChips, bassPats, bassLegend,
    bassGenreName: genreById(s.bassGenre).name, bassCount: BASS_PATTERNS.length,
    bassGenreTotal: new Set(BASS_PATTERNS.map((p) => p.genre)).size,
    bassCustomCells, bassCustomSelected, bassCustomEmpty, bassSeedChips,
    bassActiveName: bassActive ? bassActive.name : bassCustomSelected ? 'Custom line' : 'none',
    bassPickerOpen: s.picker === 'bass',
    // The part mix, which is what the two toggles have always been — they just
    // used to be buried in the bass palette and gated on the style switch.
    mixChordsBg: s.bassChordsOn ? '#3f6b5f' : '#f6efe0', mixChordsFg: s.bassChordsOn ? '#fff' : '#5c4a30',
    mixBassBg: s.bassOn ? '#3f6b5f' : '#f6efe0', mixBassFg: s.bassOn ? '#fff' : '#5c4a30',
  };
}
