<script lang="ts">
  import type { FretRow } from '../view/types';

  let {
    rows, frets13, label,
    cellH = 22, noteSz = 18,
    onPick,
  }: {
    rows: FretRow[];
    frets13: { m: string }[];
    label: string;
    cellH?: number; noteSz?: number;
    // Tap-to-sound: called with the cell's pitch class. Also the play-it
    // answer input in Reading mode, so the fretboards work like the piano keys.
    onPick?: (pc: number) => void;
  } = $props();
</script>

<div class="mono" style="font-size:9px;letter-spacing:.14em;color:#9c8460;margin-bottom:5px">{label}</div>
<div style="margin-bottom:14px">
  {#each rows as s (s.label)}
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <div class="mono" style="width:14px;text-align:center;font-size:9px;font-weight:700;color:#7d5230">{s.label}</div>
      <div class="fret-lane">
        {#each s.cells as c, i (i)}
          {@const onNut = i === 0 ? 'position:absolute;left:0;top:50%;transform:translate(-50%,-50%);z-index:4;' : ''}
          <div class="fret-cell" class:click={!!onPick} style="height:{cellH}px" role={onPick ? 'button' : undefined} tabindex="-1" onclick={() => onPick?.(c.pc)}>
            {#if c.showLit}
              <div class="fret-note" style="{onNut}width:{noteSz}px;height:{noteSz}px;font-size:8px;background:{c.bg};box-shadow:{c.glow};opacity:{c.litOpacity}">{c.note}</div>
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
