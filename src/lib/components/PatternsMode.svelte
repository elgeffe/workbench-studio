<script lang="ts">
  import { useStore } from '../context';
  import FretDiagram from './FretDiagram.svelte';
  const store = useStore();
  const v = $derived(store.view);
</script>

<div>
  <div style="margin-bottom:13px">
    <div class="eyebrow" style="margin-bottom:3px">{v.patShapesTab ? 'Chord shapes' : v.patFretTab ? 'Fretboard patterns' : 'Pattern library'} · {v.keyName}</div>
    <div class="caption" style="font-size:13px;max-width:460px">{v.patShapesTab ? 'Every chord quality draws one fixed shape on the circle of fifths. Tap one to hear it and see it light up on bass · guitar · piano.' : v.patFretTab ? 'Movable neck shapes, anchored to your key — orange is the root. Tap any diagram to hear it.' : 'Memorise the shape against its chord — then you know exactly where it sits in the music. Lit on bass · guitar · piano.'}</div>
  </div>

  <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:10px">
    {#each v.patCatChips as c (c.name)}
      <div class="mono click" style="flex:none;font-size:10px;letter-spacing:.06em;padding:8px 12px;border-radius:6px;border:1px solid {c.border};background:{c.bg};color:{c.fg};white-space:nowrap" role="button" tabindex="0" onclick={() => store.setPatCat(c.name)} onkeydown={(e) => e.key === 'Enter' && store.setPatCat(c.name)}>{c.name}</div>
    {/each}
  </div>

  {#if v.patFretTab}
    <div style="margin-top:6px">
      <div class="caption" style="font-size:13px;color:#5c4a30;max-width:560px;margin-bottom:14px">{v.patFretIntro}</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        {#each v.patFretCards as card (card.id)}
          <div style="flex:1 1 300px;min-width:280px;max-width:430px;background:#fbf6ea;border:1px solid #e0cfae;border-radius:10px;padding:12px 13px">
            <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:8px">
              <span style="font-size:16px;font-weight:700;color:#2c261d;line-height:1.1">{card.name}</span>
              <span class="mono" style="font-size:7px;letter-spacing:.1em;color:#fff;background:#3f6b5f;padding:3px 7px;border-radius:9px;white-space:nowrap">{card.tag}</span>
            </div>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:8px">
              {#each card.diagrams as d, di (di)}
                <div class="click" style="flex:none" role="button" tabindex="0" aria-label={'play ' + card.name + ' ' + d.name} onclick={() => store.playFretDiagram(d)} onkeydown={(e) => e.key === 'Enter' && store.playFretDiagram(d)}>
                  <div class="mono" style="font-size:7.5px;letter-spacing:.08em;color:#a08a64;margin-bottom:3px">{d.name.toUpperCase()} · ▶</div>
                  <FretDiagram {d} />
                </div>
              {/each}
            </div>
            <div class="caption" style="font-size:12.5px;color:#6b5a3e;line-height:1.45">{card.tip}</div>
          </div>
        {/each}
      </div>
    </div>
  {:else if v.patShapesTab}
    <div style="margin-top:6px">
      <div class="caption" style="font-size:13px;color:#5c4a30;max-width:520px;margin-bottom:14px">Plot a chord’s notes on the circle of fifths and join them up: every quality draws one fixed shape. Change the root and the shape just rotates — here the wheel is turned so your tonic sits at 12 o’clock, so each shape is the quality’s fingerprint. Tap one to hear it.</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        {#each v.patShapes as s (s.q)}
          <div class="click" style="flex:none;width:104px;background:#f6efe0;border:1px solid #ddccac;border-radius:9px;padding:8px 6px 9px;text-align:center" role="button" tabindex="0" onclick={() => store.hitChord(s.ch)} onkeydown={(e) => e.key === 'Enter' && store.hitChord(s.ch)}>
            <svg viewBox="0 0 80 80" width="80" height="80" style="display:block;margin:0 auto">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#e0cfae" stroke-width="1.5" />
              <polygon points={s.poly} fill="rgba(63,107,95,.16)" stroke="#3f6b5f" stroke-width="1.6" stroke-linejoin="round" />
              {#each s.dots as d, di (di)}
                <circle cx={d.x} cy={d.y} r={d.on ? 4 : 1.8} fill={d.root ? '#c2562e' : d.on ? '#3f6b5f' : '#d8c7a8'} />
              {/each}
            </svg>
            <div style="font-size:14px;font-weight:700;color:#2c261d;line-height:1.1;margin-top:4px;white-space:nowrap">{s.name}</div>
            <div class="mono" style="font-size:8px;letter-spacing:.06em;color:#8a7350;margin-top:2px">{s.label}</div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid #ddccac">
      {#each v.patChips as p (p.id)}
        <div class="serif click" style="font-size:14px;font-weight:{p.weight};padding:8px 13px;border-radius:14px;border:1.5px solid {p.border};background:{p.bg};color:#2c261d" role="button" tabindex="0" onclick={() => store.setPatId(p.id)} onkeydown={(e) => e.key === 'Enter' && store.setPatId(p.id)}>{p.name}</div>
      {/each}
    </div>

    <div style="display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:none">
        <div style="font-size:30px;font-weight:700;line-height:1.05;letter-spacing:-.01em">{v.patName}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
          <span class="mono" style="font-size:9px;letter-spacing:.1em;color:#8a7350">PLAYS OVER</span>
          <span class="click" style="font-size:17px;font-weight:700;color:#2c261d;background:#efe2c8;border:1px solid #cbb792;border-radius:6px;padding:6px 12px" role="button" tabindex="0" onclick={() => store.playPatChord()} onkeydown={(e) => e.key === 'Enter' && store.playPatChord()}>{v.patChordName}</span>
        </div>
      </div>
      <div style="flex:1 1 240px;min-width:230px">
        <div class="mono" style="font-size:9px;letter-spacing:.14em;color:#8a7350;margin-bottom:6px">FORMULA</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;min-height:30px">
          {#each v.patDegrees as d, i (i)}
            <div class="mono" style="font-size:12px;font-weight:700;color:{d.color};background:{d.bg};border:1px solid {d.bd};border-radius:5px;padding:6px 10px">{d.d}</div>
          {/each}
        </div>
        {#if v.patHasSeq}
          <div class="mono" style="font-size:11px;color:#7a6b50;letter-spacing:.04em;margin-bottom:8px">PHRASE · {v.patSeqNotes}</div>
        {/if}
        <div class="caption" style="font-size:14px;color:#5c4a30;max-width:480px">{v.patTip}</div>
      </div>
      <div class="mono click" style="flex:none;align-self:center;font-size:11px;letter-spacing:.06em;color:#fff;background:#3f6b5f;padding:12px 16px;border-radius:8px;box-shadow:0 4px 0 #2c4f45;text-align:center" role="button" tabindex="0" onclick={() => store.playPattern(v.activePat)} onkeydown={(e) => e.key === 'Enter' && store.playPattern(v.activePat)}>▶ HEAR<br />PATTERN</div>
    </div>
  {/if}

  {#if v.patFretTab}
    <div class="mono" style="display:flex;gap:14px;flex-wrap:wrap;font-size:9px;letter-spacing:.08em;color:#7a6b50;margin-top:18px">
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#c2562e;display:inline-block"></span>ROOT</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#3f6b5f;display:inline-block"></span>3RD</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#97a59c;display:inline-block"></span>5TH</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#b07d23;display:inline-block"></span>7TH</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#7a5ea8;display:inline-block"></span>COLOUR (2·4·6)</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:5px;background:#4a3a28;display:inline-block"></span>BARRE</div>
    </div>
  {:else}
    <div class="mono" style="display:flex;gap:14px;flex-wrap:wrap;font-size:9px;letter-spacing:.08em;color:#7a6b50;margin-top:18px">
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#c2562e;display:inline-block"></span>ROOT</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#3f6b5f;display:inline-block"></span>CHORD TONE</div>
      <div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:50%;background:#97a59c;display:inline-block"></span>SCALE TONE</div>
    </div>
  {/if}
</div>
