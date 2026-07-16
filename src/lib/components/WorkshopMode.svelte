<script lang="ts">
  import { useStore } from '../context';
  import type { Chord } from '../engine/constants';
  const store = useStore();
  const v = $derived(store.view);

  function add(e: Event, ch: Chord) { e.stopPropagation(); store.addChange(ch); }

  // Drag-to-reorder for the progression strip, without stealing the scroll.
  //
  // The strip both scrolls horizontally and reorders by drag — the same swipe.
  // We can't hand scrolling to the browser (touch-action) because a native pan
  // fires pointercancel and kills the stream before a long-press can be seen,
  // so we own the whole gesture (touch-action:none) and route it ourselves:
  //   · touch swipe        → scroll the strip by hand (set scrollLeft)
  //   · touch press-&-hold  → after HOLD_MS still, pick the chip up and reorder
  //   · mouse drag          → reorder immediately past a small move threshold
  // A clean touch/mouse tap still selects.
  let dragFrom = $state(-1);
  let dragOver = $state(-1);
  let dragging = $state(false); // reorder is live (chip picked up)
  let startX = 0, startY = 0;
  let moved = false;            // travelled past the threshold — a swipe, not a tap
  let touch = false;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let capEl: HTMLElement | null = null;
  let capId = -1;
  let stripEl: HTMLElement | null = null; // the scrollable strip, panned by hand
  let startScroll = 0;
  const HOLD_MS = 280, MOVE_TOL = 8;

  function clearHold() { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }

  function onPointerDown(e: PointerEvent, i: number) {
    if (!e.isPrimary || (e.button ?? 0) > 0) return;
    if ((e.target as HTMLElement).closest('[data-x]')) return; // let the × button handle its own tap
    dragFrom = i; dragOver = i; dragging = false; moved = false;
    startX = e.clientX; startY = e.clientY;
    startScroll = stripEl ? stripEl.scrollLeft : 0;
    touch = e.pointerType !== 'mouse';
    capEl = e.currentTarget as HTMLElement; capId = e.pointerId;
    try { capEl.setPointerCapture(capId); } catch { /* no active pointer */ }
    if (touch) {
      clearHold();
      holdTimer = setTimeout(() => {
        if (dragFrom === i && !moved) dragging = true; // held still → pick the chip up
      }, HOLD_MS);
    }
  }
  function onPointerMove(e: PointerEvent) {
    if (dragFrom < 0) return;
    if (dragging) {
      e.preventDefault(); // suppress selection while carrying the chip
      const chip = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-chip]') as HTMLElement | null;
      if (chip?.dataset.chip != null) dragOver = +chip.dataset.chip;
      return;
    }
    const dx = e.clientX - startX;
    if (Math.hypot(dx, e.clientY - startY) < MOVE_TOL) return; // still a tap / long-press
    if (touch) {
      // A swipe: it's a scroll, not a reorder. Cancel the pending long-press and
      // pan the strip by hand for the rest of the gesture.
      moved = true; clearHold();
      if (stripEl) stripEl.scrollLeft = startScroll - dx;
      return;
    }
    dragging = true; // mouse: begin dragging immediately
    e.preventDefault();
    const chip = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-chip]') as HTMLElement | null;
    if (chip?.dataset.chip != null) dragOver = +chip.dataset.chip;
  }
  function onPointerUp(e: PointerEvent, i: number) {
    clearHold();
    if (dragFrom < 0) return; // gesture started on the × button — ignore
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (dragging && dragOver >= 0 && dragOver !== dragFrom) store.jzMove(dragFrom, dragOver);
    else if (!dragging && !moved) store.jzSelect(i); // a clean tap selects, as before
    dragFrom = -1; dragOver = -1; dragging = false; moved = false;
  }
  function onPointerCancel() { clearHold(); dragFrom = -1; dragOver = -1; dragging = false; moved = false; }
</script>

