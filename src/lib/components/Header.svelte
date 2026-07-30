<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<!-- Layout lives in app.css: the bar pads itself clear of the notch / Dynamic
     Island, and landscape trims its vertical padding. -->
<div class="wb-header">
  <div class="wb-header-row">
    <!-- brand -->
    <div style="display:flex;align-items:center;gap:12px;min-width:0">
      <div class="wb-brand-mark">
        <div style="width:9px;height:9px;border-radius:50%;background:#c2562e"></div>
      </div>
      <div style="min-width:0">
        <div class="mono wb-brand-eyebrow">Ear &amp; Theory</div>
        <div class="wb-brand-title">The Workbench</div>
      </div>
    </div>

    <!-- key stepper -->
    <div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.22);border:1px solid rgba(216,168,111,.3);border-radius:8px;padding:5px 7px;flex:1 1 240px;min-width:200px;max-width:340px">
      <div class="mono click" style="width:40px;height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:rgba(216,168,111,.12);color:#e9c79b;font-size:15px;flex:none" role="button" tabindex="0" onclick={() => store.stepKey(-1)} onkeydown={(e) => e.key === 'Enter' && store.stepKey(-1)}>◀</div>
      <div style="flex:1;text-align:center;min-width:0">
        <div style="font-size:19px;font-weight:600;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{v.keyName}</div>
        <div class="mono" style="font-size:9px;letter-spacing:.04em;color:#cba47a;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{v.scaleNotes}</div>
      </div>
      <div class="mono click" style="width:40px;height:40px;border-radius:6px;display:flex;align-items:center;justify-content:center;background:rgba(216,168,111,.12);color:#e9c79b;font-size:15px;flex:none" role="button" tabindex="0" onclick={() => store.stepKey(1)} onkeydown={(e) => e.key === 'Enter' && store.stepKey(1)}>▶</div>
    </div>

    <!-- controls -->
    <div style="display:flex;align-items:center;gap:8px">
      {#if store.isDesktop}
        <div style="display:flex;align-items:center;gap:2px;background:rgba(0,0,0,.22);border:1px solid rgba(216,168,111,.3);border-radius:6px;padding:3px">
          <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#cba47a;padding:0 5px 0 3px">EXT</span>
          {#each v.extLevels as x (x.id)}
            <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:5px 7px;border-radius:4px;background:{x.bg};color:{x.fg}" role="button" tabindex="0" onclick={() => store.setExt(x.id)} onkeydown={(e) => e.key === 'Enter' && store.setExt(x.id)}>{x.label}</div>
          {/each}
        </div>
      {/if}
      <div class="mono click" style="font-size:10px;letter-spacing:.1em;padding:9px 12px;border-radius:6px;border:1px solid rgba(216,168,111,.4);background:{v.soundBg};color:{v.soundFg}" role="button" tabindex="0" onclick={() => store.toggleSound()} onkeydown={(e) => e.key === 'Enter' && store.toggleSound()}>{v.soundLabel}</div>
    </div>
  </div>
</div>
