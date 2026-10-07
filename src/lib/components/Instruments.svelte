<script lang="ts">
  import { useStore } from '../context';
  import Fretboard from './Fretboard.svelte';
  import Piano from './Piano.svelte';

  let { variant = 'side', lite = false }: { variant?: 'side' | 'dock'; lite?: boolean } = $props();
  const store = useStore();
  const v = $derived(store.view);
</script>

{#if variant === 'side'}
  <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px">
    <div class="eyebrow">Sounding now</div>
    <div class="mono" style="font-size:9px;color:#a08a64">bass · guitar · piano</div>
  </div>
  {#if v.dockName === '—'}
    <!-- Nothing sounding: show the key the instruments are set to instead of a blank dash. -->
    <div style="font-size:26px;font-weight:700;line-height:1;margin-bottom:2px;min-height:28px;color:#7a6b50">{v.keyName}</div>
    <div class="mono" style="font-size:11px;color:#7a6b50;margin-bottom:16px;min-height:14px">{v.scaleNotes} · tap a chord to light it up here</div>
  {:else}
    <div style="font-size:26px;font-weight:700;line-height:1;margin-bottom:2px;min-height:28px">{v.dockName}</div>
    <div class="mono" style="font-size:11px;color:#7a6b50;margin-bottom:16px;min-height:14px">{v.dockNotes}</div>
  {/if}
{/if}

{#if variant === 'side'}
  {#if !lite}
    <Fretboard rows={v.bass} frets13={v.frets13} label="BASS · EADG" cellH={22} noteSz={18} onPick={(pc) => store.selectNote(pc)} />
    <Fretboard rows={v.guitar} frets13={v.frets13} label="GUITAR · EADGBE" cellH={20} noteSz={16} onPick={(pc) => store.selectNote(pc)} />
  {/if}
  <Piano white={v.pianoWhite} black={v.pianoBlack} height={lite ? 150 : 96} />
{:else}
  <Piano white={v.pianoWhite} black={v.pianoBlack} height={92} />
  <div style="height:14px"></div>
  <Fretboard rows={v.guitar} frets13={v.frets13} label="GUITAR · EADGBE" cellH={20} noteSz={16} onPick={(pc) => store.selectNote(pc)} />
  <Fretboard rows={v.bass} frets13={v.frets13} label="BASS · EADG" cellH={22} noteSz={18} onPick={(pc) => store.selectNote(pc)} />
{/if}