<div>
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
    <div class="eyebrow">Workshop · {v.keyName}</div>
    <div style="display:flex;gap:4px;background:#ece0c6;border:1px solid #cbb792;border-radius:8px;padding:3px">
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styClassicBg};color:{v.styClassicFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('classic')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('classic')}>CLASSIC</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styJazzBg};color:{v.styJazzFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('jazz')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('jazz')}>JAZZ</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styClassicalBg};color:{v.styClassicalFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('classical')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('classical')}>CLASSICAL</div>
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:7px 14px;border-radius:6px;background:{v.styBassBg};color:{v.styBassFg}" role="button" tabindex="0" onclick={() => store.setWsStyle('bass')} onkeydown={(e) => e.key === 'Enter' && store.setWsStyle('bass')}>BASS</div>
    </div>
  </div>

  <!-- progression strip -->
  <div class="eyebrow" style="margin-bottom:7px">Your progression{#if v.jzChangesView.length > 1} · {store.isDesktop ? 'drag to reorder' : 'long-press to reorder'}{/if}</div>
  <div bind:this={stripEl} style="display:flex;gap:8px;overflow-x:auto;min-height:78px;padding:11px;background:#ece0c6;border:1px dashed #cbb792;border-radius:9px;margin-bottom:12px;align-items:center">
    {#if v.jzEmpty}
      <span class="caption" style="font-size:14px;color:#9a8763;max-width:440px">Empty — load a starting point below, or tap a chord to pre-hear it and its <b>+</b> to place it. Tap a placed chord to explore variations.</span>
    {/if}
    {#each v.jzChangesView as s, i (i)}
      <div class="click" data-chip={i} style="position:relative;flex:none;min-width:86px;border-radius:8px;border:1.5px solid {s.border};background:{s.bg};box-shadow:{dragging && dragFrom === i ? '0 10px 22px -6px rgba(60,40,16,.5)' : s.shadow};padding:0 12px 8px;text-align:center;overflow:visible;cursor:grab;touch-action:none;user-select:none;transition:transform .08s ease;transform:{dragging && dragFrom === i ? 'scale(1.06)' : 'scale(1)'};z-index:{dragging && dragFrom === i ? 5 : 1};opacity:{dragging && dragFrom === i ? 0.9 : 1};outline:{dragging && dragOver === i && dragFrom !== i ? '2px solid #c2562e' : 'none'};outline-offset:2px" role="button" tabindex="0" onpointerdown={(e) => onPointerDown(e, i)} onpointermove={onPointerMove} onpointerup={(e) => onPointerUp(e, i)} onpointercancel={onPointerCancel} onkeydown={(e) => e.key === 'Enter' && store.jzSelect(i)}>
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

  {#if store.isDesktop}
    <div class="mono" style="font-size:9px;letter-spacing:.08em;color:#a08a64;margin:-6px 0 16px;display:flex;align-items:center;gap:6px">
      <span style="font-size:11px">⌨</span> Keys
      <b style="color:#7a6b50">A S D F G H J</b> play the diatonic chords in order · <b style="color:#7a6b50">K</b> the tonic octave up · hold to sustain
    </div>
  {/if}

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

  <!-- BASS palette -->
  {#if v.wsStyleBass}
    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">STARTING POINTS · {v.wsGenreName} · load a groove to play under</div>
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

    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px">
      <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64">THE BASSLINE · {v.bassActiveName} · follows each chord as the loop plays</div>
      <div style="display:flex;align-items:center;gap:7px">
        <span class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350">MIX</span>
        <div style="display:flex;gap:3px;background:#ece0c6;border:1px solid #cbb792;border-radius:7px;padding:2px">
          <div class="mono click" data-testid="mix-chords" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.mixChordsBg};color:{v.mixChordsFg}" role="button" tabindex="0" aria-pressed={v.mixChordsBg !== '#f6efe0'} onclick={() => store.toggleBassChords()} onkeydown={(e) => e.key === 'Enter' && store.toggleBassChords()}>♩ CHORDS</div>
          <div class="mono click" data-testid="mix-bass" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.mixBassBg};color:{v.mixBassFg}" role="button" tabindex="0" aria-pressed={v.mixBassBg !== '#f6efe0'} onclick={() => store.toggleBassOn()} onkeydown={(e) => e.key === 'Enter' && store.toggleBassOn()}>♪ BASS</div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:8px">
      {#each v.bassGroupChips as g (g.name)}
        <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.04em;padding:6px 11px;border-radius:6px;border:1px solid {g.border};background:{g.bg};color:{g.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setBassGroup(g.name)} onkeydown={(e) => e.key === 'Enter' && store.setBassGroup(g.name)}>{g.name}</div>
      {/each}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
      {#each v.bassPats as p (p.id)}
        <div class="click" style="flex:1 1 290px;min-width:270px;max-width:440px;border:1.5px solid {p.border};background:{p.bg};box-shadow:{p.shadow};border-radius:9px;padding:11px 12px" role="button" tabindex="0" onclick={() => store.setBassPat(p.id)} onkeydown={(e) => e.key === 'Enter' && store.setBassPat(p.id)}>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:2px">
            <span style="font-size:16px;font-weight:700;color:#2c261d">{p.name}</span>
            <span class="mono" style="font-size:7.5px;letter-spacing:.05em;color:#fff;background:#5c4a30;padding:3px 7px;border-radius:9px;white-space:nowrap">{p.tag}</span>
          </div>
          <div style="display:flex;gap:2px;margin:8px 0 7px">
            {#each p.cells as c, s (s)}
              <div class="mono" style="flex:1;height:22px;border-radius:3px;background:{c.bg};color:{c.fg};font-size:8px;line-height:22px;text-align:center;overflow:hidden;margin-left:{s > 0 && s % 4 === 0 ? '4px' : '0'}">{c.label}</div>
            {/each}
          </div>
          <div class="caption" style="font-size:12px;color:#6b5a3e">{p.tip}</div>
        </div>
      {/each}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:16px">
      {#each v.bassLegend as l (l.name)}
        <span style="display:inline-flex;align-items:center;gap:5px">
          <span style="width:10px;height:10px;border-radius:3px;background:{l.color};flex:none"></span>
          <span class="mono" style="font-size:9px;letter-spacing:.05em;color:#7a6b50">{l.name}</span>
        </span>
      {/each}
      <span class="mono" style="font-size:9px;letter-spacing:.05em;color:#a08a64">· 16 sixteenths = one bar per chord · ↑↓ approach the next chord · → lands its root early</span>
    </div>

    <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">TRICKS OF THE TRADE · tap to hear each move over your current chord</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
      {#each v.bassTricks as tk (tk.id)}
        <div class="click" style="flex:1 1 205px;min-width:195px;max-width:310px;border:1px solid #e0cfae;background:#fbf6ea;border-radius:8px;padding:10px 12px" role="button" tabindex="0" onclick={() => store.playTrick(tk.id)} onkeydown={(e) => e.key === 'Enter' && store.playTrick(tk.id)}>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px">
            <span style="font-size:15px;font-weight:700;color:#2c261d">{tk.name}</span>
            <span class="mono" style="font-size:9px;color:#c2562e">▶</span>
          </div>
          <div class="caption" style="font-size:12px;color:#6b5a3e">{tk.why}</div>
        </div>
      {/each}
    </div>
    <div class="caption" style="font-size:13.5px;color:#5c4a30">Load a progression, pick a groove, hit <b>▶ PLAY</b> — the bassline transposes itself through every change (in BASS each chord lasts a full 4-beat bar). Use <b>MIX</b> to mute the chords or the bass and study either half alone. Selecting a pattern previews one bar solo; watch it land on the bass fretboard in the side panel.</div>
  {/if}
</div>
