/** Executable case-space contract from SPEC-CASE-SPACE.md. */

export type CaseAxisKind = 'nominal' | 'ordinal' | 'subset';
export type CaseAxisProvenance = 'schema' | 'coverage' | 'new';
export type CaseConstraintStrength = 'schema' | 'hard' | 'defeasible';

export interface CaseAxis {
  readonly id: string;
  readonly kind: CaseAxisKind;
  readonly provenance: CaseAxisProvenance;
  readonly block: string;
  readonly values: readonly string[];
  readonly rationale?: string;
}

export interface DerivedCaseCoordinate {
  readonly id: string;
  readonly values: readonly string[];
  readonly computedFrom: string;
}

export interface CaseConstraint {
  readonly id: string;
  readonly strength: CaseConstraintStrength;
  readonly statement: string;
  readonly rationale: string;
  readonly refs?: readonly string[];
}

export interface CaseSpaceMetrics {
  readonly nominalOrdinalAxes: number;
  readonly subsetAxes: number;
  readonly subsetArity: number;
  readonly derivedCoordinates: number;
  readonly coverageCoordinates: number;
  readonly authoredContextCardinality: bigint;
  readonly subsetCardinality: bigint;
  readonly contextCardinality: bigint;
  readonly oneWiseSlots: number;
  readonly twoWiseCoordinatePairs: number;
  readonly twoWiseUnfilteredSlots: number;
  readonly constraints: Record<CaseConstraintStrength, number>;
  readonly executableHardConstraints: number;
}

export type SerializedCaseSpaceMetrics = Omit<
  CaseSpaceMetrics,
  'authoredContextCardinality' | 'subsetCardinality' | 'contextCardinality'
> & {
  readonly authoredContextCardinality: string;
  readonly subsetCardinality: string;
  readonly contextCardinality: string;
};

export type CaseAssignment = Partial<Record<string, string | readonly string[]>>;

export interface CaseAdmissibility {
  readonly verdict: 'admissible' | 'refuted' | 'undetermined';
  readonly violations: readonly string[];
  readonly undetermined: readonly string[];
}

const axis = (
  id: string,
  kind: CaseAxisKind,
  provenance: CaseAxisProvenance,
  block: string,
  values: readonly string[],
  rationale?: string
): CaseAxis => ({ id, kind, provenance, block, values, rationale });

const derived = (
  id: string,
  values: readonly string[],
  computedFrom: string
): DerivedCaseCoordinate => ({ id, values, computedFrom });

const constraint = (
  id: string,
  strength: CaseConstraintStrength,
  statement: string,
  rationale: string,
  refs: readonly string[] = []
): CaseConstraint => ({ id, strength, statement, rationale, refs });

