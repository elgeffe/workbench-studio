// Chords-tab view builders: the genre → progression picker, the diatonic and
// colour palettes, the progression strip, the chord inspector and the
// what-next suggestion.
//
// The teaching palettes that used to sit beside these behind a style switch —
// jazz (secondary dominants, borrowed chords) and classical (period
// progressions, cadences, figured bass) — now live in `view/learn.ts`, which
// is where their explanatory copy belongs. What is left here is the tool: the
// chords of the key, and everything you can do to one you have placed.
import { INT, FNCOLOR, FNTINT, FNNAME, type Chord, type Fn } from '../engine/constants';
import { spell, cname, gI, subsFor, colorChordDefs, jzNotes, jFamily, invChord } from '../engine/theory';
import { genreDefs } from '../engine/data';
import { genreById } from '../engine/genres';
import { genreShelves, itemChips } from './picker';
import type { WorkbenchStore } from '../store.svelte';
import type { ChordChip, PaletteChip } from './types';

export function buildChords(s: WorkbenchStore) {
  const t = s.tonicPc;

  // Starting points: the same family → genre shelf the drum machine and the
  // bass workbench use, then the progressions inside the chosen genre.
  const GEN = genreDefs();
  const wsGenreId = GEN.some((g) => g.genre === s.wsGenre) ? s.wsGenre : GEN[0].genre;
  const wsGenreName = genreById(wsGenreId).name;
  const wsShelves = genreShelves(
    GEN.flatMap((g) => g.items.map((p) => ({ genre: g.genre, p }))),
    (x) => x.genre,
    wsGenreId,
  );
  const wsPatterns = (GEN.find((g) => g.genre === wsGenreId)?.items || []).map((p) => ({ name: p.name, defs: p.chords, tempo: p.tempo }));
  const wsPatternChips = itemChips(
    wsPatterns.map((p, i) => ({ id: String(i), ...p })),
    wsPatterns.findIndex((p) => p.name === s.wsProgName) >= 0 ? String(wsPatterns.findIndex((p) => p.name === s.wsProgName)) : null,
    (p) => ({ name: p.name, meta: p.tempo ? String(p.tempo) : undefined }),
  );
  const wsProgCount = GEN.reduce((n, g) => n + g.items.length, 0);

  // colour / borrowed chords
  const colorChords: PaletteChip[] = colorChordDefs(t).map((c) => {
    const nm = cname(c.rootPc, c.quality, t);
    const ch: Chord = { rootPc: c.rootPc, intervals: INT[c.quality], name: nm, roman: c.roman, fn: 'S' };
    return { name: nm, roman: c.roman, ch };
  });

  // the progression strip
  const jzChangesView: ChordChip[] = s.jzChanges.map((c, i) => {
    const playing = s.jzStep === i, selected = !s.jzPlaying && s.jzSel === i, hl = playing || selected;
    const fc = FNCOLOR[c.fn || 'T'];
    return { name: c.name || '', roman: c.roman || '', notes: jzNotes(c, s.jzVoicing, t), fnColor: fc, border: fc, bg: hl ? '#fbeede' : FNTINT[c.fn || 'T'], shadow: hl ? '0 0 0 2px ' + fc : '0 1px 2px rgba(60,40,16,.12)', ch: c };
  });

  // ---- the inspector for the selected chord ----
  // Every move is offered on every chord now. It used to be rationed by the
  // style switch — inversions only in CLASSICAL, ii–V insertion only in JAZZ —
  // which meant the tool was less capable than the sum of its modes for no
  // musical reason. The teaching of *when* to reach for each one is Learn's
  // job; here they are simply available.
  let exploreOpen = false, selName = '', selRoman = '';
  let extChips: Array<{ label: string; ch: Chord }> = [];
  let invChips: Array<{ label: string; ch: Chord }> = [];
  let buildSubs: Array<{ name: string; tag: string; why: string; fnColor: string; ch: Chord }> = [];
  if (s.jzSel >= 0 && s.jzChanges[s.jzSel]) {
    const sc = s.jzChanges[s.jzSel];
    exploreOpen = true; selName = sc.name || ''; selRoman = sc.roman || '';
    const R = sc.rootPc, fam = jFamily(gI(sc)), sp = spell(R, t);
    const mkExt = (suf: string, ints: number[]) => ({ label: sp + suf, ch: { rootPc: R, intervals: ints, name: sp + suf, fn: sc.fn, roman: sc.roman } as Chord });
    // Colour options follow the chord's family, plus the two plain triads so
    // you can always get back to the bones of it.
    if (fam === 'maj') extChips = [mkExt('', INT.maj), mkExt('maj7', INT.maj7), mkExt('maj9', INT.maj9), mkExt('maj13', INT.maj13)];
    else if (fam === 'min') extChips = [mkExt('m', INT.min), mkExt('m7', INT.min7), mkExt('m9', INT.min9), mkExt('m13', INT.min13)];
    else if (fam === 'dom') extChips = [mkExt('', INT.maj), mkExt('7', INT.dom7), mkExt('9', INT.dom9), mkExt('13', INT.dom13), mkExt('7♭9', [0, 4, 7, 10, 13]), mkExt('7♯9', [0, 4, 7, 10, 15])];
    else extChips = [mkExt('°', INT.dim), mkExt('ø7', INT.m7b5), mkExt('ø9', INT.m9b5)];
    invChips = [{ label: 'Root', w: 0 }, { label: '1st', w: 1 }, { label: '2nd', w: 2 }].map((o) => ({ label: o.label, ch: invChord(sc, o.w, t) }));
    buildSubs = subsFor(sc, t).map((sub) => ({ name: sub.name!, tag: sub.tag, why: sub.why, fnColor: FNCOLOR[sub.fn || 'T'], ch: { rootPc: sub.rootPc, intervals: sub.intervals, name: sub.name, roman: sub.roman, fn: sub.fn } as Chord }));
  }

  // what to reach for next
  const filled = s.jzChanges;
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

  return {
    wsShelves, wsPatterns, wsPatternChips, wsGenreName, wsProgCount,
    // What the summary bar says is loaded: the starting point's name once one
    // has been picked, otherwise how many this genre's shelf holds.
    wsProgSummary: s.wsProgName || `${wsPatterns.length} to choose from`,
    wsGenreCount: GEN.length, colorChords,
    wsPickerOpen: s.picker === 'progressions',
    jzChangesView, jzEmpty: s.jzChanges.length === 0,
    exploreOpen, selName, selRoman, extChips, invChips, buildSubs,
    suggestText,
  };
}
