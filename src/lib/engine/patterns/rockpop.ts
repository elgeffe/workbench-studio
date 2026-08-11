// Rock, metal & punk, pop and disco patterns. See ../drums.ts for the shape:
// every pattern is a stack of layers in the order a drummer would build it.
import type { DrumTemplate } from '../drums';

export const ROCK_POP_PATTERNS: DrumTemplate[] = [
  // ---------------------------------------------------------------- rock ----
  {
    id: 'rock', name: 'Straight 8ths', genre: 'rock', bpm: 104, swing: 50,
    tip: 'The mother pattern of pop and rock: kick anchors beats 1 & 3, snare answers on 2 & 4, hats keep straight 8ths on top. Nearly every groove in this box is a variation of this conversation.',
    layers: [
      { name: 'Kick on 1 & 3', why: 'The kick lays the foundation on the strong beats — where you would stomp your foot.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Backbeat snare', why: 'The snare answers on beats 2 & 4 — the backbeat, where an audience claps. Kick and snare now have a call-and-response.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '8th-note hats', why: 'Closed hats subdivide the bar into straight 8ths — the timekeeping layer that glues kick and snare together.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'The push', why: 'An extra kick on the “and of 3” pushes the groove forward — the first taste of syncopation.', add: [{ v: 'kick', on: [10] }] },
      { name: 'Ghost 16th', why: 'A quiet snare on the “a of 2” fills the gap before beat 3. Ghost notes are felt more than heard.', add: [{ v: 'snare', on: [7] }] },
    ],
  },
  {
    id: 'rock-halftime', name: 'Half-time', genre: 'rock', bpm: 92, swing: 50,
    tip: 'Move the snare to beat 3 only and the same tempo suddenly feels half as slow and twice as heavy. This is the trick behind every big rock chorus and every trap beat.',
    layers: [
      { name: 'One snare, beat 3', why: 'With the backbeat halved, each bar has one huge landing point instead of two — the groove drags in the best way.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Kick on 1', why: 'Beat 1 answers the snare from the far side of the bar. Two hits, maximum weight.', add: [{ v: 'kick', on: [0], acc: [0] }] },
      { name: '8th hats', why: 'The hats still run at the original tempo, which is what tells your ear the song did not actually slow down.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Kick pickup', why: 'A kick on the “and of 3” and the “a of 4” drives into the next bar so the half-time feel does not go limp.', add: [{ v: 'kick', on: [10, 15] }] },
      { name: 'Open-hat accent', why: 'One open hat on the “a of 3” splashes just before the last beat, marking the halfway point of the long bar.', add: [{ v: 'ohat', on: [11] }] },
    ],
  },
  {
    id: 'rock-motorik', name: 'Motorik / driving', genre: 'rock', bpm: 148, swing: 50,
    tip: 'The krautrock engine: kick on every beat like dance music, snare still on 2 & 4, hats in relentless 16ths. Hypnotic rather than heavy — momentum is the point.',
    layers: [
      { name: 'Four-on-the-floor kick', why: 'A rock kit playing dance-music pulse. This is the bridge between rock and house.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Backbeat snare', why: 'The snare keeps 2 & 4 so the pattern still reads as rock and not as disco.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '16th hats', why: 'Doubling the hats to 16ths turns the pulse into forward motion — the “motor” in motorik.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Extra snare on the “and of 4”', why: 'One extra snare turns the bar around into the next one, the way Neu! and Stereolab do it.', add: [{ v: 'snare', on: [14] }] },
    ],
  },
  {
    id: 'rock-tom', name: 'Tom groove (tribal)', genre: 'rock', bpm: 100, swing: 50,
    tip: 'Swap the hi-hat for a floor tom and the same skeleton becomes primal. No cymbal at all — the groove is carried by drums with pitch.',
    layers: [
      { name: 'Kick on 1 & 3', why: 'The familiar rock foundation, unchanged. Only the timekeeping voice will change.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Tom 8ths', why: 'The floor tom replaces the hat as the subdivision. Losing the cymbal removes the “sizzle” and leaves only body.', add: [{ v: 'ltom', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 8] }] },
      { name: 'Backbeat snare', why: 'Snare on 2 & 4 keeps your ear oriented inside the wash of toms.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Tom syncopation', why: 'Extra tom hits on the “e” of 2 and the “a” of 4 break the even 8ths and make the pattern feel hand-played.', add: [{ v: 'ltom', on: [5, 15] }] },
    ],
  },
  {
    id: 'rock-stomp', name: 'Stadium stomp', genre: 'rock', bpm: 82, swing: 50,
    tip: 'Two stomps and a clap — the most-recognised rhythm in stadium rock, and proof that a groove needs almost nothing. Three notes per bar carry an entire crowd.',
    layers: [
      { name: 'Stomp, stomp', why: 'Two kicks in a row on beat 1 and the “and of 1” — feet, not a drum kit.', add: [{ v: 'kick', on: [0, 2, 8, 10], acc: [0, 8] }] },
      { name: 'Clap', why: 'A single clap on beats 2 & 4 answers the stomps. Stomp-stomp-clap, repeat forever.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Snare reinforcement', why: 'Adding a snare under the clap turns a chant into a drum part when the band comes in.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Crash accents', why: 'A ride/crash on each downbeat frames the pattern for the arena.', add: [{ v: 'ride', on: [0, 8], acc: [0] }] },
    ],
  },
  {
    id: 'rock-punk', name: 'Punk 8ths', genre: 'rock', bpm: 172, swing: 50,
    tip: 'Rock with everything doubled and nothing wasted: kick on 1 & 3, snare on 2 & 4, hats hammering 8ths at 170+. Speed does the work that syncopation does elsewhere.',
    layers: [
      { name: 'Fast backbeat', why: 'At this tempo the backbeat alone is aggressive — no ghost notes needed, no space to put them.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Kick on 1 & 3', why: 'Keeping the kick simple at high tempo keeps the pattern readable instead of a rumble.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'Driving 8th hats', why: 'Hats stay on straight 8ths — in a real band the drummer plays these on a half-open hat so they wash.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [0, 4, 8, 12] }] },
      { name: 'Double kick before the backbeat', why: 'One extra kick on the “and of 2” pushes into beat 3 — the small amount of syncopation punk allows itself.', add: [{ v: 'kick', on: [6] }] },
    ],
  },

  // --------------------------------------------------------------- metal ----
  {
    id: 'metal-double', name: 'Double kick', genre: 'metal', bpm: 160, swing: 50,
    tip: 'The kick moves to constant 16ths (two feet) while the snare keeps a normal backbeat and the ride marks the quarters. The low end becomes a texture rather than a pulse.',
    layers: [
      { name: 'Backbeat snare', why: 'Build from the backbeat, not the kick — it is the only thing keeping the pattern legible once the feet start.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '16th double kick', why: 'Alternating feet fill every 16th. Accent the quarters or the whole thing becomes one undifferentiated rumble.', add: [{ v: 'kick', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Ride/China quarters', why: 'A cymbal on the quarters is the anchor the ear grabs when everything else is a blur.', add: [{ v: 'ride', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Crash accent', why: 'An open hat/crash on the “and of 4” signals the bar turning over.', add: [{ v: 'ohat', on: [14] }] },
    ],
  },
  {
    id: 'metal-blast', name: 'Blast beat', genre: 'metal', bpm: 180, swing: 50,
    tip: 'The extreme-metal signature: kick and snare alternate on consecutive 8ths, so together they read as constant 8th notes with alternating pitch. Fast, flat, and deliberately relentless.',
    layers: [
      { name: 'Kick on the down-8ths', why: 'The kick takes every on-beat 8th — half of the alternation.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0] }] },
      { name: 'Snare on the up-8ths', why: 'The snare fills every off-beat 8th. Kick-snare-kick-snare is the blast: one voice per subdivision.', add: [{ v: 'snare', on: [2, 6, 10, 14], acc: [2, 10] }] },
      { name: 'Cymbal with the kick', why: 'The ride or crash doubles the kick hand so the top end is as constant as the bottom.', add: [{ v: 'ride', on: [0, 4, 8, 12] }] },
      { name: 'Gravity 16ths', why: 'Doubling the snare into 16ths on the last beat is the “gravity blast” gear-change that ends a phrase.', add: [{ v: 'snare', on: [13, 15] }] },
    ],
  },
  {
    id: 'metal-breakdown', name: 'Breakdown (half-time)', genre: 'metal', bpm: 120, swing: 50,
    tip: 'Metal’s heaviest tool: drop to half-time, put the snare on 3 alone, and sync the kick to the guitar’s syncopated chugs. The groove stops rolling and starts hitting.',
    layers: [
      { name: 'Snare on 3', why: 'One backbeat in the bar. Everything after this is designed to make that one hit feel enormous.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Chug kicks', why: 'Kicks on 1, the “a of 1”, the “and of 2” and the “a of 3” lock to the guitar riff instead of to the beat grid.', add: [{ v: 'kick', on: [0, 3, 6, 11], acc: [0] }] },
      { name: 'China on the downbeats', why: 'A trashy cymbal on 1 and 3 frames the half-time feel without adding motion.', add: [{ v: 'ride', on: [0, 8], acc: [0, 8] }] },
      { name: 'Final kick push', why: 'Two 16ths at the end of the bar reload the riff for the next repetition.', add: [{ v: 'kick', on: [14, 15] }] },
    ],
  },
  {
    id: 'metal-dbeat', name: 'D-beat', genre: 'metal', bpm: 168, swing: 50,
    tip: 'Discharge’s hardcore-punk beat: a galloping kick that lands just after each snare, giving the pattern a permanent forward stumble. Hardcore, crust and much black metal are built on it.',
    layers: [
      { name: 'Backbeat snare', why: 'Snare on 2 & 4 as always — the d-beat identity comes from the kick around it.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'The d-beat kick', why: 'Kick on 1, the “and of 2” and the “and of 4”: one kick immediately after each snare. That off-balance answer is the whole beat.', add: [{ v: 'kick', on: [0, 6, 8, 14], acc: [0] }] },
      { name: 'Open-hat wash', why: 'D-beat drummers ride a half-open hat on the quarters so the top end never closes.', add: [{ v: 'ohat', on: [0, 4, 8, 12] }] },
      { name: 'Snare push', why: 'A 16th before beat 1 of the next bar makes the loop lurch forward.', add: [{ v: 'snare', on: [15] }] },
    ],
  },

  // ----------------------------------------------------------------- pop ----
  {
    id: 'pop-modern', name: 'Modern half-time pop', genre: 'pop', bpm: 100, swing: 50,
    tip: 'Today’s default pop beat: clap-snare on beat 3 only, minimal kick, and a percussion tick keeping the top busy. Everything is arranged around leaving room for the vocal.',
    layers: [
      { name: 'Clap on 3', why: 'A layered clap-plus-snare on beat 3 is the modern backbeat — half-time, so the verse never crowds the singer.', add: [{ v: 'clap', on: [8], acc: [8] }, { v: 'snare', on: [8], acc: [8] }] },
      { name: 'Sparse kick', why: 'Kick on 1 and the “and of 3”. Two notes are enough when the sound is big.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: 'Tick percussion', why: 'A dry rim/click on the off-8ths keeps energy up without adding weight.', add: [{ v: 'rim', on: [2, 6, 10, 14] }] },
      { name: 'Hat 16ths in the gaps', why: 'Short bursts of 16th hats before each landing point add motion exactly where the vocal breathes.', add: [{ v: 'chat', on: [5, 7, 13, 15] }] },
    ],
  },
  {
    id: 'pop-eighties', name: '80s gated snare', genre: 'pop', bpm: 118, swing: 50,
    tip: 'The 1980s sound: a huge gated-reverb snare on 2 & 4, simple kick, and a tom fill built into the loop. The pattern is plain on purpose — the reverb is the arrangement.',
    layers: [
      { name: 'Giant backbeat', why: 'Snare on 2 & 4, meant to be drenched in gated reverb. Nothing else competes with it.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Simple kick', why: 'Kick on 1 and the “and of 3” — deliberately unfussy so the snare owns the bar.', add: [{ v: 'kick', on: [0, 10], acc: [0] }] },
      { name: '8th hats', why: 'Tight, quiet 8ths from a drum machine; in this era the hats are the only human-scale element.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Tom answer', why: 'Two gated toms at the end of the bar — the built-in fill every 80s track has.', add: [{ v: 'ltom', on: [14, 15] }] },
    ],
  },
  {
    id: 'pop-dance', name: 'Dance-pop', genre: 'pop', bpm: 122, swing: 50,
    tip: 'Pop borrowing house’s engine: four-on-the-floor kick with a clap backbeat and off-beat open hats, but with pop’s tidy 16th hat topping. Chart-radio’s most reliable groove.',
    layers: [
      { name: 'Four on the floor', why: 'Kick on every beat is a promise to the dancefloor before the chorus even arrives.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Clap backbeat', why: 'The clap keeps 2 & 4 so the pop ear still hears a backbeat inside the dance pulse.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'Open hats on every “and” create the kick-hat see-saw that makes a room move.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: '16th hat fills', why: 'Closed hats on the “e” and “a” 16ths add sparkle without touching the skeleton.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
    ],
  },
  {
    id: 'pop-acoustic', name: 'Side-stick verse', genre: 'pop', bpm: 92, swing: 54,
    tip: 'The quiet-verse groove: cross-stick instead of snare, shaker instead of hats, kick barely there. Written so the chorus can arrive by simply switching to a real snare.',
    layers: [
      { name: 'Side-stick on 2 & 4', why: 'A cross-stick is the backbeat at whisper volume — the standard verse solution.', add: [{ v: 'rim', on: [4, 12], acc: [4, 12] }] },
      { name: 'Soft kick', why: 'Kick on 1 and the “and of 3” only; in a verse the bass guitar carries the low end.', add: [{ v: 'kick', on: [0, 10] }] },
      { name: 'Shaker 8ths', why: 'The shaker (closed hat here) plays gently swung 8ths so the verse breathes rather than ticks.', add: [{ v: 'shaker', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Lift into the chorus', why: 'One open hat on the very last 16th is the signal that something bigger is coming.', add: [{ v: 'ohat', on: [15] }] },
    ],
  },

  // --------------------------------------------------------------- disco ----
  {
    id: 'disco-classic', name: 'Classic disco', genre: 'disco', bpm: 120, swing: 54,
    tip: 'The blueprint house inherited: kick on all four, snare on 2 & 4, and an open hat on every off-beat played by the hi-hat foot. Listen for the “boom-tss” see-saw.',
    layers: [
      { name: 'Four on the floor', why: 'Disco invented this as a dance-band idea long before drum machines made it a genre.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Snare backbeat', why: 'A real snare on 2 & 4 — disco keeps the rock backbeat that house later swaps for a clap.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'The hat opens on every “and” and closes on the kick. This is the sound of the style.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Closed-hat 16ths', why: 'Quiet closed hats on the remaining 16ths fill in the shuffle underneath the open hats.', add: [{ v: 'chat', on: [1, 3, 5, 7, 9, 11, 13, 15] }] },
      { name: 'Snare pickup', why: 'A 16th ghost before beat 3 keeps a live drummer’s bounce inside a machine-like pattern.', add: [{ v: 'snare', on: [7] }] },
    ],
  },
  {
    id: 'disco-philly', name: 'Philly / strings disco', genre: 'disco', bpm: 116, swing: 52,
    tip: 'Lusher and more played-in: 16th hats throughout, a tom answer at the end of the bar, and the kick doubling on the “a” before beat 3 for a rolling feel.',
    layers: [
      { name: 'Rolling kick', why: 'Four on the floor plus a 16th pickup before beat 3 — the kick rolls rather than stamps.', add: [{ v: 'kick', on: [0, 4, 7, 8, 12], acc: [0, 8] }] },
      { name: 'Snare on 2 & 4', why: 'Backbeat unchanged; in Philly records it is often doubled by a timbale or handclap.', add: [{ v: 'snare', on: [4, 12], acc: [4, 12] }] },
      { name: '16th hats', why: 'Continuous 16ths with accents on the quarters — the busy, silky top end of orchestral disco.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Tom turnaround', why: 'Two low toms at the end of the bar are the fill that pushes into the string line.', add: [{ v: 'ltom', on: [14, 15] }] },
    ],
  },
  {
    id: 'disco-boogie', name: 'Boogie / electro-funk', genre: 'disco', bpm: 108, swing: 56,
    tip: 'Early-80s drum-machine funk: the kick leaves the four-to-the-floor grid, a clap takes the backbeat, and the whole thing swings just enough to be human.',
    layers: [
      { name: 'Syncopated kick', why: 'Kick on 1, the “and of 2” and the “and of 3” — boogie breaks the four-floor rule that disco established.', add: [{ v: 'kick', on: [0, 6, 10], acc: [0] }] },
      { name: 'Clap backbeat', why: 'The handclap sound (LinnDrum, 808) replaces the snare and defines the era.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }] },
      { name: 'Swung 16th hats', why: 'Hats on 16ths with the swing turned up — the machine playing almost-human.', add: [{ v: 'chat', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Rim melody', why: 'A rimshot on the “a of 1” and “e of 4” adds the little percussive hook boogie tracks always have.', add: [{ v: 'rim', on: [3, 13] }] },
    ],
  },
  {
    id: 'disco-nu', name: 'Nu-disco', genre: 'disco', bpm: 115, swing: 52,
    tip: 'Modern reissue of the formula: four-floor kick, clap and snare stacked, open hats on the off-beats, plus a filtered 16th tick. Built to sit under a sidechained bassline.',
    layers: [
      { name: 'Four on the floor', why: 'The pulse, tuned low and short so the bass can sidechain against it.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 4, 8, 12] }] },
      { name: 'Stacked backbeat', why: 'Clap and snare together on 2 & 4 give one wide backbeat sound rather than two.', add: [{ v: 'clap', on: [4, 12], acc: [4, 12] }, { v: 'snare', on: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'The disco see-saw survives intact — it is the one element you cannot remove.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Ghost kick', why: 'A quiet kick on the “a of 4” makes the loop lean into the next bar.', add: [{ v: 'kick', on: [15] }] },
    ],
  },
];
