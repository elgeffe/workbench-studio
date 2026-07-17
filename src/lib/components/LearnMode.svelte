<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div class="eyebrow" style="margin-bottom:4px">Learn · {v.learnTabRhythm ? 'rhythm & drum patterns' : 'jazz & groove harmony in ' + v.keyName}</div>

  <!-- learn-area tabs: harmony curriculum vs rhythm theory -->
  <div data-testid="learn-tabs" style="display:flex;gap:7px;margin-bottom:13px">
    {#each v.learnTabs as tb (tb.id)}
      <div class="mono click" style="font-size:10px;letter-spacing:.08em;padding:9px 14px;border-radius:7px;border:1.5px solid {tb.border};background:{tb.bg};color:{tb.fg};white-space:nowrap" role="tab" tabindex="0" aria-selected={store.learnTab === tb.id} onclick={() => store.setLearnTab(tb.id)} onkeydown={(e) => e.key === 'Enter' && store.setLearnTab(tb.id)}>{tb.name}</div>
    {/each}
  </div>

  {#if v.learnTabRhythm}
  <!-- rhythm & drum-pattern theory: each concept card plays a one-bar demo -->
  <div class="caption" style="font-size:13px;max-width:560px;margin-bottom:16px">How drum &amp; percussion patterns are constructed — from the 16-step grid up to clave timelines and swing. Every card plays a one-bar demo through the drum kit. Then go build them yourself in the <b>Drums</b> groovebox, where every genre template comes apart layer by layer.</div>
  <div style="display:flex;flex-direction:column;gap:12px;max-width:640px">
    {#each v.rhythmConcepts as c (c.id)}
      <div style="border:1px solid #e0cfae;background:#fbf6ea;border-radius:10px;padding:13px 15px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
          <span style="font-size:17px;font-weight:700;color:#2c261d">{c.name}</span>
          <span class="mono" style="font-size:7.5px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">{c.tag}</span>
          <span class="mono" style="font-size:9px;color:#a08a64">{c.bpm} BPM</span>
          <div class="mono click" style="margin-left:auto;flex:none;font-size:10px;letter-spacing:.06em;color:#fff;background:#c2562e;padding:9px 14px;border-radius:7px;box-shadow:0 3px 0 #9a3f1f" role="button" tabindex="0" onclick={() => store.playRhythmDemo(c.id)} onkeydown={(e) => e.key === 'Enter' && store.playRhythmDemo(c.id)}>▶ HEAR IT</div>
        </div>
        <div class="serif" style="font-size:14.5px;color:#4a3d29;line-height:1.55">{c.text}</div>
      </div>
    {/each}
  </div>

  {:else}
  <div class="caption" style="font-size:13px;max-width:560px;margin-bottom:13px">Seven building blocks of jazz &amp; groove harmony — from extensions to funky basslines. Every chord and progression plays through the instruments — change the key up top to take it anywhere. Want to build your own changes? Head to the <b>Workshop → Jazz</b> mode.</div>

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

  <!-- Bassline tricks of the trade — named techniques, each with a one-bar
       audio demo over the current key (tap to hear). -->
  <div style="border-top:1px solid #ddccac;margin-top:26px;padding-top:18px">
    <div style="display:flex;align-items:baseline;gap:11px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:22px;font-weight:700;letter-spacing:-.01em">Tricks of the trade</span>
      <span class="mono" style="font-size:8px;letter-spacing:.14em;color:#fff;background:#3f6b5f;padding:3px 8px;border-radius:9px">BASSLINE MOVES</span>
    </div>
    <div class="caption" style="font-size:14px;color:#5c4a30;line-height:1.5;max-width:560px;margin-bottom:14px">The handful of moves behind every great bassline — tap one to hear a one-bar demo in {v.keyName}. Build lines from them over in the <b>Workshop → Bass</b> mode.</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">
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
  </div>
  {/if}
</div>
