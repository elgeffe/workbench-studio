<script lang="ts">
  import { provideStore } from './lib/context';
  import Header from './lib/components/Header.svelte';
  import ScaleStrip from './lib/components/ScaleStrip.svelte';
  import Instruments from './lib/components/Instruments.svelte';
  import CircleMode from './lib/components/CircleMode.svelte';
  import WorkshopMode from './lib/components/WorkshopMode.svelte';
  import EarMode from './lib/components/EarMode.svelte';
  import PatternsMode from './lib/components/PatternsMode.svelte';
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
    if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || store.mode !== 'workshop' || isTyping(e.target)) return;
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
        {:else if v.isWorkshop}
          <WorkshopMode />
        {:else if v.isEar}
          <EarMode />
        {:else if v.isPatterns}
          <PatternsMode />
        {:else if v.isJazz}
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
<div class="wb-dockbar">
  {#if v.dockExpanded}
    <div style="background:linear-gradient(#efe3ca,#e9dcc0);border-top:1px solid #cbb792;box-shadow:0 -12px 30px -14px rgba(60,40,16,.4);max-height:52vh;overflow-y:auto;padding:14px 14px 10px">
      <Instruments variant="dock" />
    </div>
  {/if}
  <div
    class="click" data-testid="dock-bar"
    style="display:flex;align-items:center;gap:10px;background:linear-gradient(#3a2c1d,#2c2014);color:#f1e7d3;padding:10px 16px;border-top:2px solid #c2562e"
    role="button" tabindex="0"
    onclick={() => store.toggleDock()}
    onkeydown={(e) => e.key === 'Enter' && store.toggleDock()}
  >
    <span class="mono" style="font-size:8px;letter-spacing:.16em;color:#d8a86f;flex:none">SOUNDING</span>
    <span style="font-size:17px;font-weight:700;line-height:1;white-space:nowrap">{v.dockName}</span>
    <span class="mono" style="font-size:9px;color:#cba47a;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{v.dockNotes}</span>
    <span class="mono" style="font-size:11px;color:#d8a86f;flex:none">{v.dockChevron}</span>
  </div>
  <div data-testid="mobile-tabs" style="display:flex;background:#241a10;padding:6px 4px calc(6px + env(safe-area-inset-bottom))">
    {#each v.mtabs as tb (tb.id)}
      <div
        class="click"
        style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 0 6px;border-radius:8px;background:{tb.bg}"
        role="tab" tabindex="0" aria-label={tb.id} aria-selected={store.mode === tb.id}
        onclick={() => store.setMode(tb.id)}
        onkeydown={(e) => e.key === 'Enter' && store.setMode(tb.id)}
      >
        <span style="font-size:17px;line-height:1;color:{tb.fg}">{tb.icon}</span>
        <span class="mono" style="font-size:8px;letter-spacing:.08em;color:{tb.fg}">{tb.label}</span>
      </div>
    {/each}
  </div>
</div>
{/if}
