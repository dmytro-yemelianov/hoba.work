import { z } from 'zod';

// ---------------------------------------------------------------------------
// Canonical ID patterns (single source of truth for every ID regex)
// ---------------------------------------------------------------------------
export const ID_PATTERNS = {
  artifact: /^(A-\d{3}|obs\.[a-z0-9_]+)$/,
  barrier: /^(B-\d{3}|bar\.[a-z0-9_]+)$/,
  mechanism: /^(M-\d{3}|mech\.[a-z0-9_]+)$/,
  pattern: /^(P-\d{3}|pat\.[a-z0-9_]+)$/,
  loop: /^(L-\d{3}|loop\.[a-z0-9_]+)$/,
  intervention: /^(I-\d{3}|int\.[a-z0-9_]+)$/,
  evidence: /^(EVD-\d{3}|evidence\.[a-z0-9_]+)$/,
  record: /^(R-\d{3}|record\.[a-z0-9_]+)$/,
  probe: /^PROBE-[A-Z0-9-]+$/,
  era: /^(E-\d{3}|era\.[a-z0-9_]+)$/,
} as const;

const artifactId = z.string().regex(ID_PATTERNS.artifact);
const barrierId = z.string().regex(ID_PATTERNS.barrier);
const mechanismId = z.string().regex(ID_PATTERNS.mechanism);
const patternId = z.string().regex(ID_PATTERNS.pattern);
const loopId = z.string().regex(ID_PATTERNS.loop);
const interventionId = z.string().regex(ID_PATTERNS.intervention);
const evidenceId = z.string().regex(ID_PATTERNS.evidence);
const recordId = z.string().regex(ID_PATTERNS.record);
const workflowId = z
  .string()
  .regex(
    /^(WF-\d{3}|proc\.[a-z0-9_]+)$/,
    'workflow id must look like proc.<name> or the legacy WF-001'
  );
const eraId = z
  .string()
  .regex(ID_PATTERNS.era, 'era id must look like era.<name> or the legacy E-001');

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
  'client',
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

export const emissionFidelitySchema = z.enum([
  'direct',
  'euphemism',
  'distortion',
  'noise',
  'void',
]);

export const emissionLikelihoodSchema = z.enum(['low', 'medium', 'high']);

export const evidenceKindSchema = z.enum([
  'primary',
  'research',
  'reporting',
  'survey',
  'anecdote',
  'illustrative',
]);

/**
 * How strongly a claim is being made, from the external spec via design doc §6.
 *
 * Ordered weakest to strongest, with two states that are not points on that
 * line: `contradicted` (the evidence runs against the claim) and `unknown`
 * (no claim about the world is being made — a description, not an assertion).
 *
 * `proven` is the only tier the validator gates: it requires a linked evidence
 * record of kind `primary` or `research`. See the `unsupported-claim` rule.
 */
export const evidenceLevelSchema = z.enum([
  'observed',
  'compatible',
  'supported',
  'strongly_supported',
  'proven',
  'contradicted',
  'unknown',
]);

/** The evidence kinds strong enough to carry a `proven` claim (design doc §6). */
export const PROVING_EVIDENCE_KINDS = ['primary', 'research'] as const;

/**
 * The six kinds a reader meets: the ones with a page, a card, specimens and
 * per-actor perspectives. The other five — evidence, record, process, actor,
 * era — are real entities that the atlas is *made of* rather than ones it puts
 * in front of you as findings.
 *
 * Named once because it was written out by hand in eleven places: the registry
 * page twice, the graph page twice, `EntityBadge`, `graph-view`, `search`, the
 * MCP tool schema, and the tests. Every one of them had to be edited when the
 * `artifact` kind became `observation`, and nothing would have caught the one
 * that was missed.
 */
export const READER_FACING_TYPES = [
  'observation',
  'barrier',
  'mechanism',
  'pattern',
  'loop',
  'intervention',
] as const;
export type ReaderFacingType = (typeof READER_FACING_TYPES)[number];

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

