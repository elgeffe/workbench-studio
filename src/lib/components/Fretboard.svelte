<script lang="ts">
  import type { FretRow } from '../store.svelte';

  let {
    rows, frets13, label,
    cellH = 22, noteSz = 18, dotSz = 18,
    openLeft = -10, openSz = 16, openBorder = 3,
  }: {
    rows: FretRow[];
    frets13: { m: string }[];
    label: string;
    cellH?: number; noteSz?: number; dotSz?: number;
    openLeft?: number; openSz?: number; openBorder?: number;
  } = $props();
</script>

<div class="mono" style="font-size:9px;letter-spacing:.14em;color:#9c8460;margin-bottom:5px">{label}</div>
<div style="margin-bottom:14px">
  {#each rows as s (s.label)}
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <div class="mono" style="width:14px;text-align:center;font-size:9px;font-weight:700;color:#7d5230">{s.label}</div>
      <div class="fret-lane">
        {#if s.openDot}
          <div style="position:absolute;left:{openLeft}px;top:50%;transform:translateY(-50%);width:{openSz}px;height:{openSz}px;border-radius:50%;background:#fff5e6;border:{openBorder}px solid {s.openDot.color};box-shadow:0 1px 3px rgba(0,0,0,.35);z-index:4"></div>
        {/if}
        {#each s.cells as c, i (i)}
          <div class="fret-cell" style="height:{cellH}px">
            {#if c.barreThru}
              <div style="position:absolute;top:-3px;bottom:-3px;width:8px;border-radius:4px;background:rgba(48,32,18,.5);z-index:1"></div>
            {/if}
            {#if c.dot}
              <div class="fret-dot" style="width:{dotSz}px;height:{dotSz}px;font-size:9px;background:{c.dotColor};box-shadow:0 0 0 1px {c.dotColor},0 1px 3px rgba(0,0,0,.35)">{c.finger}</div>
            {/if}
            {#if c.showLit}
              <div class="fret-note" style="width:{noteSz}px;height:{noteSz}px;font-size:8px;background:{c.bg};box-shadow:{c.glow};opacity:{c.litOpacity}">{c.note}</div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
  <div style="display:flex;gap:6px">
    <div style="width:14px"></div>
    <div style="flex:1;display:flex">
      {#each frets13 as n, i (i)}<div class="mono" style="flex:1;text-align:center;font-size:7px;color:#b09a72">{n.m}</div>{/each}
    </div>
  </div>
</div>
