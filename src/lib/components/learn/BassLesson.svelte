<script lang="ts">
  // The handful of moves behind every bassline, each with a one-bar demo over
  // the current key, plus the legend that explains what the coloured cells in
  // the Bass tab's grids actually mean.
  import { useStore } from '../../context';
  import GenrePicker from '../GenrePicker.svelte';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
  <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">Tricks of the trade</span>
  <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">BASSLINE MOVES</span>
</div>
<div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:14px">Tap one to hear a one-bar demo in {v.keyName}. Build lines from them over in <b>Bass</b>.</div>

<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px">
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

<!-- how to read the grid you build lines on -->
<div style="border-top:1px solid #ddccac;padding-top:18px">
  <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
    <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">Reading the grid</span>
    <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#b07d23;padding:3px 8px;border-radius:9px">16 SIXTEENTHS</span>
  </div>
  <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:12px">A line is written as one bar of sixteenths, and each cell holds a <i>degree</i> rather than a note — so the same line transposes itself through every change. Each note sustains up to the next, which is what makes a written-out line sound legato rather than plucked.</div>
  <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:12px">
    {#each v.bassLegend as l (l.name)}
      <span style="display:inline-flex;align-items:center;gap:5px">
        <span style="width:10px;height:10px;border-radius:3px;background:{l.color};flex:none"></span>
        <span class="mono" style="font-size:9px;letter-spacing:.05em;color:#7a6b50">{l.name}</span>
      </span>
    {/each}
  </div>
  <div class="caption" style="font-size:13.5px;color:#5c4a30;line-height:1.5;max-width:560px">↑↓ approach the next chord by a semitone; → lands its root early. On <b>½ BAR</b> changes each half of the line resolves against its own chord, so the approach notes always walk into whatever is actually coming. Use <b>MIX</b> in the Bass tab to mute the chords and study the line alone.</div>
</div>

<!-- ---- the library, annotated ---- -->
<div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
  <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
    <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">The groove library</span>
    <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">{v.bassCount} LINES</span>
  </div>
  <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:14px">What each groove is doing, and why it works where it works. Tap one to load it into your line over in <b>Bass</b> — these are starting points, not finished parts.</div>

  <div style="margin-bottom:14px">
    <GenrePicker
      open={v.bassPickerOpen}
      label="GENRE"
      summaryGenre={v.bassGenreName}
      summaryItem="{v.bassGrooves.length} grooves"
      hint="{v.bassCount} basslines · {v.bassGenreTotal} genres"
      shelves={v.bassShelves}
      items={v.bassGenreChips}
      itemsLabel="BASSLINES · tap to load into your line"
      inline={store.isDesktop}
      compact={!store.isDesktop}
      testid="learn-bass-picker"
      onOpen={() => store.openPicker('bass')}
      onClose={() => store.closePicker()}
      onGenre={(id) => store.setBassGenre(id)}
      onItem={(id) => store.loadBassGroove(id)}
    />
  </div>

  <div data-testid="bass-grooves" style="display:flex;flex-wrap:wrap;gap:8px">
    {#each v.bassGrooves as p (p.id)}
      <div class="click" style="flex:1 1 290px;min-width:270px;max-width:440px;border:1.5px solid {p.loaded ? '#c2562e' : '#e0cfae'};background:{p.loaded ? '#fbeede' : '#fbf6ea'};border-radius:9px;padding:11px 12px" role="button" tabindex="0" aria-label={'load ' + p.name} onclick={() => store.loadBassGroove(p.id)} onkeydown={(e) => e.key === 'Enter' && store.loadBassGroove(p.id)}>
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
</div>