/**
 * The one canonical type enum, covering all eleven ontology kinds (DoD 1).
 *
 * `scenario` is deliberately absent and must stay absent: a scenario is a
 * composition *over* the ontology, not a member of it, which is what makes the
 * reference one-directional by construction rather than by lint.
 */
export const entityTypeSchema = z.enum([
  'observation',
  'barrier',
  'mechanism',
  'pattern',
  'loop',
  'intervention',
  'evidence',
  'record',
  'process',
  'actor',
  'era',
]);

/**
 * One thing a probe can come back with, and what that rules out.
 *
 * Strict: `excludes` may name a mechanism only when the outcome is logically
 * incompatible with that mechanism's definition — not when it makes it feel
 * unlikely. `because` has to state the incompatibility, which is what makes the
 * claim reviewable. Most outcomes exclude nothing, and that is the honest
 * result: it is what turns the minimal-probe answer into a statement about the
 * limits of what a candidate can determine rather than a promise of certainty.
 */
export const probeOutcomeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'outcome ids are lowercase slugs'),
    /** What the candidate actually observes when this is the answer. */
    label: z.string().min(5),
    /** Mechanisms this outcome is logically incompatible with. Often empty. */
    excludes: z.array(mechanismId).default([]),
    /** Why each exclusion is forced, not merely likely. Required if anything is excluded. */
    because: z.string().default(''),
  })
  .refine((o) => o.excludes.length === 0 || o.because.trim().length >= 20, {
    message: 'an outcome that excludes a mechanism must say why the exclusion is forced',
    path: ['because'],
  });

export const diagnosticProbeSchema = z.object({
  id: z.string().regex(ID_PATTERNS.probe),
  action: z.string().min(5),
  expected_signal: z.string().min(5),
  cost: costBandSchema,
  removability_target: removabilityTypeSchema.optional(),
  /** What this probe can come back with. Two or more, or it separates nothing. */
  outcomes: z.array(probeOutcomeSchema).default([]),
});

