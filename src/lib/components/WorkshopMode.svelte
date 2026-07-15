<script lang="ts">
  import { useStore } from '../context';
  import type { Chord } from '../engine/constants';
  const store = useStore();
  const v = $derived(store.view);

  function add(e: Event, ch: Chord) { e.stopPropagation(); store.addChange(ch); }

  // Drag-to-reorder for the progression strip. Pointer events cover mouse and
  // touch alike; we hit-test the pointer against the chips to find the target,
  // and only start dragging past a small threshold so taps still select.
  let dragFrom = $state(-1);
  let dragOver = $state(-1);
  let dragging = $state(false);
  let startX = 0, startY = 0;

  function onPointerDown(e: PointerEvent, i: number) {
    if (!e.isPrimary || (e.button ?? 0) > 0) return;
    if ((e.target as HTMLElement).closest('[data-x]')) return; // let the × button handle its own tap
    dragFrom = i; dragOver = i; dragging = false;
    startX = e.clientX; startY = e.clientY;
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* no active pointer */ }
  }
  function onPointerMove(e: PointerEvent) {
    if (dragFrom < 0) return;
    if (!dragging) {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) < 6) return; // still a tap
      dragging = true;
    }
    e.preventDefault(); // suppress scroll/selection while dragging
    const chip = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-chip]') as HTMLElement | null;
    if (chip?.dataset.chip != null) dragOver = +chip.dataset.chip;
  }
  function onPointerUp(e: PointerEvent, i: number) {
    if (dragFrom < 0) return; // gesture started on the × button — ignore
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (dragging && dragOver >= 0 && dragOver !== dragFrom) store.jzMove(dragFrom, dragOver);
    else if (!dragging) store.jzSelect(i); // a tap selects, as before
    dragFrom = -1; dragOver = -1; dragging = false;
  }
  function onPointerCancel() { dragFrom = -1; dragOver = -1; dragging = false; }
</script>

