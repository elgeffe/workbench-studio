<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div style="margin-bottom:13px">
    <div class="eyebrow" style="margin-bottom:3px">Drums · groovebox</div>
    <div class="caption" style="font-size:13px;max-width:560px">Pick a genre, press play, then peel it apart: the LAYERS chips rebuild the groove one part at a time, the way a drummer would. Tap any cell to edit — rest → hit → <b>accent</b> — and drag the swing to bend the feel.</div>
  </div>

  <!-- genre templates, grouped by family -->
  {#each v.drGroups as grp (grp.name)}
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;flex-wrap:wrap">
      <span class="mono" style="flex:none;width:92px;font-size:8px;letter-spacing:.12em;color:#8a7350;text-transform:uppercase">{grp.name}</span>
      {#each grp.chips as c (c.id)}
        <div class="serif click" style="font-size:13.5px;font-weight:{c.weight};padding:6px 11px;border-radius:13px;border:1.5px solid {c.border};background:{c.bg};color:{c.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setDrumTpl(c.id)} onkeydown={(e) => e.key === 'Enter' && store.setDrumTpl(c.id)}>{c.name} <span class="mono" style="font-size:8px;color:#a08a64">{c.bpm}</span></div>
      {/each}
    </div>
  {/each}

  <!-- transport -->
  <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:#f3ead4;border:1px solid #e0cfae;border-radius:10px;padding:11px 13px;margin:12px 0 12px">
    <div class="mono click" data-testid="drums-play" style="flex:none;font-size:11px;letter-spacing:.06em;color:#fff;background:{v.drPlayBg};padding:12px 18px;border-radius:8px;box-shadow:0 4px 0 {v.drPlayShadow}" role="button" tabindex="0" onclick={() => store.toggleDrumPlay()} onkeydown={(e) => e.key === 'Enter' && store.toggleDrumPlay()}>{v.drPlayLabel}</div>
    <div style="display:flex;flex-direction:column;gap:3px;min-width:130px">
      <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350">TEMPO · {v.drTempo} BPM</span>
      <input type="range" min="60" max="180" value={v.drTempo} oninput={(e) => store.setDrTempo(+(e.currentTarget as HTMLInputElement).value)} />
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;min-width:130px">
      <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350">SWING · {v.drSwing}% · {v.drSwingLabel}</span>
      <input type="range" min="50" max="75" value={v.drSwing} oninput={(e) => store.setDrSwing(+(e.currentTarget as HTMLInputElement).value)} />
    </div>
    <div class="mono click" style="flex:none;font-size:9px;letter-spacing:.08em;color:#8a7350;border:1px solid #cbb792;border-radius:6px;padding:8px 11px" role="button" tabindex="0" onclick={() => store.clearDrums()} onkeydown={(e) => e.key === 'Enter' && store.clearDrums()}>✕ CLEAR</div>
  </div>

  <!-- the step grid -->
  <div data-testid="drum-grid" style="overflow-x:auto;padding-bottom:4px">
    <div style="min-width:560px">
      <div style="display:flex;gap:3px;margin-bottom:4px;padding-left:112px">
        {#each v.drCount as c (c.s)}
          <div class="mono" style="flex:1;min-width:24px;text-align:center;font-size:9px;font-weight:{c.strong ? '700' : '400'};color:{c.hot ? '#c2562e' : c.strong ? '#5c4a30' : '#a08a64'}">{c.c}</div>
        {/each}
      </div>
      {#each v.drRows as row (row.id)}
        <div style="display:flex;align-items:center;gap:3px;margin-bottom:3px;opacity:{row.muted ? 0.55 : 1}">
          <div class="click" style="flex:none;width:82px;display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:5px" role="button" tabindex="0" aria-label={'preview ' + row.name} onclick={() => store.previewDrumVoice(row.id)} onkeydown={(e) => e.key === 'Enter' && store.previewDrumVoice(row.id)}>
            <span style="width:9px;height:9px;border-radius:50%;background:{row.color};flex:none"></span>
            <span class="mono" style="font-size:9px;letter-spacing:.04em;color:#5c4a30;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{row.name}</span>
          </div>
          <div class="mono click" style="flex:none;width:24px;text-align:center;font-size:8px;padding:4px 0;border-radius:4px;border:1px solid {row.muted ? '#c2562e' : '#cbb792'};color:{row.muted ? '#c2562e' : '#8a7350'};background:{row.muted ? '#f8e3da' : 'transparent'}" role="button" tabindex="0" aria-label={'mute ' + row.name} onclick={() => store.toggleDrMute(row.id)} onkeydown={(e) => e.key === 'Enter' && store.toggleDrMute(row.id)}>M</div>
          {#each row.cells as cell (cell.s)}
            <div
              class="click"
              style="flex:1;min-width:24px;height:26px;border-radius:5px;background:{cell.bg};opacity:{cell.op};border:1px solid {cell.ring ? '#c2562e' : 'rgba(60,40,16,.12)'};box-shadow:{cell.ring ? '0 0 0 1.5px #c2562e' : 'none'}"
              role="button" tabindex="0" aria-label={row.id + ' step ' + (cell.s + 1)}
              onclick={() => store.toggleDrumCell(row.id, cell.s)}
              onkeydown={(e) => e.key === 'Enter' && store.toggleDrumCell(row.id, cell.s)}
            ></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
  <div class="mono" style="display:flex;gap:14px;flex-wrap:wrap;font-size:9px;letter-spacing:.08em;color:#7a6b50;margin:8px 0 16px">
    <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#3f6b5f99;display:inline-block"></span>HIT</div>
    <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#3f6b5f;display:inline-block"></span>ACCENT</div>
    <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:3px;background:#e7d9ba;border:1px solid #cbb792;display:inline-block"></span>BEAT</div>
    <span>TAP A ROW NAME TO PREVIEW ITS SOUND · M = MUTE</span>
  </div>

  <!-- how the pattern is built -->
  <div style="border-top:1px solid #ddccac;padding-top:14px">
    <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:21px;font-weight:700;letter-spacing:-.01em">{v.drTplName}</span>
      <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">HOW IT'S BUILT</span>
    </div>
    <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:11px">{v.drTip}</div>
    <div class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;margin-bottom:6px">LAYERS — TAP TO REBUILD THE GROOVE UP TO THAT POINT</div>
    <div data-testid="drum-layers" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:9px">
      {#each v.drLayers as l (l.i)}
        <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:8px 12px;border-radius:6px;border:1px solid {l.border};background:{l.bg};color:{l.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setDrLayers(l.i + 1)} onkeydown={(e) => e.key === 'Enter' && store.setDrLayers(l.i + 1)}>{l.i + 1} · {l.name}</div>
      {/each}
    </div>
    <div style="display:flex;gap:10px;background:#efe2c8;border-left:3px solid #3f6b5f;border-radius:0 8px 8px 0;padding:12px 14px;max-width:560px">
      <span class="mono" style="font-size:11px;color:#3f6b5f;flex:none">★</span>
      <span class="caption" style="font-size:14px;color:#4a3d29;line-height:1.5">{v.drLayerWhy}</span>
    </div>
    <div class="caption" style="font-size:12.5px;color:#8a7350;margin-top:12px;max-width:560px">Want the theory behind these patterns — backbeat, clave, swing, ghost notes? It's all in <b>Learn → Rhythm &amp; Drums</b>. And the beat keeps playing when you switch tabs, so you can jam chords over it in the Workshop.</div>
  </div>
</div>
