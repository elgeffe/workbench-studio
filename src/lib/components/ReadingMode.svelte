<script lang="ts">
  import { useStore } from '../context';
  import Staff from './Staff.svelte';
  import { stepY, ledgerYs, LETTERS, type ReadClef } from '../engine/reading';

  const store = useStore();
  const v = $derived(store.view);

  let guideOpen = $state(false);

  // The learn-the-staff guide: a labelled stepwise run on each clef, built from
  // the same geometry the drills use. Both runs include middle C on its ledger
  // line, since that's the hinge where the two staves meet the piano.
  function guideRun(clef: ReadClef, fromStep: number, count: number) {
    return Array.from({ length: count }, (_, i) => {
      const s = fromStep + i;
      return {
        x: 52 + i * ((300 - 72) / (count - 1)),
        y: stepY(clef, s),
        acc: '',
        ledger: ledgerYs(clef, s),
        label: LETTERS[s % 7] + Math.floor(s / 7),
      };
    });
  }
  const trebleGuide = guideRun('treble', 28, 12); // C4 (middle C) up to G5
  const bassGuide = guideRun('bass', 18, 11); // G2 up to C4 (middle C)
</script>

<div>
  <!-- drill picker -->
  <div style="display:flex;gap:7px;margin-bottom:14px;justify-content:center;flex-wrap:wrap">
    {#each v.rdLevels as l (l.id)}
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:9px 14px;border-radius:7px;border:1px solid {l.border};background:{l.bg};color:{l.fg}" role="button" tabindex="0" onclick={() => store.setRdLevel(l.id)} onkeydown={(e) => e.key === 'Enter' && store.setRdLevel(l.id)}>{l.name}</div>
    {/each}
  </div>

  <!-- practice settings -->
  <div data-testid="reading-settings" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;padding:11px 13px;background:#f3ead4;border:1px solid #e0cfae;border-radius:9px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;width:52px">CLEF</span>
      {#each v.rdClefChips as c (c.id)}
        <div class="mono click" style="font-size:9px;padding:6px 10px;border-radius:6px;border:1px solid {c.border};background:{c.bg};color:{c.fg}" role="button" tabindex="0" onclick={() => store.setRdClef(c.id)} onkeydown={(e) => e.key === 'Enter' && store.setRdClef(c.id)}>{c.name}</div>
      {/each}
      <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;margin-left:8px">RANGE</span>
      {#each v.rdRangeChips as c (c.id)}
        <div class="mono click" style="font-size:9px;padding:6px 10px;border-radius:6px;border:1px solid {c.border};background:{c.bg};color:{c.fg}" role="button" tabindex="0" onclick={() => store.setRdRange(c.id)} onkeydown={(e) => e.key === 'Enter' && store.setRdRange(c.id)}>{c.name}</div>
      {/each}
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;width:52px">KEY</span>
      {#each v.rdKeyChips as c (c.id)}
        <div class="mono click" style="font-size:9px;padding:6px 10px;border-radius:6px;border:1px solid {c.border};background:{c.bg};color:{c.fg}" role="button" tabindex="0" onclick={() => store.setRdKeyMode(c.id)} onkeydown={(e) => e.key === 'Enter' && store.setRdKeyMode(c.id)}>{c.name}</div>
      {/each}
      {#if v.rdShowAcc}
        <div class="mono click" style="font-size:9px;padding:6px 10px;border-radius:6px;border:1px solid #cbb792;background:{v.rdAccBg};color:{v.rdAccFg}" role="button" tabindex="0" onclick={() => store.toggleRdAcc()} onkeydown={(e) => e.key === 'Enter' && store.toggleRdAcc()}>♯♭ Accidentals</div>
      {/if}
      <span class="mono" style="font-size:8px;letter-spacing:.12em;color:#8a7350;margin-left:8px">ANSWER</span>
      {#each v.rdAnswerChips as c (c.id)}
        <div class="mono click" style="font-size:9px;padding:6px 10px;border-radius:6px;border:1px solid {c.border};background:{c.bg};color:{c.fg}" role="button" tabindex="0" onclick={() => store.setRdAnswerMode(c.id)} onkeydown={(e) => e.key === 'Enter' && store.setRdAnswerMode(c.id)}>{c.name}</div>
      {/each}
    </div>
  </div>

  <!-- the staff -->
  {#if v.rdStaff}
    <div data-testid="reading-staff" style="display:flex;flex-direction:column;align-items:center;gap:5px;margin-bottom:14px">
      <Staff clef={v.rdStaff.clef} keyAcc={v.rdStaff.keyAcc} notes={v.rdStaff.notes} width={310} />
      <div class="mono" style="font-size:9px;letter-spacing:.1em;color:#a08a64">KEY · {v.rdKeyLabel}</div>
    </div>
  {/if}

  <div class="caption" style="font-size:15px;color:#8a7350;text-align:center;margin-bottom:14px">{v.rdPrompt}</div>

  {#if v.rdPlayMode}
    <div style="text-align:center;margin-bottom:18px">
      <div class="mono" style="font-size:10px;letter-spacing:.1em;color:#7a6b50">TAP THE NOTES ON THE PIANO OR FRETBOARDS →</div>
      {#if v.rdProgress}
        <div class="mono" style="font-size:12px;color:#3f6b5f;font-weight:700;margin-top:8px">{v.rdProgress}</div>
      {/if}
    </div>
  {:else}
    <div data-testid="reading-options" style="display:grid;grid-template-columns:repeat(2,1fr);gap:9px;max-width:520px;margin:0 auto 18px">
      {#each v.rdOptions as o (o.label)}
        <div class="click" style="text-align:center;font-size:17px;font-weight:600;padding:16px 10px;border-radius:9px;border:2px solid {o.border};background:{o.bg};color:{o.fg}" role="button" tabindex="0" onclick={() => store.pickReading(o.label)} onkeydown={(e) => e.key === 'Enter' && store.pickReading(o.label)}>{o.label}</div>
      {/each}
    </div>
  {/if}

  <div style="text-align:center;min-height:30px">
    <span class="mono" style="font-size:13px;letter-spacing:.04em;color:{v.rdMsgColor}">{v.rdMsg}</span>
  </div>

  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #ddccac;padding-top:14px;margin-top:8px">
    <div class="mono" style="display:flex;gap:20px;font-size:11px;color:#7a6b50">
      <div>SCORE <span style="color:#2c261d;font-weight:700">{v.rdScore}</span></div>
      <div>STREAK <span style="color:#c2562e;font-weight:700">{v.rdStreak}</span></div>
    </div>
    <div class="mono click" data-testid="reading-next" style="font-size:12px;letter-spacing:.06em;color:#fff;background:#3f6b5f;padding:12px 22px;border-radius:8px" role="button" tabindex="0" onclick={() => store.genReading()} onkeydown={(e) => e.key === 'Enter' && store.genReading()}>NEXT ▶</div>
  </div>

  <!-- learn the staff -->
  <div style="margin-top:22px;border-top:1px solid #ddccac;padding-top:14px">
    <div class="mono click" style="display:inline-block;font-size:10px;letter-spacing:.08em;padding:8px 13px;border-radius:7px;border:1px solid #cbb792;background:{guideOpen ? '#3f6b5f' : '#f6efe0'};color:{guideOpen ? '#fff' : '#5c4a30'}" role="button" tabindex="0" onclick={() => (guideOpen = !guideOpen)} onkeydown={(e) => e.key === 'Enter' && (guideOpen = !guideOpen)}>𝄞 LEARN THE STAFF {guideOpen ? '▲' : '▼'}</div>
    {#if guideOpen}
      <div data-testid="reading-guide" style="margin-top:14px;display:flex;flex-direction:column;gap:16px">
        <div>
          <div class="mono" style="font-size:9px;letter-spacing:.14em;color:#9c8460;margin-bottom:5px">TREBLE · LINES: E-G-B-D-F “Every Good Boy Does Fine” · SPACES: F-A-C-E</div>
          <Staff clef="treble" notes={trebleGuide} vbW={300} width={520} />
        </div>
        <div>
          <div class="mono" style="font-size:9px;letter-spacing:.14em;color:#9c8460;margin-bottom:5px">BASS · LINES: G-B-D-F-A “Good Boys Do Fine Always” · SPACES: A-C-E-G “All Cows Eat Grass”</div>
          <Staff clef="bass" notes={bassGuide} vbW={300} width={520} />
        </div>
        <div class="caption" style="font-size:13px;color:#6b5b40;line-height:1.55;max-width:640px">
          Both runs start or end on <b>middle C (C4)</b> — the little ledger-line note that sits just below the treble staff and just above the bass staff. On the piano it's the C nearest the middle; the two staves are really one big grand staff hinged on that note. Move up one staff position (line→space) and you move up one white key. When you answer by playing, any octave of the right note counts — find the same pitch on the piano keys or anywhere on the guitar and bass fretboards, and after each answer the instruments light the notes up so you can see where they live.
        </div>
      </div>
    {/if}
  </div>
</div>
