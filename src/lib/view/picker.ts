// View-model helpers for the shared genre picker. Drums, Workshop starting
// points and bass grooves all render the same two-level shelf — family →
// genre, then the templates inside the chosen genre — so they all build their
// chips here rather than each re-deriving the same colours.
import { shelveByFamily } from '../engine/genres';

export interface PickerChip {
  id: string;
  name: string;
  n?: number;    // how many templates live behind a genre chip
  meta?: string; // the small trailing label on a template chip (BPM, tag)
  border: string;
  bg: string;
  fg: string;
  weight: string;
}

export interface PickerShelf { name: string; chips: PickerChip[] }

const GENRE_ON = { border: '#c2562e', bg: '#fbeede', fg: '#c2562e', weight: '700' };
const GENRE_OFF = { border: '#cbb792', bg: '#f6efe0', fg: '#5c4a30', weight: '500' };
const ITEM_ON = { border: '#3f6b5f', bg: '#3f6b5f', fg: '#fff', weight: '700' };
const ITEM_OFF = { border: '#cbb792', bg: '#f6efe0', fg: '#5c4a30', weight: '500' };

/** Shelve `items` by family → genre and colour each genre chip by selection. */
export function genreShelves<T>(items: T[], genreOf: (item: T) => string, activeGenre: string): PickerShelf[] {
  return shelveByFamily(items, genreOf).map((f) => ({
    name: f.name,
    chips: f.genres.map(({ genre, items: inGenre }) => ({
      id: genre.id, name: genre.name, n: inGenre.length,
      ...(genre.id === activeGenre ? GENRE_ON : GENRE_OFF),
    })),
  }));
}

/** The second row: the templates inside the selected genre. */
export function itemChips<T extends { id: string }>(
  items: T[],
  activeId: string | null,
  label: (item: T) => { name: string; meta?: string },
): PickerChip[] {
  return items.map((it) => ({
    id: it.id, ...label(it),
    ...(it.id === activeId ? ITEM_ON : ITEM_OFF),
  }));
}
