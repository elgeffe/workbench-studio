// Music-theory constant tables. Ported verbatim from the original Workbench
// design so the harmony behaves identically; only types have been added.

export type Fn = 'T' | 'S' | 'D';
export type ScaleId =
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  | 'harmonic'
  | 'melodic';

export const CS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const CF = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const CIRCLE = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
export const MAJOR = [0, 2, 4, 5, 7, 9, 11];

export interface ScaleDef {
  short: string;
  full: string;
  int: number[];
  char: string;
}

export const SCALES: Record<ScaleId, ScaleDef> = {
  ionian: { short: 'Major', full: 'Ionian (major)', int: [0, 2, 4, 5, 7, 9, 11], char: 'The bright, fully-resolved major sound — home base for everything.' },
  dorian: { short: 'Dorian', full: 'Dorian', int: [0, 2, 3, 5, 7, 9, 10], char: 'Minor with a raised 6th — hopeful, jazzy, funky. The “So What” / Santana minor.' },
  phrygian: { short: 'Phrygian', full: 'Phrygian', int: [0, 1, 3, 5, 7, 8, 10], char: 'Minor with a ♭2 — dark and Spanish/flamenco; raise the 3rd and you get the metal-favourite Phrygian dominant.' },
  lydian: { short: 'Lydian', full: 'Lydian', int: [0, 2, 4, 6, 7, 9, 11], char: 'Major with a ♯4 — floating, dreamy, cinematic.' },
  mixolydian: { short: 'Mixolydian', full: 'Mixolydian', int: [0, 2, 4, 5, 7, 9, 10], char: 'Major with a ♭7 — bluesy and dominant; the sound of rock and funk vamps.' },
  aeolian: { short: 'Minor', full: 'Aeolian (natural minor)', int: [0, 2, 3, 5, 7, 8, 10], char: 'The natural minor scale — the default serious/sad minor.' },
  locrian: { short: 'Locrian', full: 'Locrian', int: [0, 1, 3, 5, 6, 8, 10], char: 'Diminished tonic (♭2 and ♭5) — unstable and rarely a home key.' },
  harmonic: { short: 'Harmonic min', full: 'Harmonic minor', int: [0, 2, 3, 5, 7, 8, 11], char: 'Natural minor with a raised 7th — restores a strong V7→i pull; classical and neoclassical metal.' },
  melodic: { short: 'Melodic min', full: 'Melodic minor', int: [0, 2, 3, 5, 7, 9, 11], char: 'Minor with raised 6 and 7 — the smooth, sophisticated jazz-minor sound.' },
};

export const INT: Record<string, number[]> = {
  maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus4: [0, 5, 7],
  maj7: [0, 4, 7, 11], min7: [0, 3, 7, 10], dom7: [0, 4, 7, 10], m7b5: [0, 3, 6, 10], dim7: [0, 3, 6, 9],
  maj6: [0, 4, 7, 9], min6: [0, 3, 7, 9], maj9: [0, 4, 7, 11, 14], maj11: [0, 4, 7, 11, 14, 17],
  maj13: [0, 4, 7, 11, 14, 21], min9: [0, 3, 7, 10, 14], min11: [0, 3, 7, 10, 14, 17],
  min13: [0, 3, 7, 10, 14, 17, 21], dom9: [0, 4, 7, 10, 14], dom11: [0, 4, 7, 10, 14, 17],
  dom13: [0, 4, 7, 10, 14, 21], m9b5: [0, 3, 6, 10, 14], m11b5: [0, 3, 6, 10, 14, 17], dom7sus: [0, 5, 7, 10],
};

export const SUF: Record<string, string> = {
  maj: '', min: 'm', dim: '°', aug: '+', sus4: 'sus4', maj7: 'maj7', min7: 'm7', dom7: '7', m7b5: 'ø7',
  dim7: '°7', maj6: '6', min6: 'm6', maj9: 'maj9', maj11: 'maj11', maj13: 'maj13', min9: 'm9', min11: 'm11',
  min13: 'm13', dom9: '9', dom11: '11', dom13: '13', m9b5: 'ø9', m11b5: 'ø11', dom7sus: '7sus4',
};

export const DIA_TRI = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
export const DIA_SEV = ['maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'm7b5'];
export const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
export const ROMAN7 = ['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7'];
export const FN: Fn[] = ['T', 'S', 'T', 'S', 'D', 'T', 'D'];
export const FNNAME: Record<Fn, string> = { T: 'Tonic', S: 'Subdominant', D: 'Dominant' };
export const FNCOLOR: Record<Fn, string> = { T: '#3f6b5f', S: '#b07d23', D: '#c2562e' };
export const FNTINT: Record<Fn, string> = { T: '#e7efec', S: '#f5ecd8', D: '#f7e4db' };
export const FNWHY: Record<Fn, string> = {
  T: 'Home base — the chord of rest. The ear hears it as arrival, the end of a journey.',
  S: 'Departure — it lifts away from home and leans the music forward, setting up the dominant.',
  D: 'Tension — it holds the tritone (the 3rd and 7th) that strains to snap back to the tonic. This pull IS functional harmony.',
};
export const KEYSIG: Record<number, string> = {
  0: 'no ♯/♭', 7: '1 ♯', 2: '2 ♯', 9: '3 ♯', 4: '4 ♯', 11: '5 ♯', 6: '6 ♯/♭', 1: '5 ♭', 8: '4 ♭', 3: '3 ♭', 10: '2 ♭', 5: '1 ♭',
};
export const INTNAME: Record<number, string> = {
  1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4', 6: 'Tritone', 7: 'P5', 8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7', 12: 'Octave',
};
export const QLABEL: Record<string, string> = {
  maj: 'Major', min: 'Minor', dim: 'Diminished', aug: 'Augmented', dom7: 'Dominant 7', maj7: 'Major 7', min7: 'Minor 7',
};

export interface Chord {
  rootPc: number;
  intervals?: number[];
  quality?: string;
  name?: string;
  roman?: string;
  fn?: Fn;
  degLabels?: string[];
  midis?: number[];
}
