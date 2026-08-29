/**
 * Generates the old-code -> new dotted-namespace ID mapping table for the
 * data-first architecture migration (Phase 1: Canonicalize). Read-only —
 * writes one report file, touches no content under data/,
 * or evidence/.
 *
 *   pnpm generate:id-mapping
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildIdMapping, loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');
const result = buildIdMapping(bundle);

const outDir = path.join(root, 'migration');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'id-mapping.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');

console.log(`${result.mappings.length} entities mapped -> ${path.relative(root, outPath)}`);

if (result.collisions.length > 0) {
  console.error(`\n${result.collisions.length} collision(s) found — resolve before Phase 2:`);
  for (const c of result.collisions) {
    console.error(`  [${c.type}] slug "${c.slug}" shared by: ${c.entities.join(', ')}`);
  }
  process.exit(1);
}

console.log('✓ No collisions.');
