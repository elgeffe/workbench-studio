// The one AudioContext for the whole app. The studio's synth and the
// metronome's click, drone and mic detector all schedule against it, so they
// share a single clock: a time on it means the same instant everywhere, with
// one output latency, and nothing has to translate between clocks.

import { ignoreMuteSwitch } from './audioSession';

let ctx: AudioContext | null = null;

export function sharedAudioContext(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error('Web Audio API is not supported in this browser.');
    // Must precede the first context, or iOS mutes everything with the phone's
    // silent switch; only the in-app mute should do that.
    ignoreMuteSwitch();
    ctx = new Ctor();
  }
  return ctx;
}
