import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

// Build setup for the exported kb: .svx pages through mdsvex, every page on the runbook layout,
// `#lib/…` resolving to src/lib, and a static build of every kb page.
const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } })],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
    alias: { '#lib': 'src/lib' },
    prerender: {
      entries: ['/kb'],
      handleHttpError: 'warn',
    },
  },
};
