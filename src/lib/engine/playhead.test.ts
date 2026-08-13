import { describe, it, expect } from 'vitest';
import { Playhead, type PlayheadBar } from './playhead';

interface Bar extends PlayheadBar { tag: string }
const bar = (heard: number, tag = ''): Bar => ({ heard, stepSec: 0.1, swing: 50, tag });

describe('Playhead', () => {
  it('has nothing to draw until a bar is pushed', () => {
    const h = new Playhead<Bar>();
    expect(h.step(0)).toBe(-1);
    expect(h.bar).toBeNull();
  });

  it('walks the bar it is given, step by step', () => {
    const h = new Playhead<Bar>();
    h.push(bar(10));
    expect(h.step(10)).toBe(0);
    expect(h.step(10.35)).toBe(3);
    expect(h.step(11.5)).toBe(15);
  });

  it('holds the sounding bar until the next one is actually heard', () => {
    // The transport lays a bar out a lead plus an output latency early, so the
    // bar in the speakers still has its tail to show when the next arrives.
    const h = new Playhead<Bar>();
    h.push(bar(10, 'first'));
    h.push(bar(11.6, 'second'));
    expect(h.step(11.4)).toBe(14); // still finishing the first bar
    expect(h.bar?.tag).toBe('first');
    expect(h.step(11.6)).toBe(0);  // the second one reaches the ear
    expect(h.bar?.tag).toBe('second');
  });

  it('catches up rather than falling a bar behind when nothing draws', () => {
    // A hidden tab stops rAF: nothing promotes the queue, and a third bar must
    // not leave the head anchored to the first one forever.
    const h = new Playhead<Bar>();
    h.push(bar(10, 'first'));
    h.push(bar(11.6, 'second'));
    h.push(bar(13.2, 'third'));
    expect(h.bar?.tag).toBe('second');
    expect(h.step(13.2)).toBe(0);
    expect(h.bar?.tag).toBe('third');
  });

  it('leaves the head alone on a stale anchor', () => {
    // Past the end of the bar (plus a step of slack) the anchor means nothing —
    // a stalled tick, or a clock that had not started when we took it.
    const h = new Playhead<Bar>();
    h.push(bar(10));
    expect(h.step(12)).toBe(-1);
    expect(h.step(9.9)).toBe(-1); // and before its first step, too
  });

  it('forgets everything when cleared', () => {
    const h = new Playhead<Bar>();
    h.push(bar(10));
    h.clear();
    expect(h.bar).toBeNull();
    expect(h.step(10.2)).toBe(-1);
  });
});
