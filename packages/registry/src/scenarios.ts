/**
 * Scenarios: validated compositions of ontology entities (design doc §4).
 *
 * A scenario describes a coherent situation by naming the entities it is made
 * of. It is deliberately **not** an ontology entity: `scenario` never appears
 * in the entity type enum, and no ontology schema defines a field that could
 * hold a scenario id. The reference runs one way, and it runs that way because
 * of what the schemas do and do not declare — not because a rule says so.
 *
 * Scenarios are also the one place this migration keeps a standalone YAML file
 * per entity, since they carry no long-form rendered body the way the ten
 * authored types do.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';
import type { RegistryBundle } from './types.js';
import type { ValidationIssue } from './validation.js';

const observationRef = z.string().regex(/^obs\.[a-z0-9_]+$/);
const mechanismRef = z.string().regex(/^mech\.[a-z0-9_]+$/);
const barrierRef = z.string().regex(/^bar\.[a-z0-9_]+$/);
const processRef = z.string().regex(/^proc\.[a-z0-9_]+$/);
const evidenceRef = z.string().regex(/^evidence\.[a-z0-9_]+$/);
const interventionRef = z.string().regex(/^int\.[a-z0-9_]+$/);

export const scenarioSchema = z.object({
  id: z.string().regex(/^scenario\.[a-z0-9_]+$/, 'scenario id must look like scenario.<name>'),
  /** Both mirrors, because each language is judged on its own. */
  title: z.object({ en: z.string().min(1), uk: z.string().min(1) }),
  /** What was actually seen. A scenario with nothing observed is not a scenario. */
  observations: z.array(observationRef).min(1),
  compatible_mechanisms: z.array(mechanismRef).default([]),
  compatible_barriers: z.array(barrierRef).default([]),
  process_states: z.array(processRef).default([]),
  evidence: z.array(evidenceRef).default([]),
  /** What this situation explicitly does not establish, stated in prose. */
  excluded_claims: z.array(z.string()).default([]),
  /** Interventions available to each party, keyed by actor slug. */
  agency: z.record(z.array(interventionRef)).default({}),
});

export type Scenario = z.infer<typeof scenarioSchema>;

/** Where scenarios live, relative to the repository root. */
export const SCENARIO_DIR = path.join('data', 'scenarios');

export function loadScenarios(root: string): Scenario[] {
  const dir = path.join(root, SCENARIO_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .sort()
    .map((file) => {
      const full = path.join(dir, file);
      const parsed = scenarioSchema.safeParse(yaml.load(fs.readFileSync(full, 'utf-8')));
      if (!parsed.success) {
        throw new Error(`${full}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
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
export function validateScenarios(scenarios: Scenario[], bundle: RegistryBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const known = new Set<string>([
    ...bundle.artifacts.map((a) => a.id),
    ...bundle.mechanisms.map((m) => m.id),
    ...bundle.barriers.map((b) => b.id),
    ...bundle.workflows.map((w) => w.id),
    ...bundle.evidence.map((e) => e.id),
    ...bundle.interventions.map((i) => i.id),
  ]);
  const actorSlugs = new Set(bundle.actors.map((a) => a.slug));

  const seen = new Set<string>();
  for (const s of scenarios) {
    if (seen.has(s.id)) {
      issues.push({ severity: 'error', rule: 'duplicate-id', nodeId: s.id, message: `Duplicate scenario ID detected: ${s.id}` });
    }
    seen.add(s.id);

    const check = (field: string, ids: string[]) => {
      for (const id of ids) {
        if (known.has(id)) continue;
        issues.push({ severity: 'error', rule: 'dangling-reference', nodeId: s.id, message: `${field} references unknown entity: ${id}` });
      }
    };
    check('observations', s.observations);
    check('compatible_mechanisms', s.compatible_mechanisms);
    check('compatible_barriers', s.compatible_barriers);
    check('process_states', s.process_states);
    check('evidence', s.evidence);

    for (const [actor, interventions] of Object.entries(s.agency)) {
      if (!actorSlugs.has(actor)) {
        issues.push({ severity: 'error', rule: 'dangling-reference', nodeId: s.id, message: `agency names unknown actor: ${actor}` });
      }
      check(`agency.${actor}`, interventions);
    }
  }
  return issues;
}
