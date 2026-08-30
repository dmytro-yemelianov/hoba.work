import { HOBAKnowledgeGraph } from '@hoba/graph/graph';
import { PROVING_EVIDENCE_KINDS, READER_FACING_TYPES } from '@hoba/registry-core/schemas';
import { nodesOfTypes } from '@hoba/registry-core/types';
import type { RegistryBundle, RegistryNode } from '@hoba/registry-core/types';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: ValidationSeverity;
  /** Stable machine-readable rule identifier. */
  rule: string;
  nodeId?: string;
  message: string;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  ok: boolean;
}

/** Everything a reader meets, plus records: the types that carry claims. */
const allNodes = (bundle: RegistryBundle): RegistryNode[] =>
  nodesOfTypes(bundle, [...READER_FACING_TYPES, 'record']) as RegistryNode[];

/**
 * Referential-integrity and editorial rules for a loaded bundle (spec §23).
 *
 * Errors break the build. Warnings surface content inconsistencies that need an
 * editorial decision but do not make the graph unusable.
 */
export function validateRegistryBundle(bundle: RegistryBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (rule: string, message: string, nodeId?: string) =>
    issues.push({ severity: 'error', rule, nodeId, message });
  const warning = (rule: string, message: string, nodeId?: string) =>
    issues.push({ severity: 'warning', rule, nodeId, message });

  const nodes = allNodes(bundle);
  const nodeById = new Map<string, RegistryNode>();

  // 1. Unique IDs across all node collections (and evidence).
  for (const n of nodes) {
    if (nodeById.has(n.id)) error('duplicate-id', `Duplicate ID detected: ${n.id}`, n.id);
    nodeById.set(n.id, n);
  }
  const evidenceIds = new Set<string>();
  for (const e of bundle.evidence) {
    if (evidenceIds.has(e.id)) error('duplicate-id', `Duplicate evidence ID detected: ${e.id}`, e.id);
    evidenceIds.add(e.id);
  }

  const barrierIds = new Set(bundle.barriers.map((b) => b.id));
  const artifactIds = new Set(bundle.observations.map((a) => a.id));
  const mechanismIds = new Set(bundle.mechanisms.map((m) => m.id));
  const patternById = new Map(bundle.patterns.map((p) => [p.id, p]));
  const loopById = new Map(bundle.loops.map((l) => [l.id, l]));
  const interventionById = new Map(bundle.interventions.map((i) => [i.id, i]));

  const requireRef = (owner: string, field: string, ref: string, pool: Set<string>, label: string) => {
    if (!pool.has(ref)) error('dangling-reference', `${field} references unknown ${label}: ${ref}`, owner);
  };

  // 2. Evidence references and lifecycle fields on every node.
  for (const n of nodes) {
    for (const e of n.evidence_ids) requireRef(n.id, 'evidence_ids', e, evidenceIds, 'evidence record');

    if (n.superseded_by !== undefined) {
      if (!nodeById.has(n.superseded_by)) {
        error('dangling-reference', `superseded_by references unknown node: ${n.superseded_by}`, n.id);
      } else if (n.superseded_by === n.id) {
        error('lifecycle', 'Node cannot supersede itself', n.id);
      }
      if (n.status !== 'deprecated') {
        error('lifecycle', `Node declares superseded_by but status is "${n.status}" (expected "deprecated")`, n.id);
      }
    }
  }

  // 2b. Authored records.
  const recordIds = new Set((bundle.records ?? []).map((r) => r.id));
  const actorIds = new Set(bundle.actors.map((a) => a.id));
  for (const r of bundle.records ?? []) {
    if (r.owner_actor) requireRef(r.id, 'owner_actor', r.owner_actor, actorIds, 'actor');
    for (const f of r.flows) {
      requireRef(r.id, 'flows.to', f.to, recordIds, 'record');
      if (f.amount) {
        for (const ev of f.amount.evidence) requireRef(r.id, 'flows.amount.evidence', ev, evidenceIds, 'evidence record');
      }
    }
  }

  // 3. Barriers: funnel ordering.
  const seenOrders = new Map<number, string>();
  for (const b of bundle.barriers) {
    const prev = seenOrders.get(b.order);
    if (prev) error('barrier-order', `Barrier order ${b.order} is shared with ${prev}`, b.id);
    seenOrders.set(b.order, b.id);

    for (const next of b.precedes) {
      requireRef(b.id, 'precedes', next, barrierIds, 'barrier');
      const nb = bundle.barriers.find((x) => x.id === next);
      if (nb && nb.order <= b.order) {
        error('barrier-order', `precedes ${next} (order ${nb.order}) but has order ${b.order}; funnel order must increase`, b.id);
      }
    }
  }

  // 4. Mechanisms.
  let hasHonestBaseline = false;
  for (const m of bundle.mechanisms) {
    if (m.honest_baseline && m.status === 'active') hasHonestBaseline = true;
    for (const bid of m.operates_at) requireRef(m.id, 'operates_at', bid, barrierIds, 'barrier');

    const emitted = new Set<string>();
    for (const em of m.emissions) {
      requireRef(m.id, 'emissions', em.artifact, artifactIds, 'observation');
      if (emitted.has(em.artifact)) error('duplicate-edge', `Artifact ${em.artifact} is listed twice in emissions`, m.id);
      emitted.add(em.artifact);
      for (const e of em.evidence) requireRef(m.id, `emissions[${em.artifact}].evidence`, e, evidenceIds, 'evidence record');
    }
    for (const amp of m.amplifies) {
      requireRef(m.id, 'amplifies', amp, mechanismIds, 'mechanism');
      if (amp === m.id) error('self-reference', 'Mechanism cannot amplify itself', m.id);
    }
    for (const mask of m.masks) {
      requireRef(m.id, 'masks', mask, mechanismIds, 'mechanism');
      if (mask === m.id) error('self-reference', 'Mechanism cannot mask itself', m.id);
    }
  }

  if (!hasHonestBaseline) {
    error(
      'honest-baseline',
      'Preservation Rule Violation: Registry must include at least one active honest-baseline mechanism (honest_baseline: true)'
    );
  }

  // 5. Patterns.
  for (const p of bundle.patterns) {
    for (const aid of p.required_artifacts) requireRef(p.id, 'required_artifacts', aid, artifactIds, 'artifact');
    for (const mid of p.compatible_mechanisms) requireRef(p.id, 'compatible_mechanisms', mid, mechanismIds, 'mechanism');
    for (const iid of p.interventions) {
      const intervention = interventionById.get(iid);
      if (!intervention) {
        error('dangling-reference', `interventions references unknown intervention: ${iid}`, p.id);
      } else if (!intervention.targets.includes(p.id)) {
        warning('reciprocity', `lists intervention ${iid}, but ${iid}.targets does not include ${p.id}`, p.id);
      }
    }
  }

  // 6. Loops: edges must be declared on the mechanisms themselves (spec §4.6:
  //    "Loops are validated from graph SCCs and cannot exist only as editorial prose").
  for (const l of bundle.loops) {
    const members = new Set(l.mechanisms);
    for (const mid of l.mechanisms) requireRef(l.id, 'mechanisms', mid, mechanismIds, 'mechanism');
    for (const ep of l.entry_points) {
      if (!members.has(ep)) error('loop-membership', `entry_point ${ep} is not in the loop's mechanisms list`, l.id);
    }
    for (const edge of l.edges) {
      if (!members.has(edge.from) || !members.has(edge.to)) {
        error('loop-membership', `edge ${edge.from} -> ${edge.to} references a mechanism outside the loop's mechanisms list`, l.id);
        continue;
      }
      const from = bundle.mechanisms.find((m) => m.id === edge.from);
      if (from) {
        const declared = edge.relation === 'amplifies' ? from.amplifies : from.masks;
        if (!declared.includes(edge.to)) {
          warning(
            'undeclared-loop-edge',
            `edge "${edge.from} ${edge.relation} ${edge.to}" is not declared on ${edge.from} (${edge.relation}: [${declared.join(', ')}]); the loop is editorial prose until the mechanism declares it`,
            l.id
          );
        }
      }
    }
    for (const iid of l.interventions) {
      const intervention = interventionById.get(iid);
      if (!intervention) {
        error('dangling-reference', `interventions references unknown intervention: ${iid}`, l.id);
      } else if (!intervention.targets.includes(l.id)) {
        warning('reciprocity', `lists intervention ${iid}, but ${iid}.targets does not include ${l.id}`, l.id);
      }
    }
  }

  // 7. Interventions.
  for (const i of bundle.interventions) {
    for (const target of i.targets) {
      if (!nodeById.has(target)) {
        error('dangling-reference', `targets references unknown entity: ${target}`, i.id);
        continue;
      }
      const pattern = patternById.get(target);
      if (pattern && !pattern.interventions.includes(i.id)) {
        warning('reciprocity', `targets ${target}, but ${target}.interventions does not list ${i.id}`, i.id);
      }
      const loop = loopById.get(target);
      if (loop && !loop.interventions.includes(i.id)) {
        warning('reciprocity', `targets ${target}, but ${target}.interventions does not list ${i.id}`, i.id);
      }
    }
  }

  // 8. The proven tier is earned, not authored (design doc §6). A claim may not
  //    stand at `proven` without at least one linked evidence record whose kind
  //    is `primary` or `research` — so a tier is never jumped without the
  //    evidence for the jump. Every weaker tier is left alone: this rule is
  //    about the strongest claim the registry can make, not about evidence
  //    coverage in general.
  const evidenceKindById = new Map(bundle.evidence.map((e) => [e.id, e.kind]));
  const proving = new Set<string>(PROVING_EVIDENCE_KINDS);
  for (const n of nodes) {
    const claim = (n as { evidence_level?: string }).evidence_level;
    if (claim !== 'proven') continue;
    const linked = (n as { evidence_ids?: string[] }).evidence_ids ?? [];
    if (linked.some((id) => proving.has(evidenceKindById.get(id) ?? ''))) continue;
    error(
      'unsupported-claim',
      `is authored as "proven" but links no evidence of kind ${PROVING_EVIDENCE_KINDS.map((k) => `"${k}"`).join(' or ')}` +
        (linked.length ? ` (has: ${linked.join(', ')})` : ' (has none)'),
      n.id
    );
  }

  // 9. Every evidence record earns its place. A source nobody cites is either
  //    a link someone forgot to make or weight the registry is carrying for
  //    nothing — and the first is the common case: Rev. Proc. 2025-28 sat
  //    unused while an era's prose made two claims that came from it. A
  //    warning, not an error, because authoring a source ahead of the entry
  //    that will cite it is legitimate; `--strict` is what makes it stop.
  //    Gathered from every collection that can carry a citation, not from
  //    `allNodes`, which covers only the claim-bearing types — eras, processes
  //    and actors all have `evidence_ids` that nothing has been reading.
  const citedEvidence = new Set<string>();
  const citing = [...nodes, ...bundle.eras, ...bundle.processes, ...bundle.actors];
  for (const n of citing) for (const id of (n as { evidence_ids?: string[] }).evidence_ids ?? []) citedEvidence.add(id);
  for (const e of bundle.eras) for (const i of e.indicators) citedEvidence.add(i.evidence);
  for (const m of bundle.mechanisms) for (const em of m.emissions) for (const id of em.evidence ?? []) citedEvidence.add(id);
  for (const e of bundle.evidence) {
    if (!citedEvidence.has(e.id)) warning('unused-evidence', 'is cited by no entry in the registry', e.id);
  }

  // 10. Every active mechanism must be targeted by some intervention. The atlas
  //    answers "here is what produces it" and then "here is what would change
  //    it"; a mechanism nothing targets stops at the first half, which reads as
  //    a finding that nothing can be done. Sometimes that is true — three of
  //    these are `removability: none` — but then the honest intervention is
  //    disclosure, not removal, and it still has to be written. Seven were
  //    uncovered when this rule was added, and each one turned out to have an
  //    intervention available; none of them was a case of nothing to say.
  const targeted = new Set<string>();
  for (const i of bundle.interventions) for (const t of i.targets) targeted.add(t);
  for (const m of bundle.mechanisms) {
    if (m.status === 'active' && !targeted.has(m.id)) {
      warning('mechanisms', 'is targeted by no intervention, so the atlas explains it without saying what would change it', m.id);
    }
  }

  // 10. Every observation must be emitted by some mechanism. The atlas exists to
  //    answer "you saw this — here is what produces it", so an observation no
  //    mechanism emits is the one entry that cannot keep that promise: a reader
  //    who recognises their own rejection in it arrives at a dead end. Nothing
  //    said so, and one had been sitting there. A warning rather than an error,
  //    because writing the trace before the mechanism that explains it is how
  //    the registry actually grows; `--strict` is what makes it stop.
  const emittedObservations = new Set<string>();
  for (const m of bundle.mechanisms) for (const em of m.emissions) emittedObservations.add(em.artifact);
  for (const a of bundle.observations) {
    if (!emittedObservations.has(a.id)) {
      warning('emissions', 'is emitted by no mechanism, so the atlas shows it without explaining it', a.id);
    }
  }

  // 10. Diagnostic probes must be globally unique (the engine de-duplicates by probe ID).
  const probeOwners = new Map<string, string>();
  for (const a of bundle.observations) {
    for (const p of a.probes) {
      const owner = probeOwners.get(p.id);
      if (owner) error('duplicate-id', `Probe ${p.id} is also defined on ${owner}`, a.id);
      probeOwners.set(p.id, a.id);
    }
  }

  return issues;
}

