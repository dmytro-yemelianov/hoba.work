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
 *
 * This module is the schema and the checks, and reaches no Node built-in, so an
 * edge runtime can validate a scenario without a filesystem. Reading them off
 * disk lives in `scenarios-store.ts`.
 */
import { z } from 'zod';
import {
  CASE_AXES,
  DERIVED_CASE_COORDINATES,
  assessCaseAssignment,
  type CaseAssignment,
} from '@hoba/registry-core/case-space';
import { stageIdSchema } from '@hoba/registry-core/schemas';
import type { RegistryBundle } from '@hoba/registry-core/types';
import type { ValidationIssue } from './validation.js';

const observationRef = z.string().regex(/^obs\.[a-z0-9_]+$/);
const mechanismRef = z.string().regex(/^mech\.[a-z0-9_]+$/);
const barrierRef = z.string().regex(/^bar\.[a-z0-9_]+$/);
const processRef = z.string().regex(/^proc\.[a-z0-9_]+$/);
const evidenceRef = z.string().regex(/^evidence\.[a-z0-9_]+$/);
const interventionRef = z.string().regex(/^int\.[a-z0-9_]+$/);

export const scenarioCaseAssignmentStatusSchema = z.enum([
  'known',
  'inferred',
  'unknown',
  'not_applicable',
]);

export const scenarioCaseAssignmentSchema = z.object({
  coordinate: z.string().min(1),
  status: scenarioCaseAssignmentStatusSchema,
  value: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
  basis: z.string().min(20),
  evidence: z.array(evidenceRef).default([]),
});

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
  agency: z.record(z.string(), z.array(interventionRef)).default({}),
  /**
   * Optional, and only meaningful for a scenario used as a diagnostic preset:
   * a one-line gloss and where in the funnel the situation sits. The four
   * presets that used to be hardcoded in `diagnostics.ts` carry both.
   */
  summary: z.string().optional(),
  stage: stageIdSchema.optional(),
  /**
   * Reviewed case-space coordinates for the scenario. These are an editorial
   * overlay on top of the entity composition: `known`/`inferred` coordinates
   * join the machine lift, while `unknown` and `not_applicable` make gaps
   * explicit without pretending to classify prose.
   */
  case_assignments: z.array(scenarioCaseAssignmentSchema).default([]),
});

export type Scenario = z.infer<typeof scenarioSchema>;
export type ScenarioCaseAssignment = z.infer<typeof scenarioCaseAssignmentSchema>;

const coordinateDomains = new Map(
  [...CASE_AXES, ...DERIVED_CASE_COORDINATES].map((axis) => [axis.id, axis.values] as const)
);
const subsetCoordinates = new Set(
  CASE_AXES.filter((axis) => axis.kind === 'subset').map((axis) => axis.id)
);

