/**
 * Reading scenarios off disk.
 *
 * Split from `scenarios.ts` so the schema and the checks stay reachable from a
 * runtime with no filesystem — the edge worker validates a submitted scenario
 * with exactly the code the build uses, rather than a second implementation of
 * the same rules.
 */
import fs from 'node:fs';
import path from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { SCENARIO_DIR } from '@hoba/registry-core/paths';
import { scenarioSchema, type Scenario } from './scenarios.js';
import type { EmpiricalScenario } from '@hoba/registry-core/types';

export function loadScenarios(root: string): Scenario[] {
  const dir = path.join(root, SCENARIO_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map((file) => {
      const full = path.join(dir, file);
      const parsed = scenarioSchema.safeParse(loadYaml(fs.readFileSync(full, 'utf-8')));
      if (!parsed.success) {
        throw new Error(
          `${full}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`
        );
      }
      return parsed.data;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Every id in every array must resolve against the loaded ontology.
 *
 * Design doc §4 is explicit that an unresolvable id here is a build error and
 * never a warning: a scenario that names an entity the registry does not have
 * is not a weaker scenario, it is a broken one.
 */

/**
 * The scenarios usable as diagnostic presets, in the shape the engine takes.
 *
 * These were four objects hardcoded in `diagnostics.ts`. They are authored
 * content now, so they live with the rest of it — but the engine stays pure and
 * browser-safe, which is why the mapping is here (this module already reads the
 * filesystem) and not there.
 *
 * A preset is any scenario carrying a `summary`; a scenario without one is a
 * composition to read, not a starting point to analyse from.
 */
export function empiricalScenarios(root: string): EmpiricalScenario[] {
  return loadScenarios(root)
    .filter((s) => s.summary)
    .map((s) => ({
      id: s.id,
      title: s.title.en,
      summary: s.summary!,
      stage: s.stage,
      artifacts: s.observations,
    }));
}
