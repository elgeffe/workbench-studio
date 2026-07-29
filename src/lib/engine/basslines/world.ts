// Afro-Cuban/Brazilian, Afrobeat/Amapiano, reggae and reggaeton. The family
// that taught the rest of this list to leave beat one alone: here the bass is
// written against a clave or a riddim, and anticipating the change is the norm.
import type { BassPattern } from '../bass';

export const WORLD_BASSLINES: BassPattern[] = [
  // ----------------------------------------------------------------- latin ----
  { id: 'tumbao', genre: 'latin', name: 'Tumbao', tag: 'salsa · son montuno',
    tip: 'The radical move: NOTHING lands on beat one. The bass floats on the and-of-two and pushes the next chord in on beat four, tied over the barline. The band feels the ONE precisely because you never play it.',
    steps: [{ s: 3, g: true }, { s: 6, d: '5', l: 5 }, { s: 12, d: 'N', l: 4 }] },
  { id: 'bossa', genre: 'latin', name: 'Bossa Root–Five', tag: 'bossa nova',
    tip: 'Root on the downbeats, fifth on the and-of-two — the surdo drum translated to bass. The last eighth anticipates the next bar’s root, arriving before the chord does.',
    steps: [{ s: 0, d: 'R', l: 5 }, { s: 6, d: '5_' }, { s: 8, d: 'R', l: 5 }, { s: 14, d: 'N' }] },
  { id: 'latin-montuno', genre: 'latin', name: 'Montuno Anticipation', tag: 'son · mambo',
    tip: 'A softened tumbao for players new to the feel: the root is allowed on beat 1, but the change still arrives early on beat 4. Learn this, then take the ONE away.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: '5' }, { s: 8, g: true }, { s: 12, d: 'N', l: 4 }] },
  { id: 'latin-samba', genre: 'latin', name: 'Samba Surdo', tag: 'samba · batucada',
    tip: 'The surdo drum plays on beat 2 and beat 4, and the bass doubles it: the low note falls where a rock player would never put it. Beat 2 is the heavy one in samba.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: '5_' }, { s: 6, d: 'R', l: 3 }, { s: 12, d: '5_' }, { s: 14, d: 'N' }] },

  // ----------------------------------------------------------------- afro ----
  { id: 'afrobeat', genre: 'afro', name: 'Afrobeat Ostinato', tag: 'Fela · Tony Allen era',
    tip: 'One tight bar, repeated forever without variation — the bass is a tuned drum inside the interlocking percussion machine. Change nothing; let the horns do the travelling.',
    steps: [{ s: 0, d: 'R' }, { s: 3, d: 'O' }, { s: 6, d: 'R' }, { s: 8, g: true }, { s: 10, d: 'b7' }, { s: 12, d: '5' }, { s: 14, g: true }] },
  { id: 'afro-highlife', genre: 'afro', name: 'Highlife Rolling Line', tag: 'highlife',
    tip: 'A continuously rolling arpeggio that climbs to the octave and back in eighths — the bass as a second guitar part. Bright, major, and never still.',
    steps: [{ s: 0, d: 'R' }, { s: 2, d: '3' }, { s: 4, d: '5' }, { s: 6, d: 'O' }, { s: 8, d: '5' }, { s: 10, d: '3' }, { s: 12, d: 'R' }, { s: 14, d: '2' }] },
  { id: 'afro-amapiano', genre: 'afro', name: 'Log-Drum Line', tag: 'amapiano',
    tip: 'The log drum is a pitched percussion instrument doing the bass’s job: short, mid-bar, and always answering the kick rather than doubling it. Leave the downbeat to the drum.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, g: true }, { s: 6, d: '5' }, { s: 8, g: true }, { s: 10, d: 'b7', l: 2 }, { s: 13, d: 'R' }, { s: 15, g: true }] },
  { id: 'afro-soukous', genre: 'afro', name: 'Soukous Drive', tag: 'soukous · Congolese rumba',
    tip: 'Fast, light and endlessly cycling under two interlocking guitars. The bass never lands on the same beat as the sebene guitar figure — the parts are woven, not stacked.',
    steps: [{ s: 0, d: 'R' }, { s: 1, g: true }, { s: 3, d: '5' }, { s: 6, d: 'R' }, { s: 8, d: 'O' }, { s: 10, d: '5' }, { s: 11, g: true }, { s: 13, d: '3' }, { s: 14, d: 'R' }] },

  // --------------------------------------------------------------- reggae ----
  { id: 'onedrop', genre: 'reggae', name: 'Reggae One-Drop', tag: 'roots reggae',
    tip: 'Drop beat one entirely and let the line breathe — fat, short notes clustered mid-bar. In reggae the space before the bass enters is as loud as the notes.',
    steps: [{ s: 4, d: 'R', l: 3 }, { s: 8, d: 'R' }, { s: 10, d: '3' }, { s: 12, d: '5', l: 3 }] },
  { id: 'reggae-steppers', genre: 'reggae', name: 'Steppers Drive', tag: 'steppers · rockers',
    tip: 'The militant version: kick on every beat and the bass walking with it. Still fat and dark, but now it marches — this is roots reggae with somewhere to be.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, d: 'R' }, { s: 6, d: 'b3' }, { s: 8, d: 'R', l: 3 }, { s: 12, d: '5' }, { s: 14, d: '4' }] },
  { id: 'reggae-rockers', genre: 'reggae', name: 'Rockers Pulse', tag: 'Sly & Robbie era',
    tip: 'Enter a sixteenth late on purpose — the first note is a dead one and the real root lands on the “and of 1”. That tiny delay is what makes the line lope.',
    steps: [{ s: 0, g: true }, { s: 2, d: 'R', l: 3 }, { s: 6, d: 'b3' }, { s: 8, d: 'R' }, { s: 10, d: '5', l: 3 }, { s: 14, g: true }] },
  { id: 'reggae-dub', genre: 'reggae', name: 'Dub Drop-Out', tag: 'dub · King Tubby',
    tip: 'Half the bar is silence. In dub the engineer mutes and unmutes the bass as an instrument in itself — write the rests first and the notes will place themselves.',
    steps: [{ s: 4, d: 'R', l: 4 }, { s: 10, d: 'b3' }, { s: 12, d: 'R', l: 4 }] },

  // ------------------------------------------------------------ reggaeton ----
  { id: 'reggaeton-dembow', genre: 'reggaeton', name: 'Dembow Root', tag: 'reggaeton',
    tip: 'The dembow snare is fixed, so the bass simply reinforces the kick: 1, the “and of 2”, and 3. Long notes, no melody — the riddim does the talking.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: 'R', l: 2 }, { s: 8, d: 'R' }, { s: 12, d: 'R', l: 3 }] },
  { id: 'reggaeton-tresillo', genre: 'reggaeton', name: 'Tresillo 808', tag: 'Latin trap',
    tip: 'Where reggaeton meets trap: the 3+3+2 cell on an 808, with the ♭7 filling the middle. Slide between the notes and it turns into a Latin-trap line.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 6, d: 'b7' }, { s: 8, g: true }, { s: 12, d: '5', l: 4 }] },
  { id: 'reggaeton-melodic', genre: 'reggaeton', name: 'Melodic Minor Line', tag: 'modern urbano',
    tip: 'Modern reggaeton lets the bass sing: a minor descent through ♭7 and ♭6 to the fifth, under the same unchanging dembow. The riddim is fixed, so melody is where the variation lives.',
    steps: [{ s: 0, d: 'R', l: 3 }, { s: 4, g: true }, { s: 6, d: 'b3' }, { s: 8, d: 'R' }, { s: 10, d: 'b7' }, { s: 12, d: 'b6' }, { s: 14, d: '5' }] },
];
