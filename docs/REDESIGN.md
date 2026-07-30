# Workbench Studio — groovebox redesign

The app began as a circle-of-fifths and chord explorer. It has grown into something
closer to a groovebox: the fastest way to pick a pattern, a progression and a bassline
and hear them lock together. This document restructures the app around that reality —
**tool tabs apply the theory, the Learn tab teaches it** — and redesigns the top chrome
to serve a groovebox on desktop and on a phone.

Status: agreed direction, not yet implemented. See [Phasing](#7-phasing).

---

## 1. Tab structure

```
⟳ CIRCLE   ◉ DRUMS   ▦ CHORDS   ♪ BASS   ◳ METRO   ♭ LEARN
```

`Mode` becomes `'circle' | 'drums' | 'chords' | 'bass' | 'metronome' | 'learn'`.

Six tabs at 390px leave ~65px each, so the `≤430px` label-shrink rule in `app.css` and
the icon-only landscape fallback are no longer needed.

Mapping from the current eight:

| Today | Becomes |
|---|---|
| `circle` | **Circle** (tab 1), gains the scale selector |
| `workshop` | splits into **Chords** (tab 3) and **Bass** (tab 4) |
| `drums` | **Drums** (tab 2) |
| `metronome` | **Metronome** (tab 5) |
| `ear` | Learn → Practice |
| `reading` | Learn → Practice |
| `patterns` | Learn → Patterns |
| `jazz` | **Learn** (tab 6) |

---

## 2. The top chrome

### The problem

Current chrome is ~166px on desktop — header (60) + tab row (40) + `ScaleStrip` (66) —
and it holds the wrong controls:

- **Two key pickers, stacked.** The header's `◀ C ▶` stepper and the ScaleStrip's twelve
  key chips do the same job, 20px apart.
- **The globals are inverted.** KEY / SCALE / EXT are permanent but mean nothing in Drums
  or Metronome. PLAY and BPM — one shared transport, one clock — are duplicated *inside*
  `DrumsMode` and `WorkshopMode`, so on a phone you cannot start the loop while editing a
  bassline.
- **Brand costs 36px of mark plus two lines of text** on a 390pt phone, where the user
  already knows which app they opened.

### Desktop — studio bar + tab row (~96px, down from ~166px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ◉ Workbench Studio │ ▶ PLAY │ 104 BPM ▲▼ │ C major ♮ ▾ │ ◉D ◉C ◉B │ ♪    │
├──────────────────────────────────────────────────────────────────────────────┤
│  ⟳ Circle   ◉ Drums   ▦ Chords   ♪ Bass   ◳ Metronome   ♭ Learn             │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Mobile — thin top bar, transport in the bottom dock

```
┌────────────────────────────────┐
│ ◉ Workbench Studio  C maj ▾  ♪ │   52px, single row
├────────────────────────────────┤
│                                │
│          tab content           │
│                                │
├────────────────────────────────┤
│ ▶ │104│ Cmaj7  C·E·G·B │DCB│ ▲ │   44px — transport + sounding + parts
├────────────────────────────────┤
│  ⟳    ◉    ▦    ♪    ◳    ♭   │   6 tabs
└────────────────────────────────┘
```

The existing `SOUNDING` dock bar already spans the width directly above the tabs, so
folding the transport into it costs no new chrome and puts PLAY under the thumb on every
tab. `▲` still expands the instrument dock. `104` opens a tempo sheet (slider, tap tempo,
±), which lets the per-tab tempo sliders in Drums and Chords be deleted. Landscape reuses
the existing side-by-side row, keeping bottom chrome at ~50px.

### Key and scale

`ScaleStrip` is deleted, and its contents relocate rather than disappear:

- a **key button** in the chrome (`C major ♮`) opens a popover on desktop / sheet on
  mobile, holding the twelve key chips, the four primary scales and the five modes;
- an **inline scale row inside the Circle tab**, because choosing keys and scales is what
  that tab is for. The `scaleCaption` character line goes with it.

The **EXT** cluster leaves the chrome for the two surfaces where it means something: the
Circle's diatonic grid (which already carries its own EXT control) and the chord
inspector. Its teaching caption (`extCaption`) moves to Learn.

### Guiding rules

- **Copy density.** Tool tabs get labels, values and at most a one-line hint. Anything
  longer belongs in Learn, reached by a `?` on the surface it explains.
- **Shared parts, two altitudes.** Learn embeds the *real* widgets, not copies of them.
  Extract `ProgressionStrip`, `ChordPalette`, `ChordInspector`, `DrumGrid`, `BassGrid`
  into `components/parts/`; tool tabs render them bare, Learn renders them wrapped in
  teaching copy.
- **Frequency decides real estate.** You set the key once a session and press play a
  hundred times.

---

## 3. Tab by tab

### Circle

Unchanged in substance; gains the scale selector. Keeps its notes readout, `acWhy` and
substitution cards — this is the exploration tab, so short in-place explanation belongs
here. Only the long EXT pedagogy paragraph leaves.

### Drums

Grid, genre picker, LAYERS chips, add/remove rows, swing. Transport moves to the chrome.

**Keeps** the LAYERS stepper: peeling a groove apart one part at a time is a construction
tool, not a lesson. **Loses** the "how it's built" section, the layer-why callout, the
IN THE BOX programming note and the closing pointer paragraph (`DrumsMode.svelte:96-120`)
to Learn → Rhythm.

### Chords

Progression strip (drag-to-reorder unchanged), diatonic and colour/borrowed palettes, and
a **lean inspector** for the selected chord: extensions, inversions, `+V before`,
`+ii–V before`, substitutions — no prose, no mode gating.

Today inversions are hidden unless `wsStyle === 'classical'` and ii–V insertion unless
`wsStyle === 'jazz'`. Dropping `wsStyle` makes the inspector strictly more capable and
simpler at once. VOICING and ½BAR/1BAR stay: they are per-progression settings, not
teaching material.

### Bass

Promoted out of `Workshop → BASS`, where it sat two levels down. Groove picker, the
16-step pattern cards, the build-your-own grid, MIX. Shows the current progression as a
read-only chip row with a jump to Chords, since the line resolves its degrees against
those changes. Explanatory paragraphs and the role legend move to Learn → Bass.

### Metronome

Untouched. Keeps its own engine and its own clock. Space still drives the click while
this tab is open; everywhere else Space drives the global transport.

### Learn

A subtab chip row, extending the pattern `LearnMode` already uses:

| Subtab | Content |
|---|---|
| **Theory** | five-chapter jazz curriculum, the jazz and classical palettes (secondary dominants, borrowed chords, cadences, figured-bass inversions), the inspector wrapped in teaching copy, the EXT explanation |
| **Rhythm** | `RHYTHM_CONCEPTS` cards, how patterns are layered, the "in the box" programming notes |
| **Bass** | `BASS_TRICKS` demos, the role legend, how a 16-step line resolves through changes |
| **Patterns** | today's whole `PatternsMode` — library, chord shapes, fret diagrams |
| **Practice** | Ear and Reading behind one `[EAR │ READING]` segmented control |
| **Forms** | `SONG_FORMS` timelines |

`LearnTab` becomes `'theory' | 'rhythm' | 'bass' | 'patterns' | 'practice' | 'forms'`,
plus a `practiceDrill: 'ear' | 'reading'`.

---

## 4. Part mixer

Three part flags plus solo in the chrome (`◉D ◉C ◉B`), replacing the tab-local MIX
buttons:

```ts
partOn   = $state({ drums: true, chords: true, bass: true });
soloPart = $state<Part | null>(null);
audible(p: Part) { return this.soloPart ? this.soloPart === p : this.partOn[p]; }
```

Gated in `drTick`, `jTick` and `barBass` — **audio only**. `jzPlaying` / `drPlaying` keep
meaning "this part has content", so muting never stops the clock.

This also frees the bassline from `wsStyle === 'bass'` (`store.svelte.ts:581`). Once Bass
is its own tab, a loaded line has to sound from wherever you are.

---

## 5. Style seeds everything

`engine/genres.ts` already shelves drums, basslines and progressions off one 31-genre
taxonomy, so loading a whole style is nearly free. Rather than adding a seventh chrome
cluster, it lives inside the picker you are already in — one row above the genre shelf:

```
⟳  LOAD DISCO INTO DRUMS · CHORDS · BASS
```

One optional `onLoadAll` prop on `GenrePicker`, one `store.setStyle(genreId)` chaining the
three existing setters. The same affordance appears in all three tabs' pickers, and it
doubles as the empty state ("Start from a style →").

---

## 6. Rename

**Workbench Studio**, with the "Ear & Theory" sublabel dropped:

- `index.html` — `<title>`
- `vite.config.ts` — PWA manifest `name` and `short_name`
- `src/lib/components/Header.svelte` — wordmark, eyebrow removed
- `README.md` — H1, intro, Modes section
- `package.json` — `description`
- `scripts/make-icons.mjs` — `<title>`
- `docs/IMPROVEMENTS.md` — H1
- six e2e specs asserting `getByText('The Workbench')`

Internal names (`WorkbenchStore`, the `.wb-*` class prefix) stay as they are.

---

## 7. Phasing

| # | Work | Risk |
|---|---|---|
| 0 | Rename and strings | none |
| 1 | Six-tab shell; split `WorkshopMode` into `ChordsMode` + `BassMode`; `LearnMode` absorbs ear / reading / patterns / jazz / classical. Pure relocation. | low, wide |
| 2 | Studio bar and transport; key popover; delete `ScaleStrip`; mobile transport bar; drop per-tab tempo sliders | medium |
| 3 | Part mixer and transport gating | **highest** |
| 4 | Style-seeds-all | low |
| 5 | Copy migration, prose trim, README | low |
| 6 | e2e and unit updates; `check` / `test` / `test:e2e` | — |

### Sharp edges

- `view/index.ts` returns one flat object every component reads. The mode flags and both
  tab arrays change shape at once — mechanical, but the widest diff in the change.
- Phase 3 is the only place timing can break. `e2e/transport-timing.spec.ts` and
  `e2e/drum-playhead.spec.ts` are the guards.
- Three `store.mode === …` checks move: the A-S-D-F chord keys (`App.svelte:38` →
  `'chords'`) and two sight-reading checks (`store.svelte.ts:907,942` → `learn` +
  `practice` + `reading`). The latter get a derived helper rather than a three-term
  conditional at each site.
- `litInfo`'s `s.mode === 'patterns'` scale-lighting branch (`view/index.ts:26`) follows
  Patterns into Learn.
- `workshop-reorder.spec.ts` and `workshop-timing.spec.ts` are renamed with the tab.
- Tab-bar icons are currently font glyphs. `EarMode` already had to hand-draw a `▶` in
  SVG because iOS renders the glyph as a colour emoji; the same trap waits for any note
  or clef glyph in the tab bar. Inline SVG icons are the safer choice.

---

## 8. Open questions

**Patterns under Learn is the weakest fit.** The pattern library and fret diagrams are
reference you want *while* playing, not a lesson you read once. It works as a Learn
subtab; if it starts to feel buried, the honest fix is a seventh tab, not deeper nesting.

**Space is slightly ambiguous** once the transport is global — the groovebox everywhere,
the click on the Metronome tab. That is the least surprising split available, but it is
a split.