export const CASE_AXES = [
  axis('funding.source', 'nominal', 'new', 'demand_money', [
    'internal_budget',
    'signed_client_contract',
    'unwon_bid',
    'public_statutory',
    'investment_round',
    'credit',
    'none',
  ]),
  axis('funding.state', 'nominal', 'new', 'demand_money', [
    'committed',
    'conditional',
    'withdrawn',
    'absent',
  ]),
  axis('chain.class', 'nominal', 'schema', 'demand_money', [
    'internal_payroll',
    'client_margin',
    'agency_fee',
    'candidate_runway',
    'none',
  ]),
  axis('cost.borne_by', 'subset', 'new', 'demand_money', [
    'employer',
    'agency',
    'ats_vendor',
    'job_board',
    'candidate',
  ]),

  axis('party.set', 'subset', 'schema', 'parties', [
    'candidate',
    'recruiter',
    'hiring_manager',
    'interviewer',
    'approver',
    'ats_vendor',
    'employer_policy',
    'public_policy',
    'client',
    'agency',
    'referrer',
  ]),
  axis('principal.side', 'nominal', 'coverage', 'parties', [
    'employer_evaluates',
    'candidate_evaluates',
    'intermediary_decides',
    'exterior_force',
  ]),

  axis('entry.path', 'nominal', 'coverage', 'entry_object', [
    'inbound',
    'outbound',
    'referral',
    'agency_submission',
    'internal_transfer',
    'rehire',
    'contract_to_hire',
    'dated_re_entry',
    'speculative_pool',
  ]),
  axis('requisition.state', 'nominal', 'new', 'entry_object', [
    'funded_open',
    'funded_pre_committed',
    'conditional_on_bid',
    'stale_orphaned',
    'never_existed',
    'closed_reposted',
  ]),
  axis('arrangement', 'nominal', 'coverage', 'entry_object', [
    'permanent',
    'contractor',
    'freelance',
    'temporary_seasonal',
    'internship',
    'contract_to_hire',
  ]),
  axis('domain', 'nominal', 'coverage', 'entry_object', [
    'software',
    'other_technical',
    'non_technical',
    'client_vendor_staffing',
    'public_sector',
    'regulated_profession',
  ]),
  axis('worksite.mode', 'nominal', 'new', 'entry_object', [
    'onsite',
    'hybrid_fixed',
    'hybrid_flexible',
    'remote_metro',
    'remote_national',
    'remote_global',
    'field_or_travel',
    'unstated',
  ]),
  axis('worksite.anchor', 'nominal', 'new', 'entry_object', [
    'none',
    'named_city',
    'commute_radius',
    'country',
    'timezone_band',
    'client_site',
    'entity_jurisdiction',
  ]),
  axis('worksite.cadence', 'ordinal', 'new', 'entry_object', [
    'none',
    'occasional',
    '1_per_week',
    '2_3_per_week',
    '4_5_per_week',
    'unstated',
  ]),

  axis('plurality', 'nominal', 'coverage', 'process_shape', [
    'single',
    'parallel_processes',
    'competing_offers',
    'repeat_same_employer',
  ]),
  axis('cohort.state', 'nominal', 'schema', 'process_shape', [
    'none',
    'ranked_within_cohort',
    'pre_committed_internal',
    'bench_pool',
    'lottery_among_equals',
  ]),

  axis('block.owner', 'nominal', 'schema', 'blocking_condition', [
    'inside',
    'outside_party',
    'ownerless',
    'none',
  ]),
  axis('block.determinacy', 'nominal', 'schema', 'blocking_condition', [
    'deterministic',
    'judgement',
    'stochastic',
  ]),
  axis('block.arity', 'nominal', 'schema', 'blocking_condition', ['absolute', 'comparative']),
  axis('block.nature', 'nominal', 'schema', 'blocking_condition', [
    'rule',
    'incentive',
    'bias',
    'noise',
    'void',
  ]),
  axis('latitude.employer', 'ordinal', 'new', 'blocking_condition', [
    'rigid',
    'slack_inside',
    'slack_outside_party',
    'unknown',
  ]),
  axis('latitude.candidate', 'ordinal', 'new', 'blocking_condition', [
    'rigid',
    'slack',
    'slack_conditional',
    'unknown',
  ]),

  axis('statement.fidelity', 'nominal', 'schema', 'communication', [
    'direct',
    'euphemism',
    'distortion',
    'noise',
    'void',
  ]),
  axis('distortion.origin', 'nominal', 'new', 'communication', [
    'none',
    'speaker',
    'channel',
    'relay',
  ]),

  axis('memory.carried', 'subset', 'coverage', 'time_memory_epilogue', [
    'talent_pool',
    're_entry_standing',
    'do_not_rehire',
    'trained_ranker',
  ]),
  axis('epilogue', 'nominal', 'coverage', 'time_memory_epilogue', [
    'not_reached',
    'start_date_shift',
    'post_acceptance_revocation',
    'no_show_candidate',
    'no_show_employer',
    'probation_confirmed',
    'probation_terminated',
  ]),

  axis('jurisdiction', 'nominal', 'coverage', 'exterior_status', [
    'us',
    'uk',
    'eu',
    'ua',
    'other',
    'cross_border',
  ]),
  axis('era.regime', 'ordinal', 'schema', 'exterior_status', [
    'record_funding',
    'zero_rates_same_year_deduction',
    'rates_up_payroll_repriced',
    'fixed_seats',
    'unclassified',
  ]),
  axis('military.status', 'nominal', 'new', 'exterior_status', [
    'not_applicable',
    'registered_liable',
    'deferred',
    'reserved_by_employer',
    'unfit',
    'excluded',
    'reservist',
    'serving',
    'demobilised_veteran',
    'registration_violation',
  ]),
  axis('population.affected', 'subset', 'coverage', 'exterior_status', [
    'career_gap',
    'early_career',
    'age',
    'caregiving',
    'disability_accommodation',
    'neurodivergence',
    'mental_health',
    'race_ethnicity',
    'gender_pregnancy',
    'religion',
    'orientation_identity',
    'criminal_record',
    'military_status',
    'displacement',
    'origin_territory',
    'language',
    'security_vetting',
    'cross_border',
  ]),

  axis('visibility.candidate', 'nominal', 'schema', 'epistemic_status', [
    'legible',
    'partial',
    'opaque',
  ]),
  axis('evidence.level', 'ordinal', 'schema', 'epistemic_status', [
    'observed',
    'compatible',
    'supported',
    'strongly_supported',
    'proven',
    'contradicted',
    'unknown',
  ]),
  axis('evidence.role', 'nominal', 'coverage', 'epistemic_status', [
    'descriptive_fact',
    'mechanism_support',
    'claim_scoped',
    'edge_scoped',
    'intervention_effectiveness',
    'synthetic_labelled',
  ]),
] as const satisfies readonly CaseAxis[];

