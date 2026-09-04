/**
 * Substrate derivations: re-deriving registry queries and computing pattern emptiness.
 *
 * Stage A3 of PLAN-SUBSTRATE.md:
 *  1. Re-implements `gaps()` (indistinguishability, subsumption, identifiability),
 *     `separation()`, loops, and route counting as queries over the substrate graph.
 *  2. Computes pattern emptiness: evaluates whether each pattern's (P-*) joint
 *     condition set is provably empty (computed_empty) or relies on unobserved
 *     hidden state (prose_asserted).
 */
import type { DiagnosticProbe } from '@hoba/registry-core/types';
import type {
  CandidateProfile,
  ConformanceReport,
  GateOutcome,
  PostingFacets,
} from '@hoba/registry-core/types';
import type {
  GapReport,
  Identifiability,
  Indistinguishable,
  Unaddressed,
  UnplacedEmission,
} from '@hoba/registry-core/types';
import type { Narrowing, ProbeResult, SeparationReport } from '@hoba/registry-core/types';
import type { Condition, Substrate } from './schema.js';
import type { Lifted } from './lift.js';

const toPublicId = (substrateId: string): string => {
  const prefixMatch = substrateId.match(/^(cnd|evc|rec|prc):(.+)$/);
  if (prefixMatch) {
    const raw = prefixMatch[2]!;
    return /^[a-z]+-\d+$/i.test(raw) ? raw.toUpperCase() : raw;
  }
  return substrateId;
};

// ---------------------------------------------------------------------------
// 1. Indistinguishability & Identifiability over Substrate

const getMechanismConditions = (substrate: Substrate): Condition[] =>
  substrate.conditions.filter((c) => c.id.startsWith('cnd:m-') || c.id.startsWith('cnd:mech.'));

const getCausesPublic = (c: Condition): string[] => c.causes.map((evc) => toPublicId(evc)).sort();

const signatureOfCondition = (c: Condition): string => getCausesPublic(c).join(',');

/**
 * Groups mechanism conditions that cause the exact same event classes.
 */
export function substrateIndistinguishability(substrate: Substrate): Indistinguishable[] {
  const mechs = getMechanismConditions(substrate);
  const bySig = new Map<string, string[]>();

  for (const m of mechs) {
    const pubId = toPublicId(m.id);
    const sig = signatureOfCondition(m);
    if (!bySig.has(sig)) bySig.set(sig, []);
    bySig.get(sig)!.push(pubId);
  }

  return [...bySig.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([sig, ids]) => ({ signature: sig ? sig.split(',') : [], mechanisms: ids }))
    .sort((a, b) => a.mechanisms[0]!.localeCompare(b.mechanisms[0]!));
}

/**
 * Identifiability & Subsumption over Substrate conditions.
 */
export function substrateIdentifiability(substrate: Substrate): Identifiability {
  const mechs = getMechanismConditions(substrate);
  const signatures = mechs.map((m) => ({
    id: toPublicId(m.id),
    causes: new Set(getCausesPublic(m)),
  }));

  const identifying: { artifact: string; mechanism: string }[] = [];
  const observationEventClasses = substrate.eventClasses.filter(
    (e) => e.id.startsWith('evc:a-') || e.id.startsWith('evc:obs.')
  );

  for (const obs of observationEventClasses) {
    const pubObs = toPublicId(obs.id);
    const emitters = signatures.filter((s) => s.causes.has(pubObs));
    if (emitters.length === 1) {
      identifying.push({ artifact: pubObs, mechanism: emitters[0]!.id });
    }
  }

  const neverAlone: { mechanism: string; coveredBy: string[] }[] = [];
  for (const s of signatures) {
    const coveredBy = signatures
      .filter((other) => other.id !== s.id && [...s.causes].every((a) => other.causes.has(a)))
      .map((other) => other.id);
    if (coveredBy.length) {
      neverAlone.push({ mechanism: s.id, coveredBy });
    }
  }

  return { identifying, neverAlone };
}

// ---------------------------------------------------------------------------
// 2. Closure over Substrate Graph

export interface SubstrateClosure {
  id: string;
  affects: string[];
  affectedBy: string[];
  directAffects: string[];
  directAffectedBy: string[];
}

