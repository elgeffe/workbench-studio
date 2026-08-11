<script lang="ts">
  // The studio bar: brand, transport, key, sound.
  //
  // What lives up here is decided by how often you reach for it. The old header
  // carried a key stepper, an EXT selector and a mute toggle, and duplicated
  // the key picker that sat in the strip below it — while PLAY and TEMPO, the
  // two controls a groovebox reaches for constantly, were buried inside the
  // Drums and Chords tabs, so you could not start the loop while editing a
  // bassline. Those have swapped places.
  //
  // On a phone the transport moves again, down to the dock bar above the tabs,
  // where a thumb can reach it. See App.svelte.
  import { useStore } from '../context';
  import KeyPicker from './KeyPicker.svelte';
  import Mixer from './Mixer.svelte';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div class="wb-header">
  <div class="wb-header-row">
    <!-- brand -->
    <div class="wb-brand">
      <div class="wb-brand-mark">
        <div style="width:9px;height:9px;border-radius:50%;background:#c2562e"></div>
      </div>
      <div class="wb-brand-title">Workbench Studio</div>
    </div>

    {#if store.isDesktop}
      <!-- transport: one clock for drums, chords and bass -->
      <div class="wb-transport">
        <div class="mono click wb-play" data-testid="studio-play" role="button" tabindex="0" aria-label="play" style="background:{v.jzPlayBg};box-shadow:0 3px 0 {v.jzPlayShadow}" onclick={() => store.togglePlay()} onkeydown={(e) => e.key === 'Enter' && store.togglePlay()}>{v.jzPlayLabel}</div>
        <div class="wb-tempo">
          <span class="mono wb-tempo-label">TEMPO</span>
          <input type="range" min="50" max="180" value={v.tempo} aria-label="studio tempo" oninput={(e) => store.setTempo(+e.currentTarget.value)} />
          <span class="mono wb-tempo-num" data-testid="studio-bpm">{v.tempo}</span>
          <span class="mono wb-tempo-unit">BPM</span>
        </div>
        <Mixer />
      </div>
    {/if}

    <span style="flex:1 1 auto"></span>

    <!-- key + scale, on demand -->
    <div style="position:relative;flex:none">
      <div
        class="click wb-keybtn" data-testid="key-button" role="button" tabindex="0"
        aria-expanded={v.keyPickerOpen} aria-label="key and scale — {v.keyName}"
        onclick={() => store.togglePicker('key')}
        onkeydown={(e) => e.key === 'Enter' && store.togglePicker('key')}
      >
        <span style="min-width:0">
          <span class="wb-keybtn-name">{v.keyName}</span>
          <span class="mono wb-keybtn-notes only-desktop">{v.scaleNotes}</span>
        </span>
        <span class="mono wb-keybtn-chev">{v.keyPickerOpen ? '▴' : '▾'}</span>
      </div>
      <KeyPicker />
    </div>

    <!-- MIDI out, desktop only: Web MIDI does not exist in Safari, so on a
         phone this button would open a panel that can never connect. -->
    {#if store.isDesktop}
      <div
        class="mono click wb-sound" data-testid="midi-button" role="button" tabindex="0"
        aria-label="MIDI out" aria-expanded={v.midiOpen}
        style="background:{v.midiBtnBg};color:{v.midiBtnFg}"
        onclick={() => store.togglePicker('midi')}
        onkeydown={(e) => e.key === 'Enter' && store.togglePicker('midi')}
      >{v.midiBtnLabel}</div>
    {/if}

    <div class="mono click wb-sound" role="button" tabindex="0" aria-label="sound" style="background:{v.soundBg};color:{v.soundFg}" onclick={() => store.toggleSound()} onkeydown={(e) => e.key === 'Enter' && store.toggleSound()}>
      <span class="only-desktop">{v.soundLabel}</span><span class="only-mobile">{v.soundLabelShort}</span>
    </div>
  </div>
</div>
