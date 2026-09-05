/**
 * Case-space lift: deterministic projections from authored registry objects
 * into partial fibres of SPEC-CASE-SPACE.
 *
 * This is intentionally not a prose classifier. It only lifts coordinates that
 * are already present in structured fields, so the result is a lower bound on
 * what the corpus covers and a precise map of where prose still has to be
 * authored or reviewed.
 */
import {
  CASE_AXES,
  DERIVED_CASE_COORDINATES,
  assessCaseAssignment,
  summarizeCaseSpace,
  type CaseAdmissibility,
  type CaseAssignment,
} from '@hoba/registry-core/case-space';
import type {
  AuthoredRecordNode,
  BarrierNode,
  EraNode,
  EntityType,
  EvidenceLevel,
  InterventionNode,
  LoopNode,
  MechanismNode,
  ObservationNode,
  PatternNode,
  ProcessNode,
  RegistryBundle,
  StageId,
} from '@hoba/registry-core/types';
import type { Scenario, ScenarioCaseAssignment } from './scenarios.js';

type LiftSourceType = EntityType | 'scenario';

export interface CaseLiftRule {
  readonly coordinate: string;
  readonly value: string | readonly string[];
  readonly rule: string;
  readonly confidence: 'direct' | 'derived' | 'weak';
}

export interface CaseLiftDeclaration {
  readonly coordinate: string;
  readonly status: ScenarioCaseAssignment['status'];
  readonly value?: string | readonly string[];
  readonly basis: string;
  readonly evidence: readonly string[];
}

export interface CaseLift {
  readonly source: {
    readonly id: string;
    readonly type: LiftSourceType;
    readonly title?: string;
  };
  readonly assignment: CaseAssignment;
  readonly declarations: readonly CaseLiftDeclaration[];
  readonly rules: readonly CaseLiftRule[];
  readonly admissibility: CaseAdmissibility;
}

export interface CaseLiftCoordinateSummary {
  readonly coordinate: string;
  readonly kind: 'scalar' | 'subset';
  readonly assigned_sources: number;
  readonly values: Record<string, number>;
}

export interface CaseLiftSummary {
  readonly sources: number;
  readonly assigned_sources: number;
  readonly admissible: number;
  readonly refuted: number;
  readonly undetermined: number;
  readonly coordinates_touched: number;
  readonly coordinates_total: number;
  readonly one_wise_slots_touched: number;
  readonly one_wise_slots_total: number;
  readonly pairwise_slots_touched: number;
  readonly pairwise_sources: number;
  readonly declared_coordinates: number;
  readonly declared_known: number;
  readonly declared_inferred: number;
  readonly declared_unknown: number;
  readonly declared_not_applicable: number;
  readonly weakest_coordinates: readonly CaseLiftCoordinateSummary[];
  readonly strongest_coordinates: readonly CaseLiftCoordinateSummary[];
}

export interface CaseLiftReport {
  readonly version: '1.0.0';
  readonly method: {
    readonly unit: string;
    readonly boundary: string;
    readonly limitation: string;
  };
  readonly summary: CaseLiftSummary;
  readonly coordinates: readonly CaseLiftCoordinateSummary[];
  readonly lifts: readonly CaseLift[];
}

const scalarAxes = new Map(
  [...CASE_AXES, ...DERIVED_CASE_COORDINATES]
    .filter((axis) => !('kind' in axis) || axis.kind !== 'subset')
    .map((axis) => [axis.id, axis.values] as const)
);
const subsetAxes = new Map(
  CASE_AXES.filter((axis) => axis.kind === 'subset').map((axis) => [axis.id, axis.values] as const)
);
const caseSpaceMetrics = summarizeCaseSpace();

const STAGE_ORDER: readonly StageId[] = [
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
];

const stageRank = new Map(STAGE_ORDER.map((stage, index) => [stage, index] as const));

const lastStage = (stages: readonly StageId[]): StageId | undefined =>
  [...stages].sort((a, b) => (stageRank.get(b) ?? 0) - (stageRank.get(a) ?? 0))[0];

