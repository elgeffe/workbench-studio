import { describe, it, expect } from 'vitest';
import { chordScale, CHORD_SCALES } from './chordscale';
import { analyseChanges } from './keycenters';
import { parseChanges } from './symbols';
import type { Chord } from './constants';

function scalesFor(line: string): Array<{ chord: string; scale: string }> {
  const parsed = parseChanges(line).map((p) => {
    if (!p) throw new Error('unparseable: ' + line);
    return p;
  });
  const chords: Chord[] = parsed.map((p) => ({ rootPc: p.rootPc, intervals: p.intervals, name: p.name }));
  return analyseChanges(chords).map((a, i) => ({
    chord: parsed[i].name,
    scale: chordScale(a, parsed[i].intervals).name,
  }));
}
const names = (line: string) => scalesFor(line).map((x) => x.scale);

describe('the table every jazz method opens with', () => {
  it('gives each degree of a major key its mode', () => {
    expect(names('CMaj7 Dm7 Em7 FMaj7 G7 Am7 Bm7b5')).toEqual([
      'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian ♮2',
    ]);
  });
});

describe('the chord overrules the key signature', () => {
  it('hears Blue Bossa\'s Cm6 as having a natural 6th, not as aeolian', () => {
    // Cm6 contains an A♮. Blue Bossa's key signature has three flats and would
    // hand you an A♭ — which is the note the chord does not have.
    const [tonic] = names('Cm6 Fm7 Dm7b5 G7b9 Cm6');
    expect(tonic).toBe('melodic minor');
    expect(CHORD_SCALES.melodicMinor.int).toContain(9); // the ♮6
    expect(CHORD_SCALES.aeolian.int).not.toContain(9);
  });
  it('keeps a plain m7 tonic in natural minor', () => {
    expect(names('Cm7 Fm7 Gm7 Cm7')[0]).toBe('aeolian');
  });
  it('reads a minor-major seventh as melodic minor', () => {
    expect(names('Cm(maj7) Fm7 Cm(maj7)')[0]).toBe('melodic minor');
  });
});

describe('dominants', () => {
  it('gives a plain V mixolydian in major', () => {
    expect(names('Dm7 G7 CMaj7')[1]).toBe('mixolydian');
  });
  it('gives the V of a minor key its ♭9 sound', () => {
    // Alone Together's A7(♭9) into D minor. Phrygian dominant is harmonic
    // minor's fifth mode — the ♭9 and ♭13 are already in it.
    const out = scalesFor('Em7b5 A7b9 Dm');
    expect(out[1].scale).toBe('phrygian dominant');
  });
  it('honours a written ♯11 as lydian dominant', () => {
    expect(names('Dm7 G7#11 CMaj7')[1]).toBe('lydian dominant');
  });
  it('honours a written alt as altered', () => {
    expect(names('Dm7 G7alt CMaj7')[1]).toBe('altered');
  });
  it('gives a ♭9 and ♯9 together the diminished scale', () => {
    const out = scalesFor('Dm7 G13b9 CMaj7');
    expect(['half-whole diminished', 'altered']).toContain(out[1].scale);
  });
  it('reads a secondary dominant on its own root', () => {
    // A7 in C major is V7/ii — mixolydian on A, not anything in C.
    const out = scalesFor('CMaj7 A7 Dm7 G7 CMaj7');
    expect(out[1].scale).toBe('mixolydian');
  });
});

describe('the awkward chords', () => {
  it('gives every m7♭5 locrian ♮2 rather than plain locrian', () => {
    // The ♮2 is the difference between a usable scale and one whose ♭9 fights
    // the chord. Every m7♭5 on all three sheets should get it.
    for (const line of ['Am7b5 D7 Gm', 'Dm7b5 G7 Cm6', 'Em7b5 A7b9 Dm']) {
      expect(names(line)[0], line).toBe('locrian ♮2');
    }
  });
  it('gives a diminished seventh the whole-half scale', () => {
    expect(names('CMaj7 C#dim7 Dm7')[1]).toBe('whole-half diminished');
  });
  it('gives an augmented chord the whole-tone scale', () => {
    expect(names('CMaj7 C+ FMaj7')[1]).toBe('whole tone');
  });
});

describe('scale shapes', () => {
  it('roots every scale on the chord, not the key', () => {
    // Dm7 in C major is D dorian: its notes are C major's, but it starts on D.
    const parsed = parseChanges('CMaj7 Dm7 G7')[1]!;
    const a = analyseChanges(parseChanges('CMaj7 Dm7 G7').map((p) => ({ rootPc: p!.rootPc, intervals: p!.intervals })))[1];
    const sc = chordScale(a, parsed.intervals);
    expect(sc.pcs[0]).toBe(2); // starts on D
    expect([...sc.pcs].sort((x, y) => x - y)).toEqual([0, 2, 4, 5, 7, 9, 11]); // C major's notes
  });
  it('gives every scale seven notes, or eight for the diminished ones', () => {
    for (const [id, def] of Object.entries(CHORD_SCALES)) {
      const n = def.int.length;
      expect(n, id).toBeGreaterThanOrEqual(6);
      expect(n, id).toBeLessThanOrEqual(8);
      expect(def.int[0], id).toBe(0);
      expect(Math.max(...def.int), id).toBeLessThan(12);
    }
  });
  it('names a colour tone that the scale actually contains', () => {
    for (const [id, def] of Object.entries(CHORD_SCALES)) {
      if (def.color !== undefined) expect(def.int, id).toContain(def.color);
    }
  });
});

describe('end to end on the three sheets', () => {
  it('reads Autumn Leaves as two keys with the right scales', () => {
    expect(names('Cm7 F7 BbMaj7 EbMaj7 Am7b5 D7 Gm7')).toEqual([
      'dorian', 'mixolydian', 'ionian', 'lydian', 'locrian ♮2', 'phrygian dominant', 'aeolian',
    ]);
  });
  it('reads the Blue Bossa bridge as a ii–V–I in Db', () => {
    const out = names('Cm6 Fm7 Dm7b5 G7b9 Cm6 Ebm7 Ab7 DbMaj7');
    expect(out.slice(5)).toEqual(['dorian', 'mixolydian', 'ionian']);
  });
});
