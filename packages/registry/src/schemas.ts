import { z } from 'zod';

// ---------------------------------------------------------------------------
// Canonical ID patterns (single source of truth for every ID regex)
// ---------------------------------------------------------------------------
export const ID_PATTERNS = {
  artifact: /^A-\d{3}$/,
  barrier: /^B-\d{3}$/,
  mechanism: /^M-\d{3}$/,
  pattern: /^P-\d{3}$/,
  loop: /^L-\d{3}$/,
  intervention: /^I-\d{3}$/,
  evidence: /^EVD-\d{3}$/,
  probe: /^PROBE-[A-Z0-9-]+$/,
} as const;

const artifactId = z.string().regex(ID_PATTERNS.artifact);
const barrierId = z.string().regex(ID_PATTERNS.barrier);
const mechanismId = z.string().regex(ID_PATTERNS.mechanism);
const patternId = z.string().regex(ID_PATTERNS.pattern);
const loopId = z.string().regex(ID_PATTERNS.loop);
const interventionId = z.string().regex(ID_PATTERNS.intervention);
const evidenceId = z.string().regex(ID_PATTERNS.evidence);

// Ordered by funnel progression. The order of this list is meaningful and is
// reused by the site (stage pickers) and the CLI/MCP (stage validation).
export const stageIdSchema = z.enum([
  'pre-posting',
  'sourcing',
  'ingestion',
  'screening',
  'recruiter',
  'technical',
  'hiring-manager',
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

export const natureTypeSchema = z.enum(['rule', 'incentive', 'bias', 'noise', 'void']);

export const visibilityTypeSchema = z.enum(['observable', 'inferable', 'opaque']);

export const removabilityTypeSchema = z.enum(['candidate', 'intermediary', 'none']);

export const emissionFidelitySchema = z.enum(['direct', 'euphemism', 'distortion', 'noise', 'void']);

export const emissionLikelihoodSchema = z.enum(['low', 'medium', 'high']);

export const evidenceKindSchema = z.enum([
  'primary',
  'research',
  'reporting',
  'survey',
  'anecdote',
  'illustrative',
]);

export const evidenceLevelSchema = z.enum(['established', 'supported', 'hypothesis', 'illustrative']);

export const nodeStatusSchema = z.enum(['active', 'deprecated']);

export const costBandSchema = z.enum(['low', 'medium', 'high']);

export const scopeTypeSchema = z.enum(['individual', 'team', 'organizational', 'industry', 'ecosystem']);

export const interventionActorSchema = z.enum([
  'employer-policy',
  'recruiter-process',
  'ats-vendor',
  'hiring-manager',
  'candidate-action',
  'industry-standard',
  'policy',
]);

export const entityTypeSchema = z.enum([
  'artifact',
  'barrier',
  'mechanism',
  'pattern',
  'loop',
  'intervention',
  'evidence',
]);

export const diagnosticProbeSchema = z.object({
  id: z.string().regex(ID_PATTERNS.probe),
  action: z.string().min(5),
  expected_signal: z.string().min(5),
  cost: costBandSchema,
  removability_target: removabilityTypeSchema.optional(),
});

export const emissionEdgeSchema = z.object({
  artifact: artifactId,
  fidelity: emissionFidelitySchema.nullable().optional(),
  likelihood: emissionLikelihoodSchema.nullable().optional(),
  evidence: z.array(evidenceId).default([]),
});

/**
 * A specimen is a short, reconstructed excerpt of the kind of document the
 * entity shows up in — a rejection email, an ATS status log, a recruiter chat,
 * an interview transcript. Specimens are composites written to be typical, not
 * copies of any particular message, and the site labels them as such: the
 * registry's whole point is to make uncertainty explicit, so a page must never
 * pass a reconstruction off as a captured record.
 */
export const specimenKindSchema = z.enum(['email', 'chat', 'ats', 'transcript', 'posting', 'note']);

export const specimenLineSchema = z.object({
  /** Speaker or sender, for chats and transcripts. */
  speaker: z.string().optional(),
  /** Timecode, timestamp or relative day — whatever the medium stamps. */
  at: z.string().optional(),
  text: z.string().min(1),
  /** Marks the line the entity is actually about, so the page can point at it. */
  tell: z.boolean().default(false),
});

export const specimenSchema = z.object({
  kind: specimenKindSchema,
  /** What the reader is looking at: "Rejection email", "ATS status history". */
  label: z.string().min(3),
  /** Subject line, ticket title or file name, when the medium has one. */
  subject: z.string().optional(),
  /** Context the excerpt needs to make sense: "day 34 after submission". */
  context: z.string().optional(),
  lines: z.array(specimenLineSchema).min(1),
  /** What to notice — one sentence, printed under the excerpt. */
  reading: z.string().min(10).optional(),
});

export const loopEdgeSchema = z.object({
  from: mechanismId,
  to: mechanismId,
  relation: z.enum(['amplifies', 'masks']),
});

// Fields shared by every graph node.
const nodeBase = {
  title: z.string().min(3),
  status: nodeStatusSchema.default('active'),
  evidence_ids: z.array(evidenceId).default([]),
  content: z.string().optional(),
};

// Artifact frontmatter schema
export const artifactSchema = z.object({
  ...nodeBase,
  id: artifactId,
  type: z.literal('artifact'),
  summary: z.string().min(10),
  stages: z.array(stageIdSchema).min(1),
  fidelity: emissionFidelitySchema.nullable().optional(),
  superseded_by: artifactId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  probes: z.array(diagnosticProbeSchema).default([]),
  specimens: z.array(specimenSchema).default([]),
  non_inferences: z.array(z.string()).min(1),
});

// Barrier frontmatter schema
export const barrierSchema = z.object({
  ...nodeBase,
  id: barrierId,
  type: z.literal('barrier'),
  stage: stageIdSchema,
  order: z.number().int().positive(),
  precedes: z.array(barrierId).default([]),
  description: z.string().min(10),
  pass_condition: z.string().min(5),
  superseded_by: barrierId.optional(),
  evidence_level: evidenceLevelSchema.default('established'),
  specimens: z.array(specimenSchema).default([]),
});

// Mechanism frontmatter schema
export const mechanismFacetsSchema = z.object({
  actor: actorTypeSchema,
  nature: natureTypeSchema,
  visibility: visibilityTypeSchema,
  removability: removabilityTypeSchema,
});

export const mechanismSchema = z.object({
  ...nodeBase,
  id: mechanismId,
  type: z.literal('mechanism'),
  summary: z.string().min(10),
  operates_at: z.array(barrierId).min(1),
  emissions: z.array(emissionEdgeSchema).default([]),
  facets: mechanismFacetsSchema,
  amplifies: z.array(mechanismId).default([]),
  masks: z.array(mechanismId).default([]),
  superseded_by: mechanismId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  honest_baseline: z.boolean().default(false),
  specimens: z.array(specimenSchema).default([]),
  non_inferences: z.array(z.string()).min(1),
});

// Pattern frontmatter schema
export const patternSchema = z.object({
  ...nodeBase,
  id: patternId,
  type: z.literal('pattern'),
  summary: z.string().min(10),
  required_artifacts: z.array(artifactId).min(1),
  compatible_mechanisms: z.array(mechanismId).min(1),
  trigger_rule: z.string().min(10),
  establishes: z.array(z.string()).min(1),
  non_inferences: z.array(z.string()).min(1),
  interventions: z.array(interventionId).default([]),
  superseded_by: patternId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  specimens: z.array(specimenSchema).default([]),
});

// Loop frontmatter schema
export const loopSchema = z.object({
  ...nodeBase,
  id: loopId,
  type: z.literal('loop'),
  summary: z.string().min(10),
  mechanisms: z.array(mechanismId).min(2),
  edges: z.array(loopEdgeSchema).min(2),
  entry_points: z.array(mechanismId).min(1),
  interventions: z.array(interventionId).default([]),
  superseded_by: loopId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  specimens: z.array(specimenSchema).default([]),
});

// Intervention frontmatter schema.
// Targets are Mechanisms, Barriers, Patterns or Loops (spec §5); an intervention
// cannot target another intervention.
export const interventionSchema = z.object({
  ...nodeBase,
  id: interventionId,
  type: z.literal('intervention'),
  summary: z.string().min(10),
  targets: z.array(z.string().regex(/^[MBPL]-\d{3}$/)).min(1),
  actor: interventionActorSchema,
  scope: scopeTypeSchema,
  cost: costBandSchema,
  superseded_by: interventionId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  expected_effects: z.array(z.string()).min(1),
  measurements: z.array(z.string()).min(1),
  specimens: z.array(specimenSchema).default([]),
});

// Evidence record schema
export const evidenceSchema = z.object({
  id: evidenceId,
  type: z.literal('evidence'),
  title: z.string().min(3),
  kind: evidenceKindSchema,
  summary: z.string().min(10),
  citation: z.string().optional(),
  url: z.string().url().optional(),
  period: z.string().optional(),
});

// Registry release manifest (`registry.yaml` at the repository root).
// Keeps the three version axes required by spec §17 in one place.
export const registryManifestSchema = z.object({
  version: z.string().regex(/^\d{4}\.\d{2}\.\d+$/, 'registry version must look like YYYY.MM.N'),
  schema_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'schema_version must be semver'),
  updated_at: z.string().datetime(),
});

export const registryBundleSchema = registryManifestSchema.extend({
  artifacts: z.array(artifactSchema),
  barriers: z.array(barrierSchema),
  mechanisms: z.array(mechanismSchema),
  patterns: z.array(patternSchema),
  loops: z.array(loopSchema),
  interventions: z.array(interventionSchema),
  evidence: z.array(evidenceSchema),
});
