<script lang="ts">
  import type { Diagram } from '../engine/fretpatterns';
  let { d }: { d: Diagram } = $props();

  // Horizontal mini-neck: rows are strings (high string on top, matching the
  // app's big fretboards), columns are frets, dots carry their role label.
  const labelW = 15, fretW = 30, rowH = 17, top = 7, bottom = 14;
  const cols = $derived(d.frets.length);
  const rows = $derived(d.labels.length);
  const w = $derived(labelW + cols * fretW + 3);
  const h = $derived(top + rows * rowH + bottom);
  const rowY = (r: number) => top + r * rowH + rowH / 2;
  const colX = (c: number) => labelW + c * fretW + fretW / 2;
</script>

<svg viewBox="0 0 {w} {h}" width={w} height={h} style="display:block">
  <!-- strings -->
  {#each d.labels as lb, r (r)}
    <line x1={labelW} y1={rowY(r)} x2={labelW + cols * fretW} y2={rowY(r)} stroke="#d8c7a8" stroke-width="1" />
    <text x="2" y={rowY(r) + 2.5} font-size="7" fill={d.mutes.includes(r) ? '#c9ba98' : '#8a7350'} class="mono">{lb}</text>
  {/each}
  <!-- fret lines -->
  {#each Array(cols + 1) as _, c (c)}
    <line x1={labelW + c * fretW} y1={rowY(0)} x2={labelW + c * fretW} y2={rowY(rows - 1)} stroke={c === 0 && d.startFret === 0 ? '#8a7350' : '#e0cfae'} stroke-width={c === 0 && d.startFret === 0 ? 2.5 : 1} />
  {/each}
  <!-- barres (under the dots) -->
  {#each d.barres as b, i (i)}
    <rect x={colX(b.col) - 4.5} y={rowY(b.row0) - 7.5} width="9" height={(b.row1 - b.row0) * rowH + 15} rx="4.5" fill="#4a3a28" opacity="0.82" />
  {/each}
  <!-- muted strings -->
  {#each d.mutes as r (r)}
    <text x={labelW + 3} y={rowY(r) + 2.5} font-size="7.5" fill="#b3a68f" class="mono">×</text>
  {/each}
  <!-- dots -->
  {#each d.dots as dot, i (i)}
    <circle cx={colX(dot.col)} cy={rowY(dot.row)} r="6.4" fill={dot.color} />
    <text x={colX(dot.col)} y={rowY(dot.row) + 2.1} font-size="5.8" fill="#fff" text-anchor="middle" font-weight="700" class="mono">{dot.label}</text>
  {/each}
  <!-- fret numbers -->
  {#each d.frets as f, c (c)}
    <text x={colX(c)} y={h - 3} font-size="6.5" fill="#a08a64" text-anchor="middle" class="mono">{f}</text>
  {/each}
</svg>