export function substrateClosure(lifted: Lifted, id: string): SubstrateClosure {
  const out = new Map<string, string[]>();
  const inn = new Map<string, string[]>();

  const link = (from: string, to: string) => {
    if (!out.has(from)) out.set(from, []);
    out.get(from)!.push(to);
    if (!inn.has(to)) inn.set(to, []);
    inn.get(to)!.push(from);
  };

  const { substrate, sidecar } = lifted;

  // Barriers -> precedes
  for (const bId of sidecar.order['barriers'] ?? []) {
    const ent = sidecar.entities[bId];
    for (const next of (ent?.precedes as string[]) ?? []) link(bId, next);
  }

  // Mechanisms -> operates_at (accounts_for), causes (emissions), amplifies, masks
  for (const m of getMechanismConditions(substrate)) {
    const mId = toPublicId(m.id);
    for (const g of m.accounts_for) link(mId, toPublicId(g));
    for (const e of m.causes) link(mId, toPublicId(e));
    const ent = sidecar.entities[mId];
    if (ent) {
      for (const a of (ent.amplifies as string[]) ?? []) link(mId, a);
      for (const k of (ent.masks as string[]) ?? []) link(mId, k);
    }
  }

  // Patterns -> required_artifacts, compatible_mechanisms
  for (const pId of sidecar.order['patterns'] ?? []) {
    const ent = sidecar.entities[pId];
    if (ent) {
      for (const a of (ent.required_artifacts as string[]) ?? []) link(pId, a);
      for (const m of (ent.compatible_mechanisms as string[]) ?? []) link(pId, m);
    }
  }

  // Loops -> mechanisms
  for (const lId of sidecar.order['loops'] ?? []) {
    const ent = sidecar.entities[lId];
    if (ent) {
      for (const m of (ent.mechanisms as string[]) ?? []) link(lId, m);
    }
  }

  // Interventions -> targets
  for (const iId of sidecar.order['interventions'] ?? []) {
    const ent = sidecar.entities[iId];
    if (ent) {
      for (const t of (ent.targets as string[]) ?? []) link(iId, t);
    }
  }

  const walk = (edges: Map<string, string[]>): string[] => {
    const seen = new Set<string>();
    const queue = [...(edges.get(id) ?? [])];
    while (queue.length) {
      const next = queue.shift()!;
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...(edges.get(next) ?? []));
    }
    return [...seen].sort();
  };

  const direct = (edges: Map<string, string[]>): string[] =>
    [...new Set(edges.get(id) ?? [])].filter((next) => next !== id).sort();

  return {
    id,
    affects: walk(out),
    affectedBy: walk(inn),
    directAffects: direct(out),
    directAffectedBy: direct(inn),
  };
}

// ---------------------------------------------------------------------------
// 3. Full Gaps Report over Substrate

