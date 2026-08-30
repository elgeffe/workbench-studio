// Bass view builders: the genre → groove shelf, the user's line, and the
// annotated library cards.
//
// There is one bassline — `bassLine` — and the 119-groove library is a shelf of
// starting points that load into it. So this builds two different things from
// the same data: the *editable* line (Bass tab) and the *annotated* grooves
// with their descriptions, which read as reference and live in Learn → Bass.
import {
  BASS_PATTERNS, BASS_ROLE_META, BASS_TOK_LABEL,
  bassRole, bassPatternsIn, bassBarNotes, bassChordIndexAt, bassFallbackChord, midiOctave,
  type BassStep, type BassRole,
} from '../engine/bass';
// The count of a 16-step bar is the same one the drum grid rules itself with:
// one bar, "1 e & a 2 e & a…", whichever part is written on it.
import { DRUM_COUNT as BAR_COUNT } from '../engine/drums';
import { FNCOLOR, FNTINT } from '../engine/constants';
import { cname, spell, isRest } from '../engine/theory';
import { genreById } from '../engine/genres';
import { genreShelves, itemChips } from './picker';
import type { WorkbenchStore } from '../store.svelte';

// The step row is 16 equal cells with fixed gaps between them, and a wider one
// on each beat. The note row and the chord band below repeat that geometry so a
// note sits under its own step: same gaps, and a band takes its share of the
// cells by flex-grow plus the gaps it swallows as its basis. Anything looser
// drifts by a few pixels a beat, which is exactly the reading these rows exist
// to make unambiguous.
const STEP_GAP = 3;
const BEAT_GAP = 5;

