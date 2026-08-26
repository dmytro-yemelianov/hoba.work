import { z } from 'zod';

export const stageIdSchema = z.enum([
  'pre-posting',
  'sourcing',
  'ingestion',
  'screening',
  'recruiter',
  'technical',
  'team',
  'compensation',
  'offer',
  'post-offer',
]);

export const actorTypeSchema = z.enum([
  'system',
  'recruiter',
  'hiring-manager',
  'policy',
  'external',
  'candidate',
]);

export const natureTypeSchema = z.enum([
  'rule',
  'incentive',
  'bias',
  'noise',
  'void',
]);

export const visibilityTypeSchema = z.enum([
  'observable',
  'inferable',
  'opaque',
]);

export const removabilityTypeSchema = z.enum([
  'candidate',
  'intermediary',
  'none',
]);

export const emissionFidelitySchema = z.enum([
  'direct',
  'euphemism',
  'distortion',
  'noise',
  'void',
]);

export const emissionLikelihoodSchema = z.enum([
  'low',
  'medium',
  'high',
]);

export const evidenceKindSchema = z.enum([
  'primary',
  'research',
  'reporting',
  'survey',
  'anecdote',
  'illustrative',
]);

export const evidenceLevelSchema = z.enum([
  'established',
  'supported',
  'hypothesis',
  'illustrative',
]);

export const nodeStatusSchema = z.enum(['active', 'deprecated']);

export const costBandSchema = z.enum(['low', 'medium', 'high']);

export const scopeTypeSchema = z.enum([
  'individual',
  'team',
  'organizational',
  'industry',
  'ecosystem',
]);

export const interventionActorSchema = z.enum([
  'employer-policy',
  'recruiter-process',
  'ats-vendor',
  'hiring-manager',
  'candidate-action',
  'industry-standard',
  'policy',
]);

export const diagnosticProbeSchema = z.object({
  id: z.string().regex(/^PROBE-[A-Z0-9-]+$/),
  action: z.string().min(5),
  expected_signal: z.string().min(5),
  cost: costBandSchema,
  removability_target: removabilityTypeSchema.optional(),
});

export const emissionEdgeSchema = z.object({
  artifact: z.string().regex(/^HOBA-A-\d{3}$/),
  fidelity: emissionFidelitySchema.nullable().optional(),
  likelihood: emissionLikelihoodSchema.nullable().optional(),
  evidence: z.array(z.string()).optional(),
});

export const loopEdgeSchema = z.object({
  from: z.string().regex(/^HOBA-M-\d{3}$/),
  to: z.string().regex(/^HOBA-M-\d{3}$/),
  relation: z.enum(['amplifies', 'masks']),
});

// Artifact frontmatter schema
export const artifactSchema = z.object({
  id: z.string().regex(/^HOBA-A-\d{3}$/),
  type: z.literal('artifact'),
  title: z.string().min(3),
  summary: z.string().min(10),
  stages: z.array(stageIdSchema).min(1),
  fidelity: emissionFidelitySchema.nullable().optional(),
  status: nodeStatusSchema.default('active'),
  superseded_by: z.string().regex(/^HOBA-A-\d{3}$/).optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  evidence_ids: z.array(z.string()).optional(),
  probes: z.array(diagnosticProbeSchema).optional(),
  non_inferences: z.array(z.string()).min(1),
  content: z.string().optional(),
});

// Barrier frontmatter schema
export const barrierSchema = z.object({
  id: z.string().regex(/^HOBA-B-\d{3}$/),
  type: z.literal('barrier'),
  title: z.string().min(3),
  stage: stageIdSchema,
  order: z.number().int().positive(),
  precedes: z.array(z.string().regex(/^HOBA-B-\d{3}$/)).default([]),
  description: z.string().min(10),
  pass_condition: z.string().min(5),
  status: nodeStatusSchema.default('active'),
  superseded_by: z.string().regex(/^HOBA-B-\d{3}$/).optional(),
  evidence_level: evidenceLevelSchema.default('established'),
  evidence_ids: z.array(z.string()).optional(),
  content: z.string().optional(),
});

// Mechanism frontmatter schema
export const mechanismFacetsSchema = z.object({
  actor: actorTypeSchema,
  nature: natureTypeSchema,
  visibility: visibilityTypeSchema,
  removability: removabilityTypeSchema,
});