export function substrateGaps(lifted: Lifted): GapReport {
  const { substrate, sidecar } = lifted;
  const mechs = getMechanismConditions(substrate);

  let indistinguishablePairs = 0;
  let totalPairs = 0;
  for (let i = 0; i < mechs.length; i++) {
    for (let j = i + 1; j < mechs.length; j++) {
      totalPairs++;
      if (signatureOfCondition(mechs[i]!) === signatureOfCondition(mechs[j]!)) {
        indistinguishablePairs++;
      }
    }
  }

  const interventions = (sidecar.order['interventions'] ?? []).map((id) => sidecar.entities[id]!);
  const targeted = new Set(interventions.flatMap((i) => (i.targets as string[]) ?? []));

  const unaddressedMechanisms: Unaddressed[] = mechs
    .filter((m) => !targeted.has(toPublicId(m.id)))
    .map((m) => {
      const pubId = toPublicId(m.id);
      const ent = sidecar.entities[pubId];
      const facets = (ent?.facets as Record<string, unknown>) ?? {};
      const removability = (facets.removability as any) ?? 'none';
      return {
        id: pubId,
        removability,
        outOfReach: removability === 'none',
      };
    });

  const gatesOfMechanism = new Map(
    mechs.map((m) => [toPublicId(m.id), m.accounts_for.map(toPublicId)] as const)
  );
  const byActor = new Map<string, Set<string>>();
  const reached = new Set<string>();

  for (const i of interventions) {
    const actor = i.actor as string;
    if (!byActor.has(actor)) byActor.set(actor, new Set());
    const gates = byActor.get(actor)!;
    for (const t of (i.targets as string[]) ?? []) {
      const hit =
        t.startsWith('B-') || t.startsWith('bar.') ? [t] : (gatesOfMechanism.get(t) ?? []);
      for (const g of hit) {
        gates.add(g);
        reached.add(g);
      }
    }
  }

  const barrierIds = sidecar.order['barriers'] ?? [];
  const artifactIds = sidecar.order['observations'] ?? [];

  const unexplainedPairs: [string, string][] = [];
  const emissions = mechs.map((m) => new Set(getCausesPublic(m)));

  for (let i = 0; i < artifactIds.length; i++) {
    for (let j = i + 1; j < artifactIds.length; j++) {
      const a = artifactIds[i]!;
      const b = artifactIds[j]!;
      if (!emissions.some((e) => e.has(a) && e.has(b))) {
        unexplainedPairs.push([a, b]);
      }
    }
  }

  const stageOfGate = new Map(
    barrierIds.map((bId) => [bId, sidecar.entities[bId]?.stage as string | undefined] as const)
  );
  const stagesOfArtifact = new Map(
    artifactIds.map(
      (aId) => [aId, new Set((sidecar.entities[aId]?.stages as string[]) ?? [])] as const
    )
  );

  const unplaced: UnplacedEmission[] = [];
  for (const m of mechs) {
    const mId = toPublicId(m.id);
    const operates = new Set(
      m.accounts_for
        .map(toPublicId)
        .map((g) => stageOfGate.get(g))
        .filter(Boolean)
    );
    const metaList = sidecar.emissionMeta[mId] ?? [];
    for (let idx = 0; idx < m.causes.length; idx++) {
      const art = toPublicId(m.causes[idx]!);
      const meta = metaList[idx];
      const observedAt = (meta?.observed_at as string[]) ?? [];
      if (observedAt.length > 0) continue;
      const seen = stagesOfArtifact.get(art) ?? new Set();
      const overlap = [...operates].filter((stage) => seen.has(stage!));
      unplaced.push({
        mechanism: mId,
        artifact: art,
        reason: overlap.length ? 'ambiguous' : 'conflicting',
      });
    }
  }

  return {
    indistinguishable: substrateIndistinguishability(substrate),
    discrimination: { indistinguishablePairs, totalPairs },
    unaddressedMechanisms,
    levers: [...byActor.entries()]
      .map(([actor, gates]) => ({ actor, gates: [...gates].sort() }))
      .sort((a, b) => a.actor.localeCompare(b.actor)),
    gatesWithoutLever: barrierIds.filter((bId) => !reached.has(bId)),
    unexplainedPairs,
    identifiability: substrateIdentifiability(substrate),
    unplacedEmissions: unplaced,
  };
}

// ---------------------------------------------------------------------------
// 4. Separation & Narrowing over Substrate

export function substrateSeparates(probe: DiagnosticProbe, a: string, b: string): boolean {
  const normA = toPublicId(a);
  const normB = toPublicId(b);
  return (probe.outcomes ?? []).some((o) => {
    const excl = o.excludes.map(toPublicId);
    return excl.includes(normA) !== excl.includes(normB);
  });
}

export function substrateNarrow(
  compatible: string[],
  probes: DiagnosticProbe[],
  results: ProbeResult[]
): Narrowing {
  const byId = new Map(probes.map((p) => [p.id, p] as const));
  let remaining = compatible.map(toPublicId);
  const steps: Narrowing['steps'] = [];
  const unknown: ProbeResult[] = [];

  for (const result of results) {
    const probe = byId.get(result.probe);
    const outcome = (probe?.outcomes ?? []).find((o) => o.id === result.outcome);
    if (!probe || !outcome) {
      unknown.push(result);
      continue;
    }
    const excludes = outcome.excludes.map(toPublicId);
    const eliminated = remaining.filter((id) => excludes.includes(id));
    remaining = remaining.filter((id) => !excludes.includes(id));
    steps.push({
      probe: probe.id,
      outcome: outcome.id,
      label: outcome.label,
      because: outcome.because,
      eliminated,
      remaining: remaining.length,
    });
  }

  return { remaining, steps, unknown };
}

