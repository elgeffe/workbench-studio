<script lang="ts">
  // Ctrl/Cmd+K: jump to anything. One flat, filterable list of tabs, keys,
  // scales, whole-genre styles and transport actions, so a keyboard user never
  // has to leave the home row for the mouse. `?` opens the same overlay as a
  // cheat sheet of every shortcut.
  import { useStore } from '../context';
  import { GENRES } from '../engine/genres';
  import { clearSession } from '../session';
  import type { Mode } from '../store.svelte';

  let { mode, onClose, onToggleSide }: {
    mode: 'palette' | 'help';
    onClose: () => void;
    onToggleSide: () => void;
  } = $props();

  const store = useStore();
  const v = $derived(store.view);

  function exportFile() {
    const url = URL.createObjectURL(new Blob([store.exportSession()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'workbench-session.json'; a.click();
    URL.revokeObjectURL(url);
  }
  function importFile() {
    const f = document.createElement('input');
    f.type = 'file'; f.accept = 'application/json,.json';
    f.onchange = async () => {
      const file = f.files?.[0];
      if (file && !store.importSession(await file.text())) alert('That file is not a Workbench session.');
    };
    f.click();
  }

  function newSession() {
    if (!confirm('Start a new session? The current grid, bassline and progression will be cleared (export first to keep them).')) return;
    clearSession();
    location.reload();
  }

  type Cmd = { label: string; group: string; hint?: string; run: () => void };

  const commands: Cmd[] = $derived([
    ...v.tabs.map((t, i) => ({ label: 'Go to ' + t.label.replace(/^\S+\s/, ''), group: 'Tab', hint: String(i + 1), run: () => store.setMode(t.id as Mode) })),
    { label: store.jzPlaying || store.drPlaying ? 'Stop the band' : 'Play the band', group: 'Action', hint: 'Space', run: () => store.togglePlay() },
    { label: 'Undo', group: 'Edit', hint: 'Ctrl/⌘ Z', run: () => store.undo() },
    { label: 'Redo', group: 'Edit', hint: 'Shift+Ctrl/⌘ Z', run: () => store.redo() },
    { label: 'Export session to a file', group: 'Session', run: exportFile },
    { label: 'Import session from a file', group: 'Session', run: importFile },
    { label: 'New session (clear everything)', group: 'Session', run: newSession },
    { label: 'Toggle sound', group: 'Action', run: () => store.toggleSound() },
    { label: 'Show or hide the instrument panel', group: 'Action', run: onToggleSide },
    ...v.keyChips.map((k) => ({ label: 'Key: ' + k.label, group: 'Key', run: () => store.setTonicKey(k.pc) })),
    ...[...v.scalePrimary, ...v.scaleModes].map((m) => ({ label: 'Scale: ' + m.name, group: 'Scale', run: () => store.setScale(m.id) })),
    ...GENRES.map((g) => ({ label: 'Load style: ' + g.name, group: 'Style', hint: g.family, run: () => store.setStyle(g.id) })),
  ]);

  let query = $state('');
  let sel = $state(0);
  let input: HTMLInputElement | undefined = $state();

  const shown = $derived.by(() => {
    const toks = query.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = commands.filter((c) => {
      const hay = (c.label + ' ' + c.group).toLowerCase();
      return toks.every((t) => hay.includes(t));
    });
    return hits.slice(0, 40);
  });

  $effect(() => { query; sel = 0; });
  $effect(() => { if (mode === 'palette') input?.focus(); });

  function run(c: Cmd | undefined) {
    if (!c) return;
    onClose();
    c.run();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (mode !== 'palette') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); run(shown[sel]); }
  }
  $effect(() => {
    // Keep the highlighted row in view as the arrows move through a long list.
    document.querySelector('[data-cmd-on="1"]')?.scrollIntoView({ block: 'nearest' });
  });

  const SHORTCUTS: Array<[string, string]> = [
    ['Space', 'Play / stop (the click on the Metronome tab)'],
    ['1 – 6', 'Switch tab: Circle, Drums, Chords, Bass, Metronome, Learn'],
    ['Ctrl/⌘ K', 'Command palette: tabs, keys, scales, styles'],
    ['?', 'This list'],
    ['A S D F G H J K', 'Chords tab: play the diatonic chords, hold to sustain'],
    ['← ↑ ↓ →', 'Move between step-grid cells (Drums, Bass)'],
    ['Enter', 'Toggle the focused cell or button'],
    ['Ctrl/⌘ Z', 'Undo an edit to the grid, bassline or progression'],
    ['Shift+Ctrl/⌘ Z', 'Redo (Ctrl/⌘ Y also works)'],
    ['Esc', 'Close an overlay'],
  ];
</script>

<svelte:window onkeydown={onKey} />

<div class="wb-cmd-back" role="presentation" onclick={onClose}>
  <div class="wb-cmd" role="dialog" aria-label={mode === 'palette' ? 'command palette' : 'keyboard shortcuts'} tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={() => {}} data-testid={mode === 'palette' ? 'command-palette' : 'shortcut-help'}>
    {#if mode === 'palette'}
      <input
        bind:this={input} bind:value={query}
        class="mono wb-cmd-input" placeholder="Jump to… (tab, key, scale, style)"
        aria-label="search commands" autocomplete="off" spellcheck="false"
      />
      <div class="wb-cmd-list" role="listbox">
        {#each shown as c, i (c.group + c.label)}
          <div
            class="click wb-cmd-row" class:on={i === sel} data-cmd-on={i === sel ? '1' : null}
            role="option" tabindex="-1" aria-selected={i === sel}
            onmouseenter={() => (sel = i)} onclick={() => run(c)} onkeydown={() => {}}
          >
            <span class="mono wb-cmd-group">{c.group}</span>
            <span class="wb-cmd-label">{c.label}</span>
            {#if c.hint}<span class="mono wb-cmd-hint">{c.hint}</span>{/if}
          </div>
        {:else}
          <div class="caption" style="padding:14px">Nothing matches “{query}”.</div>
        {/each}
      </div>
    {:else}
      <div class="eyebrow" style="margin-bottom:10px">Keyboard shortcuts</div>
      {#each SHORTCUTS as [k, d] (k)}
        <div class="wb-help-row"><kbd class="mono">{k}</kbd><span>{d}</span></div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .wb-cmd-back {
    position: fixed; inset: 0; z-index: 90; background: rgba(44, 32, 20, .35);
    display: flex; justify-content: center; align-items: flex-start; padding-top: 14vh;
  }
  .wb-cmd {
    width: min(560px, calc(100vw - 32px)); max-height: 66vh; display: flex; flex-direction: column;
    background: linear-gradient(#f6efe0, #f1e7d3); border: 1px solid var(--line2); border-radius: 10px;
    box-shadow: 0 30px 70px -20px rgba(44, 32, 20, .6); padding: 14px; overflow: hidden;
  }
  .wb-cmd-input {
    font-size: 14px; padding: 11px 13px; border-radius: 8px; border: 1.5px solid #cbb792;
    background: #fbf6ea; color: var(--ink); margin-bottom: 8px;
  }
  .wb-cmd-list { overflow-y: auto; }
  .wb-cmd-row { display: flex; align-items: baseline; gap: 10px; padding: 8px 10px; border-radius: 6px; }
  .wb-cmd-row.on { background: #e7d9bf; }
  .wb-cmd-group { flex: none; width: 52px; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: #8a7350; }
  .wb-cmd-label { flex: 1 1 auto; font-size: 15px; }
  .wb-cmd-hint { flex: none; font-size: 10px; color: #8a7350; }
  .wb-help-row { display: flex; gap: 14px; align-items: baseline; padding: 6px 0; border-bottom: 1px dashed #d9c8a6; font-size: 14px; }
  .wb-help-row kbd { flex: none; width: 130px; font-size: 11px; color: #5c4a30; }
</style>
