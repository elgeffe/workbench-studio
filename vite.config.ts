/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // Set VITE_BASE=/<repo>/ in CI so asset URLs resolve on GitHub Pages
  // (project sites are served from a sub-path). Defaults to '/' locally.
  base: process.env.VITE_BASE || '/',
  plugins: [svelte()],
  server: { port: 5173, host: true },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