/**
 * Full validation pipeline: referential rules + barrier DAG acyclicity.
 * Barrier cycles are only checked when no barrier references dangle.
 */
export function validateRegistry(bundle: RegistryBundle): ValidationReport {
  const issues = validateRegistryBundle(bundle);

  const hasBarrierRefErrors = issues.some(
    (i) => i.severity === 'error' && i.rule === 'dangling-reference' && (i.nodeId?.startsWith('B-') || i.nodeId?.startsWith('bar.'))
  );
  if (!hasBarrierRefErrors) {
    const dag = new HOBAKnowledgeGraph(bundle).validateBarrierDAG();
    if (!dag.valid) issues.push({ severity: 'error', rule: 'barrier-cycle', message: dag.error ?? 'Barrier graph contains a cycle' });
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  return { issues, errors, warnings, ok: errors.length === 0 };
}

export function formatValidationIssue(issue: ValidationIssue): string {
  return `[${issue.severity.toUpperCase()}] ${issue.nodeId ? `(${issue.nodeId}) ` : ''}${issue.message} [${issue.rule}]`;
}

/** Fields whose values are expected to differ between language mirrors. */
const TRANSLATABLE_FIELDS = new Set([
  'title',
  'summary',
  'description',
  'pass_condition',
  'trigger_rule',
  'establishes',
  'non_inferences',
  'expected_effects',
  'content',
]);

function structuralProjection(node: RegistryNode): string {
  const projected: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (TRANSLATABLE_FIELDS.has(key)) continue;
    if (key === 'probes' && Array.isArray(value)) {
      // Probe text is translatable; the probe identity and cost are structural.
      projected[key] = value.map((p: { id: string; cost: string; removability_target?: string }) => ({
        id: p.id,
        cost: p.cost,
        removability_target: p.removability_target,
      }));
      continue;
    }
    projected[key] = value;
  }
  return JSON.stringify(projected, Object.keys(projected).sort());
}

/**
 * Check that a translated mirror has exactly the same IDs and graph structure as
 * the canonical bundle (spec §21: "IDs and graph structure never change by language").
 */
export function compareBundleStructure(canonical: RegistryBundle, mirror: RegistryBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const mirrorById = new Map(allNodes(mirror).map((n) => [n.id, n]));
  const canonicalIds = new Set<string>();

  for (const node of allNodes(canonical)) {
    canonicalIds.add(node.id);
    const twin = mirrorById.get(node.id);
    if (!twin) {
      issues.push({ severity: 'error', rule: 'mirror-missing', nodeId: node.id, message: `Node ${node.id} is missing from the mirror` });
      continue;
    }
    if (structuralProjection(node) !== structuralProjection(twin)) {
      issues.push({
        severity: 'error',
        rule: 'mirror-drift',
        nodeId: node.id,
        message: `Structural fields of ${node.id} differ between canonical content and the mirror`,
      });
    }
  }

  for (const id of mirrorById.keys()) {
    if (!canonicalIds.has(id)) {
      issues.push({ severity: 'error', rule: 'mirror-extra', nodeId: id, message: `Node ${id} exists only in the mirror` });
    }
  }

  return issues;
}