export const DERIVED_CASE_COORDINATES = [
  derived(
    'stage.terminal',
    [
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
    ],
    'last position of the event trajectory'
  ),
  derived(
    'outcome.signal',
    [
      'no_response',
      'generic_rejection',
      'specific_skill_feedback',
      'compensation_change',
      'internal_fill',
      'closure_or_repost',
      'offer_delay_or_rescind',
      'successful_hire',
      'candidate_declines',
      'not_terminal',
    ],
    'terminal occurrence and its statement'
  ),
  derived(
    'latency.class',
    ['within_expected', 'over_expected', 'over_max', 'unbounded'],
    'elapsed fields against expected and max latency'
  ),
  derived(
    'visibility.summary',
    ['legible', 'partial', 'opaque'],
    'audience projection over the trajectory'
  ),
  derived(
    'bargain.state',
    ['overlap', 'disjoint', 'undetermined', 'not_negotiated'],
    'intersection of condition latitude sets'
  ),
] as const satisfies readonly DerivedCaseCoordinate[];

export const CASE_CONSTRAINTS = [
  constraint(
    'schema.comparative_names_cohort',
    'schema',
    'block.arity = comparative names a cohort; block.arity = absolute names none',
    'Already enforced by the substrate condition schema.'
  ),
  constraint(
    'schema.owner_names_party',
    'schema',
    'block.owner = ownerless names no party; any other owner names one',
    'Already enforced by condition and authored record schemas.'
  ),
  constraint(
    'schema.flow_amount_has_evidence',
    'schema',
    'a flow amount implies linked evidence',
    'Already enforced by the substrate flow schema.'
  ),
  constraint(
    'schema.supported_claim_has_evidence',
    'schema',
    'evidence.level >= supported implies linked evidence',
    'Already enforced by strict registry validation.'
  ),

  constraint(
    'hard.unwon_bid_is_conditional',
    'hard',
    'funding.source = unwon_bid implies funding.state = conditional and requisition.state != funded_open',
    'A seat funded by an unsigned contract is not an open funded seat.',
    ['mech.bid_conditional_talent_pool']
  ),
  constraint(
    'hard.rehire_carries_memory',
    'hard',
    'entry.path = rehire implies memory.carried is non-empty',
    'A rehire is a second process with the same employer; a first-process record exists.'
  ),
  constraint(
    'hard.no_stochastic_comparative_block',
    'hard',
    'block.determinacy = stochastic and block.arity = comparative is forbidden',
    'Apparent randomness over an invisible cohort is epistemic opacity, not chance.'
  ),
  constraint(
    'hard.channel_distortion_has_distortion_fidelity',
    'hard',
    'distortion.origin = channel implies statement.fidelity = distortion and no party holds a divergent claim',
    'A parser or channel can mangle a statement without anyone lying.',
    ['mech.ats_parser_extraction_failure']
  ),
  constraint(
    'hard.void_statement_has_no_statement_record',
    'hard',
    'statement.fidelity = void implies no statement record exists at that position',
    'A void is an absence of a statement, not a low-fidelity statement.'
  ),
  constraint(
    'hard.hire_reaches_epilogue',
    'hard',
    'outcome.signal = successful_hire implies epilogue != not_reached',
    'The model scope runs through probation; a hire with no epilogue is unfinished.'
  ),

  constraint(
    'hard.onsite_has_anchor',
    'hard',
    'worksite.mode = onsite implies worksite.anchor != none',
    'Work done at a site has a site.'
  ),
  constraint(
    'hard.remote_has_no_regular_office_week',
    'hard',
    'worksite.mode in {remote_metro, remote_national, remote_global} implies worksite.cadence in {none, occasional}',
    'Remote with a regular office week is hybrid; the contradiction belongs to statement fidelity.'
  ),
  constraint(
    'hard.hybrid_cadence_shape',
    'hard',
    'worksite.mode = hybrid_fixed implies worksite.cadence not in {none, unstated}; hybrid_flexible implies worksite.cadence in {occasional, unstated}',
    'Fixed hybrid names a cadence; flexible hybrid leaves it occasional or unstated.'
  ),
  constraint(
    'hard.outside_slack_names_outside_party',
    'hard',
    'latitude.employer = slack_outside_party implies party.set contains an outside party',
    'Slack held outside the hiring process is owned, not ownerless.'
  ),
  constraint(
    'hard.unknown_latitude_cannot_compute_overlap',
    'hard',
    'unknown employer or candidate latitude implies bargain.state in {undetermined, not_negotiated}',
    'An intersection is not computable from an unknown set.'
  ),

  constraint(
    'hard.military_ground_requires_status',
    'hard',
    'population.affected contains military_status implies military.status != not_applicable',
    'A case cannot be about a ground whose administrative state is undefined.'
  ),
  constraint(
    'hard.military_status_requires_regime',
    'hard',
    'military.status != not_applicable implies the jurisdiction declares a military registration regime',
    'Conscription and reserve duty are jurisdictional regimes, not just personal traits.'
  ),
  constraint(
    'hard.employer_reservation_is_outside_owned',
    'hard',
    'military.status = reserved_by_employer implies block.owner = outside_party for the condition that decides it',
    'Reservation is signed outside the immediate hiring process.'
  ),

  constraint(
    'defeasible.public_sector_never_existed',
    'defeasible',
    'domain = public_sector and requisition.state = never_existed is believed rare',
    'A statutory competition usually presupposes a mandated post.',
    ['evidence.openings_that_exist_because_a_rule_requires_them_ukraine_civil_service_competitions']
  ),
  constraint(
    'defeasible.candidate_evaluates_while_opaque',
    'defeasible',
    'principal.side = candidate_evaluates and visibility.candidate = opaque is possible but under-rendered',
    'The interesting candidate-side case is often opacity about the employer.'
  ),
  constraint(
    'defeasible.serving_permanent_hire',
    'defeasible',
    'military.status = serving and arrangement = permanent and outcome.signal = successful_hire is believed rare',
    'Recorded as a belief to test, not as an impossibility.'
  ),
] as const satisfies readonly CaseConstraint[];

