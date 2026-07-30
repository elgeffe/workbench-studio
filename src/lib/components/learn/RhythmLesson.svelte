<script lang="ts">
  // Rhythm theory, plus the anatomy of whichever groove is loaded next door.
  //
  // The second half of this used to live in the Drums tab, under the grid:
  // what the pattern is, what each layer adds, how to programme it in a box.
  // It is explanation, so it belongs here — but it stays pointed at the user's
  // actual groove rather than becoming a generic essay, and the LAYERS chips
  // are live, so reading about a layer and hearing it are the same tap.
  import { useStore } from '../../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div class="caption" style="font-size:13px;max-width:560px;margin-bottom:16px">How drum &amp; percussion patterns are constructed — from the 16-step grid up to clave timelines and swing. Every card plays a one-bar demo through the kit.</div>

<div style="display:flex;flex-direction:column;gap:12px;max-width:640px">
  {#each v.rhythmConcepts as c (c.id)}
    <div style="border:1px solid #e0cfae;background:#fbf6ea;border-radius:10px;padding:13px 15px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
        <span style="font-size:17px;font-weight:700;color:#2c261d">{c.name}</span>
        <span class="mono" style="font-size:7.5px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">{c.tag}</span>
        <span class="mono" style="font-size:9px;color:#a08a64">{c.bpm} BPM</span>
        <div class="mono click" style="margin-left:auto;flex:none;font-size:10px;letter-spacing:.06em;color:#fff;background:#c2562e;padding:9px 14px;border-radius:7px;box-shadow:0 3px 0 #9a3f1f" role="button" tabindex="0" onclick={() => store.playRhythmDemo(c.id)} onkeydown={(e) => e.key === 'Enter' && store.playRhythmDemo(c.id)}>▶ HEAR IT</div>
      </div>
      <div class="serif" style="font-size:14.5px;color:#4a3d29;line-height:1.55">{c.text}</div>
    </div>
  {/each}
</div>

<!-- ---- the groove currently loaded in the Drums tab ---- -->
<div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
  <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
    <span class="mono" style="font-size:9px;letter-spacing:.12em;color:#8a7350">{v.drGenreName} ·</span>
    <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">{v.drTplName}</span>
    <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">HOW IT'S BUILT</span>
  </div>
  <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:11px">{v.drTip}</div>

  <div class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;margin-bottom:6px">LAYERS — TAP TO REBUILD THE GROOVE UP TO THAT POINT</div>
  <div data-testid="learn-drum-layers" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px">
    {#each v.drLayers as l (l.i)}
      <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:8px 12px;border-radius:6px;border:1px solid {l.border};background:{l.bg};color:{l.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setDrLayers(l.i + 1)} onkeydown={(e) => e.key === 'Enter' && store.setDrLayers(l.i + 1)}>{l.i + 1} · {l.name}</div>
    {/each}
  </div>
  <div style="display:flex;gap:10px;background:#efe2c8;border-left:3px solid #3f6b5f;border-radius:0 8px 8px 0;padding:12px 14px;max-width:560px;margin-bottom:12px">
    <span class="mono" style="font-size:11px;color:#3f6b5f;flex:none">★</span>
    <span class="caption" style="font-size:14px;color:#4a3d29;line-height:1.5">{v.drLayerWhy}</span>
  </div>

  <div data-testid="drum-maschine" style="display:flex;gap:10px;background:#f3ead4;border:1px solid #e0cfae;border-radius:8px;padding:12px 14px;max-width:620px">
    <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#c2562e;padding:3px 7px;border-radius:9px;height:fit-content;flex:none">IN THE BOX</span>
    <span class="caption" style="font-size:13.5px;color:#4a3d29;line-height:1.5">{v.drGenreMaschine}</span>
  </div>

  <div class="caption" style="font-size:13px;color:#8a7350;margin-top:12px;max-width:560px">Go build it in <b>Drums</b> — the same layers, the same grid, and every cell editable.</div>
</div>