export const mechanismSchema = z.object({
  id: z.string().regex(/^HOBA-M-\d{3}$/),
  type: z.literal('mechanism'),
  title: z.string().min(3),
  summary: z.string().min(10),
  operates_at: z.array(z.string().regex(/^HOBA-B-\d{3}$/)).min(1),
  emissions: z.array(emissionEdgeSchema).default([]),
  facets: mechanismFacetsSchema,
  amplifies: z.array(z.string().regex(/^HOBA-M-\d{3}$/)).default([]),
  masks: z.array(z.string().regex(/^HOBA-M-\d{3}$/)).default([]),
  status: nodeStatusSchema.default('active'),
  superseded_by: z.string().regex(/^HOBA-M-\d{3}$/).optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  honest_baseline: z.boolean().default(false),
  evidence_ids: z.array(z.string()).optional(),
  non_inferences: z.array(z.string()).min(1),
  content: z.string().optional(),
});

// Pattern frontmatter schema
export const patternSchema = z.object({
  id: z.string().regex(/^HOBA-P-\d{3}$/),
  type: z.literal('pattern'),
  title: z.string().min(3),
  summary: z.string().min(10),
  required_artifacts: z.array(z.string().regex(/^HOBA-A-\d{3}$/)).min(1),
  compatible_mechanisms: z.array(z.string().regex(/^HOBA-M-\d{3}$/)).min(1),
  trigger_rule: z.string().min(10),
  establishes: z.array(z.string()).min(1),
  non_inferences: z.array(z.string()).min(1),
  interventions: z.array(z.string().regex(/^HOBA-I-\d{3}$/)).default([]),
  status: nodeStatusSchema.default('active'),
  superseded_by: z.string().regex(/^HOBA-P-\d{3}$/).optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  evidence_ids: z.array(z.string()).optional(),
  content: z.string().optional(),
});

// Loop frontmatter schema
export const loopSchema = z.object({
  id: z.string().regex(/^HOBA-L-\d{3}$/),
  type: z.literal('loop'),
  title: z.string().min(3),
  summary: z.string().min(10),
  mechanisms: z.array(z.string().regex(/^HOBA-M-\d{3}$/)).min(2),
  edges: z.array(loopEdgeSchema).min(2),
  entry_points: z.array(z.string().regex(/^HOBA-M-\d{3}$/)).min(1),
  interventions: z.array(z.string().regex(/^HOBA-I-\d{3}$/)).default([]),
  status: nodeStatusSchema.default('active'),
  superseded_by: z.string().regex(/^HOBA-L-\d{3}$/).optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  evidence_ids: z.array(z.string()).optional(),
  content: z.string().optional(),
});

// Intervention frontmatter schema
export const interventionSchema = z.object({
  id: z.string().regex(/^HOBA-I-\d{3}$/),
  type: z.literal('intervention'),
  title: z.string().min(3),
  summary: z.string().min(10),
  targets: z.array(z.string().regex(/^HOBA-[MBPLI]-\d{3}$/)).min(1),
  actor: interventionActorSchema,
  scope: scopeTypeSchema,
  cost: costBandSchema,
  status: nodeStatusSchema.default('active'),
  superseded_by: z.string().regex(/^HOBA-I-\d{3}$/).optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  expected_effects: z.array(z.string()).min(1),
  measurements: z.array(z.string()).min(1),
  evidence_ids: z.array(z.string()).optional(),
  content: z.string().optional(),
});

// Evidence record schema
export const evidenceSchema = z.object({
  id: z.string().regex(/^EVD-\d{3}$/),
  type: z.literal('evidence'),
  title: z.string().min(3),
  kind: evidenceKindSchema,
  summary: z.string().min(10),
  citation: z.string().optional(),
  url: z.string().url().optional(),
  period: z.string().optional(),
});

export const registryBundleSchema = z.object({
  version: z.string(),
  schema_version: z.string(),
  updated_at: z.string(),
  artifacts: z.array(artifactSchema),
  barriers: z.array(barrierSchema),
  mechanisms: z.array(mechanismSchema),
  patterns: z.array(patternSchema),
  loops: z.array(loopSchema),
  interventions: z.array(interventionSchema),
  evidence: z.array(evidenceSchema),
});
