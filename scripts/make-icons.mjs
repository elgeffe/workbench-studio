// Icon generator — the single source of truth for everything in public/ that
// shows the app's mark.
//
//   node scripts/make-icons.mjs
//
// The mark is the app's own signature: a twelve-segment circle-of-fifths dial
// on the workbench's dark ground, one segment lit in rust at twelve o'clock,
// around the same cream hub with a rust centre that the in-app header wears.
// The wedge geometry is computed rather than hand-written so the segments stay
// exactly 30 degrees apart at any scale.
//
// Three shapes come out of one drawing:
//   any        — rounded square, transparent outside the radius (favicon, desktop)
//   maskable   — full-bleed ground, art pulled in to the 80% safe circle so
//                Android's mask cannot crop it
//   apple      — full-bleed ground at full size; iOS applies its own squircle,
//                so the art must not be pre-rounded but does not need padding
//
// PNGs exist because iOS ignores SVG for home-screen icons: an install with
// only an SVG in the manifest gets a generated placeholder instead of the mark.
// They are rasterised with the Chromium that Playwright already ships.

import { chromium } from '@playwright/test';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const INK = '#201709';      // ground, outer
const INK_HI = '#4a3826';   // ground, lit corner
const GOLD = '#d2a84b';     // the eleven unlit segments
const RUST = '#c2562e';     // the tonic segment and the hub's centre
const CREAM = '#fbf5e8';
const CREAM_LO = '#e9d8b5';

const C = 256;              // everything is drawn in a 512 box
const HUB = 78;             // cream hub radius — small enough that the twelve read as a ring
const DOT = 22;             // rust centre radius, echoing the header's brand mark
const RI = 122;             // segment inner radius
const RO = 178;             // segment outer radius
const RO_TONIC = 196;       // the lit segment reaches further out, as a pointer
const HALF = 10.5;          // half a segment's arc, so a 9 degree gap between

/** One annular segment, centred on `deg` (0 = twelve o'clock, clockwise). */
function wedge(deg, ri, ro) {
  const rad = (d) => ((d - 90) * Math.PI) / 180;
  const at = (r, a) => `${(C + r * Math.cos(a)).toFixed(1)} ${(C + r * Math.sin(a)).toFixed(1)}`;
  const a1 = rad(deg - HALF);
  const a2 = rad(deg + HALF);
  return `M${at(ro, a1)}A${ro} ${ro} 0 0 1 ${at(ro, a2)}L${at(ri, a2)}A${ri} ${ri} 0 0 0 ${at(ri, a1)}Z`;
}

const goldSegments = Array.from({ length: 11 }, (_, i) => wedge((i + 1) * 30, RI, RO));

/**
 * @param {object} o
 * @param {number} o.size    viewBox edge (512 for the app icon, 64 for the favicon)
 * @param {number} [o.round] corner radius as a fraction of the edge; 0 = full bleed
 * @param {number} [o.scale] art scale, to stay inside a maskable safe zone
 */
function svg({ size, round = 0.22, scale = 1 }) {
  const rx = (512 * round).toFixed(0);
  const art = scale === 1
    ? ''
    : ` transform="translate(${C} ${C}) scale(${scale}) translate(${-C} ${-C})"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" role="img" aria-labelledby="wb-icon-title">
  <title id="wb-icon-title">The Workbench</title>
  <defs>
    <radialGradient id="ground" cx="34%" cy="26%" r="86%">
      <stop offset="0" stop-color="${INK_HI}"/>
      <stop offset="1" stop-color="${INK}"/>
    </radialGradient>
    <radialGradient id="hub" cx="36%" cy="30%" r="76%">
      <stop offset="0" stop-color="${CREAM}"/>
      <stop offset="1" stop-color="${CREAM_LO}"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#ground)"/>
  <g${art}>
    <g fill="${GOLD}">
${goldSegments.map((d) => `      <path d="${d}"/>`).join('\n')}
    </g>
    <path d="${wedge(0, RI, RO_TONIC)}" fill="${RUST}"/>
    <circle cx="${C}" cy="${C}" r="${HUB}" fill="url(#hub)"/>
    <circle cx="${C}" cy="${C}" r="${DOT}" fill="${RUST}"/>
  </g>
</svg>
`;
}

const SVGS = {
  // Browser tab / desktop install. Rounded, so it needs a transparent surround.
  'favicon.svg': svg({ size: 64 }),
  'pwa-icon.svg': svg({ size: 512 }),
  // Android adaptive icon: full bleed, art inside the 80% safe circle.
  'pwa-maskable.svg': svg({ size: 512, round: 0, scale: 0.78 }),
};

// name -> [source svg, pixel size, keep the area outside the corner radius transparent]
const PNGS = {
  'pwa-192.png': [SVGS['pwa-icon.svg'], 192, true],
  'pwa-512.png': [SVGS['pwa-icon.svg'], 512, true],
  'pwa-maskable-512.png': [SVGS['pwa-maskable.svg'], 512, false],
  // iOS masks this itself, so it is square, opaque and unpadded.
  'apple-touch-icon.png': [svg({ size: 180, round: 0 }), 180, false],
};

await mkdir(PUBLIC, { recursive: true });
for (const [name, body] of Object.entries(SVGS)) {
  await writeFile(join(PUBLIC, name), body);
  console.log(`wrote public/${name}`);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const scratch = join(PUBLIC, '.icon-tmp.html');
for (const [name, [source, size, transparent]] of Object.entries(PNGS)) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  // Inline the drawing in a bare page so the shot is exactly the icon: no
  // document margin, and a transparent backdrop for the rounded variants.
  await writeFile(scratch, `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>
${source}`);
  await page.goto(pathToFileURL(scratch).href);
  await page.screenshot({ path: join(PUBLIC, name), omitBackground: transparent });
  await page.close();
  console.log(`wrote public/${name} (${size}px)`);
}
await browser.close();
await rm(scratch, { force: true });
