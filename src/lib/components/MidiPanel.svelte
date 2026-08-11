<script lang="ts">
  // MIDI out — the settings and mapping panel.
  //
  // Desktop only, and not for want of screen space: Web MIDI does not exist in
  // Safari at all, so on the device most likely to be a phone this panel would
  // be a dead end. The studio bar hides the button below 981px and App.svelte
  // never mounts this.
  //
  // It is a modal rather than a tab because it is a setup errand, not a mode of
  // playing: you come here once to point the studio at the hardware, and after
  // that the transport does the work from whichever tab you are on.
  import { useStore } from '../context';
  import type { DrumVoiceId } from '../engine/kit';
  import type { MidiGroup } from '../midi/map';

  const store = useStore();
  const v = $derived(store.view);
  const m = store.midi;

  // The kit is fourteen voices deep and a pattern uses five or six of them.
  // Sorting the ones in the current groove to the top makes the list you
  // actually have to configure the list you see first.
  const rows = $derived([...v.midiRows].sort((a, b) => Number(b.inGrid) - Number(a.inGrid)));

  function setGroup(id: DrumVoiceId, group: string, pad: number) {
    if (!group) { m.setPad(id, null); return; }
    m.setPad(id, { group: group as MidiGroup, pad: pad < 0 ? 0 : pad });
  }
</script>

<svelte:window onkeydown={(e) => { if (v.midiOpen && e.key === 'Escape') store.closePicker(); }} />

