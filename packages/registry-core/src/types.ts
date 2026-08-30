/**
 * hoba (Hiring Obstacles & Barriers Atlas) Core Types
 *
 * Node types are derived from the Zod schemas in ./schemas.ts so that the
 * TypeScript surface can never drift from what the loader actually validates.
 * This module is type-only: it is erased at runtime and safe to ship to the
 * browser without pulling in zod.
 */
import type { z } from 'zod';
import type {
  actorId,
  actorSchema,
  actorTypeSchema,
  observationSchema,
  barrierSchema,
  costBandSchema,
  diagnosticProbeSchema,
  emissionEdgeSchema,
  emissionFidelitySchema,
  emissionLikelihoodSchema,
  entityTypeSchema,
  eraIndicatorSchema,
  eraSchema,
  evidenceKindSchema,
  evidenceLevelSchema,
  evidenceSchema,
  interventionActorSchema,
  interventionSchema,
  loopEdgeSchema,
  loopSchema,
  mechanismFacetsSchema,
  mechanismSchema,
  natureTypeSchema,
  nodeStatusSchema,
  patternSchema,
  probeOutcomeSchema,
  perspectiveSchema,
  recommendationSchema,
  processSchema,
  processStateSchema,
  processTransitionSchema,
  workflowStateKindSchema,
  specimenSchema,
  specimenKindSchema,
  specimenLineSchema,
  registryBundleSchema,
  registryManifestSchema,
  authoredRecordSchema,
  recordClassEnumSchema,
  recordFlowSchema,
  removabilityTypeSchema,
  scopeTypeSchema,
  stageIdSchema,
  visibilityTypeSchema,
} from './schemas.js';

export type EntityType = z.infer<typeof entityTypeSchema>;
export type StageId = z.infer<typeof stageIdSchema>;
export type ActorType = z.infer<typeof actorTypeSchema>;
export type ActorId = z.infer<typeof actorId>;
export type NatureType = z.infer<typeof natureTypeSchema>;
export type VisibilityType = z.infer<typeof visibilityTypeSchema>;
export type RemovabilityType = z.infer<typeof removabilityTypeSchema>;
export type EmissionFidelity = z.infer<typeof emissionFidelitySchema>;
export type EmissionLikelihood = z.infer<typeof emissionLikelihoodSchema>;
export type EvidenceKind = z.infer<typeof evidenceKindSchema>;
export type EvidenceLevel = z.infer<typeof evidenceLevelSchema>;
export type NodeStatus = z.infer<typeof nodeStatusSchema>;
export type InterventionActor = z.infer<typeof interventionActorSchema>;
export type CostBand = z.infer<typeof costBandSchema>;
export type ScopeType = z.infer<typeof scopeTypeSchema>;

export type DiagnosticProbe = z.infer<typeof diagnosticProbeSchema>;
export type ProbeOutcome = z.infer<typeof probeOutcomeSchema>;
export type SpecimenKind = z.infer<typeof specimenKindSchema>;
export type SpecimenLine = z.infer<typeof specimenLineSchema>;
export type Specimen = z.infer<typeof specimenSchema>;
export type EmissionEdge = z.infer<typeof emissionEdgeSchema>;
export type LoopEdge = z.infer<typeof loopEdgeSchema>;
export type MechanismFacets = z.infer<typeof mechanismFacetsSchema>;

export type Perspective = z.infer<typeof perspectiveSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type ActorNode = z.infer<typeof actorSchema>;
export type ProcessState = z.infer<typeof processStateSchema>;
export type ProcessTransition = z.infer<typeof processTransitionSchema>;
export type WorkflowStateKind = z.infer<typeof workflowStateKindSchema>;
export type ProcessNode = z.infer<typeof processSchema>;
export type EraIndicator = z.infer<typeof eraIndicatorSchema>;
export type EraNode = z.infer<typeof eraSchema>;
export type ObservationNode = z.infer<typeof observationSchema>;
export type BarrierNode = z.infer<typeof barrierSchema>;
export type MechanismNode = z.infer<typeof mechanismSchema>;
export type PatternNode = z.infer<typeof patternSchema>;
export type LoopNode = z.infer<typeof loopSchema>;
export type InterventionNode = z.infer<typeof interventionSchema>;
export type EvidenceRecord = z.infer<typeof evidenceSchema>;
export type AuthoredRecordNode = z.infer<typeof authoredRecordSchema>;
export type RecordFlow = z.infer<typeof recordFlowSchema>;
export type RecordClassType = z.infer<typeof recordClassEnumSchema>;