const actorParty: Record<string, string> = {
  'actor.candidate': 'candidate',
  'actor.recruiter': 'recruiter',
  'actor.hiring_manager': 'hiring_manager',
  'actor.ats_vendor': 'ats_vendor',
  'actor.employer_policy': 'employer_policy',
  'actor.public_policy_and_industry_standards': 'public_policy',
  'actor.client': 'client',
  system: 'ats_vendor',
  recruiter: 'recruiter',
  'hiring-manager': 'hiring_manager',
  policy: 'employer_policy',
  external: 'public_policy',
  candidate: 'candidate',
  'employer-policy': 'employer_policy',
  'recruiter-process': 'recruiter',
  'ats-vendor': 'ats_vendor',
  'candidate-action': 'candidate',
  'industry-standard': 'public_policy',
};

const ownerValue: Record<string, string> = {
  inside: 'inside',
  'outside-party': 'outside_party',
  ownerless: 'ownerless',
};

const recordChainClass: Partial<Record<AuthoredRecordNode['record_class'], string>> = {
  payroll: 'internal_payroll',
  'placement-fee': 'agency_fee',
  runway: 'candidate_runway',
  bid: 'client_margin',
  contract: 'client_margin',
};

const levelValue = (level: EvidenceLevel | undefined): string | undefined => level;

class LiftBuilder {
  private readonly assignment: Record<string, string | readonly string[]> = {};
  private readonly declarations: CaseLiftDeclaration[] = [];
  private readonly rules: CaseLiftRule[] = [];

  set(
    coordinate: string,
    value: string | undefined,
    rule: string,
    confidence: CaseLiftRule['confidence']
  ) {
    if (value === undefined) return;
    const values = scalarAxes.get(coordinate);
    if (values === undefined || !values.includes(value)) return;
    if (this.assignment[coordinate] !== undefined && this.assignment[coordinate] !== value) return;
    this.assignment[coordinate] = value;
    this.rules.push({ coordinate, value, rule, confidence });
  }

  add(
    coordinate: string,
    value: string | undefined,
    rule: string,
    confidence: CaseLiftRule['confidence']
  ) {
    if (value === undefined) return;
    const values = subsetAxes.get(coordinate);
    if (values === undefined || !values.includes(value)) return;
    const current = this.assignment[coordinate];
    const next = new Set(Array.isArray(current) ? current : []);
    next.add(value);
    this.assignment[coordinate] = [...next].sort();
    this.rules.push({ coordinate, value, rule, confidence });
  }

  addMany(
    coordinate: string,
    values: readonly (string | undefined)[],
    rule: string,
    confidence: CaseLiftRule['confidence']
  ) {
    for (const value of values) this.add(coordinate, value, rule, confidence);
  }

  merge(source: CaseLift, rule: string, confidence: CaseLiftRule['confidence']) {
    for (const [coordinate, value] of Object.entries(source.assignment)) {
      if (value === undefined) continue;
      if (typeof value === 'string') this.set(coordinate, value, rule, confidence);
      else this.addMany(coordinate, value, rule, confidence);
    }
  }

  declareScenarioAssignment(assignment: ScenarioCaseAssignment) {
    this.declarations.push({
      coordinate: assignment.coordinate,
      status: assignment.status,
      value: assignment.value,
      basis: assignment.basis,
      evidence: assignment.evidence,
    });
    if (assignment.value === undefined) return;
    const confidence = assignment.status === 'known' ? 'direct' : 'derived';
    const rule = `scenario.case_assignments.${assignment.coordinate}`;
    if (Array.isArray(assignment.value))
      this.addMany(assignment.coordinate, assignment.value, rule, confidence);
    else this.set(assignment.coordinate, assignment.value, rule, confidence);
  }

  build(source: CaseLift['source']): CaseLift {
    const assignment = this.assignment;
    return {
      source,
      assignment,
      declarations: this.declarations,
      rules: this.rules,
      admissibility: assessCaseAssignment(assignment),
    };
  }
}

