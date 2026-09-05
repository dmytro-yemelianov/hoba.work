/**
 * Coverage model: the explicit boundary around what the atlas does and does not represent.
 *
 * The ontology remains the source of truth for entities. This model names the situation
 * dimensions against which that ontology is judged, and points back to canonical entities
 * or scenarios as evidence for every non-absent slot.
 */
import { z } from 'zod';
import { ENTITY_CATALOG } from '@hoba/registry-core/catalog';
import { nodesOfTypes, type RegistryBundle } from '@hoba/registry-core/types';
import type { ValidationIssue } from './validation.js';
import type { Scenario } from './scenarios.js';

export const coverageStatusSchema = z.enum(['covered', 'partial', 'absent']);
const bilingualLabelSchema = z.object({ en: z.string().min(1), uk: z.string().min(1) });

export const coverageValueSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  label: bilingualLabelSchema,
  status: coverageStatusSchema,
  refs: z.array(z.string()).default([]),
});

export const coverageDimensionSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/),
  label: bilingualLabelSchema,
  values: z.array(coverageValueSchema).min(1),
});

export const coverageModelSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  method: z.object({
    source: z.string().min(1),
    unit: z.string().min(1),
    status: z.object({
      covered: z.string().min(1),
      partial: z.string().min(1),
      absent: z.string().min(1),
    }),
  }),
  dimensions: z.array(coverageDimensionSchema).min(1),
});

export type CoverageStatus = z.infer<typeof coverageStatusSchema>;
export type CoverageValue = z.infer<typeof coverageValueSchema>;
export type CoverageDimension = z.infer<typeof coverageDimensionSchema>;
export type CoverageModel = z.infer<typeof coverageModelSchema>;

export interface CoverageDimensionSummary {
  id: string;
  label: { en: string; uk: string };
  total: number;
  covered: number;
  partial: number;
  absent: number;
  score_percent: number;
}

export interface CoverageSummary {
  total: number;
  covered: number;
  partial: number;
  absent: number;
  score_percent: number;
  dimensions: CoverageDimensionSummary[];
}

const statusWeight: Record<CoverageStatus, number> = {
  covered: 1,
  partial: 0.5,
  absent: 0,
};

export function summarizeCoverage(model: CoverageModel): CoverageSummary {
  const dimensions = model.dimensions.map((dimension) => {
    const counts = { covered: 0, partial: 0, absent: 0 };
    let score = 0;
    for (const value of dimension.values) {
      counts[value.status] += 1;
      score += statusWeight[value.status];
    }
    return {
      id: dimension.id,
      label: dimension.label,
      total: dimension.values.length,
      ...counts,
      score_percent: Math.round((score / dimension.values.length) * 1000) / 10,
    };
  });
  const total = dimensions.reduce((sum, dimension) => sum + dimension.total, 0);
  const covered = dimensions.reduce((sum, dimension) => sum + dimension.covered, 0);
  const partial = dimensions.reduce((sum, dimension) => sum + dimension.partial, 0);
  const absent = dimensions.reduce((sum, dimension) => sum + dimension.absent, 0);
  return {
    total,
    covered,
    partial,
    absent,
    score_percent: Math.round(((covered + partial * 0.5) / total) * 1000) / 10,
    dimensions,
  };
}

/** Referential and internal consistency checks that make the coverage map reviewable. */
export function validateCoverageModel(
  model: CoverageModel,
  bundle: RegistryBundle,
  scenarios: Scenario[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (rule: string, message: string, nodeId?: string) =>
    issues.push({ severity: 'error', rule, message, nodeId });

  const known = new Set<string>(scenarios.map((scenario) => scenario.id));
  for (const descriptor of ENTITY_CATALOG) {
    for (const entry of nodesOfTypes(bundle, [descriptor.type])) known.add(entry.id);
  }

  const dimensionIds = new Set<string>();
  const valueIds = new Set<string>();
  for (const dimension of model.dimensions) {
    if (dimensionIds.has(dimension.id)) {
      error('duplicate-coverage-dimension', `Duplicate coverage dimension: ${dimension.id}`);
    }
    dimensionIds.add(dimension.id);

    for (const value of dimension.values) {
      const nodeId = `coverage.${dimension.id}.${value.id}`;
      if (valueIds.has(value.id)) {
        error('duplicate-coverage-value', `Duplicate coverage value: ${value.id}`, nodeId);
      }
      valueIds.add(value.id);

      if (value.status === 'absent' && value.refs.length > 0) {
        error('coverage-status-contradiction', 'An absent slot cannot cite coverage refs', nodeId);
      }
      if (value.status !== 'absent' && value.refs.length === 0) {
        error(
          'coverage-status-contradiction',
          `A ${value.status} slot must cite at least one canonical entity or scenario`,
          nodeId
        );
      }
      for (const ref of value.refs) {
        if (!known.has(ref)) {
          error('dangling-reference', `Coverage slot references unknown entry: ${ref}`, nodeId);
        }
      }
    }
  }
  return issues;
}
