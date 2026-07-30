<script lang="ts">
  // The bass tab: one line, which is yours.
  //
  // The library used to sit here as a row of selectable cards, so "the
  // bassline" was either a library pattern *or* your grid — two things
  // competing for the same job. Now there is one line and the library loads
  // into it. The annotated grooves, which are reference rather than tool, read
  // in Learn → Bass.
  //
  // A line resolves its degree tokens against the changes, so the progression
  // is shown read-only: you need to see what you are walking through without
  // leaving the tab to check.
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

  <!-- load a starting point into the line -->
  <div style="margin-bottom:14px">
    <GenrePicker
      open={v.bassPickerOpen}
      label="START FROM"
      summaryGenre={v.bassGenreName}
      summaryItem={v.bassLineName}
      hint="{v.bassCount} basslines · {v.bassGenreTotal} genres"
      shelves={v.bassShelves}
      items={v.bassGenreChips}
      itemsLabel="BASSLINES · tap to load into your line"
      inline={store.isDesktop}
      compact={!store.isDesktop}
      testid="bass-picker"
      onOpen={() => store.openPicker('bass')}
      onClose={() => store.closePicker()}
      onGenre={(id) => store.setBassGenre(id)}
      onItem={(id) => store.loadBassGroove(id)}
    />
  </div>

  <!-- THE line -->
  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px">
    <span class="mono" style="font-size:9px;letter-spacing:.12em;color:#a08a64">YOUR LINE · tap a step to cycle its note · plays live in the loop</span>
    <div style="display:flex;align-items:center;gap:6px">
      <div class="mono click" style="font-size:9px;letter-spacing:.06em;padding:6px 11px;border-radius:6px;border:1px solid #cbb792;color:#7a6b50;white-space:nowrap" role="button" tabindex="0" aria-label="the moves behind a bassline" onclick={() => store.openLearn('bass')} onkeydown={(e) => e.key === 'Enter' && store.openLearn('bass')}>? THE MOVES</div>
      <div class="mono click" data-testid="bass-clear" style="font-size:9px;letter-spacing:.06em;padding:6px 11px;border-radius:6px;border:1px solid #cbb792;color:#7a6b50;white-space:nowrap" role="button" tabindex="0" onclick={() => store.clearBassLine()} onkeydown={(e) => e.key === 'Enter' && store.clearBassLine()}>CLEAR</div>
    </div>
  </div>
  <div data-testid="bass-line" style="border:1.5px solid #e0cfae;background:#fbf6ea;border-radius:9px;padding:12px">
    <div style="display:flex;gap:3px">
      {#each v.bassLineCells as c, s (s)}
        <div class="mono click" style="flex:1;height:44px;border-radius:4px;background:{c.bg};color:{c.fg};font-size:12px;line-height:44px;text-align:center;overflow:hidden;margin-left:{s > 0 && s % 4 === 0 ? '5px' : '0'};box-shadow:{c.label ? 'inset 0 -2px 0 rgba(0,0,0,.12)' : 'none'}" role="button" tabindex="0" aria-label={'step ' + (s + 1)} onclick={() => store.cycleBassCell(s)} onkeydown={(e) => e.key === 'Enter' && store.cycleBassCell(s)}>{c.label}</div>
      {/each}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:11px">
      {#each v.bassLegend as l (l.name)}
        <span style="display:inline-flex;align-items:center;gap:5px">
          <span style="width:10px;height:10px;border-radius:3px;background:{l.color};flex:none"></span>
          <span class="mono" style="font-size:9px;letter-spacing:.05em;color:#7a6b50">{l.name}</span>
        </span>
      {/each}
    </div>
    {#if v.bassLineEmpty}
      <div class="caption" style="font-size:12.5px;color:#9a8763;margin-top:9px">Empty — load a groove above to start from, or tap steps to write one. Each cell holds a <b>degree</b>, so the line transposes itself through every change.</div>
    {/if}
  </div>
</div>