{#if v.midiOpen}
  <div class="wb-modal-back" role="presentation" onclick={() => store.closePicker()}>
    <div
      class="wb-modal" data-testid="midi-panel" role="dialog" aria-modal="true" aria-label="MIDI out"
      onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} tabindex="-1"
    >
      <div class="wb-modal-head">
        <span class="mono" style="font-size:9px;letter-spacing:.16em;color:#8a7350">MIDI OUT</span>
        <span style="flex:1"></span>
        <span
          class="wb-modal-close" data-testid="midi-close" role="button" tabindex="0" aria-label="close MIDI panel"
          onclick={() => store.closePicker()} onkeydown={(e) => e.key === 'Enter' && store.closePicker()}
        >✕ CLOSE</span>
      </div>

      <div class="wb-modal-body">
        <!-- 1. the device -->
        <div class="wb-midi-sec">
          <div class="wb-midi-h">DEVICE</div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span
              class="mono click" data-testid="midi-arm" role="button" tabindex="0"
              aria-label={v.midiLive ? 'stop sending MIDI' : 'connect and send MIDI'}
              style="flex:none;padding:9px 14px;border-radius:7px;font-size:11px;letter-spacing:.1em;color:#fff;background:{v.midiArmBg};opacity:{v.midiSupported ? 1 : 0.45}"
              onclick={() => m.toggleEnabled()}
              onkeydown={(e) => e.key === 'Enter' && m.toggleEnabled()}
            >{v.midiArmLabel}</span>
            <span data-testid="midi-status" style="flex:1 1 auto;min-width:0;font-size:15px;color:#2c261d">{v.midiStatusLine}</span>
            <span
              class="mono click" role="button" tabindex="0" aria-label="all notes off"
              style="flex:none;padding:9px 12px;border-radius:7px;font-size:10px;letter-spacing:.1em;color:#5c4a30;background:#f6efe0;border:1px solid #d8c7a8"
              onclick={() => m.panic()} onkeydown={(e) => e.key === 'Enter' && m.panic()}
            >PANIC</span>
          </div>

          {#if v.midiError}
            <div class="caption" data-testid="midi-error" style="margin-top:8px;font-size:13px;color:#9a3f1f;line-height:1.5">{v.midiError}</div>
          {/if}

          {#if v.midiPorts.length > 1}
            <!-- Two boxes on the desk is the point of per-part routing, so say
                 which one is playing what rather than leaving it to be worked
                 out from three dropdowns. -->
            <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:9px" data-testid="midi-ports">
              {#each v.midiPorts as p (p.id)}
                <div class="wb-midi-port">
                  <span class="wb-midi-portname">{p.name}</span>
                  <span class="mono wb-midi-portparts">{p.parts || 'unused'}</span>
                </div>
              {/each}
            </div>
          {/if}

          <div style="display:flex;align-items:center;gap:9px;margin-top:11px;flex-wrap:wrap">
            <span
              class="mono click" role="button" tabindex="0" aria-pressed={v.midiClockOn} aria-label="send MIDI clock"
              style="flex:none;padding:6px 11px;border-radius:7px;font-size:10px;letter-spacing:.08em;background:{v.midiClockBg};color:{v.midiClockFg};border:1px solid #d8c7a8"
              onclick={() => m.setClock(!v.midiClockOn)} onkeydown={(e) => e.key === 'Enter' && m.setClock(!v.midiClockOn)}
            >CLOCK {v.midiClockOn ? 'ON' : 'OFF'}</span>
            <span class="caption" style="flex:1 1 220px;min-width:0;font-size:12.5px;color:#7a6448;line-height:1.45">
              Sends start / stop and 24 ticks a beat, so the device follows the studio's tempo. Set the K.O. II to
              <b>clock in</b> — <span class="mono">SHIFT</span> + <span class="mono">ERASE</span>, type <b>101</b>, <span class="mono">ENTER</span>.
            </span>
          </div>
        </div>

        <!-- 2. the three parts -->
        <div class="wb-midi-sec">
          <div class="wb-midi-h">PARTS</div>
          {#each v.midiParts as p (p.id)}
            <!-- Two rows: what the part is and where it goes, then how it is
                 played there. Six controls on one line wrapped into an
                 unreadable ladder as soon as a device name got long. -->
            <div class="wb-midi-part" style="background:{p.bg};border-color:{p.border}" data-testid="midi-part-{p.id}">
              <div class="wb-midi-partrow">
                <span
                  class="mono click" role="button" tabindex="0" aria-pressed={p.on} aria-label="send {p.label} to MIDI"
                  data-testid="midi-part-toggle-{p.id}"
                  style="flex:none;width:86px;padding:7px 0;text-align:center;border-radius:6px;font-size:10px;letter-spacing:.1em;color:{p.on ? '#fff' : '#8a7350'};background:{p.on ? '#3f6b5f' : '#f1e6cf'}"
                  onclick={() => m.setPartOn(p.id, !p.on)}
                  onkeydown={(e) => e.key === 'Enter' && m.setPartOn(p.id, !p.on)}
                >{p.label}</span>

                {#if p.unrouted}
                  <span class="caption wb-midi-parthint" style="color:#9a3f1f">On, but not routed — pick an output</span>
                {:else}
                  <span class="caption wb-midi-parthint">{p.hint}</span>
                {/if}

                <label class="wb-midi-field">
                  <span class="mono">OUT</span>
                  <select
                    aria-label="{p.label} output" value={p.portId}
                    onchange={(e) => m.setPartPort(p.id, e.currentTarget.value)}
                  >
                    <option value="">—</option>
                    {#each v.midiPorts as o (o.id)}<option value={o.id}>{o.name}</option>{/each}
                  </select>
                </label>
              </div>

              <div class="wb-midi-partrow wb-midi-partrow2">
                <label class="wb-midi-field">
                  <span class="mono">CH</span>
                  <select
                    aria-label="{p.label} MIDI channel" value={p.channel}
                    onchange={(e) => m.setPartChannel(p.id, +e.currentTarget.value)}
                  >
                    {#each Array.from({ length: 16 }, (_, i) => i + 1) as ch (ch)}<option value={ch}>{ch}</option>{/each}
                  </select>
                </label>

                {#if p.pitched}
                  <label class="wb-midi-field">
                    <span class="mono">PLAY</span>
                    <select
                      aria-label="{p.label} pitch mode" value={p.mode}
                      onchange={(e) => m.setPartMode(p.id, e.currentTarget.value === 'pads' ? 'pads' : 'keys')}
                    >
                      <option value="keys">chromatic</option>
                      <option value="pads">group pads</option>
                    </select>
                  </label>
                {/if}

                {#if p.padded}
                  <!-- A group is exactly twelve semitones, so these two replace
                       the octave: which group carries the notes, and which of
                       its pads the sample's root landed on. -->
                  <label class="wb-midi-field">
                    <span class="mono">GROUP</span>
                    <select
                      aria-label="{p.label} group" value={p.group}
                      onchange={(e) => m.setPartGroup(p.id, e.currentTarget.value as 'A' | 'B' | 'C' | 'D')}
                    >
                      {#each v.midiGroups as g (g)}<option value={g}>{g}</option>{/each}
                    </select>
                  </label>
                  <label class="wb-midi-field">
                    <span class="mono">C IS</span>
                    <select
                      aria-label="{p.label} root pad" value={p.rootPad}
                      onchange={(e) => m.setPartRootPad(p.id, +e.currentTarget.value)}
                    >
                      {#each v.midiPads as pad (pad.i)}<option value={pad.i}>{pad.label}</option>{/each}
                    </select>
                  </label>
                {:else if p.pitched}
                  <label class="wb-midi-field">
                    <span class="mono">OCT</span>
                    <select
                      aria-label="{p.label} octave transpose" value={p.octave}
                      onchange={(e) => m.setPartOctave(p.id, +e.currentTarget.value)}
                    >
                      {#each [-4, -3, -2, -1, 0, 1, 2, 3, 4] as o (o)}<option value={o}>{o > 0 ? '+' + o : o}</option>{/each}
                    </select>
                  </label>
                {/if}

                <label class="wb-midi-field wb-midi-vel">
                  <span class="mono">VEL</span>
                  <input
                    type="range" min="1" max="127" value={p.vel} aria-label="{p.label} velocity"
                    oninput={(e) => m.setPartVel(p.id, +e.currentTarget.value)}
                  />
                  <span class="mono wb-midi-num">{p.vel}</span>
                </label>

                {#if p.accents}
                  <label class="wb-midi-field wb-midi-vel">
                    <span class="mono">ACCENT</span>
                    <input
                      type="range" min="1" max="127" value={p.velAccent} aria-label="{p.label} accent velocity"
                      oninput={(e) => m.setPartAccent(p.id, +e.currentTarget.value)}
                    />
                    <span class="mono wb-midi-num">{p.velAccent}</span>
                  </label>
                {/if}

                <span
                  class="mono click wb-midi-test" role="button" tabindex="0" aria-label="test {p.label}"
                  onclick={() => p.pitched ? m.testPitched(p.id === 'bass' ? 'bass' : 'chords') : m.testVoice('kick')}
                  onkeydown={(e) => e.key === 'Enter' && (p.pitched ? m.testPitched(p.id === 'bass' ? 'bass' : 'chords') : m.testVoice('kick'))}
                >TEST</span>
              </div>
            </div>
          {/each}
          <div class="caption" style="margin-top:8px;font-size:12.5px;color:#7a6448;line-height:1.5">
            Each part picks its own output, so a sampler can take the drums while a synth takes the harmony — one transport,
            one clock, both boxes. A part keeps playing through the app's own speakers as well; mute its mixer strip to hear
            the hardware alone. The K.O. II answers on one channel out of the box (<span class="mono">SHIFT</span> +
            <span class="mono">ERASE</span>, <b>110</b>); give a part its own channel only if you have assigned channels per
            pad in sound edit.
          </div>
          <div class="caption" style="margin-top:6px;font-size:12.5px;color:#7a6448;line-height:1.5">
            <b>Chromatic</b> plays real pitches across the full range — right for a keyboard, and on a K.O. II it needs
            <span class="mono">KEYS</span> mode, which takes the whole instrument. <b>Group pads</b> instead folds the part
            into one octave on a group's twelve pads, so one K.O. II can play drums on group A <i>and</i> harmony on group C
            at the same time. Set the group up first: pick the sound on a pad, press <span class="mono">KEYS</span> to spread
            it chromatically across that group, then tell <b>C IS</b> which pad the root landed on. Choosing the sample is
            done on the device — MIDI cannot assign one.
          </div>
        </div>

        <!-- 3. the pad map -->
        <div class="wb-midi-sec">
          <div class="wb-midi-h">PAD MAP <span class="mono" style="color:#a08a64;letter-spacing:.06em">{v.midiMappedCount} of {v.midiRows.length} VOICES</span></div>
          <div class="caption" style="margin-bottom:9px;font-size:12.5px;color:#7a6448;line-height:1.5">
            Each group is one octave of notes and its twelve pads sit in panel order — <span class="mono">.</span>,
            <span class="mono">0</span>, <span class="mono">⏎</span>, then 1–9. Voices in the loaded pattern are listed first.
          </div>

          <div data-testid="midi-map">
            {#each rows as r (r.id)}
              <div class="wb-midi-row" style="opacity:{r.inGrid ? 1 : 0.62}" data-testid="midi-row-{r.id}">
                <span class="wb-midi-swatch" style="background:{r.mapped ? r.color : 'transparent'};border-color:{r.color}"></span>
                <span class="wb-midi-name">{r.name}</span>

                <select
                  aria-label="{r.name} group" value={r.group}
                  onchange={(e) => setGroup(r.id, e.currentTarget.value, r.pad)}
                >
                  <option value="">off</option>
                  {#each v.midiGroups as g (g)}<option value={g}>{g}</option>{/each}
                </select>

                <select
                  aria-label="{r.name} pad" value={r.pad} disabled={!r.mapped}
                  onchange={(e) => setGroup(r.id, r.group, +e.currentTarget.value)}
                >
                  <option value={-1} disabled>—</option>
                  {#each v.midiPads as p (p.i)}<option value={p.i}>{p.label}</option>{/each}
                </select>

                <span class="mono wb-midi-note">{r.mapped ? r.padLabel + ' · ' + r.note : '—'}</span>

                {#if r.clash}
                  <span class="mono wb-midi-clash" title="also mapped here">⚠ {r.clash}</span>
                {:else}
                  <span style="flex:1 1 auto"></span>
                {/if}

                <span
                  class="mono click wb-midi-test" role="button" tabindex="0" aria-label="test {r.name}"
                  style="opacity:{r.mapped ? 1 : 0.35}"
                  onclick={() => m.testVoice(r.id)} onkeydown={(e) => e.key === 'Enter' && m.testVoice(r.id)}
                >TEST</span>
              </div>
            {/each}
          </div>

          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:12px">
            <span
              class="mono click" role="button" tabindex="0" aria-label="reset the pad map"
              style="padding:6px 11px;border-radius:7px;font-size:10px;letter-spacing:.08em;color:#5c4a30;background:#f6efe0;border:1px solid #d8c7a8"
              onclick={() => m.resetMap()} onkeydown={(e) => e.key === 'Enter' && m.resetMap()}
            >RESET MAP</span>
            <span class="caption" style="flex:1 1 240px;min-width:0;font-size:12.5px;color:#7a6448;line-height:1.5">
              The <b>VEL</b> and <b>ACCENT</b> sliders on the DRUMS strip above only land if the pads are set to respond to
              velocity — it ships off. Turn it on with <span class="mono">SHIFT</span> + <span class="mono">ERASE</span>,
              <b>301</b> (light touch) or <b>302</b> (heavy).
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .wb-midi-sec { padding-bottom: 15px; margin-bottom: 15px; border-bottom: 1px solid #e0cfae; }
  .wb-midi-sec:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
  .wb-midi-h {
    display: flex; align-items: baseline; gap: 9px;
    font-family: var(--mono); font-size: 8px; letter-spacing: .14em;
    color: #8a7350; margin-bottom: 9px; text-transform: uppercase;
  }
  .wb-midi-part {
    padding: 7px 9px; margin-bottom: 6px;
    border: 1px solid #d8c7a8; border-radius: 8px;
  }
  .wb-midi-partrow { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
  .wb-midi-partrow2 {
    margin-top: 7px; padding-top: 7px; gap: 14px;
    border-top: 1px solid #e7d9bf;
  }
  .wb-midi-parthint { flex: 1 1 150px; min-width: 0; font-size: 12.5px; color: #7a6448; }
  /* The sliders take the slack so the row's selects stay put between parts. */
  .wb-midi-vel { flex: 1 1 130px; min-width: 110px; }
  .wb-midi-vel input { flex: 1 1 auto; min-width: 0; }
  .wb-midi-port {
    display: inline-flex; align-items: baseline; gap: 7px;
    padding: 5px 11px; border-radius: 13px;
    border: 1.5px solid #d8c7a8; background: #f6efe0;
  }
  .wb-midi-portname { font-size: 13.5px; color: #2c261d; white-space: nowrap; }
  .wb-midi-portparts { font-size: 8px; letter-spacing: .1em; color: #8a7350; text-transform: uppercase; }
  .wb-midi-row {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 0; border-bottom: 1px solid #ece0c8;
  }
  .wb-midi-row:last-child { border-bottom: 0; }
  .wb-midi-swatch { flex: none; width: 11px; height: 11px; border-radius: 3px; border: 1.5px solid; }
  .wb-midi-name { flex: 0 0 150px; min-width: 0; font-size: 14px; color: #2c261d; }
  .wb-midi-note { flex: none; width: 72px; font-size: 10px; color: #8a7350; }
  .wb-midi-clash { flex: 1 1 auto; font-size: 9.5px; color: #9a3f1f; letter-spacing: .04em; }
  .wb-midi-field { display: inline-flex; align-items: center; gap: 6px; }
  .wb-midi-field .mono { font-size: 8px; letter-spacing: .12em; color: #8a7350; }
  .wb-midi-num { width: 26px; text-align: right; font-size: 11px; color: #2c261d; }
  .wb-midi-test {
    flex: none; padding: 5px 10px; border-radius: 6px;
    font-size: 9px; letter-spacing: .1em; color: #5c4a30;
    background: #f1e6cf; border: 1px solid #d8c7a8;
  }
  .wb-midi-test:active { background: #e7d9bf; }
  select { font-family: var(--mono); font-size: 12px; padding: 4px 6px; }
</style>
