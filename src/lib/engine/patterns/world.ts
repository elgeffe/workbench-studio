// Afro-Cuban and Brazilian, Afrobeat/Amapiano, reggae/dancehall and the
// reggaeton family. Most of these replace the backbeat with a timeline.
import type { DrumTemplate } from '../drums';

export const WORLD_PATTERNS: DrumTemplate[] = [
  // --------------------------------------------------------------- latin ----
  {
    id: 'clave', name: 'Son clave (3-2)', genre: 'latin', bpm: 105, swing: 50,
    tip: 'Everything sits on the 3-2 son clave — a two-bar key (folded into one here) that every other part must agree with. There is no backbeat; the clave itself is the timeline.',
    layers: [
      { name: '3-2 son clave', why: 'The key pattern: three strikes (“1, and-of-2, 4”) then two. Learn to sing this before anything else.', add: [{ v: 'cowbell', on: [0, 3, 6, 10, 12], acc: [0, 3, 6, 10, 12] }] },
      { name: 'Tumbao kick', why: 'The kick marks the “bombo” — the and-of-2 — and anticipates the next bar on the last 16th, instead of sitting on downbeats.', add: [{ v: 'kick', on: [7, 15] }] },
      { name: 'Cáscara', why: 'The shell-of-the-timbale pattern rides on top, weaving with the clave without fighting its accents.', add: [{ v: 'ride', on: [0, 3, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Open tones', why: 'Conga open tones at the end of the cycle — the warm answer to the clave.', add: [{ v: 'htom', on: [12, 14] }] },
    ],
  },
  {
    id: 'latin-songo', name: 'Songo', genre: 'latin', bpm: 100, swing: 50,
    tip: 'The Cuban kit groove that let Latin music work on a drum set: clave logic in the hands, a tumbao kick, and a snare that finally does play a backbeat-ish accent. The bridge to Latin jazz and salsa-funk.',
    layers: [
      { name: 'Clave timeline', why: 'The 3-2 clave stays underneath everything, played on rim or woodblock.', add: [{ v: 'cowbell', on: [0, 3, 6, 10, 12] }] },
      { name: 'Tumbao kick', why: 'Kick on the “and of 2” and beat 4 — anticipating rather than landing, exactly like a bass tumbao.', add: [{ v: 'kick', on: [6, 12], acc: [6] }] },
      { name: 'Songo snare', why: 'Snare accents on the “a of 1” and beat 4 with ghost notes between — the part that makes songo playable on a kit.', add: [{ v: 'snare', on: [3, 5, 11, 12], acc: [3, 12] }] },
      { name: 'Hat 8ths', why: 'The hat keeps steady 8ths so the syncopated parts have a straight reference.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Tom conversation', why: 'Low toms answering on the “e of 3” and the last 16th — the conga part folded into the kit.', add: [{ v: 'htom', on: [9, 15] }] },
    ],
  },
  {
    id: 'latin-mambo', name: 'Mambo / cáscara', genre: 'latin', bpm: 190, swing: 50,
    tip: 'The salsa engine at full speed: cáscara on the timbale shells, bell accents, and a bass drum playing only anticipations. Count in half-time if 190 feels impossible — the clave is still the map.',
    layers: [
      { name: 'Cáscara', why: 'The shell pattern is the timekeeper: dense, syncopated, and locked to the clave.', add: [{ v: 'ride', on: [0, 3, 4, 6, 8, 10, 12, 14], acc: [0, 6, 12] }] },
      { name: 'Clave', why: 'The 3-2 clave underneath, on a woodblock. Every horn and piano figure will be written against this.', add: [{ v: 'cowbell', on: [0, 3, 6, 10, 12] }] },
      { name: 'Bombo anticipation', why: 'Kick only on the “and of 2” and the last 16th — the bass never lands on beat 1 in salsa.', add: [{ v: 'kick', on: [6, 15], acc: [6] }] },
      { name: 'Conga tumbao', why: 'Open tones on the “and of 2” and beat 4 complete the interlocking percussion section.', add: [{ v: 'htom', on: [7, 14] }] },
    ],
  },
  {
    id: 'latin-bossa', name: 'Bossa nova', genre: 'latin', bpm: 132, swing: 50,
    tip: 'Brazil’s quiet revolution: a straight-8th rim clave, a soft two-beat surdo kick, and brushed 8ths on top. Dead straight — put any swing on this and it stops being bossa.',
    layers: [
      { name: 'Bossa clave', why: 'Rim on 1, the “and of 2”, the “and of 3” and beat 4 — the Brazilian cousin of the son clave.', add: [{ v: 'rim', on: [0, 6, 10, 12], acc: [0, 6] }] },
      { name: 'Surdo kick', why: 'Kick on 1 and 3 with the second one accented — the low drum that carries Brazilian music.', add: [{ v: 'kick', on: [0, 8], acc: [8] }] },
      { name: 'Brushed 8ths', why: 'Even, quiet 8ths on the hat or brushes — no swing, no accents, pure texture.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Ghost snare', why: 'One ghosted snare on the “a of 4” is all the fill bossa ever needs.', add: [{ v: 'snare', on: [15] }] },
    ],
  },
  {
    id: 'latin-samba', name: 'Samba', genre: 'latin', bpm: 96, swing: 50,
    tip: 'Written as 2/4 but played on a 16-step bar: surdo on the “and” of every beat, continuous 16th shaker, and a tamborim pattern cutting across. The weight is on beat 2, not beat 1.',
    layers: [
      { name: 'Surdo on the “and”', why: 'The big drum accents the off-beats — the reason samba feels like it is leaning forward.', add: [{ v: 'kick', on: [2, 6, 10, 14], acc: [6, 14] }] },
      { name: '16th shaker', why: 'Continuous 16ths on the shaker or ganzá, accented in pairs — the constant hiss of a samba school.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Tamborim', why: 'A rim pattern cutting across the pulse in a 3+3+2 shape — the melodic layer of samba percussion.', add: [{ v: 'rim', on: [0, 3, 6, 9, 12], acc: [0, 6, 12] }] },
      { name: 'Snare ghosts', why: 'Caixa (snare) ghost notes fill the remaining 16ths at a whisper.', add: [{ v: 'snare', on: [5, 7, 13, 15] }] },
    ],
  },

  // ---------------------------------------------------------------- afro ----
  {
    id: 'afrobeat', name: 'Afrobeat (Tony Allen)', genre: 'afro', bpm: 108, swing: 50,
    tip: 'A bell timeline, a sparse conversational kick, and constant quiet 16th chatter. No backbeat wall — every voice is a percolating, interlocking part.',
    layers: [
      { name: 'Bell timeline', why: 'Like the clave, a bell pattern is the timeline the whole band locks to.', add: [{ v: 'cowbell', on: [0, 3, 6, 10, 12, 14], acc: [0, 6, 12] }] },
      { name: 'Talking kick', why: 'The kick converses with the bell — beat 1, the “a of 2”, the “and of 3” — rather than stating a pulse.', add: [{ v: 'kick', on: [0, 7, 10] }] },
      { name: '16th chatter', why: 'Quiet rim taps scattered on off-16ths — the constant undercurrent of an Afrobeat kit.', add: [{ v: 'rim', on: [2, 5, 11, 13] }] },
      { name: 'Hat glue', why: 'Soft 8th hats bind the interlocking parts into one groove.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Ghost snare', why: 'Two whispered snares before the bell accents complete the conversation.', add: [{ v: 'snare', on: [5, 13] }] },
    ],
  },
  {
    id: 'afro-afrobeats', name: 'Afrobeats (modern pop)', genre: 'afro', bpm: 106, swing: 54,
    tip: 'The Lagos pop sound: a 3+3+2 kick pattern, a log-drum-ish tom answer, shaker 16ths and a clap on beat 3 only. Half of the groove comes from the tresillo, half from the swing.',
    layers: [
      { name: 'Tresillo kick', why: 'Kick on 1, the “and of 2” and beat 4 — the 3+3+2 pattern that runs through most Afro-diasporic music.', add: [{ v: 'kick', on: [0, 6, 12], acc: [0] }] },
      { name: 'Clap on 3', why: 'A single clap on beat 3 rather than a 2-&-4 backbeat leaves the bar feeling open.', add: [{ v: 'clap', on: [8], acc: [8] }] },
      { name: 'Shaker 16ths', why: 'Swung 16th shakers are the connective tissue — vary their velocity constantly.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
      { name: 'Tom answer', why: 'Low toms on the “a of 1” and the “e of 4” answer the kick like a talking drum.', add: [{ v: 'htom', on: [3, 13] }] },
      { name: 'Rim ticks', why: 'A dry rim on the “and of 4” marks the loop point.', add: [{ v: 'rim', on: [14] }] },
    ],
  },
  {
    id: 'afro-amapiano', name: 'Amapiano', genre: 'afro', bpm: 112, swing: 56,
    tip: 'South Africa’s slowed-down house: a four-floor kick, a shaker doing all the timekeeping, and the famous log drum answering on the off-beats. Program the log drum — the Sub / 808 row here — as pitched notes, not hits.',
    layers: [
      { name: 'Soft four-floor', why: 'A rounded house kick at 112 — slower than house, which is what gives amapiano its stroll.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Log drum', why: 'The pitched log drum lands on the “a of 1”, the “and of 2” and the “a of 3” — it is the bassline and the hook at once.', add: [{ v: 'sub', on: [3, 6, 11], acc: [3, 11] }] },
      { name: 'Shaker 16ths', why: 'Swung shaker 16ths, quiet and continuous, are the metronome of the whole genre.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [2, 6, 10, 14] }] },
      { name: 'Rim on 2 & 4', why: 'A quiet side-stick keeps a backbeat reference under all the syncopation.', add: [{ v: 'rim', on: [4, 12] }] },
      { name: 'Clap accent', why: 'One clap on beat 3, wide and reverbed — the only loud percussive event in the bar.', add: [{ v: 'clap', on: [8], acc: [8] }] },
    ],
  },
  {
    id: 'afro-kuduro', name: 'Kuduro / Afro-house perc', genre: 'afro', bpm: 128, swing: 50,
    tip: 'Angolan energy: a broken tresillo kick, hard toms on the off-beats and a snare roll answering every bar. Faster and more aggressive than Afrobeats, and built for a soundsystem.',
    layers: [
      { name: 'Broken kick', why: 'Kick on 1, the “and of 1”, the “and of 2” and beat 4 — a tresillo with an extra push.', add: [{ v: 'kick', on: [0, 2, 6, 12], acc: [0] }] },
      { name: 'Tom pattern', why: 'Low toms on the “a” of beats 1 and 3 answer the kick with pitch.', add: [{ v: 'htom', on: [3, 11], acc: [3, 11] }] },
      { name: 'Snare stabs', why: 'Snare on the “e of 3” and beat 4 — displaced from the backbeat, closer to a carnival than to pop.', add: [{ v: 'snare', on: [9, 12], acc: [12] }] },
      { name: 'Shaker drive', why: '16th shakers give the whole thing its forward run at 128.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
    ],
  },

  // -------------------------------------------------------------- reggae ----
  {
    id: 'reggae', name: 'One drop', genre: 'reggae', bpm: 76, swing: 56,
    tip: 'Beat 1 is EMPTY — kick and cross-stick land together on beat 3 instead. Dropping the downbeat turns the groove inside out; the space is the point.',
    layers: [
      { name: 'The drop', why: 'Kick and side-stick strike together on beat 3 — and nothing at all on beat 1. That missing downbeat is the “one drop”.', add: [{ v: 'kick', on: [8], acc: [8] }, { v: 'rim', on: [8], acc: [8] }] },
      { name: '8th hats', why: 'Hats mark straight 8ths with a lean on 2 & 4, where the guitar skank lives.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12] }] },
      { name: 'Open-hat lift', why: 'An open hat on the last “and” lifts the bar into the next one.', add: [{ v: 'ohat', on: [14] }] },
      { name: 'Stick chatter', why: 'Sparse side-stick ghosts before the drop decorate the space beat 1 left behind.', add: [{ v: 'rim', on: [5, 7] }] },
    ],
  },
  {
    id: 'reggae-steppers', name: 'Steppers', genre: 'reggae', bpm: 78, swing: 54,
    tip: 'The militant variant: kick on every beat (“stepping”), which makes the same tempo feel driving instead of laid back. Roots and dub anthems live here.',
    layers: [
      { name: 'Stepping kick', why: 'Four on the floor at 78 BPM — the same idea as house, twenty years earlier and half the speed.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Cross-stick on 3', why: 'The backbeat stays on beat 3 only, which is what keeps it reggae rather than disco.', add: [{ v: 'rim', on: [8], acc: [8] }] },
      { name: 'Hat 8ths', why: 'Steady 8ths with accents on the off-beats where the skank guitar chops.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [2, 6, 10, 14] }] },
      { name: 'Snare fill', why: 'Two snares at the end of the bar — the classic roots-reggae turnaround.', add: [{ v: 'snare', on: [14, 15] }] },
    ],
  },
  {
    id: 'reggae-rockers', name: 'Rockers', genre: 'reggae', bpm: 80, swing: 54,
    tip: 'Sly Dunbar’s update: the kick doubles up so beats 1 and 3 both land, and the snare adds a flam before the drop. Heavier and more insistent than a one drop, but still not a backbeat.',
    layers: [
      { name: 'Rockers kick', why: 'Kick on 1 and 3 — restoring the downbeat the one drop removed, which changes the entire feel.', add: [{ v: 'kick', on: [0, 8], acc: [8] }] },
      { name: 'Snare on 3', why: 'A real snare (not a cross-stick) on beat 3, often with a flam — the “militant” sound.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Hat 8ths', why: 'Hats keep the 8ths with the off-beats accented for the skank.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14], acc: [2, 6, 10, 14] }] },
      { name: 'Extra kick', why: 'A kick on the “and of 4” pushes into the next bar — the rockers drive.', add: [{ v: 'kick', on: [14] }] },
      { name: 'Rim ghost', why: 'A cross-stick on the “a of 1” fills the space before the drop.', add: [{ v: 'rim', on: [3] }] },
    ],
  },
  {
    id: 'reggae-dancehall', name: 'Dancehall', genre: 'reggae', bpm: 100, swing: 50,
    tip: 'The digital riddim era: a stiff, quantized pattern with kick on 1 and the “and of 2”, snare on 3, and a rim pattern doing the rest. Play it dead straight — the machine-ness is the style.',
    layers: [
      { name: 'Digital kick', why: 'Kick on 1 and the “and of 2” — a tresillo skeleton played by a drum machine.', add: [{ v: 'kick', on: [0, 6], acc: [0] }] },
      { name: 'Snare on 3', why: 'The one-drop backbeat survives digitisation: still beat 3, still alone.', add: [{ v: 'snare', on: [8], acc: [8] }] },
      { name: 'Rim riddim', why: 'A rim/click pattern on the off-beats gives dancehall its skipping top line.', add: [{ v: 'rim', on: [2, 5, 10, 13] }] },
      { name: 'Hat 16ths', why: 'Tight closed hats on the off-16ths, quantized hard — no swing anywhere.', add: [{ v: 'chat', on: [1, 3, 7, 9, 11, 15] }] },
      { name: 'Kick pickup', why: 'An extra kick on the “a of 4” resets the riddim.', add: [{ v: 'kick', on: [15] }] },
    ],
  },

  // ----------------------------------------------------------- reggaeton ----
  {
    id: 'reggaeton-dembow', name: 'Dembow', genre: 'reggaeton', bpm: 95, swing: 52,
    tip: 'One riddim runs the entire genre: kick on the beats, snare on 1, the “a” of 1, the “and” of 2 … the “boom-ch-boom-chick” pattern. Learn these four snare positions and you can play reggaeton forever.',
    layers: [
      { name: 'Kick on 1 & 3', why: 'The kick anchors the strong beats, leaving the snare free to syncopate.', add: [{ v: 'kick', on: [0, 8], acc: [0] }] },
      { name: 'The dembow snare', why: 'Snare on beat 2, the “a of 2”, beat 4 and the “a of 4” — this exact placement IS reggaeton.', add: [{ v: 'snare', on: [4, 7, 12, 15], acc: [4, 12] }] },
      { name: 'Hat 8ths', why: 'Straight 8th hats hold the tempo while the snare pattern does the syncopating.', add: [{ v: 'chat', on: [0, 2, 4, 6, 8, 10, 12, 14] }] },
      { name: 'Extra kick', why: 'A kick on the “and of 3” fills the second half of the bar and thickens the riddim.', add: [{ v: 'kick', on: [10] }] },
    ],
  },
  {
    id: 'reggaeton-modern', name: 'Modern reggaeton', genre: 'reggaeton', bpm: 92, swing: 54,
    tip: 'The dembow softened for pop: same snare positions, but with a clap layer, a sub 808 doing melodic moves, and swung shakers. Everything gets quieter except the low end.',
    layers: [
      { name: 'Dembow snare', why: 'The four fixed snare positions, unchanged — this is what makes it reggaeton and not pop.', add: [{ v: 'snare', on: [4, 7, 12, 15], acc: [4, 12] }] },
      { name: 'Clap layer', why: 'A clap doubling the two main snares widens the backbeat for radio.', add: [{ v: 'clap', on: [4, 12] }] },
      { name: '808 kick', why: 'Kick on 1, the “and of 2” and the “and of 3” — a melodic 808 line rather than a timekeeper.', add: [{ v: 'kick', on: [0, 6, 10], acc: [0] }] },
      { name: 'Swung shakers', why: 'Shaker 16ths with a light swing add the modern polish under the dembow.', add: [{ v: 'shaker', on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], acc: [0, 4, 8, 12] }] },
    ],
  },
  {
    id: 'reggaeton-moombahton', name: 'Moombahton', genre: 'reggaeton', bpm: 108, swing: 50,
    tip: 'House played at dembow tempo: a four-floor kick underneath the dembow snare, with big open hats. The hybrid that comes from slowing a 128 BPM house track down to 108.',
    layers: [
      { name: 'Four-floor kick', why: 'The house pulse, slowed to 108 — where the whole genre came from.', add: [{ v: 'kick', on: [0, 4, 8, 12], acc: [0, 8] }] },
      { name: 'Dembow snare', why: 'The reggaeton snare positions on top of a house kick. Two genres, one bar.', add: [{ v: 'snare', on: [4, 7, 12, 15], acc: [4, 12] }] },
      { name: 'Off-beat open hats', why: 'The house see-saw survives, and it is what keeps moombahton danceable rather than merely slow.', add: [{ v: 'ohat', on: [2, 6, 10, 14] }] },
      { name: 'Tom accents', why: 'Low toms on the “a of 1” and “e of 4” add the Latin percussion colour.', add: [{ v: 'htom', on: [3, 13] }] },
    ],
  },
];