/** Graph nodes that participate in the hoba ontology (evidence is a leaf record, not a graph node). */
export type RegistryNode =
  | ObservationNode
  | BarrierNode
  | MechanismNode
  | PatternNode
  | LoopNode
  | InterventionNode
  | AuthoredRecordNode;

/** Anything addressable by canonical ID, including evidence records. */
export type AnyRecord = RegistryNode | EvidenceRecord;

export type RegistryManifest = z.infer<typeof registryManifestSchema>;
export type RegistryBundle = z.infer<typeof registryBundleSchema>;

/** Content language mirrors supported by the repository layout. */
export type ContentLang = 'en' | 'uk';

export type GraphRelation =
  | 'operates_at'
  | 'emits'
  | 'amplifies'
  | 'masks'
  | 'precedes'
  | 'instantiates'
  | 'targets'
  | 'mitigates';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphRelation;
  fidelity?: EmissionFidelity | null;
  likelihood?: EmissionLikelihood | null;
}

// Diagnostic Engine Types (hoba Analysis)
export interface DiagnosticInput {
  artifacts: string[]; // Artifact IDs
  /**
   * Probes already run, and what they came back with.
   *
   * This is what turns the protocol from a single union into a narrowing:
   * every result can only remove mechanisms from the compatible set, never add
   * one, and only where the outcome is logically incompatible with them.
   */
  probe_results?: ProbeResult[];
  stage?: StageId;
  role_family?: string;
  seniority_band?: string;
  notes?: string;
}

export type AgencyZone = 'endogenous' | 'exogenous' | 'mixed' | 'undetermined';

export interface CompatibleMechanism {
  mechanism: MechanismNode;
  evidence_level: EvidenceLevel;
  honest_baseline: boolean;
  /** True when the mechanism directly emits one of the selected artifacts (vs. only operating at an identified barrier). */
  emitted_by_evidence: boolean;
  /**
   * True when the mechanism emits *every* selected observation, not merely one.
   *
   * The compatible set is a union and stays one: two traces can come from two
   * mechanisms, and intersecting would assert a single hidden cause. This flag
   * is the narrower reading offered alongside it — the mechanisms that would
   * account for the whole picture on their own. It is what makes a second,
   * different observation tell a catch-all apart.
   */
  accounts_for_all: boolean;
  removability: RemovabilityType;
  amplified_by: string[];
  masks: string[];
}

export interface DiagnosticResult {
  input: DiagnosticInput;
  mode: 'topological_uncalibrated' | 'calibrated';
  verdict: 'diagnostic' | 'low_signal_ambiguity';
  summary: string;
  hard_facts: {
    selected_artifacts: ObservationNode[];
    /** IDs from the input that do not exist in the registry. */
    unknown_artifact_ids: string[];
    stage?: StageId;
    notes?: string;
  };
  obstacle: {
    identified_barriers: BarrierNode[];
    primary_stage?: StageId;
  };
  behind: {
    compatible_mechanisms: CompatibleMechanism[];
    related_patterns: PatternNode[];
    related_loops: LoopNode[];
    non_inferences: string[];
    /** The set as it was before any probe result was applied. */
    compatible_before_probes: string[];
    /** Each probe result, what it removed, and what was left. */
    narrowing: Narrowing;
    /** What the available probes could still settle, and what none of them can. */
    separation: SeparationReport;
  };
  agency: {
    candidate_removable: MechanismNode[];
    intermediary_dependent: MechanismNode[];
    exogenous_no_agency: MechanismNode[];
    diagnostic_probes: DiagnosticProbe[];
    probes_summary: string;
    agency_zone: AgencyZone;
  };
  counts: {
    compatible_mechanisms: number;
    /** How many of them account for every selected observation. */
    accounts_for_all: number;
    candidate_removable: number;
    intermediary: number;
    no_agency: number;
    patterns: number;
    loops: number;
    probes: number;
  };
  epistemic_disclaimer: string;
}

