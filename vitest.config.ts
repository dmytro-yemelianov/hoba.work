import { defineConfig } from 'vitest/config';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Every workspace package resolves to `dist/` through its package.json exports,
 * so without these the unit gate reads compiled output — and the gate order is
 * validate → typecheck → unit → build, with nothing between `typecheck` (which
 * does not emit) and `unit`. A change to a package's source would be graded
 * against the previous build, and the combination that shipped would be one
 * that no test had ever seen.
 *
 * The aliases used to cover one hop: `@hoba/registry` reached its source, but
 * that facade re-exports `@hoba/registry-core`, which did not. Generated from
 * the directory now, so a new package is covered by existing.
 */
const packagesDir = path.resolve(__dirname, './packages');
const workspace = fs
  .readdirSync(packagesDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(packagesDir, e.name, 'src')))
  .map((e) => e.name);

// Subpath first: the alias list is matched in order, and `@hoba/x` would
// otherwise swallow `@hoba/x/y`.
const alias = [
  ...workspace.map((name) => ({
    find: new RegExp(`^@hoba/${name}/(.+)$`),
    replacement: path.join(packagesDir, name, 'src', '$1.ts'),
  })),
  ...workspace.map((name) => ({
    find: new RegExp(`^@hoba/${name}$`),
    replacement: path.join(packagesDir, name, 'src', 'index.ts'),
  })),
];

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: { alias },
});
