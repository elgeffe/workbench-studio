// The broken-kick family: drum & bass, jungle, UK garage, dubstep/grime and
// breakbeat. Everything here refuses the four-on-the-floor.
import type { DrumTemplate } from '../drums';

export const BREAKS_PATTERNS: DrumTemplate[] = [
  // ----------------------------------------------------------------- dnb ----
  {
    id: 'dnb', name: 'Two-step', genre: 'dnb', bpm: 172, swing: 50,
    tip: 'The default D&B beat: at 170+ the kick hits 1 and the “and of 3”, snare cracks 2 & 4. Half the density of house at twice the speed — the space is what makes it roll.',
    layers: [
      { name: 'Two-step kick', why: 'Kick on beat 1 and the “and of 3” — the skeleton every D&B break reduces to.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Snare 2 & 4', why: 'The snare stays on 2 & 4. At this tempo that alone sounds frantic — resist adding more.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '8th shuffle hats', why: 'Light 8th hats fill the top end. In a real break these would be the chopped cymbals of the sample.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Ghost roll', why: 'Ghost snares on the “and of 2” and the final 16th mimic the stumble of the original Amen break.', add: [{ v: 'snare', on: [6, 15] }] },
    ],
  },
  {
    id: 'dnb-liquid', name: 'Liquid roller', genre: 'dnb', bpm: 174, swing: 52,
    tip: 'Smooth, rolling and busy on top: the same two-step skeleton with a 16th ride/shaker layer and extra ghost snares so the beat flows instead of snapping.',
    layers: [
      { name: 'Two-step skeleton', why: 'Kick on 1 and the “and of 3”, snare on 2 & 4 — the constant every D&B subgenre keeps.', add: [{ v: 'kick', on: [0, 10], acc: [0] }, { v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '16th ride', why: 'A quiet ride or shaker on all 16ths is what makes liquid “roll” rather than punch.', add: [{ v: 'ride', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 8] }] },
      { name: 'Extra kick', why: 'A second kick on the “e of 2” fills the long gap between the two main kicks.', add: [{ v: 'kick', on: [5] }] },
      { name: 'Ghost snares', why: 'Three whispered snares scattered off the backbeat give the beat its liquid motion.', add: [{ v: 'snare', on: [3, 7, 14] }] },
    ],
  },
  {
    id: 'dnb-neuro', name: 'Neurofunk / techstep', genre: 'dnb', bpm: 174, swing: 50,
    tip: 'Harder, tighter, more mechanical: the kick doubles up, the snare is a single processed hit, and the hats are programmed rather than sampled. Almost no ghost notes — everything is deliberate.',
    layers: [
      { name: 'Doubled kick', why: 'Kick on 1, the “a of 1” and the “and of 3” — the extra 16th gives neuro its mechanical stutter.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Processed snare', why: 'One hard snare on 2 & 4, heavily compressed. No ghosts — the space is left for the bass design.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Programmed hats', why: 'Closed hats on the off-16ths only, so the top line locks with the bass modulation rather than the snare.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Kick before the snare', why: 'One more kick on the “a of 3” makes the second backbeat land harder by crowding it.', add: [{ v: 'kick', on: [11] }] },
    ],
  },
  {
    id: 'dnb-jumpup', name: 'Jump-up', genre: 'dnb', bpm: 175, swing: 50,
    tip: 'Party D&B: bouncy kick pattern, big snare, open hat on the off-beat, and a low tom for weight. Simpler than liquid, punchier than neuro.',
    layers: [
      { name: 'Bouncing kick', why: 'Kick on 1, the “and of 2” and the “and of 3” — three kicks give the beat its jump.', add: [{ v: 'kick', on: [0, 6, 10], acc: [0] }] },
      { name: 'Big snare', why: 'Snare on 2 & 4, loud and bright, meant to be heard over a rowdy bassline.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'Open hats on the “and”s — the one place where D&B borrows house’s see-saw.', add: [{ v: 'ohat', on: [2, 14] }] },
      { name: 'Closed-hat fill', why: 'Closed 8ths elsewhere keep the top line continuous between the open hats.', add: [{ v: 'chat', on: [4, 6, 8, 10, 12] }] },
      { name: 'Tom drop', why: 'A low tom on the “a of 4” punches the loop into the next bar.', add: [{ v: 'ltom', on: [15] }] },
    ],
  },

  // -------------------------------------------------------------- jungle ----
  {
    id: 'jungle-amen', name: 'Amen break', genre: 'jungle', bpm: 168, swing: 50,
    tip: 'The most-sampled bar in history, laid out on the grid: kick on 1 and the “a of 1”, snares on 2 and the “e of 3”, ghosts filling everywhere else. Chop this across pads and re-order the slices — that is jungle.',
    layers: [
      { name: 'Amen kicks', why: 'Kick on 1, the “a of 1” and the “and of 3” — note that the second kick is a 16th, not an 8th. That detail is the break.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Amen snares', why: 'Snare on beat 2 and the “e of 3” — the second snare arrives early, which is why the break feels like it is tripping forward.', add: [{ v: 'snare', on: [4, 9], acc: [4, 9] }] },
      { name: 'Ghost snares', why: 'Ghosts on the “a of 2”, “and of 4” and last 16th are the parts most people leave out — and they are why the break swings.', add: [{ v: 'snare', on: [7, 14, 15] }] },
      { name: 'Ride cymbal', why: 'A ride on the 8ths runs through the whole break; in a chop it is what makes slices sound continuous.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
    ],
  },
  {
    id: 'jungle-ragga', name: 'Ragga chop', genre: 'jungle', bpm: 165, swing: 54,
    tip: 'A break chopped and re-ordered so the snare lands in unexpected places, over a reggae-derived kick. Swing it slightly — jungle inherited its bounce from dancehall, not from techno.',
    layers: [
      { name: 'Displaced snares', why: 'Snares on the “e of 2”, beat 3 and the “a of 4” — nowhere near a standard backbeat. Re-ordering slices is the technique.', add: [{ v: 'snare', on: [5, 8, 15], acc: [5, 8] }] },
      { name: 'Dub kick', why: 'Kick on 1 and beat 3 only — a reggae one-drop skeleton under a chopped break.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Ghost chatter', why: 'Low-velocity snares between the loud ones are the break’s original ghost notes surviving the chop.', add: [{ v: 'snare', on: [2, 6, 11] }] },
      { name: 'Hat 8ths', why: 'Swung 8th hats hold the tempo together while the snares wander.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
    ],
  },
  {
    id: 'jungle-think', name: 'Think break', genre: 'jungle', bpm: 170, swing: 52,
    tip: 'The other great break: brighter and simpler than the Amen, with a snare on every backbeat plus a distinctive “a of 4” pickup. The go-to when the Amen is too busy.',
    layers: [
      { name: 'Backbeat snares', why: 'Snare on 2 & 4 — the Think break is much closer to a normal funk bar than the Amen is.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Kick pattern', why: 'Kick on 1, the “and of 1” and the “and of 3”: a bouncing funk foot rather than a syncopated one.', add: [{ v: 'kick', on: [0, 2, 10], acc: [0] }] },
      { name: 'The pickup', why: 'A snare on the “a of 4” is the phrase-ending flick every producer chops out of this break.', add: [{ v: 'snare', on: [15], acc: [15] }] },
      { name: 'Ride 8ths', why: 'The bright ride running through the break is why it cuts through a dense mix.', add: [{ v: 'ride', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
    ],
  },

  // -------------------------------------------------------------- garage ----
  {
    id: 'garage-2step', name: '2-step', genre: 'garage', bpm: 134, swing: 62,
    tip: 'UK garage’s defining beat: the kick deliberately skips beat 3, the snare keeps 2 & 4, and everything is swung hard. Set the swing slider to 62+ — without shuffle this pattern is just a broken rock beat.',
    layers: [
      { name: 'Skipping kick', why: 'Kick on 1 and the “a of 2” — beat 3 is left empty on purpose, which is what makes the beat “2-step”.', add: [{ v: 'kick', on: [0, 7], acc: [0] }] },
      { name: 'Snare on 2 & 4', why: 'The backbeat stays put so the missing kick is heard as an absence rather than confusion.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Shuffled 16th hats', why: 'Hats on 16ths with heavy swing — the shuffle is the genre. Drag SWING from 50 to 66 and hear garage appear.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Kick pickup', why: 'A final kick on the “and of 4” throws the bar into the next one.', add: [{ v: 'kick', on: [14] }] },
      { name: 'Rim ghost', why: 'A dry rim on the “e of 3” fills the hole beat 3 left.', add: [{ v: 'rim', on: [9] }] },
    ],
  },
  {
    id: 'garage-4x4', name: 'Speed garage (4x4)', genre: 'garage', bpm: 135, swing: 58,
    tip: 'Garage’s house-facing side: four-on-the-floor kick with a swung 16th shuffle and a clap-snare on 2 & 4. The pulse is house, the swing and the bassline are pure UK.',
    layers: [
      { name: 'Four on the floor', why: 'A house pulse at 135 — faster than house, straighter than 2-step.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Snare + clap', why: 'Both on 2 & 4, stacked, so the backbeat can compete with a very loud sub bass.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'clap', on: [4, 12] }] },
      { name: 'Shuffled hats', why: 'Swung 16ths across the whole bar — the shuffle that separates speed garage from plain house.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [2, 6, 10, 14] }] },
      { name: 'Rim skips', why: 'Rim hits on the “a” of beats 1 and 3 mimic the garage shuffle’s bounce.', add: [{ v: 'rim', on: [3, 11] }] },
    ],
  },
  {
    id: 'garage-future', name: 'Future garage', genre: 'garage', bpm: 130, swing: 58,
    tip: 'Half-time and hazy: one snare on beat 3, a skipping kick, and sparse rim ticks. All the garage shuffle, none of the energy — designed to sit under pitched vocal chops.',
    layers: [
      { name: 'Snare on 3', why: 'Half-time again: one backbeat per bar makes 130 BPM feel like 65.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Skipping kick', why: 'Kick on 1, the “a of 1” and the “and of 3” — the 2-step skip slowed and softened.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Rim shuffle', why: 'Swung rim clicks on the off-16ths carry the groove where the hats would normally be.', add: [{ v: 'rim', on: [2, 5, 7, 13, 15] }] },
      { name: 'Soft hats', why: 'A few quiet closed hats give the top end air without breaking the haze.', add: [{ v: 'chat', on: [4, 6, 12, 14] }] },
    ],
  },
  {
    id: 'garage-bassline', name: 'Bassline / niche', genre: 'garage', bpm: 138, swing: 56,
    tip: 'Northern speed garage: 4x4 kick, hard snare, and an off-beat open hat pushing it forward. Faster and more aggressive than London garage.',
    layers: [
      { name: 'Fast four-floor', why: 'The 4x4 pulse at 138 — bassline is garage played at rave speed.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Hard snare', why: 'Snare on 2 & 4 with a 16th ghost before each — a live-sounding crack over a machine pulse.', add: [{ v: 'snare', on: [3, 4, 11, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'Open hats on every “and” drive the track between the kicks.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Shuffled 16ths', why: 'Closed hats on the remaining 16ths, swung, keep the garage bounce inside the four-floor grid.', add: [{ v: 'chat', on: [1, 5, 9, 13] }] },
    ],
  },

  // ------------------------------------------------------------- dubstep ----
  {
    id: 'dubstep-classic', name: 'Dubstep half-time', genre: 'dubstep', bpm: 140, swing: 50,
    tip: 'The 140 half-time template: kick on 1, snare on 3, and almost nothing else. Whole beats are left empty so the sub bass can be the melody, the rhythm and the hook.',
    layers: [
      { name: 'Kick on 1', why: 'One kick per bar — long, sub-heavy, and allowed to ring.', add: [{ v: 'kick', on: [0], acc: [0] }] },
      { name: 'Snare on 3', why: 'The half-time backbeat. Two hits per bar now define the entire groove.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Sparse hats', why: 'A few off-beat hats mark the underlying 140 tempo so the track can switch to double-time on cue.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Second kick', why: 'A kick on the “a of 3” is the one syncopation classic dubstep allows itself.', add: [{ v: 'kick', on: [11] }] },
      { name: 'Rim echo', why: 'A rim on the “and of 4”, usually drowned in delay, marks the turnaround.', add: [{ v: 'rim', on: [14] }] },
    ],
  },
  {
    id: 'dubstep-grime', name: 'Grime / eskibeat', genre: 'dubstep', bpm: 140, swing: 50,
    tip: 'Grime keeps 140 but plays it busier and colder: syncopated kicks, snares on 2 & 4 plus stabs on the “a”s, and square-wave percussion instead of a kit.',
    layers: [
      { name: 'Syncopated kicks', why: 'Kick on 1, the “and of 1” and the “e of 3” — an 8-bit stagger rather than a groove.', add: [{ v: 'kick', on: [0, 2, 9], acc: [0] }] },
      { name: 'Snare on 2 & 4', why: 'The backbeat is fast and thin — grime snares are short, bright and quantized hard.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Snare stabs', why: 'Extra snares on the “a of 2” and “a of 4” create the double-hit that eskibeat is built on.', add: [{ v: 'snare', on: [7, 15] }] },
      { name: 'Hat 16ths', why: 'Machine hats on the off-16ths, deliberately cheap-sounding — the aesthetic is a games console, not a studio.', add: [{ v: 'chat', on: [1, 3, 5, 11, 13] }] },
    ],
  },
  {
    id: 'dubstep-riddim', name: 'Riddim', genre: 'dubstep', bpm: 140, swing: 50,
    tip: 'Modern minimal dubstep: the same half-time skeleton, but the kick triplet-stutters into beat 3 and the whole pattern locks to a repeating three-note bass motif.',
    layers: [
      { name: 'Half-time backbone', why: 'Kick on 1, snare on 3 — riddim never abandons this.', add: [{ v: 'kick', on: [0], acc: [0] }, { v: 'snare', on: [8], acc: [8] }] },
      { name: 'Stutter kicks', why: 'Three fast kicks on the “e-and-a” of 4 push into the next bar — the riddim stutter.', add: [{ v: 'kick', on: [13, 14, 15] }] },
      { name: 'Off-beat hats', why: 'Hats on the “and”s keep the 140 pulse audible under the half-time drums.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Ghost snare', why: 'A quiet snare on the “a of 1” hints at the double-time feel without committing to it.', add: [{ v: 'snare', on: [3] }] },
    ],
  },

  // -------------------------------------------------------------- breaks ----
  {
    id: 'breaks-bigbeat', name: 'Big beat', genre: 'breaks', bpm: 128, swing: 54,
    tip: 'A loud sampled break with everything distorted: kick displaced off beat 3, snare huge on 2 & 4, open hats crashing on the off-beats. Made for the loudest possible playback.',
    layers: [
      { name: 'Broken kick', why: 'Kick on 1, the “and of 2” and the “a of 3” — never on beat 3 itself, which is what makes it a break.', add: [{ v: 'kick', on: [0, 6, 11], acc: [0] }] },
      { name: 'Huge snare', why: 'Snare on 2 & 4, compressed to the point of distortion — big beat is a mixing style as much as a rhythm.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Open-hat crashes', why: 'Open hats on the “and of 1” and “and of 4” splash across the bar.', add: [{ v: 'ohat', on: [2, 14] }] },
      { name: 'Closed hats', why: 'Closed 8ths in between hold the tempo while the open hats wash.', add: [{ v: 'chat', on: [4, 6, 8, 10, 12] }] },
      { name: 'Ghost snare', why: 'A ghost on the “a of 1” gives the loop the shuffle of the sampled original.', add: [{ v: 'snare', on: [3] }] },
    ],
  },
  {
    id: 'breaks-hardcore', name: 'Breakbeat hardcore', genre: 'breaks', bpm: 150, swing: 52,
    tip: 'The 1991 rave beat: a chopped break running at 150 with a four-floor kick underneath — house and jungle in the same bar. This pattern is the missing link between them.',
    layers: [
      { name: 'Four-floor kick', why: 'The rave kick keeps a house pulse under the break, which is why these records still worked in a club.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Break snares', why: 'Snare on 2 & 4 plus the “e of 3” — the chopped break poking through the four-floor grid.', add: [{ v: 'snare', on: [4, 9, 12], acc: [4, 12] }] },
      { name: 'Ghost roll', why: 'Ghosted snares on the “a”s give the break its rolling momentum at rave tempo.', add: [{ v: 'snare', on: [7, 15] }] },
      { name: 'Open hats', why: 'Off-beat open hats — pure rave, borrowed straight from Italian piano house.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
    ],
  },
  {
    id: 'breaks-bruk', name: 'Broken beat (bruk)', genre: 'breaks', bpm: 128, swing: 56,
    tip: 'West-London broken beat: a kick that lands almost nowhere expected, jazz-funk ghost snares, and a shuffled 16th grid. Complex on paper, but it grooves because the backbeat stays put.',
    layers: [
      { name: 'Backbeat anchor', why: 'Snare on 2 & 4 is the one fixed point — everything else is free to be displaced.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Broken kick', why: 'Kick on 1, the “e of 2”, the “and of 3” and the “a of 4” — four kicks, none of them on a strong beat except the first.', add: [{ v: 'kick', on: [0, 5, 10, 15], acc: [0] }] },
      { name: 'Ghost snares', why: 'Jazz-funk ghosts on the “a of 1” and “e of 4” tie the displaced kicks back to the backbeat.', add: [{ v: 'snare', on: [3, 13] }] },
      { name: 'Shuffled 16th hats', why: 'A swung 16th hat grid holds this together. Without swing, broken beat sounds like a mistake.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Tom colour', why: 'A low tom on the “and of 2” answers the kick — bruk always has a percussion conversation.', add: [{ v: 'ltom', on: [6] }] },
    ],
  },
  {
    id: 'breaks-nuskool', name: 'Nu-skool breaks', genre: 'breaks', bpm: 132, swing: 52,
    tip: 'Tighter and more electronic than big beat: a two-step kick, a clap-snare stack, and 16th hats programmed rather than sampled. Halfway between breaks and tech-house.',
    layers: [
      { name: 'Two-step kick', why: 'Kick on 1 and the “and of 3” — the same skeleton as D&B, at half the tempo.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Clap + snare', why: 'Backbeat on 2 & 4, layered so it reads as one wide, electronic hit.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'clap', on: [4, 12] }] },
      { name: '16th hats', why: 'Programmed hats on the off-16ths give the beat a tech-house sheen the sampled breaks never had.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Extra kick', why: 'A kick on the “e of 2” fills the middle of the bar and stops the two-step feeling empty.', add: [{ v: 'kick', on: [5] }] },
      { name: 'Open hat turn', why: 'An open hat on the “and of 4” signals the bar’s end.', add: [{ v: 'ohat', on: [14] }] },
    ],
  },
];
