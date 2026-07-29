// Jazz, jazz-fusion, the soul-jazz/jazz-funk crossover, and the blues/shuffle
// family — everything whose feel lives in the swing setting rather than in the
// step pattern.
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

  // ----------------------------------------------------------- soul-jazz ----
  {
    id: 'souljazz-boogaloo', name: 'Boogaloo', genre: 'souljazz', bpm: 104, swing: 58,
    tip: 'The groove that took jazz out of the concert hall and back onto the dance floor: a Latin-tinged kick under a hard backbeat, hats swung just enough to lean. Not straight, not a jazz triplet — sit the swing around 58 and it lands exactly between the two.',
    layers: [
      { name: 'Boogaloo kick', why: 'Kick on 1, the “and of 2” and the “a of 3” — a tresillo pulled toward funk. It never plays a plain four.', add: [{ v: 'kick', on: [0, 6, 11], acc: [0] }] },
      { name: 'Backbeat snare', why: 'A real backbeat on 2 & 4 is the whole point: this is jazz phrasing over an R&B drummer.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Loose 8th hats', why: 'Hats on 8ths with a half-swing. Push the SWING slider to 66 and it becomes an organ shuffle instead.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Tambourine', why: 'Off-beat tambourine is the one soul ingredient the jazz rhythm section borrowed wholesale.', add: [{ v: 'tamb', on: [2, 6, 10, 14] }] },
      { name: 'Ghost snares', why: 'Two whispered taps on the “a of 2” and the last 16th roll the bar over into the next one.', add: [{ v: 'snare', on: [7, 15] }] },
    ],
  },
  {
    id: 'souljazz-organ', name: 'Organ-trio shuffle', genre: 'souljazz', bpm: 108, swing: 66,
    tip: 'The Hammond trio groove: ride carrying a full shuffle, hat foot chicking 2 & 4, and the kick reduced to two notes because the organ pedals are playing the bass. Greasy rather than fast.',
    layers: [
      { name: 'Shuffled ride', why: 'The ride plays every swung 8th — at 66 that is a rolling triplet, and it is the entire timekeeping part.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Hat foot on 2 & 4', why: 'The jazz hat foot survives intact even though everything else has turned into R&B.', add: [{ v: 'chat', on: [4, 12] }] },
      { name: 'Two-note kick', why: 'Kick on 1 and the “and of 3”. The organist’s left hand or pedals own the low end, so the drummer stays out of it.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Backbeat', why: 'Snare on 2 & 4 — firmer than swing jazz, softer than funk. It rides the shuffle rather than cracking on top of it.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Triplet ghosts', why: 'Ghost snares on the swung off-beats fill the triplet gaps under the solo.', add: [{ v: 'snare', on: [2, 6, 14] }] },
    ],
  },
  {
    id: 'souljazz-gospel', name: 'Gospel-jazz 12/8', genre: 'souljazz', bpm: 76, swing: 66,
    tip: 'The church side of soul-jazz: swing at 66 turns the 8ths into a 12/8 triplet bed, cross-stick keeps the backbeat quiet, and the whole bar sways. Play everything at low velocity except the ride accents.',
    layers: [
      { name: 'Triplet ride', why: 'Every swung 8th on the ride — four groups of three, which is what makes this read as 12/8 without changing a step.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Cross-stick backbeat', why: 'Side-stick on 2 & 4 marks the backbeat without ever raising its voice — the ballad setting of the style.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Kick on 1 & 3', why: 'Two soft kicks per bar. At this tempo any more low end swallows the space the horns need.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Tambourine on the beats', why: 'Tambourine on the quarters rather than the off-beats — a congregation, not a Motown session.', add: [{ v: 'tamb', on: [0, 4, 8, 12] }] },
      { name: 'Snare turnaround', why: 'Three triplet snares at the end of the bar are the fill that hands the tune back to the soloist.', add: [{ v: 'snare', on: [13, 14, 15] }] },
    ],
  },
  {
    id: 'souljazz-clap', name: 'Hand-clap soul-jazz', genre: 'souljazz', bpm: 116, swing: 58,
    tip: 'The live-trio crossover hit: audience claps doubling the backbeat, a two-beat kick, and swung hats driving it. Simple on paper — the energy is entirely in the clap layer and the tempo.',
    layers: [
      { name: 'Backbeat plus claps', why: 'Snare and hand-claps together on 2 & 4. The claps are the record’s hook as much as the piano is.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'clap', on: [4, 12] }] },
      { name: 'Two-beat kick', why: 'Kick on 1 and 3 only — the bass player is walking, so the bass drum just marks the strong beats.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Swung hats', why: 'Hats on 8ths with a light swing keep it dancing without tipping into a full shuffle.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Kick pickup', why: 'A single kick on the “a of 3” pushes into beat 4 — the one bit of syncopation in the bar.', add: [{ v: 'kick', on: [11] }] },
      { name: 'Ride bell', why: 'A bell hit on 1 and 3 puts the jazz drummer’s signature back on top of an R&B beat.', add: [{ v: 'ride', on: [0, 8] }] },
    ],
  },

  // ----------------------------------------------------------- jazz-funk ----
  {
    id: 'jazzfunk-crossover', name: 'Crossover 16ths', genre: 'jazzfunk', bpm: 104, swing: 54,
    tip: 'The 70s crossover production sound: a funk 16th bed under jazz harmony, kick answering itself in 16ths, and percussion — not more kit — providing the sparkle. Everything is played politely; the arrangement does the shouting.',
    layers: [
      { name: 'Crossover kick', why: 'Kick on 1 and 3 with a 16th answer after each — busier than soul, tidier than funk.', add: [{ v: 'kick', on: [0, 3, 8, 11], acc: [0] }] },
      { name: 'Backbeat snare', why: 'A rigid 2 & 4. In this style the drummer holds the pocket while the horns and Rhodes move.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '16th hats', why: 'Continuous 16ths, quiet, accented on the quarters — the sheen these records are mixed around.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Tambourine', why: 'Off-beat tambourine lifts the whole loop. Add percussion before you add drums — that is the crossover rule.', add: [{ v: 'tamb', on: [2, 6, 10, 14] }] },
      { name: 'Ghost snares', why: 'Two ghosts on the “a of 2” and the last 16th stop the backbeat sounding stamped on.', add: [{ v: 'snare', on: [7, 15] }] },
    ],
  },
  {
    id: 'jazzfunk-laidback', name: 'Laid-back crossover', genre: 'jazzfunk', bpm: 92, swing: 58,
    tip: 'The mellow end of jazz-funk: cross-stick instead of snare, shaker instead of hats, and a kick that speaks twice a bar. Built to sit under a flute or a vibraphone without ever competing.',
    layers: [
      { name: 'Cross-stick backbeat', why: 'Side-stick on 2 & 4 — the backbeat is present but weightless, which is what makes the track float.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Two-note kick', why: 'Kick on 1 and the “and of 3”, the Memphis skeleton borrowed straight into jazz.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Shaker 16ths', why: 'A shaker carries the subdivision instead of a hat — softer top end, and it never fights the cymbals.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ride-bell quarters', why: 'A bell on each beat gives the ear a slow pulse above the shaker haze.', add: [{ v: 'ride', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Ghost snares', why: 'Three whispered snares around the cross-stick are the only trace of a funk drummer left.', add: [{ v: 'snare', on: [7, 11, 15] }] },
    ],
  },
  {
    id: 'jazzfunk-ride', name: 'Ride-led jazz-funk', genre: 'jazzfunk', bpm: 112, swing: 56,
    tip: 'Funk played by a jazz drummer: timekeeping stays on the ride, the kick syncopates underneath, and a conga answers every phrase. The ride is what separates this from plain funk.',
    layers: [
      { name: 'Ride 8ths', why: 'Riding the cymbal instead of the hat opens the top end and keeps one foot in jazz.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Backbeat snare', why: 'Snare on 2 & 4, hit firmly — the anchor the syncopated kick is measured against.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Syncopated kick', why: 'Kick on 1, the “a of 1” and the “and of 3” — the funk figure, played under a jazz cymbal.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Conga answers', why: 'A hand drum answering in the gaps is how these records fill space without a second drummer.', add: [{ v: 'htom', on: [7, 11, 14] }] },
      { name: 'Ghost snares', why: 'Ghosts on the “and of 1” and the last 16th tie the kick figure back to the backbeat.', add: [{ v: 'snare', on: [2, 15] }] },
    ],
  },
  {
    id: 'jazzfunk-latin', name: 'Latin jazz-funk', genre: 'jazzfunk', bpm: 118, swing: 52,
    tip: 'The spiritual/cosmic end of the style: straight 16ths, congas in both hands, and a cowbell hinting at the tresillo. Set swing to 50 — this one is dead straight, and the Latin percussion supplies all the lean.',
    layers: [
      { name: 'Anticipating kick', why: 'Kick on 1, the “and of 2”, 3 and the “and of 4” — it anticipates the beat instead of landing on it.', add: [{ v: 'kick', on: [0, 6, 8, 14], acc: [0] }] },
      { name: 'Backbeat snare', why: 'A backbeat is what keeps this jazz-funk rather than Latin jazz: the clave-side parts sit on top of it.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Straight 16th hats', why: 'No swing at all. Every bit of the groove’s lean comes from the percussion parts, not the timing.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Congas', why: 'High conga on the “a”s, low conga answering — two hands weaving, the way a percussionist actually plays.', add: [{ v: 'htom', on: [3, 7, 11, 15] }, { v: 'ltom', on: [2, 10] }] },
      { name: 'Cowbell timeline', why: 'Bell on 1, the “and of 2” and the “and of 3” — a tresillo hiding inside the 16ths.', add: [{ v: 'cowbell', on: [0, 6, 10] }] },
    ],
  },
  {
    id: 'jazzfunk-vibes', name: 'Slow vibes vamp', genre: 'jazzfunk', bpm: 88, swing: 60,
    tip: 'A two-chord vamp groove: cross-stick, ride bell 8ths, tambourine doubling the backbeat, and a kick that lands late on purpose. Hypnotic rather than driving — programmed to loop for six minutes.',
    layers: [
      { name: 'Cross-stick backbeat', why: 'Side-stick on 2 & 4 keeps the pulse readable at whisper volume.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Two kicks', why: 'Beat 1 and the “a of 3”. The late second kick is what gives the bar its sway.', add: [{ v: 'kick', on: [0, 11], acc: [0] }] },
      { name: 'Ride-bell 8ths', why: 'A bell pattern instead of hats — dark, ringing, and it blurs slightly with the swing at 60.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Tambourine on 2 & 4', why: 'Tambourine doubling the backbeat rather than the off-beats widens it without adding volume.', add: [{ v: 'tamb', on: [4, 12] }] },
      { name: 'Ghost snares', why: 'Three ghosts on the “a”s are the only thing moving in the second half of each beat.', add: [{ v: 'snare', on: [3, 7, 15] }] },
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
