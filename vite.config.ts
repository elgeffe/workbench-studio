/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Set VITE_BASE=/<repo>/ in CI so asset URLs resolve on GitHub Pages
  // (project sites are served from a sub-path). Defaults to '/' locally.
  base: process.env.VITE_BASE || '/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'pwa-maskable.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Workbench Studio',
        short_name: 'Workbench',
        description: 'An offline-ready groovebox and music-theory studio: circle of fifths, drums, chords, bass, metronome.',
        theme_color: '#2c2014',
        background_color: '#f3ead8',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        // The SVG scales for browsers that take it; the PNGs are what iOS and
        // Android home screens actually install. `maskable` is a separate
        // entry rather than a second purpose on the same file — a rounded
        // square declared maskable gets its own corners cropped off again.
        icons: [
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff,woff2}'],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, host: true },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
