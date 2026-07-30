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
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: 'The Workbench — Ear & Theory',
        short_name: 'Workbench',
        description: 'An offline-ready interactive music theory and practice studio.',
        theme_color: '#2c2014',
        background_color: '#f3ead8',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}'],
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
