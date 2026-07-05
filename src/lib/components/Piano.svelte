<script lang="ts">
  import { useStore } from '../context';
  import type { PianoKey } from '../store.svelte';

  let { white, black, height = 96 }: { white: PianoKey[]; black: PianoKey[]; height?: number } = $props();
  const store = useStore();
</script>

<div class="mono" style="font-size:9px;letter-spacing:.14em;color:#9c8460;margin-bottom:5px">PIANO · C3–C5</div>
<div class="piano" style="height:{height}px">
  <div style="position:relative;height:100%;width:100%">
    {#each white as k, i (i)}
      <div
        class="pkey-white" role="button" tabindex="-1"
        style="left:{k.left}%;width:{k.width}%;background:{k.bg};color:{k.fg}"
        onclick={() => store.selectNote(k.pc)}
        onkeydown={(e) => e.key === 'Enter' && store.selectNote(k.pc)}
      >{k.note}
        {#if k.dot}
          <div class="pkey-dot" style="bottom:15px;width:16px;height:16px;font-size:9px;background:{k.dotColor}">{k.finger}</div>
        {/if}
      </div>
    {/each}
    {#each black as k, i (i)}
      <div
        class="pkey-black" role="button" tabindex="-1"
        style="left:{k.left}%;width:{k.width}%;background:{k.bg};color:{k.fg}"
        onclick={() => store.selectNote(k.pc)}
        onkeydown={(e) => e.key === 'Enter' && store.selectNote(k.pc)}
      >{k.note}
        {#if k.dot}
          <div class="pkey-dot" style="bottom:8px;width:14px;height:14px;font-size:8px;background:{k.dotColor};border-width:1.5px;z-index:5">{k.finger}</div>
        {/if}
      </div>
    {/each}
  </div>
</div>
