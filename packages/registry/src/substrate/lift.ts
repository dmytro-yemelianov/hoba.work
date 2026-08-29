/**
 * The lift: the authored ten-type bundle, derived into the substrate.
 *
 * The rule of the gate (PLAN-SUBSTRATE A2): the substrate is authoritative for
 * structure, the sidecar carries prose, and `project()` must rebuild the exact
 * bundle from the pair. What counts as structure:
 *
 *  - every entity's TITLE lives on its substrate object, never in the sidecar;
 *  - each barrier is one condition; its `gates` are the workflow events its
 *    transitions guard, its owner is the owner of the first transition that
 *    carries it (one barrier is owned differently on different edges — B-001
 *    is the candidate's act in the end-to-end funnel and the vendor's record in
 *    the ATS pipeline — and
 *    the first workflow's reading wins, documented here);
 *  - each mechanism is one condition; `accounts_for` carries operates_at,
 *    `causes` carries the emission targets in order, and the per-emission
 *    metadata rides the sidecar keyed by position;
 *  - comparative mechanisms (M-002, M-009, M-018) carry arity='comparative'
 *    and name their cohort object; all others are arity='absolute' (A4);
 *  - statements are linked on communicative observations (A-002, etc.), while
 *    absences (A-001) carry communicates=false (A4);
 *  - visibility classes define party-to-record visibility in the substrate (A4);
 *  - workflows are processes over per-state event classes, conditions on the
 *    edges being exactly the B-* entities of the authored transition.
 */
import type { AnyRecord, RegistryBundle } from '../types.js';
import type {
  Cohort,
  Condition,
  EventClass,
  Flow,
  Process,
  RecordClass,
  Statement,
  Substrate,
  SubstrateRecord,
  VisibilityRule,
} from './schema.js';

export interface Sidecar {
  bundle: { version: string; schema_version: string; updated_at: string };
  /** Original nodes minus the fields the substrate is authoritative for. */
  entities: Record<string, Record<string, unknown>>;
  /** Per-mechanism emission metadata, aligned by index with `causes`. */
  emissionMeta: Record<string, Record<string, unknown>[]>;
  /** Collection order, so projection reproduces authored ordering. */
  order: Record<string, string[]>;
}

export interface Lifted {
  substrate: Substrate;
  sidecar: Sidecar;
}

const low = (id: string) => id.toLowerCase();

/** nature → determinacy. Fixed and reviewable. */
const DETERMINACY: Record<string, Condition['determinacy']> = {
  rule: 'deterministic',
  void: 'deterministic',
  incentive: 'judgement',
  bias: 'judgement',
  noise: 'stochastic',
};

const COMPARATIVE_MECHANISMS = new Set([
  'M-002',
  'mech.stronger_competing_candidate_in_final_cohort',
  'M-009',
  'mech.recruiter_volume_quota_incentive_distortion',
  'M-018',
  'mech.domain_specificity_over_weighting',
]);

