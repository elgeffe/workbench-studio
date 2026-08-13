// Learn-mode view. This is where the studio's theory lives: the jazz-harmony
// curriculum, the jazz and classical chord palettes that used to be styles of
// the chord workshop, rhythm theory, bassline moves and song-structure
// timelines — plus the subtab row that navigates them.
//
// The tool tabs build; this tab explains. Anything longer than a one-line hint
// belongs on this side of the line.
import {
  INT, SUF, MAJOR, DIA_TRI, DIA_SEV, ROMAN, ROMAN7, FN, FNCOLOR, FNTINT,
  type Chord,
} from '../engine/constants';
import { mod12, spell, cname, gPcs } from '../engine/theory';
import {
  jazzChapters, SONG_FORMS, quickProgDefs, cadenceDefs, classicalProgDefs,
  jzBorrowDefs, jzSecondaryDefs,
  type ChordDef, type JazzChapter, type FormKind,
} from '../engine/data';
import { RHYTHM_CONCEPTS } from '../engine/drums';
import { BASS_TRICKS } from '../engine/bass';
import type { WorkbenchStore, LearnTab, PracticeDrill } from '../store.svelte';
import type { PaletteChip } from './types';

// Build a chord from a curriculum row, relative to the current tonic.
function jc(s: WorkbenchStore, iv: number, q: string, opts: Partial<ChordDef> = {}): Chord {
  const r = mod12(s.tonicPc + iv);
  const intervals = opts.intervals || INT[q];
  const name = opts.name || spell(r, s.tonicPc, s.scale) + (SUF[q] !== undefined ? SUF[q] : '');
  const ch: Chord = { rootPc: r, intervals, name, fn: opts.fn || 'T' };
  if (opts.midis) ch.midis = opts.midis.map((m) => m + s.tonicPc);
  return ch;
}

