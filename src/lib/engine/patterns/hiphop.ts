// Hip-hop: boom-bap and its relatives, trap/drill, and the 808 old-school era.
import type { DrumTemplate } from '../drums';

export const HIPHOP_PATTERNS: DrumTemplate[] = [
  // ------------------------------------------------------------- boom-bap ----
  {
    id: 'hiphop', name: 'Classic boom-bap', genre: 'hiphop', bpm: 90, swing: 58,
    tip: '“Boom” (kick) … “bap” (snare): the sampled-funk skeleton. The swing is heavy — the off-16ths land late, which is the head-nod. Sparse by design so the vocal owns the middle.',
    layers: [
      { name: 'Boom', why: 'Kick on beat 1 and the “and of 3” — one anchor and one push, the classic boom-bap placement.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Bap', why: 'The snare cracks on 2 & 4. In hip-hop the backbeat is the loudest thing in the beat.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Swung 8th hats', why: 'Straight-ish 8th hats, dragged late by the swing. Compare swing 50 vs 58 to hear the head-nod appear.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Kick answer', why: 'A third kick on the “a of 2” answers the first snare — a little stumble that keeps the loop human.', add: [{ v: 'kick', on: [7] }] },
      { name: 'Last-16th ghost', why: 'A ghost snare on the very last 16th trips into the next bar’s downbeat.', add: [{ v: 'snare', on: [15] }] },
    ],
  },
  {
    id: 'hiphop-premier', name: 'Sparse East Coast', genre: 'hiphop', bpm: 93, swing: 56,
    tip: 'DJ Premier economy: two kicks, two snares, and a hat pattern with holes in it. When a beat is this empty, every sample chop and scratch has room to be an event.',
    layers: [
      { name: 'Two-kick skeleton', why: 'Beat 1 and the “e of 3”. Placing the second kick on an “e” rather than an “and” gives the loop its lopsided walk.', add: [{ v: 'kick', on: [0, 9], acc: [0] }] },
      { name: 'Hard snare', why: 'Snare on 2 & 4 only — dry, loud, filtered, and never ghosted in this style.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Hats with gaps', why: 'The hat deliberately skips the “and of 1” and “and of 4”. Holes in the top line are as important as notes.', add: [{ v: 'chat', on: [0, 4, 6, 8, 10, 12], acc: [0, 8] }] },
      { name: 'Open-hat punctuation', why: 'One open hat on the “a of 2” is the only sustained sound in the bar.', add: [{ v: 'ohat', on: [7] }] },
    ],
  },
  {
    id: 'hiphop-lofi', name: 'Lo-fi / study beat', genre: 'hiphop', bpm: 78, swing: 60,
    tip: 'Boom-bap slowed down and softened: rim instead of snare, heavy swing, a kick that hits once and lets the sample breathe. Program it, then filter the top off everything.',
    layers: [
      { name: 'Soft kick', why: 'Kick on 1 and the “and of 3”, played quietly — in lo-fi nothing is allowed to be aggressive.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Rim backbeat', why: 'A rimshot or dusty snare on 2 & 4, low velocity. This is the entire backbeat.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Heavily swung hats', why: 'Swing near 60 makes every off-8th late and sleepy. This is the genre’s only real technique.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Ghost snare', why: 'One quiet real snare on the “a of 4” gives the loop a seam to repeat from.', add: [{ v: 'snare', on: [15] }] },
    ],
  },
  {
    id: 'hiphop-westcoast', name: 'G-funk', genre: 'hiphop', bpm: 94, swing: 56,
    tip: 'West Coast bounce: a live-feeling swung groove with an extra kick before the backbeat and a tambourine riding the off-beats. Slower, wider and funkier than East Coast boom-bap.',
    layers: [
      { name: 'Bouncing kick', why: 'Kick on 1, the “a of 1” and the “and of 3” — three kicks give the loop its rolling gait.', add: [{ v: 'kick', on: [0, 3, 10], acc: [0] }] },
      { name: 'Snare on 2 & 4', why: 'A fat, slightly reverbed snare — closer to a live funk kit than a sampled one.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Tambourine off-beats', why: 'Tambourine on every “and” — the Motown trick reused in 1993.', add: [{ v: 'tamb', on: [2, 6, 10, 14] }] },
      { name: '16th hats', why: 'Swung 16th hats sit under the tambourine and thicken the top end.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ghost snares', why: 'Two ghosted snares before beat 3 add the live-drummer detail that separates G-funk from a drum machine.', add: [{ v: 'snare', on: [6, 7] }] },
    ],
  },

  // ----------------------------------------------------------------- trap ----
  {
    id: 'trap', name: 'Trap', genre: 'trap', bpm: 140, swing: 50,
    tip: 'Half-time: at 140 BPM the snare lands only on beat 3, so the groove feels like 70. Sparse 808 kicks underneath, busy hats on top — including the signature 16th roll.',
    layers: [
      { name: '808 kicks', why: 'Kick on 1, the “a of 2” and the “and of 3” — a sparse, syncopated 808 line that doubles as the bassline.', add: [{ v: 'kick', on: [0, 7, 10], acc: [0] }] },
      { name: 'Half-time snare', why: 'One snare, on beat 3. Halving the backbeat makes 140 BPM feel like a slow 70.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: '8th hats', why: 'Straight 8th hats keep the actual tempo audible over the half-time feel.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10] }] },
      { name: 'The hat roll', why: 'The last beat bursts into 16ths — the trap hat-roll. Producers go further with 32nds and triplets.', add: [{ v: 'chat', on: [12, 13, 14, 15], acc: [12] }] },
    ],
  },
  {
    id: 'trap-drill', name: 'Drill', genre: 'trap', bpm: 142, swing: 50,
    tip: 'UK/Brooklyn drill: the snare moves off beat 3 to a syncopated pair, and the 808 slides between notes instead of repeating. Darker and more off-kilter than trap.',
    layers: [
      { name: 'Drill snare pair', why: 'Snare on beat 3 and again on the “a of 3” — that second, late snare is the drill signature.', add: [{ v: 'snare', on: [8, 11], acc: [8] }] },
      { name: 'Sliding 808', why: 'Kick on 1, the “a of 1” and the “and of 4”. In a DAW these are one 808 patch sliding between pitches, not separate hits.', add: [{ v: 'kick', on: [0, 3, 14], acc: [0] }] },
      { name: 'Triplet-ish hats', why: 'Hats on an uneven grid (1, e, and, then skips) create drill’s lurching top line.', add: [{ v: 'chat', on: [0, 1, 2, 4, 6, 8, 9, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Rim ticks', why: 'A dry click on the “e of 2” and “e of 4” fills the space the sparse snare leaves.', add: [{ v: 'rim', on: [5, 13] }] },
    ],
  },
  {
    id: 'trap-roll', name: 'Roll-heavy trap', genre: 'trap', bpm: 146, swing: 50,
    tip: 'The modern radio variant: the hats never stop and change rate constantly, while the drums underneath stay minimal. Program the rate changes — that motion IS the arrangement.',
    layers: [
      { name: 'Minimal skeleton', why: 'Kick on 1 and the “and of 3”, snare on 3. Everything interesting will happen above these three hits.', add: [{ v: 'kick', on: [0, 10], acc: [0] }, { v: 'snare', on: [8], acc: [8] }] },
      { name: '16th hat carpet', why: 'Continuous 16ths with the quarters accented — the base layer the rolls are cut out of.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Open-hat punctuation', why: 'An open hat on the “and of 2” breaks the carpet and re-starts the ear.', add: [{ v: 'ohat', on: [6] }] },
      { name: 'Extra 808 movement', why: 'Two more 808 hits (the “e of 2” and the last 16th) turn the kick line into a bass riff.', add: [{ v: 'kick', on: [5, 15] }] },
    ],
  },
  {
    id: 'trap-halftime-soul', name: 'Soulful trap', genre: 'trap', bpm: 132, swing: 56,
    tip: 'Trap structure with boom-bap swing: half-time snare, but the hats are swung and a clap layers the backbeat. The middle ground most modern rap actually lives in.',
    layers: [
      { name: 'Clap + snare on 3', why: 'Stacking clap and snare on the single backbeat makes it wide enough to carry the bar alone.', add: [{ v: 'snare', on: [8], acc: [8] }, { v: 'clap', on: [8], acc: [8] }] },
      { name: 'Rolling 808', why: 'Kick on 1, the “a of 1”, the “and of 3” and the “a of 4” — busier than trap, closer to funk.', add: [{ v: 'kick', on: [0, 3, 10, 15], acc: [0] }] },
      { name: 'Swung hats', why: 'With swing at 56 the 8th hats drag — the boom-bap head-nod inside a trap skeleton.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Ghost snare', why: 'A whisper snare on the “e of 4” hints at the missing beat-4 backbeat.', add: [{ v: 'snare', on: [13] }] },
    ],
  },

  // ---------------------------------------------------- old-school & electro ----
  {
    id: 'oldschool-808', name: '808 electro', genre: 'oldschool', bpm: 118, swing: 50,
    tip: 'Planet Rock lineage: the 808 kick plays a tresillo-flavoured pattern, the clap answers on 2 & 4, and a cowbell carries the hook. Quantized dead straight — the machine-ness is the aesthetic.',
    layers: [
      { name: 'Electro kick', why: 'Kick on 1, the “and of 2” and beat 4 — the 3+3+2 tresillo that underpins most electronic dance music.', add: [{ v: 'kick', on: [0, 6, 12], acc: [0] }] },
      { name: '808 clap', why: 'The clap on 2 & 4 with its famous stuttered attack. No snare at all in classic electro.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: '16th hats', why: 'Tight closed 808 hats on the 16ths, with the quarters accented — one gap left at the end of the bar.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Cowbell hook', why: 'Cowbell on the “e” of each half-bar — in electro, percussion plays the melody.', add: [{ v: 'cowbell', on: [3, 11] }] },
      { name: 'Open-hat splash', why: 'One long open hat on the “and of 4” washes into the next bar.', add: [{ v: 'ohat', on: [14] }] },
    ],
  },
  {
    id: 'oldschool-miami', name: 'Miami bass', genre: 'oldschool', bpm: 132, swing: 50,
    tip: 'Faster, sparser electro built entirely around a long-decay 808 kick. The kick pattern is the song; everything else is a click track around it.',
    layers: [
      { name: 'Long 808 kick', why: 'Kick on 1, the “a of 2” and the “and of 3”, each note allowed to ring for a whole beat — this is the bassline.', add: [{ v: 'kick', on: [0, 7, 10], acc: [0] }] },
      { name: 'Snare on 2 & 4', why: 'A thin 808 snare, deliberately quieter than the kick, keeping the backbeat honest.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Hat 16ths', why: 'Machine-fast hats at low volume, the only busy element in the pattern.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Kick pickup', why: 'An extra 808 on the last 16th slams into the next downbeat.', add: [{ v: 'kick', on: [15] }] },
    ],
  },
  {
    id: 'oldschool-breakbeat', name: 'Old-school break', genre: 'oldschool', bpm: 104, swing: 54,
    tip: 'The early-80s b-boy break: a live funk kit pattern with a busy kick and open hats punching between the backbeats. Loop four bars of this and you have the birth of hip-hop.',
    layers: [
      { name: 'Break kick', why: 'Kick on 1, the “and of 1” and the “and of 3” — a drummer’s pattern, not a machine’s.', add: [{ v: 'kick', on: [0, 2, 10], acc: [0] }] },
      { name: 'Backbeat', why: 'Loud snare on 2 & 4, recorded in a room with no gate — the sound every sampler chased for decades.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Open-hat punches', why: 'Open hats on the “and of 2” and the “and of 4” cut across the backbeat — the b-boy signature.', add: [{ v: 'ohat', on: [6, 14] }] },
      { name: 'Closed hats around them', why: 'Closed 8ths everywhere the open hat is not, so the top line never stops.', add: [{ v: 'chat', on: [0, 2, 4, 8, 10, 12] }] },
      { name: 'Ghost snares', why: 'Two ghosts before the second backbeat give the break its roll.', add: [{ v: 'snare', on: [10, 11] }] },
    ],
  },
];
