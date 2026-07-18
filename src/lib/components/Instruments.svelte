<script lang="ts">
  import { useStore } from '../context';
  import Fretboard from './Fretboard.svelte';
  import Piano from './Piano.svelte';

  let { variant = 'side' }: { variant?: 'side' | 'dock' } = $props();
  const store = useStore();
  const v = $derived(store.view);
</script>

{#if variant === 'side'}
  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px">
    <div class="eyebrow">Sounding now</div>
    <div class="mono" style="font-size:9px;color:#a08a64">bass · guitar · piano</div>
  </div>
  <div style="font-size:26px;font-weight:700;line-height:1;margin-bottom:2px;min-height:28px">{v.dockName}</div>
  <div class="mono" style="font-size:11px;color:#7a6b50;margin-bottom:16px;min-height:14px">{v.dockNotes}</div>
{/if}

{#if v.showFingerToggle}
  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;padding:9px 11px;background:#f3ead4;border:1px solid #e0cfae;border-radius:8px">
    <div class="mono click" style="font-size:9px;letter-spacing:.08em;padding:7px 12px;border-radius:6px;background:{v.fingerBg};color:{v.fingerFg}" role="button" tabindex="0" onclick={() => store.toggleFinger()} onkeydown={(e) => e.key === 'Enter' && store.toggleFinger()}>⊙ FINGERING</div>
    {#if v.overlayOn}
      <div style="display:flex;align-items:center;gap:6px">
        <span class="mono" style="font-size:8px;letter-spacing:.1em;color:#8a7350">INV</span>
        <div style="display:flex;gap:3px">
          {#each v.invOpts as o (o.i)}
            <div class="mono click" style="font-size:8.5px;padding:5px 8px;border-radius:5px;border:1px solid {o.bd};background:{o.bg};color:{o.fg}" role="button" tabindex="0" onclick={() => store.setJzInv(o.i)} onkeydown={(e) => e.key === 'Enter' && store.setJzInv(o.i)}>{o.name}</div>
          {/each}
        </div>
      </div>
      <div class="mono" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:8px;color:#7a6b50;letter-spacing:.03em">
        <div style="display:flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:50%;background:#c2562e;display:inline-block"></span>ROOT</div>
        <div style="display:flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:50%;background:#3f6b5f;display:inline-block"></span>3RD</div>
        <div style="display:flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:50%;background:#b07d23;display:inline-block"></span>7TH</div>
        <div style="display:flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:50%;background:#97a59c;display:inline-block"></span>5TH</div>
        <div style="display:flex;align-items:center;gap:4px"><span style="width:9px;height:9px;border-radius:50%;background:#7a5ea8;display:inline-block"></span>EXT</div>
        <span style="color:#a08a64">— numbers = fingers · ○ = open · bar = barre</span>
      </div>
    {/if}
  </div>
{/if}

{#if variant === 'side'}
  <Fretboard rows={v.bass} frets13={v.frets13} label="BASS · EADG" cellH={22} noteSz={18} dotSz={18} openLeft={-10} openSz={16} openBorder={3} onPick={(pc) => store.selectNote(pc)} />
  <Fretboard rows={v.guitar} frets13={v.frets13} label="GUITAR · EADGBE" cellH={20} noteSz={16} dotSz={17} openLeft={-9} openSz={14} openBorder={2.5} onPick={(pc) => store.selectNote(pc)} />
  <Piano white={v.pianoWhite} black={v.pianoBlack} height={96} />
{:else}
  <Piano white={v.pianoWhite} black={v.pianoBlack} height={92} />
  <div style="height:14px"></div>
  <Fretboard rows={v.guitar} frets13={v.frets13} label="GUITAR · EADGBE" cellH={20} noteSz={16} dotSz={17} openLeft={-9} openSz={14} openBorder={2.5} onPick={(pc) => store.selectNote(pc)} />
  <Fretboard rows={v.bass} frets13={v.frets13} label="BASS · EADG" cellH={22} noteSz={18} dotSz={18} openLeft={-10} openSz={16} openBorder={3} onPick={(pc) => store.selectNote(pc)} />
{/if}
