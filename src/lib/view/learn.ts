// Learn-mode view: the jazz-harmony curriculum chapters, the learn tabs,
// rhythm-theory concepts and the song-structure timelines.
import { INT, SUF, FNCOLOR, FNTINT, type Chord } from '../engine/constants';
import { mod12, spell, gPcs } from '../engine/theory';
import { jazzChapters, SONG_FORMS, type ChordDef, type JazzChapter, type FormKind } from '../engine/data';
import { RHYTHM_CONCEPTS } from '../engine/drums';
import type { WorkbenchStore, LearnTab } from '../store.svelte';

// Build a chord from a curriculum row, relative to the current tonic.
function jc(s: WorkbenchStore, iv: number, q: string, opts: Partial<ChordDef> = {}): Chord {
  const r = mod12(s.tonicPc + iv);
  const intervals = opts.intervals || INT[q];
  const name = opts.name || spell(r, s.tonicPc) + (SUF[q] !== undefined ? SUF[q] : '');
  const ch: Chord = { rootPc: r, intervals, name, fn: opts.fn || 'T' };
  if (opts.midis) ch.midis = opts.midis.map((m) => m + s.tonicPc);
  return ch;
}

export function buildLearn(s: WorkbenchStore) {
  const t = s.tonicPc;

  const JZ = jazzChapters(t);
  const jzi = Math.min(s.jazzCh || 0, JZ.length - 1);
  const jazzNav = JZ.map((c, i) => ({ name: c.name, tag: c.tag, i, border: i === jzi ? '#c2562e' : '#cbb792', bg: i === jzi ? '#fbeede' : '#f6efe0', fg: i === jzi ? '#c2562e' : '#5c4a30' }));
  const jzc: JazzChapter = JZ[jzi];
  const jazzBlocks = jzc.blocks.map((b) => {
    if (b.kind === 'chords') {
      const items = (b.rows || []).map((r) => { const ch = jc(s, r.iv, r.q || 'maj', r); return { name: ch.name!, sub: r.sub || gPcs(ch).map((p) => spell(p, t)).join(' '), fnColor: FNCOLOR[ch.fn || 'T'], tint: FNTINT[ch.fn || 'T'], ch }; });
      return { kind: 'chords' as const, items };
    }
    if (b.kind === 'seq') {
      const chs = (b.rows || []).map((r) => jc(s, r.iv, r.q || 'maj', r));
      const items = chs.map((ch, i) => ({ name: (b.rows || [])[i].name || ch.name!, sub: gPcs(ch).map((p) => spell(p, t)).join(' '), fnColor: FNCOLOR[ch.fn || 'T'], tint: FNTINT[ch.fn || 'T'], ch }));
      return { kind: 'seq' as const, label: b.label || '', items, seqChords: chs };
    }
    return { kind: b.kind, text: b.text || '' };
  });

  return {
    jazzNav, jazzBlocks, jazzTitle: jzc.name, jazzIntro: jzc.intro, jazzTag: jzc.tag,
    // learn tabs + rhythm theory
    learnTabHarmony: s.learnTab === 'harmony', learnTabRhythm: s.learnTab === 'rhythm', learnTabBass: s.learnTab === 'bass', learnTabForm: s.learnTab === 'form',
    learnTabs: ([['harmony', 'Harmony & Jazz'], ['rhythm', 'Rhythm & Drums'], ['bass', 'Bass'], ['form', 'Song Structures']] as Array<[LearnTab, string]>).map(([id, name]) => ({
      id, name, border: s.learnTab === id ? '#c2562e' : '#cbb792', bg: s.learnTab === id ? '#c2562e' : '#f6efe0', fg: s.learnTab === id ? '#fff' : '#5c4a30',
    })),
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
