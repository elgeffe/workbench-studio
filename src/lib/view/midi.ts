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
      // Rows in the current pattern first: those are the handful that will
      // actually be sent, and twelve rows is long enough that finding them
      // matters.
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
    const port = m.ports.find((p) => p.id === cfg.portId);
    return {
      id,
      label: PART_LABEL[id],
      on: cfg.on,
      channel: cfg.channel,
      octave: cfg.octave,
      portId: port ? cfg.portId! : '',
      portName: port ? port.name : '',
      // Switched on with nowhere to go: the part is configured and silent, and
      // saying so is better than letting it look like it is playing.
      unrouted: cfg.on && !port,
      // Chromatic sharing a socket and a channel with another part is the one
      // combination that silently half-works on a pad sampler: KEYS mode
      // repoints the whole note map at pitches, so whichever part addresses
      // pads stops being understood. The symptom is "only one of the two
      // plays", which reads as a bug in here rather than as a mode on the
      // device — so it gets called out before it is hit.
      clash: cfg.on && !!port && cfg.mode === 'keys' && MIDI_PARTS.some(
        (o) => o !== id && m.parts[o].on && m.parts[o].portId === cfg.portId
          && m.parts[o].channel === cfg.channel && m.parts[o].mode === 'pads',
      ),
      octaveLabel: cfg.octave > 0 ? `+${cfg.octave}` : String(cfg.octave),
      vel: cfg.vel,
      velAccent: cfg.velAccent,
      mode: cfg.mode,
      group: cfg.group,
      rootPad: cfg.rootPad,
      rootPadLabel: PAD_LABELS[cfg.rootPad],
      // Drums address pads, so an octave transpose would just walk them off
      // their group. Only the pitched parts get one. Accents run the other way:
      // the grid is the only thing in the studio that marks them.
      pitched: id !== 'drums',
      accents: id === 'drums',
      // A group is twelve semitones and no more, so `pads` mode has an octave
      // to give up rather than one to set.
      padded: id !== 'drums' && cfg.mode === 'pads',
      hint: id === 'drums'
        ? 'Pads, from the map below'
        : cfg.mode === 'pads'
          ? `Group ${cfg.group} pads — one octave, ${PAD_LABELS[cfg.rootPad]} is C`
          : id === 'bass'
            ? 'Chromatic — put the device in KEYS mode on a bass sound'
            : 'Chromatic — KEYS mode on a melodic sound',
      bg: cfg.on && live && port ? 'rgba(63,107,95,.14)' : 'transparent',
      border: cfg.on && !port && live ? '#9a3f1f' : cfg.on ? '#3f6b5f' : '#d8c7a8',
      portLabel: port ? port.name : '',
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
    // Outputs are listed for reference; routing is chosen per part below, so
    // these are labels rather than a selection.
    midiPorts: m.ports.map((p) => ({
      id: p.id,
      name: p.name,
      // Which parts this device is playing — the one-line answer to "what is
      // this box doing", which is the question a two-device rig raises.
      parts: MIDI_PARTS.filter((id) => m.parts[id].on && m.parts[id].portId === p.id)
        .map((id) => PART_LABEL[id]).join(' · '),
    })),
    midiStatusLine: !m.supported
      ? 'Web MIDI is not available in this browser'
      : m.status === 'ready'
        ? (m.ports.length === 1 ? m.ports[0].name : `${m.ports.length} outputs`)
        : m.status === 'connecting'
          ? 'Asking for MIDI access…'
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

    midiParts: parts,
    midiRows: rows,
    midiMappedCount: rows.filter((r) => r.mapped).length,
    midiGroups: GROUPS,
    midiPads: PAD_LABELS.map((label, i) => ({ i, label })),
  };
}
