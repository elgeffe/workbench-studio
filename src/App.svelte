<script lang="ts">
  import { provideStore } from './lib/context';
  import Header from './lib/components/Header.svelte';
  import ScaleStrip from './lib/components/ScaleStrip.svelte';
  import Instruments from './lib/components/Instruments.svelte';
  import CircleMode from './lib/components/CircleMode.svelte';
  import DrumsMode from './lib/components/DrumsMode.svelte';
  import ChordsMode from './lib/components/ChordsMode.svelte';
  import BassMode from './lib/components/BassMode.svelte';
  import MetronomeMode from './lib/components/MetronomeMode.svelte';
  import LearnMode from './lib/components/LearnMode.svelte';

  const store = provideStore();
  const v = $derived(store.view);

  // Resolve the layout before first paint so only one instrument panel mounts.
  if (typeof window !== 'undefined') {
    store.isDesktop = window.matchMedia('(min-width: 981px)').matches;
  }

  // A S D F G H J = the seven diatonic chords in order, K = the tonic octave up.
  // Hold to sustain; a new key releases the previous one (monophonic).
  const CHORD_KEYS: Record<string, number> = { a: 0, s: 1, d: 2, f: 3, g: 4, h: 5, j: 6, k: 7 };
  function isTyping(t: EventTarget | null): boolean {
    const el = t as HTMLElement | null;
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }
  function onKeyDown(e: KeyboardEvent) {
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    // Space starts/stops the practice metronome while its tab is open.
    if (e.code === 'Space' && store.mode === 'metronome') {
      e.preventDefault();
      store.met.toggle();
      return;
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
    <Header />

    <!-- desktop mode tabs -->
    {#if store.isDesktop}
      <div data-testid="desktop-tabs" style="display:flex;gap:0;background:#e7d9bf;border-bottom:1px solid #d3c1a1;padding:0 14px;overflow-x:auto">
        {#each v.tabs as tb (tb.id)}
          <div
            class="mono click"
            style="padding:13px 20px 11px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:{tb.fg};border-bottom:3px solid {tb.bd};white-space:nowrap"
            role="tab" tabindex="0" aria-label={tb.id} aria-selected={store.mode === tb.id}
            onclick={() => store.setMode(tb.id)}
            onkeydown={(e) => e.key === 'Enter' && store.setMode(tb.id)}
          >{tb.label}</div>
        {/each}
      </div>
    {/if}

    <ScaleStrip />

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
      {#if store.isDesktop}
        <div class="wb-side">
          <Instruments variant="side" />
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- mobile fixed dock + tab bar -->
{#if !store.isDesktop}
<!-- Sizes, safe-area padding and the landscape one-row layout all live in
     app.css so a media query can reach them. -->
<div class="wb-dockbar">
  {#if v.dockExpanded}
    <div class="wb-dock-panel" data-testid="dock-panel">
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
      <span class="mono wb-dock-eyebrow">SOUNDING</span>
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
