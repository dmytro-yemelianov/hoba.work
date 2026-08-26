/**
 * HOBA (Hiring Obstacles & Barriers Atlas) Core Types
 * Specification Version: 0.4.1
 */

export type EntityType = 'artifact' | 'barrier' | 'mechanism' | 'pattern' | 'loop' | 'intervention' | 'evidence';

export type StageId =
  | 'pre-posting'
  | 'sourcing'
  | 'ingestion'
  | 'screening'
  | 'recruiter'
  | 'technical'
  | 'team'
  | 'compensation'
  | 'offer'
  | 'post-offer';

export type ActorType = 'system' | 'recruiter' | 'hiring-manager' | 'policy' | 'external' | 'candidate';
export type NatureType = 'rule' | 'incentive' | 'bias' | 'noise' | 'void';
export type VisibilityType = 'observable' | 'inferable' | 'opaque';
export type RemovabilityType = 'candidate' | 'intermediary' | 'none';

export type EmissionFidelity = 'direct' | 'euphemism' | 'distortion' | 'noise' | 'void';
export type EmissionLikelihood = 'low' | 'medium' | 'high';

export type EvidenceKind = 'primary' | 'research' | 'reporting' | 'survey' | 'anecdote' | 'illustrative';
export type EvidenceLevel = 'established' | 'supported' | 'hypothesis' | 'illustrative';
export type NodeStatus = 'active' | 'deprecated';

export type InterventionActor =
  | 'employer-policy'
  | 'recruiter-process'
  | 'ats-vendor'
  | 'hiring-manager'
  | 'candidate-action'
  | 'industry-standard'
  | 'policy';

export type CostBand = 'low' | 'medium' | 'high';
export type ScopeType = 'individual' | 'team' | 'organizational' | 'industry' | 'ecosystem';

export interface DiagnosticProbe {
  id: string;
  action: string;
  expected_signal: string;
  cost: CostBand;
  removability_target?: RemovabilityType;
}

export interface EmissionEdge {
  artifact: string;
  fidelity?: EmissionFidelity | null;
  likelihood?: EmissionLikelihood | null;
  evidence?: string[];
}

export interface LoopEdge {
  from: string;
  to: string;
  relation: 'amplifies' | 'masks';
}

// 1. Artifact / Observation
export interface ArtifactNode {
  id: string;
  type: 'artifact';
  title: string;
  summary: string;
  stages: StageId[];
  fidelity?: EmissionFidelity | null;
  status: NodeStatus;
  superseded_by?: string;
  evidence_level: EvidenceLevel;
  evidence_ids?: string[];
  probes?: DiagnosticProbe[];
  non_inferences: string[];
  content?: string;
}

// 2. Barrier
export interface BarrierNode {
  id: string;
  type: 'barrier';
  title: string;
  stage: StageId;
  order: number;
  precedes: string[];
  description: string;
  pass_condition: string;
  status: NodeStatus;
  superseded_by?: string;
  evidence_level: EvidenceLevel;
  evidence_ids?: string[];
  content?: string;
}

// 3. Mechanism
export interface MechanismFacets {
  actor: ActorType;
  nature: NatureType;
  visibility: VisibilityType;
  removability: RemovabilityType;
}

export interface MechanismNode {
  id: string;
  type: 'mechanism';
  title: string;
  summary: string;
  operates_at: string[]; // Barrier IDs
  emissions: EmissionEdge[];
  facets: MechanismFacets;
  amplifies: string[]; // Mechanism IDs
  masks: string[]; // Mechanism IDs
  status: NodeStatus;
  superseded_by?: string;
  evidence_level: EvidenceLevel;
  honest_baseline?: boolean;
  evidence_ids?: string[];
  non_inferences: string[];
  content?: string;
}

