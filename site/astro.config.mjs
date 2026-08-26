import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registrySrc = path.resolve(__dirname, '../packages/registry/src');

export default defineConfig({
  site: 'https://hoba.work',
  integrations: [
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  vite: {
    resolve: {
      // Build straight from the registry sources so the site never depends on a
      // stale packages/registry/dist. `/core` is the browser-safe subset used by
      // client scripts (no node:fs, no zod).
      alias: [
        { find: /^@hoba\/registry\/core$/, replacement: path.join(registrySrc, 'core.ts') },
        { find: /^@hoba\/registry$/, replacement: path.join(registrySrc, 'index.ts') },
      ],
    },
  },
});
