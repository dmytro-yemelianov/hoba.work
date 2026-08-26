import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@hoba/registry': path.resolve(__dirname, './packages/registry/src/index.ts'),
    },
  },
});
