// Drums-mode view: template chips grouped by genre, layer stepper, the
// 16-step grid rows and the count ruler.
import { DRUM_VOICES, DRUM_COUNT, DRUM_GROUPS, drumTemplates } from '../engine/drums';
import type { WorkbenchStore } from '../store.svelte';

export function buildDrums(s: WorkbenchStore) {
  const DR_TPLS = drumTemplates();
  const drTpl = DR_TPLS.find((x) => x.id === s.drTplId) || DR_TPLS[0];
  const drGroups = DRUM_GROUPS.map((g) => ({
    name: g,
    chips: DR_TPLS.filter((x) => x.group === g).map((x) => ({
      id: x.id, name: x.name, bpm: x.bpm,
      border: x.id === drTpl.id ? '#c2562e' : '#cbb792',
      bg: x.id === drTpl.id ? '#fbeede' : '#f6efe0',
      fg: x.id === drTpl.id ? '#c2562e' : '#5c4a30',
      weight: x.id === drTpl.id ? '700' : '500',
    })),
  }));
  const drLayers = drTpl.layers.map((l, i) => ({
    name: l.name, i,
    on: i < s.drLayerN,
    border: i < s.drLayerN ? '#3f6b5f' : '#cbb792',
    bg: i < s.drLayerN ? '#3f6b5f' : '#f6efe0',
    fg: i < s.drLayerN ? '#fff' : '#5c4a30',
  }));
  const drLayerWhy = drTpl.layers[Math.min(s.drLayerN, drTpl.layers.length) - 1]?.why || '';
  const drRows = DRUM_VOICES.map((vc) => {
    const muted = s.drMuted.includes(vc.id);
    return {
      id: vc.id, name: vc.name, short: vc.short, color: vc.color, muted,
      cells: s.drGrid[vc.id].map((val, st) => ({
        s: st, val,
        bg: val === 2 ? vc.color : val === 1 ? vc.color + '99' : st % 4 === 0 ? '#e7d9ba' : '#f0e6cf',
        ring: s.drPlaying && s.drStep === st,
        op: muted ? '0.35' : '1',
      })),
    };
  });
  const drCount = DRUM_COUNT.map((c, st) => ({
    c, s: st,
    strong: st % 4 === 0,
    hot: s.drPlaying && s.drStep === st,
  }));
  const drEmpty = DRUM_VOICES.every((vc) => s.drGrid[vc.id].every((c) => c === 0));
  const swingLabel = s.drSwing <= 52 ? 'straight' : s.drSwing < 62 ? 'loose' : s.drSwing < 71 ? 'shuffle' : 'hard shuffle';

  return {
    drGroups, drTplName: drTpl.name, drTip: drTpl.tip, drRows, drCount, drLayers, drLayerWhy, drEmpty,
    drTempo: s.tempo, drSwing: s.drSwing, drSwingLabel: swingLabel,
  };
}
