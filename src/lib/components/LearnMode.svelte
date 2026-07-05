<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div class="eyebrow" style="margin-bottom:4px">Learn · jazz harmony in {v.keyName}</div>
  <div class="caption" style="font-size:13px;max-width:560px;margin-bottom:13px">Five building blocks of jazz harmony. Every chord and progression plays through the instruments — change the key up top to take it anywhere. Want to build your own changes? Head to the <b>Workshop → Jazz</b> mode.</div>

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
</div>
