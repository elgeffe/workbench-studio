// Drums-mode view: the dependent genre → variation picker, the layer stepper,
// the 16-step grid rows and the count ruler.
import { DRUM_VOICES, DRUM_COUNT, DRUM_GENRES, drumTemplates, drumVoice } from '../engine/drums';
import { genreById } from '../engine/genres';
import { genreShelves, itemChips } from './picker';
import type { WorkbenchStore } from '../store.svelte';

export function buildDrums(s: WorkbenchStore) {
  const DR_TPLS = drumTemplates();
  const drTpl = DR_TPLS.find((x) => x.id === s.drTplId) || DR_TPLS[0];
  const drGenre = genreById(drTpl.genre);

  // Row 1 of the picker: every genre, shelved by family. Row 2 (below) depends
  // on which genre is selected here.
  const drFamilies = genreShelves(DR_TPLS, (t) => t.genre, drGenre.id);

  // Row 2: the variations inside the selected genre.
  const drVariations = itemChips(
    DR_TPLS.filter((t) => t.genre === drGenre.id),
    drTpl.id,
    (t) => ({ name: t.name, meta: String(t.bpm) }),
  );

  const drLayers = drTpl.layers.map((l, i) => ({
    name: l.name, i,
    on: i < s.drLayerN,
    border: i < s.drLayerN ? '#3f6b5f' : '#cbb792',
    bg: i < s.drLayerN ? '#3f6b5f' : '#f6efe0',
    fg: i < s.drLayerN ? '#fff' : '#5c4a30',
  }));
  const drLayerWhy = drTpl.layers[Math.min(s.drLayerN, drTpl.layers.length) - 1]?.why || '';
  // Only the rows this pattern uses (plus any the user added), in kit order.
  const drRows = s.drRowIds.map(drumVoice).map((vc) => {
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
  // Everything in the kit that isn't on screen yet — the add-a-row palette.
  const drAddable = DRUM_VOICES
    .filter((vc) => !s.drRowIds.includes(vc.id))
    .map((vc) => ({ id: vc.id, name: vc.name, short: vc.short, color: vc.color, hint: vc.hint }));
  const drEmpty = DRUM_VOICES.every((vc) => s.drGrid[vc.id].every((c) => c === 0));
  const swingLabel = s.drSwing <= 52 ? 'straight' : s.drSwing < 62 ? 'loose' : s.drSwing < 71 ? 'shuffle' : 'hard shuffle';

  return {
    drFamilies, drVariations,
    drPickerOpen: s.picker === 'drums',
    drGenreId: drGenre.id, drGenreName: drGenre.name, drGenreBlurb: drGenre.blurb, drGenreMaschine: drGenre.maschine,
    drTplName: drTpl.name, drTip: drTpl.tip,
    drPatternCount: DR_TPLS.length, drGenreCount: DRUM_GENRES.length,
    drRows, drAddable, drCount, drLayers, drLayerWhy, drEmpty,
    drTempo: s.tempo, drSwing: s.drSwing, drSwingLabel: swingLabel,
  };
}
