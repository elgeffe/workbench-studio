// Jazz, soul-jazz, jazz-funk, fusion and blues. The family where the bass owns
// the harmony: walking lines spell the changes one quarter note at a time, and
// even the funkiest crossover riff is chosen for the colour tone it lands on.
import type { BassPattern } from '../bass';

export const JAZZ_BASSLINES: BassPattern[] = [
  // ------------------------------------------------------------------ jazz ----
  { id: 'walkup', genre: 'jazz', name: 'Walking · Up the Chord', tag: 'walking bass',
    tip: 'Quarter notes: chord tones on the strong beats, then a chromatic approach a half-step under the NEXT chord’s root. Beat 4 belongs to where you’re going, not where you are.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: '3', l: 3.5 }, { s: 8, d: '5', l: 3.5 }, { s: 12, d: 'A', l: 3.5 }] },
  { id: 'walkdown', genre: 'jazz', name: 'Walking · From Above', tag: 'walking bass',
    tip: 'The mirror move: drift down through the 6 and 5, then fall onto the next root from a half-step above. Mixing under- and over-approaches keeps a walk from sounding like an exercise.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: '6', l: 3.5 }, { s: 8, d: '5', l: 3.5 }, { s: 12, d: 'A+', l: 3.5 }] },
  { id: 'twofeel', genre: 'jazz', name: 'The Two-Feel', tag: 'jazz ballads',
    tip: 'Half notes — just root and five — until the last eighth walks into the change. Restraint is a bass trick too: save the four-to-the-bar walk for when the tune lifts.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, d: '5', l: 5 }, { s: 14, d: 'A' }] },
  { id: 'jazz-eighthwalk', genre: 'jazz', name: 'Walking in Eighths', tag: 'up-tempo bebop',
    tip: 'The walk doubled: a full scale run from root to the change, eight notes to the bar. Save it for the last chorus — at this density the line stops being an accompaniment.',
    steps: [{ s: 0, d: 'R', l: 1.8 }, { s: 2, d: '2' }, { s: 4, d: '3', l: 1.8 }, { s: 6, d: '4' }, { s: 8, d: '5', l: 1.8 }, { s: 10, d: '6' }, { s: 12, d: 'b7' }, { s: 14, d: 'A' }] },
  { id: 'jazz-pedal', genre: 'jazz', name: 'Dominant Pedal', tag: 'vamp / intro',
    tip: 'Sit on the key’s tonic in quarters while the changes move over it — the classic intro and turnaround device. The tension builds simply because you refuse to walk.',
    steps: [{ s: 0, d: 'T', l: 3.5 }, { s: 4, d: 'T', l: 3.5 }, { s: 8, d: 'T', l: 3.5 }, { s: 12, d: 'T', l: 3.5 }] },

  // ------------------------------------------------------------- soul-jazz ----
  { id: 'boogaloo', genre: 'souljazz', name: 'Boogaloo Line', tag: 'soul-jazz · Blue Note 60s',
    tip: 'The tresillo (3+3+2) that gave the boogaloo its name: root on 1, root again on the “and of 2”, fifth on beat 4 — a Latin cell under a backbeat, then a jazz walk into the change.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 12, d: '5' }, { s: 14, d: 'A' }] },
  { id: 'souljazz-organ', genre: 'souljazz', name: 'Organ Left Hand', tag: 'Jimmy Smith lineage',
    tip: 'When the Hammond plays its own bass, the line gets fatter and lazier: root, five, ♭7, all held. Play it with the tone rolled off — an organ has no attack.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5' }, { s: 6, d: 'R' }, { s: 8, d: 'b7', l: 3 }, { s: 12, d: '5' }, { s: 14, d: 'A' }] },
  { id: 'souljazz-shuffle', genre: 'souljazz', name: 'Blue Note Shuffle', tag: 'jazz shuffle',
    tip: 'A shuffled climb to the octave with a dead note in the middle. Push the swing past 58% — soul-jazz sits between a straight backbeat and a full jazz triplet.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 3, g: true }, { s: 4, d: '5' }, { s: 6, d: '6' }, { s: 8, d: 'b7', l: 2 }, { s: 11, g: true }, { s: 12, d: 'O' }, { s: 14, d: 'A' }] },
  { id: 'souljazz-vamp', genre: 'souljazz', name: 'Modal Vamp', tag: 'modal soul-jazz',
    tip: 'One chord for eight bars, so the bass supplies all the movement: root, ♭3, 4, 5 climbing out of the Dorian mode. No changes to walk into — just the shape of the scale.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 6, d: 'b3' }, { s: 8, d: 'R' }, { s: 10, g: true }, { s: 12, d: '4' }, { s: 14, d: '5' }] },

  // ------------------------------------------------------------- jazz-funk ----
  { id: 'crossover', genre: 'jazzfunk', name: 'Crossover 16ths', tag: '70s jazz-funk · Mizell era',
    tip: 'Funk 16ths with jazz manners: the root pushed on the “a of 1”, an octave in the middle of the bar, and the Dorian natural 6 before the change — that 6 is the note that makes a funk line sound like jazz.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'R' }, { s: 4, g: true }, { s: 6, d: '5' }, { s: 8, d: 'b7' }, { s: 10, d: 'O' }, { s: 11, g: true }, { s: 13, d: '6' }, { s: 14, d: 'A' }] },
  { id: 'spiritual', genre: 'jazzfunk', name: 'Two-Chord Vamp', tag: 'spiritual jazz-funk',
    tip: 'The floating end of jazz-funk: long notes, one octave leap, and a bar that ends on the 9 instead of the root — the note that stops a vamp ever sounding finished.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5' }, { s: 6, d: 'O', l: 3 }, { s: 10, d: '5' }, { s: 11, g: true }, { s: 14, d: '2' }] },
  { id: 'jazzfunk-sunshine', genre: 'jazzfunk', name: 'Sunshine Octaves', tag: 'Mizell Brothers production',
    tip: 'Bright, major-leaning crossover: octaves and the natural 6 over a sweet maj9 vamp. Play it clean and round — this is music engineered for a warm summer mix.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, g: true }, { s: 5, d: '6' }, { s: 7, d: '5' }, { s: 8, d: 'O' }, { s: 10, g: true }, { s: 11, d: 'R' }, { s: 13, d: '2' }, { s: 14, d: 'A' }] },
  { id: 'jazzfunk-clav', genre: 'jazzfunk', name: 'Clavinet Lock', tag: 'clav & bass unison',
    tip: 'Written to interlock with a clavinet part: the bass takes the notes the clav leaves out, and the dead notes cover the rest. Neither part makes sense alone.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 3, d: 'R' }, { s: 4, g: true }, { s: 6, d: 'b3' }, { s: 8, g: true }, { s: 9, d: '5' }, { s: 11, d: 'b7' }, { s: 12, g: true }, { s: 14, d: '6' }, { s: 15, g: true }] },

  // ---------------------------------------------------------------- fusion ----
  { id: 'fusion-linear', genre: 'fusion', name: 'Linear 16ths', tag: 'jazz-fusion',
    tip: 'One continuous sixteenth line where pitched notes and dead notes alternate without pattern. Fusion bass is a drum part with harmony — nothing repeats exactly.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 2, d: '5' }, { s: 4, g: true }, { s: 5, d: 'b7' }, { s: 7, d: 'O' }, { s: 8, g: true }, { s: 9, d: '5' }, { s: 11, d: '6' }, { s: 12, g: true }, { s: 13, d: 'R' }, { s: 15, d: 'A' }] },
  { id: 'fusion-melodic', genre: 'fusion', name: 'Melodic Sixteenths', tag: 'fretless fusion',
    tip: 'The bass as a horn: an arpeggio shaped into a phrase that climbs to the octave and walks back down through the 9. Play it fretless and slide into every third.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '3' }, { s: 3, d: '5' }, { s: 5, d: '6' }, { s: 6, d: 'O' }, { s: 8, d: 'b7' }, { s: 10, d: '5' }, { s: 11, d: '3' }, { s: 13, d: '2' }, { s: 14, d: 'A' }] },
  { id: 'fusion-sus', genre: 'fusion', name: 'Sus Vamp Pedal', tag: 'modal fusion',
    tip: 'Over a 7sus vamp there is no third to spell, so the bass leans on the 4 and the 9. Long notes, no walking — the harmony is deliberately unresolved for minutes at a time.',
    steps: [{ s: 0, d: 'R', l: 5 }, { s: 6, d: '4' }, { s: 8, d: 'R', l: 4 }, { s: 12, d: '5' }, { s: 14, d: '2' }] },
  { id: 'fusion-three', genre: 'fusion', name: '3-Against-4 Cell', tag: 'odd groupings',
    tip: 'A three-sixteenth cell repeated across a four-beat bar, so the accent lands somewhere new every time and only re-agrees with the ONE after four bars. Metric modulation on a budget.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'R' }, { s: 6, d: 'R' }, { s: 9, d: 'R' }, { s: 12, d: 'R' }, { s: 15, d: 'A' }] },

  // ----------------------------------------------------------------- blues ----
  { id: 'boogie', genre: 'blues', name: 'Blues Boogie Shuffle', tag: 'jump blues',
    tip: 'The boogie-woogie cell that powered early rock’n’roll: up 1–3–5–6–♭7 and back down. The 3rd follows the chord, so it works over major and minor blues alike.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '3' }, { s: 4, d: '5' }, { s: 6, d: '6' }, { s: 8, d: 'b7' }, { s: 10, d: '6' }, { s: 12, d: '5' }, { s: 14, d: '3' }] },
  { id: 'blues-shufflewalk', genre: 'blues', name: 'Shuffle Walk-Up', tag: 'Chicago blues',
    tip: 'The boogie cell opened out into a full walk, with the ♭3 slid into the 3 on the way up. Set the swing to 66% — that triplet lean is the entire style.',
    steps: [{ s: 0, d: 'R', l: 1.8 }, { s: 2, d: '2' }, { s: 4, d: 'b3' }, { s: 5, d: '3' }, { s: 6, d: '4' }, { s: 8, d: '5', l: 1.8 }, { s: 10, d: '6' }, { s: 12, d: 'b7' }, { s: 14, d: 'A' }] },
  { id: 'blues-slow', genre: 'blues', name: 'Slow Blues Triplets', tag: '12/8 slow blues',
    tip: 'At 60 BPM in 12/8 every beat is three notes long. Arpeggiate lazily up through 3–5–6–♭7 and back; leave the last triplet empty for the guitar to fill.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 4, d: '3', l: 2 }, { s: 6, d: '5' }, { s: 8, d: '6', l: 2 }, { s: 10, d: 'b7' }, { s: 12, d: '6', l: 2 }, { s: 14, d: '5' }] },
  { id: 'blues-stoptime', genre: 'blues', name: 'Stop-Time Riff', tag: 'stop-time chorus',
    tip: 'The band hits the ONE together and then vanishes, leaving the bass alone to fill the bar. Play the ♭3–3 slide loudly: for two beats you are the only instrument in the room.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, g: true }, { s: 6, d: 'b3' }, { s: 7, d: '3' }, { s: 8, d: '5', l: 3 }, { s: 14, d: 'A' }] },
];
