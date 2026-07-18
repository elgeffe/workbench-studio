# The Workbench — Prioritized Improvement Roadmap

A living backlog of proposed improvements, redesigns, and new features, ordered by
expected impact vs. effort. Written 2026-07 alongside the store/view refactor.

## P0 — High impact, low-to-medium effort

1. **Persist state to `localStorage`.** Today a page refresh loses everything: key,
   scale, the built progression, the custom bass line, the drum grid, and both practice
   scores. Serialize a small snapshot (a `$effect` watching a `toJSON()` of the store)
   and restore it in the constructor. This is the single biggest quality-of-life win.
2. **Practice statistics over time.** Ear and Reading only track score/streak for the
   current session. Store per-question results (level, correct, timestamp) and show a
   simple accuracy-by-category view, so learners can see *which* intervals or chord
   qualities they keep missing — that's what makes drilling effective.
3. **Adaptive question selection.** Once results are stored, bias `genEarTarget` /
   `genReadTarget` toward the user's weakest categories (simple weighted sampling —
   no ML needed). Turns the drills from random into spaced practice.
4. **Metronome + count-in.** The transport already has one clock; add an audible
   click (optional) and a one-bar count-in before progression/drum playback starts.

## P1 — High impact, medium effort

5. **Export / import.** Progressions and grooves are ephemeral. Export the current
   progression + drum grid + bass line as a shareable URL hash (compact JSON in the
   fragment) so a teacher can send a student a setup. MIDI-file export of the
   progression would follow naturally (`Chord.midis` already exists).
6. **Web MIDI input.** A connected keyboard answering Reading's "play it" mode and
   driving the Workshop chord preview would make the app genuinely instrument-first.
   Feature-detect `navigator.requestMIDIAccess`; map note-on to `selectNote`.
7. **Melody / lead line lane.** The band has chords, bass, and drums — the missing
   voice is melody. A 16-step pitch lane (scale-degree tokens like the bass editor)
   over the progression would complete the "build a whole arrangement" story.
8. **Undo for destructive edits.** `jzClear`, `clearDrums`, `clearBassCustom`, and
   chord removal have no undo. A tiny snapshot stack (last 10 states of the affected
   slice) removes the fear of experimenting.

## P2 — Valuable, larger or more speculative

9. **Voice-leading playback.** Chords currently re-strike from root position each
   slot. Choosing inversions that minimize movement between successive chords (the
   engine already has inversion math) would make playback sound dramatically more
   musical — and is a teachable moment: show *why* the voicing was chosen.
10. **Reading mode: rhythm reading.** Notes/intervals/chords are covered; rhythm
    isn't. Show one bar of notation, user taps it on the spacebar, score the timing.
    Reuses the transport and the drum scheduling.
11. **Custom drum kit sounds / more voices.** The synth kit is charming but limited
    (no toms, no percussion). A couple more synthesized voices plus per-voice volume
    would widen the groovebox's range at near-zero asset cost.
12. **Guided practice sessions.** A "daily workout" that strings together 5 ear
    questions, 5 reading questions, and one progression exercise, with a summary at
    the end. All the pieces exist; this is orchestration + a results screen.
13. **PWA / offline install.** The app is fully client-side with no assets — a
    manifest + service worker makes it installable and offline-capable on phones,
    which is where the mobile layout already shines.

## Repo health / engineering

14. **Component-level tests for view builders.** The new `lib/view/*` modules are
    pure functions — cheap to unit-test directly (e.g. `buildCircle` wedge numerals
    per view/direction, `buildReading` chip states). Today only `engine/` is covered.
15. **Extract the design tokens.** Colors like `#c2562e` / `#3f6b5f` are repeated
    hundreds of times across view builders and inline component styles. A single
    `tokens.ts` (+ CSS custom properties) would make a future theme/dark-mode
    possible and shrink the view code. Started with `selChip()` in `view/types.ts`.
16. **Reduce inline styles in components.** Most styling is inline `style="..."`
    strings, which defeats Svelte's scoped CSS and bloats the DOM. Migrating the
    hot, repeated chips/cells to classes would cut bundle size and improve
    readability. Do it opportunistically, per component.
17. **CI: run e2e on PRs.** `deploy.yml` runs unit tests only; Playwright runs
    locally. A separate workflow running `npm run check` + e2e (chromium only) on
    pull requests would catch view regressions before merge.
18. **Accessibility pass.** Interactive `<div>`s have `role`/`tabindex`, but chip
    rows lack arrow-key navigation, and the color-coding (function colors, drum
    voices) has no non-color fallback. Also audit contrast on the parchment palette.
19. **Split `engine/fretpatterns.ts` (550 lines) and `engine/data.ts` (458 lines)**
    if they keep growing — both are data-heavy and could move toward JSON-like data
    modules per tab/genre. Not urgent; they're flat and readable today.
