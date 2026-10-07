import { describe, it, expect } from 'vitest';
import { parseSession } from './session';

function valid() {
  const row = Array(16).fill(0);
  return {
    v: 1, tempo: 104, tonicPc: 0, scale: 'ionian', partOn: { drums: true, chords: true, bass: true },
    drTplId: 'rock', drLayerN: 5, drGrid: { kick: [...row], snare: [...row] }, drRowIds: ['kick', 'snare'],
    drMuted: [], drSwing: 50, bassLine: Array(16).fill(null), bassSeedId: null, bassEdited: false,
    jzChanges: [{ rootPc: 0, intervals: [0, 4, 7], name: 'C' }, { rootPc: -1, intervals: [], rest: true }],
    jzVoicing: 'full', chordSlot: 'half',
  };
}

describe('parseSession', () => {
  it('accepts a well-formed session, rests included', () => {
    expect(parseSession(JSON.stringify(valid()))?.tempo).toBe(104);
  });
  it('rejects junk, other versions and truncated input', () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession('not json')).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid(), v: 2 }))).toBeNull();
    expect(parseSession('{"v":1}')).toBeNull();
  });
  it('rejects shapes the renderer could not draw', () => {
    const bad = (patch: object) => parseSession(JSON.stringify({ ...valid(), ...patch }));
    expect(bad({ tempo: 9999 })).toBeNull();
    expect(bad({ drGrid: { kick: [1, 2, 3] } })).toBeNull();
    expect(bad({ drGrid: { kick: Array(16).fill(7) } })).toBeNull();
    expect(bad({ drRowIds: ['nope'] })).toBeNull();
    expect(bad({ bassLine: [] })).toBeNull();
    expect(bad({ jzChanges: [{ rootPc: 40, intervals: [] }] })).toBeNull();
    expect(bad({ chordSlot: 'weird' })).toBeNull();
  });
});
