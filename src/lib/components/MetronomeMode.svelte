<script lang="ts">
  import { useStore } from '../context';
  import { formatDuration } from '../metronome/timing';
  import type { GoalType, PracticeSession } from '../metronome/types';
  import type { AutomationMode } from '../metronome/store.svelte';
  import { DRONE_PRESETS, VOICINGS, isRhythmic, presetById, type DroneMacros, type DroneRegister } from '../metronome/drone/sound';
  import { SCALES, SUF, type ScaleId } from '../engine/constants';
  import { keyNameStr, spell } from '../engine/theory';
  import { GENERATORS, type GeneratorId } from '../metronome/drone/generators';
  import type { DroneSource } from '../metronome/drone/persist';

  const store = useStore();
  const met = store.met;

  // The engine + persistence spin up lazily the first time the tab mounts.
  met.init();

  const beats = $derived(Array.from({ length: Math.max(1, met.beatsPerBar) }, (_, i) => i));
  const showLive = $derived(
    met.isPlaying && (met.automationMode !== 'off' || (met.micActive && met.micFollow)),
  );
  const micOverriding = $derived(met.micActive && met.micFollow);
  const confidencePct = $derived(Math.round(met.micConfidence * 100));

  const autoModes: { id: AutomationMode; label: string }[] = [
    { id: 'off', label: 'Off' },
    { id: 'step', label: 'Step' },
    { id: 'ramp-time', label: 'Ramp / time' },
    { id: 'ramp-bars', label: 'Ramp / bars' },
    { id: 'plan', label: 'Plan' },
  ];
  const subdivisions = [
    { v: 1, label: 'None' },
    { v: 2, label: 'Eighths' },
    { v: 3, label: 'Triplets' },
    { v: 4, label: '16ths' },
  ];

  const registers: { id: DroneRegister; label: string }[] = [
    { id: 'low', label: 'Low' },
    { id: 'mid', label: 'Mid' },
    { id: 'high', label: 'High' },
  ];
  const macroSliders: { id: keyof DroneMacros; label: string; hint: string }[] = [
    { id: 'brightness', label: 'Brightness', hint: 'filter' },
    { id: 'width', label: 'Width', hint: 'detune & stereo' },
    { id: 'motion', label: 'Motion', hint: 'movement' },
    { id: 'space', label: 'Space', hint: 'reverb & echo' },
    { id: 'drive', label: 'Drive', hint: 'saturation' },
    { id: 'groove', label: 'Groove', hint: 'how hard the rhythm hits' },
  ];
  const scaleIds = Object.keys(SCALES) as ScaleId[];
  const planChords: { id: string | null; label: string }[] = [
    { id: null, label: 'key' },
    ...(['maj', 'min', 'dom7', 'maj7', 'min7', 'sus4', 'dim', 'aug', 'm7b5', 'dom7sus', 'maj9', 'min9', 'dom9'] as const).map((id) => ({
      id: id as string,
      label: SUF[id] || 'maj',
    })),
  ];
  let importBars = $state(1);
  const pcs = Array.from({ length: 12 }, (_, i) => i);
  const sources: { id: DroneSource; label: string }[] = [
    { id: 'studio', label: 'Studio key' },
    { id: 'own', label: 'Own key' },
    { id: 'chords', label: 'Chords' },
  ];
  const guide = $derived(met.droneGuide);

  // plan generator + naming, local to the panel until applied
  let genId = $state<GeneratorId>('fifths');
  let genTonic = $state(0);
  let genScale = $state<ScaleId>('ionian');
  let genBars = $state(4);
  const gen = $derived(GENERATORS.find((g) => g.id === genId) ?? GENERATORS[0]);
  let planName = $state('');
  let soundName = $state('');
  const preset = $derived(presetById(met.dronePreset));
  // Groove only means something to a sound that moves with the beat.
  const shownMacros = $derived(
    macroSliders.filter((m) => m.id !== 'groove' || isRhythmic(preset.sound)),
  );
  const planSection = $derived(met.planPos ? met.plan.sections[met.planPos.index] : null);
  const planReadout = $derived.by(() => {
    const pos = met.planPos;
    if (!pos || !planSection) return '';
    const parts = [
      `section ${pos.index + 1}/${met.plan.sections.length}`,
      `bar ${pos.barInSection + 1}/${Math.max(1, planSection.bars)}`,
    ];
    if (pos.loop > 0) parts.push(`pass ${pos.loop + 1}`);
    const n = met.planNext;
    if (n) {
      const name = keyNameStr(n.key.tonicPc, n.key.scale);
      parts.push(n.inBars === 1 ? `${name} next bar` : `${name} in ${n.inBars} bars`);
    }
    return parts.join(' · ');
  });

  function setGoal(type: GoalType) {
    met.goalType = type;
    met.goalJustReached = false;
  }

  const dateFmt = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  function goalText(s: PracticeSession): string {
    if (s.goal.type === 'bars') return `${s.goal.bars} bars`;
    if (s.goal.type === 'time') return formatDuration(s.goal.seconds ?? 0);
    return '';
  }
  function bpmText(s: PracticeSession): string {
    return s.minBpm === s.maxBpm ? `${s.minBpm} BPM` : `${s.minBpm}–${s.maxBpm} BPM`;
  }
  function confirmClear() {
    if (confirm('Clear all practice history? This cannot be undone.')) met.clearHistory();
  }

  // Keep the screen awake while the click is running so the beat stays visible.
  let wakeLock: { release?: () => Promise<void> } | null = null;
  async function requestWakeLock() {
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request: (t: string) => Promise<{ release?: () => Promise<void> }> };
      };
      if (nav.wakeLock && !wakeLock) wakeLock = await nav.wakeLock.request('screen');
    } catch {
      /* not supported / denied — harmless */
    }
  }
  function releaseWakeLock() {
    try {
      void wakeLock?.release?.();
    } catch {
      /* ignore */
    }
    wakeLock = null;
  }
  $effect(() => {
    if (met.isPlaying) void requestWakeLock();
    else releaseWakeLock();
    return () => releaseWakeLock();
  });
  $effect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && met.isPlaying) void requestWakeLock();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  });