const product = (values: readonly number[]): bigint =>
  values.reduce((acc, value) => acc * BigInt(value), 1n);

const sum = (values: readonly number[]): number => values.reduce((acc, value) => acc + value, 0);

const pairwiseSlots = (coordinateSizes: readonly number[]): number => {
  let total = 0;
  for (let i = 0; i < coordinateSizes.length; i += 1) {
    for (let j = i + 1; j < coordinateSizes.length; j += 1) {
      total += coordinateSizes[i]! * coordinateSizes[j]!;
    }
  }
  return total;
};

export function caseCoverageCoordinateSizes(): number[] {
  return [
    ...CASE_AXES.flatMap((axis) =>
      axis.kind === 'subset' ? axis.values.map(() => 2) : [axis.values.length]
    ),
    ...DERIVED_CASE_COORDINATES.map((coordinate) => coordinate.values.length),
  ];
}

export function summarizeCaseSpace(): CaseSpaceMetrics {
  const nominalOrdinalAxes = CASE_AXES.filter((axis) => axis.kind !== 'subset');
  const subsetAxes = CASE_AXES.filter((axis) => axis.kind === 'subset');
  const authoredContextCardinality = product(nominalOrdinalAxes.map((axis) => axis.values.length));
  const subsetArity = sum(subsetAxes.map((axis) => axis.values.length));
  const subsetCardinality = 2n ** BigInt(subsetArity);
  const coordinateSizes = caseCoverageCoordinateSizes();

  return {
    nominalOrdinalAxes: nominalOrdinalAxes.length,
    subsetAxes: subsetAxes.length,
    subsetArity,
    derivedCoordinates: DERIVED_CASE_COORDINATES.length,
    coverageCoordinates: coordinateSizes.length,
    authoredContextCardinality,
    subsetCardinality,
    contextCardinality: authoredContextCardinality * subsetCardinality,
    oneWiseSlots: sum(coordinateSizes),
    twoWiseCoordinatePairs: (coordinateSizes.length * (coordinateSizes.length - 1)) / 2,
    twoWiseUnfilteredSlots: pairwiseSlots(coordinateSizes),
    constraints: {
      schema: CASE_CONSTRAINTS.filter((item) => item.strength === 'schema').length,
      hard: CASE_CONSTRAINTS.filter((item) => item.strength === 'hard').length,
      defeasible: CASE_CONSTRAINTS.filter((item) => item.strength === 'defeasible').length,
    },
    executableHardConstraints: EXECUTABLE_HARD_CONSTRAINT_IDS.length,
  };
}

