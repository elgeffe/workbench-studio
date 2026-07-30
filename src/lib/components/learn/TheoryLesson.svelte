<script lang="ts">
  // Harmony, taught with the same chips the Chords tab builds with.
  //
  // The jazz and classical palettes below used to be two of the four styles of
  // the chord workshop, each carrying a paragraph explaining itself. They were
  // never really tools — they are the lesson. So they live here, and every chip
  // still places a chord into the progression next door: read about a secondary
  // dominant, tap it, hear it, keep it.
  import { useStore } from '../../context';
  import ChordInspector from '../parts/ChordInspector.svelte';
  import type { Chord } from '../../engine/constants';
  const store = useStore();
  const v = $derived(store.view);

  function add(e: Event, ch: Chord) { e.stopPropagation(); store.addChange(ch); }
</script>

<div class="caption" style="font-size:13px;max-width:560px;margin-bottom:13px">Eight building blocks of jazz &amp; groove harmony, then the two palettes they come from. Every chord plays through the instruments and its <b>+</b> places it in your progression — change the key up top to take any of it anywhere.</div>

<!-- chapter nav -->
<div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:18px;border-bottom:1px solid #ddccac">
  {#each v.jazzNav as c (c.i)}
    <div class="click" style="flex:none;display:flex;flex-direction:column;gap:3px;padding:8px 13px;border-radius:8px;border:1.5px solid {c.border};background:{c.bg}" role="button" tabindex="0" onclick={() => store.setJazzCh(c.i)} onkeydown={(e) => e.key === 'Enter' && store.setJazzCh(c.i)}>
      <span class="mono" style="font-size:7.5px;letter-spacing:.1em;color:#a08a64;white-space:nowrap">{c.tag}</span>
      <span class="serif" style="font-size:15px;font-weight:600;color:{c.fg};line-height:1;white-space:nowrap">{c.name}</span>
    </div>
  {/each}
</div>

<div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
  <span style="font-size:26px;font-weight:700;letter-spacing:-.01em">{v.jazzTitle}</span>
  <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#c2562e;padding:3px 8px;border-radius:9px">{v.jazzTag}</span>
</div>
<div class="caption" style="font-size:15px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:18px">{v.jazzIntro}</div>

{#each v.jazzBlocks as b, bi (bi)}
  {#if b.kind === 'h'}
    <div class="mono" style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8a7350;margin:16px 0 8px">{b.text}</div>
  {:else if b.kind === 'p'}
    <div class="serif" style="font-size:14.5px;color:#4a3d29;line-height:1.55;max-width:560px;margin-bottom:6px">{b.text}</div>
  {:else if b.kind === 'chords'}
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px">
      {#each b.items ?? [] as c, i (i)}
        <div class="click" style="min-width:96px;border-radius:8px;border:1.5px solid {c.fnColor};background:{c.tint};padding:9px 13px;text-align:center" role="button" tabindex="0" onclick={() => store.hitChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.hitChord(c.ch)}>
          <div style="font-size:18px;font-weight:700;color:#2c261d;line-height:1.05;white-space:nowrap">{c.name}</div>
          <div class="mono" style="font-size:9px;letter-spacing:.02em;color:{c.fnColor};margin-top:3px">{c.sub}</div>
        </div>
      {/each}
    </div>
  {:else if b.kind === 'seq'}
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#f3ead4;border:1px solid #e0cfae;border-radius:10px;padding:11px 12px;margin-bottom:9px">
      <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.06em;color:#fff;background:#3f6b5f;padding:11px 15px;border-radius:7px;box-shadow:0 3px 0 #2c4f45" role="button" tabindex="0" onclick={() => store.playSeq(b.seqChords ?? [])} onkeydown={(e) => e.key === 'Enter' && store.playSeq(b.seqChords ?? [])}>▶ PLAY</div>
      <div style="display:flex;flex-direction:column;gap:5px;min-width:0">
        <span class="mono" style="font-size:9px;letter-spacing:.06em;color:#7a6b50">{b.label}</span>
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          {#each b.items ?? [] as c, i (i)}
            <div class="click" style="border-radius:7px;border:1.5px solid {c.fnColor};background:{c.tint};padding:7px 12px;text-align:center" role="button" tabindex="0" onclick={() => store.hitChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.hitChord(c.ch)}>
              <div style="font-size:15px;font-weight:700;color:#2c261d;line-height:1;white-space:nowrap">{c.name}</div>
              <div class="mono" style="font-size:8px;color:{c.fnColor};margin-top:2px">{c.sub}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if b.kind === 'callout'}
    <div style="display:flex;gap:10px;background:#efe2c8;border-left:3px solid #c2562e;border-radius:0 8px 8px 0;padding:12px 14px;margin:10px 0 6px;max-width:560px">
      <span class="mono" style="font-size:11px;color:#c2562e;flex:none">★</span>
      <span class="caption" style="font-size:14px;color:#4a3d29;line-height:1.5">{b.text}</span>
    </div>
  {/if}
{/each}

<!-- ---- the jazz palette ---- -->
<div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
  <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
    <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">The jazz palette</span>
    <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#c2562e;padding:3px 8px;border-radius:9px">BUILD WITH IT</span>
  </div>
  <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:14px">Jazz keeps the seven chords of the key and then reaches outside them in two directions: <b>borrowing</b> from the parallel minor for colour, and <b>tonicising</b> any degree with its own dominant. Tap to hear, <b>+</b> to place.</div>

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
</div>

<!-- ---- the classical palette ---- -->
<div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
  <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
    <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">The classical palette</span>
    <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">VOICE LEADING</span>
  </div>
  <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:14px">Plain triads, moved by the smallest step available. The cadences are the phrase endings the whole style is organised around; the inversions below are how the bass gets to walk instead of leap.</div>

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
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
    {#each v.clDia as c, i (i)}
      <div class="click" style="position:relative;flex:1 1 76px;min-width:72px;border-radius:6px;border:1.5px solid {c.border};background:{c.tint};padding:0 4px 7px;text-align:center;overflow:hidden" role="button" tabindex="0" onclick={() => store.previewChord(c.ch)} onkeydown={(e) => e.key === 'Enter' && store.previewChord(c.ch)}>
        <div style="height:4px;margin:0 -4px 6px;background:{c.fnColor}"></div>
        <div class="mono" style="font-size:9px;color:{c.fnColor}">{c.roman}</div>
        <div style="font-size:15px;font-weight:600;color:#2c261d">{c.name}</div>
        <div class="mono" style="position:absolute;top:6px;right:3px;width:16px;height:16px;border-radius:50%;background:#fff;border:1px solid {c.fnColor};color:{c.fnColor};font-size:11px;line-height:14px;text-align:center" role="button" tabindex="0" onclick={(e) => add(e, c.ch)} onkeydown={(e) => e.key === 'Enter' && add(e, c.ch)}>+</div>
      </div>
    {/each}
  </div>
</div>

<!-- ---- the moves, on whatever you have selected ---- -->
{#if v.exploreOpen}
  <div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
    <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">What you can do to a chord</span>
      <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#b07d23;padding:3px 8px;border-radius:9px">LIVE</span>
    </div>
    <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:14px">These are the same controls the Chords tab gives you — here with the reasoning attached. Every change lands in your progression immediately.</div>
    <ChordInspector teaching />
  </div>
{:else}
  <div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
    <div class="caption" style="font-size:14px;color:#8a7350;max-width:560px">Place a chord with any <b>+</b> above, then select it to see every move you can make on it — recolour, invert, lead into it, or substitute — each one explained.</div>
  </div>
{/if}
