<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div style="background:#efe3c9;border-bottom:1px solid #ddccac;padding:8px 18px">
  <!-- KEY picker -->
  <div style="display:flex;align-items:center;gap:12px">
    <div class="mono" style="font-size:9px;letter-spacing:.18em;color:#8a7350;flex:none;width:44px">KEY</div>
    <div style="display:flex;gap:4px;overflow-x:auto;flex:1 1 auto;align-items:center">
      {#each v.keyChips as k (k.pc)}
        <div class="serif click" style="flex:none;font-size:13px;font-weight:600;min-width:30px;text-align:center;padding:5px 9px;border-radius:8px;border:1px solid {k.border};background:{k.bg};color:{k.fg};white-space:nowrap" role="button" tabindex="0" aria-pressed={k.active} onclick={() => store.setTonicKey(k.pc)} onkeydown={(e) => e.key === 'Enter' && store.setTonicKey(k.pc)}>{k.label}</div>
      {/each}
    </div>
  </div>

  <!-- SCALE picker: four everyday scales, then the modes -->
  <div style="display:flex;align-items:center;gap:12px;margin-top:7px">
    <div class="mono" style="font-size:9px;letter-spacing:.18em;color:#8a7350;flex:none;width:44px">SCALE</div>
    <div style="display:flex;gap:5px;overflow-x:auto;flex:1 1 auto;align-items:center">
      {#each v.scalePrimary as m (m.id)}
        <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.02em;padding:6px 11px;border-radius:14px;border:1px solid {m.border};background:{m.bg};color:{m.fg};white-space:nowrap" role="button" tabindex="0" aria-pressed={store.scale === m.id} onclick={() => store.setScale(m.id)} onkeydown={(e) => e.key === 'Enter' && store.setScale(m.id)}>{m.name}</div>
      {/each}
      <div style="flex:none;width:1px;align-self:stretch;background:#d3c1a1;margin:2px 3px"></div>
      <span class="mono" style="flex:none;font-size:8px;letter-spacing:.12em;color:#a08a64">MODES</span>
      {#each v.scaleModes as m (m.id)}
        <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.02em;padding:6px 11px;border-radius:14px;border:1px solid {m.border};background:{m.bg};color:{m.fg};white-space:nowrap" role="button" tabindex="0" aria-pressed={store.scale === m.id} onclick={() => store.setScale(m.id)} onkeydown={(e) => e.key === 'Enter' && store.setScale(m.id)}>{m.name}</div>
      {/each}
    </div>
    <div class="caption only-desktop" style="font-size:13px;max-width:340px;text-align:right;flex:1 1 150px">{v.scaleCaption}</div>
  </div>
</div>