export const emissionEdgeSchema = z.object({
  artifact: artifactId,
  fidelity: emissionFidelitySchema.nullable().optional(),
  likelihood: emissionLikelihoodSchema.nullable().optional(),
  evidence: z.array(evidenceId).default([]),
  /**
   * The stages at which this mechanism's trace is *seen*, which is not the same
   * as where the mechanism operates: a rule that fires at intake produces a
   * message the candidate reads much later. Authored and correctable from
   * cases; left empty where the atlas cannot say. It never rules a mechanism
   * out — it only sharpens which mechanisms directly account for what was
   * observed.
   */
  observed_at: z.array(stageIdSchema).default([]),
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
export const actorId = z.enum([
  'actor.candidate',
  'actor.recruiter',
  'actor.hiring_manager',
  'actor.ats_vendor',
  'actor.employer_policy',
  'actor.public_policy_and_industry_standards',
  'actor.client',
]);

/**
 * One actor's view of one entry.
 *
 * The atlas describes the funnel from outside. A perspective describes the same
 * thing from inside one of the heads that make it: what reaches them, what
 * it means from where they sit, and what they do next given what they are
 * measured on. No intent is attributed — an actor who cannot see something is
 * not concealing it.
 */
export const perspectiveSchema = z.object({
  actor: actorId,
  /** What actually reaches this actor when this happens. */
  sees: z.string().min(20),
  /** What it means from there — the reading, not the truth. */
  reads: z.string().min(20),
  /** What happens next, given what this actor controls and is measured on. */
  does: z.string().min(20),
});

const nodeBase = {
  title: z.string().min(3),
  status: nodeStatusSchema.default('active'),
  evidence_ids: z.array(evidenceId).default([]),
  content: z.string().optional(),
  /** Prior IDs this entity was known by, so a rename doesn't erase the old code. */
  aliases: z.array(z.string()).default([]),
};

// Observation frontmatter schema
export const observationSchema = z.object({
  ...nodeBase,
  id: artifactId,
  type: z.literal('observation'),
  summary: z.string().min(10),
  stages: z.array(stageIdSchema).min(1),
  fidelity: emissionFidelitySchema.nullable().optional(),
  superseded_by: artifactId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  probes: z.array(diagnosticProbeSchema).default([]),
  specimens: z.array(specimenSchema).default([]),
  /** The same entry seen from inside each actor that meets it. */
  perspectives: z.array(perspectiveSchema).default([]),
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
  evidence_level: evidenceLevelSchema.default('strongly_supported'),
  specimens: z.array(specimenSchema).default([]),
  /** The same entry seen from inside each actor that meets it. */
  perspectives: z.array(perspectiveSchema).default([]),
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
  /** The same entry seen from inside each actor that meets it. */
  perspectives: z.array(perspectiveSchema).default([]),
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
  /** The same entry seen from inside each actor that meets it. */
  perspectives: z.array(perspectiveSchema).default([]),
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
  /** The same entry seen from inside each actor that meets it. */
  perspectives: z.array(perspectiveSchema).default([]),
});

// Intervention frontmatter schema.
// Targets are Mechanisms, Barriers, Patterns or Loops (spec §5); an intervention
// cannot target another intervention.
export const interventionSchema = z.object({
  ...nodeBase,
  id: interventionId,
  type: z.literal('intervention'),
  summary: z.string().min(10),
  targets: z.array(z.string().regex(/^([MBPL]-\d{3}|(mech|bar|pat|loop)\.[a-z0-9_]+)$/)).min(1),
  actor: interventionActorSchema,
  scope: scopeTypeSchema,
  cost: costBandSchema,
  superseded_by: interventionId.optional(),
  evidence_level: evidenceLevelSchema.default('supported'),
  expected_effects: z.array(z.string()).min(1),
  measurements: z.array(z.string()).min(1),
  specimens: z.array(specimenSchema).default([]),
  /** The same entry seen from inside each actor that meets it. */
  perspectives: z.array(perspectiveSchema).default([]),
});

/**
 * Actors are the parties whose decisions the funnel is made of. They were
 * implicit until now — `mechanism.facets.actor` and `intervention.actor` are
 * two separate vocabularies that both gesture at the same six parties. Rather
 * than rewriting thirty content files to unify them, an actor declares the
 * enum values that resolve to it, so the graph can join them and both existing
 * vocabularies keep working.
 */

/**
 * Something one actor could do, addressed to the one who can actually do it.
 *
 * A recommendation that names no actor is a wish. Each of these is attached to
 * the party that controls the decision, cites the entries it addresses, and
 * states its cost honestly — including when the honest cost is "this makes the
 * process slower".
 */
export const recommendationSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'recommendation ids are lowercase slugs'),
  title: z.string().min(5),
  /** Why this actor in particular, tied to what they control. */
  rationale: z.string().min(20),
  /** What it costs the actor who does it, stated without softening. */
  cost: costBandSchema,
  costs: z.string().min(10),
  /** Registry entries this addresses. */
  targets: z.array(z.string()).default([]),
  /** Interventions that already describe this change, where one exists. */
  interventions: z.array(interventionId).default([]),
});

export const actorSchema = z.object({
  ...nodeBase,
  id: actorId,
  type: z.literal('actor'),
  /**
   * The public route segment: `/actors/<slug>`.
   *
   * Actors are the one type whose id and URL diverge. Their ids were already
   * unique readable slugs before the migration, so moving the URL to
   * `/actors/actor.recruiter` would have been a regression for no gain; the
   * slug is the pre-migration id, and it is what every `/actors/...` link is
   * built from. Everywhere else in the registry an actor is its canonical id.
   */
  slug: z.string().regex(/^[a-z0-9-]+$/, 'actor slug must be lowercase, digits and hyphens'),
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
  /** What this actor should do, addressed to the party that can do it. */
  recommendations: z.array(recommendationSchema).default([]),
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

export const processStateSchema = z.object({
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
  /** Maximum expected dwell time in this state under nominal operation (days). */
  max_dwell_days: z.number().positive().optional(),
});

export const processTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().min(3),
  owner: actorId,
  guard: z.string().min(5),
  entities: z.array(z.string()).default([]),
  /** Nominal expected turnaround time for this transition (days). */
  latency_expected_days: z.number().positive().optional(),
  /** Maximum threshold beyond which latency indicates queue stalling or ghosting (days). */
  latency_max_days: z.number().positive().optional(),
});

