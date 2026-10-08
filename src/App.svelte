<script lang="ts">
  import { provideStore } from './lib/context';
  import StudioBar from './lib/components/StudioBar.svelte';
  import Instruments from './lib/components/Instruments.svelte';
  import Mixer from './lib/components/Mixer.svelte';
  import CircleMode from './lib/components/CircleMode.svelte';
  import DrumsMode from './lib/components/DrumsMode.svelte';
  import ChordsMode from './lib/components/ChordsMode.svelte';
  import BassMode from './lib/components/BassMode.svelte';
  import MetronomeMode from './lib/components/MetronomeMode.svelte';
  import LearnMode from './lib/components/LearnMode.svelte';
  import CommandPalette from './lib/components/CommandPalette.svelte';
  import Timeline from './lib/components/Timeline.svelte';
  import MidiPanel from './lib/components/MidiPanel.svelte';

  const store = provideStore();

  // The instrument panel can be folded away so the editor takes the full width.
  // The choice is a per-viewer convenience, so storage failures are ignored.
  const SIDE_KEY = 'wb.sideOpen';
  function readSide(): boolean {
    try { return localStorage.getItem(SIDE_KEY) !== '0'; } catch { return true; }
  }
  let overlay = $state<'palette' | 'help' | null>(null);
  let sideOpen = $state(readSide());
  function toggleSide() {
    sideOpen = !sideOpen;
    try { localStorage.setItem(SIDE_KEY, sideOpen ? '1' : '0'); } catch { /* private mode */ }
  }
  const v = $derived(store.view);
  // Tabs whose part is sounding right now, so you can tell from any tab what is running.
  const playingTab = $derived<Record<string, boolean>>({
    drums: store.drPlaying,
    chords: store.jzPlaying,
    bass: store.jzPlaying && store.bassLine.some((c) => c),
    metronome: store.met.isPlaying,
  });

  // Resolve the layout before first paint so only one instrument panel mounts.
  if (typeof window !== 'undefined') {
    store.isDesktop = window.matchMedia('(min-width: 981px)').matches;
  }

  // A S D F G H J = the seven diatonic chords in order, K = the tonic octave up.
  // Hold to sustain; a new key releases the previous one (monophonic).
  const CHORD_KEYS: Record<string, number> = { a: 0, s: 1, d: 2, f: 3, g: 4, h: 5, j: 6, k: 7 };
  function isTyping(t: EventTarget | null): boolean {
    const el = t as HTMLElement | null;
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
  }
  function onKeyDown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && store.isDesktop) {
      e.preventDefault();
      overlay = overlay === 'palette' ? null : 'palette';
      return;
    }
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !isTyping(e.target)) {
      const k = e.key.toLowerCase();
      if (k === 'z') { e.preventDefault(); if (e.shiftKey) store.redo(); else store.undo(); return; }
      if (k === 'y') { e.preventDefault(); store.redo(); return; }
    }
    if (overlay) return; // the overlay owns the keyboard while it is open
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    // Space drives the transport — the practice click while its own tab is
    // open, the studio's one clock everywhere else.
    if (e.code === 'Space') {
      e.preventDefault();
      if (store.mode === 'metronome') store.met.toggle();
      else store.togglePlay();
      return;
    }
    if (store.isDesktop) {
      if (e.key === '?') { overlay = 'help'; return; }
      const tab = /^[1-6]$/.test(e.key) ? v.tabs[+e.key - 1] : undefined;
      if (tab) { store.setMode(tab.id); return; }
    }
    if (store.mode !== 'chords') return;
    const deg = CHORD_KEYS[e.key.toLowerCase()];
    if (deg !== undefined) store.kbHold(deg);
  }
  function onKeyUp(e: KeyboardEvent) {
    const deg = CHORD_KEYS[e.key.toLowerCase()];
    if (deg !== undefined) store.kbRelease(deg);
  }

  $effect(() => {
    const mq = window.matchMedia('(min-width: 981px)');
    const update = () => (store.isDesktop = mq.matches);
    update();
    mq.addEventListener('change', update);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      store.destroy();
    };
  });
</script>

