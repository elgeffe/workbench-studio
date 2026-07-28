// Hard dance: hardstyle and the hardcore/gabber family. The kick is the
// instrument here — these grids describe where it lands, not what it sounds
// like, so expect to spend your time on kick design once the pattern is right.
import type { DrumTemplate } from '../drums';

export const HARD_PATTERNS: DrumTemplate[] = [
  // ----------------------------------------------------------- hardstyle ----
  {
    id: 'hardstyle-main', name: 'Hardstyle', genre: 'hardstyle', bpm: 150, swing: 50,
    tip: 'Kick on every beat with a pitched, distorted tail, and a “reverse bass” answering on every off-beat 8th — here shown as the low tom. The two never overlap: that alternation is the entire genre.',
    layers: [
      { name: 'Distorted kick', why: 'Four on the floor at 150. In hardstyle the kick is a synth patch: a clipped transient plus a pitched-down tail.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Reverse bass', why: 'The off-beat bass note fills the gap between kicks — kick, bass, kick, bass. It must stop before the next kick or the low end mud-slides.', add: [{ v: 'ltom', on: [2, 6, 10, 14], acc: [2, 6, 10, 14] }] },
      { name: 'Clap on 2 & 4', why: 'A wide reverbed clap gives the ear a backbeat inside a pattern that is otherwise all pulse.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'Open hats double the reverse bass on the off-beats and add the top-end drive.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: '16th hat drive', why: 'Closed hats on the “e” and “a” fill the grid so the tempo reads clearly at 150.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
    ],
  },
  {
    id: 'hardstyle-raw', name: 'Rawstyle', genre: 'hardstyle', bpm: 155, swing: 50,
    tip: 'Darker and more syncopated: the kick sometimes doubles on a 16th, there is no clap softening the middle, and the snare only appears as a punctuation at the end of the bar.',
    layers: [
      { name: 'Raw kick', why: 'Four on the floor plus a 16th double before beat 4 — that stutter is the rawstyle signature.', add: [{ v: 'kick', on: [0, 4, 8, 11, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Reverse bass', why: 'The off-beat bass still answers, but skips the beat where the kick doubles.', add: [{ v: 'ltom', on: [2, 6, 14], acc: [2, 6, 14] }] },
      { name: 'Snare punctuation', why: 'One snare on the “and of 4” instead of a backbeat — rawstyle keeps the middle of the bar empty and violent.', add: [{ v: 'snare', on: [14], acc: [14] }] },
      { name: 'Hat 16ths', why: 'Fast closed hats on the off-16ths carry the tempo where the missing clap used to.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 13, 15] }] },
    ],
  },
  {
    id: 'hardstyle-euphoric', name: 'Euphoric hardstyle', genre: 'hardstyle', bpm: 150, swing: 50,
    tip: 'The melodic side: same kick engine, but with a full clap-and-snare backbeat, a crash on the downbeat, and a snare roll pickup so the pattern can lift into a melodic drop.',
    layers: [
      { name: 'Four-floor kick', why: 'The pulse, tuned to the key of the track so the pitched tail is part of the harmony.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Clap + snare backbeat', why: 'Stacking both on 2 & 4 gives euphoric hardstyle its anthemic, festival-scale backbeat.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }, { v: 'snare', on: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'The off-beat hat keeps the see-saw motion under the melody.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Reverse bass', why: 'The off-beat bass note fills between kicks — quieter here than in raw, so the melody stays audible.', add: [{ v: 'ltom', on: [2, 6, 10, 14] }] },
      { name: 'Snare roll pickup', why: 'Three fast snares at the end of the bar launch the next phrase.', add: [{ v: 'snare', on: [13, 14, 15] }] },
    ],
  },

  // ------------------------------------------------------------ hardcore ----
  {
    id: 'hardcore-gabber', name: 'Gabber', genre: 'hardcore', bpm: 180, swing: 50,
    tip: 'Rotterdam, 1992: a heavily overdriven and pitched kick four to the floor at 180, with 16th kick rolls at the end of phrases. Almost nothing else in the pattern — the distortion is the arrangement.',
    layers: [
      { name: 'Overdriven kick', why: 'Four on the floor at 180. The kick is a distorted 909 pitched down until it becomes a tone.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Kick roll', why: 'The last beat breaks into 16ths — the gabber roll that ends every four-bar phrase.', add: [{ v: 'kick', on: [13, 14, 15] }] },
      { name: 'Hoover / hat off-beats', why: 'Off-beat open hats add the only air in the track.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Snare accent', why: 'A single snare on beat 3 stops the bar becoming an undifferentiated wall.', add: [{ v: 'snare', on: [8], acc: [8] }] },
    ],
  },
  {
    id: 'hardcore-uk', name: 'UK / happy hardcore', genre: 'hardcore', bpm: 172, swing: 54,
    tip: 'Faster rave: a four-floor kick with a chopped breakbeat over the top, plus the piano-house off-beat hats. Bright rather than brutal — the snares come from a sampled break, not a machine.',
    layers: [
      { name: 'Four-floor kick', why: 'The kick keeps a straight pulse so the break above it can be as chopped as you like.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Break snares', why: 'Snare on 2 & 4 plus an early snare on the “e of 3” — a sampled break poking through.', add: [{ v: 'snare', on: [4, 9, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'Straight from Italian piano house — happy hardcore is rave music with the tempo doubled.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Ghost roll', why: 'Ghosted snares on the “a”s give the break its rolling momentum at 172.', add: [{ v: 'snare', on: [7, 15] }] },
      { name: 'Kick pickup', why: 'An extra kick on the “a of 4” slams into the next bar.', add: [{ v: 'kick', on: [15] }] },
    ],
  },
  {
    id: 'hardcore-frenchcore', name: 'Frenchcore / uptempo', genre: 'hardcore', bpm: 200, swing: 50,
    tip: 'At 200 BPM the kick becomes a rolling texture: four on the floor plus off-beat kicks, so the low end is effectively playing 8ths. Everything else is stripped out to make room.',
    layers: [
      { name: 'Rolling kick', why: 'Kick on every 8th — at 200 BPM that reads as a continuous rolling bass rather than separate hits.', add: [{ v: 'kick', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Snare on 3', why: 'A single snare per bar is all the phrasing this tempo can support.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Hat 16ths', why: 'Closed hats on the off-16ths are the only element still readable as rhythm.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Kick roll', why: 'A 16th roll at the end of the bar signals the phrase change.', add: [{ v: 'kick', on: [13, 15] }] },
    ],
  },
];
