<script lang="ts">
  import { useStore } from '../context';
  import { formatDuration } from '../metronome/timing';
  import type { GoalType, PracticeSession } from '../metronome/types';
  import type { AutomationMode } from '../metronome/store.svelte';

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
  ];
  const subdivisions = [
    { v: 1, label: 'None' },
    { v: 2, label: 'Eighths' },
    { v: 3, label: 'Triplets' },
    { v: 4, label: '16ths' },
  ];

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

    <!-- Bridge to the studio's shared Workshop/Drums transport tempo. The two
         clocks stay independent (a ramp drill shouldn't drag the groovebox
         along), but one tap copies the BPM either way. -->
    <div class="sync">
      <span class="eyebrow">Studio tempo {store.tempo}</span>
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

        <div class="seg" role="tablist" aria-label="Automation mode">
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

  /* ---- history ---- */
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
