// Jazz, jazz-fusion and the blues/shuffle family — everything whose feel lives
// in the swing setting rather than in the step pattern.
import type { DrumTemplate } from '../drums';

export const JAZZ_PATTERNS: DrumTemplate[] = [
  // ---------------------------------------------------------------- jazz ----
  {
    id: 'swing', name: 'Medium swing', genre: 'jazz', bpm: 138, swing: 66,
    tip: 'Timekeeping moves UP to the ride: “ding … ding-ga-ding”. The hat pedal chicks on 2 & 4, the kick feathers almost inaudibly, and the snare only comments. Swing at 66 makes the 8ths triplet-shaped.',
    layers: [
      { name: 'Ride pattern', why: 'Quarter pulse plus the skip note after beats 2 & 4 — “ding, ding-ga-ding”. With swing at 66 the skip lands on the triplet.', add: [{ v: 'ride', on: [0, 4, 6, 8, 12, 14], acc: [4, 12] }] },
      { name: 'Hat on 2 & 4', why: 'The hi-hat foot chicks on 2 & 4 — jazz’s whispered backbeat.', add: [{ v: 'chat', on: [4, 12] }] },
      { name: 'Feathered kick', why: 'The kick brushes all four beats so quietly it is felt, not heard — “feathering”.', add: [{ v: 'kick', on: [0, 4, 8, 12] }] },
      { name: 'Snare comping', why: 'Sparse off-beat snare accents — comping is a conversation with the soloist, not a fixed part.', add: [{ v: 'snare', on: [6, 11] }] },
    ],
  },
  {
    id: 'jazz-bebop', name: 'Up-tempo bebop', genre: 'jazz', bpm: 190, swing: 62,
    tip: 'At bebop speed the swing flattens out (real drummers play closer to straight 8ths above ~200), the ride simplifies, and the comping gets sparser and more explosive.',
    layers: [
      { name: 'Fast ride', why: 'The ride keeps quarters with only one skip note per bar — at this tempo more would blur.', add: [{ v: 'ride', on: [0, 4, 6, 8, 12], acc: [0, 8] }] },
      { name: 'Hat 2 & 4', why: 'The foot keeps 2 & 4 no matter how fast the tune goes; it is the band’s anchor.', add: [{ v: 'chat', on: [4, 12] }] },
      { name: 'Bomb drops', why: 'A loud, unpredictable kick “bomb” on the “and of 3” — bebop drummers punctuate rather than keep time with the bass drum.', add: [{ v: 'kick', on: [10], acc: [10] }] },
      { name: 'Comping snare', why: 'One snare accent on the “a of 1” answers the horn line. Move it every chorus.', add: [{ v: 'snare', on: [3] }] },
    ],
  },
  {
    id: 'jazz-brushes', name: 'Brushes ballad', genre: 'jazz', bpm: 72, swing: 66,
    tip: 'The slow ballad: brushes sweeping the snare on every beat, a side-stick backbeat, and the ride only marking the quarters. Everything is at whisper volume — build it with velocities under 60.',
    layers: [
      { name: 'Brush sweep', why: 'A quiet snare on every beat represents the circular brush sweep — continuous sound rather than hits.', add: [{ v: 'snare', on: [0, 4, 8, 12] }] },
      { name: 'Side-stick on 2 & 4', why: 'The cross-stick is the only defined backbeat in a ballad.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Ride quarters', why: 'The ride marks time softly on the beats, with a triplet skip before beat 1 of the next bar.', add: [{ v: 'ride', on: [0, 4, 8, 12, 14], acc: [0] }] },
      { name: 'Feathered kick', why: 'Barely-there kick on 1 and 3 anchors the bass player.', add: [{ v: 'kick', on: [0, 8] }] },
    ],
  },
  {
    id: 'jazz-twofeel', name: 'Two-feel', genre: 'jazz', bpm: 132, swing: 66,
    tip: 'The head arrangement: bass plays half notes, so the drummer implies 2 rather than 4. Ride on the half-note pulse, hat still on 2 & 4 — the same tune feels twice as light as in swing.',
    layers: [
      { name: 'Half-note ride', why: 'The ride marks 1 and 3 with a skip note after each — the “two feel” that opens a tune up.', add: [{ v: 'ride', on: [0, 2, 8, 10], acc: [0, 8] }] },
      { name: 'Hat on 2 & 4', why: 'The hat foot keeps its job, which is what stops a two-feel drifting into half-time.', add: [{ v: 'chat', on: [4, 12] }] },
      { name: 'Kick on 1 & 3', why: 'A soft kick doubling the bass player’s half notes.', add: [{ v: 'kick', on: [0, 8] }] },
      { name: 'Rim colour', why: 'A quiet cross-stick on the “and of 4” hints at the four-feel to come after the head.', add: [{ v: 'rim', on: [14] }] },
    ],
  },
  {
    id: 'jazz-latin', name: 'Jazz-Latin (bossa-swing)', genre: 'jazz', bpm: 140, swing: 52,
    tip: 'The straight-8ths section of a jazz tune: ride playing even 8ths instead of the swing pattern, cross-stick playing a clave-derived figure, and the kick on a Latin two-feel. Set the swing near 50 — straight is the point.',
    layers: [
      { name: 'Straight ride 8ths', why: 'Even 8ths, no swing — the flip that tells the band this section is Latin, not swing.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Cross-stick clave', why: 'A rim figure on the bossa clave (1, “and of 2”, 4, “and of 1” of the next half) is the timeline.', add: [{ v: 'rim', on: [0, 6, 10, 12], acc: [0, 6] }] },
      { name: 'Latin kick', why: 'Kick on 1 and beat 3 with an anticipation on the “and of 3” — the bossa surdo feel.', add: [{ v: 'kick', on: [0, 8, 10], acc: [0] }] },
      { name: 'Hat 2 & 4', why: 'The hat foot keeps chicking so the jazz feel never fully leaves the room.', add: [{ v: 'chat', on: [4, 12] }] },
    ],
  },

  // -------------------------------------------------------------- fusion ----
  {
    id: 'fusion-linear', name: 'Linear fusion', genre: 'fusion', bpm: 104, swing: 52,
    tip: 'The fusion trademark: a linear 16th line where kick, snare and hat never hit together, so the groove sounds like one continuous melody played by three drums. Great for programming — no two voices share a step.',
    layers: [
      { name: 'Kick voice', why: 'The kick claims 1, the “a of 1” and the “and of 3”. Nothing else may use those steps.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Snare voice', why: 'Backbeat plus ghost notes, all on steps the kick left free — the linear rule in action.', add: [{ v: 'snare', on: [4, 7, 12, 14], acc: [4, 12] }] },
      { name: 'Hat voice', why: 'Hats occupy the remaining 16ths. Play the three rows together and you hear one unbroken 16th line.', add: [{ v: 'chat', on: [1, 2, 5, 6, 8, 9, 11, 13] }] },
      { name: 'Ride bell accent', why: 'A bell hit on the last 16th ends the phrase and marks the loop point.', add: [{ v: 'ride', on: [15], acc: [15] }] },
    ],
  },
  {
    id: 'fusion-halfshuffle', name: 'Half-time shuffle', genre: 'fusion', bpm: 96, swing: 66,
    tip: 'The most famous groove in fusion: a shuffled 16th hat over a half-time backbeat, with ghost notes filling every triplet gap. Set swing to 66 and keep the ghost velocities very low.',
    layers: [
      { name: 'Snare on 3', why: 'Half-time backbeat: one loud snare per bar, on beat 3.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Shuffled hats', why: 'Hats on the swung off-8ths — with swing at 66 these land on the triplet and the shuffle appears.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Ghost web', why: 'Six whispered snares around the bar are the actual content of this groove. They must be nearly inaudible.', add: [{ v: 'snare', on: [2, 3, 6, 7, 11, 15] }] },
      { name: 'Kick pattern', why: 'Kick on 1 and the “and of 2” anchors the shuffle without competing with the ghost notes.', add: [{ v: 'kick', on: [0, 6], acc: [0] }] },
    ],
  },
  {
    id: 'fusion-funk', name: 'Funk-fusion 16ths', genre: 'fusion', bpm: 108, swing: 52,
    tip: 'Funk played with a jazz vocabulary: ride instead of hat, a busy syncopated kick, and snare accents that move around instead of sitting on 2 & 4.',
    layers: [
      { name: 'Ride 16ths', why: 'Riding on the cymbal instead of the hat opens the top end — the first thing that makes funk sound like fusion.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Displaced backbeat', why: 'Snare on 2 and then the “e of 4” instead of beat 4 — moving one backbeat is a fusion signature.', add: [{ v: 'snare', on: [4, 13], acc: [4, 13] }] },
      { name: 'Busy kick', why: 'Four kicks in syncopated positions carry the funk while the snare is off doing something else.', add: [{ v: 'kick', on: [0, 3, 6, 10], acc: [0] }] },
      { name: 'Ghost snares', why: 'Ghosts on the “a of 2” and “and of 3” tie the displaced backbeat back to the grid.', add: [{ v: 'snare', on: [7, 10] }] },
      { name: 'Open-hat accent', why: 'One open hat on the “a of 4” gives the loop a seam.', add: [{ v: 'ohat', on: [15] }] },
    ],
  },
  {
    id: 'fusion-gospelchops', name: 'Gospel-chops pocket', genre: 'fusion', bpm: 92, swing: 54,
    tip: 'Modern fusion/gospel crossover: deep pocket underneath, a dense ghost-note carpet, and a hat that opens on off-beats. Loud backbeat, very quiet everything else — the dynamic range is the technique.',
    layers: [
      { name: 'Deep backbeat', why: 'Snare on 2 & 4, hit hard. In this style the gap between the loudest and quietest note is enormous.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Pocket kick', why: 'Kick on 1, the “a of 1” and the “and of 3” — simple enough to leave the hands room.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Ghost carpet', why: 'Ghost snares on every remaining “e” and “a” — a continuous 16th whisper under the backbeat.', add: [{ v: 'snare', on: [1, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Hat 8ths', why: 'Hats on the 8ths keep the pulse readable through the ghost-note haze.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12] }] },
      { name: 'Open-hat splash', why: 'An open hat on the “and of 4” marks the turnaround.', add: [{ v: 'ohat', on: [14] }] },
    ],
  },

  // --------------------------------------------------------------- blues ----
  {
    id: 'shuffle', name: 'Shuffle blues', genre: 'blues', bpm: 112, swing: 66,
    tip: 'A rock beat poured into triplets: same kick-and-backbeat skeleton, but every 8th is swung hard (66 = true triplet). Toggle swing back to 50 and it stiffens into rock — that difference IS the shuffle.',
    layers: [
      { name: 'Kick pulse', why: 'Kick on all four beats keeps the dance floor moving — common in Chicago-style shuffles.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Backbeat snare', why: 'Snare cracks 2 & 4, exactly like rock — the skeleton does not change, only the feel.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Shuffled 8ths', why: 'Hats play 8ths, but the swing drags every off-beat onto the last triplet: “doo-DAT doo-DAT”.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Open-hat turn', why: 'An open hat takes over the “and of 4”, turning the bar around into the next chorus.', add: [{ v: 'ohat', on: [14] }] },
    ],
  },
  {
    id: 'blues-texas', name: 'Texas shuffle', genre: 'blues', bpm: 122, swing: 66,
    tip: 'The shuffle played on the snare itself: the drummer shuffles with both hands, so the ghost notes are part of the timekeeping. Bigger, rowdier and more swinging than a Chicago shuffle.',
    layers: [
      { name: 'Shuffled snare', why: 'The snare plays the full shuffle pattern with ghosts on the swung off-beats and accents on 2 & 4.', add: [{ v: 'snare', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [4, 12] }] },
      { name: 'Four-beat kick', why: 'The kick keeps a steady four so the shuffling hands can float above it.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Ride shuffle', why: 'The ride doubles the shuffle on the cymbal, which is what makes this beat so big in a live room.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Kick pickup', why: 'A swung kick on the “and of 4” pushes into the next bar.', add: [{ v: 'kick', on: [14] }] },
    ],
  },
  {
    id: 'blues-slow', name: 'Slow blues (12/8)', genre: 'blues', bpm: 62, swing: 66,
    tip: 'The 12/8 slow blues: with swing at 66 the 8ths become triplets, so this reads as four groups of three. Ride on every triplet, snare on 2 & 4, kick on 1 & 3 — the grandest, laziest groove in the book.',
    layers: [
      { name: 'Triplet ride', why: 'The ride plays every swung 8th, which at 66% swing is the triplet pulse of 12/8.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Backbeat snare', why: 'Snare on 2 & 4, hit hard and left to ring — at 62 BPM there is time for it to decay completely.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Kick on 1 & 3', why: 'Two kicks per bar. Any more and the enormous space that makes slow blues work disappears.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Triplet fill', why: 'Three snare notes at the end of the bar are the classic slow-blues turnaround fill.', add: [{ v: 'snare', on: [13, 14, 15] }] },
    ],
  },
  {
    id: 'blues-train', name: 'Train beat', genre: 'blues', bpm: 128, swing: 60,
    tip: 'Country and rockabilly’s engine: constant 16th snare (mostly ghosted) that sounds like a train on rails, with accents on 2 & 4. Program the ghosts at very low velocity — the accents are what you hear.',
    layers: [
      { name: 'Snare 16ths', why: 'Continuous 16ths on the snare with brushes or sticks — this single layer is the train.', add: [{ v: 'snare', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [4, 12] }] },
      { name: 'Kick on 1 & 3', why: 'The kick just marks the strong beats — the snare is doing all the work.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Rim on 2 & 4', why: 'A cross-stick doubles the backbeat accents so they cut through the 16th carpet.', add: [{ v: 'rim', on: [4, 12] }] },
      { name: 'Hat quarters', why: 'A closed hat on each beat gives the ear a slower pulse to hold on to.', add: [{ v: 'chat', on: [0, 4, 8, 12] }] },
    ],
  },
];
