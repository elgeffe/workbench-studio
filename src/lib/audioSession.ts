// iOS silences Web Audio when the ring/silent switch is set to mute, because
// Safari treats it as "ambient" sound by default. Declaring the session as
// 'playback' — the category for media the user came to hear — makes it play
// through the mute switch, like a music or video app. Only the in-app mute
// should silence the app.
//
// The session is page-global, so every AudioContext we create (the studio's and
// the metronome's) must go through this before it starts making sound.
// Safari 16.4+ / iOS 16.4+; harmless (and ignored) elsewhere.

export function ignoreMuteSwitch(): void {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (!nav.audioSession) return;
  try { nav.audioSession.type = 'playback'; } catch { /* unsupported value */ }
}
