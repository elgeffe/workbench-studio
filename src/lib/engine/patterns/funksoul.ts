// Funk, soul/Motown, neo-soul and gospel patterns — the 16th-note pocket
// family. Ghost notes and swing do most of the work here; see the `why` of each
// layer for what is carrying the feel.
import type { DrumTemplate } from '../drums';

export const FUNK_SOUL_PATTERNS: DrumTemplate[] = [
  // ---------------------------------------------------------------- funk ----
  {
    id: 'funk', name: 'Funky drummer', genre: 'funk', bpm: 96, swing: 54,
    tip: 'The most-sampled groove ever recorded, reduced to its skeleton: rigid backbeat, 16th hats, syncopated kick, and a cloud of ghost snares around the beat. A hair of swing makes it greasy.',
    layers: [
      { name: 'The One', why: 'Funk’s law: hit beat 1 hard and everything else can float. One accented kick owns the bar.', add: [{ v: 'kick', on: [0], acc: [0] }] },
      { name: 'Backbeat snare', why: 'Beats 2 & 4 stay sacred — the anchor all the syncopation is measured against.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '16th-note hats', why: 'Hats move to 16ths — twice rock’s resolution. Accents on the quarters keep the pulse readable inside the wall of notes.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Syncopated kick', why: 'Kicks on the “and of 2” and the “e of 3” — off the strong beats. This is where funk gets its limp.', add: [{ v: 'kick', on: [6, 9] }] },
      { name: 'Ghost snares', why: 'Quiet taps between the backbeats fill the pocket. Play them at a whisper — they are texture, not statement.', add: [{ v: 'snare', on: [3, 7, 10] }] },
    ],
  },
  {
    id: 'funk-one', name: 'On the One (JB)', genre: 'funk', bpm: 108, swing: 52,
    tip: 'James Brown’s revolution: stop resolving to beat 3 and put everything on beat 1. The kick is doubled on the downbeat, the snare bites on 2 & 4, and nobody plays anything that would soften the arrival.',
    layers: [
      { name: 'Doubled downbeat', why: 'Kick on 1 and immediately on the “e of 1” — a double-hit that makes The One unmissable.', add: [{ v: 'kick', on: [0, 1], acc: [0] }] },
      { name: 'Hard backbeat', why: 'Snare on 2 & 4, cracked as loud as the kick. In JB’s band the snare is a rhythm-guitar part.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '8th hats with off-beat accents', why: 'Accenting the “and”s instead of the beats pulls the ear off the downbeat, so beat 1 hits harder when it comes.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [2, 6, 10, 14] }] },
      { name: 'Second-half kick', why: 'A single kick on the “and of 3” is the only low-end event in the second half — space is the arrangement.', add: [{ v: 'kick', on: [10] }] },
      { name: 'Ghost before the backbeat', why: 'A whisper-snare on the “a of 3” sets up beat 4 without stealing from it.', add: [{ v: 'snare', on: [11] }] },
    ],
  },
  {
    id: 'funk-linear', name: 'Linear funk', genre: 'funk', bpm: 100, swing: 52,
    tip: 'Linear means no two voices ever hit at the same time — one note per step, passed between kick, snare and hat. It instantly sounds played rather than programmed, and it is the easiest way to make a step sequencer sound human.',
    layers: [
      { name: 'Kick placements', why: 'The kick claims 1, the “a of 1” and the “and of 3” — and nothing else may share those steps.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Snare answers', why: 'Snare takes the backbeat plus two ghosts, always in steps the kick left empty.', add: [{ v: 'snare', on: [4, 7, 12, 15], acc: [4, 12] }] },
      { name: 'Hats fill the gaps', why: 'Hats occupy the remaining 16ths. Together the three voices spell a continuous 16th line with no two hits ever stacking.', add: [{ v: 'chat', on: [1, 2, 5, 6, 8, 11, 13, 14], acc: [8] }] },
      { name: 'Open-hat accent', why: 'The one gap left in the line opens the hat on the “e of 3” — still linear, still one voice per step.', add: [{ v: 'ohat', on: [9] }] },
    ],
  },
  {
    id: 'funk-halftime', name: 'Half-time funk', genre: 'funk', bpm: 92, swing: 56,
    tip: 'Funk with the backbeat halved: snare on beat 3 only, kick syncopation doubled to compensate. The result feels enormous and slow while the hats keep the original tempo.',
    layers: [
      { name: 'Snare on 3', why: 'One backbeat per bar makes every kick around it feel twice as busy.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Busy kick', why: 'Kicks on 1, the “a of 1”, the “and of 2” and the “a of 3” — the kick now carries the syncopation the snare used to.', add: [{ v: 'kick', on: [0, 3, 6, 11], acc: [0] }] },
      { name: '16th hats', why: 'Hats stay at full speed, which is what stops the half-time feel from sounding like a slower song.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ghost cluster', why: 'Three whispered snares crowd the space before and after beat 3, making the one loud snare feel bigger.', add: [{ v: 'snare', on: [6, 10, 14] }] },
    ],
  },
  {
    id: 'funk-secondline', name: 'New Orleans second line', genre: 'funk', bpm: 92, swing: 58,
    tip: 'The parade groove behind all New Orleans funk: a swung bass-drum street beat, snare rolls that answer rather than mark 2 & 4, and a permanent triplet lean. Count it as a march that refuses to march.',
    layers: [
      { name: 'Street-beat kick', why: 'Kick on 1, the “and of 1”, and the “and of 3” — the bass drummer walking, not keeping time.', add: [{ v: 'kick', on: [0, 2, 10], acc: [0] }] },
      { name: 'Snare on 3 with a pickup', why: 'The big snare lands on beat 3 with a 16th pickup — the second-line “boom-cha-BAP”.', add: [{ v: 'snare', on: [7, 8], acc: [8] }] },
      { name: 'Ghost roll', why: 'Ghosted 16ths scattered across the bar are the snare drummer’s constant chatter under the horns.', add: [{ v: 'snare', on: [2, 5, 11, 14] }] },
      { name: 'Swung hats', why: 'Swung 8ths on the hat push the whole thing toward a triplet feel — drag the SWING slider to 62 to hear it deepen.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Cowbell timeline', why: 'A rim/cowbell on 1, the “and of 2” and 4 hints at the tresillo hiding inside New Orleans music.', add: [{ v: 'cowbell', on: [0, 6, 12] }] },
    ],
  },

  // ---------------------------------------------------------------- soul ----
  {
    id: 'soul-motown', name: 'Motown four-on-floor', genre: 'soul', bpm: 128, swing: 54,
    tip: 'The Funk Brothers’ formula: kick on all four beats, snare on 2 & 4, and a tambourine hammering every off-beat 8th. It is dance music built in 1965 — house owes it everything.',
    layers: [
      { name: 'Four-beat kick', why: 'Motown put the kick on all four beats a decade before disco. It drives without ever syncopating.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Cracking backbeat', why: 'Snare on 2 & 4, often doubled by handclaps and recorded loud enough to hear on a car radio.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Tambourine off-beats', why: 'The tambourine on every “and” is the Motown signature — the shimmer that makes the groove float.', add: [{ v: 'shaker', on: [2, 6, 10, 14], acc: [2, 6, 10, 14] }] },
      { name: 'Hat 8ths', why: 'Quiet hats double the tambourine grid so the top end stays continuous.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Kick pickup', why: 'A 16th kick before beat 3 keeps a human drummer’s push inside the machine-like pulse.', add: [{ v: 'kick', on: [7] }] },
    ],
  },
  {
    id: 'soul-memphis', name: 'Memphis / Stax', genre: 'soul', bpm: 100, swing: 56,
    tip: 'Al Jackson Jr’s discipline: dead-simple parts played dead in the pocket, slightly behind the beat. Fewer notes than any other groove here — the feel is entirely in the placement.',
    layers: [
      { name: 'Lazy backbeat', why: 'Snare on 2 & 4 played a hair late. On a sequencer, nudge these two hits 10–15 ms behind the grid.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Two-note kick', why: 'Kick on 1 and the “and of 3”. That is the entire bass-drum part, and it never changes.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Swung 8th hats', why: 'Hats on 8ths with a loose swing — the shuffle that keeps Stax records from ever feeling stiff.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'One ghost note', why: 'A single ghosted snare on the “a of 4” is all the decoration this style allows.', add: [{ v: 'snare', on: [15] }] },
    ],
  },
  {
    id: 'soul-ballad', name: 'Soul ballad (triplet feel)', genre: 'soul', bpm: 68, swing: 66,
    tip: 'The slow-dance groove: swing pushed to a true triplet so every off-beat lands on the last note of a triplet. Side-stick on the backbeat, kick reduced to a heartbeat — the whole bar breathes.',
    layers: [
      { name: 'Side-stick backbeat', why: 'Cross-stick on 2 & 4 keeps the backbeat present without ever getting loud.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Heartbeat kick', why: 'Kick on 1 and just before beat 3 — two soft pulses per bar, like a slow heart.', add: [{ v: 'kick', on: [0, 7], acc: [0] }] },
      { name: 'Triplet hats', why: 'With swing at 66 these 8ths become a rolling triplet. Slide the swing to 50 and the romance disappears instantly.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Snare fill', why: 'A real snare only at the end of the bar, answering the vocal phrase.', add: [{ v: 'snare', on: [14, 15] }] },
    ],
  },
  {
    id: 'soul-philly', name: 'Philly soul', genre: 'soul', bpm: 112, swing: 54,
    tip: 'The bridge from soul to disco: a four-floor kick with 16th hats and a tambourine still doing Motown’s job. Silky rather than hard — nothing is played at full volume.',
    layers: [
      { name: 'Four on the floor', why: 'The kick pulse Philadelphia handed straight to disco a few years later.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Backbeat plus clap', why: 'Snare and handclap together on 2 & 4 — a wider, smoother backbeat than Memphis soul.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'clap', on: [4, 12] }] },
      { name: '16th hats', why: 'Continuous 16ths, quiet, with accents on the quarters — the sheen under the strings.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Tambourine', why: 'Off-beat tambourine keeps the Motown lift alive inside the new four-floor pulse.', add: [{ v: 'shaker', on: [2, 6, 10, 14] }] },
    ],
  },

  // ------------------------------------------------------------ neo-soul ----
  {
    id: 'neosoul-dilla', name: 'Drunk swing (Dilla feel)', genre: 'neosoul', bpm: 86, swing: 62,
    tip: 'The famous “drunk” feel: hats swung hard while the kick stays close to straight, so the two layers disagree slightly and the loop wobbles. Programmed unquantized on purpose — this is the sound of turning quantize off.',
    layers: [
      { name: 'Straight-ish kick', why: 'Kick on 1, the “a of 1” and the “and of 3” — near the grid, which is what the swung hats will fight against.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Dragged snare', why: 'Snare on 2 & 4, but push it a touch late in your sequencer. Late snare + on-time kick = the whole neo-soul feel.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Heavily swung hats', why: 'With swing at 62 the off-16ths drag behind the kick. Sweep the SWING slider from 50 to 66 and hear the loop get progressively drunker.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Ghost stumble', why: 'Two whispered snares on the “e of 3” and the last 16th trip the loop into the next bar.', add: [{ v: 'snare', on: [9, 15] }] },
      { name: 'Late kick answer', why: 'A final kick on the “a of 4” lands almost on top of the downbeat — deliberately crowded.', add: [{ v: 'kick', on: [14] }] },
    ],
  },
  {
    id: 'neosoul-pocket', name: 'Deep pocket', genre: 'neosoul', bpm: 82, swing: 58,
    tip: 'Questlove territory: everything sits back, nothing is busy, and the ghost notes do the talking. Ideal to program when a Rhodes or a vocal has to sit on top.',
    layers: [
      { name: 'Backbeat, played soft', why: 'The snare on 2 & 4 is present but never cracks — velocity around 90 instead of 127.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Minimal kick', why: 'Kick on 1 and the “and of 3”, the same skeleton as Memphis soul but slower and rounder.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Ghost web', why: 'Four ghost snares surround the backbeats. This layer is the pocket — mute it and the groove goes flat.', add: [{ v: 'snare', on: [3, 7, 11, 15] }] },
      { name: 'Loose 16th hats', why: 'Hats on 16ths, quiet, with the swing making every second one late. Vary their velocity heavily.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 8] }] },
    ],
  },
  {
    id: 'neosoul-halftime', name: 'Half-time neo-soul', genre: 'neosoul', bpm: 78, swing: 58,
    tip: 'Half-time at a slow tempo — the heaviest, laziest groove in this box. One snare per bar, kick moving in 16ths underneath, and a rim tick keeping the space alive.',
    layers: [
      { name: 'Snare on 3 only', why: 'A single backbeat per bar. At 78 BPM half-time this feels almost stationary — that is the goal.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: '16th kick moves', why: 'Kick on 1, the “e of 2” and the “and of 3” keeps the low end moving under the still snare.', add: [{ v: 'kick', on: [0, 5, 10], acc: [0] }] },
      { name: 'Swung hats', why: 'Off-beat 8ths only — leaving the downbeats empty on the hat makes the loop feel like it is floating.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Rim ticks', why: 'A dry side-stick on the “a of 1” and “a of 4” marks time where the snare no longer does.', add: [{ v: 'rim', on: [3, 15] }] },
    ],
  },
  {
    id: 'neosoul-ballad', name: 'Neo-soul ballad', genre: 'neosoul', bpm: 72, swing: 60,
    tip: 'Brush-and-shaker territory: cross-stick backbeat, shaker 16ths, and a kick that only speaks twice a bar. Program this and leave enormous space for the chords.',
    layers: [
      { name: 'Cross-stick on 2 & 4', why: 'The quietest possible backbeat — a stick on the rim, no snare wires.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Two kicks', why: 'Beat 1 and the “a of 3”. The second kick lands late, which is what gives the bar its sway.', add: [{ v: 'kick', on: [0, 11], acc: [0] }] },
      { name: 'Shaker 16ths', why: 'Continuous quiet 16ths with the swing dragging every other one — the shaker is the metronome here.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Snare breath', why: 'One ghosted snare just before beat 4 — the only hint that a full kit is in the room.', add: [{ v: 'snare', on: [11] }] },
    ],
  },

  // -------------------------------------------------------------- gospel ----
  {
    id: 'gospel-pocket', name: 'Gospel pocket', genre: 'gospel', bpm: 96, swing: 56,
    tip: 'The Sunday-morning groove: fat backbeat, busy but quiet 16th hats, and kick syncopation that answers the bass player’s every move. Loud on 2 & 4, soft everywhere else.',
    layers: [
      { name: 'Big backbeat', why: 'Snare on 2 & 4 hit hard — in gospel the backbeat is the congregation clapping.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Conversational kick', why: 'Kick on 1, the “a of 2” and the “and of 3” — following the bass rather than laying a pulse.', add: [{ v: 'kick', on: [0, 7, 10], acc: [0] }] },
      { name: '16th hats', why: 'Dense hats with accents on the quarters. Keep them well below the snare in volume.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ghost pair', why: 'Two ghost snares just before each backbeat — the gospel drummer’s constant left-hand chatter.', add: [{ v: 'snare', on: [3, 11] }] },
      { name: 'Kick double at the turn', why: 'Two 16th kicks at the end of the bar push into the next phrase — the “re-load”.', add: [{ v: 'kick', on: [14, 15] }] },
    ],
  },
  {
    id: 'gospel-shuffle', name: 'Gospel shuffle', genre: 'gospel', bpm: 88, swing: 66,
    tip: 'Triplets all the way down: a shuffled hat over a two-and-four backbeat, with ghost notes filling the triplet gaps. Set swing to 66 (true triplet) and the pattern becomes 12/8 without changing a single step.',
    layers: [
      { name: 'Shuffled hats', why: '8th hats with swing at 66 land as “long-short” triplets. This layer alone defines the style.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Backbeat', why: 'Snare on 2 & 4 as always — the notes are rock, only the feel is triplet.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Shuffle kick', why: 'Kick on 1, 3 and the swung “and of 3” lands inside the triplet with the hat.', add: [{ v: 'kick', on: [0, 8, 10], acc: [0] }] },
      { name: 'Triplet ghosts', why: 'Ghost snares on the swung off-beats fill in the missing triplet notes — the roll you hear behind every gospel organ solo.', add: [{ v: 'snare', on: [2, 6, 10, 14] }] },
    ],
  },
  {
    id: 'gospel-praise', name: 'Praise break (fast shuffle)', genre: 'gospel', bpm: 148, swing: 62,
    tip: 'The shout music: a fast, swung, four-on-the-floor stomp with the snare hammering every off-beat. Built to make a whole church move at once.',
    layers: [
      { name: 'Four-beat kick', why: 'Kick on every beat at speed — the praise break is a march.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Off-beat snare', why: 'Snare on every “and” instead of just 2 & 4. Doubling the backbeat is what raises the temperature.', add: [{ v: 'snare', on: [2, 6, 10, 14], acc: [6, 14] }] },
      { name: 'Swung hat 8ths', why: 'Hats shuffle along with the snare, keeping the triplet lean at high tempo.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Crash on 1', why: 'A cymbal on the downbeat of every bar — subtlety is not the objective here.', add: [{ v: 'ride', on: [0], acc: [0] }] },
    ],
  },
];
