<script lang="ts">
  import type { ReadClef, StaffAccidental } from '../engine/reading';

  // A five-line staff drawn from pre-computed coordinates (see engine/reading):
  // lines at y 40..80, clef glyph, key-signature accidentals, then noteheads
  // with their ledger lines and optional inline accidental / letter label.
  interface DrawNote { x: number; y: number; acc: string; ledger: number[]; label?: string }
  let {
    clef, keyAcc = [], notes = [], vbW = 260, width = 300,
  }: {
    clef: ReadClef;
    keyAcc?: StaffAccidental[];
    notes?: DrawNote[];
    vbW?: number;
    width?: number;
  } = $props();
</script>

<svg viewBox="0 0 {vbW} 120" {width} style="max-width:100%;height:auto;background:#fbf4e4;border:1px solid #e0cfae;border-radius:10px" aria-label="{clef} staff">
  {#each [40, 50, 60, 70, 80] as ly (ly)}
    <line x1="8" y1={ly} x2={vbW - 8} y2={ly} stroke="#b7a888" stroke-width="1" />
  {/each}
  {#if clef === 'treble'}
    <text x="10" y="73" style="font-family:serif;font-size:46px;fill:#3a2c1d">𝄞</text>
  {:else}
    <text x="11" y="70" style="font-family:serif;font-size:42px;fill:#3a2c1d">𝄢</text>
  {/if}
  {#each keyAcc as a, i (i)}
    <text x={a.x} y={a.y} text-anchor="middle" dominant-baseline="central" style="font-family:serif;font-size:19px;font-weight:600;fill:#2c261d">{a.glyph}</text>
  {/each}
  {#each notes as n, i (i)}
    {#each n.ledger as ly (ly)}
      <line x1={n.x - 10} y1={ly} x2={n.x + 10} y2={ly} stroke="#8a7350" stroke-width="1.3" />
    {/each}
    {#if n.acc}
      <text x={n.x - 14} y={n.y} text-anchor="middle" dominant-baseline="central" style="font-family:serif;font-size:17px;font-weight:600;fill:#2c261d">{n.acc}</text>
    {/if}
    <ellipse cx={n.x} cy={n.y} rx="6.2" ry="4.4" transform="rotate(-14 {n.x} {n.y})" fill="#2c261d" />
    {#if n.label}
      <text x={n.x} y="104" text-anchor="middle" class="mono" style="font-size:9px;letter-spacing:.04em;fill:#7a6b50">{n.label}</text>
    {/if}
  {/each}
</svg>
