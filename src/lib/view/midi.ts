// View-model for the MIDI panel: the connection line, the three part strips
// and the pad map, all as render props. Pure — it reads the MIDI sub-store and
// returns colours and labels, exactly like every other builder here.

import { DRUM_VOICES } from '../engine/kit';
import { GROUPS, MIDI_PARTS, PAD_LABELS, padName, padNote, padTakenBy } from '../midi/map';
import type { MidiPart } from '../midi/map';
import type { WorkbenchStore } from '../store.svelte';

const PART_LABEL: Record<MidiPart, string> = { drums: 'DRUMS', chords: 'CHORDS', bass: 'BASS' };

export function buildMidi(s: WorkbenchStore) {
  const m = s.midi;
  const live = m.live;

  // The button in the studio bar reads as three states and no more: off,
  // armed, or a fault worth opening the panel for.
  const btnState = !m.supported ? 'unsupported' : m.status === 'error' ? 'error' : live ? 'live' : 'off';

  const rows = DRUM_VOICES.map((v) => {
    const addr = m.drumMap[v.id];
    const clash = addr ? padTakenBy(m.drumMap, addr, v.id) : null;
    return {
      id: v.id,
      name: v.name,
      short: v.short,
      color: v.color,
      // Rows in the current pattern first: on a fourteen-voice kit those are
      // the handful that will actually be sent, and the list is long enough
      // that finding them matters.
      inGrid: s.drRowIds.includes(v.id),
      mapped: !!addr,
      group: addr ? addr.group : '',
      pad: addr ? addr.pad : -1,
      padLabel: addr ? padName(addr) : '—',
      note: addr ? padNote(addr) : -1,
      // Two voices on one pad is legal (a rim and a clap can share), but it is
      // almost always a mis-click, so it gets said out loud.
      clash: clash ? DRUM_VOICES.find((x) => x.id === clash)?.name ?? '' : '',
    };
  });

  const parts = MIDI_PARTS.map((id) => {
    const cfg = m.parts[id];
    return {
      id,
      label: PART_LABEL[id],
      on: cfg.on,
      channel: cfg.channel,
      octave: cfg.octave,
      octaveLabel: cfg.octave > 0 ? `+${cfg.octave}` : String(cfg.octave),
      // Drums address pads, so an octave transpose would just walk them off
      // their group. Only the pitched parts get one.
      pitched: id !== 'drums',
      hint: id === 'drums'
        ? 'Pads, from the map below'
        : id === 'bass'
          ? 'Chromatic — put the device in KEYS mode on a bass sound'
          : 'Chromatic — KEYS mode on a melodic sound',
      bg: cfg.on && live ? 'rgba(63,107,95,.14)' : 'transparent',
      border: cfg.on ? '#3f6b5f' : '#d8c7a8',
      fg: cfg.on ? '#2c261d' : '#8a7350',
    };
  });

  return {
    midiOpen: s.picker === 'midi',
    midiSupported: m.supported,
    midiLive: live,
    midiStatus: m.status,
    midiError: m.error,
    midiConnecting: m.status === 'connecting',
    midiPortId: m.portId,
    // With one device plugged in and already taken there is nothing to choose,
    // and the chip would only repeat the name in the status line above it.
    midiShowPorts: m.ports.length > 1 || (m.ports.length === 1 && m.ports[0].id !== m.portId),
    midiPorts: m.ports.map((p) => ({
      id: p.id,
      name: p.name,
      active: p.id === m.portId,
      bg: p.id === m.portId ? '#3f6b5f' : '#f6efe0',
      fg: p.id === m.portId ? '#fff' : '#5c4a30',
      border: p.id === m.portId ? '#3f6b5f' : '#d8c7a8',
    })),
    midiStatusLine: !m.supported
      ? 'Web MIDI is not available in this browser'
      : m.status === 'ready'
        ? (m.ports.find((p) => p.id === m.portId)?.name ?? 'Connected')
        : m.status === 'connecting'
          ? 'Asking for MIDI access…'
          : m.status === 'error'
            ? 'Not connected'
            : 'Not connected',
    // The bar button
    midiBtnLabel: btnState === 'live' ? '● MIDI' : btnState === 'error' ? '! MIDI' : '○ MIDI',
    midiBtnBg: btnState === 'live' ? 'rgba(63,107,95,.4)' : btnState === 'error' ? 'rgba(154,63,31,.4)' : 'transparent',
    midiBtnFg: btnState === 'live' ? '#bfe0d2' : btnState === 'error' ? '#e9a98b' : '#9c8460',
    midiArmLabel: live ? '■ DISARM' : m.status === 'ready' ? '▶ ARM' : '⇄ CONNECT',
    midiArmBg: live ? '#9a3f1f' : '#3f6b5f',

    midiClockOn: m.clockOn,
    midiClockBg: m.clockOn ? '#3f6b5f' : '#f6efe0',
    midiClockFg: m.clockOn ? '#fff' : '#5c4a30',
    midiVelNormal: m.velNormal,
    midiVelAccent: m.velAccent,

    midiParts: parts,
    midiRows: rows,
    midiMappedCount: rows.filter((r) => r.mapped).length,
    midiGroups: GROUPS,
    midiPads: PAD_LABELS.map((label, i) => ({ i, label })),
  };
}
