<script lang="ts">
  // The bass tab. It used to be the fourth style of the chord workshop, two
  // levels down, and it only sounded while you were looking at it. It is a
  // part of the band now — a loaded line plays from wherever you are, and the
  // MIX toggles are what silence it.
  //
  // A bassline resolves its degree tokens against the changes, so the
  // progression is shown here read-only: you need to see what the line is
  // walking through without leaving the tab to check.
  import { useStore } from '../context';
  import GenrePicker from './GenrePicker.svelte';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div class="eyebrow" style="margin-bottom:11px">Bass · {v.keyName}</div>

  <!-- what the line is walking through -->
  <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:12px">
    <span class="mono" style="flex:none;font-size:8px;letter-spacing:.14em;color:#8a7350">OVER</span>
    {#if v.jzEmpty}
      <span class="caption" style="font-size:13px;color:#9a8763">No changes loaded — the line needs a progression to walk through.</span>
      <div class="mono click" style="font-size:9px;letter-spacing:.06em;padding:6px 11px;border-radius:6px;border:1px solid #cbb792;background:#f6efe0;color:#5c4a30" role="button" tabindex="0" onclick={() => store.setMode('chords')} onkeydown={(e) => e.key === 'Enter' && store.setMode('chords')}>GO TO CHORDS →</div>
    {:else}
      <div style="display:flex;gap:5px;overflow-x:auto;flex:1 1 auto;align-items:center;padding-bottom:2px">
        {#each v.jzChangesView as s, i (i)}
          <div class="mono" style="flex:none;font-size:11px;font-weight:700;color:#2c261d;background:{s.bg};border:1px solid {s.border};border-radius:5px;padding:5px 9px;white-space:nowrap">{s.name}</div>
        {/each}
      </div>
      <div class="mono click" style="flex:none;font-size:9px;letter-spacing:.06em;padding:6px 11px;border-radius:6px;border:1px solid #cbb792;color:#7a6b50" role="button" tabindex="0" onclick={() => store.setMode('chords')} onkeydown={(e) => e.key === 'Enter' && store.setMode('chords')}>EDIT →</div>
    {/if}
  </div>

  <!-- transport + mix -->
  <div style="display:flex;align-items:center;gap:13px;flex-wrap:wrap;background:#f3ead4;border:1px solid #e0cfae;border-radius:10px;padding:11px 13px;margin-bottom:14px">
    <div class="mono click" data-testid="bass-play" style="flex:none;font-size:12px;letter-spacing:.06em;color:#fff;background:{v.jzPlayBg};padding:11px 20px;border-radius:7px;box-shadow:0 4px 0 {v.jzPlayShadow}" role="button" tabindex="0" onclick={() => store.togglePlay()} onkeydown={(e) => e.key === 'Enter' && store.togglePlay()}>{v.jzPlayLabel}</div>
    <div style="display:flex;align-items:center;gap:7px">
      <span class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350">MIX</span>
      <div style="display:flex;gap:3px;background:#ece0c6;border:1px solid #cbb792;border-radius:7px;padding:2px">
        <div class="mono click" data-testid="mix-chords" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.mixChordsBg};color:{v.mixChordsFg}" role="button" tabindex="0" aria-pressed={v.mixChordsBg !== '#f6efe0'} onclick={() => store.toggleBassChords()} onkeydown={(e) => e.key === 'Enter' && store.toggleBassChords()}>♩ CHORDS</div>
        <div class="mono click" data-testid="mix-bass" style="font-size:9px;padding:6px 11px;border-radius:5px;background:{v.mixBassBg};color:{v.mixBassFg}" role="button" tabindex="0" aria-pressed={v.mixBassBg !== '#f6efe0'} onclick={() => store.toggleBassOn()} onkeydown={(e) => e.key === 'Enter' && store.toggleBassOn()}>♪ BASS</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex:1 1 150px;min-width:140px">
      <span class="mono" style="font-size:9px;color:#8a7350;letter-spacing:.08em">TEMPO</span>
      <input type="range" min="50" max="170" value={v.tempo} oninput={(e) => store.setTempo(+e.currentTarget.value)} style="flex:1" />
      <span class="mono" style="font-size:11px;color:#2c261d;width:34px;text-align:right">{v.tempo}</span>
    </div>
  </div>

  <!-- genre → groove -->
  <div style="margin-bottom:12px">
    <GenrePicker
      open={v.bassPickerOpen}
      label="GROOVE"
      summaryGenre={v.bassGenreName}
      summaryItem={v.bassActiveName}
      hint="{v.bassCount} basslines · {v.bassGenreTotal} genres"
      shelves={v.bassShelves}
      items={v.bassGenreChips}
      itemsLabel="BASSLINES"
      compact={!store.isDesktop}
      testid="bass-picker"
      onOpen={() => store.openPicker('bass')}
      onClose={() => store.closePicker()}
      onGenre={(id) => store.setBassGenre(id)}
      onItem={(id) => store.setBassPat(id)}
    />
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
  </div>

  <!-- BUILD YOUR OWN — a 16-step grid you edit by hand -->
  <div class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64;margin-bottom:6px">BUILD YOUR OWN · tap a step to cycle its note · plays live in the loop</div>
  <div class="click" style="border:1.5px solid {v.bassCustomSelected ? '#c2562e' : '#e0cfae'};background:{v.bassCustomSelected ? '#fbeede' : '#fbf6ea'};box-shadow:{v.bassCustomSelected ? '0 0 0 2px #c2562e' : 'none'};border-radius:9px;padding:11px 12px;margin-bottom:14px" role="button" tabindex="0" onclick={() => store.setBassPat('custom')} onkeydown={(e) => e.key === 'Enter' && store.setBassPat('custom')}>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <span style="font-size:16px;font-weight:700;color:#2c261d">Your line{#if v.bassCustomSelected} <span class="mono" style="font-size:8px;letter-spacing:.06em;color:#fff;background:#c2562e;padding:3px 7px;border-radius:9px;vertical-align:middle">ACTIVE</span>{/if}</span>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span class="mono" style="font-size:8px;letter-spacing:.08em;color:#8a7350">SEED</span>
        {#each v.bassSeedChips as sc (sc.id)}
          <div class="mono click" style="font-size:9px;letter-spacing:.02em;padding:5px 9px;border-radius:6px;border:1px solid #cbb792;background:#f6efe0;color:#5c4a30;white-space:nowrap" role="button" tabindex="0" onclick={(e) => { e.stopPropagation(); store.seedBassCustom(sc.id); }} onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); store.seedBassCustom(sc.id); } }}>{sc.name}</div>
        {/each}
        <div class="mono click" style="font-size:9px;letter-spacing:.04em;padding:5px 9px;border-radius:6px;border:1px solid #cbb792;color:#7a6b50;white-space:nowrap" role="button" tabindex="0" onclick={(e) => { e.stopPropagation(); store.clearBassCustom(); }} onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); store.clearBassCustom(); } }}>CLEAR</div>
      </div>
    </div>
    <div style="display:flex;gap:2px">
      {#each v.bassCustomCells as c, s (s)}
        <div class="mono click" style="flex:1;height:34px;border-radius:3px;background:{c.bg};color:{c.fg};font-size:10px;line-height:34px;text-align:center;overflow:hidden;margin-left:{s > 0 && s % 4 === 0 ? '4px' : '0'};box-shadow:{c.label ? 'inset 0 -2px 0 rgba(0,0,0,.12)' : 'none'}" role="button" tabindex="0" aria-label={'step ' + (s + 1)} onclick={(e) => { e.stopPropagation(); store.cycleBassCell(s); }} onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); store.cycleBassCell(s); } }}>{c.label}</div>
      {/each}
    </div>
    <div class="caption" style="font-size:11.5px;color:#6b5a3e;margin-top:8px">Tap a step to cycle <b>rest → R → 3 → 5 → ♭7 → 8 → ×</b> (ghost). Seed from a groove above, then tweak.</div>
  </div>
</div>
