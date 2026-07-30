<script lang="ts">
  // Song structures as proportional, colour-coded timelines: read each bar left
  // to right as the song from start to finish, block width as duration.
  import { useStore } from '../../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div class="caption" style="font-size:13px;max-width:580px;margin-bottom:6px">How songs are built in time. Every genre answers the same question — <i>how do we keep a listener for the whole ride?</i> — with a different map. Block width is how long that section lasts. The arc below runs from tight 3-minute pop to its opposite extreme: the 20-minute fusion landscape.</div>

<div class="mono" style="display:flex;gap:12px;flex-wrap:wrap;font-size:8px;letter-spacing:.06em;color:#7a6b50;margin-bottom:14px">
  {#each v.formKindLegend as l (l.name)}
    <span style="display:inline-flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:2px;background:{l.color};display:inline-block"></span>{l.name}</span>
  {/each}
</div>

<div style="display:flex;flex-direction:column;gap:12px;max-width:680px">
  {#each v.songForms as f (f.id)}
    <div style="border:1px solid #e0cfae;background:#fbf6ea;border-radius:10px;padding:13px 15px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px">
        <span style="font-size:17px;font-weight:700;color:#2c261d">{f.name}</span>
        <span class="mono" style="font-size:7.5px;letter-spacing:.14em;color:#fff;background:{f.id === 'fusion' ? '#c2562e' : '#3f6b5f'};padding:3px 8px;border-radius:9px">{f.genre}</span>
        <span class="mono" style="font-size:9px;color:#a08a64">{f.dur}</span>
      </div>
      <div style="display:flex;gap:2px;height:34px;margin-bottom:9px">
        {#each f.sections as s, i (i)}
          <div class="mono" title={s.label} style="flex:0 0 calc({s.pct}% - 2px);background:{s.bg};border-radius:4px;color:#fff;font-size:7px;letter-spacing:.02em;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;padding:0 2px;line-height:1.15">{s.label}</div>
        {/each}
      </div>
      <div class="serif" style="font-size:14.5px;color:#4a3d29;line-height:1.55;margin-bottom:7px">{f.text}</div>
      <div class="caption" style="font-size:12px;color:#8a7350"><b>Hear it:</b> {f.listen}</div>
    </div>
  {/each}
</div>
