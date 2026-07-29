# The Workbench — Ear & Theory

An interactive music-theory studio: a circle-of-fifths explorer, a chord-progression
workshop, ear training, sight reading, a pattern/scale library, and a jazz-harmony
curriculum — with live bass, guitar and piano that light up the notes you're hearing.

This is a single **adaptive** app that presents a two-column desktop workspace (content +
side instrument panel) and a stacked mobile experience (sticky header + horizontally
scrolling strips + a fixed, expandable instrument dock and bottom tab bar) from one
component tree. Both layouts have full feature parity.

## Tech stack

- **[Svelte 5](https://svelte.dev)** (runes) + **[Vite 6](https://vite.dev)**
- **TypeScript** throughout
- **[Vitest](https://vitest.dev)** for engine unit tests
- **[Playwright](https://playwright.dev)** for end-to-end tests (desktop + mobile viewports)
- **Web Audio API** synth — no audio assets, everything is generated

## Architecture

```
src/
  lib/
    engine/            Pure, framework-agnostic music theory (unit-tested)
      constants.ts     Note names, scales, chord tables, functional-harmony colours
      theory.ts        Spelling, diatonic generation, substitutions, voicings, inversions
      genres.ts        THE shared genre taxonomy: 8 families, 31 genres. Drums,
                       basslines and progressions all shelve off this one list,
                       so a genre means the same thing in every tab.
      data.ts          Progression library (119 across the 31 genres), the
                       pattern library, the Learn-mode jazz curriculum
      fretpatterns.ts  Fretboard diagram library (scale boxes, chord grips)
      bass.ts          Degree resolution, walking tricks, the bassline index
      basslines/       The bassline library: 119 grooves across 31 genres
                       (rockpop, funksoul, hiphop, house, breaks, hard, jazz, world)
      kit.ts           The instrument table: one entry per drum voice, carrying
                       its row metadata AND its synthesis recipe (noise/tone
                       layers). Add an instrument by adding an entry — the id
                       union, the grid shape and the audio engine follow.
      drums.ts         Drum genres, grid composition, swing, rhythm concepts
      patterns/        The groove library: 132 layered patterns across 31 genres
                       (rockpop, funksoul, hiphop, house, techno, breaks, hard,
                       jazz, world)
      ear.ts           Ear-training question generator
      reading.ts       Sight-reading drills: staff geometry, key signatures, targets
    view/              Pure view-model builders (state in → render props out)
      index.ts         computeView(store): assembles the full view-model
      types.ts         View-model shapes (chips, wedges, fret rows, piano keys)
      circle.ts        Circle-of-fifths wheel geometry and colouring
      instruments.ts   Fretboard + piano lighting and the jazz finger overlay
      workshop.ts      Palettes, progression strip, explore panel, bass workbench
      patterns.ts      Pattern library, chord shapes, fret-diagram tabs
      drums.ts         Groovebox grid, genre → pattern picker, layer stepper
      picker.ts        Shelf/chip builders shared by all three genre pickers
      learn.ts         Jazz curriculum, rhythm concepts, song-structure timelines
      practice.ts      Ear-training and sight-reading views
    metronome/         Practice metronome (ported from Metrognome): look-ahead
                       click engine, tempo/mute automation, mic tempo detection,
                       practice-session history, and its own runes sub-store
    audio.ts           Web Audio synth engine (isolated from state)
    store.svelte.ts    Svelte 5 runes store: $state + actions + view = $derived(computeView)
    context.ts         provideStore()/useStore() context helpers
    components/        Reusable UI: Header, ScaleStrip, CircleMode, WorkshopMode,
                       DrumsMode, EarMode, ReadingMode, Staff, PatternsMode, LearnMode,
                       Instruments, Fretboard, FretDiagram, Piano
  App.svelte           Adaptive shell (desktop tabs + side panel / mobile dock + tab bar)
  main.ts              Mount entry
```

The **engine** is pure functions with no Svelte or DOM dependency, so the harmony logic is
independently testable. The **store** holds all reactive state and the actions; the
**view** layer is a set of pure functions that turn that state into a single `$derived`
view-model (`store.view`) — components read `store.view.*` and call `store.<action>()`.
See `docs/IMPROVEMENTS.md` for the prioritized roadmap of proposed enhancements.

## Development

```bash
npm install
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build to dist/
npm run preview    # preview the production build
npm run check      # svelte-check type checking
npm test           # Vitest unit tests
npm run test:e2e   # Playwright end-to-end tests
```

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs the unit tests, builds with the correct base path
(`/<repo>/`), and publishes `dist/` to GitHub Pages on every push to `main` (and this
feature branch).

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment →
Source** and select **GitHub Actions**. After that, each qualifying push deploys
automatically; the live URL appears in the workflow's `deploy` job summary.

## Modes

- **Circle** — circle of fifths/fourths (major or minor view), diatonic chords for the
  current key/scale, with substitutions and a "why it works" readout.
- **Workshop** — build progressions in Classic, Jazz, Classical or Bass palettes; explore any
  placed chord (extensions, inversions, secondary dominants, ii–V insertion, tritone
  subs); play them back with tempo/voicing control. Starting points come from the same
  **genre → template** picker the groovebox uses: 119 progressions across the 31 genres.
  The **BASS** palette adds 119 basslines over the same shelf — pick a genre and the
  drum groove, the changes and the bass line all agree on what the style is. Each line is
  16 degree tokens that transpose themselves through your progression, and you can seed
  the build-your-own grid from any of them.
- **Drums** — a 16-step groovebox with a dependent **genre → pattern** picker: 132 grooves
  across 31 genres (rock, metal, pop, disco, funk, soul, neo-soul, gospel, boom-bap, trap,
  electro, house, tech-house, techno, trance, D&B, jungle, garage, dubstep, breaks,
  hardstyle, hardcore, jazz, soul-jazz, jazz-funk, fusion, blues, Latin, Afrobeat, reggae,
  reggaeton). Every
  pattern is authored as ordered *layers*, so the LAYERS chips rebuild the groove one part
  at a time and explain what each adds; each genre also carries a note on programming it in
  a groovebox (swing, velocity, kit choices). The grid shows only the instruments the
  pattern plays — add any of the 14 kit voices as a new row, or remove one. Cells are
  editable (rest → hit → accent) and the transport is shared with the Workshop. The picker
  itself lives behind a one-line summary bar and opens as a modal (a full-height sheet on a
  phone), so the grid — not the genre shelves — owns the top of the page.
- **Metronome** — a full practice metronome (ported from the standalone Metrognome app):
  sample-accurate Web Audio click with tap tempo, time signatures, subdivisions and accents;
  tempo automation for rhythm drills (step trainer, smooth ramps by time or bars, gap-click
  mute trainer); practice goals by bars or minutes with auto-stop; an on-device practice log;
  and experimental microphone tempo-following. The click keeps running while you browse
  other tabs, so you can practice against it anywhere in the studio.
- **Ear** — interval, chord-quality, and progression recognition drills with scoring.
- **Patterns** — scale, pentatonic, arpeggio, and genre-lick library lit on the instruments.
- **Learn** — a five-chapter jazz-harmony walkthrough (extensions, shells, inversions,
  borrowing, the ii–V–I) with playable examples.
