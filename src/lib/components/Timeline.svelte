<script lang="ts">
  // The song at a glance: the progression as a row of bars with the playhead
  // on whichever one is sounding, plus the drum groove and bassline riding
  // under it. Drums, Bass and Circle edit one part of the band at a time and
  // none of them showed where in the changes you were; this is that position.
  // Click a bar to jump the loop there (or, stopped, to select it).
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

{#if v.jzChangesView.length}
  <div class="wb-timeline" data-testid="timeline">
    <div class="mono wb-tl-meta">
      <span title="drum groove">◉ {v.drTplName}</span>
      <span title="bassline">♪ {v.bassLineName}</span>
    </div>
    <div class="wb-tl-bars">
      {#each v.jzChangesView as c, i (i)}
        {@const on = store.jzPlaying && store.jzStep === i}
        <div
          class="click wb-tl-bar" class:on class:rest={c.rest}
          data-testid="timeline-bar" role="button" tabindex="0"
          aria-label="{c.name} — {store.jzPlaying ? 'jump here' : 'select'}"
          style="--fn:{c.fnColor}"
          onclick={() => store.seekChord(i)}
          onkeydown={(e) => e.key === 'Enter' && store.seekChord(i)}
        >
          <span class="mono wb-tl-roman">{c.roman}</span>
          <span class="wb-tl-name">{c.rest ? '𝄽' : c.name}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .wb-timeline {
    display: flex; align-items: stretch; gap: 14px;
    padding: 9px clamp(24px, 1.6vw, 44px);
    background: #efe3ca; border-bottom: 1px solid var(--line);
  }
  .wb-tl-meta {
    flex: none; display: flex; flex-direction: column; justify-content: center; gap: 3px;
    font-size: 10px; letter-spacing: .06em; color: #7a6b50; max-width: 220px;
  }
  .wb-tl-meta span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .wb-tl-bars { flex: 1 1 0; min-width: 0; display: flex; gap: 4px; overflow-x: auto; }
  .wb-tl-bar {
    flex: 1 0 64px; max-width: 200px; display: flex; flex-direction: column; align-items: center; gap: 1px;
    padding: 5px 6px 6px; border-radius: 6px; background: #f6efe0;
    border: 1px solid var(--line2); border-top: 4px solid var(--fn);
    transition: background .08s, box-shadow .08s;
  }
  .wb-tl-bar.rest { border-style: dashed; opacity: .75; }
  .wb-tl-bar.on { background: #fbeede; box-shadow: 0 0 0 2px var(--fn); }
  .wb-tl-roman { font-size: 10px; color: var(--fn); }
  .wb-tl-name { font-size: 16px; font-weight: 700; line-height: 1.1; white-space: nowrap; }
</style>
