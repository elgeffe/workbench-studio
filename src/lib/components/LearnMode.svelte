<script lang="ts">
  // The teaching half of the studio. Everything the tool tabs used to explain
  // in a trailing paragraph lives behind one of these six subtabs, and every
  // lesson uses the studio's own controls rather than describing them — the
  // chords place themselves into your progression, the demos play through the
  // real kit, the drills light the real fretboards.
  import { useStore } from '../context';
  import TheoryLesson from './learn/TheoryLesson.svelte';
  import RhythmLesson from './learn/RhythmLesson.svelte';
  import BassLesson from './learn/BassLesson.svelte';
  import PatternsLesson from './learn/PatternsLesson.svelte';
  import PracticeLesson from './learn/PracticeLesson.svelte';
  import FormsLesson from './learn/FormsLesson.svelte';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div class="eyebrow" style="margin-bottom:4px">Learn · {v.learnSubject}</div>

  <div data-testid="learn-tabs" style="display:flex;gap:7px;margin-bottom:13px;overflow-x:auto;padding-bottom:3px">
    {#each v.learnTabs as tb (tb.id)}
      <div class="mono click" style="font-size:10px;letter-spacing:.08em;padding:9px 14px;border-radius:7px;border:1.5px solid {tb.border};background:{tb.bg};color:{tb.fg};white-space:nowrap" role="tab" tabindex="0" aria-label={tb.id} aria-selected={store.learnTab === tb.id} onclick={() => store.setLearnTab(tb.id)} onkeydown={(e) => e.key === 'Enter' && store.setLearnTab(tb.id)}>{tb.name}</div>
    {/each}
  </div>

  {#if v.learnTabRhythm}
    <RhythmLesson />
  {:else if v.learnTabBass}
    <BassLesson />
  {:else if v.learnTabPatterns}
    <PatternsLesson />
  {:else if v.learnTabPractice}
    <PracticeLesson />
  {:else if v.learnTabForms}
    <FormsLesson />
  {:else}
    <TheoryLesson />
  {/if}
</div>
