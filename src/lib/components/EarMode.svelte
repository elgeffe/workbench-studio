<script lang="ts">
  import { useStore } from '../context';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div style="display:flex;gap:7px;margin-bottom:20px;justify-content:center;flex-wrap:wrap">
    {#each v.earLevels as l (l.id)}
      <div class="mono click" style="font-size:10px;letter-spacing:.06em;padding:9px 14px;border-radius:7px;border:1px solid {l.border};background:{l.bg};color:{l.fg}" role="button" tabindex="0" onclick={() => store.genEar(l.id)} onkeydown={(e) => e.key === 'Enter' && store.genEar(l.id)}>{l.name}</div>
    {/each}
  </div>

  {#if v.earStaff}
    <div style="display:flex;justify-content:center;margin:2px 0 16px">
      <svg viewBox="0 0 150 80" width="248" height="132" style="background:#fbf4e4;border:1px solid #e0cfae;border-radius:10px" aria-label="key signature staff">
        {#each [20, 30, 40, 50, 60] as ly (ly)}
          <line x1="10" y1={ly} x2="142" y2={ly} stroke="#b7a888" stroke-width="1" />
        {/each}
        <text x="11" y="53" style="font-family:serif;font-size:46px;fill:#3a2c1d">𝄞</text>
        {#each v.earStaff.accidentals as a, i (i)}
          <text x={47 + i * 11} y={a.y} text-anchor="middle" dominant-baseline="middle" style="font-family:serif;font-size:20px;font-weight:600;fill:#2c261d">{a.glyph}</text>
        {/each}
      </svg>
    </div>
  {/if}

  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin:6px 0 22px">
    <div class="caption" style="font-size:15px;color:#8a7350;text-align:center">{v.earPrompt}</div>
    <div class="ear-play click" role="button" tabindex="0" aria-label="Play" onclick={() => store.playEar()} onkeydown={(e) => e.key === 'Enter' && store.playEar()}>
      <!-- Inline SVG triangle instead of the ▶ glyph, which iOS renders as a
           colour emoji. The gradient + soft highlight give it a little depth. -->
      <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
        <defs>
          <linearGradient id="earPlayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ffffff" />
            <stop offset="1" stop-color="#ffe4d6" />
          </linearGradient>
        </defs>
        <path d="M13 8.5 L32 20 L13 31.5 Z" fill="url(#earPlayFill)" stroke="rgba(124,47,21,.35)" stroke-width="1" stroke-linejoin="round" />
      </svg>
    </div>
    <div class="mono" style="font-size:9px;letter-spacing:.14em;color:#a08a64;margin-top:10px">TAP TO PLAY · LISTEN</div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:9px;max-width:520px;margin:0 auto 18px">
    {#each v.earOptions as o (o.label)}
      <div class="click" style="text-align:center;font-size:17px;font-weight:600;padding:16px 10px;border-radius:9px;border:2px solid {o.border};background:{o.bg};color:{o.fg}" role="button" tabindex="0" onclick={() => store.pickEar(o.label)} onkeydown={(e) => e.key === 'Enter' && store.pickEar(o.label)}>{o.label}</div>
    {/each}
  </div>

  <div style="text-align:center;min-height:30px">
    <span class="mono" style="font-size:13px;letter-spacing:.04em;color:{v.earMsgColor}">{v.earMsg}</span>
  </div>

  <style>
    .ear-play {
      margin-top: 10px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, #d2693f, #a83f1c);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 0 #7c2f15, 0 14px 24px -8px rgba(124, 47, 21, .6),
        inset 0 2px 6px rgba(255, 255, 255, .28);
      transition: transform .09s ease, box-shadow .09s ease;
    }
    .ear-play svg {
      margin-left: 5px;
      filter: drop-shadow(0 1px 1px rgba(124, 47, 21, .35));
    }
    /* Press: sink into the button — shorten the drop shadow and nudge down. */
    .ear-play:active {
      transform: translateY(5px);
      box-shadow: 0 3px 0 #7c2f15, 0 6px 12px -6px rgba(124, 47, 21, .6),
        inset 0 2px 6px rgba(255, 255, 255, .28);
    }
  </style>

  <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #ddccac;padding-top:14px;margin-top:8px">
    <div class="mono" style="display:flex;gap:20px;font-size:11px;color:#7a6b50">
      <div>SCORE <span style="color:#2c261d;font-weight:700">{v.earScore}</span></div>
      <div>STREAK <span style="color:#c2562e;font-weight:700">{v.earStreak}</span></div>
    </div>
    <div class="mono click" style="font-size:12px;letter-spacing:.06em;color:#fff;background:#3f6b5f;padding:12px 22px;border-radius:8px" role="button" tabindex="0" onclick={() => store.genEar(store.earLevel)} onkeydown={(e) => e.key === 'Enter' && store.genEar(store.earLevel)}>NEXT ▶</div>
  </div>
</div>