export interface EmpiricalScenario {
  id: string;
  title: string;
  summary: string;
  stage?: StageId;
  artifacts: string[];
}


// ---------------------------------------------------------------------------
// Result shapes
//
// These describe what the separation, conformance and gap analyses return.
// They live here rather than beside the functions that build them because
// this module is the shared vocabulary every package may depend on, and a
// result type declared in a leaf makes the vocabulary depend on the leaf —
// which is a cycle the moment the packages are separate.
// ---------------------------------------------------------------------------

export interface Narrowing {
  remaining: string[];
  steps: NarrowingStep[];
  /** Results naming a probe or an outcome that does not exist. */
  unknown: ProbeResult[];
}

export interface ProbeResult {
  probe: string;
  outcome: string;
}

export interface SeparationReport {
  /** Every pair no available probe can tell apart. */
  indistinguishable_pairs: [string, string][];
  /**
   * Those pairs collected by transitive closure.
   *
   * Membership of a group does not mean every pair inside it is
   * indistinguishable, only that each member is tied to another by a pair
   * nothing separates. It is a summary of where the evidence runs out, not a
   * partition.
   */
  indistinguishable_groups: string[][];
  /** The smallest probe set that separates everything separable. */
  minimal_probes: string[];
  /** How many pairs any probe can settle at all. */
  separable_pairs: number;
  /** False when the probe set was too large to search exactly and a greedy cover was used. */
  exact: boolean;
}

export interface CandidateProfile {
  /** Years of relevant experience the dated history supports. */
  years?: number;
  /** Phrases the person can evidence, lowercased by the caller or by `check`. */
  skills?: string[];
  /** Where the person can lawfully work, as the reader names those places. */
  authorised_for?: string[];
  /** Where the person is, in the same vocabulary as `hiring_locations`. */
  located_in?: string;
  /** What they have said they expect, in the same unit as the band. */
  expectation?: number;
}

export interface ConformanceReport {
  gates: GateOutcome[];
  /** The first gate that fails, if any: where a run would deterministically stop. */
  stops_at?: GateOutcome;
  /** Requirements nobody could meet, which is a fact about the posting. */
  unsatisfiable: GateOutcome[];
  /** How many gates the check simply cannot decide. */
  undetermined: number;
}

export interface GateOutcome {
  /** The barrier this is about. */
  gate: string;
  stage: StageId;
  /** The state of the canonical path where it is decided. */
  state: string;
  verdict: GateVerdict;
  reason: GateReason;
  /** Registry mechanisms that operate here, for the reader to go and read. */
  mechanisms: string[];
}

export interface PostingFacets {
  /** Years the posting states as a minimum. */
  required_years?: number;
  /** Phrases the posting states as mandatory. */
  required_skills?: string[];
  /** Where authorisation is required, if the posting says so. */
  requires_authorisation_in?: string;
  /** The places the posting says it hires in. */
  hiring_locations?: string[];
  band_min?: number;
  band_max?: number;
  /**
   * How long the required thing has existed, in years, where the reader knows.
   *
   * The one check here that can return a verdict about the posting rather than
   * about the person: a requirement for more years than the thing has existed
   * cannot be met by anybody.
   */
  technology_age?: number;
}

