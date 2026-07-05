<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <!-- direction + view toggles -->
  <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">
    <div style="display:flex;gap:2px;background:#ece0c6;border:1px solid #cbb792;border-radius:8px;padding:3px">
      <div class="mono click" style="font-size:10px;letter-spacing:.05em;padding:8px 13px;border-radius:6px;background:{v.dirFifthsBg};color:{v.dirFifthsFg}" role="button" tabindex="0" onclick={() => store.setCircleDir('fifths')} onkeydown={(e) => e.key === 'Enter' && store.setCircleDir('fifths')}>⟳ FIFTHS</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.05em;padding:8px 13px;border-radius:6px;background:{v.dirFourthsBg};color:{v.dirFourthsFg}" role="button" tabindex="0" onclick={() => store.setCircleDir('fourths')} onkeydown={(e) => e.key === 'Enter' && store.setCircleDir('fourths')}>⟲ FOURTHS</div>
    </div>
    <div style="display:flex;gap:2px;background:#ece0c6;border:1px solid #cbb792;border-radius:8px;padding:3px">
      <div class="mono click" style="font-size:10px;letter-spacing:.05em;padding:8px 13px;border-radius:6px;background:{v.viewMajBg};color:{v.viewMajFg}" role="button" tabindex="0" onclick={() => store.setCircleView('maj')} onkeydown={(e) => e.key === 'Enter' && store.setCircleView('maj')}>MAJOR</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.05em;padding:8px 13px;border-radius:6px;background:{v.viewMinBg};color:{v.viewMinFg}" role="button" tabindex="0" onclick={() => store.setCircleView('min')} onkeydown={(e) => e.key === 'Enter' && store.setCircleView('min')}>MINOR</div>
    </div>
  </div>

  <div style="display:flex;align-items:flex-start;gap:26px;flex-wrap:wrap;justify-content:center">
    <!-- the wheel -->
    <div style="position:relative;width:min(92vw,340px);aspect-ratio:1;flex:none">
      <div style="position:absolute;inset:6px;border-radius:50%;border:1px dashed #cbb792;animation:{v.ringAnim}"></div>
      <svg viewBox="0 0 360 360" style="position:absolute;inset:0;width:100%;height:100%;display:block">
        {#each v.wedges as w, i (i)}
          <path d={w.d} fill={w.fill} stroke="#f1e7d3" stroke-width="2.5" style="cursor:pointer" role="button" tabindex="-1" onclick={() => store.wedgeClick(w)} onkeydown={(e) => e.key === 'Enter' && store.wedgeClick(w)} />
        {/each}
        <circle cx="180" cy="180" r="74" fill="#2c2014" stroke="#c2562e" stroke-width="2"></circle>
        <text x="180" y="222" text-anchor="middle" style="font-family:var(--mono);font-size:8px;letter-spacing:.12em;fill:#9c8460">{v.circleLabel}</text>
      </svg>
      {#each v.wedges as w, i (i)}
        <div class="serif click" style="position:absolute;left:{w.majL}%;top:{w.majT}%;transform:translate(-50%,-50%);font-weight:600;font-size:19px;color:{w.tfill}" role="button" tabindex="-1" onclick={() => store.wedgeClick(w)} onkeydown={(e) => e.key === 'Enter' && store.wedgeClick(w)}>{w.major}</div>
        <div class="mono click" style="position:absolute;left:{w.minL}%;top:{w.minT}%;transform:translate(-50%,-50%);font-size:8.5px;color:{w.mfill}" role="button" tabindex="-1" onclick={() => store.wedgeClick(w)} onkeydown={(e) => e.key === 'Enter' && store.wedgeClick(w)}>{w.minor}</div>
      {/each}
      <div class="serif" style="position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);font-weight:600;font-size:33px;color:#f1e7d3;pointer-events:none;white-space:nowrap">{v.centerKey}</div>
      <div class="mono" style="position:absolute;left:50%;top:55%;transform:translate(-50%,-50%);font-size:10px;letter-spacing:.08em;color:#d8a86f;pointer-events:none">{v.keySig}</div>
    </div>

    <!-- legend + diatonic -->
    <div style="flex:1 1 240px;min-width:240px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
        <div class="eyebrow">Diatonic chords in {v.keyName}</div>
        <div style="display:flex;align-items:center;gap:2px;background:#ece0c6;border:1px solid #cbb792;border-radius:7px;padding:3px">
          <span class="mono" style="font-size:8px;letter-spacing:.1em;color:#8a7350;padding:0 5px">EXT</span>
          {#each v.extLevelsLight as x (x.id)}
            <div class="mono click" style="font-size:11px;padding:6px 8px;border-radius:5px;background:{x.bg};color:{x.fg}" role="button" tabindex="0" onclick={() => store.setExt(x.id)} onkeydown={(e) => e.key === 'Enter' && store.setExt(x.id)}>{x.label}</div>
          {/each}
        </div>
      </div>
      <div class="caption" style="font-size:13px;margin-bottom:10px;max-width:340px">{v.extCaption}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
        {#each v.diatonic as c, i (i)}
          <div class="click" style="flex:1 1 76px;min-width:72px;border-radius:6px;border:1.5px solid {c.border};background:{c.bg};padding:9px 4px 8px;text-align:center;box-shadow:{c.shadow}" role="button" tabindex="0" onclick={() => store.previewChord(c)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c)}>
            <div class="mono" style="font-size:10px;color:{c.fnColor};letter-spacing:.04em">{c.roman}</div>
            <div style="font-size:15px;font-weight:600;color:#2c261d;line-height:1.05;margin-top:2px;white-space:nowrap">{c.name}</div>
            <div style="height:3px;border-radius:2px;margin-top:6px;background:{c.fnColor}"></div>
          </div>
        {/each}
      </div>
      <div class="mono" style="display:flex;gap:14px;font-size:9px;letter-spacing:.08em;color:#7a6b50">
        <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:#3f6b5f;display:inline-block"></span>TONIC</div>
        <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:#b07d23;display:inline-block"></span>SUBDOM.</div>
        <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:#c2562e;display:inline-block"></span>DOMINANT</div>
      </div>
    </div>
  </div>

  <div class="caption" style="font-size:13.5px;text-align:center;margin:12px auto 0;max-width:420px">{v.circleHint}</div>

  <!-- selected chord detail -->
  <div style="margin-top:20px;border-top:1px solid #ddccac;padding-top:16px">
    {#if v.hasActive}
      <div style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap">
        <div style="flex:none">
          <div style="font-size:42px;font-weight:700;line-height:.95;letter-spacing:-.01em">{v.acName}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">
            <span class="mono" style="font-size:13px;color:#5c4a30">{v.acRoman}</span>
            <span class="mono" style="font-size:10px;letter-spacing:.06em;color:#fff;background:{v.acFnColor};padding:3px 8px;border-radius:10px">{v.acFnName}</span>
          </div>
        </div>
        <div style="flex:1 1 220px;min-width:200px">
          <div class="mono" style="font-size:10px;letter-spacing:.14em;color:#8a7350;margin-bottom:5px">NOTES</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:10px">
            {#each v.acNotes as n, i (i)}
              <div class="mono" style="font-size:13px;font-weight:700;color:#2c261d;background:#efe2c8;border:1px solid {n.bd};border-radius:5px;padding:5px 10px">{n.name}<span style="font-size:8px;color:#9c8460;margin-left:4px">{n.deg}</span></div>
            {/each}
          </div>
          <div class="caption" style="font-size:14px;color:#5c4a30;max-width:480px">{v.acWhy}</div>
        </div>
        <div class="mono click" style="flex:none;align-self:center;font-size:11px;letter-spacing:.08em;color:#fff;background:#c2562e;padding:10px 16px;border-radius:6px;box-shadow:0 4px 0 #9a3f1f" role="button" tabindex="0" onclick={() => store.playChord(store.activeChord)} onkeydown={(e) => e.key === 'Enter' && store.playChord(store.activeChord)}>▶ HEAR</div>
      </div>
      <div style="margin-top:18px;border-top:1px dashed #d9c8a6;padding-top:14px">
        <div class="mono" style="font-size:10px;letter-spacing:.14em;color:#8a7350;margin-bottom:9px">SUBSTITUTIONS · swap {v.acName} for…</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px">
          {#each v.subs as s, i (i)}
            <div class="click" style="flex:1 1 210px;min-width:200px;max-width:330px;border:1px solid #e0cfae;background:#f9f3e4;border-radius:8px;padding:11px 13px" role="button" tabindex="0" onclick={() => store.hitChord(s.ch)} onkeydown={(e) => e.key === 'Enter' && store.hitChord(s.ch)}>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px">
                <span style="font-size:19px;font-weight:700;color:#2c261d;line-height:1">{s.name}</span>
                <span class="mono" style="font-size:8px;letter-spacing:.06em;color:#fff;background:{s.fnColor};padding:3px 7px;border-radius:9px;white-space:nowrap">{s.tag}</span>
              </div>
              <div class="caption" style="font-size:12.5px;color:#6b5a3e">{s.why}</div>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="caption" style="font-size:15px;color:#9c8460">Tap a key on the wheel to set the tonic, then tap any chord to hear it and see it light up across your instruments.</div>
    {/if}
  </div>
</div>