export function lift(bundle: RegistryBundle): Lifted {
  const recordClasses: RecordClass[] = [
    { id: 'cls:actor', title: 'Party', fields: {}, party: true },
    { id: 'cls:era', title: 'Era', fields: {}, party: false },
    { id: 'cls:evidence', title: 'Evidence record', fields: {}, party: false },
    { id: 'cls:intervention', title: 'Proposed change', fields: {}, party: false },
    { id: 'cls:pattern', title: 'Pattern', fields: {}, party: false },
    { id: 'cls:loop', title: 'Loop', fields: {}, party: false },
    { id: 'cls:requisition', title: 'Requisition', fields: {}, party: false },
    { id: 'cls:application', title: 'Application', fields: {}, party: false },
    { id: 'cls:record', title: 'Financial Record', fields: {}, party: false },
  ];

  const records: SubstrateRecord[] = [
    { id: 'rec:requisition.context', class: 'cls:requisition', title: 'Active Requisition Context', fields: {} },
  ];
  const eventClasses: EventClass[] = [];
  const statements: Statement[] = [];
  const conditions: Condition[] = [];
  const processes: Process[] = [];
  const cohorts: Cohort[] = [
    {
      id: 'coh:requisition.pool',
      title: 'Requisition candidate cohort',
      of: 'cls:application',
      within: 'rec:requisition.context',
    },
  ];

  const visibilityRules: VisibilityRule[] = [
    { audience: 'cls:actor', subject: 'cls:actor', level: 'observable' },
    { audience: 'cls:actor', subject: 'cls:evidence', level: 'inferable' },
    { audience: 'cls:actor', subject: 'cls:intervention', level: 'observable' },
    { audience: 'cls:actor', subject: 'cls:pattern', level: 'inferable' },
    { audience: 'cls:actor', subject: 'cls:loop', level: 'inferable' },
    { audience: 'cls:actor', subject: 'cls:era', level: 'observable' },
    { audience: 'cls:actor', subject: 'cls:requisition', level: 'opaque' },
    { audience: 'cls:actor', subject: 'cls:application', level: 'inferable' },
  ];

  const sidecar: Sidecar = {
    bundle: { version: bundle.version, schema_version: bundle.schema_version, updated_at: bundle.updated_at },
    entities: {},
    emissionMeta: {},
    order: {},
  };

  const keep = (node: AnyRecord | Record<string, unknown>, strip: string[]) => {
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) if (!strip.includes(k)) rest[k] = v;
    return rest;
  };

  // Parties, and the flat record-backed collections.
  const flat: [keyof RegistryBundle, string, (id: string) => string][] = [
    ['actors', 'cls:actor', (id) => `rec:${low(id)}`],
    ['eras', 'cls:era', (id) => `rec:${low(id)}`],
    ['evidence', 'cls:evidence', (id) => `rec:${low(id)}`],
    ['interventions', 'cls:intervention', (id) => `rec:${low(id)}`],
    ['patterns', 'cls:pattern', (id) => `rec:${low(id)}`],
    ['loops', 'cls:loop', (id) => `rec:${low(id)}`],
  ];
  for (const [collection, cls, recId] of flat) {
    const nodes = bundle[collection] as unknown as AnyRecord[];
    sidecar.order[collection] = nodes.map((n) => n.id);
    for (const n of nodes) {
      records.push({ id: recId(n.id), class: cls, title: n.title, fields: {} });
      sidecar.entities[n.id] = keep(n, ['title']);
    }
  }

  // Observations are event classes; statements attach to communicative observations (A4).
  sidecar.order['observations'] = bundle.observations.map((a) => a.id);
  for (const a of bundle.observations) {
    const isAbsence = a.id === 'obs.complete_silence_after_submission' || a.id === 'A-001';
    const communicates = !isAbsence;
    eventClasses.push({
      id: `evc:${low(a.id)}`,
      title: a.title,
      emitters: ['cls:actor'],
      communicates,
    });
    if (communicates) {
      statements.push({
        id: `sta:${low(a.id)}`,
        about: 'rec:actor.candidate',
        claims: {},
        fidelity: 'direct',
      });
    }
    sidecar.entities[a.id] = keep(a, ['title']);
  }

  // Workflow states are event classes; workflows are processes.
  sidecar.order['processes'] = bundle.processes.map((w) => w.id);
  for (const w of bundle.processes) {
    for (const s of w.states)
      eventClasses.push({ id: `evc:${low(w.id)}.${s.id}`, title: s.title, emitters: [], communicates: false });
    processes.push({
      id: `prc:${low(w.id)}`,
      title: w.title,
      transitions: w.transitions.map((t) => ({
        from: `evc:${low(w.id)}.${t.from}`,
        to: `evc:${low(w.id)}.${t.to}`,
        conditions: (t.entities ?? []).filter((e) => e.startsWith('B-') || e.startsWith('bar.')).map((e) => `cnd:${low(e)}`),
        latency_expected_days: t.latency_expected_days,
        latency_max_days: t.latency_max_days,
      })),
    });
    sidecar.entities[w.id] = keep(w as unknown as AnyRecord, ['title', 'states', 'transitions']);
    sidecar.entities[`${w.id}#states`] = {
      states: w.states.map((s) => keep(s as unknown as Record<string, unknown>, ['title'])),
    };
    sidecar.entities[`${w.id}#transitions`] = {
      transitions: w.transitions.map((t) => keep(t as unknown as Record<string, unknown>, [])),
    };
  }

  // One condition per barrier: gates and owner read off the workflows.
  const gateOf = new Map<string, string[]>();
  const ownerOf = new Map<string, string>();
  for (const w of bundle.processes)
    for (const t of w.transitions)
      for (const e of t.entities ?? [])
        if (e.startsWith('B-') || e.startsWith('bar.')) {
          const g = gateOf.get(e) ?? [];
          const evc = `evc:${low(w.id)}.${t.to}`;
          if (!g.includes(evc)) g.push(evc);
          gateOf.set(e, g);
          if (!ownerOf.has(e)) ownerOf.set(e, t.owner);
        }

  const partyOfActor = (actorId: string) => `rec:${low(actorId)}`;

  sidecar.order['barriers'] = bundle.barriers.map((b) => b.id);
  for (const b of bundle.barriers) {
    conditions.push({
      id: `cnd:${low(b.id)}`,
      title: b.title,
      gates: gateOf.get(b.id) ?? [],
      causes: [],
      accounts_for: [],
      owner: { position: 'inside', party: partyOfActor(ownerOf.get(b.id) ?? 'employer-policy') },
      determinacy: 'judgement',
      arity: 'absolute',
      reads: [],
      text: b.pass_condition,
    });
    sidecar.entities[b.id] = keep(b, ['title', 'pass_condition']);
  }

  // One condition per mechanism: accounts for its barriers, causes its emissions.
  const facetParty = new Map<string, string>();
  for (const a of bundle.actors) for (const f of a.aliases?.facet ?? []) facetParty.set(f, partyOfActor(a.id));

  sidecar.order['mechanisms'] = bundle.mechanisms.map((m) => m.id);
  sidecar.emissionMeta = {};
  for (const m of bundle.mechanisms) {
    const anchors = m.operates_at.map((b) => `cnd:${low(b)}`);
    const gates = [...new Set(m.operates_at.flatMap((b) => gateOf.get(b) ?? []))];
    const isComparative = COMPARATIVE_MECHANISMS.has(m.id);

    conditions.push({
      id: `cnd:${low(m.id)}`,
      title: m.title,
      gates,
      causes: m.emissions.map((e) => `evc:${low(e.artifact)}`),
      accounts_for: anchors,
      owner: { position: 'inside', party: facetParty.get(m.facets.actor) ?? partyOfActor(m.facets.actor) },
      determinacy: DETERMINACY[m.facets.nature] ?? 'judgement',
      arity: isComparative ? 'comparative' : 'absolute',
      cohort: isComparative ? 'coh:requisition.pool' : undefined,
      reads: [],
      text: m.summary,
    });
    sidecar.emissionMeta[m.id] = m.emissions.map((e) => keep(e as unknown as Record<string, unknown>, ['artifact']));
    sidecar.entities[m.id] = keep(m, ['title', 'operates_at', 'emissions']);
  }

  // Authored records and flows (A5).
  const flows: Flow[] = [];
  sidecar.order['records'] = (bundle.records ?? []).map((r) => r.id);
  for (const r of bundle.records ?? []) {
    records.push({
      id: `rec:${low(r.id)}`,
      class: 'cls:record',
      title: r.title,
      fields: {},
    });
    sidecar.entities[r.id] = keep(r, ['title']);
    for (const f of r.flows) {
      flows.push({
        id: `flw:${low(r.id)}.${low(f.to)}`,
        title: f.label,
        from: `rec:${low(r.id)}`,
        to: `rec:${low(f.to)}`,
        percentage: f.percentage,
        fraction: f.fraction,
        split_type: f.split_type,
        amount: f.amount,
      });
    }
  }

  return {
    substrate: {
      recordClasses,
      records,
      eventClasses,
      events: [],
      statements,
      conditions,
      visibilityRules,
      visibilityOverrides: [],
      flows,
      processes,
      cohorts,
    },
    sidecar,
  };
}
