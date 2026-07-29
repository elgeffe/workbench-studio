// The studio's one genre taxonomy. Drums, basslines and chord progressions all
// hang off this list, so picking "Neo-Soul" in any tab means the same thing —
// the drum groovebox, the bass workbench and the Workshop's starting points
// stay in step instead of each inventing their own shelf labels.
//
// `blurb` and `maschine` describe the *drum programming* of the style (the
// Drums tab reads them); the bassline and progression libraries key off `id`.

export interface StudioGenre {
  id: string;
  name: string;
  family: string; // shelf label in the genre row
  blurb: string;  // what defines the genre's drum programming
  maschine: string; // the practical note for programming it in a groovebox
}

export const FAMILIES = [
  'Rock & Pop',
  'Funk & Soul',
  'Hip-Hop',
  'House & Techno',
  'Bass & Breaks',
  'Hard Dance',
  'Jazz & Blues',
  'World & Latin',
];

export const GENRES: StudioGenre[] = [
  // ---- Rock & Pop ----
  {
    id: 'rock', name: 'Rock', family: 'Rock & Pop',
    blurb: 'Kick on the strong beats, snare backbeat on 2 & 4, hats keeping the subdivision. Every groove in this box is a variation of that conversation.',
    maschine: 'Straight 16ths, swing off. Program kick and snare first on separate pads, then hats — and vary hat velocity (accent the quarters) or the loop turns into a machine gun.',
  },
  {
    id: 'metal', name: 'Metal & Punk', family: 'Rock & Pop',
    blurb: 'Rock with the density turned up: double-kick carpets, blast beats, and half-time breakdowns that cut the backbeat in half for weight.',
    maschine: 'Fast repeated kicks need velocity variation and a short sample or they flam into mush. Use Note Repeat at 1/16 or 1/32 to play the double-kick runs in live, then quantize.',
  },
  {
    id: 'pop', name: 'Pop', family: 'Rock & Pop',
    blurb: 'Simplicity engineered for the vocal: one big backbeat sound (clap layered on snare), tight hats, and space where the hook lands.',
    maschine: 'Layer clap + snare on one pad group for the backbeat, and duck the hats under the vocal. Modern pop lives on sound choice more than on note choice.',
  },
  {
    id: 'disco', name: 'Disco & Boogie', family: 'Rock & Pop',
    blurb: 'The ancestor of house: four-on-the-floor kick, open hat on every off-beat, and a hi-hat foot that never stops breathing.',
    maschine: 'Set swing around 54–56% — disco is not dead straight. Open-hat pads should choke the closed hat (same choke group) so the off-beat closes cleanly on the next kick.',
  },
  // ---- Funk & Soul ----
  {
    id: 'funk', name: 'Funk', family: 'Funk & Soul',
    blurb: 'The One is law and the grid is 16ths. Backbeat stays rigid while the kick and ghost snares dance around it.',
    maschine: 'Ghost notes are a velocity story: keep them near 30–45 and the backbeat near 120. Add a touch of swing (54–58%) to grease the 16ths.',
  },
  {
    id: 'soul', name: 'Soul & Motown', family: 'Funk & Soul',
    blurb: 'Backbeat-first songwriting drums: tambourine on every off-beat, side-stick when the singer is quiet, kick simple enough to sing.',
    maschine: 'Tambourine/shaker on their own pads with ±10 velocity randomness gives the hand-played feel. Slight swing (54%) is the Motown lift.',
  },
  {
    id: 'neosoul', name: 'Neo-Soul', family: 'Funk & Soul',
    blurb: 'Funk played sleepy and behind the beat: hats pushed late, snares dragged, the loop feeling almost drunk on purpose.',
    maschine: 'The whole style is nudging notes off the grid. Program straight, then shift the snare 5–15 ms late and swing the hats 58–62% — do not quantize it back.',
  },
  {
    id: 'gospel', name: 'Gospel', family: 'Funk & Soul',
    blurb: 'Church pocket: deep backbeat, busy hats, triplet shuffles, and fills that answer the choir instead of filling space.',
    maschine: 'Gospel triplet feels need swing at 62–66%. Keep the hat pattern dense but quiet — the backbeat should still be the loudest hit in the bar.',
  },
  // ---- Hip-Hop ----
  {
    id: 'hiphop', name: 'Hip-Hop (boom-bap)', family: 'Hip-Hop',
    blurb: '"Boom" kick, "bap" snare, sampled-funk skeleton. Sparse by design — the beat is a bed for the voice.',
    maschine: 'Swing 56–60% is the head-nod. Filter the top off the hats, and let the snare be the loudest thing in the pattern.',
  },
  {
    id: 'trap', name: 'Trap & Drill', family: 'Hip-Hop',
    blurb: 'Half-time snare on beat 3, sub-808 kick doing the bass line, and hats that roll in 16ths, 32nds and triplets.',
    maschine: 'Program the 808 on a pitched pad — the kick IS the bassline, so play notes, not just hits. Hat rolls come from Note Repeat with the rate flipped mid-bar.',
  },
  {
    id: 'oldschool', name: 'Old-School & Electro', family: 'Hip-Hop',
    blurb: 'The 808/909 era: electro syncopation, handclaps on the backbeat, cowbell and rimshot doing the melody work.',
    maschine: 'This is drum-machine music — use the raw 808/909 kit with no layering, long decay on the kick, and quantize hard. Straightness is the sound.',
  },
  // ---- House & Techno ----
  {
    id: 'house', name: 'House', family: 'House & Techno',
    blurb: 'Four-on-the-floor kick, clap on 2 & 4, open hats on every off-beat. The kick is the pulse; everything else decorates it.',
    maschine: 'Swing 52–56% separates a groove from a grid. Keep the kick loud and short, and sidechain the pads to it — house is a mix technique as much as a pattern.',
  },
  {
    id: 'techhouse', name: 'Tech-House & Minimal', family: 'House & Techno',
    blurb: 'Reduction as a technique: fewer elements, more groove, everything rolling off the off-beat. Space is the main instrument.',
    maschine: 'Program less than feels finished, then vary velocity across the loop. Shuffle/swing near 56% plus one percussive tick that moves every bar is the whole trick.',
  },
  {
    id: 'techno', name: 'Techno', family: 'House & Techno',
    blurb: 'Machine time: straight kick, relentless 16th hats, minimal backbeat, and texture instead of melody.',
    maschine: 'Swing off (50%). Length and decay do the work — shorten the kick tail to make room for the sub, and let one long open hat blur the off-beat.',
  },
  {
    id: 'trance', name: 'Trance & Big-Room', family: 'House & Techno',
    blurb: 'Four-on-the-floor built for the drop: rolling off-beat bass, snare rolls that lift into the break, huge open hats.',
    maschine: 'Build a 16-bar arrangement, not a bar. The snare roll (16ths accelerating into 32nds) is programmed with Note Repeat rate changes over the last two bars.',
  },
  // ---- Bass & Breaks ----
  {
    id: 'dnb', name: 'Drum & Bass', family: 'Bass & Breaks',
    blurb: 'Two-step at 170+: kick on 1 and the "and of 3", snare on 2 & 4. Space at speed is what makes it roll.',
    maschine: 'Set the project to 172 and program at 16ths — the pattern looks sparse because it is. Ghost snares at low velocity make it "roll" instead of stomp.',
  },
  {
    id: 'jungle', name: 'Jungle', family: 'Bass & Breaks',
    blurb: 'Chopped breakbeats, not programmed kits: the Amen and Think breaks resliced so the original ghost notes survive.',
    maschine: 'Slice a break across 16 pads, then play the slices out of order — that is jungle. The grid below shows the target rhythm to aim your slices at.',
  },
  {
    id: 'garage', name: 'UK Garage', family: 'Bass & Breaks',
    blurb: 'Shuffled 2-step: the kick skips beat 3, the snare lands on 2 & 4, and every hat is swung hard.',
    maschine: 'Swing 60–66% — garage is the swing setting. Program the shuffle first with hats alone, and only then place the kick against it.',
  },
  {
    id: 'dubstep', name: 'Dubstep & Grime', family: 'Bass & Breaks',
    blurb: '140 BPM played half-time: snare on beat 3 only, sub-heavy kick, and sparse percussion holding a huge amount of space.',
    maschine: 'Same tempo as trap, different attitude. Leave whole beats empty and let the bass patch carry the rhythm.',
  },
  {
    id: 'breaks', name: 'Breakbeat & Bruk', family: 'Bass & Breaks',
    blurb: 'Anything built on a broken (non-four-to-the-floor) kick: big beat, rave hardcore, broken beat.',
    maschine: 'Displace the kick off the strong beats and keep the snare anchored — the tension between them is the genre. Try nudging one kick a 16th late.',
  },
  // ---- Hard Dance ----
  {
    id: 'hardstyle', name: 'Hardstyle', family: 'Hard Dance',
    blurb: 'A distorted kick with a pitched tail on every beat, a reverse-bass answer on the off-beats, and a clap that arrives like a snare.',
    maschine: 'The kick is the instrument: layer a punchy transient with a long pitched-down tail, then distort. The "reverse bass" sits on every off-beat 8th.',
  },
  {
    id: 'hardcore', name: 'Hardcore & Gabber', family: 'Hard Dance',
    blurb: '160–200 BPM, distorted kicks four to the floor (or faster), breakbeats on top in the UK strains.',
    maschine: 'Overdrive the kick until it clips, then tune it — gabber kicks are pitched. Keep everything else out of the low end.',
  },
  // ---- Jazz & Blues ----
  {
    id: 'jazz', name: 'Jazz', family: 'Jazz & Blues',
    blurb: 'Timekeeping moves up to the ride cymbal, the hat foot chicks 2 & 4, and the snare comments instead of keeping time.',
    maschine: 'Swing 62–66% and low velocities everywhere. Programmed jazz only works if you vary the ride velocity every hit — perfect repetition kills it.',
  },
  {
    id: 'souljazz', name: 'Soul-Jazz & Boogaloo', family: 'Jazz & Blues',
    blurb: 'Jazz played for dancers: the ride pattern gives way to a real backbeat, the Hammond organ takes the bass line, and gospel triads sit under the solos. The boogaloo is its signature groove.',
    maschine: 'Swing belongs between the two worlds — 56–60% rather than a full jazz triplet. Put tambourine and hand-claps on their own pads with ±10 velocity randomness, and keep the kick to two notes so the organ owns the low end.',
  },
  {
    id: 'jazzfunk', name: 'Jazz-Funk & Crossover', family: 'Jazz & Blues',
    blurb: 'The 70s crossover records: funk 16ths under jazz harmony, sweet production, percussion instead of extra kit, and drummers who hold a pocket rather than comp. It sits between soul-jazz and fusion.',
    maschine: 'Program a funk kick and a rigid backbeat first, then colour the top with tambourine, shaker and congas — never with more drums. Swing 54–58%, hats well under the backbeat, and let the percussion pads carry the sparkle.',
  },
  {
    id: 'fusion', name: 'Jazz-Fusion', family: 'Jazz & Blues',
    blurb: 'Funk 16ths played with jazz phrasing: linear grooves where no two limbs hit together, ghost notes everywhere, ride replacing the hat.',
    maschine: 'Linear means one voice per step — build the pattern so kick, snare and hat never share a step. It instantly sounds "played" rather than programmed.',
  },
  {
    id: 'blues', name: 'Blues & Shuffle', family: 'Jazz & Blues',
    blurb: 'Everything in triplets: the shuffle, the half-time shuffle, the train beat. The notes are rock, the feel is not.',
    maschine: 'Swing 66% is a true triplet. Compare the same pattern at 50% and 66% — that difference is the whole style.',
  },
  // ---- World & Latin ----
  {
    id: 'latin', name: 'Afro-Cuban & Brazilian', family: 'World & Latin',
    blurb: 'No backbeat — a clave timeline that every other part must agree with, and a kick that anticipates rather than lands.',
    maschine: 'Program the clave first on its own pad and never let it move. Everything else is written against it.',
  },
  {
    id: 'afro', name: 'Afrobeat & Amapiano', family: 'World & Latin',
    blurb: 'Interlocking parts instead of one drummer: bell timelines, log drums, shakers, and a kick that converses rather than pulses.',
    maschine: 'Give each percussion part its own pad and its own velocity shape. The groove comes from parts weaving, not from any single pattern.',
  },
  {
    id: 'reggae', name: 'Reggae & Dancehall', family: 'World & Latin',
    blurb: 'Beat 1 is often empty on purpose. Kick and cross-stick move together, and the space is the instrument.',
    maschine: 'Side-stick (rim) is the signature — quiet, dry, no reverb. A little swing (54–58%) keeps it from sounding stiff.',
  },
  {
    id: 'reggaeton', name: 'Reggaeton & Dembow', family: 'World & Latin',
    blurb: 'One riddim runs the whole genre: the dembow — kick on the beats, snare on the "a" of each pair. Learn it once and you own the style.',
    maschine: 'The dembow snare pattern (steps 4, 7, 12, 15 on a 16-grid) is fixed; the variation lives in percussion and 808 movement.',
  },
];

/** Genre lookup by id, falling back to the first genre. */
export function genreById(id: string): StudioGenre {
  return GENRES.find((g) => g.id === id) || GENRES[0];
}

/**
 * Shelve a set of items by family → genre, dropping any family or genre that
 * has nothing in it. Every picker in the app (drums, basslines, progressions)
 * renders the same two-level shape, so they all build it here.
 */
export function shelveByFamily<T>(items: T[], genreOf: (item: T) => string): Array<{ name: string; genres: Array<{ genre: StudioGenre; items: T[] }> }> {
  return FAMILIES.map((f) => ({
    name: f,
    genres: GENRES.filter((g) => g.family === f)
      .map((genre) => ({ genre, items: items.filter((it) => genreOf(it) === genre.id) }))
      .filter((g) => g.items.length > 0),
  })).filter((f) => f.genres.length > 0);
}
