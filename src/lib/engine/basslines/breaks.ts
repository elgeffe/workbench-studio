// Drum & bass, jungle, UK garage, dubstep/grime and breakbeat. This is the one
// family named after its low end: the drums run at double speed while the bass
// stays in half-time underneath, which is why the lines below look so empty.
import type { BassPattern } from '../bass';

export const BREAKS_BASSLINES: BassPattern[] = [
  // ---------------------------------------------------------- drum & bass ----
  { id: 'dnb-reese', genre: 'dnb', name: 'Reese Sustain', tag: 'the Reese bass',
    tip: 'Two detuned saws held for half a bar each. At 174 BPM the drums are doing all the moving, so the bass only has to be enormous and slightly out of tune with itself.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, d: 'b6', l: 5 }, { s: 14, d: 'A', l: 2 }] },
  { id: 'dnb-liquid', genre: 'dnb', name: 'Liquid Roller', tag: 'liquid funk',
    tip: 'A rolling eighth-note line lifted from disco and dropped into 174 — roots, octaves, fifths, all legato. Liquid D&B is a soul record played at double time.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, d: '5' }, { s: 6, d: 'R' }, { s: 8, d: 'b7' }, { s: 10, d: 'O' }, { s: 12, d: '5' }, { s: 14, d: 'A' }] },
  { id: 'dnb-jumpup', genre: 'dnb', name: 'Jump-Up Stabs', tag: 'jump-up',
    tip: 'Short, bouncy, cartoonish: clustered sixteenths with octave jumps and a dead note in the middle. Every note is staccato — the fun is in the gaps.',
    steps: [{ s: 0, d: 'R' }, { s: 1, d: 'R' }, { s: 3, d: 'O' }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 9, d: 'R' }, { s: 11, d: 'b7' }, { s: 14, d: 'R' }, { s: 15, d: 'O' }] },
  { id: 'dnb-neuro', genre: 'dnb', name: 'Neuro Growl', tag: 'neurofunk',
    tip: 'Half-time bass under full-speed drums: a long root, a ♭3 growl, and a re-triggered tail. Neuro lines are sound design more than note choice — the movement is in the filter.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 4, g: true }, { s: 6, d: 'b3' }, { s: 8, d: 'R', l: 3 }, { s: 12, d: 'b7' }, { s: 13, g: true }, { s: 15, d: 'R' }] },

  // ---------------------------------------------------------------- jungle ----
  { id: 'jungle-ragga', genre: 'jungle', name: 'Ragga Sub Drop', tag: 'ragga jungle',
    tip: 'Chopped Amen breaks above, a reggae sub below. The bass ignores the drums entirely and plays half-time — that collision of tempos IS jungle.',
    steps: [{ s: 0, d: 'R', l: 6 }, { s: 6, g: true }, { s: 8, d: 'R', l: 4 }, { s: 12, d: '5' }, { s: 14, g: true }] },
  { id: 'jungle-dub', genre: 'jungle', name: 'Dub Bassline', tag: 'dub-plate jungle',
    tip: 'Lifted straight from a 70s dub record: root, ♭3, 4, 5 climbing slowly with enormous space between the notes. Roll the tone control right off.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, g: true }, { s: 6, d: 'b3', l: 2 }, { s: 10, d: '4' }, { s: 12, d: '5', l: 3 }] },
  { id: 'jungle-walk', genre: 'jungle', name: 'Amen Walk', tag: 'darkside jungle',
    tip: 'A minor-pentatonic walk pushed onto the off-sixteenths so it never agrees with the break. The bass and the drums are in the same bar and nowhere near the same groove.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'b3' }, { s: 6, d: '4' }, { s: 8, d: '5' }, { s: 11, d: 'b7' }, { s: 14, d: 'A' }] },

  // ------------------------------------------------------------ UK garage ----
  { id: 'garage-2step', genre: 'garage', name: '2-Step Swung Bass', tag: '2-step garage',
    tip: 'Skip the note where the kick skips beat 3. Swing the sixteenths to 62% and the whole line starts to limp in the right way — garage is a swing setting.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: 'R' }, { s: 10, d: '5' }, { s: 12, g: true }, { s: 14, d: 'b7' }] },
  { id: 'garage-oct', genre: 'garage', name: 'Garage Octave Skip', tag: 'UKG',
    tip: 'Root down, octave up, always landing off the grid. Play it on a filtered saw with a short decay so each note is a blip rather than a tone.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'O' }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: 'O' }, { s: 12, d: '5' }, { s: 15, g: true }] },
  { id: 'garage-speed', genre: 'garage', name: 'Speed Garage Wobble', tag: 'speed garage',
    tip: 'Every real note is shadowed by a dead one a sixteenth later — the “wobble” before wobble had an LFO. Deep, short, and relentlessly paired.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 2, d: 'R' }, { s: 3, g: true }, { s: 6, d: 'R' }, { s: 7, g: true }, { s: 10, d: 'R' }, { s: 11, g: true }, { s: 14, d: 'R' }, { s: 15, g: true }] },
  { id: 'garage-organ', genre: 'garage', name: 'Organ-Bass Stab', tag: 'organ bass',
    tip: 'Doubled off-beat stabs, root then fifth then ♭7 — the sound of a Hammond patch pitched into the sub. Pairs of sixteenths, never single hits.',
    steps: [{ s: 2, d: 'R' }, { s: 3, d: 'R' }, { s: 6, d: '5' }, { s: 7, d: '5' }, { s: 10, d: 'R' }, { s: 11, d: 'R' }, { s: 14, d: 'b7' }, { s: 15, d: 'b7' }] },

  // --------------------------------------------------------------- dubstep ----
  { id: 'dubstep-wob', genre: 'dubstep', name: 'Half-Time Wobble', tag: 'wobble bass',
    tip: 'One pitch, re-triggered at changing rates — the note lengths are the melody. Route an LFO to the filter and let its rate follow this rhythm.',
    steps: [{ s: 0, d: 'R', l: 2 }, { s: 2, d: 'R', l: 1 }, { s: 3, d: 'R', l: 1 }, { s: 4, d: 'R', l: 2 }, { s: 8, d: 'b3', l: 4 }, { s: 12, d: 'R', l: 2 }, { s: 14, d: 'R', l: 2 }] },
  { id: 'dubstep-sub', genre: 'dubstep', name: 'Sub Drone', tag: '140 sub-bass',
    tip: 'At 140 half-time there is room for exactly two events per bar. A pure sine root, then a ♭7 to hint at the change — everything else is space by design.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, d: 'R', l: 5 }, { s: 14, d: 'b7', l: 2 }] },
  { id: 'dubstep-grime', genre: 'dubstep', name: 'Grime Square Riff', tag: 'grime · eskibeat',
    tip: 'A square-wave riff played like a melody instead of a sub: ♭3s and ♭6s stabbing in sixteenths. Grime’s bass is the lead instrument, not the foundation.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'b3' }, { s: 3, d: 'R' }, { s: 6, d: '5' }, { s: 8, d: 'R' }, { s: 10, d: 'b6' }, { s: 11, d: 'R' }, { s: 14, d: '5' }, { s: 15, g: true }] },

  // --------------------------------------------------------------- breakbeat ----
  { id: 'breaks-bigbeat', genre: 'breaks', name: 'Big Beat Riff', tag: 'big beat',
    tip: 'A distorted rock riff at 130 with a break underneath: root, ♭3, 4 — pentatonic and deliberately dumb. Play it through an amp, not a DI.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 3, d: 'b3' }, { s: 6, d: '4' }, { s: 8, d: 'R' }, { s: 10, d: 'R' }, { s: 11, d: 'b7' }, { s: 14, d: '5' }] },
  { id: 'breaks-rave', genre: 'breaks', name: 'Rave Stab', tag: 'hardcore rave',
    tip: 'Long root, octave jump, fifth — the 1992 rave bass, played on a sampled organ and pitched wherever the record needed it. Simple, huge, and unbothered by taste.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: 'O' }, { s: 6, d: 'R' }, { s: 8, d: '5', l: 3 }, { s: 12, d: 'O' }, { s: 14, d: 'R' }] },
  { id: 'breaks-bruk', genre: 'breaks', name: 'Broken-Beat Line', tag: 'bruk · West London',
    tip: 'Jazz harmony over a deliberately stumbling kick: ♭7s, 9s and dead notes placed so nothing lands where the ear expects. Broken beat is funk that keeps tripping on purpose.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 3, d: 'b7' }, { s: 5, d: 'R' }, { s: 6, g: true }, { s: 8, d: 'O' }, { s: 10, d: '5' }, { s: 11, g: true }, { s: 13, d: '2' }, { s: 14, d: 'A' }] },
];
