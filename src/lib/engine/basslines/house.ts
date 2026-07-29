// House, tech-house, techno and trance basslines. With the kick on every beat
// the bass has nowhere to put a downbeat, so these lines live in the gaps: the
// off-beat eighth, the rolling sixteenth, the note held under everything.
import type { BassPattern } from '../bass';

export const HOUSE_BASSLINES: BassPattern[] = [
  // ----------------------------------------------------------------- house ----
  { id: 'house-offbeat', genre: 'house', name: 'Off-Beat Bass', tag: 'classic Chicago house',
    tip: 'The four-on-the-floor rule: the kick takes the beats, so the bass takes the “and”s. Four notes, all in the holes, and the record already grooves.',
    steps: [{ s: 2, d: 'R', l: 1.6 }, { s: 6, d: 'R', l: 1.6 }, { s: 10, d: 'R', l: 1.6 }, { s: 14, d: 'R', l: 1.6 }] },
  { id: 'house-oct', genre: 'house', name: 'House Octave Bounce', tag: 'filter house',
    tip: 'Roots on the kick, octaves in the gaps — the disco pump with the filter closed. Leave beats 2 and 4 alone so the clap has somewhere to land.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 14, d: 'O' }] },
  { id: 'house-deep', genre: 'house', name: 'Deep House 7ths', tag: 'deep / soulful house',
    tip: 'Long, round notes reaching for the ♭7 and the 9 — the deep-house bass is a chord tone, not a rhythm part. Play it on a soft sine and let it bleed under the pads.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: 'b7' }, { s: 8, d: '5', l: 3 }, { s: 14, d: '2' }] },
  { id: 'house-piano', genre: 'house', name: 'Piano-House Walk', tag: 'anthemic house',
    tip: 'The left hand of a house piano riff: root and fifth alternating in eighths, stepping up to the ♭7 in the second half. Simple enough to sing, which is exactly why it works at 3am.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '5' }, { s: 4, d: 'O' }, { s: 6, d: '5' }, { s: 8, d: 'R' }, { s: 10, d: '5' }, { s: 12, d: 'b7' }, { s: 14, d: '5' }] },

  // ------------------------------------------------------------ tech-house ----
  { id: 'tech-rolling', genre: 'techhouse', name: 'Rolling Off-Beat Pairs', tag: 'tech-house',
    tip: 'Two sixteenths after every kick — the sound of a bass being sidechained so hard it only exists between the beats. Short, dry, no reverb.',
    steps: [{ s: 2, d: 'R' }, { s: 3, d: 'R' }, { s: 6, d: 'R' }, { s: 7, d: 'R' }, { s: 10, d: 'R' }, { s: 11, d: 'R' }, { s: 14, d: 'R' }, { s: 15, d: 'R' }] },
  { id: 'tech-minimal', genre: 'techhouse', name: 'One-Note Minimal', tag: 'minimal house',
    tip: 'Three notes in a bar, all the same pitch. Minimal is not laziness — it is leaving room for one percussion element to move each bar and become the whole arrangement.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 6, d: 'R' }, { s: 14, d: 'R' }] },
  { id: 'tech-stab', genre: 'techhouse', name: 'Two-Note Stab', tag: 'minimal / micro-house',
    tip: 'Root and ♭7 alternating on the off-beats. Two pitches is enough to imply a whole chord when everything else in the mix is percussion.',
    steps: [{ s: 2, d: 'R' }, { s: 6, d: 'b7' }, { s: 10, d: 'R' }, { s: 14, d: 'b7' }] },
  { id: 'tech-bump', genre: 'techhouse', name: 'Bumpy Swing Bass', tag: 'bumpin’ tech-house',
    tip: 'The bump: an off-beat root immediately answered by an octave a sixteenth later. Push the swing to 56–58% and the pair starts to skip instead of march.',
    steps: [{ s: 0, d: 'R' }, { s: 3, g: true }, { s: 6, d: 'R' }, { s: 7, d: 'O' }, { s: 10, d: 'R' }, { s: 11, g: true }, { s: 14, d: 'R' }, { s: 15, d: 'O' }] },

  // ---------------------------------------------------------------- techno ----
  { id: 'techno-sub', genre: 'techno', name: 'Sub Pulse', tag: 'straight techno',
    tip: 'One note per beat, locked to the kick, tuned to the key and nothing else. In techno the bass is not a part — it is the low half of the kick drum.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: 'R', l: 3.5 }, { s: 8, d: 'R', l: 3.5 }, { s: 12, d: 'R', l: 3.5 }] },
  { id: 'techno-offbeat', genre: 'techno', name: 'Off-Beat Sub', tag: 'driving techno',
    tip: 'The sub moves to the off-beats so the kick keeps the full weight of the downbeat to itself. The fifth on the last “and” is the only harmonic event in the bar.',
    steps: [{ s: 2, d: 'R', l: 2 }, { s: 6, d: 'R', l: 2 }, { s: 10, d: 'R', l: 2 }, { s: 14, d: '5', l: 2 }] },
  { id: 'techno-acid', genre: 'techno', name: 'Acid Sixteenths', tag: '303 acid line',
    tip: 'The 303 pattern: a stream of sixteenths where accents and slides — not notes — carry the melody. Programme the pitches, then let the filter envelope write the tune.',
    steps: [{ s: 0, d: 'R' }, { s: 1, d: 'R' }, { s: 3, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'b3' }, { s: 7, d: 'R' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 11, d: 'R' }, { s: 13, d: 'b7' }, { s: 14, d: 'R' }, { s: 15, g: true }] },
  { id: 'techno-hypno', genre: 'techno', name: 'Hypnotic Two-Note', tag: 'hypnotic / dub techno',
    tip: 'Root and ♭6, half a bar each, forever. Two chords’ worth of information stretched over sixteen beats — the slowest harmonic rhythm in the studio.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: 'b6' }, { s: 8, d: 'R', l: 3 }, { s: 12, d: 'b6' }] },

  // ---------------------------------------------------------------- trance ----
  { id: 'trance-roll', genre: 'trance', name: 'Rolling Off-Beat Bass', tag: 'uplifting trance',
    tip: 'The defining trance bass: three sixteenths after every kick, leaving only the downbeats empty. Sidechain it hard and the whole track starts to breathe at 138.',
    steps: [{ s: 1, d: 'R' }, { s: 2, d: 'R' }, { s: 3, d: 'R' }, { s: 5, d: 'R' }, { s: 6, d: 'R' }, { s: 7, d: 'R' }, { s: 9, d: 'R' }, { s: 10, d: 'R' }, { s: 11, d: 'R' }, { s: 13, d: 'R' }, { s: 14, d: 'R' }, { s: 15, d: 'R' }] },
  { id: 'trance-oct', genre: 'trance', name: 'Octave Roller', tag: 'tech-trance',
    tip: 'The rolling bass with every third note kicked up an octave — the line climbs without ever leaving the pattern. This is how a static riff manufactures lift.',
    steps: [{ s: 1, d: 'R' }, { s: 2, d: 'R' }, { s: 3, d: 'O' }, { s: 5, d: 'R' }, { s: 6, d: 'R' }, { s: 7, d: 'O' }, { s: 9, d: 'R' }, { s: 10, d: 'R' }, { s: 11, d: 'O' }, { s: 13, d: 'R' }, { s: 14, d: 'R' }, { s: 15, d: 'O' }] },
  { id: 'trance-sustain', genre: 'trance', name: 'Breakdown Sustain', tag: 'trance breakdown',
    tip: 'When the drums drop out, the bass becomes the bottom of the pad: root, ♭6, ♭7 — three long tones that spell the emotional cadence the drop will resolve.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, d: 'b6', l: 4 }, { s: 12, d: 'b7', l: 4 }] },
  { id: 'trance-gate', genre: 'trance', name: 'Gated Blocks', tag: 'big-room',
    tip: 'Sixteenths in solid blocks rather than a continuous roll — bar-halves of root, then fifth. It sounds like a gate opening and closing, which is exactly the intended effect.',
    steps: [{ s: 0, d: 'R' }, { s: 1, d: 'R' }, { s: 2, d: 'R' }, { s: 3, d: 'R' }, { s: 8, d: 'R' }, { s: 9, d: 'R' }, { s: 10, d: 'R' }, { s: 11, d: 'R' }, { s: 12, d: '5' }, { s: 13, d: '5' }, { s: 14, d: '5' }, { s: 15, d: '5' }] },
];
