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
  era: /^E-\d{3}$/,
} as const;

const artifactId = z.string().regex(ID_PATTERNS.artifact);
const barrierId = z.string().regex(ID_PATTERNS.barrier);
const mechanismId = z.string().regex(ID_PATTERNS.mechanism);
const patternId = z.string().regex(ID_PATTERNS.pattern);
const loopId = z.string().regex(ID_PATTERNS.loop);
const interventionId = z.string().regex(ID_PATTERNS.intervention);
const evidenceId = z.string().regex(ID_PATTERNS.evidence);
const workflowId = z.string().regex(/^WF-\d{3}$/, 'workflow id must look like WF-001');
const eraId = z.string().regex(ID_PATTERNS.era, 'era id must look like E-001');

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

/**
 * Actors are the parties whose decisions the funnel is made of. They were
 * implicit until now — `mechanism.facets.actor` and `intervention.actor` are
 * two separate vocabularies that both gesture at the same six parties. Rather
 * than rewriting thirty content files to unify them, an actor declares the
 * enum values that resolve to it, so the graph can join them and both existing
 * vocabularies keep working.
 */
export const actorId = z.enum(['candidate', 'recruiter', 'hiring-manager', 'ats-vendor', 'employer-policy', 'public-policy']);

export const actorSchema = z.object({
  ...nodeBase,
  id: actorId,
  type: z.literal('actor'),
  summary: z.string().min(10),
  /** Decisions this actor actually makes. */
  controls: z.array(z.string()).min(1),
  /** What is structurally invisible from where this actor sits. */
  blind_to: z.array(z.string()).min(1),
  /** What this actor is optimising for, stated without moralising. */
  incentives: z.array(z.string()).min(1),
  /** Enum values in other collections that resolve to this actor. */
  aliases: z
    .object({
      facet: z.array(actorTypeSchema).default([]),
      intervention: z.array(interventionActorSchema).default([]),
    })
    .default({ facet: [], intervention: [] }),
  specimens: z.array(specimenSchema).default([]),
});

/**
 * A workflow is a state machine over one subject — a requisition, an
 * application — with the actor who owns each state and each transition named.
 * The registry already holds the gates and the causes; this holds the shape
 * they occur in, so the site can step through it rather than list it.
 *
 * Guards are prose on purpose. A transition fires when a person or a rule
 * decides it does; formalising that would be exactly the false precision the
 * methodology forbids.
 */
export const workflowStateKindSchema = z.enum(['initial', 'active', 'terminal']);

export const workflowStateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'state ids are lowercase slugs'),
  title: z.string().min(3),
  kind: workflowStateKindSchema.default('active'),
  /** The actor whose decision this state is waiting on. */
  owner: actorId,
  description: z.string().min(10),
  /** Registry entities that live at this state — barriers, mechanisms, signals. */
  entities: z.array(z.string()).default([]),
  /** What the candidate can actually observe while the subject sits here. */
  visible_to_candidate: z.string().optional(),
  /**
   * Registry entities that are the ways this state goes wrong. On the ideal
   * path this is the load-bearing field: a barrier is not simply a gate, it is
   * the point at which a documented ideal stops being followed.
   */
  deviations: z.array(z.string()).default([]),
});

export const workflowTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().min(3),
  owner: actorId,
  guard: z.string().min(5),
  entities: z.array(z.string()).default([]),
});

export const workflowSchema = z.object({
  ...nodeBase,
  id: workflowId,
  type: z.literal('workflow'),
  summary: z.string().min(10),
  /** What moves through this machine. */
  subject: z.string().min(3),
  states: z.array(workflowStateSchema).min(2),
  transitions: z.array(workflowTransitionSchema).min(1),
  specimens: z.array(specimenSchema).default([]),
});

/**
 * One sourced figure inside an era.
 *
 * An era is an argument about money, and an argument about money that carries
 * no numbers is an opinion. Every indicator names the figure, the period it
 * covers and the evidence record it came from, so a reader can check it without
 * leaving the page and a claim with no source cannot be written at all.
 */
export const eraIndicatorSchema = z.object({
  label: z.string().min(3),
  /** The number as its source states it, unit included: "5.25–5.50%", "$345.7B". */
  figure: z.string().min(1),
  /** The period the figure covers: "2021", "2022–2024". */
  period: z.string().min(4),
  evidence: evidenceId,
});

/**
 * A period of the hiring economy, told as where the money came from.
 *
 * The registry documents the funnel as it is now. Eras are the other axis: the
 * same funnel had different physics when capital was free, and the way into a
 * company that worked under one set of physics stops working under the next.
 * That transition — not the mood of any particular year — is what these records
 * exist to state.
 */
export const eraSchema = z.object({
  ...nodeBase,
  id: eraId,
  type: z.literal('era'),
  summary: z.string().min(10),
  from: z.number().int().min(1900).max(2100),
  /** The last year of the era; an era still running ends at the current year. */
  to: z.number().int().min(1900).max(2100),
  /** Where the money came from, with the mechanism named. */
  capital: z.string().min(20),
  /** What that money did to how companies hired. */
  hiring: z.string().min(20),
  /** How a person actually got into a company under these conditions. */
  entry: z.string().min(20),
  /** What closed the era. Empty for an era that has not ended. */
  ended_by: z.string().default(''),
  indicators: z.array(eraIndicatorSchema).default([]),
  /** Registry entities this era made prevalent. */
  entities: z.array(z.string()).default([]),
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
  actors: z.array(actorSchema),
  workflows: z.array(workflowSchema),
  eras: z.array(eraSchema),
  artifacts: z.array(artifactSchema),
  barriers: z.array(barrierSchema),
  mechanisms: z.array(mechanismSchema),
  patterns: z.array(patternSchema),
  loops: z.array(loopSchema),
  interventions: z.array(interventionSchema),
  evidence: z.array(evidenceSchema),
});