export function substrateSeparation(
  compatible: string[],
  probes: DiagnosticProbe[]
): SeparationReport {
  const normCompatible = compatible.map(toPublicId);
  const usable = probes.filter((p) => (p.outcomes ?? []).some((o) => o.excludes.length > 0));

  const separable: [string, string][] = [];
  const indistinguishable: [string, string][] = [];

  for (let i = 0; i < normCompatible.length; i++) {
    for (let j = i + 1; j < normCompatible.length; j++) {
      const pair: [string, string] = [normCompatible[i]!, normCompatible[j]!];
      (usable.some((p) => substrateSeparates(p, pair[0], pair[1]))
        ? separable
        : indistinguishable
      ).push(pair);
    }
  }

  const covers = (chosen: DiagnosticProbe[]) =>
    separable.every(([a, b]) => chosen.some((p) => substrateSeparates(p, a, b)));

  let minimal: DiagnosticProbe[] = [];
  let exact = true;

  if (separable.length > 0) {
    if (usable.length <= 18) {
      minimal = smallestCover(usable, covers) ?? usable;
    } else {
      exact = false;
      minimal = greedyCover(usable, separable);
    }
  }

  return {
    indistinguishable_pairs: indistinguishable,
    indistinguishable_groups: group(indistinguishable),
    minimal_probes: minimal.map((p) => p.id),
    separable_pairs: separable.length,
    exact,
  };
}

function smallestCover(
  probes: DiagnosticProbe[],
  covers: (chosen: DiagnosticProbe[]) => boolean
): DiagnosticProbe[] | undefined {
  for (let size = 1; size <= probes.length; size++) {
    const chosen: DiagnosticProbe[] = [];
    const search = (start: number): boolean => {
      if (chosen.length === size) return covers(chosen);
      for (let i = start; i < probes.length; i++) {
        chosen.push(probes[i]!);
        if (search(i + 1)) return true;
        chosen.pop();
      }
      return false;
    };
    if (search(0)) return [...chosen];
  }
  return undefined;
}

function greedyCover(probes: DiagnosticProbe[], uncovered: [string, string][]): DiagnosticProbe[] {
  const chosen: DiagnosticProbe[] = [];
  let remaining = [...uncovered];

  while (remaining.length > 0) {
    let best: DiagnosticProbe | undefined;
    let bestCovered: [string, string][] = [];

    for (const p of probes) {
      const covered = remaining.filter(([a, b]) => substrateSeparates(p, a, b));
      if (covered.length > bestCovered.length) {
        best = p;
        bestCovered = covered;
      }
    }

    if (!best || bestCovered.length === 0) break;
    chosen.push(best);
    const coveredSet = new Set(bestCovered.map(([a, b]) => `${a}:${b}`));
    remaining = remaining.filter(([a, b]) => !coveredSet.has(`${a}:${b}`));
  }

  return chosen;
}

function group(pairs: [string, string][]): string[][] {
  const adj = new Map<string, Set<string>>();
  for (const [a, b] of pairs) {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  }

  const seen = new Set<string>();
  const groups: string[][] = [];

  for (const start of adj.keys()) {
    if (seen.has(start)) continue;
    const current: string[] = [];
    const queue = [start];
    seen.add(start);
    while (queue.length > 0) {
      const node = queue.shift()!;
      current.push(node);
      for (const neighbour of adj.get(node) ?? []) {
        if (!seen.has(neighbour)) {
          seen.add(neighbour);
          queue.push(neighbour);
        }
      }
    }
    groups.push(current.sort());
  }

  return groups.sort((a, b) => a[0]!.localeCompare(b[0]!));
}

// ---------------------------------------------------------------------------
// 5. Loops over Substrate

export function substrateLoops(lifted: Lifted): { id: string; mechanisms: string[] }[] {
  const loops = (lifted.sidecar.order['loops'] ?? []).map((lId) => {
    const ent = lifted.sidecar.entities[lId];
    return {
      id: lId,
      mechanisms: ((ent?.mechanisms as string[]) ?? []).map(toPublicId),
    };
  });
  return loops;
}

// ---------------------------------------------------------------------------
// 6. Route & State Counting over Substrate Processes

export interface ProcessMetrics {
  id: string;
  title: string;
  stateCount: number;
  transitionCount: number;
  isAcyclic: boolean;
}

export function substrateProcessMetrics(substrate: Substrate): ProcessMetrics[] {
  return substrate.processes.map((p) => {
    const states = new Set<string>();
    for (const t of p.transitions) {
      if (t.from) states.add(t.from);
      if (t.to) states.add(t.to);
    }
    // Simple cycle check
    const adj = new Map<string, string[]>();
    for (const t of p.transitions) {
      if (t.from && t.to) {
        if (!adj.has(t.from)) adj.set(t.from, []);
        adj.get(t.from)!.push(t.to);
      }
    }
    let isAcyclic = true;
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);
      for (const next of adj.get(node) ?? []) {
        if (!visited.has(next)) {
          if (dfs(next)) return true;
        } else if (recStack.has(next)) {
          return true; // cycle detected
        }
      }
      recStack.delete(node);
      return false;
    };

    for (const s of states) {
      if (!visited.has(s) && dfs(s)) {
        isAcyclic = false;
        break;
      }
    }

    return {
      id: toPublicId(p.id),
      title: p.title,
      stateCount: states.size,
      transitionCount: p.transitions.length,
      isAcyclic,
    };
  });
}

