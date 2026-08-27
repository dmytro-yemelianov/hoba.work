/**
 * What the registry can and cannot settle about itself.
 *
 * Every other module here answers a question the reader asked. This one asks
 * the questions instead: which entities reach which, which distinctions the
 * observation vocabulary is incapable of drawing, and where a claim is missing
 * that the structure says ought to exist.
 *
 * The distinction that matters throughout: these are gaps *relative to the
 * registry's own structure*, never relative to hiring. No computation over a
 * model can report what the model never contained. A clean report here means
 * the atlas is internally complete, not that it is finished.
 */
import type { RegistryBundle, RemovabilityType } from './types.js';

/** Ids reachable from a starting entry, and the relations walked to get there. */
export interface Closure {
  id: string;
  /** Reached by following edges outward: what this entry bears on. */
  affects: string[];
  /** Reached by following edges inward: what bears on this entry. */
  affectedBy: string[];
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
}

const emissionsOf = (m: { emissions: { artifact: string }[] }): Set<string> =>
  new Set(m.emissions.map((e) => e.artifact));

const signatureOf = (m: { emissions: { artifact: string }[] }): string =>
  [...emissionsOf(m)].sort().join(',');

/**
 * Walk the graph from one entry in both directions.
 *
 * Transitive, so `affects` on a mechanism includes the observations of the
 * gates it precedes. Cycles terminate because each id is visited once.
 */
export function closure(bundle: RegistryBundle, id: string): Closure {
  const out = new Map<string, string[]>();
  const inn = new Map<string, string[]>();
  const link = (from: string, to: string) => {
    if (!out.has(from)) out.set(from, []);
    out.get(from)!.push(to);
    if (!inn.has(to)) inn.set(to, []);
    inn.get(to)!.push(from);
  };

  for (const b of bundle.barriers) for (const next of b.precedes) link(b.id, next);
  for (const m of bundle.mechanisms) {
    for (const g of m.operates_at) link(m.id, g);
    for (const e of m.emissions) link(m.id, e.artifact);
    for (const a of m.amplifies) link(m.id, a);
    for (const k of m.masks) link(m.id, k);
  }
  for (const p of bundle.patterns) {
    for (const a of p.required_artifacts) link(p.id, a);
    for (const m of p.compatible_mechanisms) link(p.id, m);
  }
  for (const l of bundle.loops) for (const m of l.mechanisms) link(l.id, m);
  for (const i of bundle.interventions) for (const t of i.targets) link(i.id, t);

  /**
   * Transitive, not reflexive: the entry appears in its own closure only when
   * a cycle genuinely returns to it, which is a fact worth seeing rather than
   * an artefact worth suppressing.
   */
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

  return { id, affects: walk(out), affectedBy: walk(inn) };
}

/**
 * Group mechanisms by the observations they emit.
 *
 * Only groups of two or more are returned; a mechanism with a unique signature
 * is separable in principle and needs no reporting.
 */
export function indistinguishability(bundle: RegistryBundle): Indistinguishable[] {
  const bySignature = new Map<string, string[]>();
  for (const m of bundle.mechanisms) {
    const key = signatureOf(m);
    if (!bySignature.has(key)) bySignature.set(key, []);
    bySignature.get(key)!.push(m.id);
  }
  return [...bySignature.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([key, ids]) => ({ signature: key ? key.split(',') : [], mechanisms: ids }))
    .sort((a, b) => a.mechanisms[0]!.localeCompare(b.mechanisms[0]!));
}

/** Everything above, computed over one bundle. */
export function gaps(bundle: RegistryBundle): GapReport {
  const { mechanisms, artifacts, barriers, interventions } = bundle;

  let indistinguishablePairs = 0;
  let totalPairs = 0;
  for (let i = 0; i < mechanisms.length; i++) {
    for (let j = i + 1; j < mechanisms.length; j++) {
      totalPairs++;
      if (signatureOf(mechanisms[i]!) === signatureOf(mechanisms[j]!)) indistinguishablePairs++;
    }
  }

  const targeted = new Set(interventions.flatMap((i) => i.targets));
  const unaddressedMechanisms: Unaddressed[] = mechanisms
    .filter((m) => !targeted.has(m.id))
    .map((m) => ({
      id: m.id,
      removability: m.facets.removability,
      outOfReach: m.facets.removability === 'none',
    }));

  // An intervention reaches a gate directly, or through a mechanism operating there.
  const gatesOfMechanism = new Map(mechanisms.map((m) => [m.id, m.operates_at] as const));
  const byActor = new Map<string, Set<string>>();
  const reached = new Set<string>();
  for (const i of interventions) {
    if (!byActor.has(i.actor)) byActor.set(i.actor, new Set());
    const gates = byActor.get(i.actor)!;
    for (const t of i.targets) {
      const hit = t.startsWith('B-') ? [t] : (gatesOfMechanism.get(t) ?? []);
      for (const g of hit) {
        gates.add(g);
        reached.add(g);
      }
    }
  }

  const unexplainedPairs: [string, string][] = [];
  const emission = mechanisms.map(emissionsOf);
  for (let i = 0; i < artifacts.length; i++) {
    for (let j = i + 1; j < artifacts.length; j++) {
      const a = artifacts[i]!.id;
      const b = artifacts[j]!.id;
      if (!emission.some((e) => e.has(a) && e.has(b))) unexplainedPairs.push([a, b]);
    }
  }

  return {
    indistinguishable: indistinguishability(bundle),
    discrimination: { indistinguishablePairs, totalPairs },
    unaddressedMechanisms,
    levers: [...byActor.entries()]
      .map(([actor, gates]) => ({ actor, gates: [...gates].sort() }))
      .sort((a, b) => a.actor.localeCompare(b.actor)),
    gatesWithoutLever: barriers.filter((b) => !reached.has(b.id)).map((b) => b.id),
    unexplainedPairs,
  };
}
