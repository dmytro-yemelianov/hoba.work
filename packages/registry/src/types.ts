/**
 * hoba (Hiring Obstacles & Barriers Atlas) Core Types
 *
 * Node types are derived from the Zod schemas in ./schemas.ts so that the
 * TypeScript surface can never drift from what the loader actually validates.
 * This module is type-only: it is erased at runtime and safe to ship to the
 * browser without pulling in zod.
 */
import type { z } from 'zod';
import type { Narrowing, ProbeResult, SeparationReport } from './separation.js';
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
  workflowSchema,
  workflowStateSchema,
  workflowTransitionSchema,
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
export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type WorkflowTransition = z.infer<typeof workflowTransitionSchema>;
export type WorkflowStateKind = z.infer<typeof workflowStateKindSchema>;
export type WorkflowNode = z.infer<typeof workflowSchema>;
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
