// Bassline engine for the Workshop's BASS style. A groove pattern is one bar
// (one chord slot) on a 16-step grid: each step is a degree token resolved
// against the chord sounding at that moment, or a pitchless ghost note. Tokens
// are chord-aware where it matters ('3' follows the chord's third) and can
// look ahead ('A' walks a half-step under the NEXT chord's root), so a single
// pattern transposes correctly through any progression.

import { mod12, gI } from './theory';
import type { Chord } from './constants';

// Degree tokens: offsets from the sounding chord's root, plus the special
// moves bassists actually use. '3' resolves to the chord's own third (major
// or minor); 'b3'/'b7'/'n7' are deliberate literal colours (blues thirds,
// chromatic climbs). '5_' is the fifth BELOW the root. 'A'/'A+' approach the
// next chord's root chromatically from below/above; 'N' anticipates it
// outright ("the push"); 'T' pedals the key's tonic regardless of the chord.
export type DegTok = 'R' | '2' | 'b3' | '3' | '4' | '5' | '5_' | '6' | 'b6' | 'b7' | 'n7' | 'O' | 'A' | 'A+' | 'N' | 'T';

export interface BassStep {
  s: number;      // 0..15 — 16th-note position within the bar
  d?: DegTok;     // degree token (omitted on ghost steps)
  g?: boolean;    // ghost: muted, pitchless "chk"
  l?: number;     // sustain in steps (default ~1.6, a fat eighth)
}

export type BassRole = 'root' | 'chord' | 'color' | 'approach' | 'ghost';

export const BASS_ROLE_META: Record<BassRole, { name: string; color: string }> = {
  root: { name: 'root / octave', color: '#c2562e' },
  chord: { name: 'chord tone', color: '#3f6b5f' },
  color: { name: 'colour (2·4·6)', color: '#b07d23' },
  approach: { name: 'approach / push', color: '#7a5ea8' },
  ghost: { name: 'ghost (muted)', color: '#97a59c' },
};

export const BASS_TOK_LABEL: Record<DegTok, string> = {
  R: 'R', '2': '2', b3: '♭3', '3': '3', '4': '4', '5': '5', '5_': '5',
  '6': '6', b6: '♭6', b7: '♭7', n7: '7', O: '8', A: '↑', 'A+': '↓', N: '→', T: 'T',
};

export function bassRole(st: BassStep): BassRole {
  if (st.g) return 'ghost';
  const t = st.d!;
  if (t === 'R' || t === 'O' || t === 'T') return 'root';
  if (t === 'A' || t === 'A+' || t === 'N' || t === 'n7') return 'approach';
  if (t === '3' || t === 'b3' || t === '5' || t === '5_' || t === 'b7') return 'chord';
  return 'color';
}

/** Put a root in a playable 4-string register (low E window, E1..E♭2). */
export function bassRootMidi(rootPc: number): number {
  const pc = mod12(rootPc);
  return pc >= 4 ? 24 + pc : 36 + pc;
}

/** Resolve a degree token to a MIDI note over `ch`, looking ahead to `next`. */
export function resolveBassStep(tok: DegTok, ch: Chord, next: Chord, tonicPc: number): number {
  if (tok === 'T') return bassRootMidi(tonicPc);
  if (tok === 'A' || tok === 'A+' || tok === 'N') {
    const nb = bassRootMidi(next.rootPc);
    return tok === 'N' ? nb : tok === 'A' ? nb - 1 : nb + 1;
  }
  const base = bassRootMidi(ch.rootPc);
  if (tok === '3') return base + (gI(ch).includes(3) ? 3 : 4);
  const fixed: Record<string, number> = { R: 0, '2': 2, b3: 3, '4': 5, '5': 7, '5_': -5, '6': 9, b6: 8, b7: 10, n7: 11, O: 12 };
  return base + (fixed[tok] ?? 0);
}

// ---- the groove library ----

