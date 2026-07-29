// Funk, soul/Motown, neo-soul and gospel basslines — the family where the bass
// stops accompanying and starts leading. Ghost notes, space and the placement of
// the ONE do more work here than any choice of note.
import type { BassPattern } from '../bass';

export const FUNK_SOUL_BASSLINES: BassPattern[] = [
  // ------------------------------------------------------------------ funk ----
  { id: 'ontheone', genre: 'funk', name: 'On the One', tag: 'James Brown funk',
    tip: 'Whatever else happens, the root owns beat ONE — everything after is syncopation and ghost notes. The bass is a drum that happens to have pitch.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 6, g: true }, { s: 7, g: true }, { s: 8, d: '5' }, { s: 11, g: true }, { s: 12, d: 'b7' }, { s: 14, d: 'R' }] },
  { id: 'jackson', genre: 'funk', name: 'Chameleon Space Riff', tag: 'Paul Jackson · Headhunters',
    tip: 'A short, syncopated Dorian riff repeated until it’s hypnotic. The rests are the funk — Jackson leaves beat 3 almost empty and lets the drums show through.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'b3' }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: '2' }, { s: 11, d: 'b3' }, { s: 14, d: '5' }] },
  { id: 'marcus', genre: 'funk', name: 'Slap Octaves', tag: 'Marcus Miller',
    tip: 'Thumb the root, pluck the octave, and pepper the gaps with dead-note "chk"s. The chromatic climb ♭7–7–8 into the octave is pure Marcus.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, g: true }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: 'b7' }, { s: 11, d: 'n7' }, { s: 12, d: 'O' }, { s: 14, g: true }] },
  { id: 'funk-ghostwalk', genre: 'funk', name: 'Ghost-Note Carpet', tag: 'Rocco Prestia · Tower of Power',
    tip: 'Every one of the sixteen sixteenths is played — but only five of them have pitch. Fingerstyle funk at its most extreme: the line is a groove of muted strings with notes poking through.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 2, g: true }, { s: 3, d: 'b7' }, { s: 4, g: true }, { s: 6, d: 'R' }, { s: 7, g: true }, { s: 8, d: '5' }, { s: 9, g: true }, { s: 10, g: true }, { s: 11, d: 'b7' }, { s: 12, d: 'R' }, { s: 13, g: true }, { s: 14, g: true }, { s: 15, d: 'A' }] },

  // ------------------------------------------------------------------ soul ----
  { id: 'jamerson', genre: 'soul', name: 'Motown Boogie Cell', tag: 'James Jamerson',
    tip: 'The 1–5–6–♭7 climb to the octave and back — bedrock of Motown and soul. The last eighth abandons the cell to walk chromatically into the next chord: Jamerson never wastes a pickup.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '5' }, { s: 4, d: '6' }, { s: 6, d: 'b7' }, { s: 8, d: 'O' }, { s: 10, d: 'b7' }, { s: 12, d: '6' }, { s: 14, d: 'A' }] },
  { id: 'soul-stax', genre: 'soul', name: 'Memphis Pocket', tag: 'Duck Dunn · Stax',
    tip: 'Five notes and total discipline. Duck Dunn played fewer notes than anyone at Stax and made every record move — the feel is entirely in sitting a hair behind the snare.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: 'R' }, { s: 6, d: '5' }, { s: 8, d: 'R', l: 3 }, { s: 12, d: '6' }, { s: 14, d: 'A' }] },
  { id: 'soul-southern', genre: 'soul', name: 'Southern Soul Climb', tag: 'Muscle Shoals',
    tip: 'A gospel-schooled climb through the chord: root, five, six, ♭7, octave — then fall back down. It is the Motown cell slowed down and given room to sing.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5' }, { s: 6, d: '6' }, { s: 8, d: 'b7' }, { s: 10, d: 'O' }, { s: 12, d: '5' }, { s: 14, d: 'A' }] },
  { id: 'soul-philly', genre: 'soul', name: 'Philly Sweetness', tag: 'Ronnie Baker · Philadelphia',
    tip: 'The line that carried soul into disco: octaves and ♭7s under a string arrangement, played smoothly rather than percussively. Long notes, no slap, everything legato.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 3, g: true }, { s: 4, d: '5' }, { s: 6, d: 'R' }, { s: 8, d: 'O' }, { s: 10, d: 'b7' }, { s: 12, d: '6' }, { s: 14, d: '5' }] },

  // -------------------------------------------------------------- neo-soul ----
  { id: 'neo-pocket', genre: 'neosoul', name: 'Behind the Beat', tag: 'Pino Palladino · D’Angelo',
    tip: 'The whole style in one instruction: play it late. The notes are almost nothing — root, ♭7, five — but each one arrives a hair after where the drummer put it, and the loop starts to lean.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 5, g: true }, { s: 6, d: 'b7' }, { s: 8, d: 'R' }, { s: 10, g: true }, { s: 11, d: '5' }, { s: 14, d: '2' }] },
  { id: 'neo-thumb', genre: 'neosoul', name: 'Muted Thumb Line', tag: 'neo-soul R&B',
    tip: 'Played with the thumb over the pickup, everything short and round. Dead notes outnumber real ones — the bass is doing the hi-hat’s job while the Rhodes holds the harmony.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'O' }, { s: 4, g: true }, { s: 6, d: 'b3' }, { s: 8, g: true }, { s: 10, d: 'R' }, { s: 11, g: true }, { s: 13, d: '5' }, { s: 15, g: true }] },
  { id: 'neo-nine', genre: 'neosoul', name: 'Landing on the 9', tag: 'Glasper-era R&B',
    tip: 'End the bar on the 9 instead of the root and the loop never closes — it just keeps hanging. One note choice, and a vamp turns into an atmosphere.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5' }, { s: 7, d: 'b7' }, { s: 8, d: 'O', l: 3 }, { s: 12, d: '2' }, { s: 14, g: true }] },
  { id: 'neo-halftime', genre: 'neosoul', name: 'Half-Time Drag', tag: 'slow neo-soul',
    tip: 'Two pitches in a bar at 75 BPM. When the drums are half-time the bass has to hold still too — the ghost notes at the edges are the only movement allowed.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, g: true }, { s: 10, d: 'b3' }, { s: 12, d: 'R', l: 3 }, { s: 15, g: true }] },

  // ---------------------------------------------------------------- gospel ----
  { id: 'gospel-walk', genre: 'gospel', name: 'Gospel Walk-Up', tag: 'church bass',
    tip: 'A full chromatic-ish climb into the change, with the ♭3 slid into the 3 on the way. Gospel bassists never arrive at a chord — they walk into it in front of the whole congregation.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '2' }, { s: 4, d: 'b3' }, { s: 5, d: '3' }, { s: 6, d: '4' }, { s: 8, d: '5' }, { s: 10, d: '6' }, { s: 12, d: 'b7' }, { s: 14, d: 'A' }] },
  { id: 'gospel-shout', genre: 'gospel', name: 'Shout Music Drive', tag: 'praise break',
    tip: 'Fast, loud, root-and-five, four to the bar and doubled — the bass part of the shout. There is no subtlety in a praise break and there is not meant to be.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 4, d: '5' }, { s: 6, d: '5' }, { s: 8, d: 'R' }, { s: 10, d: 'R' }, { s: 12, d: '5' }, { s: 14, d: 'A' }] },
  { id: 'gospel-pedal', genre: 'gospel', name: 'Organ Pedal', tag: 'Hammond bass pedals',
    tip: 'When the organist takes the bass with their feet, the line becomes long tones under moving chords. Hold the tonic through everything and only move to announce the cadence.',
    steps: [{ s: 0, d: 'T', l: 7 }, { s: 8, d: 'T', l: 4 }, { s: 12, d: 'T' }, { s: 14, d: 'A' }] },
  { id: 'gospel-tresillo', genre: 'gospel', name: 'Gospel 3+3+2', tag: 'contemporary gospel',
    tip: 'The tresillo cell wearing a Sunday suit: root on 1, root on the “and of 2”, fifth on beat 4 — with dead notes filling the triplet gaps that the drummer’s shuffle leaves behind.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 3, g: true }, { s: 6, d: 'R', l: 3 }, { s: 10, g: true }, { s: 12, d: '5' }, { s: 13, g: true }, { s: 15, d: 'A' }] },
];
