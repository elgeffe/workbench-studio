// The derived view-model: one pure function of the store's state, assembled
// from per-mode builders. Components read `store.view.*` — nothing here
// mutates state or touches audio.
import {
  INT, SCALES, FNCOLOR, FNTINT, FNNAME, FNWHY, KEYSIG,
  type Chord, type ScaleId,
} from '../engine/constants';
import { spell, cname, gPcs, playedPcs, droppedPcs, keyNameStr, scaleNotesStr, diatonicList, subsFor } from '../engine/theory';
import { patternDefs, PAT_GROUPS } from '../engine/data';
import type { WorkbenchStore, Mode } from '../store.svelte';
import type { DiatonicView, LitInfo } from './types';
import { buildCircle } from './circle';
import { buildInstruments } from './instruments';
import { buildChords } from './chords';
import { buildBass } from './bass';
import { buildPatterns } from './patterns';
import { buildDrums } from './drums';
import { buildLearn } from './learn';
import { buildEar, buildReading } from './practice';

function litInfo(s: WorkbenchStore): LitInfo {
  const t = s.tonicPc;
  const activePat = patternDefs().find((p) => p.id === s.patId) || patternDefs()[0];
  // Only the pattern-library groups drive scale lighting; the Chord Shapes
  // and fret-diagram tabs are chord/diagram-driven, so they fall through to
  // the active-chord lighting below.
  if (s.patternsOpen && PAT_GROUPS.includes(s.patCat)) {
    const ints = activePat.int || activePat.scaleInt || [];
    const lit = ints.map((i) => (t + i) % 12);
    const litSet = new Set(lit);
    const chordSet = new Set(INT[activePat.chord].map((i) => (t + i) % 12));
    return { root: t, litSet, chordSet, dropSet: new Set<number>(), activePat };
  }
  const ac = s.activeChord;
  // Lit = the notes we actually voice (after best-practice dropping); the
  // dropped chord tones still belong to the chord, so we surface them greyed
  // out rather than hiding them. chordSet keeps the full stack for colouring.
  const litSet = new Set(ac ? playedPcs(ac) : []);
  const dropSet = new Set(ac ? droppedPcs(ac) : []);
  const chordSet = new Set(ac ? gPcs(ac) : []);
  const root = ac ? ac.rootPc : -1;
  return { root, litSet, chordSet, dropSet, activePat };
}

