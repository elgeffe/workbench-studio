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
  //
  // And under the grid, the same bar spelled out: the count, the pitch every
  // degree resolves to, the change underneath it, and — while the loop runs —
  // the note in your hands right now, tracked against the audio clock. A
  // degree grid is transposable and unreadable in equal measure; these rows are
  // the other half of it.
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
      <div data-testid="bass-over" style="display:flex;gap:5px;overflow-x:auto;flex:1 1 auto;align-items:center;padding-bottom:2px">
        {#each v.jzChangesView as s, i (i)}
          <div class="mono" style="flex:none;font-size:11px;font-weight:700;color:#2c261d;background:{s.bg};border:1px solid {s.border};border-radius:5px;padding:5px 9px;white-space:nowrap">{s.name}</div>
        {/each}
      </div>
      <div class="mono click" style="flex:none;font-size:9px;letter-spacing:.06em;padding:6px 11px;border-radius:6px;border:1px solid #cbb792;color:#7a6b50" role="button" tabindex="0" onclick={() => store.setMode('chords')} onkeydown={(e) => e.key === 'Enter' && store.setMode('chords')}>EDIT →</div>
    {/if}
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
      loadAllGenre={v.bassGenreName}
      onLoadAll={() => store.setStyle(store.bassGenre)}
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
    <!-- where in the bar each step falls -->
    <div style="display:flex;gap:3px;margin-bottom:4px">
      {#each v.bassBarCount as c (c.s)}
        <div class="mono" style="flex:1;text-align:center;font-size:9px;margin-left:{c.ml}px;font-weight:{c.strong ? '700' : '400'};color:{c.hot ? '#c2562e' : c.strong ? '#5c4a30' : '#a08a64'}">{c.c}</div>
      {/each}
    </div>
    <div style="display:flex;gap:3px">
      {#each v.bassLineCells as c, s (s)}
        <div class="mono click" style="flex:1;height:44px;border-radius:4px;background:{c.bg};color:{c.fg};font-size:12px;line-height:44px;text-align:center;overflow:hidden;margin-left:{s > 0 && s % 4 === 0 ? '5px' : '0'};box-shadow:{c.shadow}" role="button" tabindex="0" aria-current={c.hot ? 'step' : undefined} aria-label={'step ' + (s + 1)} onclick={() => store.cycleBassCell(s)} onkeydown={(e) => e.key === 'Enter' && store.cycleBassCell(s)}>{c.label}</div>
      {/each}
    </div>

    {#if v.bassTrackOn}
      <!-- The same bar twice more: the pitch each degree resolves to, and the
           change it resolves against. A degree grid transposes itself, which is
           the point of it — and the reason it can't tell you what to play
           without these two rows underneath. -->
      <div data-testid="bass-notes" style="display:flex;gap:3px;margin-top:5px">
        {#each v.bassNoteCells as n (n.s)}
          <div class="mono" style="flex:1;height:21px;line-height:18px;border-radius:4px 4px 0 0;text-align:center;overflow:hidden;font-size:10.5px;font-weight:700;margin-left:{n.ml}px;color:{n.fg};background:{n.bg};border:1px solid {n.bd};border-bottom:2px solid {n.tail}" aria-current={n.hot ? 'step' : undefined} aria-label={'note at step ' + (n.s + 1)}>{n.name}<span style="font-size:7.5px;opacity:.75">{n.oct}</span></div>
        {/each}
      </div>
      <div data-testid="bass-changes" style="display:flex;gap:3px;margin-top:4px">
        {#each v.bassChordSpans as sp (sp.start)}
          <div class="mono" style="flex:{sp.grow} 0 {sp.basis}px;min-width:0;height:22px;line-height:20px;text-align:center;overflow:hidden;white-space:nowrap;font-size:10.5px;font-weight:700;margin-left:{sp.ml}px;border-radius:4px;color:#2c261d;background:{sp.bg};border:1px solid {sp.border};box-shadow:{sp.shadow}">{sp.name}</div>
        {/each}
      </div>

      <!-- the one note in your hands right now -->
      <div data-testid="bass-now" style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:9px;min-height:22px">
        {#if v.bassNowOn}
          <span class="mono" style="flex:none;font-size:8px;letter-spacing:.14em;color:#8a7350">NOW</span>
          <span class="mono" style="flex:none;font-size:15px;font-weight:700;color:{v.bassNowColor}">{v.bassNowNote}</span>
          <span class="caption" style="font-size:12.5px;color:#7a6b50">
            {#if v.bassNowDeg}the <b>{v.bassNowDeg}</b> of {v.bassNowChord}{:else}muted — no pitch{/if} · on <b>{v.bassNowCount}</b>
          </span>
        {:else}
          <span class="caption" style="font-size:12.5px;color:#9a8763">{v.bassTrackHint}</span>
        {/if}
      </div>
    {/if}

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
