/**
 * Regenerates the LEGACY_ALIASES block inside apps/web/public/_worker.js from
 * every entity's `aliases` field in the live (English) registry. Idempotent:
 * safe to run after every phase of the entity-rename migration as more
 * types accumulate aliases.
 *
 *   pnpm generate:redirects
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';

const TYPE_ROUTE: Record<string, string> = {
  barrier: 'barriers',
  observation: 'observations',
  mechanism: 'mechanisms',
  pattern: 'patterns',
  loop: 'loops',
  intervention: 'interventions',
  actor: 'actors',
};

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');

const collections: Array<{ type: string; items: Array<{ id: string; aliases?: string[] }> }> = [
  { type: 'barrier', items: bundle.barriers as never },
  { type: 'observation', items: bundle.observations as never },
  { type: 'mechanism', items: bundle.mechanisms as never },
  { type: 'pattern', items: bundle.patterns as never },
  { type: 'loop', items: bundle.loops as never },
  { type: 'intervention', items: bundle.interventions as never },
  { type: 'actor', items: bundle.actors as never },
];

const entries: Record<string, string> = {};
for (const { type, items } of collections) {
  const route = TYPE_ROUTE[type];
  for (const item of items) {
    // Aliases can be an array (most types) or an object (actors); only process arrays
    const aliases = Array.isArray(item.aliases) ? item.aliases : [];
    for (const alias of aliases) {
      entries[alias] = `/${route}/${item.id}`;
    }
  }
}

const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
const block =
  '// GENERATED — do not edit by hand. Run `pnpm generate:redirects` to refresh\n' +
  "// from every entity's `aliases` field. See scripts/generate-redirects.ts.\n" +
  `const LEGACY_ALIASES = ${JSON.stringify(sorted, null, 2)};\n` +
  '// END GENERATED';

const workerPath = path.join(root, 'site', 'public', '_worker.js');
const source = fs.readFileSync(workerPath, 'utf8');
const updated = source.replace(/\/\/ GENERATED[\s\S]*?\/\/ END GENERATED/, block);
if (updated === source && !source.includes('// GENERATED')) {
  throw new Error('generate-redirects: no GENERATED block found in _worker.js — has it been removed?');
}
fs.writeFileSync(workerPath, updated);

console.log(`Wrote ${Object.keys(sorted).length} redirect(s) to apps/web/public/_worker.js.`);