export function computeView(s: WorkbenchStore) {
  const t = s.tonicPc;
  const lit = litInfo(s);
  const dia = diatonicList(t, s.scale, s.ext);
  const ac = s.activeChord;
  // The play buttons in Drums and Workshop show the state of the ONE shared
  // transport — pressing either starts/stops the whole band.
  const transportOn = s.jzPlaying || s.drPlaying;

  const { wedges, circleLabel, circleHint } = buildCircle(t, s.circleView, s.circleDir);

  // diatonic chips
  const diatonic: DiatonicView[] = dia.map((c) => {
    const isAct = !!ac && ac.name === c.name && ac.rootPc === c.rootPc;
    return {
      ...c, fnColor: FNCOLOR[c.fn], fnName: FNNAME[c.fn], fnTint: FNTINT[c.fn],
      bg: isAct ? '#fbeede' : '#f6efe0', border: isAct ? FNCOLOR[c.fn] : '#e0cfae',
      wsBg: isAct ? '#fbeede' : FNTINT[c.fn], wsBorder: FNCOLOR[c.fn],
      wsShadow: isAct ? '0 0 0 2px ' + FNCOLOR[c.fn] : 'none',
      shadow: isAct ? '0 0 0 2px ' + FNCOLOR[c.fn] : 'none',
    };
  });

  // active readout — the chord the instruments are lighting, spelled out, with
  // the substitutions the Circle offers for it.
  let acNotes: Array<{ name: string; deg: string; bd: string }> = [];
  if (ac) {
    const ps = gPcs(ac);
    const labels = ac.degLabels || ['R', '3', '5', '7', '9', '11', '13'];
    acNotes = ps.map((p, i) => ({ name: spell(p, t), deg: labels[i] || '', bd: i === 0 ? '#c2562e' : '#3f6b5f' }));
  }
  const subs = ac ? subsFor(ac, t).map((sub) => {
    const ch = { rootPc: sub.rootPc, intervals: sub.intervals, name: sub.name, roman: sub.roman, fn: sub.fn } as Chord;
    return { name: sub.name, tag: sub.tag, why: sub.why, fnColor: FNCOLOR[sub.fn || 'T'], notes: gPcs(ch).map((p) => spell(p, t)), ch };
  }) : [];

  const patterns = buildPatterns(s, lit.activePat);
  const inst = buildInstruments(s, lit);

  const sigPc = s.circleView === 'min' ? (t + 3) % 12 : t;
  const scaleChip = (id: ScaleId) => ({ id, name: SCALES[id].short, bg: s.scale === id ? '#3f6b5f' : '#f1e6cf', fg: s.scale === id ? '#fff' : '#5c4a30', border: s.scale === id ? '#3f6b5f' : '#d8c7a8' });

  return {
    // header / scale
    keyName: keyNameStr(t, s.scale), keySig: KEYSIG[sigPc] || '',
    centerKey: s.circleView === 'min' ? spell(t, t) + 'm' : spell(t, t),
    scaleNotes: scaleNotesStr(t, s.scale), scaleCaption: SCALES[s.scale].char,
    modeList: (Object.keys(SCALES) as ScaleId[]).map(scaleChip),
    // direct key picker — chromatic, labelled with each key's usual spelling
    keyChips: ([[0, 'C'], [1, 'D♭'], [2, 'D'], [3, 'E♭'], [4, 'E'], [5, 'F'], [6, 'F♯'], [7, 'G'], [8, 'A♭'], [9, 'A'], [10, 'B♭'], [11, 'B']] as Array<[number, string]>).map(([pc, label]) => ({ pc, label, active: t === pc, bg: t === pc ? '#c2562e' : '#f1e6cf', fg: t === pc ? '#fff' : '#5c4a30', border: t === pc ? '#c2562e' : '#d8c7a8' })),
    // scale-type picker split into the four everyday scales + the modes
    scalePrimary: (['ionian', 'aeolian', 'harmonic', 'melodic'] as ScaleId[]).map(scaleChip),
    scaleModes: (['dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'] as ScaleId[]).map(scaleChip),
    extLevels: ([['triad', '3'], ['7', '7'], ['9', '9'], ['11', '11'], ['13', '13']] as Array<[string, string]>).map(([id, label]) => ({ id, label, bg: s.ext === id ? '#c2562e' : 'transparent', fg: s.ext === id ? '#fff' : '#d8a86f' })),
    extLevelsLight: ([['triad', '3'], ['7', '7'], ['9', '9'], ['11', '11'], ['13', '13']] as Array<[string, string]>).map(([id, label]) => ({ id, label, bg: s.ext === id ? '#c2562e' : 'transparent', fg: s.ext === id ? '#fff' : '#8a7350' })),
    extCaption: ({ triad: 'Triads — root, 3rd, 5th. The skeleton of every chord.', '7': 'Add the 7th — color and forward motion. Where jazz harmony begins.', '9': 'Add the 9th (the 2nd, an octave up) — lush tension stacked over the 7th.', '11': 'Add the 11th (the 4th, an octave up). Natural 11 clashes with a major 3rd, so players raise it (♯11) or drop the 3rd — it sits naturally on minor chords.', '13': 'Add the 13th (the 6th, an octave up) — the tallest tertian stack. Notes get omitted (often the 5th, sometimes the 11) and voiced by feel.' } as Record<string, string>)[s.ext],
    soundLabel: s.soundOn ? '♪ SOUND' : '✕ MUTED',
    soundLabelShort: s.soundOn ? '♪ ON' : '✕ MUTE',
    soundBg: s.soundOn ? 'rgba(216,168,111,.16)' : 'transparent', soundFg: s.soundOn ? '#e9c79b' : '#9c8460',
    // mode flags
    isCircle: s.mode === 'circle', isDrums: s.mode === 'drums', isChords: s.mode === 'chords',
    isBass: s.mode === 'bass', isMetronome: s.mode === 'metronome', isLearn: s.mode === 'learn',
    ringAnim: s.jzPlaying ? 'spin 8s linear infinite' : 'none',
    // circle
    wedges, circleLabel, circleHint, diatonic,
    dirFifthsBg: s.circleDir === 'fourths' ? 'transparent' : '#c2562e', dirFifthsFg: s.circleDir === 'fourths' ? '#5c4a30' : '#fff',
    dirFourthsBg: s.circleDir === 'fourths' ? '#c2562e' : 'transparent', dirFourthsFg: s.circleDir === 'fourths' ? '#fff' : '#5c4a30',
    viewMajBg: s.circleView === 'min' ? 'transparent' : '#3f6b5f', viewMajFg: s.circleView === 'min' ? '#5c4a30' : '#fff',
    viewMinBg: s.circleView === 'min' ? '#3f6b5f' : 'transparent', viewMinFg: s.circleView === 'min' ? '#fff' : '#5c4a30',
    hasActive: !!ac, noActive: !ac,
    acName: ac ? ac.name || cname(ac.rootPc, ac.quality || 'maj', t) : '', acRoman: ac ? ac.roman || '' : '',
    acFnName: ac ? FNNAME[ac.fn || 'T'] : '', acFnColor: ac ? FNCOLOR[ac.fn || 'T'] : '#3f6b5f',
    acNotes, acWhy: ac ? FNWHY[ac.fn || 'T'] : '', subs,
    // chords (genres, palettes, progression strip, inspector)
    ...buildChords(s),
    // bass (grooves, the 16-step editor, the part mix)
    ...buildBass(s),
    jzPlayLabel: transportOn ? '■ STOP' : '▶ PLAY', jzPlayBg: transportOn ? '#9a3f1f' : '#c2562e', jzPlayShadow: transportOn ? '#6e2c12' : '#9a3f1f',
    vFullBg: s.jzVoicing === 'full' ? '#3f6b5f' : '#f6efe0', vFullFg: s.jzVoicing === 'full' ? '#fff' : '#5c4a30',
    vShellBg: s.jzVoicing === 'shell' ? '#3f6b5f' : '#f6efe0', vShellFg: s.jzVoicing === 'shell' ? '#fff' : '#5c4a30',
    slotHalfBg: s.chordSlot === 'half' ? '#3f6b5f' : '#f6efe0', slotHalfFg: s.chordSlot === 'half' ? '#fff' : '#5c4a30',
    slotBarBg: s.chordSlot === 'bar' ? '#3f6b5f' : '#f6efe0', slotBarFg: s.chordSlot === 'bar' ? '#fff' : '#5c4a30',
    // How long a change holds, spelled out in beats — the number people hear as
    // "the tempo" when a chord suddenly lasts twice as long.
    chordSlotHint: s.chordSlot === 'half' ? '2 beats per chord' : '4 beats per chord',
    // patterns
    ...patterns.view,
    // drums
    ...buildDrums(s),
    drPlayLabel: transportOn ? '■ STOP' : '▶ PLAY',
    drPlayBg: transportOn ? '#9a3f1f' : '#c2562e', drPlayShadow: transportOn ? '#6e2c12' : '#9a3f1f',
    // learn
    ...buildLearn(s),
    tempo: s.tempo,
    // ear + sight reading
    ...buildEar(s),
    ...buildReading(s),
    // dock / instruments
    dockExpanded: s.dockOpen, dockChevron: s.dockOpen ? '▼ HIDE' : '▲ SHOW',
    dockName: s.patternsOpen && patterns.patLibTab ? spell(t, t) + ' ' + lit.activePat.name : ac ? ac.name || cname(ac.rootPc, ac.quality || 'maj', t) : '—',
    dockNotes: s.patternsOpen && patterns.patLibTab ? patterns.patNotes + '   ·   over ' + patterns.view.patChordName : ac ? gPcs(ac).map((p) => spell(p, t)).join('  ·  ') : 'pick a chord to see it on the fretboards',
    ...inst,
    fingerBg: s.fingerOn ? '#3f6b5f' : '#f6efe0', fingerFg: s.fingerOn ? '#fff' : '#5c4a30',
    // The six tabs, in the order the studio is meant to be used: explore the
    // key, lay a beat, write the changes, put a line under them, practise,
    // learn why any of it works. Six labels fit a 390pt phone at full size.
    mtabs: ([['circle', '⟳', 'CIRCLE'], ['drums', '◉', 'DRUMS'], ['chords', '▦', 'CHORDS'], ['bass', '♪', 'BASS'], ['metronome', '◳', 'METRO'], ['learn', '♭', 'LEARN']] as Array<[Mode, string, string]>).map(([id, icon, label]) => ({ id, icon, label, fg: s.mode === id ? '#f1e7d3' : '#8a7350', bg: s.mode === id ? 'rgba(194,86,46,.32)' : 'transparent' })),
    tabs: ([['circle', '⟳ Circle'], ['drums', '◉ Drums'], ['chords', '▦ Chords'], ['bass', '♪ Bass'], ['metronome', '◳ Metronome'], ['learn', '♭ Learn']] as Array<[Mode, string]>).map(([id, label]) => ({ id, label, fg: s.mode === id ? '#c2562e' : '#8a7350', bd: s.mode === id ? '#c2562e' : 'transparent' })),
  };
}

export type WorkbenchView = ReturnType<typeof computeView>;
