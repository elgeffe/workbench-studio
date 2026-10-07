// What survives a reload, and what undo steps through.
//
// The studio's work is the drum grid, the bassline and the progression, plus
// the handful of settings that colour them. That "song" is plain JSON, so one
// shape serves three jobs: the autosave in localStorage, the undo history, and
// the export/import file. Transient state (what is playing, open pickers,
// the ear and reading drills, the practice click) is deliberately left out.
import type { Chord, ScaleId } from './engine/constants';
import type { BassCell } from './engine/bass';
import type { DrumGrid, DrumVoiceId } from './engine/drums';

export const SESSION_KEY = 'wb.session.v1';
export const HISTORY_LIMIT = 100;

/** The part of a session undo covers: edits to the music itself. */
export interface Song {
  drTplId: string;
  drLayerN: number;
  drGrid: DrumGrid;
  drRowIds: DrumVoiceId[];
  drMuted: DrumVoiceId[];
  drSwing: number;
  bassLine: BassCell[];
  bassSeedId: string | null;
  bassEdited: boolean;
  jzChanges: Chord[];
  jzVoicing: 'full' | 'shell';
  chordSlot: 'half' | 'bar';
}

/** A whole session: the song, plus key, tempo and the mixer. */
export interface Session extends Song {
  v: 1;
  tempo: number;
  tonicPc: number;
  scale: ScaleId;
  partOn: Record<'drums' | 'chords' | 'bass', boolean>;
}

function storage(): Storage | null {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; }
}

/**
 * Parse a saved session, or return null if it is not one. Everything read from
 * storage or a file is untrusted: a stale or hand-edited blob must never be
 * able to put the store into a shape the renderer cannot draw.
 */
export function parseSession(text: string | null): Session | null {
  if (!text) return null;
  let s: any;
  try { s = JSON.parse(text); } catch { return null; }
  if (!s || s.v !== 1) return null;
  const num = (x: unknown, lo: number, hi: number) => typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi;
  if (!num(s.tempo, 30, 300) || !num(s.tonicPc, 0, 11) || !num(s.drSwing, 40, 80) || !num(s.drLayerN, 0, 99)) return null;
  if (typeof s.drTplId !== 'string' || typeof s.scale !== 'string') return null;
  if (!s.drGrid || typeof s.drGrid !== 'object' || !Array.isArray(s.drRowIds) || !Array.isArray(s.drMuted)) return null;
  for (const id of Object.keys(s.drGrid)) {
    const row = s.drGrid[id];
    if (!Array.isArray(row) || row.length !== 16 || !row.every((c: unknown) => c === 0 || c === 1 || c === 2)) return null;
  }
  if (!s.drRowIds.every((id: unknown) => typeof id === 'string' && id in s.drGrid)) return null;
  if (!Array.isArray(s.bassLine) || s.bassLine.length !== 16) return null;
  if (!Array.isArray(s.jzChanges) || s.jzChanges.length > 256) return null;
  if (!s.jzChanges.every((c: any) => c && typeof c === 'object' && (c.rest === true || (num(c.rootPc, 0, 11) && Array.isArray(c.intervals))))) return null;
  if (s.jzVoicing !== 'full' && s.jzVoicing !== 'shell') return null;
  if (s.chordSlot !== 'half' && s.chordSlot !== 'bar') return null;
  const p = s.partOn;
  if (!p || typeof p.drums !== 'boolean' || typeof p.chords !== 'boolean' || typeof p.bass !== 'boolean') return null;
  return s as Session;
}

export function loadSession(): Session | null {
  try { return parseSession(storage()?.getItem(SESSION_KEY) ?? null); } catch { return null; }
}

export function saveSession(json: string): void {
  try { storage()?.setItem(SESSION_KEY, json); } catch { /* quota or private mode: autosave is best-effort */ }
}

/** Forget the autosave, so the next load starts from the studio's defaults. */
export function clearSession(): void {
  try { storage()?.removeItem(SESSION_KEY); } catch { /* nothing to clear */ }
}