/** Sizing for a band covering `n` steps from `start`, in the step row's units. */
function band(start: number, n: number) {
  let basis = (n - 1) * STEP_GAP;
  for (let k = start + 1; k < start + n; k++) if (k % 4 === 0) basis += BEAT_GAP;
  return { grow: n, basis, ml: start > 0 && start % 4 === 0 ? BEAT_GAP : 0 };
}

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

  // Is the line being tracked through a live bar right now? The playhead only
  // moves while the transport is rolling, so everything below reads either the
  // bar in the speakers or, stopped, the bar the loop would play next.
  const live = s.jzPlaying && s.bsStep >= 0;

  const bassLineCells = s.bassLine.map((cell, st) => {
    const hot = live && s.bsStep === st;
    const ring = hot ? '0 0 0 2px #c2562e' : '';
    if (!cell) {
      return { label: '', hot, bg: st % 4 === 0 ? '#e7d9ba' : '#f0e6cf', fg: '#c9ba98', shadow: ring || 'none' };
    }
    const color = BASS_ROLE_META[bassRole(cell as BassStep)].color;
    const lip = 'inset 0 -2px 0 rgba(0,0,0,.12)';
    return { label: cell.g ? '×' : BASS_TOK_LABEL[cell.d!], hot, bg: color, fg: '#fff', shadow: ring ? ring + ',' + lip : lip };
  });
  const bassLineEmpty = s.bassLine.every((c) => !c);

  // What the summary bar says is in the line: the groove it came from, marked
  // once you have moved anything, so it never claims a library pattern is
  // loaded when what is actually playing is your edit of it.
  const seed = BASS_PATTERNS.find((p) => p.id === s.bassSeedId);
  const bassLineName = bassLineEmpty ? 'empty'
    : seed ? seed.name + (s.bassEdited ? ' · edited' : '')
    : 'your line';

  // ---- what the line actually plays, tracked through the bar ----
  //
  // A cell holds a degree, which is what lets one line follow every change —
  // and is also why the grid alone cannot answer "so which note is that, here?".
  // These three rows answer it: the pitch each step resolves to, the change it
  // resolves against, and, while the loop runs, the one sounding right now.

  // Where in the bar each step falls, spoken the way it is counted. Without it
  // a written line is sixteen squares; with it, step 7 is "2a".
  const bassBarCount = BAR_COUNT.map((c, st) => ({
    c, s: st,
    strong: st % 4 === 0,
    hot: live && s.bsStep === st,
    ml: st > 0 && st % 4 === 0 ? BEAT_GAP : 0,
  }));

  const half = s.chordSlot === 'half';
  // With no changes loaded the line resolves against the key's own dom7 — the
  // same fallback a cell tap previews with — so the row reads rather than blanks.
  const chs = s.jzChanges.length ? s.jzChanges : [bassFallbackChord(s.tonicPc, s.scale)];
  // Playing, the bar carries the change it was laid out over. Stopped, the tab
  // shows what the loop would play from here: the change selected in Chords.
  const first = live ? s.bsFirst : Math.max(s.jzSel, 0);
  const notes = bassBarNotes(s.bassLine, chs, first, half, s.tonicPc);
  const chName = (i: number) => chs[i].name || (isRest(chs[i]) ? '' : cname(chs[i].rootPc, chs[i].quality || 'maj', s.tonicPc, s.scale));

  // A bass note rings on through the rests behind it, so the row underlines the
  // steps it is still sounding over: what you see is how long you hold it.
  const held = new Map<number, string>();
  notes.forEach((n) => {
    if (!n.l || n.midi === undefined) return;
    const color = BASS_ROLE_META[bassRole({ s: n.s, d: n.d })].color;
    // Fainter where it is only ringing on, so the struck step still reads first.
    for (let k = 1; k < n.l && n.s + k < 16; k++) held.set(n.s + k, color + '66');
  });

  const bassNoteCells = notes.map((n) => {
    const hot = live && s.bsStep === n.s;
    const role: BassRole | null = n.g || n.d ? bassRole({ s: n.s, d: n.d, g: n.g }) : null;
    return {
      s: n.s, hot,
      // Struck here, or still ringing from a step behind — nothing at all under
      // a rest that follows a note already let go.
      tail: n.midi !== undefined ? BASS_ROLE_META[role!].color : held.get(n.s) || 'transparent',
      // Ghosts have no pitch to name — they are the drum in the bassline.
      name: n.g ? '×' : n.midi === undefined ? '' : spell(n.midi, s.tonicPc, s.scale),
      // The octave separates a root from the octave pop above it, which spell
      // the same. Small, because it is the second question you ask of a note.
      oct: n.midi === undefined ? '' : String(midiOctave(n.midi)),
      fg: hot ? '#2c261d' : role ? BASS_ROLE_META[role].color : '#c9ba98',
      bg: hot ? '#fbeede' : 'transparent',
      bd: hot ? '#c2562e' : 'transparent',
      ml: n.s > 0 && n.s % 4 === 0 ? BEAT_GAP : 0,
    };
  });

  // The changes as bands under the steps they own, so a half-bar setting shows
  // the bar splitting where it splits. Two slots on the same chord are one
  // band, because that is one change held — not two of them.
  const spanLen = half ? 8 : 16;
  const spans: Array<{ start: number; n: number; i: number }> = [];
  for (let start = 0; start < 16; start += spanLen) {
    const i = bassChordIndexAt(start, first, half, chs.length);
    const prev = spans[spans.length - 1];
    if (prev && prev.i === i) prev.n += spanLen;
    else spans.push({ start, n: spanLen, i });
  }
  const bassChordSpans = spans.map(({ start, n, i }) => {
    const fn = chs[i].fn || 'T';
    // Silence gets a band of its own: the line drops out under it, and a band
    // that looked like a chord would say the opposite.
    const rest = isRest(chs[i]);
    const color = rest ? '#8a7350' : FNCOLOR[fn];
    const hot = live && s.bsStep >= start && s.bsStep < start + n;
    return {
      start, name: chName(i), ...band(start, n),
      bg: hot ? '#f0e6cf' : rest ? '#e6dcc4' : FNTINT[fn],
      border: color,
      shadow: hot ? '0 0 0 2px ' + color : 'none',
    };
  });

  // What the bar sits over, for the hint below: the change (or the silence)
  // under its first half, and under its second when the two differ.
  const firstIdx = bassChordIndexAt(0, first, half, chs.length);
  const secondIdx = bassChordIndexAt(8, first, half, chs.length);
  const twoBands = half && chs.length > 1 && secondIdx !== firstIdx;
  const overName = (i: number) => (isRest(chs[i]) ? 'a silent slot' : chName(i));
  const barSilent = isRest(chs[firstIdx]) && (!twoBands || isRest(chs[secondIdx]));

  // The readout: the note under the playhead — which is the last one struck,
  // since a bass note rings on through the rests that follow it.
  const sounding = live ? notes.filter((n) => n.s <= s.bsStep && (n.d || n.g)).pop() : undefined;
  const soundingRole = sounding ? bassRole({ s: sounding.s, d: sounding.d, g: sounding.g }) : null;

  return {
    bassTrackOn: !bassLineEmpty,
    bassBarCount, bassNoteCells, bassChordSpans,
    bassNowOn: !!sounding,
    bassNowCount: sounding ? BAR_COUNT[sounding.s] : '',
    bassNowNote: sounding ? (sounding.g ? 'ghost' : spell(sounding.midi!, s.tonicPc, s.scale) + midiOctave(sounding.midi!)) : '',
    bassNowDeg: sounding && sounding.d ? BASS_TOK_LABEL[sounding.d] : '',
    bassNowRole: soundingRole ? BASS_ROLE_META[soundingRole].name : '',
    bassNowColor: soundingRole ? BASS_ROLE_META[soundingRole].color : '#7a6b50',
    bassNowChord: sounding ? chName(sounding.chordIdx) : '',
    bassNowStep: sounding ? sounding.s + 1 : 0,
    // Stopped, say where the row's reading comes from rather than leaving it
    // looking like something that should be moving and isn't.
    bassTrackHint: s.jzChanges.length
      ? 'Over ' + overName(firstIdx) + (twoBands ? ' then ' + overName(secondIdx) : '') + ' — '
        + (barSilent ? 'the line sits this bar out; the time still passes under it.' : 'press PLAY to follow the bar as it goes.')
      : 'No changes loaded — these are the notes over ' + chName(0) + ', the key’s own 7th chord.',
    bassShelves, bassGenreChips, bassGrooves,
    bassLegend: (Object.keys(BASS_ROLE_META) as BassRole[]).map((r) => ({ name: BASS_ROLE_META[r].name, color: BASS_ROLE_META[r].color })),
    bassGenreName: genreById(s.bassGenre).name, bassCount: BASS_PATTERNS.length,
    bassGenreTotal: new Set(BASS_PATTERNS.map((p) => p.genre)).size,
    bassLineCells, bassLineEmpty, bassLineName,
    bassPickerOpen: s.picker === 'bass',
  };
}
