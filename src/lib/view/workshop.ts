// Workshop-mode view builders: genre presets, chord palettes (jazz /
// classical / bass), the progression strip, the explore-selected panel and
// the what-next suggestion.
import {
  INT, MAJOR, DIA_TRI, DIA_SEV, ROMAN, ROMAN7, FN, FNCOLOR, FNTINT, FNNAME,
  type Chord, type Fn,
} from '../engine/constants';
import { spell, cname, gI, gPcs, subsFor, colorChordDefs, jzNotes, jFamily, invChord } from '../engine/theory';
import { genreDefs, quickProgDefs, cadenceDefs, classicalProgDefs, jzBorrowDefs, jzSecondaryDefs } from '../engine/data';
import {
  BASS_GROUPS, BASS_PATTERNS, BASS_TRICKS, BASS_ROLE_META, BASS_TOK_LABEL,
  bassRole, type BassStep, type BassRole,
} from '../engine/bass';
import type { WorkbenchStore } from '../store.svelte';
import type { ChordChip, PaletteChip } from './types';

export function buildWorkshop(s: WorkbenchStore) {
  const t = s.tonicPc;
  const ac = s.activeChord;

  // workshop genres
  const GEN = genreDefs();
  const gi = Math.min(s.wsGenre || 0, GEN.length - 1);
  const wsGenres = GEN.map((g, i) => ({ name: g.name, i, border: i === gi ? '#c2562e' : '#cbb792', bg: i === gi ? '#c2562e' : '#f6efe0', fg: i === gi ? '#fff' : '#5c4a30' }));
  const wsGenreName = GEN[gi].name;
  const wsPatterns = GEN[gi].items.map((p) => ({ name: p.name, defs: p.chords }));

  // color chords
  const colorChords: PaletteChip[] = colorChordDefs(t).map((c) => {
    const nm = cname(c.rootPc, c.quality, t);
    const ch: Chord = { rootPc: c.rootPc, intervals: INT[c.quality], name: nm, roman: c.roman, fn: 'S' };
    return { name: nm, roman: c.roman, ch };
  });

  // substitutions for active chord
  const subs = ac ? subsFor(ac, t).map((sub) => {
    const ch = { rootPc: sub.rootPc, intervals: sub.intervals, name: sub.name, roman: sub.roman, fn: sub.fn } as Chord;
    return { name: sub.name, tag: sub.tag, why: sub.why, fnColor: FNCOLOR[sub.fn || 'T'], notes: gPcs(ch).map((p) => spell(p, t)), ch };
  }) : [];

  // jazz build sandbox
  const jzChangesView: ChordChip[] = s.jzChanges.map((c, i) => {
    const playing = s.jzStep === i, selected = !s.jzPlaying && s.jzSel === i, hl = playing || selected;
    const fc = FNCOLOR[c.fn || 'T'];
    return { name: c.name || '', roman: c.roman || '', notes: jzNotes(c, s.jzVoicing, t), fnColor: fc, border: fc, bg: hl ? '#fbeede' : FNTINT[c.fn || 'T'], shadow: hl ? '0 0 0 2px ' + fc : '0 1px 2px rgba(60,40,16,.12)', ch: c };
  });
  const jzDia: PaletteChip[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const r = (t + MAJOR[d]) % 12, q = DIA_SEV[d], fn = FN[d], nm = cname(r, q, t);
    const ch: Chord = { rootPc: r, intervals: INT[q], name: nm, roman: ROMAN7[d], fn };
    return { name: nm, roman: ROMAN7[d], fnColor: FNCOLOR[fn], tint: FNTINT[fn], border: FNCOLOR[fn], ch };
  });
  const jzBorrow: PaletteChip[] = jzBorrowDefs.map((d) => {
    const r = (t + d.iv) % 12, nm = cname(r, d.q!, t);
    const ch: Chord = { rootPc: r, intervals: INT[d.q!], name: nm, roman: d.roman, fn: 'S' };
    return { name: nm, roman: d.roman || '', ch };
  });
  const jzSecondary: PaletteChip[] = jzSecondaryDefs.map((d) => {
    const r = (t + d.iv) % 12, nm = cname(r, 'dom7', t);
    const ch: Chord = { rootPc: r, intervals: INT.dom7, name: nm, roman: 'V7/' + d.tgt, fn: 'D' };
    return { name: nm, roman: 'V7/' + d.tgt, ch };
  });
  const quickProgs = quickProgDefs(t).map((p) => ({ name: p.name, defs: p.defs }));

  // classical palette
  const clDia: PaletteChip[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const r = (t + MAJOR[d]) % 12, q = DIA_TRI[d], fn = FN[d], nm = cname(r, q, t);
    const ch: Chord = { rootPc: r, intervals: INT[q], name: nm, roman: ROMAN[d], fn };
    return { name: nm, roman: ROMAN[d], fnColor: FNCOLOR[fn], tint: FNTINT[fn], border: FNCOLOR[fn], ch };
  });
  const cadences = cadenceDefs.map((c) => ({ name: c.name, defs: c.defs }));
  const clProgs = classicalProgDefs.map((p) => ({ name: p.name, defs: p.defs }));

  // bass workbench palette
  const bassGroupChips = BASS_GROUPS.map((g) => ({ name: g, border: g === s.bassGroup ? '#3f6b5f' : '#cbb792', bg: g === s.bassGroup ? '#3f6b5f' : '#f6efe0', fg: g === s.bassGroup ? '#fff' : '#5c4a30' }));
  const bassPats = BASS_PATTERNS.filter((p) => p.group === s.bassGroup).map((p) => {
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
  const bassTricks = BASS_TRICKS.map((tk) => ({ id: tk.id, name: tk.name, why: tk.why }));
  const bassActive = BASS_PATTERNS.find((p) => p.id === s.bassPatId);
  // Build-your-own line: the 16 editable cells, coloured like the pattern
  // previews, plus seed chips (the current group's grooves) to start from.
  const bassCustomSelected = s.bassPatId === 'custom';
  const bassCustomCells = s.bassCustom.map((cell, st) => {
    if (!cell) return { label: '', bg: st % 4 === 0 ? '#e7d9ba' : '#f0e6cf', fg: '#c9ba98' };
    const color = BASS_ROLE_META[bassRole(cell as BassStep)].color;
    return { label: cell.g ? '×' : BASS_TOK_LABEL[cell.d!], bg: color, fg: '#fff' };
  });
  const bassCustomEmpty = s.bassCustom.every((c) => !c);
  const bassSeedChips = BASS_PATTERNS.filter((p) => p.group === s.bassGroup).map((p) => ({ id: p.id, name: p.name }));

  // explore selected
  let exploreOpen = false, selName = '', selRoman = '', showIIV = false, showV = false;
  let extChips: Array<{ label: string; ch: Chord }> = [];
  let invChips: Array<{ label: string; ch: Chord }> = [];
  let buildSubs: Array<{ name: string; tag: string; why: string; fnColor: string; ch: Chord }> = [];
  if (s.jzSel >= 0 && s.jzChanges[s.jzSel]) {
    const sc = s.jzChanges[s.jzSel];
    exploreOpen = true; selName = sc.name || ''; selRoman = sc.roman || '';
    const R = sc.rootPc, fam = jFamily(gI(sc)), sp = spell(R, t);
    const mkExt = (suf: string, ints: number[]) => ({ label: sp + suf, ch: { rootPc: R, intervals: ints, name: sp + suf, fn: sc.fn, roman: sc.roman } as Chord });
    if (s.wsStyle === 'classical') {
      extChips = [mkExt('', INT.maj), mkExt('m', INT.min), mkExt('7', INT.dom7), mkExt('maj7', INT.maj7), mkExt('°', INT.dim)];
      invChips = [{ label: 'Root', w: 0 }, { label: '1st · 6', w: 1 }, { label: '2nd · 6/4', w: 2 }].map((o) => ({ label: o.label, ch: invChord(sc, o.w, t) }));
      showV = true;
    } else if (fam === 'maj') extChips = [mkExt('maj7', INT.maj7), mkExt('maj9', INT.maj9), mkExt('maj13', INT.maj13)];
    else if (fam === 'min') extChips = [mkExt('m7', INT.min7), mkExt('m9', INT.min9), mkExt('m13', INT.min13)];
    else if (fam === 'dom') extChips = [mkExt('7', INT.dom7), mkExt('9', INT.dom9), mkExt('13', INT.dom13), mkExt('7♭9', [0, 4, 7, 10, 13]), mkExt('7♯9', [0, 4, 7, 10, 15])];
    else extChips = [mkExt('ø7', INT.m7b5), mkExt('ø9', INT.m9b5)];
    if (s.wsStyle === 'jazz') showIIV = true;
    buildSubs = subsFor(sc, t).map((sub) => ({ name: sub.name!, tag: sub.tag, why: sub.why, fnColor: FNCOLOR[sub.fn || 'T'], ch: { rootPc: sub.rootPc, intervals: sub.intervals, name: sub.name, roman: sub.roman, fn: sub.fn } as Chord }));
  }

  // suggestion
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
    wsGenres, wsPatterns, wsGenreName, colorChords, subs,
    jzChangesView, jzEmpty: s.jzChanges.length === 0,
    jzDia, jzBorrow, jzSecondary, quickProgs,
    clDia, cadences, clProgs,
    bassGroupChips, bassPats, bassLegend, bassTricks,
    bassCustomCells, bassCustomSelected, bassCustomEmpty, bassSeedChips,
    bassActiveName: bassActive ? bassActive.name : bassCustomSelected ? 'Custom line' : 'none',
    exploreOpen, selName, selRoman, extChips, invChips, showIIV, showV, buildSubs,
    suggestText,
  };
}
