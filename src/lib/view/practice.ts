// Practice-mode views: ear training and sight reading (level chips, answer
// options, prompts, score readouts).
import type { EarLevel } from '../engine/ear';
import type { ReadLevel, ReadClefSetting, ReadRange, ReadKeyMode, ReadAnswerMode } from '../engine/reading';
import type { WorkbenchStore } from '../store.svelte';
import { selChip } from './types';

export function buildEar(s: WorkbenchStore) {
  const earLevels = ([['interval', 'Intervals'], ['chord', 'Chord quality'], ['prog', 'Progressions'], ['keysig', 'Key signatures']] as Array<[EarLevel, string]>)
    .map(([id, name]) => ({ id, name, ...selChip(s.earLevel === id) }));
  let earOptions: Array<{ label: string; border: string; bg: string; fg: string }> = [];
  if (s.earTarget) {
    earOptions = s.earTarget.options.map((label) => {
      let border = '#cbb792', bg = '#f6efe0', fg = '#2c261d';
      if (s.earRevealed) {
        if (label === s.earTarget!.answer) { border = '#3f6b5f'; bg = '#e4efe9'; fg = '#2d5046'; }
        else if (label === s.earPicked) { border = '#c2562e'; bg = '#f8e3da'; fg = '#9a3f1f'; }
      }
      return { label, border, bg, fg };
    });
  }
  const earPromptMap: Record<EarLevel, string> = {
    interval: 'Two notes — name the distance between them',
    chord: 'One chord — name its quality',
    prog: 'A short progression — name the roman numerals',
    keysig: 'Read the key signature — name the major key',
  };
  const earStaff = s.earTarget && s.earTarget.type === 'keysig'
    ? { accidentals: s.earTarget.accidentals }
    : null;

  return {
    earLevels, earOptions, earPrompt: earPromptMap[s.earLevel], earStaff,
    earScore: s.earScore + '/' + s.earTotal, earStreak: s.earStreak,
    earMsg: s.earMsg, earMsgColor: s.earMsg.indexOf('✓') >= 0 ? '#3f6b5f' : '#c2562e',
  };
}

export function buildReading(s: WorkbenchStore) {
  const rdLevels = ([['note', 'Notes'], ['interval', 'Intervals'], ['chord', 'Chords']] as Array<[ReadLevel, string]>)
    .map(([id, name]) => ({ id, name, ...selChip(s.rdLevel === id) }));
  const rdClefChips = ([['treble', 'Treble 𝄞'], ['bass', 'Bass 𝄢'], ['both', 'Both']] as Array<[ReadClefSetting, string]>)
    .map(([id, name]) => ({ id, name, ...selChip(s.rdClef === id) }));
  const rdRangeChips = ([['staff', 'On the staff'], ['ledger', '+ Ledger lines']] as Array<[ReadRange, string]>)
    .map(([id, name]) => ({ id, name, ...selChip(s.rdRange === id) }));
  const rdKeyChips = ([['c', 'C major'], ['easy', 'Keys ≤ 3♯/♭'], ['all', 'All keys']] as Array<[ReadKeyMode, string]>)
    .map(([id, name]) => ({ id, name, ...selChip(s.rdKeyMode === id) }));
  const rdAnswerChips = ([['name', 'Name it'], ['play', 'Play it']] as Array<[ReadAnswerMode, string]>)
    .map(([id, name]) => ({ id, name, ...selChip(s.rdAnswerMode === id) }));
  const rdShowAcc = s.rdLevel === 'note' && s.rdKeyMode === 'c';
  const rdt = s.rdTarget;
  let rdOptions: Array<{ label: string; border: string; bg: string; fg: string }> = [];
  if (rdt && s.rdAnswerMode === 'name') {
    rdOptions = rdt.options.map((label) => {
      let border = '#cbb792', bg = '#f6efe0', fg = '#2c261d';
      if (s.rdRevealed) {
        if (label === rdt.answer) { border = '#3f6b5f'; bg = '#e4efe9'; fg = '#2d5046'; }
        else if (label === s.rdPicked) { border = '#c2562e'; bg = '#f8e3da'; fg = '#9a3f1f'; }
      }
      return { label, border, bg, fg };
    });
  }
  const rdPromptMap: Record<ReadLevel, [string, string]> = {
    note: ['Name the note on the staff', 'Play the note on the piano or a fretboard'],
    interval: ['Two stacked notes — name the interval', 'Play both notes on the piano or a fretboard'],
    chord: ['A stacked chord — name it', 'Play every chord tone on the piano or a fretboard'],
  };
  const rdNeed = rdt ? rdt.pcs.length : 0;

  return {
    rdLevels, rdClefChips, rdRangeChips, rdKeyChips, rdAnswerChips, rdShowAcc, rdOptions,
    rdAccBg: s.rdAccOn ? '#3f6b5f' : '#f6efe0', rdAccFg: s.rdAccOn ? '#fff' : '#5c4a30',
    rdStaff: rdt ? rdt.staff : null, rdKeyLabel: rdt ? rdt.keyLabel : '',
    rdPlayMode: s.rdAnswerMode === 'play',
    rdPrompt: rdPromptMap[s.rdLevel][s.rdAnswerMode === 'play' ? 1 : 0],
    rdProgress: s.rdAnswerMode === 'play' && rdNeed > 1 && !s.rdRevealed
      ? s.rdHits.length + ' of ' + rdNeed + ' notes found' : '',
    rdScore: s.rdScore + '/' + s.rdTotal, rdStreak: s.rdStreak,
    rdMsg: s.rdMsg, rdMsgColor: s.rdMsg.indexOf('✓') >= 0 ? '#3f6b5f' : '#c2562e',
  };
}
