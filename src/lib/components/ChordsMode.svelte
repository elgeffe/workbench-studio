<script lang="ts">
  import { useStore } from '../context';
  import GenrePicker from './GenrePicker.svelte';
  import ChordInspector from './parts/ChordInspector.svelte';
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
  <div class="eyebrow" style="margin-bottom:14px">Chords · {v.keyName}</div>

  <!-- progression strip -->
  <div class="eyebrow" style="margin-bottom:7px">Your progression{#if v.jzChangesView.length > 1} · {store.isDesktop ? 'drag to reorder' : 'long-press to reorder'}{/if}</div>
  <div bind:this={stripEl} style="display:flex;gap:8px;overflow-x:auto;min-height:78px;padding:11px;background:#ece0c6;border:1px dashed #cbb792;border-radius:9px;margin-bottom:12px;align-items:center">
    {#if v.jzEmpty}
      <span class="caption" style="font-size:14px;color:#9a8763;max-width:440px">Empty — load a starting point below, or tap a chord to pre-hear it and its <b>+</b> to place it. Tap a placed chord to edit it.</span>
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
    <div class="mono click" data-testid="chords-play" style="font-size:12px;letter-spacing:.06em;color:#fff;background:{v.jzPlayBg};padding:11px 20px;border-radius:7px;box-shadow:0 4px 0 {v.jzPlayShadow}" role="button" tabindex="0" onclick={() => store.toggleJazzPlay()} onkeydown={(e) => e.key === 'Enter' && store.toggleJazzPlay()}>{v.jzPlayLabel}</div>
    <div class="mono click" style="font-size:11px;letter-spacing:.06em;color:#7a6b50;border:1px solid #cbb792;padding:10px 14px;border-radius:7px" role="button" tabindex="0" onclick={() => store.jzClear()} onkeydown={(e) => e.key === 'Enter' && store.jzClear()}>CLEAR</div>
    <div style="display:flex;align-items:center;gap:7px">
      <span class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350">VOICING</span>
      <div style="display:flex;gap:3px;background:#ece0c6;border:1px solid #cbb792;border-radius:7px;padding:2px">
        <div class="mono click" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.vFullBg};color:{v.vFullFg}" role="button" tabindex="0" onclick={() => store.setVoicing('full')} onkeydown={(e) => e.key === 'Enter' && store.setVoicing('full')}>FULL</div>
        <div class="mono click" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.vShellBg};color:{v.vShellFg}" role="button" tabindex="0" onclick={() => store.setVoicing('shell')} onkeydown={(e) => e.key === 'Enter' && store.setVoicing('shell')}>SHELL</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:7px">
      <span class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350" title="How long each chord holds. The tempo doesn't change — only how often the changes come round.">CHORD</span>
      <div style="display:flex;gap:3px;background:#ece0c6;border:1px solid #cbb792;border-radius:7px;padding:2px">
        <div class="mono click" data-testid="slot-half" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.slotHalfBg};color:{v.slotHalfFg}" role="button" tabindex="0" aria-pressed={v.slotHalfBg !== '#f6efe0'} onclick={() => store.setChordSlot('half')} onkeydown={(e) => e.key === 'Enter' && store.setChordSlot('half')}>½ BAR</div>
        <div class="mono click" data-testid="slot-bar" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.slotBarBg};color:{v.slotBarFg}" role="button" tabindex="0" aria-pressed={v.slotBarBg !== '#f6efe0'} onclick={() => store.setChordSlot('bar')} onkeydown={(e) => e.key === 'Enter' && store.setChordSlot('bar')}>1 BAR</div>
      </div>
      <span class="mono" style="font-size:9px;color:#a08a64;white-space:nowrap">{v.chordSlotHint}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex:1 1 150px;min-width:140px">
      <span class="mono" style="font-size:9px;color:#8a7350;letter-spacing:.08em">TEMPO</span>
      <input type="range" min="50" max="170" value={v.tempo} oninput={(e) => store.setTempo(+e.currentTarget.value)} style="flex:1" />
      <span class="mono" style="font-size:11px;color:#2c261d;width:34px;text-align:right">{v.tempo}</span>
    </div>
  </div>
  {#if !v.drEmpty}
    <div class="mono" style="font-size:9px;letter-spacing:.06em;color:#a08a64;margin:-8px 0 14px">⟲ ONE CLOCK — ▶ PLAY runs the drum groove, these changes and the bassline together.</div>
  {/if}

  {#if store.isDesktop}
    <div class="mono" style="font-size:9px;letter-spacing:.08em;color:#a08a64;margin:-6px 0 16px;display:flex;align-items:center;gap:6px">
      <span style="font-size:11px">⌨</span> Keys
      <b style="color:#7a6b50">A S D F G H J</b> play the diatonic chords in order · <b style="color:#7a6b50">K</b> the tonic octave up · hold to sustain
    </div>
  {/if}

  <!-- edit the selected chord -->
  <ChordInspector />

  <!-- starting points -->
  <div style="margin-bottom:16px">
    <GenrePicker
      open={v.wsPickerOpen}
      label="STARTING POINT"
      summaryGenre={v.wsGenreName}
      summaryItem={v.wsProgSummary}
      hint="{v.wsProgCount} across {v.wsGenreCount} genres"
      shelves={v.wsShelves}
      items={v.wsPatternChips}
      itemsLabel="PROGRESSIONS · tap to load"
      compact={!store.isDesktop}
      testid="ws-picker"
      onOpen={() => store.openPicker('progressions')}
      onClose={() => store.closePicker()}
      onGenre={(id) => store.setWsGenre(id)}
      onItem={(i) => store.setProgression(v.wsPatterns[+i].defs, v.wsPatterns[+i].name)}
    />
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
</div>
