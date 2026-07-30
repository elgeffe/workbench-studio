<script lang="ts">
  // The two drills, behind one segmented control. They were separate tabs; they
  // share a shape — a prompt, an answer surface, a score and a streak — so they
  // read better as two halves of "practice" than as two of eight destinations.
  import { useStore } from '../../context';
  import EarMode from '../EarMode.svelte';
  import ReadingMode from '../ReadingMode.svelte';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div data-testid="practice-drills" style="display:flex;gap:7px;margin-bottom:16px;flex-wrap:wrap">
  {#each v.drillChips as d (d.id)}
    <div class="mono click" style="font-size:10px;letter-spacing:.08em;padding:9px 15px;border-radius:7px;border:1.5px solid {d.border};background:{d.bg};color:{d.fg};white-space:nowrap" role="tab" tabindex="0" aria-label={d.id} aria-selected={store.practiceDrill === d.id} onclick={() => store.setPracticeDrill(d.id)} onkeydown={(e) => e.key === 'Enter' && store.setPracticeDrill(d.id)}>{d.name}</div>
  {/each}
</div>

{#if v.drillEar}
  <EarMode />
{:else}
  <ReadingMode />
{/if}