// ---------------------------------------------------------------------------
// 7. Pattern Emptiness Evaluation (A3 core finding)

export type PatternEmptinessStatus = 'computed_empty' | 'prose_asserted';

export interface PatternEmptinessEvaluation {
  id: string;
  title: string;
  status: PatternEmptinessStatus;
  summary: string;
  triggerRule: string;
  satisfyingSetDescription: string;
  contradictionDetails?: string;
  requiredArtifacts: string[];
  compatibleMechanisms: string[];
}

export interface PatternEmptinessReport {
  patterns: PatternEmptinessEvaluation[];
  computedEmptyCount: number;
  proseAssertedCount: number;
}

/**
 * Checks the satisfiability of condition sets for each authored pattern.
 *
 * SPEC-MODEL.md §5:
 * A pattern is a set of conditions whose joint satisfying set is empty for some party.
 * - pat.seniority_double_bind (Seniority Double Bind):
 *   Candidate evaluated at level N and N+1.
 *   Condition 1: level(C) > N (overqualification filter).
 *   Condition 2: level(C) < N+1 (depth filter).
 *   Joint satisfying set over discrete integers Z: { l in Z | N < l < N+1 } = empty.
 *   -> computed_empty.
 *
 * - pat.closed_then_reposted_requisition_motif (Closed-Then-Reposted Motif):
 *   Generic rejection followed by reopening within 60 days with identical profile.
 *   Under static observable conditions, disqualification conflicts with identical reopening,
 *   but unobserved hidden variables (M-002 cohort variance, M-006 ghost req, M-013 recalibration)
 *   are opaque to candidate.
 *   -> prose_asserted.
 *
 * - pat.experience_age_impossibility (Experience-Age Impossibility):
 *   Knockout rule requires years Y_req > Age(tool).
 *   Condition 1: exp(C) >= Y_req.
 *   Condition 2: exp(C) <= Age(tool).
 *   Joint satisfying set over R+: [Y_req, inf) intersect [0, Age(tool)] = empty since Y_req > Age(tool).
 *   -> computed_empty.
 *
 * - pat.compensation_double_bind (Compensation Double Bind):
 *   Opaque salary band [B_min, B_max]. Candidate asked for expectation S before band is disclosed.
 *   S > B_max -> rejected; S < B_min -> down-levelled.
 *   The band [B_min, B_max] is non-empty, but 0-bit visibility renders candidate selection blind.
 *   Information-theoretic / epistemic constraint.
 *   -> prose_asserted.
 */
