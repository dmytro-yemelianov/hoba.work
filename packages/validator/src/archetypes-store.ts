/**
 * Reading archetypes off disk. Split from `archetypes.ts` for the same
 * reason as scenarios: the schema stays reachable from a runtime with no
 * filesystem, this module is the one that touches it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { ARCHETYPE_DIR } from '@hoba/registry-core/paths';
import { archetypeSchema, type Archetype } from './archetypes.js';

export function loadArchetypes(root: string): Archetype[] {
  const dir = path.join(root, ARCHETYPE_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map((file) => {
      const full = path.join(dir, file);
      const parsed = archetypeSchema.safeParse(loadYaml(fs.readFileSync(full, 'utf-8')));
      if (!parsed.success) {
        throw new Error(
          `${full}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
        );
      }
      return parsed.data;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
