// A part's playhead: which 16th of the bar the ear is hearing right now.
//
// The transport schedules a bar ahead of time, so "the bar being played" and
// "the bar just queued" are two different things for as long as the scheduling
// lead plus the device's output latency. On a slow output that gap is wide
// enough that the sounding bar still has a step or two of tail left when the
// next one is laid out — so a fresh bar waits in a queue and is promoted when
// the clock reaches the moment it is actually *heard*. Take it over on arrival
// instead and the end of every bar (4a first, then 4&) never lights.
//
// Bars carry a payload, so whatever else follows the ear — which chord the bass
// bar was resolved against, say — is promoted in step with the playhead rather
// than jumping ahead to the bar being scheduled.

import { stepAtElapsed } from './drums';

export interface PlayheadBar {
  /** audio-clock time the ear gets step 0 */
  heard: number;
  stepSec: number;
  /** 50 = straight; the drum grid swings, the bassline does not */
  swing: number;
}

export class Playhead<B extends PlayheadBar> {
  private cur: B | null = null;
  private queued: B | null = null;

  /** The bar being drawn — the one in the speakers, not the one just scheduled. */
  get bar(): B | null { return this.cur; }

  /** Hand over a freshly scheduled bar. */
  push(b: B): void {
    if (!this.cur) { this.cur = b; return; }
    // Still queued when the next bar arrives means it was never promoted (a
    // hidden tab stops rAF) — catch up rather than stall a bar behind forever.
    if (this.queued) this.cur = this.queued;
    this.queued = b;
  }

  /** The step sounding at `now`, or -1 when there is nothing to move to. */
  step(now: number): number {
    if (this.queued && now >= this.queued.heard) { this.cur = this.queued; this.queued = null; }
    const b = this.cur;
    if (!b) return -1;
    const el = now - b.heard;
    // More than a bar (plus a step of slack) means the anchor is stale — an
    // audio clock that hadn't started when we took it, or a stalled tick.
    // Leave the playhead where it is rather than pin it to the last step.
    if (el >= 17 * b.stepSec) return -1;
    return stepAtElapsed(el, b.stepSec, b.swing);
  }

  clear(): void { this.cur = null; this.queued = null; }
}