</script>

<div class="mt-wrap">
  <!-- ---- transport hero ---- -->
  <section class="card hero" data-testid="metronome-transport">
    <div class="eyebrow" style="text-align:center">METRONOME · PRACTICE CLICK</div>

    <div class="bpm">
      <span class="bpm-num" data-testid="metronome-bpm">{met.bpm}</span>
      <span class="bpm-unit mono">BPM</span>
    </div>
    {#if showLive}
      <div class="live mono">playing <strong>{met.liveBpm}</strong></div>
    {/if}
    {#if met.droneSounding}
      <div class="live mono" data-testid="metronome-drone-now">drone <strong>{met.droneName}</strong></div>
    {/if}
    {#if planReadout}
      <div class="live mono" class:warn={met.planNext?.inBars === 1} data-testid="metronome-plan-now">{planReadout}</div>
    {/if}

    <div
      class="beats"
      role="img"
      aria-label={met.isPlaying
        ? `Beat ${met.currentBeat + 1} of ${met.beatsPerBar}`
        : `${met.beatsPerBar} beats per bar`}
    >
      {#each beats as i (i)}
        <div
          class="beat"
          class:accent={i === 0 && met.accentFirst}
          class:active={met.isPlaying && met.currentBeat === i}
        ></div>
      {/each}
    </div>

    <input
      class="slider"
      type="range"
      min="20"
      max="300"
      step="1"
      bind:value={met.bpm}
      aria-label="Tempo in beats per minute"
    />

    <div class="nudges">
      <button type="button" class="btn" onclick={() => met.nudgeBpm(-5)}>−5</button>
      <button type="button" class="btn" onclick={() => met.nudgeBpm(-1)}>−1</button>
      <button type="button" class="btn" onclick={() => met.nudgeBpm(1)}>+1</button>
      <button type="button" class="btn" onclick={() => met.nudgeBpm(5)}>+5</button>
      <button type="button" class="btn tap" onclick={() => met.tap()}>Tap</button>
    </div>

    <!-- Bridge to the studio's shared Workshop/Drums transport tempo. By
         default the two clocks stay independent (a ramp drill shouldn't drag
         the groovebox along) and one tap copies the BPM either way. The link
         toggle makes them follow each other; drills pause it while they run. -->
    <div class="sync">
      <span class="eyebrow">Studio tempo {store.tempo}</span>
      <button
        type="button"
        class="chip"
        class:on={met.linkTempo}
        aria-pressed={met.linkTempo}
        data-testid="metronome-link"
        onclick={() => (met.linkTempo = !met.linkTempo)}
      >⛓ link{met.linkTempo && !met.linkActive ? ' (paused)' : ''}</button>
      {#if !met.linkActive}
        <button
          type="button"
          class="chip"
          data-testid="metronome-sync-from"
          onclick={() => met.setBpm(store.tempo)}
        >↓ use in click</button>
        <button
          type="button"
          class="chip"
          data-testid="metronome-sync-to"
          onclick={() => store.setTempo(met.bpm)}
        >↑ set from click</button>
      {/if}
    </div>

    <button
      type="button"
      class="play"
      class:stop={met.isPlaying}
      data-testid="metronome-play"
      onclick={() => met.toggle()}
    >
      {met.isPlaying ? '■ STOP' : '▶ START'}
    </button>

    <div class="readout">
      <div class="stat">
        <span class="stat-num" data-testid="metronome-bars">{met.sessionBars}</span>
        <span class="stat-lbl eyebrow">bars played</span>
      </div>
      <div class="stat mid">
        <span class="stat-num">{met.elapsedLabel}</span>
        <span class="stat-lbl eyebrow">elapsed</span>
      </div>
      <div class="stat">
        <span class="stat-num">{met.isPlaying ? met.liveBpm : met.bpm}</span>
        <span class="stat-lbl eyebrow">bpm now</span>
      </div>
    </div>
    <div class="caption" style="text-align:center;font-size:12px">
      Press <span class="mono" style="font-size:10px">SPACE</span> to start / stop
    </div>
  </section>

  <div class="cols">
    <div class="col">
      <!-- ---- practice tracker ---- -->
      <section class="card" class:celebrate={met.goalJustReached} data-testid="metronome-goal">
        <div class="card-title">
          <span>Practice Tracker</span>
          {#if met.goalJustReached}<span class="badge good">✓ Goal reached</span>{/if}
        </div>

        <div class="seg" role="tablist" aria-label="Goal type">
          <button type="button" role="tab" aria-selected={met.goalType === 'none'} class:on={met.goalType === 'none'} onclick={() => setGoal('none')}>Open</button>
          <button type="button" role="tab" aria-selected={met.goalType === 'bars'} class:on={met.goalType === 'bars'} onclick={() => setGoal('bars')}>By bars</button>
          <button type="button" role="tab" aria-selected={met.goalType === 'time'} class:on={met.goalType === 'time'} onclick={() => setGoal('time')}>By time</button>
        </div>

        {#if met.goalType === 'bars'}
          <div class="field">
            <label for="mt-goal-bars">Target — bars to play</label>
            <input id="mt-goal-bars" type="number" min="1" max="9999" bind:value={met.goalBars} />
          </div>
        {:else if met.goalType === 'time'}
          <div class="field">
            <label for="mt-goal-min">Target — minutes to practice</label>
            <input id="mt-goal-min" type="number" min="1" max="600" step="1" bind:value={met.goalMinutes} />
          </div>
        {/if}

        <div class="counters">
          <div class="counter">
            <span class="big">{met.sessionBars}</span>
            <span class="eyebrow">bars played</span>
          </div>
          <div class="counter">
            <span class="big">{met.elapsedLabel}</span>
            <span class="eyebrow">time elapsed</span>
          </div>
        </div>

        {#if met.goalType !== 'none'}
          <div class="progress" aria-hidden="true">
            <div class="progress-fill" style="width:{met.goalProgress * 100}%"></div>
          </div>
          <div class="row spread">
            <span class="caption" style="font-size:12px">{met.goalRemainingLabel}</span>
            <span class="mono" style="font-size:10px;color:#8a7350">{Math.round(met.goalProgress * 100)}%</span>
          </div>
        {:else}
          <p class="caption" style="font-size:12px;margin:10px 0 0">
            Open practice — counting bars and time with no target. Switch to a goal to auto-stop
            when you hit it.
          </p>
        {/if}
      </section>

      <!-- ---- tempo automation ---- -->
      <section class="card" data-testid="metronome-automation">
        <div class="card-title">
          <span>Tempo Automation</span>
          {#if micOverriding}<span class="badge">mic is driving tempo</span>{/if}
        </div>

        <div class="seg wrap" role="tablist" aria-label="Automation mode">
          {#each autoModes as m (m.id)}
            <button
              type="button"
              role="tab"
              aria-selected={met.automationMode === m.id}
              class:on={met.automationMode === m.id}
              onclick={() => (met.automationMode = m.id)}>{m.label}</button
            >
          {/each}
        </div>

        {#if met.automationMode === 'step'}
          <p class="hint caption">Speed trainer — nudge the tempo every few bars and push your limit.</p>
          <div class="fields">
            <div class="field">
              <label for="mt-st-start">Start BPM</label>
              <input id="mt-st-start" type="number" min="20" max="400" bind:value={met.stepStartBpm} />
            </div>
            <div class="field">
              <label for="mt-st-step">Change BPM</label>
              <input id="mt-st-step" type="number" min="-50" max="50" bind:value={met.stepAmount} />
            </div>
            <div class="field">
              <label for="mt-st-every">Every (bars)</label>
              <input id="mt-st-every" type="number" min="1" max="64" bind:value={met.stepEveryBars} />
            </div>
            <div class="field">
              <label for="mt-st-mode">At limit</label>
              <select id="mt-st-mode" bind:value={met.stepMode}>
                <option value="clamp">Hold</option>
                <option value="loop">Loop</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
            <div class="field">
              <label for="mt-st-min">Min BPM</label>
              <input id="mt-st-min" type="number" min="20" max="400" bind:value={met.stepMinBpm} />
            </div>
            <div class="field">
              <label for="mt-st-max">Max BPM</label>
              <input id="mt-st-max" type="number" min="20" max="400" bind:value={met.stepMaxBpm} />
            </div>
          </div>
        {:else if met.automationMode === 'ramp-time'}
          <p class="hint caption">Glide smoothly from one tempo to another over a set time.</p>
          <div class="fields">
            <div class="field">
              <label for="mt-rt-start">From BPM</label>
              <input id="mt-rt-start" type="number" min="20" max="400" bind:value={met.rampStartBpm} />
            </div>
            <div class="field">
              <label for="mt-rt-end">To BPM</label>
              <input id="mt-rt-end" type="number" min="20" max="400" bind:value={met.rampEndBpm} />
            </div>
            <div class="field span2">
              <label for="mt-rt-sec">Over (seconds)</label>
              <input id="mt-rt-sec" type="number" min="1" max="3600" bind:value={met.rampSeconds} />
            </div>
          </div>
        {:else if met.automationMode === 'ramp-bars'}
          <p class="hint caption">Glide smoothly from one tempo to another over a number of bars.</p>
          <div class="fields">
            <div class="field">
              <label for="mt-rb-start">From BPM</label>
              <input id="mt-rb-start" type="number" min="20" max="400" bind:value={met.rampStartBpm} />
            </div>
            <div class="field">
              <label for="mt-rb-end">To BPM</label>
              <input id="mt-rb-end" type="number" min="20" max="400" bind:value={met.rampEndBpm} />
            </div>
            <div class="field span2">
              <label for="mt-rb-bars">Over (bars)</label>
              <input id="mt-rb-bars" type="number" min="1" max="999" bind:value={met.rampBars} />
            </div>
          </div>
        {:else if met.automationMode === 'plan'}
          <p class="hint caption">
            A run of sections, each in its own key and tempo. The click follows the tempo; the drone
            and the fretboards follow the key, and warn you a bar before each change.
          </p>
          {#if met.planFinished}
            <div style="margin-top:10px"><span class="badge good">✓ Plan complete</span></div>
          {/if}
          {#if !met.droneWithClick && !met.droneSounding}
            <button type="button" class="wide-btn" data-testid="metronome-plan-drone" onclick={() => met.setDroneWithClick(true)}>
              ♪ Play the drone with the click
            </button>
          {/if}

          <details class="customize" data-testid="metronome-plan-generate">
            <summary class="mono">Start from a ready-made plan</summary>
            <div class="fields">
              <div class="field span2">
                <label for="mt-gen">Plan</label>
                <select id="mt-gen" bind:value={genId}>
                  {#each GENERATORS as g (g.id)}
                    <option value={g.id}>{g.name}</option>
                  {/each}
                </select>
                <span class="caption" style="font-size:11px">{gen.blurb}</span>
              </div>
              <div class="field">
                <label for="mt-gen-key">Start on</label>
                <select id="mt-gen-key" bind:value={genTonic}>
                  {#each pcs as pc (pc)}
                    <option value={pc}>{spell(pc, pc, gen.usesScale ? genScale : 'ionian')}</option>
                  {/each}
                </select>
              </div>
              {#if gen.usesScale}
                <div class="field">
                  <label for="mt-gen-scale">Scale</label>
                  <select id="mt-gen-scale" bind:value={genScale}>
                    {#each scaleIds as id (id)}
                      <option value={id}>{SCALES[id].short}</option>
                    {/each}
                  </select>
                </div>
              {/if}
              <div class="field">
                <label for="mt-gen-bars">Bars each</label>
                <input id="mt-gen-bars" type="number" min="1" max="64" bind:value={genBars} />
              </div>
              <div class="field span2">
                <button
                  type="button"
                  class="wide-btn primary"
                  style="margin-top:0"
                  data-testid="metronome-plan-generate-go"
                  onclick={() => met.generatePlan(genId, { tonicPc: genTonic, scale: genScale, bars: genBars })}
                >Replace sections</button>
              </div>
            </div>
          </details>

          <ol class="plan" data-testid="metronome-plan">
            {#each met.plan.sections as sec, i (sec.id)}
              <li class="plan-row" class:now={met.planPos?.index === i}>
                <span class="plan-n mono">{i + 1}</span>
                <select aria-label="Section {i + 1} key" bind:value={sec.tonicPc}>
                  {#each pcs as pc (pc)}
                    <option value={pc}>{spell(pc, pc, sec.scale)}</option>
                  {/each}
                </select>
                <select aria-label="Section {i + 1} scale" bind:value={sec.scale}>
                  {#each scaleIds as id (id)}
                    <option value={id}>{SCALES[id].short}</option>
                  {/each}
                </select>
                <div class="plan-acts">
                  <button type="button" class="del click" aria-label="Move section {i + 1} up" disabled={i === 0} onclick={() => met.movePlanSection(sec.id, -1)}>↑</button>
                  <button type="button" class="del click" aria-label="Move section {i + 1} down" disabled={i === met.plan.sections.length - 1} onclick={() => met.movePlanSection(sec.id, 1)}>↓</button>
                  <button type="button" class="del click" aria-label="Remove section {i + 1}" disabled={met.plan.sections.length <= 1} onclick={() => met.removePlanSection(sec.id)}>✕</button>
                </div>
                <div class="plan-nums mono">
                  <label>chord
                    <select aria-label="Section {i + 1} chord" bind:value={sec.chord}>
                      {#each planChords as c (c.id ?? 'key')}
                        <option value={c.id}>{c.label}</option>
                      {/each}
                    </select>
                  </label>
                  <label>bars <input type="number" min="1" max="64" aria-label="Section {i + 1} bars" bind:value={sec.bars} /></label>
                  <label>bpm <input type="number" min="20" max="400" placeholder="main" aria-label="Section {i + 1} BPM" bind:value={sec.bpm} /></label>
                  <label>→ <input type="number" min="20" max="400" placeholder="hold" aria-label="Section {i + 1} ramp to BPM" bind:value={sec.bpmTo} disabled={sec.bpm == null} /></label>
                </div>
              </li>
            {/each}
          </ol>
          <div class="row" style="margin-top:10px;flex-wrap:wrap">
            <button type="button" class="chip" data-testid="metronome-plan-add" onclick={() => met.addPlanSection()}>+ Add section (a 5th up)</button>
            <button type="button" class="chip" onclick={() => met.resetPlan()}>Reset</button>
          </div>
          <div class="row" style="margin-top:8px;flex-wrap:wrap" data-testid="metronome-plan-chords">
            <button type="button" class="chip" data-testid="metronome-plan-import" onclick={() => met.importChordsToPlan(importBars)}>Import from Chords</button>
            <label class="mono" style="font-size:10px">bars each <input type="number" min="1" max="16" style="width:44px" aria-label="Bars per imported chord" bind:value={importBars} /></label>
            <span class="mono" style="font-size:10px;opacity:.7">Reshape:</span>
            <button type="button" class="chip" onclick={() => met.transformPlanChords('triads')}>Triads</button>
            <button type="button" class="chip" onclick={() => met.transformPlanChords('sevenths')}>7ths</button>
            <button type="button" class="chip" onclick={() => met.transformPlanChords('sus')}>Sus</button>
            <button type="button" class="chip" onclick={() => met.transformPlanChords('clear')}>Key only</button>
          </div>
          <p class="caption" style="font-size:11px;margin:8px 0 0">Leave BPM empty to use the main tempo; fill “→” to ramp across the section.</p>

          <form
            class="save-row"
            onsubmit={(e) => {
              e.preventDefault();
              met.savePlanAs(planName);
              planName = '';
            }}
          >
            <input type="text" maxlength="40" placeholder="Name this plan" aria-label="Plan name" bind:value={planName} />
            <button type="submit" class="chip" disabled={!planName.trim()}>Save plan</button>
          </form>
          {#if met.savedPlans.length}
            <div class="saved" data-testid="metronome-saved-plans">
              {#each met.savedPlans as sp (sp.id)}
                <span class="saved-item">
                  <button type="button" class="saved-name" title="Load {sp.name}" onclick={() => met.loadSavedPlan(sp.id)}>{sp.name} <span class="mono" style="font-size:9px;opacity:.7">· {sp.plan.sections.length}</span></button>
                  <button type="button" class="saved-del" aria-label="Delete plan {sp.name}" onclick={() => met.deleteSavedPlan(sp.id)}>✕</button>
                </span>
              {/each}
            </div>
          {/if}

          <div class="fields">
            <div class="field">
              <label for="mt-pl-repeat">At the end</label>
              <select id="mt-pl-repeat" bind:value={met.plan.repeat}>
                <option value="loop">Loop</option>
                <option value="once">Stop</option>
              </select>
            </div>
            <div class="field">
              <label for="mt-pl-bpm">Each pass, BPM</label>
              <input id="mt-pl-bpm" type="number" min="-50" max="50" disabled={met.plan.repeat === 'once'} bind:value={met.plan.loopBpmDelta} />
            </div>
            <div class="field span2">
              <label for="mt-pl-tr">Each pass, transpose (semitones)</label>
              <input id="mt-pl-tr" type="number" min="-11" max="11" disabled={met.plan.repeat === 'once'} bind:value={met.plan.loopTranspose} />
            </div>
          </div>
        {:else}
          <p class="hint caption">Tempo stays fixed at the value you set above.</p>
        {/if}

        <!-- gap-click / mute trainer -->
        <div class="gap">
          <div class="row spread">
            <div>
              <div style="font-weight:700">Gap-click trainer</div>
              <div class="caption" style="font-size:11px">Mutes bars so you keep time on your own.</div>
            </div>
            <button
              type="button"
              class="switch"
              class:on={met.gapEnabled}
              aria-pressed={met.gapEnabled}
              aria-label="Toggle gap-click trainer"
              onclick={() => (met.gapEnabled = !met.gapEnabled)}
            ></button>
          </div>

          {#if met.gapEnabled}
            <div class="seg" role="tablist" aria-label="Gap mode">
              <button type="button" class:on={met.gapMode === 'cycle'} onclick={() => (met.gapMode = 'cycle')}>Cycle</button>
              <button type="button" class:on={met.gapMode === 'random'} onclick={() => (met.gapMode = 'random')}>Random</button>
            </div>
            {#if met.gapMode === 'cycle'}
              <div class="fields">
                <div class="field">
                  <label for="mt-gp-play">Play (bars)</label>
                  <input id="mt-gp-play" type="number" min="1" max="32" bind:value={met.gapPlayBars} />
                </div>
                <div class="field">
                  <label for="mt-gp-mute">Mute (bars)</label>
                  <input id="mt-gp-mute" type="number" min="1" max="32" bind:value={met.gapMuteBars} />
                </div>
              </div>
            {:else}
              <div class="field">
                <label for="mt-gp-prob">Mute chance — {Math.round(met.gapProbability * 100)}%</label>
                <input id="mt-gp-prob" class="slider" type="range" min="0" max="1" step="0.05" bind:value={met.gapProbability} />
              </div>
            {/if}
          {/if}
        </div>
      </section>

      <!-- ---- meter & sound ---- -->
      <section class="card" data-testid="metronome-sound">
        <div class="card-title"><span>Meter &amp; Sound</span></div>

        <div class="fields">
          <div class="field">
            <label for="mt-bpb">Beats per bar</label>
            <input id="mt-bpb" type="number" min="1" max="16" bind:value={met.beatsPerBar} />
          </div>
          <div class="field">
            <label for="mt-unit">Beat unit</label>
            <select id="mt-unit" bind:value={met.beatUnit}>
              <option value={2}>2 — half</option>
              <option value={4}>4 — quarter</option>
              <option value={8}>8 — eighth</option>
            </select>
          </div>
          <div class="field">
            <label for="mt-sub">Subdivision</label>
            <select id="mt-sub" bind:value={met.subdivision}>
              {#each subdivisions as s (s.v)}
                <option value={s.v}>{s.label}</option>
              {/each}
            </select>
          </div>
          <div class="field toggle-field">
            <span class="lbl">Accent first beat</span>
            <button
              type="button"
              class="switch"
              class:on={met.accentFirst}
              aria-pressed={met.accentFirst}
              aria-label="Toggle accent on first beat"
              onclick={() => (met.accentFirst = !met.accentFirst)}
            ></button>
          </div>
          <div class="field span2">
            <label for="mt-vol">Volume — {Math.round(met.volume * 100)}%</label>
            <input id="mt-vol" class="slider" type="range" min="0" max="1" step="0.01" bind:value={met.volume} />
          </div>
        </div>
      </section>
    </div>

    <div class="col">
      <!-- ---- drone ---- -->
      <section class="card" data-testid="metronome-drone">
        <div class="card-title">
          <span>Drone</span>
          {#if met.droneSounding}<span class="badge good">● {met.droneName}</span>{/if}
        </div>

        <p class="hint caption" style="margin-top:0">
          A held note to play your scales against. While it sounds, the fretboards and piano
          show its scale.
        </p>

        <button
          type="button"
          class="wide-btn"
          class:primary={met.droneSounding}
          data-testid="metronome-drone-toggle"
          onclick={() => met.toggleDrone()}
        >
          {met.droneSounding ? '■ Stop drone' : '▶ Play drone'}
        </button>

        <div class="row spread gap-top">
          <div>
            <div style="font-weight:700">Play with metronome</div>
            <div class="caption" style="font-size:11px">Starts and stops with the click.</div>
          </div>
          <button
            type="button"
            class="switch"
            class:on={met.droneWithClick}
            aria-pressed={met.droneWithClick}
            aria-label="Toggle drone with metronome"
            onclick={() => met.setDroneWithClick(!met.droneWithClick)}
          ></button>
        </div>

        <!-- key -->
        <div class="field">
          <span class="lbl">Key from</span>
          <div class="seg" role="tablist" aria-label="Drone key source">
            {#each sources as src (src.id)}
              <button type="button" role="tab" aria-selected={met.droneSource === src.id} class:on={met.droneSource === src.id} onclick={() => (met.droneSource = src.id)}>{src.label}</button>
            {/each}
          </div>
        </div>
        {#if met.droneSource === 'studio'}
          <p class="hint caption" style="margin-top:6px">Change it from the key button or the Circle.</p>
        {:else if met.droneSource === 'chords'}
          <p class="hint caption" style="margin-top:6px">
            {store.jzChanges.length
              ? "Follows the Chords tab: each chord's root, with its chord scale on the instruments."
              : 'No chords yet — build a progression in the Chords tab. Until then, the studio key.'}
          </p>
        {:else}
          <div class="fields">
            <div class="field">
              <label for="mt-dr-key">Key</label>
              <select id="mt-dr-key" bind:value={met.droneTonicPc}>
                {#each pcs as pc (pc)}
                  <option value={pc}>{spell(pc, pc, met.droneScale)}</option>
                {/each}
              </select>
            </div>
            <div class="field">
              <label for="mt-dr-scale">Scale</label>
              <select id="mt-dr-scale" bind:value={met.droneScale}>
                {#each scaleIds as id (id)}
                  <option value={id}>{SCALES[id].short}</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}
        <div class="key-now mono" data-testid="metronome-drone-key">
          <strong>{met.droneName}</strong> · {guide.notes}
        </div>
        {#if met.automationMode === 'plan'}
          <div class="caption" style="font-size:11px;margin-top:4px">
            {met.planActive ? 'The plan is choosing the key.' : 'In Plan mode the plan sets the key while the click runs.'}
          </div>
        {/if}

        <!-- pitch -->
        <div class="field">
          <span class="lbl">Notes</span>
          <div class="seg" role="tablist" aria-label="Drone voicing">
            {#each VOICINGS as v (v.id)}
              <button type="button" role="tab" aria-selected={met.droneVoicing === v.id} class:on={met.droneVoicing === v.id} onclick={() => (met.droneVoicing = v.id)}>{v.label}</button>
            {/each}
          </div>
        </div>
        <div class="field">
          <span class="lbl">Register</span>
          <div class="seg" role="tablist" aria-label="Drone register">
            {#each registers as r (r.id)}
              <button type="button" role="tab" aria-selected={met.droneRegister === r.id} class:on={met.droneRegister === r.id} onclick={() => (met.droneRegister = r.id)}>{r.label}</button>
            {/each}
          </div>
        </div>

        <!-- sound -->
        <div class="field">
          <span class="lbl">Sound</span>
          <div class="seg wrap" role="tablist" aria-label="Drone sound">
            {#each DRONE_PRESETS as p (p.id)}
              <button type="button" role="tab" aria-selected={met.dronePreset === p.id} class:on={met.dronePreset === p.id} onclick={() => (met.dronePreset = p.id)}>{p.name}</button>
            {/each}
          </div>
          <div class="caption" style="font-size:11px">
            {preset.blurb}{#if isRhythmic(preset.sound)} Locks to the click while it runs.{/if}
          </div>
        </div>
        {#if met.userPresets.length}
          <div class="field">
            <span class="lbl">My sounds</span>
            <div class="saved" data-testid="metronome-my-sounds">
              {#each met.userPresets as up (up.id)}
                <span class="saved-item" class:on={met.activeUserPresetId === up.id}>
                  <button type="button" class="saved-name" aria-pressed={met.activeUserPresetId === up.id} onclick={() => met.applyUserPreset(up.id)}>{up.name}</button>
                  <button type="button" class="saved-del" aria-label="Delete sound {up.name}" onclick={() => met.deleteUserPreset(up.id)}>✕</button>
                </span>
              {/each}
            </div>
          </div>
        {/if}

        <details class="customize">
          <summary class="mono">
            Customize{#if met.droneTweaked}<span class="badge" style="margin-left:8px">tweaked</span>{/if}
          </summary>
          <div class="fields">
            {#each shownMacros as m (m.id)}
              <div class="field">
                <label for="mt-dr-{m.id}">{m.label} — {Math.round(met.droneMacros[m.id] * 100)}</label>
                <input id="mt-dr-{m.id}" class="slider" type="range" min="0" max="1" step="0.01" bind:value={met.droneMacros[m.id]} title={m.hint} />
              </div>
            {/each}
            <div class="field" style="justify-content:flex-end">
              <button type="button" class="chip" disabled={!met.droneTweaked} onclick={() => met.resetDroneMacros()}>Reset to preset</button>
            </div>
          </div>
          <form
            class="save-row"
            onsubmit={(e) => {
              e.preventDefault();
              met.saveUserPreset(soundName);
              soundName = '';
            }}
          >
            <input type="text" maxlength="40" placeholder="Name this sound" aria-label="Sound name" bind:value={soundName} />
            <button type="submit" class="chip" disabled={!soundName.trim()}>Save sound</button>
          </form>
        </details>

        <div class="field">
          <label for="mt-dr-vol">Drone volume — {Math.round(met.droneVolume * 100)}%</label>
          <input id="mt-dr-vol" class="slider" type="range" min="0" max="1" step="0.01" bind:value={met.droneVolume} />
        </div>
      </section>

      <!-- ---- reactive tempo (mic) ---- -->
      <section class="card" data-testid="metronome-mic">
        <div class="card-title">
          <span>Reactive Tempo</span>
          <span class="badge">Experimental</span>
        </div>

        <p class="hint caption">
          Listens through your microphone, detects the tempo you're playing, and follows along.
          Works best with a clear, percussive source (drums, claps, palm-muted strums).
        </p>

        <button
          type="button"
          class="wide-btn"
          class:primary={met.micActive}
          onclick={() => met.toggleMic()}
        >
          {met.micActive ? '● Listening — tap to stop' : '🎤 Enable microphone'}
        </button>

        {#if met.micError}
          <p class="err">{met.micError}</p>
        {/if}

        {#if met.micActive}
          <div class="meter" aria-hidden="true">
            <div class="meter-fill" style="width:{Math.min(100, met.micLevel * 100)}%"></div>
          </div>

          <div class="detected">
            <div>
              <span class="d-num">{met.micDetectedBpm || '—'}</span>
              <span class="eyebrow" style="display:block">BPM detected</span>
            </div>
            <div class="conf">
              <div class="conf-bar"><div style="width:{confidencePct}%"></div></div>
              <span class="mono" style="font-size:10px;color:#8a7350">{confidencePct}% confidence</span>
            </div>
          </div>

          <div class="row spread gap-top">
            <div>
              <div style="font-weight:700">Follow my tempo</div>
              <div class="caption" style="font-size:11px">Continuously match the metronome to what it hears.</div>
            </div>
            <button
              type="button"
              class="switch"
              class:on={met.micFollow}
              aria-pressed={met.micFollow}
              aria-label="Toggle follow my tempo"
              onclick={() => (met.micFollow = !met.micFollow)}
            ></button>
          </div>

          {#if !met.micFollow}
            <button
              type="button"
              class="wide-btn"
              style="margin-top:12px"
              disabled={!met.micDetectedBpm}
              onclick={() => met.adoptMicTempo()}
            >
              Set metronome to {met.micDetectedBpm || '—'} BPM
            </button>
          {/if}
        {/if}
      </section>

      <!-- ---- practice log ---- -->
      <section class="card" data-testid="metronome-history">
        <div class="card-title">
          <span>Practice Log</span>
          {#if met.sessions.length}
            <button type="button" class="chip danger" onclick={confirmClear}>Clear</button>
          {/if}
        </div>

        {#if met.sessions.length === 0}
          <p class="caption" style="font-size:13px;line-height:1.5">
            No sessions yet. Hit <strong>Start</strong> and your practice — bars played and time —
            will be logged here automatically.
          </p>
        {:else}
          <div class="totals">
            <div><span class="t-num">{met.stats.totalSessions}</span><span class="eyebrow">sessions</span></div>
            <div><span class="t-num">{formatDuration(met.stats.totalSeconds)}</span><span class="eyebrow">total time</span></div>
            <div><span class="t-num">{met.stats.totalBars}</span><span class="eyebrow">total bars</span></div>
          </div>

          <ul class="log">
            {#each met.sessions as s (s.id)}
              <li class="entry">
                <div class="entry-main">
                  <div class="entry-top">
                    <span style="color:#2c261d">{s.bars} bars</span>
                    <span style="color:#a08a64">·</span>
                    <span>{formatDuration(s.durationSeconds)}</span>
                    {#if s.goal.type !== 'none'}
                      <span class="badge" class:good={s.goalReached}>
                        {s.goalReached ? '✓' : '◦'} {goalText(s)}
                      </span>
                    {/if}
                  </div>
                  <div class="entry-sub mono">
                    {dateFmt.format(new Date(s.startedAt))} · {bpmText(s)} · {s.timeSignature} · {s.automation}
                  </div>
                </div>
                <button
                  type="button"
                  class="del click"
                  aria-label="Delete session"
                  onclick={() => met.removeSession(s.id)}>✕</button
                >
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    </div>
  </div>
</div>

<style>
  .mt-wrap { display: flex; flex-direction: column; gap: 16px; max-width: 900px; margin: 0 auto; }
  /* Wide windows: the transport stays pinned on the left while the practice
     cards scroll beside it, so START is never a long scroll from the tempo. */
  @media (min-width: 1500px) {
    .mt-wrap { display: grid; grid-template-columns: minmax(380px, 0.7fr) 1.6fr; align-items: start; max-width: none; }
    .mt-wrap > .hero { position: sticky; top: 92px; }
  }

  .card {
    background: linear-gradient(#faf4e6, #f6efe0);
    border: 1px solid var(--line2);
    border-radius: 10px;
    padding: 16px 18px;
    box-shadow: 0 10px 24px -18px rgba(60, 40, 16, 0.4);
  }
  .card-title {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    font-weight: 700; font-size: 15px; margin-bottom: 12px;
  }
  .badge {
    font-family: var(--mono); font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 3px 8px; border-radius: 999px; border: 1px solid var(--line2);
    background: var(--parch); color: #8a7350; white-space: nowrap;
  }
  .badge.good { border-color: #3f6b5f; background: rgba(63, 107, 95, 0.12); color: #3f6b5f; }

  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
  .col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
  @media (max-width: 700px) {
    .cols { grid-template-columns: 1fr; }
  }

  /* ---- hero / transport ---- */
  .hero { display: flex; flex-direction: column; gap: 14px; text-align: center; }
  .bpm { display: flex; align-items: baseline; justify-content: center; gap: 8px; }
  .bpm-num {
    font-size: 4.4rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em;
    color: var(--accent); font-variant-numeric: tabular-nums;
  }
  .bpm-unit { font-size: 12px; font-weight: 700; color: #8a7350; letter-spacing: 0.14em; }
  .live { font-size: 11px; color: var(--tonic); margin-top: -8px; }

  .beats { display: flex; gap: 10px; justify-content: center; align-items: center; height: 28px; }
  .beat {
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--parch2); box-shadow: inset 0 0 0 1px var(--line2);
    transition: transform 0.08s ease, background 0.12s ease, box-shadow 0.12s ease;
  }
  .beat.accent { box-shadow: inset 0 0 0 2px var(--gold); }
  .beat.active { transform: scale(1.65); background: var(--tonic); box-shadow: 0 0 14px 2px rgba(63, 107, 95, 0.5); }
  .beat.accent.active { background: var(--accent); box-shadow: 0 0 16px 3px rgba(194, 86, 46, 0.55); }

  .slider { width: 100%; margin: 0; }

  .nudges { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .btn {
    font-family: var(--mono); font-size: 12px; cursor: pointer;
    padding: 9px 0; border-radius: 7px; border: 1px solid var(--line2);
    background: var(--parch); color: #5c4a30;
  }
  .btn:active { background: var(--parch2); }
  .btn.tap { border-color: var(--accent); color: var(--accent); font-weight: 700; }

  .sync { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: -4px; }

  .play {
    font-family: var(--mono); font-size: 15px; letter-spacing: 0.12em; font-weight: 700;
    cursor: pointer; padding: 15px; border-radius: 9px; border: 0;
    background: var(--accent); color: #fff;
    box-shadow: 0 4px 0 var(--accent-dark);
  }
  .play.stop { background: var(--accent-dark); box-shadow: 0 4px 0 #6e2c12; }
  .play:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--accent-dark); }

  .readout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding-top: 2px; }
  .stat { display: flex; flex-direction: column; gap: 3px; }
  .stat.mid { border-left: 1px solid var(--line); border-right: 1px solid var(--line); }
  .stat-num { font-size: 1.5rem; font-weight: 800; font-variant-numeric: tabular-nums; }

  /* ---- segmented control ---- */
  .seg {
    display: flex; gap: 4px; background: var(--parch2); border: 1px solid var(--line2);
    border-radius: 8px; padding: 4px; flex-wrap: wrap;
  }
  .seg button {
    flex: 1; min-width: 0; white-space: nowrap; cursor: pointer;
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.04em;
    padding: 8px 6px; border-radius: 6px; border: 0; background: transparent; color: #5c4a30;
  }
  .seg button.on { background: var(--accent); color: #fff; }
  /* rows with more or longer labels than fit: let them wrap rather than clip */
  .seg.wrap button { flex: 1 0 auto; padding: 8px 10px; }

  /* ---- fields ---- */
  .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
  .field { display: flex; flex-direction: column; gap: 5px; margin-top: 12px; }
  .fields .field { margin-top: 0; }
  .field.span2 { grid-column: 1 / -1; }
  .field label, .field .lbl { font-family: var(--mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a7350; }
  .field input[type='number'], .field select {
    font-family: var(--mono); font-size: 14px; color: var(--ink);
    background: #fbf4e4; border: 1px solid var(--line2); border-radius: 7px;
    padding: 9px 10px; width: 100%;
  }
  .field input:focus, .field select:focus { outline: 2px solid rgba(194, 86, 46, 0.4); }
  .toggle-field { flex-direction: row; align-items: center; justify-content: space-between; }

  .hint { font-size: 12px; margin: 12px 0 0; }

  /* ---- switch ---- */
  .switch {
    flex: none; width: 44px; height: 26px; border-radius: 999px; cursor: pointer;
    border: 1px solid var(--line2); background: var(--parch2); position: relative;
    transition: background 0.15s ease;
  }
  .switch::after {
    content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
    border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(60, 40, 16, 0.35);
    transition: left 0.15s ease;
  }
  .switch.on { background: var(--tonic); border-color: var(--tonic); }
  .switch.on::after { left: 20px; }

  .gap { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 12px; }
  .gap-top { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--line); }

  .row { display: flex; align-items: center; gap: 10px; }
  .row.spread { justify-content: space-between; }

  /* ---- practice tracker ---- */
  .counters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  .counter {
    background: #fbf4e4; border: 1px solid var(--line2); border-radius: 8px; padding: 12px;
    display: flex; flex-direction: column; gap: 4px; align-items: center;
  }
  .big { font-size: 1.9rem; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
  .progress { margin-top: 14px; height: 10px; border-radius: 999px; background: var(--parch2); border: 1px solid var(--line2); overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--gold), var(--accent)); transition: width 0.2s ease; }
  .celebrate { animation: mtPop 0.5s ease; box-shadow: 0 0 0 2px rgba(63, 107, 95, 0.45); }
  @keyframes mtPop { 0% { transform: scale(1); } 40% { transform: scale(1.015); } 100% { transform: scale(1); } }

  /* ---- mic ---- */
  .wide-btn {
    width: 100%; cursor: pointer; font-family: var(--mono); font-size: 12px;
    padding: 12px; border-radius: 8px; border: 1px solid var(--line2);
    background: var(--parch); color: #5c4a30; margin-top: 12px;
  }
  .wide-btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  .wide-btn:disabled { opacity: 0.5; cursor: default; }
  .err { margin: 12px 0 0; color: var(--accent-dark); font-size: 12px; }
  .meter { margin-top: 14px; height: 8px; border-radius: 999px; background: var(--parch2); border: 1px solid var(--line2); overflow: hidden; }
  .meter-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--accent)); transition: width 0.05s linear; }
  .detected { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 14px; }
  .d-num { font-size: 2.2rem; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
  .conf { flex: 1; max-width: 160px; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
  .conf-bar { width: 100%; height: 6px; border-radius: 999px; background: var(--parch2); border: 1px solid var(--line2); overflow: hidden; }
  .conf-bar > div { height: 100%; background: var(--tonic); transition: width 0.2s ease; }

  .live.warn { color: var(--accent); font-weight: 700; }

  /* ---- plan ---- */
  .plan { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
  .plan-row {
    display: grid; grid-template-columns: 18px 1fr 1.3fr auto; gap: 6px 8px; align-items: center;
    padding: 8px; border-radius: 8px; border: 1px solid var(--line2); background: #fbf4e4;
  }
  .plan-row.now { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
  .plan-n { font-size: 11px; color: #8a7350; text-align: center; }
  .plan-row select, .plan-nums input {
    font-family: var(--mono); font-size: 12px; color: var(--ink); min-width: 0; width: 100%;
    background: #fffaf0; border: 1px solid var(--line2); border-radius: 6px; padding: 6px;
  }
  .plan-acts { display: flex; gap: 2px; }
  .plan-acts .del { width: 24px; height: 26px; }
  .plan-acts .del:disabled { opacity: 0.3; }
  .plan-nums { grid-column: 2 / -1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .plan-nums label { display: flex; align-items: center; gap: 5px; font-size: 9px; letter-spacing: 0.08em; color: #8a7350; text-transform: uppercase; }
  .plan-nums input:disabled { opacity: 0.45; }

  /* ---- saved sounds & plans ---- */
  .save-row { display: flex; gap: 8px; margin-top: 12px; }
  .save-row input {
    flex: 1; min-width: 0; font-family: var(--mono); font-size: 12px; color: var(--ink);
    background: #fbf4e4; border: 1px solid var(--line2); border-radius: 7px; padding: 7px 9px;
  }
  .save-row .chip:disabled { opacity: 0.5; }
  .saved { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .saved-item {
    display: inline-flex; align-items: stretch; border: 1px solid var(--line2); border-radius: 999px;
    background: var(--parch); overflow: hidden;
  }
  .saved-item.on { border-color: var(--accent); background: rgba(194, 86, 46, 0.12); }
  .saved-name, .saved-del {
    border: 0; background: transparent; cursor: pointer; color: #5c4a30; font-size: 12px;
  }
  .saved-name { padding: 6px 4px 6px 12px; }
  .saved-del { padding: 6px 10px 6px 6px; color: #a08a64; font-size: 10px; }

  /* ---- drone ---- */
  .key-now { margin-top: 12px; font-size: 11px; color: #5c4a30; letter-spacing: 0.02em; }
  .customize { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
  .customize summary {
    cursor: pointer; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a7350;
    display: flex; align-items: center;
  }

  /* ---- history ---- */
  .sync .chip.on { background: var(--accent-dark); border-color: var(--accent-dark); color: #fff; }
  .chip.danger { color: var(--accent-dark); border-color: rgba(154, 63, 31, 0.4); }
  .totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
  .totals > div {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    background: #fbf4e4; border: 1px solid var(--line2); border-radius: 8px; padding: 10px;
  }
  .t-num { font-size: 1.15rem; font-weight: 800; font-variant-numeric: tabular-nums; }
  .log { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
  .entry { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-top: 1px solid var(--line); }
  .entry:first-child { border-top: none; }
  .entry-main { flex: 1; min-width: 0; }
  .entry-top { display: flex; align-items: center; gap: 7px; font-weight: 600; flex-wrap: wrap; font-size: 14px; }
  .entry-sub { font-size: 9.5px; color: #8a7350; margin-top: 3px; letter-spacing: 0.02em; }
  .del {
    flex: none; width: 28px; height: 28px; border-radius: 7px; border: 0;
    background: transparent; color: #a08a64; font-size: 12px;
  }
  .del:active { background: var(--parch2); }
</style>