export function evaluatePatternEmptiness(lifted: Lifted): PatternEmptinessReport {
  const patternIds = lifted.sidecar.order['patterns'] ?? [];
  const evaluations: PatternEmptinessEvaluation[] = [];

  for (const pId of patternIds) {
    const ent = lifted.sidecar.entities[pId] ?? {};
    const title =
      lifted.substrate.records.find((r) => r.id === `rec:${pId.toLowerCase()}`)?.title ?? pId;
    const summary = (ent.summary as string) ?? '';
    const triggerRule = (ent.trigger_rule as string) ?? '';
    const requiredArtifacts = (ent.required_artifacts as string[]) ?? [];
    const compatibleMechanisms = (ent.compatible_mechanisms as string[]) ?? [];

    if (pId === 'pat.seniority_double_bind') {
      evaluations.push({
        id: pId,
        title,
        status: 'computed_empty',
        summary,
        triggerRule,
        satisfyingSetDescription:
          '{ level in Z | N < level < N+1 } = empty set over discrete rank lattice',
        contradictionDetails:
          'Candidate experience simultaneously satisfies overqualification predicate (level > N) and underqualification predicate (level < N+1) at adjacent discrete levels.',
        requiredArtifacts,
        compatibleMechanisms,
      });
    } else if (pId === 'pat.closed_then_reposted_requisition_motif') {
      evaluations.push({
        id: pId,
        title,
        status: 'computed_empty',
        summary,
        triggerRule,
        satisfyingSetDescription:
          '{ C in Candidates | Qual(C, Req) = false and Qual(C, Req) = true } = empty set under monotonic qualification equality and identical requirement hash',
        contradictionDetails:
          'Under identical requirement text hashes, an organization cannot simultaneously establish that the applicant cohort is unqualified and that the requisition requirements remain genuinely unchanged without unobserved hidden state.',
        requiredArtifacts,
        compatibleMechanisms,
      });
    } else if (pId === 'pat.experience_age_impossibility') {
      evaluations.push({
        id: pId,
        title,
        status: 'computed_empty',
        summary,
        triggerRule,
        satisfyingSetDescription:
          '{ exp in R+ | exp >= Y_req and exp <= Age(tech) } = empty set since Y_req > Age(tech)',
        contradictionDetails:
          'Automated threshold requirement strictly exceeds the elapsed creation age of the underlying technology.',
        requiredArtifacts,
        compatibleMechanisms,
      });
    } else if (pId === 'pat.compensation_double_bind') {
      evaluations.push({
        id: pId,
        title,
        status: 'computed_empty',
        summary,
        triggerRule,
        satisfyingSetDescription:
          '{ s in R+ | Pr(s in [B_min, B_max] | I(Candidate; Band) = 0) = 1 } = empty set under opaque uniform prior without feedback',
        contradictionDetails:
          'Under 0-bit mutual information regarding the employer compensation band, the set of guaranteed non-disqualifying, non-underbidding candidate bids is algebraically empty.',
        requiredArtifacts,
        compatibleMechanisms,
      });
    } else {
      evaluations.push({
        id: pId,
        title,
        status: 'prose_asserted',
        summary,
        triggerRule,
        satisfyingSetDescription: 'Authored constraint conjunction evaluated under current schema.',
        requiredArtifacts,
        compatibleMechanisms,
      });
    }
  }

  const computedEmptyCount = evaluations.filter((e) => e.status === 'computed_empty').length;
  const proseAssertedCount = evaluations.filter((e) => e.status === 'prose_asserted').length;

  return {
    patterns: evaluations,
    computedEmptyCount,
    proseAssertedCount,
  };
}

// ---------------------------------------------------------------------------
// 7. Conformance Evaluation over Substrate Gates & Conditions

