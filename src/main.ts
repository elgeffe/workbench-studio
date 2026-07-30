import { mount } from 'svelte';
import { registerSW } from 'virtual:pwa-register';
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource/space-mono/latin.css';
import './app.css';
import App from './App.svelte';

// Keep the app shell and generated Web Audio studio available without a network.
// Updates are activated automatically and apply on the next navigation.
registerSW({ immediate: true });

const app = mount(App, { target: document.getElementById('app')! });

export default app;
