/**
 * The structured Analysis object (design doc §5).
 *
 * An analysis is one interpretation of one concrete input — a social post, a
 * rejection sequence, a set of funnel metrics — read against the registry. It
 * is **not canonical data**: it is never stored under `data/`, nothing in the
 * ontology can reference it, and it carries the registry version it was
 * produced against so a reader can tell what it was true of.
 *
 * Its whole job is to keep observation, interpretation and claim apart, which
 * is why the shape separates `observations` (what is in the input) from
 * `interpretations` (what someone concluded, attributed to whom) from
 * `compatible_entities` (what the registry says could be behind it, each at a
 * stated strength), and why `unknowns` and `prohibited_conclusions` are
 * required rather than optional.
 */
import { z } from 'zod';
import { evidenceLevelSchema } from '@hoba/registry-core/schemas';
import type { RegistryBundle } from '@hoba/registry-core/types';
import type { ValidationIssue } from './validation.js';

/**
 * The epistemic scale, weakest to strongest.
 *
 * `contradicted` and `unknown` are deliberately absent: they are states a claim
 * can be in, not points on the line, so they are never compared against it.
 */
const CLAIM_SCALE = [
  'observed',
  'compatible',
  'supported',
  'strongly_supported',
  'proven',
] as const;

/** Position on the scale, or null for the two states that are not on it. */
export function claimRank(level: string): number | null {
  const i = CLAIM_SCALE.indexOf(level as (typeof CLAIM_SCALE)[number]);
  return i === -1 ? null : i;
}

const observationRef = z.string().regex(/^obs\.[a-z0-9_]+$/);
const interventionRef = z.string().regex(/^int\.[a-z0-9_]+$/);

export const analysisSchema = z.object({
  input_type: z.enum([
    'social_post',
    'candidate_story',
    'funnel_metrics',
    'recruiter_report',
    'job_description',
    'rejection_sequence',
  ]),
  source_text: z.string(),
  observations: z.array(
    z.object({
      text: z.string(),
      registry_refs: z.array(observationRef),
      confidence: evidenceLevelSchema,
    })
  ),
  interpretations: z.array(
    z.object({
      text: z.string(),
      /** Whose reading this is. The distinction is the point of the field. */
      classification: z.enum(['author_interpretation', 'analyzer_interpretation']),
    })
  ),
  compatible_entities: z.array(
    z.object({
      id: z.string(),
      claim_level: evidenceLevelSchema,
      reason: z.string(),
    })
  ),
  unknowns: z.array(z.string()),
  /** Interventions available to each party, keyed by actor slug. */
  agency: z.record(z.string(), z.array(interventionRef)),
  prohibited_conclusions: z.array(z.string()),
  /**
   * The registry this was produced against, so a reader can tell what it was
   * true of. Strict semver, matching `schema/analysis.schema.json` — it briefly
   * accepted the date-coded form too, because the live registry still emitted
   * one until §10 landed. Strict about leading zeros, which is the only thing
   * separating `1.0.0` from `2026.08.3` structurally.
   */
  registry_version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
      'registry_version must be semver (e.g. 1.0.0)'
    ),
});

export type Analysis = z.infer<typeof analysisSchema>;

/**
 * Schema conformance plus the epistemic invariants (design doc §5).
 *
 * Two rules beyond the shape:
 *  - every registry id named must resolve, as it must in a scenario;
 *  - no claim may stand above the level the cited entity itself carries.
 *    §6 puts it as "`compatible` never implies `proven`": reading one input
 *    cannot raise the registry's own claim, and an analysis that says otherwise
 *    is asserting proof the registry does not have.
 */
export function validateAnalysis(input: unknown, bundle: RegistryBundle): ValidationIssue[] {
  const parsed = analysisSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => ({
      severity: 'error' as const,
      rule: 'schema',
      message: `${i.path.join('.') || '(root)'}: ${i.message}`,
    }));
  }
  const analysis = parsed.data;
  const issues: ValidationIssue[] = [];

  const levelById = new Map<string, string>();
  for (const n of [
    ...bundle.observations,
    ...bundle.mechanisms,
    ...bundle.barriers,
    ...bundle.patterns,
    ...bundle.loops,
    ...bundle.interventions,
  ]) {
    levelById.set(n.id, (n as { evidence_level?: string }).evidence_level ?? 'unknown');
  }
  const interventionIds = new Set(bundle.interventions.map((i) => i.id));
  const actorSlugs = new Set(bundle.actors.map((a) => a.slug));

  for (const o of analysis.observations) {
    for (const ref of o.registry_refs) {
      if (!levelById.has(ref)) {
        issues.push({
          severity: 'error',
          rule: 'dangling-reference',
          message: `observations.registry_refs references unknown entity: ${ref}`,
        });
      }
    }
  }

  for (const e of analysis.compatible_entities) {
    const authored = levelById.get(e.id);
    if (authored === undefined) {
      issues.push({
        severity: 'error',
        rule: 'dangling-reference',
        nodeId: e.id,
        message: `compatible_entities references unknown entity: ${e.id}`,
      });
      continue;
    }
    const claimed = claimRank(e.claim_level);
    const carried = claimRank(authored);
    if (claimed !== null && carried !== null && claimed > carried) {
      issues.push({
        severity: 'error',
        rule: 'overclaim',
        nodeId: e.id,
        message: `claims "${e.claim_level}" for ${e.id}, which the registry itself carries only as "${authored}"`,
      });
    }
  }

  for (const [actor, interventions] of Object.entries(analysis.agency)) {
    if (!actorSlugs.has(actor)) {
      issues.push({
        severity: 'error',
        rule: 'dangling-reference',
        message: `agency names unknown actor: ${actor}`,
      });
    }
    for (const id of interventions) {
      if (!interventionIds.has(id)) {
        issues.push({
          severity: 'error',
          rule: 'dangling-reference',
          message: `agency.${actor} references unknown intervention: ${id}`,
        });
      }
    }
  }

  return issues;
}