function liftObservation(node: ObservationNode): CaseLift {
  const lift = new LiftBuilder();
  lift.set(
    'stage.terminal',
    lastStage(node.stages) ?? node.stages[0],
    'observation.stages',
    'direct'
  );
  lift.set('statement.fidelity', node.fidelity ?? 'direct', 'observation.fidelity', 'direct');
  lift.set(
    'evidence.level',
    levelValue(node.evidence_level),
    'observation.evidence_level',
    'direct'
  );
  return lift.build({ id: node.id, type: 'observation', title: node.title });
}

function liftBarrier(node: BarrierNode): CaseLift {
  const lift = new LiftBuilder();
  lift.set('stage.terminal', node.stage, 'barrier.stage', 'direct');
  lift.set('evidence.level', levelValue(node.evidence_level), 'barrier.evidence_level', 'direct');
  return lift.build({ id: node.id, type: 'barrier', title: node.title });
}

function liftMechanism(node: MechanismNode): CaseLift {
  const lift = new LiftBuilder();
  lift.add('party.set', actorParty[node.facets.actor], 'mechanism.facets.actor', 'derived');
  lift.set('block.nature', node.facets.nature, 'mechanism.facets.nature', 'direct');
  lift.set(
    'visibility.candidate',
    node.facets.visibility === 'observable'
      ? 'legible'
      : node.facets.visibility === 'inferable'
        ? 'partial'
        : 'opaque',
    'mechanism.facets.visibility',
    'derived'
  );
  lift.set('evidence.level', levelValue(node.evidence_level), 'mechanism.evidence_level', 'direct');
  const fidelities = new Set(node.emissions.map((edge) => edge.fidelity).filter(Boolean));
  if (fidelities.size === 1) {
    lift.set('statement.fidelity', [...fidelities][0]!, 'mechanism.emissions.fidelity', 'derived');
  }
  const stages = node.emissions.flatMap((edge) => edge.observed_at);
  if (stages.length > 0)
    lift.set('stage.terminal', lastStage(stages)!, 'mechanism.emissions.observed_at', 'weak');
  return lift.build({ id: node.id, type: 'mechanism', title: node.title });
}

function liftPattern(node: PatternNode, byId: ReadonlyMap<string, CaseLift>): CaseLift {
  const lift = new LiftBuilder();
  lift.set('evidence.level', levelValue(node.evidence_level), 'pattern.evidence_level', 'direct');
  for (const id of [...node.required_artifacts, ...node.compatible_mechanisms]) {
    const source = byId.get(id);
    if (source) lift.merge(source, `pattern references ${id}`, 'weak');
  }
  return lift.build({ id: node.id, type: 'pattern', title: node.title });
}

function liftLoop(node: LoopNode, byId: ReadonlyMap<string, CaseLift>): CaseLift {
  const lift = new LiftBuilder();
  lift.set('evidence.level', levelValue(node.evidence_level), 'loop.evidence_level', 'direct');
  for (const id of node.mechanisms) {
    const source = byId.get(id);
    if (source) lift.merge(source, `loop references ${id}`, 'weak');
  }
  return lift.build({ id: node.id, type: 'loop', title: node.title });
}

function liftIntervention(node: InterventionNode): CaseLift {
  const lift = new LiftBuilder();
  lift.add('party.set', actorParty[node.actor], 'intervention.actor', 'derived');
  lift.set(
    'evidence.level',
    levelValue(node.evidence_level),
    'intervention.evidence_level',
    'direct'
  );
  return lift.build({ id: node.id, type: 'intervention', title: node.title });
}

function liftRecord(node: AuthoredRecordNode): CaseLift {
  const lift = new LiftBuilder();
  lift.set(
    'chain.class',
    recordChainClass[node.record_class] ?? 'none',
    'record.record_class',
    'derived'
  );
  lift.set('block.owner', ownerValue[node.owner], 'record.owner', 'direct');
  lift.add('party.set', node.owner_actor, 'record.owner_actor', 'direct');
  lift.set(
    'visibility.candidate',
    node.visibility_default === 'observable'
      ? 'legible'
      : node.visibility_default === 'inferable'
        ? 'partial'
        : 'opaque',
    'record.visibility_default',
    'derived'
  );
  lift.set('evidence.level', levelValue(node.evidence_level), 'record.evidence_level', 'direct');
  return lift.build({ id: node.id, type: 'record', title: node.title });
}