export function validateScenarios(
  scenarios: Scenario[],
  bundle: RegistryBundle
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const known = new Set<string>([
    ...bundle.observations.map((a) => a.id),
    ...bundle.mechanisms.map((m) => m.id),
    ...bundle.barriers.map((b) => b.id),
    ...bundle.processes.map((w) => w.id),
    ...bundle.evidence.map((e) => e.id),
    ...bundle.interventions.map((i) => i.id),
  ]);
  const actorSlugs = new Set(bundle.actors.map((a) => a.slug));

  const seen = new Set<string>();
  for (const s of scenarios) {
    if (seen.has(s.id)) {
      issues.push({
        severity: 'error',
        rule: 'duplicate-id',
        nodeId: s.id,
        message: `Duplicate scenario ID detected: ${s.id}`,
      });
    }
    seen.add(s.id);

    const check = (field: string, ids: string[]) => {
      for (const id of ids) {
        if (known.has(id)) continue;
        issues.push({
          severity: 'error',
          rule: 'dangling-reference',
          nodeId: s.id,
          message: `${field} references unknown entity: ${id}`,
        });
      }
    };
    check('observations', s.observations);
    check('compatible_mechanisms', s.compatible_mechanisms);
    check('compatible_barriers', s.compatible_barriers);
    check('process_states', s.process_states);
    check('evidence', s.evidence);

    const caseCoordinates = new Set<string>();
    const caseAssignment: CaseAssignment = {};
    for (const assignment of s.case_assignments) {
      if (caseCoordinates.has(assignment.coordinate)) {
        issues.push({
          severity: 'error',
          rule: 'duplicate-case-assignment',
          nodeId: s.id,
          message: `case_assignments repeats coordinate: ${assignment.coordinate}`,
        });
      }
      caseCoordinates.add(assignment.coordinate);

      const domain = coordinateDomains.get(assignment.coordinate);
      if (domain === undefined) {
        issues.push({
          severity: 'error',
          rule: 'unknown-case-coordinate',
          nodeId: s.id,
          message: `case_assignments names unknown coordinate: ${assignment.coordinate}`,
        });
        continue;
      }

      const carriesValue = assignment.status === 'known' || assignment.status === 'inferred';
      if (carriesValue && assignment.value === undefined) {
        issues.push({
          severity: 'error',
          rule: 'missing-case-assignment-value',
          nodeId: s.id,
          message: `case_assignments.${assignment.coordinate} is ${assignment.status} but has no value`,
        });
        continue;
      }
      if (!carriesValue && assignment.value !== undefined) {
        issues.push({
          severity: 'error',
          rule: 'unexpected-case-assignment-value',
          nodeId: s.id,
          message: `case_assignments.${assignment.coordinate} is ${assignment.status} and must not carry a value`,
        });
        continue;
      }

      const isSubset = subsetCoordinates.has(assignment.coordinate);
      if (assignment.value !== undefined) {
        const values = Array.isArray(assignment.value) ? assignment.value : [assignment.value];
        if (isSubset !== Array.isArray(assignment.value)) {
          issues.push({
            severity: 'error',
            rule: 'case-assignment-shape',
            nodeId: s.id,
            message: `case_assignments.${assignment.coordinate} must be ${
              isSubset ? 'an array' : 'a scalar'
            }`,
          });
          continue;
        }
        for (const value of values) {
          if (domain.includes(value)) continue;
          issues.push({
            severity: 'error',
            rule: 'invalid-case-assignment-value',
            nodeId: s.id,
            message: `case_assignments.${assignment.coordinate} has invalid value: ${value}`,
          });
        }
        if (!values.some((value) => !domain.includes(value))) {
          caseAssignment[assignment.coordinate] = assignment.value;
        }
      }

      check(`case_assignments.${assignment.coordinate}.evidence`, assignment.evidence);
    }

    const admissibility = assessCaseAssignment(caseAssignment);
    if (admissibility.verdict === 'refuted') {
      issues.push({
        severity: 'error',
        rule: 'case-assignment-refuted',
        nodeId: s.id,
        message: `case_assignments violates Γ: ${admissibility.violations.join(', ')}`,
      });
    }

    for (const [actor, interventions] of Object.entries(s.agency)) {
      if (!actorSlugs.has(actor)) {
        issues.push({
          severity: 'error',
          rule: 'dangling-reference',
          nodeId: s.id,
          message: `agency names unknown actor: ${actor}`,
        });
      }
      check(`agency.${actor}`, interventions);
    }
  }
  return issues;
}

/**
 * Resolves a scenario by its canonical id or by the bare name it used to have,
 * so `--scenario ghost-refresh` keeps working now that the id is
 * `scenario.ghost_refresh`.
 */
export function resolveScenarioId(scenarios: { id: string }[], asked: string): string | undefined {
  const normalised = `scenario.${asked.replace(/^scenario\./, '').replace(/-/g, '_')}`;
  return scenarios.find((s) => s.id === asked || s.id === normalised)?.id;
}