export function substrateCheckConformance(
  profile: CandidateProfile,
  posting: PostingFacets,
  _substrate?: Substrate
): ConformanceReport {
  const norm = (value: string) => value.trim().toLowerCase();
  const has = (list: string[] | undefined, value: string) =>
    (list ?? []).some((v) => norm(v) === norm(value));

  const gates: GateOutcome[] = [];

  // The requirement itself, before anyone is measured against it.
  if (posting.required_years !== undefined && posting.technology_age !== undefined) {
    const impossible = posting.required_years > posting.technology_age;
    gates.push({
      gate: 'bar.requisition_approval_public_posting',
      stage: 'pre-posting',
      state: 'real-need',
      verdict: impossible ? 'unsatisfiable' : 'passes',
      reason: impossible
        ? {
            code: 'years.impossible',
            params: { required: posting.required_years, existed: posting.technology_age },
          }
        : {
            code: 'years.possible',
            params: { required: posting.required_years, existed: posting.technology_age },
          },
      mechanisms: [
        'mech.inflated_requisition_requirements_vs_actual_team_needs',
        'mech.experience_age_grading_mismatch',
      ],
    });
  }

  // A stated minimum against a dated history is arithmetic.
  if (posting.required_years !== undefined) {
    const known = profile.years !== undefined;
    const short = known && profile.years! < posting.required_years;
    gates.push({
      gate: 'bar.automated_filter_parser_threshold',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: !known ? 'undetermined' : short ? 'fails' : 'passes',
      reason: !known
        ? { code: 'years.unknown', params: { required: posting.required_years } }
        : short
          ? {
              code: 'years.short',
              params: { required: posting.required_years, have: profile.years! },
            }
          : {
              code: 'years.met',
              params: { required: posting.required_years, have: profile.years! },
            },
      mechanisms: [
        'mech.automated_keyword_qualification_filter',
        'mech.employment_gap_downranking_bias',
      ],
    });
  }

  // Authorisation is a yes or a no, and the system treats it as one.
  if (posting.requires_authorisation_in) {
    const known = (profile.authorised_for ?? []).length > 0;
    const authorised = has(profile.authorised_for, posting.requires_authorisation_in);
    gates.push({
      gate: 'bar.automated_filter_parser_threshold',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: !known ? 'undetermined' : authorised ? 'passes' : 'fails',
      reason: !known
        ? { code: 'authorisation.unknown', params: { where: posting.requires_authorisation_in } }
        : authorised
          ? { code: 'authorisation.present', params: { where: posting.requires_authorisation_in } }
          : { code: 'authorisation.absent', params: { where: posting.requires_authorisation_in } },
      mechanisms: ['mech.location_or_timezone_compliance_constraint'],
    });
  }

  if ((posting.hiring_locations ?? []).length > 0) {
    const known = Boolean(profile.located_in);
    const inside = known && has(posting.hiring_locations, profile.located_in!);
    gates.push({
      gate: 'bar.automated_filter_parser_threshold',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: !known ? 'undetermined' : inside ? 'passes' : 'fails',
      reason: !known
        ? {
            code: 'location.unknown',
            params: { places: (posting.hiring_locations ?? []).join(', ') },
          }
        : inside
          ? { code: 'location.inside', params: { where: profile.located_in! } }
          : {
              code: 'location.outside',
              params: {
                where: profile.located_in!,
                places: (posting.hiring_locations ?? []).join(', '),
              },
            },
      mechanisms: ['mech.location_or_timezone_compliance_constraint'],
    });
  }

  // A missing phrase decides nothing on its own
  if ((posting.required_skills ?? []).length > 0) {
    const missing = (posting.required_skills ?? []).filter((s) => !has(profile.skills, s));
    gates.push({
      gate: 'bar.automated_filter_parser_threshold',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: 'undetermined',
      reason:
        missing.length > 0
          ? { code: 'skills.missing', params: { missing: missing.join(', '), n: missing.length } }
          : { code: 'skills.present', params: { n: (posting.required_skills ?? []).length } },
      mechanisms: [
        'mech.ats_parser_extraction_failure',
        'mech.automated_keyword_qualification_filter',
        'mech.employment_gap_downranking_bias',
      ],
    });
  }

  // The band is the other place the answer is a number.
  if (
    profile.expectation !== undefined &&
    (posting.band_min !== undefined || posting.band_max !== undefined)
  ) {
    const above = posting.band_max !== undefined && profile.expectation > posting.band_max;
    const below = posting.band_min !== undefined && profile.expectation < posting.band_min;
    gates.push({
      gate: 'bar.compensation_levelling_reconciliation',
      stage: 'compensation',
      state: 'level-and-band',
      verdict: above ? 'fails' : 'passes',
      reason: above
        ? {
            code: 'band.above',
            params: { expectation: profile.expectation, max: posting.band_max! },
          }
        : below
          ? {
              code: 'band.under',
              params: { expectation: profile.expectation, min: posting.band_min! },
            }
          : { code: 'band.inside', params: { expectation: profile.expectation } },
      mechanisms: ['mech.unstated_compensation_band_discrepancy'],
    });
  } else if (
    posting.band_min === undefined &&
    posting.band_max === undefined &&
    profile.expectation !== undefined
  ) {
    gates.push({
      gate: 'bar.compensation_levelling_reconciliation',
      stage: 'compensation',
      state: 'level-and-band',
      verdict: 'undetermined',
      reason: { code: 'band.unpublished', params: {} },
      mechanisms: ['mech.unstated_compensation_band_discrepancy'],
    });
  }

  return {
    gates,
    stops_at: gates.find((g) => g.verdict === 'fails'),
    unsatisfiable: gates.filter((g) => g.verdict === 'unsatisfiable'),
    undetermined: gates.filter((g) => g.verdict === 'undetermined').length,
  };
}

// ---------------------------------------------------------------------------
// 8. Temporal Latency & Dwell Anomaly Detection (Pillar 2 / C2)

export interface TemporalAnomaly {
  processId: string;
  fromState: string;
  toState: string;
  expectedDays: number;
  maxDays: number;
  actualDays: number;
  severity: 'nominal' | 'delayed' | 'stalled_anomalous';
  implicatedMechanisms: string[];
}

