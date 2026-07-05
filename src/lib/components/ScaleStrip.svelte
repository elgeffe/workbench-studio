<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:9px 18px;background:#efe3c9;border-bottom:1px solid #ddccac">
  <div class="mono" style="font-size:9px;letter-spacing:.18em;color:#8a7350;flex:none">SCALE</div>
  <div style="display:flex;gap:5px;overflow-x:auto;flex:1 1 auto;align-items:center">
    {#each v.modeList as m (m.id)}
      <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.02em;padding:6px 11px;border-radius:14px;border:1px solid {m.border};background:{m.bg};color:{m.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setScale(m.id)} onkeydown={(e) => e.key === 'Enter' && store.setScale(m.id)}>{m.name}</div>
    {/each}
  </div>
  <div class="caption only-desktop" style="font-size:13px;max-width:380px;text-align:right;flex:1 1 160px">{v.scaleCaption}</div>
</div>
