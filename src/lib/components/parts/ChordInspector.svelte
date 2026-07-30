<script lang="ts">
  // Everything you can do to the chord you have selected: recolour it, invert
  // it, lead into it, or swap it for something that does the same job.
  //
  // Used twice, at two altitudes. The Chords tab renders it bare — the moves
  // are simply there. Learn renders it with `teaching`, which adds the line
  // explaining what the row is for. Same component, so a move learned in one
  // place is the same control in the other.
  import { useStore } from '../../context';

  let { teaching = false }: { teaching?: boolean } = $props();
  const store = useStore();
  const v = $derived(store.view);
</script>

{#if v.exploreOpen}
  <div style="background:#f3ead4;border:1px solid #e0cfae;border-radius:10px;padding:14px 15px;margin-bottom:16px">
    <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:11px;flex-wrap:wrap">
      <span class="mono" style="font-size:9px;letter-spacing:.12em;color:#8a7350">EDITING</span>
      <span style="font-size:21px;font-weight:700;color:#2c261d;line-height:1">{v.selName}</span>
      <span class="mono" style="font-size:10px;color:#7a6b50">{v.selRoman}</span>
    </div>

    <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350;margin-bottom:7px">COLOUR · change in place</div>
    {#if teaching}
      <div class="caption" style="font-size:13px;color:#5c4a30;margin-bottom:8px;max-width:520px">Stack another third on top and the chord keeps its job but changes its mood — the 7th adds motion, the 9th and 13th add air. The chord's function doesn't move; only its colour does.</div>
    {/if}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
      {#each v.extChips as e, i (i)}
        <div class="serif click" style="font-size:15px;font-weight:600;padding:6px 13px;border-radius:14px;border:1.5px solid #cbb792;background:#fff;color:#2c261d" role="button" tabindex="0" onclick={() => store.replaceSel(e.ch)} onkeydown={(ev) => ev.key === 'Enter' && store.replaceSel(e.ch)}>{e.label}</div>
      {/each}
      <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:8px 13px;border-radius:14px;border:1.5px solid #3f6b5f;background:#e7efec;color:#2c4f45" role="button" tabindex="0" onclick={() => store.insertIIV()} onkeydown={(e) => e.key === 'Enter' && store.insertIIV()}>+ ii–V before</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:8px 13px;border-radius:14px;border:1.5px solid #3f6b5f;background:#e7efec;color:#2c4f45" role="button" tabindex="0" onclick={() => store.insertV()} onkeydown={(e) => e.key === 'Enter' && store.insertV()}>+ V before</div>
    </div>

    <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350;margin-bottom:7px">INVERSION · which note in the bass</div>
    {#if teaching}
      <div class="caption" style="font-size:13px;color:#5c4a30;margin-bottom:8px;max-width:520px">Put the 3rd in the bass and you get the figured-bass <b>6</b>; the 5th gives you <b>6/4</b>. The chord is unchanged — but the bass now steps rather than leaps, which is the whole of voice leading.</div>
    {/if}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
      {#each v.invChips as e, i (i)}
        <div class="mono click" style="font-size:11px;padding:7px 13px;border-radius:14px;border:1.5px solid #b07d23;background:#f5ecd8;color:#5c4a30" role="button" tabindex="0" onclick={() => store.replaceSel(e.ch)} onkeydown={(ev) => ev.key === 'Enter' && store.replaceSel(e.ch)}>{e.label}</div>
      {/each}
    </div>

    <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350;margin-bottom:7px">SUBSTITUTE · swap this chord for…</div>
    {#if teaching}
      <div class="caption" style="font-size:13px;color:#5c4a30;margin-bottom:8px;max-width:520px">Two chords sharing most of their notes can stand in for each other. That is all a substitution is — the tag on each card says which relationship is doing the work.</div>
    {/if}
    <div style="display:flex;flex-wrap:wrap;gap:8px">
      {#each v.buildSubs as s, i (i)}
        <div class="click" style="flex:1 1 205px;min-width:195px;max-width:310px;border:1px solid #e0cfae;background:#fbf6ea;border-radius:8px;padding:10px 12px" role="button" tabindex="0" onclick={() => store.replaceSel(s.ch)} onkeydown={(e) => e.key === 'Enter' && store.replaceSel(s.ch)}>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px">
            <span style="font-size:17px;font-weight:700;color:#2c261d">{s.name}</span>
            <span class="mono" style="font-size:7.5px;letter-spacing:.05em;color:#fff;background:{s.fnColor};padding:3px 7px;border-radius:9px;white-space:nowrap">{s.tag}</span>
          </div>
          <div class="caption" style="font-size:12px;color:#6b5a3e">{s.why}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}