export function buildLearn(s: WorkbenchStore) {
  const t = s.tonicPc;

  const JZ = jazzChapters(t, s.scale);
  const jzi = Math.min(s.jazzCh || 0, JZ.length - 1);
  const jazzNav = JZ.map((c, i) => ({ name: c.name, tag: c.tag, i, border: i === jzi ? '#c2562e' : '#cbb792', bg: i === jzi ? '#fbeede' : '#f6efe0', fg: i === jzi ? '#c2562e' : '#5c4a30' }));
  const jzc: JazzChapter = JZ[jzi];
  const jazzBlocks = jzc.blocks.map((b) => {
    if (b.kind === 'chords') {
      const items = (b.rows || []).map((r) => { const ch = jc(s, r.iv, r.q || 'maj', r); return { name: ch.name!, sub: r.sub || gPcs(ch).map((p) => spell(p, t, s.scale)).join(' '), fnColor: FNCOLOR[ch.fn || 'T'], tint: FNTINT[ch.fn || 'T'], ch }; });
      return { kind: 'chords' as const, items };
    }
    if (b.kind === 'seq') {
      const chs = (b.rows || []).map((r) => jc(s, r.iv, r.q || 'maj', r));
      const items = chs.map((ch, i) => ({ name: (b.rows || [])[i].name || ch.name!, sub: gPcs(ch).map((p) => spell(p, t, s.scale)).join(' '), fnColor: FNCOLOR[ch.fn || 'T'], tint: FNTINT[ch.fn || 'T'], ch }));
      return { kind: 'seq' as const, label: b.label || '', items, seqChords: chs };
    }
    return { kind: b.kind, text: b.text || '' };
  });

  // ---- the jazz palette (was Workshop → JAZZ) ----
  // Diatonic sevenths, the borrowed chords and the secondary dominants, each
  // playable and each placeable into the progression you are building next
  // door. Learning them here and using them there is the same set of chips.
  const jzDia: PaletteChip[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const r = (t + MAJOR[d]) % 12, q = DIA_SEV[d], fn = FN[d], nm = cname(r, q, t, s.scale);
    const ch: Chord = { rootPc: r, intervals: INT[q], name: nm, roman: ROMAN7[d], fn };
    return { name: nm, roman: ROMAN7[d], fnColor: FNCOLOR[fn], tint: FNTINT[fn], border: FNCOLOR[fn], ch };
  });
  const jzBorrow: PaletteChip[] = jzBorrowDefs.map((d) => {
    const r = (t + d.iv) % 12, nm = cname(r, d.q!, t, s.scale);
    const ch: Chord = { rootPc: r, intervals: INT[d.q!], name: nm, roman: d.roman, fn: 'S' };
    return { name: nm, roman: d.roman || '', ch };
  });
  const jzSecondary: PaletteChip[] = jzSecondaryDefs.map((d) => {
    const r = (t + d.iv) % 12, nm = cname(r, 'dom7', t, s.scale);
    const ch: Chord = { rootPc: r, intervals: INT.dom7, name: nm, roman: 'V7/' + d.tgt, fn: 'D' };
    return { name: nm, roman: 'V7/' + d.tgt, ch };
  });
  const quickProgs = quickProgDefs(t, s.scale).map((p) => ({ name: p.name, defs: p.defs }));

  // ---- the classical palette (was Workshop → CLASSICAL) ----
  const clDia: PaletteChip[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const r = (t + MAJOR[d]) % 12, q = DIA_TRI[d], fn = FN[d], nm = cname(r, q, t, s.scale);
    const ch: Chord = { rootPc: r, intervals: INT[q], name: nm, roman: ROMAN[d], fn };
    return { name: nm, roman: ROMAN[d], fnColor: FNCOLOR[fn], tint: FNTINT[fn], border: FNCOLOR[fn], ch };
  });
  const cadences = cadenceDefs.map((c) => ({ name: c.name, defs: c.defs }));
  const clProgs = classicalProgDefs.map((p) => ({ name: p.name, defs: p.defs }));

  const learnTabs = ([
    ['theory', 'Theory'], ['rhythm', 'Rhythm'], ['bass', 'Bass'],
    ['patterns', 'Patterns'], ['practice', 'Practice'], ['forms', 'Forms'],
  ] as Array<[LearnTab, string]>).map(([id, name]) => ({
    id, name, border: s.learnTab === id ? '#c2562e' : '#cbb792', bg: s.learnTab === id ? '#c2562e' : '#f6efe0', fg: s.learnTab === id ? '#fff' : '#5c4a30',
  }));
  const drillChips = ([['ear', 'Ear training'], ['reading', 'Sight reading']] as Array<[PracticeDrill, string]>).map(([id, name]) => ({
    id, name, border: s.practiceDrill === id ? '#3f6b5f' : '#cbb792', bg: s.practiceDrill === id ? '#3f6b5f' : '#f6efe0', fg: s.practiceDrill === id ? '#fff' : '#5c4a30',
  }));

  // A one-line subject for each area, shown under the Learn eyebrow.
  const learnSubject: Record<LearnTab, string> = {
    theory: 'harmony you can play — in ' + spell(t, t, s.scale),
    rhythm: 'how drum patterns are built',
    bass: 'the moves behind a bassline',
    patterns: 'scales, arpeggios and shapes on the neck',
    practice: 'drills for the ear and the eye',
    forms: 'how songs are built in time',
  };

  return {
    jazzNav, jazzBlocks, jazzTitle: jzc.name, jazzIntro: jzc.intro, jazzTag: jzc.tag,
    // subtabs
    learnTabs, drillChips, learnSubject: learnSubject[s.learnTab],
    learnTabTheory: s.learnTab === 'theory', learnTabRhythm: s.learnTab === 'rhythm',
    learnTabBass: s.learnTab === 'bass', learnTabPatterns: s.learnTab === 'patterns',
    learnTabPractice: s.learnTab === 'practice', learnTabForms: s.learnTab === 'forms',
    drillEar: s.practiceDrill === 'ear', drillReading: s.practiceDrill === 'reading',
    // the teaching palettes
    jzDia, jzBorrow, jzSecondary, quickProgs, clDia, cadences, clProgs,
    bassTricks: BASS_TRICKS.map((tk) => ({ id: tk.id, name: tk.name, why: tk.why })),
    rhythmConcepts: RHYTHM_CONCEPTS.map((c) => ({ id: c.id, name: c.name, tag: c.tag, text: c.text, bpm: c.bpm })),
    // song structures: proportional timeline blocks, colour-coded by section kind
    songForms: SONG_FORMS.map((f) => {
      const total = f.sections.reduce((acc, x) => acc + x.n, 0);
      const kindColor: Record<FormKind, string> = {
        intro: '#b3a68f', verse: '#3f6b5f', pre: '#97a59c', chorus: '#c2562e',
        bridge: '#b07d23', solo: '#7a5ea8', vamp: '#46617c', free: '#8b6f8e', outro: '#b3a68f',
      };
      return {
        id: f.id, name: f.name, genre: f.genre, dur: f.dur, text: f.text, listen: f.listen,
        sections: f.sections.map((sec) => ({ label: sec.l, pct: ((sec.n / total) * 100).toFixed(2), bg: kindColor[sec.k] })),
      };
    }),
    formKindLegend: [
      { name: 'VERSE / HEAD', color: '#3f6b5f' }, { name: 'PRE / BUILD', color: '#97a59c' }, { name: 'CHORUS / DROP', color: '#c2562e' },
      { name: 'BRIDGE / CUE', color: '#b07d23' }, { name: 'SOLO', color: '#7a5ea8' }, { name: 'VAMP / GROOVE', color: '#46617c' },
      { name: 'FREE', color: '#8b6f8e' }, { name: 'INTRO / OUTRO', color: '#b3a68f' },
    ],
  };
}
