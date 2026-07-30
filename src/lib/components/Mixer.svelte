<script lang="ts">
  // One strip per part of the band. The name toggles mute; the S solos.
  //
  // It has to be chrome rather than a tab control: three parts now live on
  // three different tabs, so wherever the mixer sat you would be muting one
  // thing while looking at another. It replaces the two toggles that used to be
  // buried in the bass palette, which could only mute chords and bass and only
  // from that one screen.
  //
  // Muting gates audio only — the transport still schedules every part, so the
  // playhead keeps sweeping a muted grid and the loop never falls out of sync.
  import { useStore } from '../context';

  let { compact = false }: { compact?: boolean } = $props();
  const store = useStore();
  const v = $derived(store.view);
</script>

<div class="wb-mixer" data-testid="mixer" class:wb-mixer-compact={compact}>
  {#each v.mixer as p (p.id)}
    <div class="wb-mixstrip" style="background:{p.bg};border-color:{p.border}">
      <span
        class="mono click wb-mixname" data-testid="mix-{p.id}" role="button" tabindex="0"
        aria-label="{p.label} — {p.on ? 'audible' : 'muted'}" aria-pressed={p.on}
        style="color:{p.fg}"
        onclick={() => store.togglePart(p.id)}
        onkeydown={(e) => e.key === 'Enter' && store.togglePart(p.id)}
      >{p.label}</span>
      <span
        class="mono click wb-mixsolo" data-testid="solo-{p.id}" role="button" tabindex="0"
        aria-label="solo {p.label}" aria-pressed={p.solo}
        style="color:{p.soloFg};border-color:{p.solo ? '#fff' : 'rgba(216,168,111,.3)'}"
        onclick={() => store.toggleSolo(p.id)}
        onkeydown={(e) => e.key === 'Enter' && store.toggleSolo(p.id)}
      >S</span>
    </div>
  {/each}
</div>
