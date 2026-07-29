// Boom-bap, trap/drill and old-school electro basslines. In this family the
// bass is usually a synth or a sampled note rather than a played instrument, so
// the lines are short, low and rhythmic — the 808 IS the bass part.
import type { BassPattern } from '../bass';

export const HIPHOP_BASSLINES: BassPattern[] = [
  // --------------------------------------------------------------- boom-bap ----
  { id: 'bap-stab', genre: 'hiphop', name: 'Boom-Bap Root Stab', tag: 'sampled upright',
    tip: 'One fat root under the kick and a ♭7 answer late in the bar. Boom-bap bass is a sample of a jazz record filtered down to its lowest 200 Hz — play it that sparse.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, g: true }, { s: 6, d: 'R' }, { s: 10, d: 'b7' }, { s: 12, d: '5' }, { s: 15, g: true }] },
  { id: 'bap-walk', genre: 'hiphop', name: 'Looped Walk', tag: 'jazz-loop hip-hop',
    tip: 'A two-bar walking phrase chopped to one bar and looped forever. Because it repeats, the walk stops sounding like jazz and starts sounding like a riff — that transformation is the genre.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 3, g: true }, { s: 4, d: 'b3' }, { s: 6, d: '4' }, { s: 8, d: '5', l: 3 }, { s: 12, d: 'b7' }, { s: 14, d: 'A' }] },
  { id: 'bap-sub', genre: 'hiphop', name: 'Sub Under the Break', tag: 'sub-bass layer',
    tip: 'Two notes, both below 80 Hz, both landing on the kick. When a drum break already fills the mid-range the only job left for the bass is weight.',
    steps: [{ s: 0, d: 'R', l: 6 }, { s: 6, g: true }, { s: 8, d: 'R', l: 4 }, { s: 14, d: 'A+' }] },
  { id: 'bap-nod', genre: 'hiphop', name: 'Head-Nod Ghosts', tag: 'swung boom-bap',
    tip: 'Swing the sixteenths to about 58% and the dead notes start to nod for you. Pitched notes on the strong beats, muted strings everywhere else.',
    steps: [{ s: 0, d: 'R' }, { s: 2, g: true }, { s: 3, d: 'b7' }, { s: 6, d: 'R' }, { s: 7, g: true }, { s: 8, d: '5' }, { s: 10, g: true }, { s: 11, d: 'R' }, { s: 14, d: 'b7' }, { s: 15, g: true }] },

  // ------------------------------------------------------------------ trap ----
  { id: 'trap-808', genre: 'trap', name: '808 Glide Line', tag: 'modern trap',
    tip: 'The 808 is the kick and the bass at once, so every note is a pitch decision. Long root, a ♭3 in the middle, and a glide into the next chord’s root before the bar ends.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 6, d: 'R' }, { s: 8, d: 'b3', l: 2 }, { s: 11, d: 'R' }, { s: 14, d: 'N', l: 2 }] },
  { id: 'trap-tresillo', genre: 'trap', name: '808 Tresillo', tag: 'trap · Atlanta',
    tip: 'The 3+3+2 cell at the bottom of the mix: hits on 1, the “and of 2” and beat 4, each one held until the next. Half of modern rap runs on exactly this.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: 'R', l: 3 }, { s: 12, d: 'R', l: 4 }] },
  { id: 'trap-drill', genre: 'trap', name: 'Drill Slide', tag: 'UK / Bronx drill',
    tip: 'Drill’s signature is the slide: hit a note and pitch-bend it down into the next one. Programme the two ends and let the portamento do the middle.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5' }, { s: 6, d: 'R' }, { s: 7, g: true }, { s: 10, d: 'b3' }, { s: 12, d: 'R', l: 3 }, { s: 15, d: 'A' }] },
  { id: 'trap-triplet', genre: 'trap', name: 'Triplet-Feel 808', tag: 'triplet flow',
    tip: 'The 808 answering a triplet hat roll: notes clustered in threes so the low end shares the rapper’s subdivision instead of fighting it.',
    steps: [{ s: 0, d: 'R', l: 2 }, { s: 3, d: 'R' }, { s: 5, d: 'b7' }, { s: 8, d: 'R', l: 2 }, { s: 11, d: 'R' }, { s: 13, d: '5' }, { s: 15, g: true }] },

  // ------------------------------------------------------------ old-school ----
  { id: 'electro-tresillo', genre: 'oldschool', name: 'Electro 3+3+2', tag: '808 electro',
    tip: 'The cell that got the 808 famous: three, three, two sixteenths, repeated twice a bar. Straight, quantized, no swing — the machine-ness is the point.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'R' }, { s: 6, d: 'R' }, { s: 8, d: '5' }, { s: 11, d: '5' }, { s: 14, d: 'R' }] },
  { id: 'electro-oct', genre: 'oldschool', name: 'Electro Octaves', tag: 'Planet Rock era',
    tip: 'Root and octave alternating in eighths, tightening into sixteenths at the end of the bar. A synth bass pretending to be a disco bassist pretending to be a machine.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 12, d: 'R' }, { s: 13, d: 'O' }, { s: 14, d: 'R' }, { s: 15, d: 'O' }] },
  { id: 'oldschool-loop', genre: 'oldschool', name: 'Old-School Funk Loop', tag: 'breakbeat rap',
    tip: 'The lifted funk bar underneath the first rap records: a root, a ♭7 and a fifth, all in the same two-octave window, looping without variation for four minutes.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 3, d: 'R' }, { s: 6, d: 'b7' }, { s: 8, d: 'R' }, { s: 10, g: true }, { s: 11, d: '5' }, { s: 14, d: 'b7' }] },
  { id: 'oldschool-boogie', genre: 'oldschool', name: 'Freestyle Boogie', tag: 'electro-funk',
    tip: 'Where electro met boogie: octave jumps on a synth bass with the ♭7 and 5 dropping between them. Play it clean and let the drum machine be the percussion.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 3, g: true }, { s: 4, d: 'b7' }, { s: 6, d: '5' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 12, d: 'b7' }, { s: 14, d: '5' }] },
];