<div>
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
    <div class="eyebrow">Workshop · {v.keyName}</div>
    <div style="display:flex;gap:4px;background:#ece0c6;border:1px solid #cbb792;border-radius:8px;padding:3px">
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styClassicBg};color:{v.styClassicFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('classic')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('classic')}>CLASSIC</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styJazzBg};color:{v.styJazzFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('jazz')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('jazz')}>JAZZ</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styClassicalBg};color:{v.styClassicalFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('classical')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('classical')}>CLASSICAL</div>
    </div>
  </div>

  <!-- progression strip -->
  <div class="eyebrow" style="margin-bottom:7px">Your progression{#if v.jzChangesView.length > 1} · drag to reorder{/if}</div>
  <div style="display:flex;gap:8px;overflow-x:auto;min-height:78px;padding:11px;background:#ece0c6;border:1px dashed #cbb792;border-radius:9px;margin-bottom:12px;align-items:center">
    {#if v.jzEmpty}
      <span class="caption" style="font-size:14px;color:#9a8763;max-width:440px">Empty — load a starting point below, or tap a chord to pre-hear it and its <b>+</b> to place it. Tap a placed chord to explore variations.</span>
    {/if}
    {#each v.jzChangesView as s, i (i)}
      <div class="click" data-chip={i} style="position:relative;flex:none;min-width:86px;border-radius:8px;border:1.5px solid {s.border};background:{s.bg};box-shadow:{s.shadow};padding:0 12px 8px;text-align:center;overflow:visible;cursor:grab;touch-action:none;user-select:none;opacity:{dragging && dragFrom === i ? 0.35 : 1};outline:{dragging && dragOver === i && dragFrom !== i ? '2px solid #c2562e' : 'none'};outline-offset:2px" role="button" tabindex="0" onpointerdown={(e) => onPointerDown(e, i)} onpointermove={onPointerMove} onpointerup={(e) => onPointerUp(e, i)} onpointercancel={onPointerCancel} onkeydown={(e) => e.key === 'Enter' && store.jzSelect(i)}>
        <div style="height:4px;margin:0 -12px 6px;background:{s.fnColor};border-radius:8px 8px 0 0"></div>
        <div class="mono" style="font-size:8.5px;color:{s.fnColor}">{s.roman}</div>
        <div style="font-size:16px;font-weight:700;color:#2c261d;line-height:1.05;white-space:nowrap">{s.name}</div>
        <div class="mono" style="font-size:8px;color:#8a7350;margin-top:2px;white-space:nowrap">{s.notes}</div>
        <div class="mono" data-x style="position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;background:#c2562e;color:#fff;font-size:12px;line-height:17px;text-align:center;border:1.5px solid #f5edda" role="button" tabindex="0" onclick={(e) => { e.stopPropagation(); store.jzRemove(i); }} onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); store.jzRemove(i); } }}>×</div>
      </div>
    {/each}
  </div>

  <!-- transport -->
  <div style="display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin-bottom:16px">
    <div class="mono click" style="font-size:12px;letter-spacing:.06em;color:#fff;background:{v.jzPlayBg};padding:11px 20px;border-radius:7px;box-shadow:0 4px 0 {v.jzPlayShadow}" role="button" tabindex="0" onclick={() => store.toggleJazzPlay()} onkeydown={(e) => e.key === 'Enter' && store.toggleJazzPlay()}>{v.jzPlayLabel}</div>
    <div class="mono click" style="font-size:11px;letter-spacing:.06em;color:#7a6b50;border:1px solid #cbb792;padding:10px 14px;border-radius:7px" role="button" tabindex="0" onclick={() => store.jzClear()} onkeydown={(e) => e.key === 'Enter' && store.jzClear()}>CLEAR</div>
    <div style="display:flex;align-items:center;gap:7px">
      <span class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350">VOICING</span>
      <div style="display:flex;gap:3px;background:#ece0c6;border:1px solid #cbb792;border-radius:7px;padding:2px">
        <div class="mono click" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.vFullBg};color:{v.vFullFg}" role="button" tabindex="0" onclick={() => store.setVoicing('full')} onkeydown={(e) => e.key === 'Enter' && store.setVoicing('full')}>FULL</div>
        <div class="mono click" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.vShellBg};color:{v.vShellFg}" role="button" tabindex="0" onclick={() => store.setVoicing('shell')} onkeydown={(e) => e.key === 'Enter' && store.setVoicing('shell')}>SHELL</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex:1 1 150px;min-width:140px">
      <span class="mono" style="font-size:9px;color:#8a7350;letter-spacing:.08em">TEMPO</span>
      <input type="range" min="50" max="170" value={v.tempo} oninput={(e) => store.setTempo(+e.currentTarget.value)} style="flex:1" />
      <span class="mono" style="font-size:11px;color:#2c261d;width:34px;text-align:right">{v.tempo}</span>
    </div>
  </div>

  <!-- explore selected -->
  {#if v.exploreOpen}
    <div style="background:#f3ead4;border:1px solid #e0cfae;border-radius:10px;padding:14px 15px;margin-bottom:16px">
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:11px;flex-wrap:wrap">
        <span class="mono" style="font-size:9px;letter-spacing:.12em;color:#8a7350">EXPLORING</span>
        <span style="font-size:21px;font-weight:700;color:#2c261d;line-height:1">{v.selName}</span>
        <span class="mono" style="font-size:10px;color:#7a6b50">{v.selRoman}</span>
      </div>
      <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350;margin-bottom:7px">COLOUR · change in place</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
        {#each v.extChips as e, i (i)}
          <div class="serif click" style="font-size:15px;font-weight:600;padding:6px 13px;border-radius:14px;border:1.5px solid #cbb792;background:#fff;color:#2c261d" role="button" tabindex="0" onclick={() => store.replaceSel(e.ch)} onkeydown={(ev) => ev.key === 'Enter' && store.replaceSel(e.ch)}>{e.label}</div>
        {/each}
        {#if v.showIIV}
          <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:8px 13px;border-radius:14px;border:1.5px solid #3f6b5f;background:#e7efec;color:#2c4f45" role="button" tabindex="0" onclick={() => store.insertIIV()} onkeydown={(e) => e.key === 'Enter' && store.insertIIV()}>+ ii–V before</div>
        {/if}
        {#if v.showV}
          <div class="mono click" style="font-size:10px;letter-spacing:.04em;padding:8px 13px;border-radius:14px;border:1.5px solid #3f6b5f;background:#e7efec;color:#2c4f45" role="button" tabindex="0" onclick={() => store.insertV()} onkeydown={(e) => e.key === 'Enter' && store.insertV()}>+ V before</div>
        {/if}
      </div>
      {#if v.showV}
        <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350;margin-bottom:7px">INVERSION · which note in the bass</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          {#each v.invChips as e, i (i)}
            <div class="mono click" style="font-size:11px;padding:7px 13px;border-radius:14px;border:1.5px solid #b07d23;background:#f5ecd8;color:#5c4a30" role="button" tabindex="0" onclick={() => store.replaceSel(e.ch)} onkeydown={(ev) => ev.key === 'Enter' && store.replaceSel(e.ch)}>{e.label}</div>
          {/each}
        </div>
      {/if}
      <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350;margin-bottom:7px">SUBSTITUTE · swap this chord for…</div>
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

  <!-- CLASSIC palette -->
  {#if v.wsStyleClassic}
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">STARTING POINTS · {v.wsGenreName}</div>
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:8px">
      {#each v.wsGenres as g (g.i)}
        <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.04em;padding:6px 11px;border-radius:6px;border:1px solid {g.border};background:{g.bg};color:{g.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setWsGenre(g.i)} onkeydown={(e) => e.key === 'Enter' && store.setWsGenre(g.i)}>{g.name}</div>
      {/each}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px">
      {#each v.wsPatterns as p, i (i)}
        <div class="serif click" style="font-size:14px;font-weight:600;padding:7px 13px;border-radius:14px;border:1.5px solid #c2562e;background:#fbeede;color:#2c261d" role="button" tabindex="0" onclick={() => store.setProgression(p.defs)} onkeydown={(e) => e.key === 'Enter' && store.setProgression(p.defs)}>{p.name}</div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">DIATONIC · {v.keyName}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:13px">
      {#each v.diatonic as c, i (i)}
        <div class="click" style="position:relative;flex:1 1 76px;min-width:72px;border-radius:6px;border:1.5px solid {c.wsBorder};background:{c.wsBg};box-shadow:{c.wsShadow};padding:0 4px 7px;text-align:center;overflow:hidden" role="button" tabindex="0" onclick={() => store.previewChord(c)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c)}>
          <div style="height:4px;margin:0 -4px 6px;background:{c.fnColor}"></div>
          <div class="mono" style="font-size:9px;color:{c.fnColor}">{c.roman}</div>
          <div style="font-size:15px;font-weight:600;color:#2c261d">{c.name}</div>
          <div class="mono" style="position:absolute;top:6px;right:3px;width:16px;height:16px;border-radius:50%;background:#fff;border:1px solid {c.fnColor};color:{c.fnColor};font-size:11px;line-height:14px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c)} onkeydown={(e) => e.key === 'Enter' && add(e, c)}>+</div>
        </div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">COLOUR &amp; BORROWED</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
      {#each v.colorChords as c, i (i)}
        <div class="click" style="position:relative;border-radius:6px;border:1.5px dashed #b9882f;background:#f3ead4;padding:7px 22px 7px 12px;text-align:center" role="button" tabindex="0" onclick={() => store.previewChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c.ch)}>
          <div class="mono" style="font-size:9px;color:#b07d23">{c.roman}</div>
          <div style="font-size:15px;font-weight:600;color:#2c261d">{c.name}</div>
          <div class="mono" style="position:absolute;top:6px;right:5px;width:16px;height:16px;border-radius:50%;background:#fff;border:1px solid #b07d23;color:#b07d23;font-size:11px;line-height:14px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c.ch)} onkeydown={(e) => e.key === 'Enter' && add(e, c.ch)}>+</div>
        </div>
      {/each}
    </div>
    <div class="caption" style="font-size:14px;color:#5c4a30">{v.suggestText}</div>
  {/if}

  <!-- JAZZ palette -->
  {#if v.wsStyleJazz}
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">STARTING POINTS · append</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:15px">
      {#each v.quickProgs as p, i (i)}
        <div class="serif click" style="font-size:14px;font-weight:600;padding:8px 14px;border-radius:7px;border:1.5px solid #c2562e;background:#fbeede;color:#2c261d;white-space:nowrap" role="button" tabindex="0" onclick={() => store.addProg(p.defs)} onkeydown={(e) => e.key === 'Enter' && store.addProg(p.defs)}>{p.name}</div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">DIATONIC 7THS · {v.keyName}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:15px">
      {#each v.jzDia as c, i (i)}
        <div class="click" style="position:relative;flex:1 1 76px;min-width:72px;border-radius:6px;border:1.5px solid {c.border};background:{c.tint};padding:0 4px 7px;text-align:center;overflow:hidden" role="button" tabindex="0" onclick={() => store.previewChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c.ch)}>
          <div style="height:4px;margin:0 -4px 6px;background:{c.fnColor}"></div>
          <div class="mono" style="font-size:8.5px;color:{c.fnColor}">{c.roman}</div>
          <div style="font-size:14px;font-weight:600;color:#2c261d">{c.name}</div>
          <div class="mono" style="position:absolute;top:6px;right:3px;width:15px;height:15px;border-radius:50%;background:#fff;border:1px solid {c.fnColor};color:{c.fnColor};font-size:10px;line-height:13px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c.ch)} onkeydown={(e) => e.key === 'Enter' && add(e, c.ch)}>+</div>
        </div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">COLOUR &amp; BORROWED</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:15px">
      {#each v.jzBorrow as c, i (i)}
        <div class="click" style="position:relative;border-radius:6px;border:1.5px dashed #b9882f;background:#f3ead4;padding:7px 24px 7px 13px;text-align:center" role="button" tabindex="0" onclick={() => store.previewChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c.ch)}>
          <div class="mono" style="font-size:8.5px;color:#b07d23">{c.roman}</div>
          <div style="font-size:14px;font-weight:600;color:#2c261d">{c.name}</div>
          <div class="mono" style="position:absolute;top:6px;right:5px;width:15px;height:15px;border-radius:50%;background:#fff;border:1px solid #b07d23;color:#b07d23;font-size:10px;line-height:13px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c.ch)} onkeydown={(e) => e.key === 'Enter' && add(e, c.ch)}>+</div>
        </div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">SECONDARY DOMINANTS · tonicise any degree</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      {#each v.jzSecondary as c, i (i)}
        <div class="click" style="position:relative;border-radius:6px;border:1.5px solid #c2562e;background:#f7e4db;padding:7px 24px 7px 13px;text-align:center" role="button" tabindex="0" onclick={() => store.previewChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c.ch)}>
          <div class="mono" style="font-size:8.5px;color:#c2562e">{c.roman}</div>
          <div style="font-size:14px;font-weight:600;color:#2c261d">{c.name}</div>
          <div class="mono" style="position:absolute;top:6px;right:5px;width:15px;height:15px;border-radius:50%;background:#fff;border:1px solid #c2562e;color:#c2562e;font-size:10px;line-height:13px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c.ch)} onkeydown={(e) => e.key === 'Enter' && add(e, c.ch)}>+</div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- CLASSICAL palette -->
  {#if v.wsStyleClassical}
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">PERIOD PROGRESSIONS · load</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:13px">
      {#each v.clProgs as p, i (i)}
        <div class="serif click" style="font-size:14px;font-weight:600;padding:8px 14px;border-radius:7px;border:1.5px solid #c2562e;background:#fbeede;color:#2c261d;white-space:nowrap" role="button" tabindex="0" onclick={() => store.setProgression(p.defs)} onkeydown={(e) => e.key === 'Enter' && store.setProgression(p.defs)}>{p.name}</div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">CADENCES · append</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:15px">
      {#each v.cadences as c, i (i)}
        <div class="mono click" style="font-size:11px;letter-spacing:.04em;padding:8px 13px;border-radius:7px;border:1.5px solid #3f6b5f;background:#e7efec;color:#2c4f45;white-space:nowrap" role="button" tabindex="0" onclick={() => store.addProg(c.defs)} onkeydown={(e) => e.key === 'Enter' && store.addProg(c.defs)}>{c.name}</div>
      {/each}
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">DIATONIC TRIADS · {v.keyName}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">
      {#each v.clDia as c, i (i)}
        <div class="click" style="position:relative;flex:1 1 76px;min-width:72px;border-radius:6px;border:1.5px solid {c.border};background:{c.tint};padding:0 4px 7px;text-align:center;overflow:hidden" role="button" tabindex="0" onclick={() => store.previewChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c.ch)}>
          <div style="height:4px;margin:0 -4px 6px;background:{c.fnColor}"></div>
          <div class="mono" style="font-size:9px;color:{c.fnColor}">{c.roman}</div>
          <div style="font-size:15px;font-weight:600;color:#2c261d">{c.name}</div>
          <div class="mono" style="position:absolute;top:6px;right:3px;width:16px;height:16px;border-radius:50%;background:#fff;border:1px solid {c.fnColor};color:{c.fnColor};font-size:11px;line-height:14px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c.ch)} onkeydown={(e) => e.key === 'Enter' && add(e, c.ch)}>+</div>
        </div>
      {/each}
    </div>
    <div class="caption" style="font-size:13.5px;color:#5c4a30">Tap a triad to pre-hear it, <b>+</b> to place it. Select a placed chord to set its <b>inversion</b> (figured-bass 6 / 6-4), add a leading <b>V</b>, or substitute — the bones of voice-led classical harmony.</div>
  {/if}
</div>