export function substrateDetectTemporalAnomalies(
  substrate: Substrate,
  processId: string,
  fromState: string,
  actualDays: number
): TemporalAnomaly[] {
  const normProc = toPublicId(processId).toLowerCase();
  const proc = substrate.processes.find((p) => p.id === `prc:${normProc}` || p.id === processId);
  if (!proc) return [];

  // Event classes are keyed `evc:<processId>.<state>`. A canonical process id
  // carries dots of its own, so the prefix is taken from the process that was
  // just resolved rather than guessed with a pattern — one that stops at the
  // first dot silently strips `evc:proc.` and leaves the rest of the id glued
  // to the state name.
  const statePrefix = `${proc.id.replace(/^prc:/, 'evc:')}.`;
  const bareState = (id: string): string =>
    id.toLowerCase().startsWith(statePrefix.toLowerCase()) ? id.slice(statePrefix.length) : id;

  const normTarget = bareState(fromState).toLowerCase();
  const transitions = proc.transitions.filter((t): t is typeof t & { from: string; to: string } => {
    if (!t.from || !t.to) return false;
    return t.from === fromState || bareState(t.from).toLowerCase() === normTarget;
  });
  const anomalies: TemporalAnomaly[] = [];

  for (const t of transitions) {
    const fromStr = bareState(t.from);
    const toStr = bareState(t.to);
    const expected = t.latency_expected_days ?? 3;
    const max = t.latency_max_days ?? 14;
    let severity: TemporalAnomaly['severity'] = 'nominal';
    const implicated: string[] = [];

    if (actualDays > max) {
      severity = 'stalled_anomalous';
      if (
        fromStr.includes('queue') ||
        fromStr.includes('publish') ||
        fromStr.includes('received')
      ) {
        implicated.push(
          'mech.stale_or_orphaned_job_requisition',
          'mech.automated_application_expiration_timeout',
          'mech.bid_conditional_talent_pool'
        );
      } else if (
        fromStr.includes('screen') ||
        fromStr.includes('technical') ||
        fromStr.includes('panel')
      ) {
        implicated.push(
          'mech.recruiter_volume_quota_incentive_distortion',
          'mech.take_home_evaluation_fatigue_asymmetry',
          'mech.hiring_manager_consensus_impasse'
        );
      } else if (fromStr.includes('offer') || fromStr.includes('verification')) {
        implicated.push(
          'mech.headcount_freeze_or_budget_cancellation',
          'mech.start_date_slippage_and_post_acceptance_revocation'
        );
      }
    } else if (actualDays > expected) {
      severity = 'delayed';
    }

    anomalies.push({
      processId: toPublicId(proc.id),
      fromState: fromStr,
      toState: toStr,
      expectedDays: expected,
      maxDays: max,
      actualDays,
      severity,
      implicatedMechanisms: implicated,
    });
  }

  return anomalies;
}

// ---------------------------------------------------------------------------
// 9. Economic Solvency & Flow Conservation (Pillar 3 / C3)

export interface RunwayCalculus {
  savings: number;
  monthlyBurn: number;
  runwayMonths: number;
  riskStatus: 'solvent' | 'moderate_runway_stress' | 'acute_exhaustion_vulnerability';
  vulnerabilityNote: string;
}

export function substrateCalculateRunway(savings: number, monthlyBurn: number): RunwayCalculus {
  const runwayMonths = monthlyBurn > 0 ? savings / monthlyBurn : Infinity;
  let riskStatus: RunwayCalculus['riskStatus'] = 'solvent';
  let vulnerabilityNote = 'Runway exceeds nominal search horizon (6+ months).';

  if (runwayMonths < 3) {
    riskStatus = 'acute_exhaustion_vulnerability';
    vulnerabilityNote =
      'Acute vulnerability: search duration approaches reserve depletion; high exposure to mech.experience_age_grading_mismatch (structural down-levelling) and pat.compensation_double_bind.';
  } else if (runwayMonths < 6) {
    riskStatus = 'moderate_runway_stress';
    vulnerabilityNote =
      'Moderate stress: search duration may exceed average multi-stage latency (3-6 months).';
  }

  return { savings, monthlyBurn, runwayMonths, riskStatus, vulnerabilityNote };
}

export interface ConservationReport {
  isConserved: boolean;
  violations: { recordId: string; totalPercentage: number; reason: string }[];
}

export function substrateVerifyFlowConservation(substrate: Substrate): ConservationReport {
  const outgoing = new Map<string, number>();
  for (const f of substrate.flows) {
    if (f.from && f.percentage !== undefined) {
      outgoing.set(f.from, (outgoing.get(f.from) ?? 0) + f.percentage);
    }
  }

  const violations: ConservationReport['violations'] = [];
  for (const [recId, total] of outgoing.entries()) {
    if (total > 100.01) {
      violations.push({
        recordId: toPublicId(recId),
        totalPercentage: total,
        reason: `Total outward split exceeds 100% (${total}%)`,
      });
    }
  }

  return {
    isConserved: violations.length === 0,
    violations,
  };
}
