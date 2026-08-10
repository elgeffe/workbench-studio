// House and its tech/minimal offshoots. Everything here is built on a
// four-on-the-floor kick; the genre lives in what answers it on the off-beat.
import type { DrumTemplate } from '../drums';

export const HOUSE_PATTERNS: DrumTemplate[] = [
  // --------------------------------------------------------------- house ----
  {
    id: 'house', name: 'Chicago jack', genre: 'house', bpm: 124, swing: 52,
    tip: 'The original: 909 kick on every beat, clap on 2 & 4, open hats on every off-beat 8th, and a skipping closed hat between them. The kick IS the pulse — everything else decorates it.',
    layers: [
      { name: 'Four on the floor', why: 'Kick on all four beats — no call-and-response, just relentless pulse. This one layer already says “house”.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Clap backbeat', why: 'The clap keeps the 2-&-4 backbeat idea from funk, layered over the four-to-the-floor kick.', add: [{ v: 'clap', on: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'Open hats on every “and” — the exact opposite of the kick. Kick-hat-kick-hat is the engine of dance music.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'The skip', why: 'Closed hats on the “a” 16ths add a skipping shuffle between the open hats — a garage/house signature.', add: [{ v: 'chat', on: [3, 7, 11, 15] }] },
      { name: 'Perc sparkle', why: 'A rim tick on odd 16ths adds ear candy without touching the groove’s skeleton.', add: [{ v: 'rim', on: [5, 13] }] },
    ],
  },
  {
    id: 'house-deep', name: 'Deep house', genre: 'house', bpm: 122, swing: 56,
    tip: 'Softer and swung: a rounded kick, a rim instead of a clap, shakers on 16ths, and a real shuffle. Nothing is sharp — the groove should feel like it is breathing.',
    layers: [
      { name: 'Rounded four-floor', why: 'The same pulse, but with a longer, warmer kick — deep house kicks decay rather than click.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Off-beat open hats', why: 'The off-beat answer is non-negotiable in house. Here it is quieter and shorter than in Chicago jack.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Shaker 16ths', why: 'Swung 16th shakers replace the hard hat carpet — this is where the “deep” feel comes from.', add: [{ v: 'shaker', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Rim backbeat', why: 'A soft rimshot on 2 & 4 instead of a clap keeps the backbeat present without hardening the track.', add: [{ v: 'rim', on: [4, 12] }] },
      { name: 'Ghost snare roll', why: 'Two low-velocity snares before beat 4 hint at a live drummer inside the machine.', add: [{ v: 'snare', on: [10, 11] }] },
    ],
  },
  {
    id: 'house-soulful', name: 'Soulful house', genre: 'house', bpm: 123, swing: 58,
    tip: 'House with gospel and disco in it: swung 16ths, a live-sounding snare *and* clap on the backbeat, tambourine on the off-beats, and a kick that occasionally skips. Made for singers.',
    layers: [
      { name: 'Kick with a skip', why: 'Four on the floor plus a 16th pickup before beat 3 — the small deviation that makes it feel played.', add: [{ v: 'kick', on: [0, 4, 7, 8, 12], acc: [0, 8] }] },
      { name: 'Snare + clap backbeat', why: 'Stacking a live snare under the clap on 2 & 4 gives the gospel-flavoured crack this style needs.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }, { v: 'clap', on: [4, 12] }] },
      { name: 'Tambourine off-beats', why: 'Tambourine on every “and” — Motown’s idea, still doing the same lifting job 60 years later.', add: [{ v: 'tamb', on: [2, 6, 10, 14] }] },
      { name: 'Swung 16th hats', why: 'With swing near 58 the hats shuffle. Soulful house is the swingiest branch of the family.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ghost snares', why: 'Two whispered snares on the “a” of 1 and 3 add the human roll under the four-floor pulse.', add: [{ v: 'snare', on: [3, 11] }] },
    ],
  },
  {
    id: 'house-french', name: 'French filter house', genre: 'house', bpm: 126, swing: 52,
    tip: 'Disco loops filtered and compressed: punchy four-floor kick, a big clap, open hats on the off-beats and 16th hats sweeping underneath. The rhythm is simple because the filter automation is the performance.',
    layers: [
      { name: 'Compressed kick', why: 'Four on the floor, short and loud, so that everything else visibly ducks around it.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Big clap', why: 'A wide reverbed clap on 2 & 4 — the only backbeat sound in the track.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'The off-beat hat is what keeps a filtered disco loop danceable when the filter closes.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: '16th hat sweep', why: 'Closed hats on the remaining 16ths give the filter something to sweep through.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
    ],
  },
  {
    id: 'house-afro', name: 'Afro house', genre: 'house', bpm: 120, swing: 54,
    tip: 'Four-floor kick with African percussion logic on top: interlocking toms, a shaker timeline, and no clap on the backbeat at all. The pulse is European, the conversation above it is not.',
    layers: [
      { name: 'Four on the floor', why: 'The dancefloor contract stays intact — everything else in the pattern is free.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Tom conversation', why: 'Low toms on the “a of 1”, “and of 2” and “a of 3” form a call-and-response with the kick.', add: [{ v: 'htom', on: [3, 6, 11], acc: [6] }] },
      { name: 'Shaker timeline', why: 'A shaker on 16ths, accented in threes, cuts across the four-beat pulse — the polyrhythm that defines the style.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15], acc: [0, 3, 6, 9, 12] }] },
      { name: 'Rim timeline', why: 'A woodblock/rim on the tresillo (1, “and of 2”, 4) anchors the African side of the groove.', add: [{ v: 'cowbell', on: [0, 6, 12] }] },
      { name: 'Off-beat open hat', why: 'One open hat on the “and of 4” answers the tom line and turns the bar.', add: [{ v: 'ohat', on: [14] }] },
    ],
  },
  {
    id: 'house-jackin', name: 'Jackin’ house', genre: 'house', bpm: 126, swing: 56,
    tip: 'Chunky and shuffled: the kick drops a beat to make room for a bass stab, the clap doubles up, and heavily swung hats give it the “jack”. Groove over hypnosis.',
    layers: [
      { name: 'Kick with a hole', why: 'Kick on 1, 2 and 4 — leaving beat 3 empty is what lets the bassline jack.', add: [{ v: 'kick', on: [0, 4, 12], acc: [0] }] },
      { name: 'Double clap', why: 'Clap on 2 & 4 plus a flam a 16th later — that double-clap is the genre’s calling card.', add: [{ v: 'clap', on: [4, 5, 12, 13], acc: [4, 12] }] },
      { name: 'Swung 16th hats', why: 'Hats on all 16ths with heavy swing — set the SWING slider to 58+ and the pattern starts to strut.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Kick answer on the “a”', why: 'A 16th kick just before beat 4 refills the gap left on beat 3.', add: [{ v: 'kick', on: [11] }] },
    ],
  },

  {
    id: 'house-lofi', name: 'Lo-fi house', genre: 'house', bpm: 122, swing: 58,
    tip: 'House made on a laptop out of dusty samples: the four-floor skeleton is intact but everything is saturated, swung and slightly out of tune. The pattern is deliberately ordinary — the character comes from the processing.',
    layers: [
      { name: 'Dusty four-floor', why: 'A sampled, soft-clipped kick rather than a clean 909 — mixed lower than in club house so the tape hiss sits alongside it.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Washed clap', why: 'Clap on 2 & 4 drowned in reverb. Blurring the backbeat is the genre’s whole attitude to the club original.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'The house see-saw survives every mutation of the style, including this one.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Swung shaker 16ths', why: 'Heavily swung closed hats on the off-16ths give the loop its lopsided, hand-made wobble.', add: [{ v: 'shaker', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Sampled ghost snare', why: 'Two quiet snares lifted from an old break — the “found sound” detail that stops the loop being a template.', add: [{ v: 'snare', on: [7, 15] }] },
    ],
  },
  {
    id: 'house-rawswing', name: 'Raw swung house', genre: 'house', bpm: 128, swing: 58,
    tip: 'The raw Dutch/UK club sound: a stripped four-floor kick with garage-level swing, broken electro percussion instead of a clap-heavy backbeat, and a sub stab answering the kick. Deep and minimal, but bouncing rather than hypnotic.',
    layers: [
      { name: 'Raw four-floor', why: 'A short, unprocessed kick with a 16th ghost before the downbeat — punchy, never boomy, so the bass has room.', add: [{ v: 'kick', on: [0, 4, 8, 12, 15], acc: [0, 8] }] },
      { name: 'Garage-swung hats', why: 'Closed hats on the off-16ths at 58% swing. This single layer is what makes it swing like garage instead of ticking like tech-house.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15], acc: [3, 11] }] },
      { name: 'Dry clap on 2 & 4', why: 'One short, unreverbed clap per backbeat — present, but never the loudest thing in the bar.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Broken perc', why: 'Rim/electro fragments on the “a of 1”, “a of 2” and “and of 3” — the bouncy, chopped percussion that separates this from plain minimal.', add: [{ v: 'rim', on: [3, 7, 10] }] },
      { name: 'Off-beat open hats', why: 'Open hats only on the “and” of 2 and 4, not all four — keeping two of them closed leaves the groove hungry.', add: [{ v: 'ohat', on: [6, 14] }] },
      { name: 'Sub stab', why: 'A low tom standing in for the sub-bass stab on the “e of 4” — in a real track this is the funk bassline poking through.', add: [{ v: 'sub', on: [13] }] },
    ],
  },
  {
    id: 'house-slapfunk', name: 'Slapfunk', genre: 'house', bpm: 128, swing: 56,
    tip: 'The one house pattern here that is *not* four on the floor: kick only on 1 & 3, clap answering on 2 & 4, so the bar reads as a half-time boom-bap skeleton driven by a full 16th hat carpet. Open hats take the off-beats and the closed hats fill everything else — the drive comes from the top, not the bottom.',
    layers: [
      { name: 'Kick on 1 & 3', why: 'Two kicks a bar instead of four. Dropping beats 2 & 4 hands them to the clap and leaves the low end wide open for a slapping bassline.', add: [{ v: 'kick', on: [0, 8], acc: [0, 8] }] },
      { name: 'Clap backbeat', why: 'Clap on 2 & 4 completes the pulse the kick gave up — together they still spell out four beats, but with two different sounds instead of one.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'An open hat on the “and” of every beat. This is the house see-saw, and with the kick missing on 2 & 4 it is doing more of the work than usual.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Driving 16th closed hats', why: 'Closed hats on the three 16ths the open hat leaves free, accented on each downbeat and soft on the “e” and “a”. That accent pattern is the whole groove — flat velocities turn it into a machine gun.', add: [{ v: 'chat', on: [0, 1, 3, 4, 5, 7, 8, 9, 11, 12, 13, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ghost rimshots', why: 'Four rim ticks at roughly 30% velocity, one per beat but never on the same 16th twice — a wandering texture you feel rather than hear.', add: [{ v: 'rim', on: [3, 5, 10, 13] }] },
    ],
  },

  // ------------------------------------------------- tech-house & minimal ----
  {
    id: 'techhouse-rolling', name: 'Rolling tech-house', genre: 'techhouse', bpm: 126, swing: 54,
    tip: 'The modern club default: tight kick, off-beat open hat, a clap-snare stack on 2 & 4, and a percussion tick that never repeats the same way twice. It rolls rather than pounds.',
    layers: [
      { name: 'Tight four-floor', why: 'A short, punchy kick that leaves room for the bass between hits.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Off-beat open hats', why: 'The off-beat hat carries the roll; keep it short so it closes before the next kick.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Clap + rim backbeat', why: 'Clap on 2 & 4 with a rim a 16th later — the small displacement stops the backbeat feeling square.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }, { v: 'rim', on: [7, 15] }] },
      { name: '16th shaker', why: 'A quiet shaker on the “e” and “a” 16ths fills the grid without adding weight.', add: [{ v: 'shaker', on: [1, 3, 5, 9, 11, 13] }] },
      { name: 'Ghost snare roll', why: 'Two low snares before beat 4 push the loop over the turnaround — the “roll” in rolling tech-house.', add: [{ v: 'snare', on: [10, 11] }] },
    ],
  },
  {
    id: 'techhouse-minimal', name: 'Minimal', genre: 'techhouse', bpm: 128, swing: 52,
    tip: 'Subtraction as composition: kick, one off-beat hat, one rim, and a clap that only shows up on beat 4. Fewer elements mean every velocity change is audible.',
    layers: [
      { name: 'Dry kick', why: 'Four on the floor with almost no tail — in minimal the kick is a click, not a boom.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'One off-beat hat', why: 'A single closed hat on every “and”. No open hats, no 16ths — the whole top end is four notes.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Clap on 4 only', why: 'Dropping the beat-2 clap halves the backbeat and creates a two-beat question and answer.', add: [{ v: 'clap', on: [12], acc: [12] }] },
      { name: 'Wandering rim', why: 'One rim on the “a of 3” — the element you would move to a different 16th every few bars.', add: [{ v: 'rim', on: [11] }] },
    ],
  },
  {
    id: 'techhouse-micro', name: 'Micro-house shuffle', genre: 'techhouse', bpm: 125, swing: 58,
    tip: 'Clicks, pops and a lot of swing: a shuffled 16th grid made of tiny percussive sounds, with the kick almost incidental. Program with very low velocities and let the swing carry it.',
    layers: [
      { name: 'Soft kick', why: 'Four on the floor, but mixed low — in micro-house the kick supports rather than leads.', add: [{ v: 'kick', on: [0, 4, 8, 12] }] },
      { name: 'Shuffled 16th clicks', why: 'Rim clicks on the “e” and “a” of every beat, dragged by the swing, are the actual groove.', add: [{ v: 'rim', on: [1, 3, 5, 7, 9, 11, 13, 15], acc: [3, 11] }] },
      { name: 'Off-beat hat', why: 'A closed hat on the “and”s gives the ear one predictable event per beat.', add: [{ v: 'chat', on: [2, 6, 10, 14] }] },
      { name: 'Pop on 4', why: 'A single clap late in the bar — the only element that says “backbeat” at all.', add: [{ v: 'clap', on: [12], acc: [12] }] },
      { name: 'Open-hat breath', why: 'One open hat on the last 16th releases the tension the tight clicks build up.', add: [{ v: 'ohat', on: [15] }] },
    ],
  },
  {
    id: 'techhouse-latin', name: 'Latin tech-house', genre: 'techhouse', bpm: 127, swing: 54,
    tip: 'Tech-house with a conga/bongo layer: the four-floor kick underneath, a tresillo rim timeline, and toms answering on the off-beats. The Ibiza staple.',
    layers: [
      { name: 'Four-floor kick', why: 'The pulse. Everything Latin about this pattern happens above it.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Tresillo rim', why: 'Rim on 1, the “and of 2” and beat 4 — the 3+3+2 pattern that Latin music shares with electro.', add: [{ v: 'rim', on: [0, 6, 12], acc: [6] }] },
      { name: 'Conga toms', why: 'Low toms on the “a of 1” and “e of 4” answer the rim — two hand drums having a conversation.', add: [{ v: 'htom', on: [3, 13] }] },
      { name: 'Off-beat open hats', why: 'The house engine reasserts itself on every “and”.', add: [{ v: 'ohat', on: [2, 10] }] },
      { name: 'Clap on 2 & 4', why: 'A dry clap keeps the club backbeat present under all the percussion.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
    ],
  },
];
