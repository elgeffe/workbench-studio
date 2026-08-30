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
import { spell, cname, gI, subsFor, colorChordDefs, jzNotes, jFamily, invChord, chordAlias, spellScale, prefFlat, mod12, isRest, REST_NAME } from '../engine/theory';
import { analyseChanges, keySpans, type AnalysedChord } from '../engine/keycenters';
import { chordScale, roleOf } from '../engine/chordscale';
import { genreDefs } from '../engine/data';
import { genreById } from '../engine/genres';
import { genreShelves, itemChips } from './picker';
import type { WorkbenchStore } from '../store.svelte';
import type { ChordChip, PaletteChip } from './types';

// Tonic / subdominant / dominant, from the analysed degree rather than from
// whatever was stamped on the chord when it was placed.
function degreeFn(a: AnalysedChord): Fn {
  const d = a.degree;
  if (a.family === 'dom' && d !== 7) return 'D'; // a secondary dominant is still a dominant
  if (a.mode === 'major') {
    if (d === 7 || d === 11) return 'D';
    if (d === 2 || d === 5) return 'S';
    return 'T';
  }
  if (d === 7 || d === 11 || d === 10) return 'D';
  if (d === 2 || d === 5 || d === 8) return 'S';
  return 'T';
}

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
    const nm = cname(c.rootPc, c.quality, t, s.scale);
    const ch: Chord = { rootPc: c.rootPc, intervals: INT[c.quality], name: nm, roman: c.roman, fn: 'S' };
    return { name: nm, roman: c.roman, ch };
  });

  // ---- what key each chord is actually in ----
  //
  // The rest of this tab reads `s.tonicPc`, the one key the app is set to. A
  // transcribed chart does not have one key, so the strip is numbered from this
  // analysis instead: every chord gets the numeral it has in its *local* centre,
  // which is the only reading under which a page makes sense.
  // Rests are not analysed — silence belongs to no key — so the reading comes
  // back with one entry per sounding chord, each carrying the slot it came
  // from. Everything below looks its chord up by slot rather than by position.
  const analysis = analyseChanges(s.jzChanges, s.jzSwitchCost);
  const spans = keySpans(analysis);
  const bySlot = new Map<number, AnalysedChord>(analysis.map((a) => [a.i, a]));
  const keyOf = (a: AnalysedChord) =>
    spell(a.tonicPc, a.tonicPc, a.mode === 'minor' ? 'aeolian' : 'ionian') + (a.mode === 'minor' ? ' minor' : ' major');

  // the progression strip
  const jzChangesView: ChordChip[] = s.jzChanges.map((c, i) => {
    const playing = s.jzStep === i, selected = !s.jzPlaying && s.jzSel === i, hl = playing || selected;
    // A silent slot reads as a slot, not as a chord: no numeral, no notes, no
    // function colour — a dashed, muted card marked the way a chart marks it.
    if (isRest(c)) {
      return {
        name: REST_NAME, roman: 'REST', notes: 'silence',
        fnColor: '#8a7350', border: '#b3a68f',
        bg: hl ? '#f0e6cf' : '#e6dcc4',
        shadow: hl ? '0 0 0 2px #8a7350' : 'inset 0 0 0 1px rgba(138,115,80,.12)',
        ch: c, rest: true,
      };
    }
    const a = bySlot.get(i);
    // Function follows the analysed degree, so a chord borrowed from another key
    // is coloured by the job it does *there* rather than mislabelled here.
    const fn: Fn = a ? degreeFn(a) : (c.fn || 'T');
    const fc = FNCOLOR[fn];
    return {
      name: c.name || '', roman: a ? a.roman : (c.roman || ''),
      notes: jzNotes(c, s.jzVoicing, a ? a.tonicPc : t, a ? (a.mode === 'minor' ? 'aeolian' : 'ionian') : s.scale),
      fnColor: fc, border: fc,
      bg: hl ? '#fbeede' : FNTINT[fn],
      shadow: hl ? '0 0 0 2px ' + fc : '0 1px 2px rgba(60,40,16,.12)',
      ch: c,
      // Marks where a new centre begins, and chords that sit outside their key.
      newKey: !!a && a.starts && i > 0,
      outside: !!a && !a.fits,
    };
  });

  // The strip is grouped by key centre rather than laid out flat, so the label
  // above each run and the chords under it cannot drift apart when the strip
  // scrolls — the chips are variable-width, so a separately-scrolling ribbon
  // would only line up by accident.
  //
  // A run covers the slots the analysis gave it *plus* the silence around them:
  // rests carry no key, but they are still part of the phrase they interrupt,
  // so each run runs on until the next one begins. That way every slot lands in
  // exactly one group and a silent bar cannot fall off the end of the strip.
  const nSlots = s.jzChanges.length;
  const keyGroups = spans.length
    ? spans.map((sp, k) => {
      const start = k === 0 ? 0 : sp.start;
      const end = k === spans.length - 1 ? nSlots - 1 : spans[k + 1].start - 1;
      return {
        label: spell(sp.tonicPc, sp.tonicPc, sp.mode === 'minor' ? 'aeolian' : 'ionian') + (sp.mode === 'minor' ? ' minor' : ' major'),
        bg: sp.mode === 'minor' ? '#e2ece6' : '#f7e8d6',
        fg: sp.mode === 'minor' ? '#2d5c48' : '#8f3c1c',
        border: sp.mode === 'minor' ? '#a3c4b1' : '#e0ab7e',
        chips: jzChangesView.slice(start, end + 1).map((c, j) => ({ ...c, i: start + j })),
      };
    })
    // Nothing but silence: there is no key to label, so the run says so.
    : nSlots ? [{
      label: 'Silence', bg: '#ece3cc', fg: '#7a6b50', border: '#cbb792',
      chips: jzChangesView.map((c, i) => ({ ...c, i })),
    }] : [];

  // ---- the inspector for the selected chord ----
  // Every move is offered on every chord now. It used to be rationed by the
  // style switch — inversions only in CLASSICAL, ii–V insertion only in JAZZ —
  // which meant the tool was less capable than the sum of its modes for no
  // musical reason. The teaching of *when* to reach for each one is Learn's
  // job; here they are simply available.
  let exploreOpen = false, selName = '', selRoman = '';
  // What the selected chord *is*, in the key it actually belongs to: the centre,
  // its job there, the scale to play over it and why that scale. This is the
  // readout that replaces hunting around the wheel.
  let selKey = '', selRole = '', selScale = '', selScaleNotes: string[] = [];
  let selScaleWhy = '', selAlias: string | null = null, selOutside = false, selTyped = '';
  let extChips: Array<{ label: string; ch: Chord }> = [];
  let invChips: Array<{ label: string; ch: Chord }> = [];
  let buildSubs: Array<{ name: string; tag: string; why: string; fnColor: string; ch: Chord }> = [];
  // A selected rest opens the inspector too, but there is nothing to recolour,
  // invert or substitute — so it says what the slot is and leaves the moves out
  // rather than offering moves that would have to do nothing.
  let selRest = false;
  if (s.jzSel >= 0 && isRest(s.jzChanges[s.jzSel])) {
    exploreOpen = true; selRest = true; selName = REST_NAME; selRoman = 'REST';
  } else if (s.jzSel >= 0 && s.jzChanges[s.jzSel]) {
    const sc = s.jzChanges[s.jzSel];
    exploreOpen = true; selName = sc.name || ''; selRoman = sc.roman || '';
    const R = sc.rootPc, fam = jFamily(gI(sc));
    const a = bySlot.get(s.jzSel);
    // Everything about the selected chord is spelled in the key it actually
    // belongs to, not in whatever key the app is set to — otherwise Blue Bossa's
    // A♭7 offers you G♯7 the moment you open its colour chips.
    const keyTonic = a ? a.tonicPc : t;
    const keyScale = a ? (a.mode === 'minor' ? 'aeolian' : 'ionian') : s.scale;
    const sp = spell(R, keyTonic, keyScale);
    if (a) {
      const scale = chordScale(a, gI(sc));
      const flat = prefFlat(keyTonic, keyScale);
      selKey = keyOf(a);
      selRole = roleOf(a);
      selScale = sp + ' ' + scale.name;
      selScaleNotes = spellScale(mod12(a.tonicPc + a.degree), scale.intervals, flat);
      selScaleWhy = scale.why;
      selOutside = !a.fits;
    }
    selAlias = chordAlias(sc.name || '');
    selTyped = sc.name || '';
    const mkExt = (suf: string, ints: number[]) => ({ label: sp + suf, ch: { rootPc: R, intervals: ints, name: sp + suf, fn: sc.fn, roman: sc.roman } as Chord });
    // Colour options follow the chord's family, plus the two plain triads so
    // you can always get back to the bones of it.
    if (fam === 'maj') extChips = [mkExt('', INT.maj), mkExt('maj7', INT.maj7), mkExt('maj9', INT.maj9), mkExt('maj13', INT.maj13)];
    else if (fam === 'min') extChips = [mkExt('m', INT.min), mkExt('m7', INT.min7), mkExt('m9', INT.min9), mkExt('m13', INT.min13)];
    else if (fam === 'dom') extChips = [mkExt('', INT.maj), mkExt('7', INT.dom7), mkExt('9', INT.dom9), mkExt('13', INT.dom13), mkExt('7♭9', [0, 4, 7, 10, 13]), mkExt('7♯9', [0, 4, 7, 10, 15])];
    else extChips = [mkExt('°', INT.dim), mkExt('ø7', INT.m7b5), mkExt('ø9', INT.m9b5)];
    invChips = [{ label: 'Root', w: 0 }, { label: '1st', w: 1 }, { label: '2nd', w: 2 }].map((o) => ({ label: o.label, ch: invChord(sc, o.w, t, s.scale) }));
    buildSubs = subsFor(sc, t, s.scale).map((sub) => ({ name: sub.name!, tag: sub.tag, why: sub.why, fnColor: FNCOLOR[sub.fn || 'T'], ch: { rootPc: sub.rootPc, intervals: sub.intervals, name: sub.name, roman: sub.roman, fn: sub.fn } as Chord }));
  }

  // what to reach for next
  const filled = s.jzChanges;
  let suggestText = 'Tap a chord to pre-hear it; tap its + to place it. Functional flow: Tonic → Subdominant → Dominant → back to Tonic.';
  if (filled.length && isRest(filled[filled.length - 1])) {
    // After silence the ear has nothing left ringing, so nothing is owed: the
    // next chord is heard as a fresh start rather than as a resolution.
    suggestText = 'The progression ends on a silent slot — the ear resets across it, so anything can follow. Coming back to the chord it started on is what makes the hole sound intended rather than dropped.';
  } else if (filled.length) {
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
    exploreOpen, selRest, selName, selRoman, extChips, invChips, buildSubs,
    selKey, selRole, selScale, selScaleNotes, selScaleWhy, selAlias, selOutside, selTyped,
    keyGroups, jzEntry: s.jzEntry, jzEntryBad: s.jzEntryBad,
    keyCount: spans.length,
    keySummary: spans.length === 0 ? ''
      : spans.length === 1 ? 'One key throughout'
      : `${spans.length} key centres`,
    switchCost: s.jzSwitchCost,
    suggestText,
  };
}
