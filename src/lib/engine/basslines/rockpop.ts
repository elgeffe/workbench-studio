// Rock, metal/punk, pop and disco basslines — the styles where the bass is the
// bridge between the kick drum and the song. Roots and fifths carry most of the
// weight; the character lives in the subdivision and in where the line breathes.
import type { BassPattern } from '../bass';

export const ROCK_POP_BASSLINES: BassPattern[] = [
  // ------------------------------------------------------------------ rock ----
  { id: 'rootfive', genre: 'rock', name: 'Root–Five', tag: 'country · early rock',
    tip: 'The oom-pah skeleton under country, polka and early rock: root, then the fifth BELOW. The walk-up into the next chord telegraphs the change to the whole band.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: '5_', l: 3.5 }, { s: 8, d: 'R', l: 3.5 }, { s: 12, d: '5_' }, { s: 14, d: 'A' }] },
  { id: 'eighths', genre: 'rock', name: 'Driving Eighths', tag: 'punk · hard rock',
    tip: 'Relentless root eighths, every note the same length and weight — the pocket IS the technique. The ♭7 pickup on the last eighth is the one flourish allowed.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 4, d: 'R' }, { s: 6, d: 'R' }, { s: 8, d: 'R' }, { s: 10, d: 'R' }, { s: 12, d: 'R' }, { s: 14, d: 'b7' }] },
  { id: 'rock-mixo', genre: 'rock', name: '♭7 Riff Rock', tag: 'Mixolydian rock',
    tip: 'Rock’s favourite colour note: the flat seventh. Land the root, drop to the ♭7 and back — the riff writes itself, and it works under every I–♭VII–IV progression.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 3, d: 'R' }, { s: 6, d: 'b7' }, { s: 8, d: 'R', l: 2 }, { s: 10, d: '5' }, { s: 12, d: 'b7' }, { s: 14, d: '5' }] },
  { id: 'rock-push', genre: 'rock', name: 'The Anticipated Change', tag: 'stadium rock',
    tip: 'Hold the root through the bar and then arrive early: the next chord’s root lands on the “and of 4”, an eighth before the band gets there. It is the single easiest way to make a simple progression sound urgent.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 4, d: 'R' }, { s: 8, d: '5', l: 3 }, { s: 12, d: 'R' }, { s: 14, d: 'N', l: 2 }] },

  // ----------------------------------------------------------------- metal ----
  { id: 'metal-gallop', genre: 'metal', name: 'The Gallop', tag: 'NWOBHM · thrash',
    tip: 'One eighth followed by two sixteenths, four times a bar — “da-da-da, da-da-da”. Play it all on one note: the rhythm is the riff, and the picking hand does the composing.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 3, d: 'R' }, { s: 4, d: 'R' }, { s: 6, d: 'R' }, { s: 7, d: 'R' }, { s: 8, d: 'R' }, { s: 10, d: 'R' }, { s: 11, d: 'R' }, { s: 12, d: 'R' }, { s: 14, d: 'R' }, { s: 15, d: 'R' }] },
  { id: 'metal-pedal', genre: 'metal', name: 'Pedal-Tone Chug', tag: 'groove metal',
    tip: 'Chug the key’s tonic between every chord tone: the open low string drones while the chord roots punch out of it. The harmony moves; the floor never does.',
    steps: [{ s: 0, d: 'R', l: 2 }, { s: 2, d: 'T' }, { s: 4, d: 'T' }, { s: 6, d: 'R' }, { s: 8, d: 'T' }, { s: 10, d: 'T' }, { s: 12, d: 'R' }, { s: 14, d: 'T' }] },
  { id: 'metal-halftime', genre: 'metal', name: 'Half-Time Breakdown', tag: 'doom · sludge',
    tip: 'Two notes in a whole bar. When the drums drop to half-time the bass has to hold the weight alone — let each note ring its full length and resist filling the gap.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, d: 'b3', l: 3 }, { s: 12, d: 'R', l: 4 }] },
  { id: 'metal-punk', genre: 'metal', name: 'Punk Downstrokes', tag: 'hardcore punk',
    tip: 'Root eighths played all downstrokes, with one octave jump for air and a push into the next chord. Deviating from the root is not a stylistic choice here — it is a mistake.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 4, d: 'R' }, { s: 6, d: 'R' }, { s: 8, d: 'O' }, { s: 10, d: 'R' }, { s: 12, d: 'R' }, { s: 14, d: 'N' }] },

  // ------------------------------------------------------------------- pop ----
  { id: 'mccartney', genre: 'pop', name: 'Melodic Counter-Line', tag: 'McCartney-style',
    tip: 'The bass as a second melody: arpeggiate the chord but shape it into a singable contour with the 6th. It answers the vocal instead of just anchoring it.',
    steps: [{ s: 0, d: 'R' }, { s: 4, d: '3' }, { s: 6, d: '5' }, { s: 8, d: '6', l: 3 }, { s: 12, d: '5' }, { s: 14, d: '3' }] },
  { id: 'pedal', genre: 'pop', name: 'Tonic Pedal', tag: 'U2 · film scores',
    tip: 'The bass refuses to move: the key’s tonic drones under every chord while the harmony shifts above it. Tension comes from the chords rubbing against the unmoving floor.',
    steps: [{ s: 0, d: 'T' }, { s: 2, d: 'T' }, { s: 4, d: 'T' }, { s: 6, d: 'T' }, { s: 8, d: 'T' }, { s: 10, d: 'T' }, { s: 12, d: 'T' }, { s: 14, d: 'T' }] },
  { id: 'pop-anchor', genre: 'pop', name: 'Two-Note Anchor', tag: 'modern pop production',
    tip: 'Root on 1, root on 3, nothing else. In a dense pop mix the bass is a frequency, not a part — play less than you think and let the vocal own the middle of the bar.',
    steps: [{ s: 0, d: 'R', l: 5 }, { s: 6, d: 'R' }, { s: 8, d: 'R', l: 5 }, { s: 14, d: 'N' }] },
  { id: 'pop-synth', genre: 'pop', name: 'Synth-Pop Octaves', tag: '80s synth-pop',
    tip: 'A sequencer part played by a bassist: rapid root–octave sixteenths with dead notes plugging the holes. Machine-tight on purpose — quantize this one hard.',
    steps: [{ s: 0, d: 'R' }, { s: 1, d: 'R' }, { s: 3, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 9, d: 'R' }, { s: 11, d: 'O' }, { s: 12, d: 'R' }, { s: 14, d: 'O' }, { s: 15, g: true }] },

  // ----------------------------------------------------------------- disco ----
  { id: 'discopump', genre: 'disco', name: 'Octave Pump', tag: 'Bernard Edwards · Chic',
    tip: 'Root–octave eighths welded to the four-on-the-floor kick — the engine of disco. The ♭7 on beat 4 is the pickup that yanks the line back to the ONE.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 12, d: 'b7' }, { s: 14, d: 'O' }] },
  { id: 'disco-boogie', genre: 'disco', name: 'Boogie Sixteenths', tag: 'boogie · post-disco',
    tip: 'Disco’s late-night cousin: the same octave engine broken into sixteenths, with the 6 and ♭7 sliding between the two registers. Busier than disco, but every note still lands on the kick.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 3, d: 'O' }, { s: 5, d: 'R' }, { s: 6, d: 'b7' }, { s: 8, d: 'O' }, { s: 10, d: '5' }, { s: 11, g: true }, { s: 12, d: '6' }, { s: 14, d: 'b7' }] },
  { id: 'disco-walkup', genre: 'disco', name: 'The Disco Walk-Up', tag: 'Philly · Salsoul',
    tip: 'A full scalar climb from the root to the change — the string-section escalator translated to bass. Play it straight up in eighths and let the strings copy you an octave higher.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '2' }, { s: 4, d: '3' }, { s: 6, d: '4' }, { s: 8, d: '5' }, { s: 10, d: '6' }, { s: 12, d: 'b7' }, { s: 14, d: 'A' }] },
  { id: 'disco-slap', genre: 'disco', name: 'Slap Disco', tag: 'Larry Graham lineage',
    tip: 'Thumb-and-pop disco: every hole between the octaves is plugged with a dead note, so the line reads as a hi-hat pattern with pitch. Mute hard — the “chk”s should be louder than you expect.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 2, d: 'O' }, { s: 4, g: true }, { s: 5, d: 'R' }, { s: 7, g: true }, { s: 8, d: 'O' }, { s: 10, d: 'R' }, { s: 11, d: 'b7' }, { s: 12, d: 'O' }, { s: 14, g: true }, { s: 15, d: 'R' }] },
];
