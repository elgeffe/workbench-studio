# Workbench Studio

A groovebox with the theory attached. Pick a drum pattern, write a chord progression, put
a bassline under it — all on one clock — and explore the keys, scales and harmony behind
what you're building, with live bass, guitar and piano lighting up the notes you hear.

Six tabs: **Circle** explores, **Drums** / **Chords** / **Bass** build over one shared
transport, **Metronome** practises, and **Learn** teaches. The split is deliberate — the
tool tabs apply the theory and stay uncluttered, while every piece of explanation, every
teaching palette and every drill lives behind Learn. See `docs/REDESIGN.md`.

This is a single **adaptive** app that presents a two-column desktop workspace (content +
side instrument panel) and a stacked mobile experience (thin top bar + a fixed transport /
instrument dock and bottom tab bar) from one component tree. Both layouts have full
feature parity.

## Tech stack

- **[Svelte 5](https://svelte.dev)** (runes) + **[Vite 6](https://vite.dev)**
- **TypeScript** throughout
- **[Vitest](https://vitest.dev)** for engine unit tests
- **[Playwright](https://playwright.dev)** for end-to-end tests (desktop + mobile viewports)
- **Web Audio API** synth — no audio assets, everything is generated
- **Installable PWA** with a precached app shell for complete offline use after the first load

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
      chords.ts        Progression strip, diatonic/colour palettes, chord inspector
      bass.ts          The line, the groove shelf, the annotated library cards
      patterns.ts      Pattern library, chord shapes, fret-diagram tabs
      drums.ts         Groovebox grid, genre → pattern picker, layer stepper
      picker.ts        Shelf/chip builders shared by all the genre pickers
      learn.ts         Jazz curriculum, the jazz/classical palettes, rhythm
                       concepts, bassline moves, song-structure timelines
      practice.ts      Ear-training and sight-reading views
    metronome/         Practice metronome (ported from Metrognome): look-ahead
                       click engine, tempo/mute automation, mic tempo detection,
                       practice-session history, and its own runes sub-store
    audio.ts           Web Audio synth engine (isolated from state)
    store.svelte.ts    Svelte 5 runes store: $state + actions + view = $derived(computeView)
    context.ts         provideStore()/useStore() context helpers
    components/        StudioBar (brand + transport + key), KeyPicker, GenrePicker,
                       CircleMode, DrumsMode, ChordsMode, BassMode, MetronomeMode,
                       LearnMode, EarMode, ReadingMode, Staff, Instruments,
                       Fretboard, FretDiagram, Piano
      parts/           Widgets used at two altitudes — bare in a tool tab, wrapped
                       in teaching copy in Learn (ChordInspector)
      learn/           The six Learn areas: Theory, Rhythm, Bass, Patterns,
                       Practice, Forms
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
npm run icons      # regenerate the app icons in public/
```

## Offline use

The production build includes a web app manifest and service worker. Visit the deployed app
once while online, then use your browser's **Install app** or **Add to Home Screen** action.
The complete application is precached (including its locally generated interface and icons),
so every studio mode and the Web Audio instruments remain available without a connection.
When a new version is deployed it downloads in the background and is used on the next visit.

## Installed on a phone

The layout is built for a standalone install on a notched phone. The viewport is
`viewport-fit=cover` with a translucent status bar, so the page genuinely starts underneath
the notch / Dynamic Island; `src/app.css` resolves `env(safe-area-inset-*)` into the
`--sat/--sar/--sab/--sal` custom properties once, and the studio bar, content, dock and
modal sheet all pad themselves from those. Landscape on a phone puts the transport bar and
the tab bar on a single row (see the `--dock-h` variable), which is the difference between
~106px and ~50px of fixed bottom chrome on a 390pt-tall screen.

Every file in `public/` that shows the app's mark is generated by `npm run icons` from
`scripts/make-icons.mjs` — edit the constants at the top of that script rather than the SVGs.
It emits the rounded "any" icon, a full-bleed maskable variant for Android, and PNGs, which
iOS requires: it ignores SVG icons when adding to the home screen.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs the unit tests, builds with the correct base path
(`/<repo>/`), and publishes `dist/` to GitHub Pages on every push to `main` (and this
feature branch).

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment →
Source** and select **GitHub Actions**. After that, each qualifying push deploys
automatically; the live URL appears in the workflow's `deploy` job summary.

## The tabs

The chrome carries what every tab shares: the **transport** (one PLAY, one tempo, driving
drums, chords and bass on a single clock), the **mixer** (mute or solo each of the three
parts — it gates audio only, so a muted part keeps its playhead and its place in the loop),
the **key/scale** picker behind one button, and the master sound toggle. On a phone the
transport rides the dock bar above the tabs, where a thumb can reach it, and the mixer and
tempo slider live in the dock panel.

Any genre's shelf offers **load the whole style** — one tap fills drums, chords and bass
from the same genre, since all three libraries shelve off one taxonomy.

- **Circle** — circle of fifths/fourths (major or minor view) with the scale and mode
  selector inline, diatonic chords for the current key/scale, substitutions and a
  "why it works" readout.
- **Drums** — a 16-step groovebox with a dependent **genre → pattern** picker: 132 grooves
  across 31 genres (rock, metal, pop, disco, funk, soul, neo-soul, gospel, boom-bap, trap,
  electro, house, tech-house, techno, trance, D&B, jungle, garage, dubstep, breaks,
  hardstyle, hardcore, jazz, soul-jazz, jazz-funk, fusion, blues, Latin, Afrobeat, reggae,
  reggaeton). Every pattern is authored as ordered *layers*, so the LAYERS chips rebuild
  the groove one part at a time. The grid shows only the instruments the pattern plays —
  add any of the 14 kit voices as a new row, or remove one — and cells are editable
  (rest → hit → accent). Swing lives here; tempo is the studio's.
- **Chords** — build a progression from the diatonic and colour/borrowed palettes, or load
  one of 119 starting points across the 31 genres. Drag to reorder. Select a placed chord
  and the **inspector** offers every move on it: extensions, inversions, a leading V or
  ii–V, and substitutions. Voicing (full/shell) and chord length (½ bar / 1 bar) are
  per-progression settings.
- **Bass** — one line, which is yours: a 16-step grid of *degrees*, so it transposes itself
  through every change. The 119-groove library across 31 genres loads into it as a starting
  point rather than replacing it. Use the chrome's mixer to solo it and study it alone.
- **Metronome** — a full practice metronome (ported from the standalone Metrognome app):
  sample-accurate Web Audio click with tap tempo, time signatures, subdivisions and accents;
  tempo automation for rhythm drills (step trainer, smooth ramps by time or bars, gap-click
  mute trainer); practice goals by bars or minutes with auto-stop; an on-device practice log;
  and experimental microphone tempo-following. It runs on its own clock, with buttons to
  copy tempo to and from the studio, and keeps ticking while you browse other tabs.
- **Learn** — six areas: **Theory** (the jazz-harmony curriculum plus the jazz and classical
  palettes, whose chips still place chords into your progression), **Rhythm** (how patterns
  are built, with the anatomy of your loaded groove), **Bass** (the moves behind a line, and
  the annotated groove library), **Patterns** (scales, pentatonics, arpeggios, licks, chord
  shapes and fretboard diagrams), **Practice** (ear training and sight reading), and
  **Forms** (song structures as proportional timelines).