<div class="wb-app">
  <div class="wb-shell">
    <StudioBar />

    <!-- desktop mode tabs -->
    {#if store.isDesktop}
      <div data-testid="desktop-tabs" class="wb-tabs" style="display:flex;align-items:center;gap:0;background:#e7d9bf;border-bottom:1px solid #d3c1a1;padding:0 14px;overflow-x:auto">
        {#each v.tabs as tb (tb.id)}
          <div
            class="mono click"
            style="padding:13px 20px 11px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{tb.fg};border-bottom:3px solid {tb.bd};white-space:nowrap"
            role="tab" tabindex="0" aria-label={tb.id} aria-selected={store.mode === tb.id}
            onclick={() => store.setMode(tb.id)}
            onkeydown={(e) => e.key === 'Enter' && store.setMode(tb.id)}
          >{tb.label}{#if playingTab[tb.id]}<span class="wb-tab-live" title="playing" aria-label="playing"></span>{/if}</div>
        {/each}
        <span style="flex:1 1 auto"></span>
        <button class="mono wb-undo" data-testid="undo" aria-label="undo" title="Undo (Ctrl/⌘ Z)" disabled={!store.canUndo} onclick={() => store.undo()}>↶</button>
        <button class="mono wb-undo" data-testid="redo" aria-label="redo" title="Redo (Shift+Ctrl/⌘ Z)" disabled={!store.canRedo} onclick={() => store.redo()}>↷</button>
        <button class="mono wb-undo" aria-label="keyboard shortcuts and command palette" title="Shortcuts (?) · Command palette (Ctrl/⌘ K)" onclick={() => (overlay = 'help')}>?</button>
      </div>
    {/if}

    {#if store.isDesktop && (store.mode === 'drums' || store.mode === 'bass' || store.mode === 'circle')}
      <Timeline />
    {/if}

    <div class="wb-body">
      <div class="wb-content">
        {#if v.isCircle}
          <CircleMode />
        {:else if v.isDrums}
          <DrumsMode />
        {:else if v.isChords}
          <ChordsMode />
        {:else if v.isBass}
          <BassMode />
        {:else if v.isMetronome}
          <MetronomeMode />
        {:else if v.isLearn}
          <LearnMode />
        {/if}
      </div>

      <!-- desktop instrument panel -->
      {#if store.isDesktop && sideOpen}
        <div class="wb-side">
          <div class="wb-side-inner">
            <button class="mono wb-side-fold" data-testid="side-fold" aria-label="hide instruments" title="Hide instruments" onclick={toggleSide}>HIDE ›</button>
            <!-- Fretboards only teach where something is lit; on Drums and
                 Metronome they sit dark, so the panel shrinks to the keyboard
                 until a chord or the drone gives them a scale to show. -->
            <Instruments variant="side" lite={(store.mode === 'drums' || store.mode === 'metronome') && v.dockName === '—'} />
          </div>
        </div>
      {:else if store.isDesktop}
        <button class="mono wb-side-open" data-testid="side-open" aria-label="show instruments" title="Show instruments" onclick={toggleSide}>‹ INSTRUMENTS</button>
      {/if}
    </div>
  </div>
</div>

{#if overlay}
  <CommandPalette mode={overlay} onClose={() => (overlay = null)} onToggleSide={toggleSide} />
{/if}

<!-- MIDI out settings, desktop only — see MidiPanel.svelte -->
{#if store.isDesktop}
  <MidiPanel />
{/if}

<!-- mobile fixed dock + tab bar -->
{#if !store.isDesktop}
<!-- Sizes, safe-area padding and the landscape one-row layout all live in
     app.css so a media query can reach them. -->
<div class="wb-dockbar">
  {#if v.dockExpanded}
    <div class="wb-dock-panel" data-testid="dock-panel">
      <!-- The tempo slider and the mixer need room a 44px bar hasn't got, so
           they ride in the panel; the bar keeps the readout and the play
           button. -->
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:10px">
        <span class="mono" style="flex:none;font-size:8px;letter-spacing:.12em;color:#8a7350">TEMPO</span>
        <input type="range" min="50" max="180" value={v.tempo} aria-label="studio tempo" oninput={(e) => store.setTempo(+e.currentTarget.value)} style="flex:1" />
        <span class="mono" style="flex:none;font-size:12px;font-weight:700;color:#2c261d;width:30px;text-align:right">{v.tempo}</span>
      </div>
      <div class="wb-dock-mixer"><Mixer compact /></div>
      <Instruments variant="dock" />
    </div>
  {/if}
  <div class="wb-dock-rows">
    <div
      class="click wb-dock-bar" data-testid="dock-bar"
      role="button" tabindex="0"
      onclick={() => store.toggleDock()}
      onkeydown={(e) => e.key === 'Enter' && store.toggleDock()}
    >
      <!-- The play button lives inside the bar but is not part of its tap
           target: hitting PLAY must not also expand the dock. -->
      <span
        class="mono click wb-dock-play" data-testid="studio-play" role="button" tabindex="0" aria-label="play"
        style="background:{v.jzPlayBg};box-shadow:0 3px 0 {v.jzPlayShadow}"
        onclick={(e) => { e.stopPropagation(); store.togglePlay(); }}
        onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); store.togglePlay(); } }}
      >{v.transportGlyph}</span>
      <span class="wb-dock-bpm">
        <span class="mono wb-dock-bpm-num" data-testid="studio-bpm">{v.tempo}</span>
        <span class="mono wb-dock-bpm-unit">BPM</span>
      </span>
      <span class="wb-dock-name">{v.dockName}</span>
      <span class="mono wb-dock-notes">{v.dockNotes}</span>
      <span class="mono wb-dock-chev">{v.dockChevron}</span>
    </div>
    <div class="wb-mtabs" data-testid="mobile-tabs">
      {#each v.mtabs as tb (tb.id)}
        <div
          class="click wb-mtab" style="background:{tb.bg}"
          role="tab" tabindex="0" aria-label={tb.id} aria-selected={store.mode === tb.id}
          onclick={() => store.setMode(tb.id)}
          onkeydown={(e) => e.key === 'Enter' && store.setMode(tb.id)}
        >
          <span class="wb-mtab-icon" style="color:{tb.fg}">{tb.icon}</span>
          <span class="mono wb-mtab-label" style="color:{tb.fg}">{tb.label}</span>
        </div>
      {/each}
    </div>
  </div>
</div>
{/if}