export function serializeCaseSpaceMetrics(
  metrics: CaseSpaceMetrics = summarizeCaseSpace()
): SerializedCaseSpaceMetrics {
  return {
    ...metrics,
    authoredContextCardinality: metrics.authoredContextCardinality.toString(),
    subsetCardinality: metrics.subsetCardinality.toString(),
    contextCardinality: metrics.contextCardinality.toString(),
  };
}

const EXECUTABLE_HARD_CONSTRAINT_IDS = [
  'hard.unwon_bid_is_conditional',
  'hard.rehire_carries_memory',
  'hard.no_stochastic_comparative_block',
  'hard.channel_distortion_has_distortion_fidelity',
  'hard.hire_reaches_epilogue',
  'hard.onsite_has_anchor',
  'hard.remote_has_no_regular_office_week',
  'hard.hybrid_cadence_shape',
  'hard.outside_slack_names_outside_party',
  'hard.unknown_latitude_cannot_compute_overlap',
  'hard.military_ground_requires_status',
  'hard.employer_reservation_is_outside_owned',
] as const;

const OUTSIDE_PARTIES = new Set(['ats_vendor', 'public_policy', 'client', 'agency']);
const REMOTE_WORKSITE_MODES = new Set(['remote_metro', 'remote_national', 'remote_global']);
const REMOTE_CADENCES = new Set(['none', 'occasional']);
const FIXED_HYBRID_FORBIDDEN_CADENCES = new Set(['none', 'unstated']);
const FLEXIBLE_HYBRID_CADENCES = new Set(['occasional', 'unstated']);
const UNKNOWN_BARGAIN_STATES = new Set(['undetermined', 'not_negotiated']);

const readScalar = (assignment: CaseAssignment, key: string): string | undefined => {
  const value = assignment[key];
  return typeof value === 'string' ? value : undefined;
};

const readSet = (assignment: CaseAssignment, key: string): readonly string[] | undefined => {
  const value = assignment[key];
  return Array.isArray(value) ? value : undefined;
};

type ConstraintVerdict = 'pass' | 'fail' | 'unknown';

const when = (
  id: (typeof EXECUTABLE_HARD_CONSTRAINT_IDS)[number],
  verdict: ConstraintVerdict
): { id: string; verdict: ConstraintVerdict } => ({ id, verdict });

