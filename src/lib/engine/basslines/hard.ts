// Hardstyle and hardcore/gabber. The distorted kick occupies the whole low end
// on every beat, so the bass has literally nowhere to sit except the off-beats —
// which is why "reverse bass" became a genre-defining technique.
import type { BassPattern } from '../bass';

export const HARD_BASSLINES: BassPattern[] = [
  // ------------------------------------------------------------- hardstyle ----
  { id: 'hardstyle-reverse', genre: 'hardstyle', name: 'Reverse Bass', tag: 'hardstyle',
    tip: 'The kick owns every beat, so the bass answers on every off-beat — reversed so it swells backwards into the next kick. Four notes, and the genre is built.',
    steps: [{ s: 2, d: 'R', l: 1.6 }, { s: 6, d: 'R', l: 1.6 }, { s: 10, d: 'R', l: 1.6 }, { s: 14, d: 'b7', l: 1.6 }] },
  { id: 'hardstyle-screech', genre: 'hardstyle', name: 'Screech Octaves', tag: 'euphoric hardstyle',
    tip: 'Same off-beat placement an octave up, played on a screech patch rather than a sub. It reads as a lead line and a bass part at once.',
    steps: [{ s: 2, d: 'O' }, { s: 6, d: 'O' }, { s: 10, d: 'O' }, { s: 14, d: 'O' }] },
  { id: 'hardstyle-euphoric', genre: 'hardstyle', name: 'Euphoric Sustain', tag: 'hardstyle breakdown',
    tip: 'The breakdown: kick gone, three long tones spelling a minor cadence — root, ♭6, ♭7. This is where hardstyle borrows trance’s emotional machinery wholesale.',
    steps: [{ s: 0, d: 'R', l: 6 }, { s: 8, d: 'b6', l: 4 }, { s: 12, d: 'b7', l: 4 }] },

  // -------------------------------------------------------------- hardcore ----
  { id: 'gabber-stomp', genre: 'hardcore', name: 'Gabber Root Stomp', tag: 'gabber',
    tip: 'The gabber kick is already a pitched, distorted bass note, so the "bassline" is simply which note you tune each kick to. One root per beat, and turn it up.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: 'R', l: 3.5 }, { s: 8, d: 'R', l: 3.5 }, { s: 12, d: 'R', l: 3.5 }] },
  { id: 'gabber-hoover', genre: 'hardcore', name: 'Hoover Riff', tag: 'early hardcore',
    tip: 'The Alpha Juno hoover patch playing a minor riff in eighths: root, ♭3, 5, ♭6. Ugly by design, and instantly identifiable thirty years later.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 4, d: 'b3' }, { s: 6, d: 'R' }, { s: 8, d: '5' }, { s: 10, d: 'R' }, { s: 12, d: 'b6' }, { s: 14, d: '5' }] },
  { id: 'hardcore-uk', genre: 'hardcore', name: 'UK Hardcore Piano Bass', tag: 'UK / happy hardcore',
    tip: 'Under a piano riff at 175, the bass turns melodic: root, fifth, octave, back down. It is trance harmony played twice as fast and with twice the sugar.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5' }, { s: 6, d: 'O' }, { s: 8, d: 'R', l: 3 }, { s: 12, d: '5' }, { s: 14, d: 'A' }] },
];
