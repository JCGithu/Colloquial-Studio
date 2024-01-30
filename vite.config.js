import { sveltekit } from '@sveltejs/kit/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [wasm(), topLevelAwait(),nodePolyfills({include: ['util']}), sveltekit()],
	optimizeDeps: {
    include: ['pixi.js'],
  },
};

export default config;