function evaluateHardConstraint(
  id: (typeof EXECUTABLE_HARD_CONSTRAINT_IDS)[number],
  assignment: CaseAssignment
): ConstraintVerdict {
  switch (id) {
    case 'hard.unwon_bid_is_conditional': {
      const fundingSource = readScalar(assignment, 'funding.source');
      if (fundingSource !== 'unwon_bid') return 'pass';
      const fundingState = readScalar(assignment, 'funding.state');
      const requisitionState = readScalar(assignment, 'requisition.state');
      if (fundingState === undefined || requisitionState === undefined) return 'unknown';
      return fundingState === 'conditional' && requisitionState !== 'funded_open' ? 'pass' : 'fail';
    }
    case 'hard.rehire_carries_memory': {
      const entryPath = readScalar(assignment, 'entry.path');
      if (entryPath !== 'rehire') return 'pass';
      const memory = readSet(assignment, 'memory.carried');
      if (memory === undefined) return 'unknown';
      return memory.length > 0 ? 'pass' : 'fail';
    }
    case 'hard.no_stochastic_comparative_block': {
      const determinacy = readScalar(assignment, 'block.determinacy');
      const arity = readScalar(assignment, 'block.arity');
      if (determinacy === undefined && arity === undefined) return 'pass';
      if (determinacy === undefined) return arity === 'comparative' ? 'unknown' : 'pass';
      if (arity === undefined) return determinacy === 'stochastic' ? 'unknown' : 'pass';
      return determinacy === 'stochastic' && arity === 'comparative' ? 'fail' : 'pass';
    }
    case 'hard.channel_distortion_has_distortion_fidelity': {
      const origin = readScalar(assignment, 'distortion.origin');
      if (origin !== 'channel') return 'pass';
      const fidelity = readScalar(assignment, 'statement.fidelity');
      if (fidelity === undefined) return 'unknown';
      return fidelity === 'distortion' ? 'pass' : 'fail';
    }
    case 'hard.hire_reaches_epilogue': {
      const outcome = readScalar(assignment, 'outcome.signal');
      if (outcome !== 'successful_hire') return 'pass';
      const epilogue = readScalar(assignment, 'epilogue');
      if (epilogue === undefined) return 'unknown';
      return epilogue !== 'not_reached' ? 'pass' : 'fail';
    }
    case 'hard.onsite_has_anchor': {
      const mode = readScalar(assignment, 'worksite.mode');
      if (mode !== 'onsite') return 'pass';
      const anchor = readScalar(assignment, 'worksite.anchor');
      if (anchor === undefined) return 'unknown';
      return anchor !== 'none' ? 'pass' : 'fail';
    }
    case 'hard.remote_has_no_regular_office_week': {
      const mode = readScalar(assignment, 'worksite.mode');
      if (mode === undefined || !REMOTE_WORKSITE_MODES.has(mode)) return 'pass';
      const cadence = readScalar(assignment, 'worksite.cadence');
      if (cadence === undefined) return 'unknown';
      return REMOTE_CADENCES.has(cadence) ? 'pass' : 'fail';
    }
    case 'hard.hybrid_cadence_shape': {
      const mode = readScalar(assignment, 'worksite.mode');
      if (mode !== 'hybrid_fixed' && mode !== 'hybrid_flexible') return 'pass';
      const cadence = readScalar(assignment, 'worksite.cadence');
      if (cadence === undefined) return 'unknown';
      if (mode === 'hybrid_fixed')
        return FIXED_HYBRID_FORBIDDEN_CADENCES.has(cadence) ? 'fail' : 'pass';
      return FLEXIBLE_HYBRID_CADENCES.has(cadence) ? 'pass' : 'fail';
    }
    case 'hard.outside_slack_names_outside_party': {
      const employerLatitude = readScalar(assignment, 'latitude.employer');
      if (employerLatitude !== 'slack_outside_party') return 'pass';
      const parties = readSet(assignment, 'party.set');
      if (parties === undefined) return 'unknown';
      return parties.some((party) => OUTSIDE_PARTIES.has(party)) ? 'pass' : 'fail';
    }
    case 'hard.unknown_latitude_cannot_compute_overlap': {
      const employerLatitude = readScalar(assignment, 'latitude.employer');
      const candidateLatitude = readScalar(assignment, 'latitude.candidate');
      if (employerLatitude !== 'unknown' && candidateLatitude !== 'unknown') return 'pass';
      const bargain = readScalar(assignment, 'bargain.state');
      if (bargain === undefined) return 'unknown';
      return UNKNOWN_BARGAIN_STATES.has(bargain) ? 'pass' : 'fail';
    }
    case 'hard.military_ground_requires_status': {
      const populations = readSet(assignment, 'population.affected');
      if (populations === undefined || !populations.includes('military_status')) return 'pass';
      const militaryStatus = readScalar(assignment, 'military.status');
      if (militaryStatus === undefined) return 'unknown';
      return militaryStatus !== 'not_applicable' ? 'pass' : 'fail';
    }
    case 'hard.employer_reservation_is_outside_owned': {
      const militaryStatus = readScalar(assignment, 'military.status');
      if (militaryStatus !== 'reserved_by_employer') return 'pass';
      const owner = readScalar(assignment, 'block.owner');
      if (owner === undefined) return 'unknown';
      return owner === 'outside_party' ? 'pass' : 'fail';
    }
  }
}

export function assessCaseAssignment(assignment: CaseAssignment): CaseAdmissibility {
  const results = EXECUTABLE_HARD_CONSTRAINT_IDS.map((id) =>
    when(id, evaluateHardConstraint(id, assignment))
  );
  const violations = results
    .filter((result) => result.verdict === 'fail')
    .map((result) => result.id);
  const undetermined = results
    .filter((result) => result.verdict === 'unknown')
    .map((result) => result.id);

  return {
    verdict:
      violations.length > 0 ? 'refuted' : undetermined.length > 0 ? 'undetermined' : 'admissible',
    violations,
    undetermined,
  };
}
