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

/**
 * This is a one-shot Phase 1 artifact, and running it after Phase 2 destroys
 * it. The mapping is computed from the *current* ids, so once every entity has
 * been renamed the computation returns `A -> A` for all of them, and writing
 * that over the file erases the only record of what each entity used to be
 * called — the record every one of the eleven renames was driven by.
 *
 * The give-away is the mapping being its own identity. If it is, there is
 * nothing left to migrate and nothing worth writing.
 */
const identical = result.mappings.filter((m) => m.oldId === m.newId).length;
if (identical > result.mappings.length / 2 && fs.existsSync(outPath)) {
  console.error(
    `Refusing to overwrite ${path.relative(root, outPath)}: ${identical} of ${result.mappings.length} entries ` +
      `would map an id to itself, which means the rename has already happened and this file is the record of it. ` +
      `Delete the file first if you genuinely intend to regenerate from scratch.`
  );
  process.exit(1);
}

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