export interface GapReport {
  indistinguishable: Indistinguishable[];
  /** Mechanism pairs no observation separates, as a share of all pairs. */
  discrimination: { indistinguishablePairs: number; totalPairs: number };
  unaddressedMechanisms: Unaddressed[];
  /** Gates each actor can reach through some intervention, by actor. */
  levers: { actor: string; gates: string[] }[];
  /** Gates no intervention reaches, directly or through a mechanism. */
  gatesWithoutLever: string[];
  /** Observations that co-occur in no single mechanism's emissions. */
  unexplainedPairs: [string, string][];
  identifiability: Identifiability;
  /** Emissions with no recorded stage, and why one could not be entailed. */
  unplacedEmissions: UnplacedEmission[];
}

export interface Identifiability {
  /** Observations consistent with exactly one mechanism on their own. */
  identifying: { artifact: string; mechanism: string }[];
  neverAlone: NeverAlone[];
}

/**
 * A set of mechanisms that emit exactly the same observations.
 *
 * No evidence expressible in this registry distinguishes them, so a protocol
 * run that narrows to one member has in fact narrowed to all of them. This is
 * a limit of the observation vocabulary, not a defect in the mechanisms.
 */
export interface Indistinguishable {
  /** The shared emission signature, sorted. */
  signature: string[];
  mechanisms: string[];
}

/** A mechanism nobody has proposed a change for, and whether anyone could. */
export interface Unaddressed {
  id: string;
  removability: RemovabilityType;
  /**
   * True when removability is `none`: no named actor holds a lever, so the
   * absence of an intervention is a finding rather than an omission.
   */
  outOfReach: boolean;
}

/** An emission whose trace the atlas cannot place at a stage. */
export interface UnplacedEmission {
  mechanism: string;
  artifact: string;
  /**
   * `ambiguous` where the mechanism's stages and the observation's overlap in
   * more than one place; `conflicting` where they do not overlap at all, which
   * is the sharper case: it proves the trace is seen somewhere the mechanism
   * does not operate, so no intersection could ever have stood in for this.
   */
  reason: 'ambiguous' | 'conflicting';
}

export interface NarrowingStep {
  probe: string;
  outcome: string;
  label: string;
  /** Why the elimination is forced, copied from the outcome. */
  because: string;
  /** Compatible mechanisms this outcome removed. Often none. */
  eliminated: string[];
  remaining: number;
}

export type GateVerdict = 'passes' | 'fails' | 'undetermined' | 'unsatisfiable';

export interface GateReason {
  /** A message key the caller localises; this package holds no prose. */
  code: string;
  params: Record<string, string | number>;
}

/**
 * A mechanism that no set of its own emissions can pin down.
 *
 * Exact ties are the visible case, but the general one is subsumption: if
 * everything a mechanism emits is also emitted by another, then every subset of
 * its trace is consistent with that other too, and no evidence expressible here
 * ever narrows to it alone. Equality is just subsumption in both directions.
 */
export interface NeverAlone {
  mechanism: string;
  /** Mechanisms emitting everything this one does, and so never ruled out. */
  coveredBy: string[];
}

/**
 * The collection on a bundle that holds each entity type. Walking the registry
 * used to mean writing the kinds out — `countGraphNodes` listed six, the
 * validator's `allNodes` listed the same six plus records, and neither would
 * learn about a seventh. One map, so adding a kind to `entityTypeSchema`
 * either lands here or fails to compile.
 */
export const COLLECTION_FOR = {
  observation: 'observations',
  barrier: 'barriers',
  mechanism: 'mechanisms',
  pattern: 'patterns',
  loop: 'loops',
  intervention: 'interventions',
  record: 'records',
  process: 'processes',
  actor: 'actors',
  era: 'eras',
  evidence: 'evidence',
} as const satisfies Record<EntityType, keyof RegistryBundle>;

/** Every entry of the named types, in the order the types were given. */
export function nodesOfTypes<T extends EntityType>(
  bundle: RegistryBundle,
  types: readonly T[]
): Array<RegistryBundle[(typeof COLLECTION_FOR)[T]][number]> {
  return types.flatMap((t) => (bundle[COLLECTION_FOR[t]] ?? []) as never);
}
