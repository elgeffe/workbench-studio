import { describe, it, expect } from 'vitest';
import { analyseChanges, keySpans, familyOf, type AnalysedChord } from './keycenters';
import { parseChanges } from './symbols';
import { spell } from './theory';
import type { Chord } from './constants';

function changes(line: string): Chord[] {
  return parseChanges(line).map((p) => {
    if (!p) throw new Error('unparseable chord in fixture: ' + line);
    return { rootPc: p.rootPc, intervals: p.intervals, name: p.name };
  });
}

/** "Bb major", "G minor" — how the assertions below read a key centre. */
const keyOf = (a: AnalysedChord) => `${spell(a.tonicPc, a.tonicPc, a.mode === 'minor' ? 'aeolian' : 'ionian')} ${a.mode}`;
const keysOf = (line: string) => analyseChanges(changes(line)).map(keyOf);
const romansOf = (line: string) => analyseChanges(changes(line)).map((a) => a.roman);

describe('chord families', () => {
  it('sorts chords by the third, fifth and seventh', () => {
    expect(familyOf([0, 4, 7])).toBe('maj');
    expect(familyOf([0, 3, 7, 10])).toBe('min');
    expect(familyOf([0, 4, 7, 10])).toBe('dom');
    expect(familyOf([0, 3, 6, 10])).toBe('m7b5');
    expect(familyOf([0, 3, 6, 9])).toBe('dim7');
    expect(familyOf([0, 4, 8])).toBe('aug');
    expect(familyOf([0, 5, 7, 10])).toBe('sus');
  });
  it('keeps a ♭9 dominant a dominant', () => {
    expect(familyOf([0, 4, 7, 10, 13])).toBe('dom');
  });
});

describe('Autumn Leaves — two centres, one key signature', () => {
  // Cm7 F7 BbMaj7 EbMaj7 is ii V I IV in Bb; Am7b5 D7 Gm is iiø V i in G minor.
  const line = 'Cm7 F7 BbMaj7 EbMaj7 Am7b5 D7 Gm7';

  it('hears the major ii–V–I in Bb', () => {
    expect(keysOf(line).slice(0, 4)).toEqual(['Bb major', 'Bb major', 'Bb major', 'Bb major']);
  });
  it('hears the minor ii–V–i in G', () => {
    expect(keysOf(line).slice(4)).toEqual(['G minor', 'G minor', 'G minor']);
  });
  it('numbers both centres from their own tonic', () => {
    expect(romansOf(line)).toEqual(['ii', 'V', 'I', 'IV', 'iiø', 'V', 'i']);
  });
  it('reports exactly two key centres', () => {
    const spans = keySpans(analyseChanges(changes(line)));
    expect(spans).toHaveLength(2);
    expect(spans[0]).toMatchObject({ tonicPc: 10, mode: 'major', start: 0, end: 3 });
    expect(spans[1]).toMatchObject({ tonicPc: 7, mode: 'minor', start: 4, end: 6 });
  });
});

describe('Blue Bossa — a semitone modulation and back', () => {
  const line = 'Cm6 Fm7 Dm7b5 G7b9 Cm6 Ebm7 Ab7 DbMaj7 Dm7b5 G7 Cm6';

  it('starts and ends in C minor', () => {
    const keys = keysOf(line);
    expect(keys[0]).toBe('C minor');
    expect(keys[keys.length - 1]).toBe('C minor');
  });
  it('modulates to Db major for the bridge ii–V–I', () => {
    expect(keysOf(line).slice(5, 8)).toEqual(['Db major', 'Db major', 'Db major']);
  });
  it('numbers the Db section as its own ii–V–I', () => {
    expect(romansOf(line).slice(5, 8)).toEqual(['ii', 'V', 'I']);
  });
  it('reports three centres — C minor, Db major, C minor', () => {
    const spans = keySpans(analyseChanges(changes(line)));
    expect(spans.map((s) => `${s.tonicPc}:${s.mode}`)).toEqual(['0:minor', '1:major', '0:minor']);
  });
});

describe('Alone Together — four centres in sixteen bars', () => {
  const line = 'Dm Em7b5 A7b9 Dm Am7b5 D7b9 Gm Bm7 E7 Gm7 C7 F F7';

  it('opens in D minor', () => {
    expect(keysOf(line).slice(0, 4)).toEqual(Array(4).fill('D minor'));
  });
  it('turns to G minor on its own minor ii–V', () => {
    expect(keysOf(line).slice(4, 7)).toEqual(['G minor', 'G minor', 'G minor']);
  });
  it('lands in F major through Gm7 C7', () => {
    expect(keysOf(line).slice(9, 12)).toEqual(['F major', 'F major', 'F major']);
  });
  it('hears Bm7 E7 as a ii–V pointing at a key that never arrives', () => {
    // The pair announces A; the tune sidesteps to Gm7 C7 F instead. Whichever
    // key the reading assigns them, the two must agree with each other — that
    // is what makes them a pair rather than two unrelated chords.
    const a = analyseChanges(changes(line));
    expect(keyOf(a[7])).toBe(keyOf(a[8]));
  });
});

describe('inertia', () => {
  it('does not modulate for a chord that merely borrows', () => {
    // I vi ii V with a borrowed iv — one key throughout, not two.
    const spans = keySpans(analyseChanges(changes('C Am7 Dm7 G7 Fm C')));
    expect(spans).toHaveLength(1);
    expect(spans[0].tonicPc).toBe(0);
  });
  it('keeps a blues in one key despite the dominant on every degree', () => {
    const spans = keySpans(analyseChanges(changes('C7 F7 C7 G7 F7 C7')));
    expect(spans).toHaveLength(1);
    expect(spans[0]).toMatchObject({ tonicPc: 0, mode: 'major' });
  });
  it('can be told to modulate more or less eagerly', () => {
    const line = changes('Cm7 F7 BbMaj7 Am7b5 D7 Gm7');
    const eager = keySpans(analyseChanges(line, 0)).length;
    const stubborn = keySpans(analyseChanges(line, 400)).length;
    expect(stubborn).toBe(1);
    expect(eager).toBeGreaterThanOrEqual(2);
  });
});

describe('edges', () => {
  it('handles an empty and a single-chord progression', () => {
    expect(analyseChanges([])).toEqual([]);
    expect(analyseChanges(changes('C'))).toHaveLength(1);
  });
  it('marks the first chord as opening a centre', () => {
    expect(analyseChanges(changes('C F G'))[0].starts).toBe(true);
  });
  it('flags a chord whose notes leave the key', () => {
    // The Bb7 before A7 in Alone Together's last phrase is a chromatic approach
    // to the V — it belongs to no key, and should say so rather than be forced.
    const a = analyseChanges(changes('Dm Bb7 A7 Dm'));
    expect(a[1].fits).toBe(false);
  });
});