function liftProcess(node: ProcessNode): CaseLift {
  const lift = new LiftBuilder();
  lift.addMany(
    'party.set',
    node.states.map((state) => actorParty[state.owner]),
    'process.states.owner',
    'direct'
  );
  const terminal = node.states.find((state) => state.kind === 'terminal');
  if (terminal) {
    lift.set(
      'epilogue',
      terminal.id.includes('probation') ? 'probation_confirmed' : 'not_reached',
      'process.terminal_state',
      'weak'
    );
  }
  lift.set('evidence.level', levelValue(node.evidence_level), 'process.evidence_level', 'direct');
  return lift.build({ id: node.id, type: 'process', title: node.title });
}

const eraRegimeById: Readonly<Record<string, string>> = {
  'era.the_record_funding_years': 'record_funding',
  'era.zero_rates_and_a_same_year_deduction': 'zero_rates_same_year_deduction',
  'era.rates_up_payroll_repriced': 'rates_up_payroll_repriced',
  'era.a_fixed_number_of_seats': 'fixed_seats',
};

function liftEra(node: EraNode): CaseLift {
  const lift = new LiftBuilder();
  lift.set('era.regime', eraRegimeById[node.id] ?? 'unclassified', 'era.id', 'direct');
  return lift.build({ id: node.id, type: 'era', title: node.title });
}

function liftScenario(scenario: Scenario, byId: ReadonlyMap<string, CaseLift>): CaseLift {
  const lift = new LiftBuilder();
  for (const assignment of scenario.case_assignments) {
    lift.declareScenarioAssignment(assignment);
  }
  lift.set('stage.terminal', scenario.stage, 'scenario.stage', 'direct');
  for (const id of [
    ...scenario.observations,
    ...scenario.compatible_mechanisms,
    ...scenario.compatible_barriers,
    ...scenario.process_states,
  ]) {
    const source = byId.get(id);
    if (source) lift.merge(source, `scenario references ${id}`, 'derived');
  }
  for (const actor of Object.keys(scenario.agency)) {
    lift.add(
      'party.set',
      actor === 'employer-policy' ? 'employer_policy' : actor,
      'scenario.agency',
      'derived'
    );
  }
  return lift.build({ id: scenario.id, type: 'scenario', title: scenario.title.en });
}

export function liftRegistryCaseSpace(
  bundle: RegistryBundle,
  scenarios: readonly Scenario[] = []
): CaseLiftReport {
  const base: CaseLift[] = [
    ...bundle.observations.map(liftObservation),
    ...bundle.barriers.map(liftBarrier),
    ...bundle.mechanisms.map(liftMechanism),
    ...bundle.interventions.map(liftIntervention),
    ...bundle.records.map(liftRecord),
    ...bundle.processes.map(liftProcess),
    ...bundle.eras.map(liftEra),
  ];
  const byId = new Map(base.map((lift) => [lift.source.id, lift] as const));
  const derived = [
    ...bundle.patterns.map((node) => liftPattern(node, byId)),
    ...bundle.loops.map((node) => liftLoop(node, byId)),
  ];
  for (const lift of derived) byId.set(lift.source.id, lift);
  const scenarioLifts = scenarios.map((scenario) => liftScenario(scenario, byId));
  const lifts = [...base, ...derived, ...scenarioLifts].sort((a, b) =>
    a.source.id.localeCompare(b.source.id)
  );

  return {
    version: '1.0.0',
    method: {
      unit: 'partial case assignment per canonical entity or scenario',
      boundary: 'structured fields only; prose is not classified by this lift',
      limitation:
        'This is a lower bound on corpus coverage. Unknown coordinates mean not machine-authored yet, not impossible.',
    },
    summary: summarizeCaseLifts(lifts),
    coordinates: summarizeLiftCoordinates(lifts),
    lifts,
  };
}

