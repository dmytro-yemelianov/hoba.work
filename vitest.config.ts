import { defineConfig } from 'vitest/config';
import path from 'node:path';

const registrySrc = path.resolve(__dirname, './packages/registry/src');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: [
      { find: /^@hoba\/registry\/core$/, replacement: path.join(registrySrc, 'core.ts') },
      { find: /^@hoba\/registry$/, replacement: path.join(registrySrc, 'index.ts') },
    ],
  },
});