// 4. Pattern
export interface PatternNode {
  id: string;
  type: 'pattern';
  title: string;
  summary: string;
  required_artifacts: string[];
  compatible_mechanisms: string[];
  trigger_rule: string;
  establishes: string[];
  non_inferences: string[];
  interventions: string[];
  status: NodeStatus;
  superseded_by?: string;
  evidence_level: EvidenceLevel;
  evidence_ids?: string[];
  content?: string;
}

// 5. Loop
export interface LoopNode {
  id: string;
  type: 'loop';
  title: string;
  summary: string;
  mechanisms: string[];
  edges: LoopEdge[];
  entry_points: string[];
  interventions: string[];
  status: NodeStatus;
  superseded_by?: string;
  evidence_level: EvidenceLevel;
  evidence_ids?: string[];
  content?: string;
}

// 6. Intervention
export interface InterventionNode {
  id: string;
  type: 'intervention';
  title: string;
  summary: string;
  targets: string[]; // Mechanism, Barrier, or Loop IDs
  actor: InterventionActor;
  scope: ScopeType;
  cost: CostBand;
  status: NodeStatus;
  superseded_by?: string;
  evidence_level: EvidenceLevel;
  expected_effects: string[];
  measurements: string[];
  evidence_ids?: string[];
  content?: string;
}

// 7. Evidence Record
export interface EvidenceRecord {
  id: string;
  type: 'evidence';
  title: string;
  kind: EvidenceKind;
  summary: string;
  citation?: string;
  url?: string;
  period?: string;
}

export type RegistryNode =
  | ArtifactNode
  | BarrierNode
  | MechanismNode
  | PatternNode
  | LoopNode
  | InterventionNode;

export interface RegistryBundle {
  version: string;
  schema_version: string;
  updated_at: string;
  artifacts: ArtifactNode[];
  barriers: BarrierNode[];
  mechanisms: MechanismNode[];
  patterns: PatternNode[];
  loops: LoopNode[];
  interventions: InterventionNode[];
  evidence: EvidenceRecord[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type:
    | 'operates_at'
    | 'emits'
    | 'amplifies'
    | 'masks'
    | 'precedes'
    | 'instantiates'
    | 'targets'
    | 'mitigates';
  fidelity?: EmissionFidelity | null;
  likelihood?: EmissionLikelihood | null;
}

export interface RegistryGraph {
  nodes: {
    id: string;
    label: string;
    type: EntityType;
    stage?: StageId;
    removability?: RemovabilityType;
    evidence_level: EvidenceLevel;
    data: Record<string, any>;
  }[];
  edges: GraphEdge[];
}

// Diagnostic Engine Types (HOBA Analysis)
export interface DiagnosticInput {
  artifacts: string[]; // Artifact IDs
  stage?: StageId;
  role_family?: string;
  seniority_band?: string;
  notes?: string;
}

export interface DiagnosticResult {
  input: DiagnosticInput;
  mode: 'topological_uncalibrated' | 'calibrated';
  verdict: 'diagnostic' | 'low_signal_ambiguity';
  summary: string;
  hard_facts: {
    selected_artifacts: ArtifactNode[];
    stage?: StageId;
    notes?: string;
  };
  obstacle: {
    identified_barriers: BarrierNode[];
    primary_stage?: StageId;
  };
  behind: {
    compatible_mechanisms: {
      mechanism: MechanismNode;
      evidence_level: EvidenceLevel;
      honest_baseline: boolean;
      emitted_by_evidence: boolean;
      removability: RemovabilityType;
      amplified_by: string[];
      masks: string[];
    }[];
    related_patterns: PatternNode[];
    related_loops: LoopNode[];
    non_inferences: string[];
  };
  agency: {
    candidate_removable: MechanismNode[];
    intermediary_dependent: MechanismNode[];
    exogenous_no_agency: MechanismNode[];
    diagnostic_probes: DiagnosticProbe[];
    probes_summary: string;
    agency_zone: 'endogenous' | 'exogenous' | 'mixed';
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