export function summarizeLiftCoordinates(lifts: readonly CaseLift[]): CaseLiftCoordinateSummary[] {
  const summaries = new Map<
    string,
    {
      coordinate: string;
      kind: 'scalar' | 'subset';
      assigned_sources: number;
      values: Record<string, number>;
    }
  >();
  const ensure = (coordinate: string, kind: 'scalar' | 'subset') => {
    const existing = summaries.get(coordinate);
    if (existing) return existing;
    const created = { coordinate, kind, assigned_sources: 0, values: {} as Record<string, number> };
    summaries.set(coordinate, created);
    return created;
  };

  for (const lift of lifts) {
    for (const [coordinate, value] of Object.entries(lift.assignment)) {
      const summary = ensure(coordinate, Array.isArray(value) ? 'subset' : 'scalar');
      summary.assigned_sources += 1;
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) summary.values[item] = (summary.values[item] ?? 0) + 1;
    }
  }

  return [...summaries.values()].sort((a, b) => a.coordinate.localeCompare(b.coordinate));
}

export function summarizeCaseLifts(lifts: readonly CaseLift[]): CaseLiftSummary {
  const coordinates = summarizeLiftCoordinates(lifts);
  const touchedSlots = new Set<string>();
  const touchedPairs = new Set<string>();
  let pairwiseSources = 0;
  const declaredCoordinateKeys = new Set<string>();
  let declaredKnown = 0;
  let declaredInferred = 0;
  let declaredUnknown = 0;
  let declaredNotApplicable = 0;
  for (const lift of lifts) {
    for (const declaration of lift.declarations) {
      declaredCoordinateKeys.add(`${lift.source.id}:${declaration.coordinate}`);
      if (declaration.status === 'known') declaredKnown += 1;
      else if (declaration.status === 'inferred') declaredInferred += 1;
      else if (declaration.status === 'unknown') declaredUnknown += 1;
      else declaredNotApplicable += 1;
    }
    const slots: string[] = [];
    for (const [coordinate, value] of Object.entries(lift.assignment)) {
      const values = Array.isArray(value)
        ? value.map((item) => `${coordinate}.${item}`)
        : [`${coordinate}.${value}`];
      for (const item of values) touchedSlots.add(item);
      slots.push(...values);
    }
    if (slots.length > 1) pairwiseSources += 1;
    for (let i = 0; i < slots.length; i += 1) {
      for (let j = i + 1; j < slots.length; j += 1) {
        touchedPairs.add([slots[i]!, slots[j]!].sort().join(' × '));
      }
    }
  }

  const byAssigned = (a: CaseLiftCoordinateSummary, b: CaseLiftCoordinateSummary) =>
    a.assigned_sources - b.assigned_sources || a.coordinate.localeCompare(b.coordinate);

  return {
    sources: lifts.length,
    assigned_sources: lifts.filter((lift) => Object.keys(lift.assignment).length > 0).length,
    admissible: lifts.filter((lift) => lift.admissibility.verdict === 'admissible').length,
    refuted: lifts.filter((lift) => lift.admissibility.verdict === 'refuted').length,
    undetermined: lifts.filter((lift) => lift.admissibility.verdict === 'undetermined').length,
    coordinates_touched: coordinates.length,
    coordinates_total: caseSpaceMetrics.coverageCoordinates,
    one_wise_slots_touched: touchedSlots.size,
    one_wise_slots_total: caseSpaceMetrics.oneWiseSlots,
    pairwise_slots_touched: touchedPairs.size,
    pairwise_sources: pairwiseSources,
    declared_coordinates: declaredCoordinateKeys.size,
    declared_known: declaredKnown,
    declared_inferred: declaredInferred,
    declared_unknown: declaredUnknown,
    declared_not_applicable: declaredNotApplicable,
    weakest_coordinates: [...coordinates].sort(byAssigned).slice(0, 10),
    strongest_coordinates: [...coordinates].sort(byAssigned).slice(-10).reverse(),
  };
}
