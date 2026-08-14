<script lang="ts">
  // Key and scale, on demand.
  //
  // These two rows used to sit permanently under the tabs, on every tab, at a
  // cost of ~85px — which is backwards: you set the key once a session and
  // reach for the transport a hundred times. So they live behind the studio
  // bar's key button now: a popover on a desktop, a sheet on a phone.
  //
  // The Circle tab keeps its own scale row inline, because choosing keys and
  // scales is what that tab is *for* — this is for everywhere else.
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

{#snippet body()}
  <div class="mono" style="font-size:9px;letter-spacing:.18em;color:#8a7350;margin-bottom:7px">KEY</div>
  <div class="wb-keygrid">
    {#each v.keyChips as k (k.pc)}
      <div class="wb-keychip click" style="border-color:{k.border};background:{k.bg};color:{k.fg}" role="button" tabindex="0" aria-label={k.label} aria-pressed={k.active} title="{k.label} — {k.char}" onclick={() => store.setTonicKey(k.pc)} onkeydown={(e) => e.key === 'Enter' && store.setTonicKey(k.pc)}>
        <span class="wb-keychip-l">{k.note}{#if k.acc}<span class="wb-keychip-a">{k.acc}</span>{/if}</span>
      </div>
    {/each}
  </div>

  <div class="mono" style="font-size:9px;letter-spacing:.18em;color:#8a7350;margin-bottom:7px">SCALE</div>
  <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">
    {#each v.scalePrimary as m (m.id)}
      <div class="mono click" style="font-size:10px;letter-spacing:.02em;padding:7px 12px;border-radius:14px;border:1px solid {m.border};background:{m.bg};color:{m.fg};white-space:nowrap" role="button" tabindex="0" aria-label={m.id} aria-pressed={store.scale === m.id} onclick={() => store.setScale(m.id)} onkeydown={(e) => e.key === 'Enter' && store.setScale(m.id)}>{m.name}</div>
    {/each}
  </div>
  <div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-bottom:11px">
    <span class="mono" style="flex:none;font-size:8px;letter-spacing:.12em;color:#a08a64">MODES</span>
    {#each v.scaleModes as m (m.id)}
      <div class="mono click" style="font-size:10px;letter-spacing:.02em;padding:7px 12px;border-radius:14px;border:1px solid {m.border};background:{m.bg};color:{m.fg};white-space:nowrap" role="button" tabindex="0" aria-label={m.id} aria-pressed={store.scale === m.id} onclick={() => store.setScale(m.id)} onkeydown={(e) => e.key === 'Enter' && store.setScale(m.id)}>{m.name}</div>
    {/each}
  </div>

  <div style="border-top:1px solid #e0cfae;padding-top:10px">
    <div class="mono" style="font-size:9px;letter-spacing:.08em;color:#7a6b50;margin-bottom:6px">{v.scaleNotes}{#if v.keySig}&nbsp;· {v.keySig}{/if}</div>
    <!-- Two captions: what the key colours the music like, then what the scale
         does. Key first — it is the choice made one row above. -->
    <!-- On a six-accidental key both spellings are equally correct, so the
         caption names the other one rather than letting the chip pretend the
         choice was obvious. -->
    <div class="caption" style="font-size:12.5px;color:#7a6b50;line-height:1.45;margin-bottom:5px"><span class="serif" style="font-style:normal;font-weight:600;color:#5c4a30">{v.keyCharName}</span>{#if v.keyAlt}<span class="caption" style="color:#8a7350">&nbsp;(also written {v.keyAlt})</span>{/if} — {v.keyChar}</div>
    <div class="caption" style="font-size:13px;color:#5c4a30;line-height:1.45">{v.scaleCaption}</div>
  </div>
{/snippet}

{#if v.keyPickerOpen && store.isDesktop}
  <!-- A desktop popover: anchored under the button, dismissed by the backdrop
       behind it (transparent, full-page) or by Escape. -->
  <div class="wb-pop-back" role="presentation" onclick={() => store.closePicker()}></div>
  <div class="wb-pop" data-testid="key-picker" role="dialog" aria-label="key and scale">
    {@render body()}
  </div>
{:else if v.keyPickerOpen}
  <div class="wb-modal-back" role="presentation" onclick={() => store.closePicker()}>
    <div
      class="wb-modal" data-testid="key-picker" role="dialog" aria-modal="true" aria-label="key and scale"
      onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} tabindex="-1"
    >
      <div class="wb-modal-head">
        <span class="mono" style="font-size:9px;letter-spacing:.16em;color:#8a7350">KEY &amp; SCALE</span>
        <span style="flex:1"></span>
        <span class="wb-modal-close" data-testid="key-picker-close" role="button" tabindex="0" aria-label="close key picker" onclick={() => store.closePicker()} onkeydown={(e) => e.key === 'Enter' && store.closePicker()}>✕ CLOSE</span>
      </div>
      <div class="wb-modal-body">{@render body()}</div>
    </div>
  </div>
{/if}

<svelte:window onkeydown={(e) => { if (v.keyPickerOpen && e.key === 'Escape') store.closePicker(); }} />
