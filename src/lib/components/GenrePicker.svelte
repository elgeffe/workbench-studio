<script lang="ts">
  // The studio's shared genre → template picker.
  //
  // The libraries behind it are large (31 genres across 8 families, with a
  // hundred-odd templates in each of drums, basslines and progressions), and
  // laying all of that on the page pushed the actual instrument below the fold.
  // So the page keeps only a one-line summary of what is loaded, and the full
  // two-level shelf opens over it in a modal that closes as soon as you pick.
  import type { PickerChip, PickerShelf } from '../view/picker';

  interface Props {
    open: boolean;
    label: string;        // eyebrow on the summary bar — "GROOVE"
    summaryGenre: string; // the loaded genre's name
    summaryItem: string;  // the loaded template's name
    hint?: string;        // "119 grooves · 31 genres"
    shelves: PickerShelf[];
    items: PickerChip[];
    itemsLabel: string;   // "PATTERNS" / "GROOVES" / "PROGRESSIONS"
    blurb?: string;       // what defines the selected genre
    compact?: boolean;    // tighten the chips on a narrow screen
    testid: string;
    genresTestid?: string;
    itemsTestid?: string;
    onOpen: () => void;
    onClose: () => void;
    onGenre: (id: string) => void;
    onItem: (id: string) => void;
  }
  let {
    open, label, summaryGenre, summaryItem, hint, shelves, items, itemsLabel,
    blurb, compact = false, testid, genresTestid, itemsTestid,
    onOpen, onClose, onGenre, onItem,
  }: Props = $props();

  const chipFont = $derived(compact ? '12px' : '13.5px');
  const chipPad = $derived(compact ? '4px 9px' : '6px 11px');

  // Picking a template is the end of the errand — close behind it. Picking a
  // genre only swaps the second row, so the modal stays open for the next tap.
  function pickItem(id: string) { onItem(id); onClose(); }
</script>

<svelte:window onkeydown={(e) => { if (open && e.key === 'Escape') onClose(); }} />

<!-- the one line the page keeps: what is loaded, and a way in -->
<div
  class="click" data-testid="{testid}-summary" role="button" tabindex="0"
  aria-expanded={open} aria-label="{label} — {summaryGenre}, {summaryItem}. Change"
  style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#f3ead4;border:1px solid #e0cfae;border-radius:9px;padding:9px 12px"
  onclick={onOpen} onkeydown={(e) => e.key === 'Enter' && onOpen()}
>
  <span class="mono" style="flex:none;font-size:8px;letter-spacing:.14em;color:#8a7350">{label}</span>
  <span class="mono" style="flex:none;font-size:9.5px;letter-spacing:.06em;color:#c2562e;text-transform:uppercase">{summaryGenre}</span>
  <span style="flex:1 1 auto;min-width:0;font-size:16px;font-weight:700;color:#2c261d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{summaryItem}</span>
  {#if hint}
    <span class="mono" style="flex:none;font-size:8px;letter-spacing:.08em;color:#a08a64">{hint}</span>
  {/if}
  <span class="mono" style="flex:none;font-size:9px;letter-spacing:.1em;color:#fff;background:#3f6b5f;padding:5px 10px;border-radius:6px">CHANGE ▾</span>
</div>

{#if open}
  <!-- backdrop: a click anywhere outside the card dismisses -->
  <div
    class="wb-modal-back" role="presentation"
    onclick={onClose}
  >
    <div
      class="wb-modal" data-testid={testid} role="dialog" aria-modal="true" aria-label={label}
      onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}
      tabindex="-1"
    >
      <div class="wb-modal-head">
        <span class="mono" style="font-size:9px;letter-spacing:.16em;color:#8a7350">{label}</span>
        <span style="flex:1"></span>
        <span
          class="wb-modal-close" data-testid="{testid}-close" role="button" tabindex="0" aria-label="close picker"
          onclick={onClose} onkeydown={(e) => e.key === 'Enter' && onClose()}
        >✕ CLOSE</span>
      </div>

      <div class="wb-modal-body">
        <!-- step 1: the genre, shelved by family -->
        <div data-testid={genresTestid || testid + '-genres'}>
          {#each shelves as fam (fam.name)}
            <div style="display:flex;align-items:center;gap:9px;margin-bottom:7px;flex-wrap:wrap">
              <span class="mono" style="flex:none;width:92px;font-size:8px;letter-spacing:.12em;color:#8a7350;text-transform:uppercase">{fam.name}</span>
              {#each fam.chips as c (c.id)}
                <div
                  class="serif click" role="button" tabindex="0"
                  style="font-size:{chipFont};font-weight:{c.weight};padding:{chipPad};border-radius:13px;border:1.5px solid {c.border};background:{c.bg};color:{c.fg};white-space:nowrap"
                  onclick={() => onGenre(c.id)} onkeydown={(e) => e.key === 'Enter' && onGenre(c.id)}
                >{c.name} <span class="mono" style="font-size:8px;color:#a08a64">{c.n}</span></div>
              {/each}
            </div>
          {/each}
        </div>

        <!-- step 2: the templates inside the chosen genre -->
        <div style="border-top:1px solid #e0cfae;margin-top:11px;padding-top:11px">
          <div class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;margin-bottom:6px">{summaryGenre} · {itemsLabel}</div>
          <div data-testid={itemsTestid || testid + '-items'} style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:9px">
            {#each items as c (c.id)}
              <div
                class="serif click" role="button" tabindex="0"
                style="font-size:{chipFont};font-weight:{c.weight};padding:{chipPad};border-radius:13px;border:1.5px solid {c.border};background:{c.bg};color:{c.fg};white-space:nowrap"
                onclick={() => pickItem(c.id)} onkeydown={(e) => e.key === 'Enter' && pickItem(c.id)}
              >{c.name}{#if c.meta} <span class="mono" style="font-size:8px;color:{c.fg === '#fff' ? '#e7d9ba' : '#a08a64'}">{c.meta}</span>{/if}</div>
            {/each}
          </div>
          {#if blurb}
            <div class="caption" style="font-size:13px;color:#5c4a30;line-height:1.5">{blurb}</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