export const BASS_GROUPS = ['Funk / Disco / Soul', 'Jazz & Blues', 'Rock / Pop / Punk', 'Latin / Reggae / World'];

export interface BassPattern {
  id: string;
  group: string;
  name: string;
  tag: string;   // the player / tradition it comes from
  tip: string;   // the trick to hear inside it
  steps: BassStep[];
}

export const BASS_PATTERNS: BassPattern[] = [
  // -- Funk / Disco / Soul --
  { id: 'discopump', group: 'Funk / Disco / Soul', name: 'Octave Pump', tag: 'Bernard Edwards · Chic',
    tip: 'Root–octave eighths welded to the four-on-the-floor kick — the engine of disco. The ♭7 on beat 4 is the pickup that yanks the line back to the ONE.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 12, d: 'b7' }, { s: 14, d: 'O' }] },
  { id: 'jamerson', group: 'Funk / Disco / Soul', name: 'Motown Boogie Cell', tag: 'James Jamerson',
    tip: 'The 1–5–6–♭7 climb to the octave and back — bedrock of Motown and soul. The last eighth abandons the cell to walk chromatically into the next chord: Jamerson never wastes a pickup.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '5' }, { s: 4, d: '6' }, { s: 6, d: 'b7' }, { s: 8, d: 'O' }, { s: 10, d: 'b7' }, { s: 12, d: '6' }, { s: 14, d: 'A' }] },
  { id: 'jackson', group: 'Funk / Disco / Soul', name: 'Chameleon Space Riff', tag: 'Paul Jackson · Headhunters',
    tip: 'A short, syncopated Dorian riff repeated until it’s hypnotic. The rests are the funk — Jackson leaves beat 3 almost empty and lets the drums show through.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'b3' }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: '2' }, { s: 11, d: 'b3' }, { s: 14, d: '5' }] },
  { id: 'marcus', group: 'Funk / Disco / Soul', name: 'Slap Octaves', tag: 'Marcus Miller',
    tip: 'Thumb the root, pluck the octave, and pepper the gaps with dead-note "chk"s. The chromatic climb ♭7–7–8 into the octave is pure Marcus.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, g: true }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: 'b7' }, { s: 11, d: 'n7' }, { s: 12, d: 'O' }, { s: 14, g: true }] },
  { id: 'ontheone', group: 'Funk / Disco / Soul', name: 'On the One', tag: 'James Brown funk',
    tip: 'Whatever else happens, the root owns beat ONE — everything after is syncopation and ghost notes. The bass is a drum that happens to have pitch.',
    steps: [{ s: 0, d: 'R', l: 4 }, { s: 6, g: true }, { s: 7, g: true }, { s: 8, d: '5' }, { s: 11, g: true }, { s: 12, d: 'b7' }, { s: 14, d: 'R' }] },

  // -- Jazz & Blues --
  { id: 'walkup', group: 'Jazz & Blues', name: 'Walking · Up the Chord', tag: 'walking bass',
    tip: 'Quarter notes: chord tones on the strong beats, then a chromatic approach a half-step under the NEXT chord’s root. Beat 4 belongs to where you’re going, not where you are.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: '3', l: 3.5 }, { s: 8, d: '5', l: 3.5 }, { s: 12, d: 'A', l: 3.5 }] },
  { id: 'walkdown', group: 'Jazz & Blues', name: 'Walking · From Above', tag: 'walking bass',
    tip: 'The mirror move: drift down through the 6 and 5, then fall onto the next root from a half-step above. Mixing under- and over-approaches keeps a walk from sounding like an exercise.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: '6', l: 3.5 }, { s: 8, d: '5', l: 3.5 }, { s: 12, d: 'A+', l: 3.5 }] },
  { id: 'boogie', group: 'Jazz & Blues', name: 'Blues Boogie Shuffle', tag: 'jump blues',
    tip: 'The boogie-woogie cell that powered early rock’n’roll: up 1–3–5–6–♭7 and back down. The 3rd follows the chord, so it works over major and minor blues alike.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '3' }, { s: 4, d: '5' }, { s: 6, d: '6' }, { s: 8, d: 'b7' }, { s: 10, d: '6' }, { s: 12, d: '5' }, { s: 14, d: '3' }] },
  { id: 'twofeel', group: 'Jazz & Blues', name: 'The Two-Feel', tag: 'jazz ballads',
    tip: 'Half notes — just root and five — until the last eighth walks into the change. Restraint is a bass trick too: save the four-to-the-bar walk for when the tune lifts.',
    steps: [{ s: 0, d: 'R', l: 7 }, { s: 8, d: '5', l: 5 }, { s: 14, d: 'A' }] },

  // -- Rock / Pop / Punk --
  { id: 'eighths', group: 'Rock / Pop / Punk', name: 'Driving Eighths', tag: 'punk · hard rock',
    tip: 'Relentless root eighths, every note the same length and weight — the pocket IS the technique. The ♭7 pickup on the last eighth is the one flourish allowed.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: 'R' }, { s: 4, d: 'R' }, { s: 6, d: 'R' }, { s: 8, d: 'R' }, { s: 10, d: 'R' }, { s: 12, d: 'R' }, { s: 14, d: 'b7' }] },
  { id: 'rootfive', group: 'Rock / Pop / Punk', name: 'Root–Five', tag: 'country · early rock',
    tip: 'The oom-pah skeleton under country, polka and early rock: root, then the fifth BELOW. The walk-up into the next chord telegraphs the change to the whole band.',
    steps: [{ s: 0, d: 'R', l: 3.5 }, { s: 4, d: '5_', l: 3.5 }, { s: 8, d: 'R', l: 3.5 }, { s: 12, d: '5_' }, { s: 14, d: 'A' }] },
  { id: 'mccartney', group: 'Rock / Pop / Punk', name: 'Melodic Counter-Line', tag: 'McCartney-style',
    tip: 'The bass as a second melody: arpeggiate the chord but shape it into a singable contour with the 6th. It answers the vocal instead of just anchoring it.',
    steps: [{ s: 0, d: 'R' }, { s: 4, d: '3' }, { s: 6, d: '5' }, { s: 8, d: '6', l: 3 }, { s: 12, d: '5' }, { s: 14, d: '3' }] },
  { id: 'pedal', group: 'Rock / Pop / Punk', name: 'Tonic Pedal', tag: 'U2 · film scores',
    tip: 'The bass refuses to move: the key’s tonic drones under every chord while the harmony shifts above it. Tension comes from the chords rubbing against the unmoving floor.',
    steps: [{ s: 0, d: 'T' }, { s: 2, d: 'T' }, { s: 4, d: 'T' }, { s: 6, d: 'T' }, { s: 8, d: 'T' }, { s: 10, d: 'T' }, { s: 12, d: 'T' }, { s: 14, d: 'T' }] },

  // -- Latin / Reggae / World --
  { id: 'bossa', group: 'Latin / Reggae / World', name: 'Bossa Root–Five', tag: 'bossa nova',
    tip: 'Root on the downbeats, fifth on the and-of-two — the surdo drum translated to bass. The last eighth anticipates the next bar’s root, arriving before the chord does.',
    steps: [{ s: 0, d: 'R', l: 5 }, { s: 6, d: '5_' }, { s: 8, d: 'R', l: 5 }, { s: 14, d: 'N' }] },
  { id: 'tumbao', group: 'Latin / Reggae / World', name: 'Tumbao', tag: 'salsa · son montuno',
    tip: 'The radical move: NOTHING lands on beat one. The bass floats on the and-of-two and pushes the next chord in on beat four, tied over the barline. The band feels the ONE precisely because you never play it.',
    steps: [{ s: 3, g: true }, { s: 6, d: '5', l: 5 }, { s: 12, d: 'N', l: 4 }] },
  { id: 'onedrop', group: 'Latin / Reggae / World', name: 'Reggae One-Drop', tag: 'roots reggae',
    tip: 'Drop beat one entirely and let the line breathe — fat, short notes clustered mid-bar. In reggae the space before the bass enters is as loud as the notes.',
    steps: [{ s: 4, d: 'R', l: 3 }, { s: 8, d: 'R' }, { s: 10, d: '3' }, { s: 12, d: '5', l: 3 }] },
  { id: 'afrobeat', group: 'Latin / Reggae / World', name: 'Afrobeat Ostinato', tag: 'Fela · Tony Allen era',
    tip: 'One tight bar, repeated forever without variation — the bass is a tuned drum inside the interlocking percussion machine. Change nothing; let the horns do the travelling.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'O' }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: 'b7' }, { s: 12, d: '5' }, { s: 14, g: true }] },
];

// ---- tricks of the trade: named techniques with a one-bar audio demo ----

export interface BassTrick {
  id: string;
  name: string;
  why: string;
  demo: BassStep[];
}

export const BASS_TRICKS: BassTrick[] = [
  { id: 'ghost', name: 'Ghost notes',
    why: 'Mute the strings with the fretting hand and pluck anyway — a pitchless "chk". A line like 1 · chk · ♭7 · chk turns the bass into a drum.',
    demo: [{ s: 0, d: 'R' }, { s: 2, g: true }, { s: 4, d: 'b7' }, { s: 6, g: true }, { s: 8, d: 'R' }, { s: 10, g: true }, { s: 12, d: 'b7' }, { s: 14, g: true }] },
  { id: 'chrom', name: 'Chromatic approach',
    why: 'Aim at a target tone and step into it from a half-step away. Approach notes are "wrong" notes made right by where they land — the glue of funk lines and walking bass.',
    demo: [{ s: 0, d: 'R', l: 3 }, { s: 8, d: 'b7' }, { s: 10, d: 'n7' }, { s: 12, d: 'O', l: 3 }] },
  { id: 'octpop', name: 'Octave pop',
    why: 'Same note, two registers: root low, octave popped high. Instant disco/funk energy with zero harmonic risk — you cannot hit a wrong note.',
    demo: [{ s: 0, d: 'R' }, { s: 2, d: 'O' }, { s: 4, d: 'R' }, { s: 6, d: 'O' }, { s: 8, d: 'R' }, { s: 10, d: 'O' }, { s: 12, d: 'R' }, { s: 14, d: 'O' }] },
  { id: 'push', name: 'The push (anticipation)',
    why: 'Hit the next chord’s root on the and-of-four, an eighth before the bar. The bass arrives early and drags the whole band forward — the engine of latin and gospel feels.',
    demo: [{ s: 0, d: 'R', l: 4 }, { s: 8, d: '5' }, { s: 14, d: 'N', l: 2 }] },
  { id: 'space', name: 'Playing the space',
    why: 'What you don’t play is part of the line. Leave the downbeat (tumbao) or beat three (Headhunters) empty and the groove gets deeper, not thinner.',
    demo: [{ s: 0, d: 'R' }, { s: 3, d: 'b7' }, { s: 6, d: 'R', l: 3 }] },
  { id: 'rootfive', name: 'Root & five',
    why: 'The two notes that work over every chord ever written. When in doubt: root on the strong beat, five (above or below) on the weak one.',
    demo: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5_', l: 3 }, { s: 8, d: 'R', l: 3 }, { s: 12, d: '5', l: 3 }] },
  { id: 'walkin', name: 'Walk into the change',
    why: 'Beat four belongs to the NEXT chord: approach its root by a half-step from below or above, and the harmony sounds inevitable instead of switched.',
    demo: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '3', l: 3 }, { s: 8, d: '5', l: 3 }, { s: 12, d: 'A', l: 3 }] },
];