export const processSchema = z.object({
  ...nodeBase,
  id: workflowId,
  type: z.literal('process'),
  summary: z.string().min(10),
  /** What moves through this machine. */
  subject: z.string().min(3),
  states: z.array(processStateSchema).min(2),
  transitions: z.array(processTransitionSchema).min(1),
  /**
   * Defaults to `unknown` rather than `supported`: a state machine that says
   * nothing about its own standing is describing a process, not asserting that
   * the world works this way. The canonical path is exactly that case.
   */
  evidence_level: evidenceLevelSchema.default('unknown'),
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
  aliases: z.array(z.string()).default([]),
});

export const recordClassEnumSchema = z.enum([
  'budget-line',
  'contract',
  'bid',
  'requisition-funding',
  'payroll',
  'placement-fee',
  'subscription',
  'runway',
]);

export const recordFlowSchema = z.object({
  to: z.string().regex(ID_PATTERNS.record),
  label: z.string().min(1),
  /** Parametric split percentage (0..100). */
  percentage: z.number().min(0).max(100).optional(),
  /** Parametric flow fraction (0..1.0). */
  fraction: z.number().min(0).max(1).optional(),
  /** The economic nature of the flow split. */
  split_type: z.enum(['margin', 'payroll', 'settlement', 'burn', 'allocation', 'fee']).optional(),
  amount: z
    .object({
      value: z.number(),
      unit: z.string().min(1),
      evidence: z.array(z.string().regex(ID_PATTERNS.evidence)).min(1),
    })
    .optional(),
});

export const authoredRecordSchema = z
  .object({
    ...nodeBase,
    id: recordId,
    type: z.literal('record'),
    record_class: recordClassEnumSchema,
    owner: z.enum(['inside', 'outside-party', 'ownerless']),
    owner_actor: actorId.optional(),
    summary: z.string().min(10),
    flows: z.array(recordFlowSchema).default([]),
    visibility_default: visibilityTypeSchema.default('opaque'),
    evidence_ids: z.array(z.string().regex(ID_PATTERNS.evidence)).default([]),
    evidence_level: evidenceLevelSchema.default('supported'),
    superseded_by: recordId.optional(),
  })
  .superRefine((r, ctx) => {
    if (r.owner !== 'ownerless' && !r.owner_actor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'an owned record must specify owner_actor',
      });
    }
    if (r.owner === 'ownerless' && r.owner_actor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'an ownerless record cannot have owner_actor',
      });
    }
  });

// Registry release manifest (`registry.yaml` at the repository root).
// Keeps the three version axes required by spec §17 in one place.
export const registryManifestSchema = z.object({
  /** Strict semver: no leading zeros, so the retired `2026.08.3` form cannot come back. */
  version: z
    .string()
    .regex(
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
      'registry version must be semver (e.g. 1.0.0)'
    ),
  schema_version: z.string().regex(/^\d+\.\d+\.\d+$/, 'schema_version must be semver'),
  updated_at: z.string().datetime(),
});

export const registryBundleSchema = registryManifestSchema.extend({
  actors: z.array(actorSchema),
  processes: z.array(processSchema),
  eras: z.array(eraSchema),
  observations: z.array(observationSchema),
  barriers: z.array(barrierSchema),
  mechanisms: z.array(mechanismSchema),
  patterns: z.array(patternSchema),
  loops: z.array(loopSchema),
  interventions: z.array(interventionSchema),
  evidence: z.array(evidenceSchema),
  records: z.array(authoredRecordSchema).default([]),
});
