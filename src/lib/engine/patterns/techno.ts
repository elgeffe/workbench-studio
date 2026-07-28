// Techno and the trance/big-room branch: machine time, straight grids, and
// texture instead of syncopation.
import type { DrumTemplate } from '../drums';

export const TECHNO_PATTERNS: DrumTemplate[] = [
  // -------------------------------------------------------------- techno ----
  {
    id: 'techno', name: 'Peak-time techno', genre: 'techno', bpm: 134, swing: 50,
    tip: 'House’s harder sibling: same four-on-the-floor skeleton, faster, dead straight, with 16th hats as a machine texture and a clap doing the backbeat’s job.',
    layers: [
      { name: 'Four on the floor', why: 'The kick pulse again, but faster and with no swing at all — machine time.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Off-beat open hats', why: 'Open hats answer the kick on every “and”, pumping the off-beat.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: '16th hat carpet', why: 'Closed hats on all the in-between 16ths make the relentless texture that defines techno.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Clap on 2 & 4', why: 'The backbeat survives even here — as a clap buried in the wall of hats.', add: [{ v: 'clap', on: [4, 12] }] },
      { name: 'Rumble tom', why: 'A low tom on the “a of 3” adds sub-level syncopation — the seed of the techno “rumble”.', add: [{ v: 'ltom', on: [11] }] },
    ],
  },
  {
    id: 'techno-detroit', name: 'Detroit techno', genre: 'techno', bpm: 128, swing: 54,
    tip: 'The original: a 909 pattern with real swing in the hats, a rim and cowbell carrying the funk, and space for a melodic string line. Techno before it became purely functional.',
    layers: [
      { name: 'Four-floor 909', why: 'The kick pulse — slightly softer and longer than modern peak-time techno.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Swung off-beat hats', why: 'With swing near 54 the off-beat hats lean rather than tick. Detroit techno grooves, it does not just pound.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Snare on 2 & 4', why: 'A thin 909 snare rather than a clap — closer to funk than to the European tradition.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Cowbell figure', why: 'Rim/cowbell on the “a of 1” and the “e of 4” — the small melodic percussion that made Detroit records feel human.', add: [{ v: 'rim', on: [3, 13] }] },
      { name: '16th hat fill', why: 'A few closed hats between the open ones add motion without filling every gap.', add: [{ v: 'chat', on: [5, 7, 13, 15] }] },
    ],
  },
  {
    id: 'techno-hypnotic', name: 'Hypnotic / dub techno', genre: 'techno', bpm: 130, swing: 50,
    tip: 'Almost nothing happens, and that is the design: kick, one off-beat hat, and a rim that appears once per bar. All the movement in a real track comes from delay and filter automation.',
    layers: [
      { name: 'Deep kick', why: 'Four on the floor with a long decay so the bars blur into each other.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Off-beat hat', why: 'A single closed hat on each “and”. Four notes carry the entire top end.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Rim echo', why: 'One rim on the “a of 2” — in practice fed into a long dub delay so it answers itself across bars.', add: [{ v: 'rim', on: [7] }] },
      { name: 'Sub tom', why: 'A low tom on beat 3 adds a second, slower pulse under the kick.', add: [{ v: 'ltom', on: [8] }] },
    ],
  },
  {
    id: 'techno-industrial', name: 'Industrial / hard techno', genre: 'techno', bpm: 145, swing: 50,
    tip: 'Distorted kick at 145+, a snare doubling the off-beats, and a metallic 16th carpet. The kick and the distortion are the composition; the pattern stays brutally simple.',
    layers: [
      { name: 'Distorted kick', why: 'Four on the floor, overdriven, with the tail clipping into the next hit — a wall rather than a pulse.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Off-beat snare', why: 'A snare on every “and” doubles the perceived tempo and creates the driving “rave” feel.', add: [{ v: 'snare', on: [2, 6, 10, 14], acc: [6, 14] }] },
      { name: '16th metal hats', why: 'Closed hats on every remaining 16th, bright and clipped, as a texture rather than a rhythm.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Tom hit', why: 'One low tom on the “a of 4” slams the loop into the next bar.', add: [{ v: 'ltom', on: [15], acc: [15] }] },
    ],
  },
  {
    id: 'techno-acid', name: 'Acid', genre: 'techno', bpm: 130, swing: 52,
    tip: 'The 808/303 pattern: straight kick, open hat on the off-beats, and clap plus rim answering each other in 16ths. Built to sit under a squelching 303 line that changes every bar.',
    layers: [
      { name: '808 kick', why: 'Four on the floor with a long 808 tail — the pulse and the bass note at once.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Off-beat open hats', why: 'The off-beat hat is what keeps the 303 line from swallowing the pulse.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Clap on 2 & 4', why: 'A classic 808 clap — dry and thin so it cuts through the acid line.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Rim 16ths', why: 'Rimshots on the “e” of each beat weave a second grid against the clap.', add: [{ v: 'rim', on: [1, 5, 9, 13] }] },
      { name: 'Closed-hat fill', why: 'Closed hats on the “a” 16ths complete a continuous top line without touching the open hats.', add: [{ v: 'chat', on: [3, 7, 11, 15] }] },
    ],
  },

  {
    id: 'techno-raw', name: 'Raw / hard-groove', genre: 'techno', bpm: 138, swing: 54,
    tip: 'The tribal, swung end of techno: a rolling tom pattern doing the work a hat would, a slightly swung grid, and metallic percussion instead of a clap. Built to be looped for eight minutes and mixed with another record.',
    layers: [
      { name: 'Driving kick', why: 'Four on the floor at 138, distorted but short — the swing setting is what keeps it grooving rather than pounding.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Rolling toms', why: 'Toms on the “e/and/a” around beats 1 and 3 create the tribal roll — this layer, not the kick, is the hook.', add: [{ v: 'ltom', on: [2, 3, 6, 10, 11, 14], acc: [3, 11] }] },
      { name: 'Metallic perc', why: 'A rim or cowbell on 2 & 4 replaces the clap. Hard-groove techno rarely has a real backbeat sound.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: '16th hats', why: 'Swung closed hats on the off-16ths thicken the roll without adding another accent.', add: [{ v: 'chat', on: [1, 5, 7, 9, 13, 15] }] },
      { name: 'Open-hat push', why: 'Open hats only on the “and” of 2 and 4 — two per bar, so they still register as events.', add: [{ v: 'ohat', on: [6, 14] }] },
    ],
  },
  {
    id: 'techno-deep', name: 'Deep techno', genre: 'techno', bpm: 127, swing: 52,
    tip: 'Slower, softer and sub-led: a long-decay kick, a shaker carpet instead of hats, one clap on beat 3 and a sub tom pulse. Closer to deep house in feel, closer to techno in intent.',
    layers: [
      { name: 'Sub kick', why: 'A rounded kick on all four beats, tuned low and left to ring — the low end is the melody in deep techno.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Shaker carpet', why: 'Quiet 16th shakers on the off-beats give continuous motion without the aggression of a hat pattern.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Off-beat open hats', why: 'Short open hats on the “and”s keep the pulse breathing between kicks.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Clap on 3', why: 'A single filtered clap halfway through the bar. Halving the backbeat is what keeps the loop hypnotic.', add: [{ v: 'clap', on: [8], acc: [8] }] },
      { name: 'Sub tom pulse', why: 'Low toms on the “a of 3” and the last 16th add a slower, second pulse under the kick.', add: [{ v: 'ltom', on: [11, 15] }] },
    ],
  },

  // -------------------------------------------------------------- trance ----
  {
    id: 'trance-classic', name: 'Classic trance', genre: 'trance', bpm: 138, swing: 50,
    tip: 'Built for the breakdown: four-floor kick, off-beat open hats that never stop, a clap on 2 & 4, and 16th hats underneath. The pattern is the same for eight minutes; the arrangement does everything.',
    layers: [
      { name: 'Four on the floor', why: 'The pulse at 138 — fast enough to feel weightless rather than heavy.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Off-beat open hats', why: 'In trance the off-beat hat is as loud as the kick, and the off-beat bassline doubles it.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Clap backbeat', why: 'A big reverbed clap on 2 & 4 gives the four-floor grid a landing point.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: '16th hats', why: 'Closed hats on the remaining 16ths give the loop its shimmer and its forward speed.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Snare pickup', why: 'A snare on the last 16th of the bar — the seed of the snare roll that will build the breakdown.', add: [{ v: 'snare', on: [15] }] },
    ],
  },
  {
    id: 'trance-progressive', name: 'Progressive', genre: 'trance', bpm: 126, swing: 50,
    tip: 'Slower and rounder: the same skeleton with the clap softened, a rolling 16th shaker and one tom per bar. Designed to evolve over 16 bars rather than to hit hard now.',
    layers: [
      { name: 'Rolling kick', why: 'Four on the floor with a rounded tail — progressive tracks glide instead of punching.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Off-beat hats', why: 'Off-beat closed hats rather than open ones keep the energy contained for the long build.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Soft clap', why: 'A single filtered clap on beat 4 only — halving the backbeat keeps the tension unresolved.', add: [{ v: 'clap', on: [12], acc: [12] }] },
      { name: '16th shaker', why: 'A shaker on the “e” and “a” 16ths adds the sense of forward travel the sparse drums leave out.', add: [{ v: 'rim', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Tom pulse', why: 'One low tom on the “and of 3” marks the bar’s halfway point for the ear.', add: [{ v: 'ltom', on: [10] }] },
    ],
  },
  {
    id: 'trance-bigroom', name: 'Big-room build', genre: 'trance', bpm: 128, swing: 50,
    tip: 'The pre-drop bar: the kick keeps four-floor while a snare roll accelerates from 8ths into 16ths across the bar. Program the roll as increasing density, exactly as shown.',
    layers: [
      { name: 'Four-floor kick', why: 'The kick holds steady — the roll above it is what creates the sense of acceleration.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Snare roll: 8ths', why: 'The first half of the bar rolls in 8ths — a slow, readable build.', add: [{ v: 'snare', on: [0, 2, 4, 6], acc: [0] }] },
      { name: 'Snare roll: 16ths', why: 'The second half doubles to 16ths. Same notes, twice the density: the whole trick of a build.', add: [{ v: 'snare', on: [8, 9, 10, 11, 12, 13, 14, 15], acc: [8, 12] }] },
      { name: 'Crash on 1', why: 'A cymbal on the downbeat marks where the last build ended and this one starts.', add: [{ v: 'ride', on: [0], acc: [0] }] },
      { name: 'Open-hat lift', why: 'Off-beat open hats in the first half only, thinning out as the roll takes over.', add: [{ v: 'ohat', on: [3, 7] }] },
    ],
  },
  {
    id: 'trance-fullon', name: 'Full-on psy', genre: 'trance', bpm: 142, swing: 50,
    tip: 'Psytrance’s melodic branch: the same rolling kick-bass engine, but with a snare on the off-beats and open hats sitting high in the mix. Busier and brighter than night-time psy.',
    layers: [
      { name: 'Rolling kick', why: 'Four on the floor at 142 — short, tuned, and always leaving the three following 16ths free for the bass.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Rolling bass', why: 'The bass (low tom here) answers on every off-beat 8th. Kick-bass-kick-bass at this speed becomes one continuous engine.', add: [{ v: 'ltom', on: [2, 6, 10, 14], acc: [2, 6, 10, 14] }] },
      { name: 'Off-beat snare', why: 'Snares on the “and” of 2 and 4 — full-on borrows the doubled backbeat from rave rather than from rock.', add: [{ v: 'snare', on: [6, 14], acc: [6, 14] }] },
      { name: 'Open hats', why: 'Open hats on the remaining off-beats sit loud and bright, which is what makes full-on sound like daylight.', add: [{ v: 'ohat', on: [2, 10] }] },
      { name: '16th hat roll', why: 'Closed hats on the “e” and “a” complete the roll and carry the tempo.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15], acc: [1, 9] }] },
    ],
  },
  {
    id: 'trance-psy', name: 'Psytrance', genre: 'trance', bpm: 145, swing: 50,
    tip: 'The rolling triplet-free engine: kick on every beat, bass on the three off-16ths after it, open hat on the “and”. At 145 this becomes one continuous rolling texture.',
    layers: [
      { name: 'Fast four-floor', why: 'The kick at 145 is short and tuned — it is a percussive instrument, not a boom.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Off-beat open hats', why: 'An open hat on every “and” gives the classic psy see-saw; in the real track a rolling bass doubles it.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: '16th hat roll', why: 'Closed hats on the “e” and “a” complete the roll — the top end never rests.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15], acc: [1, 9] }] },
      { name: 'Rim accents', why: 'Rim hits on the “e of 2” and “a of 4” break the symmetry just enough to keep it alive.', add: [{ v: 'rim', on: [5, 15] }] },
    ],
  },
];
