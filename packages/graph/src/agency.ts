/**
 * Per-actor agency over a mechanism (design doc §6, DoD 6).
 *
 * §6 describes `agency_zones` as an authored field. It is derived instead,
 * because the registry already declares everything such a field would encode,
 * and `PLAN-SUBSTRATE.md`'s founding principle is that the substrate is
 * computed before it is authored — authoring changes only where the types
 * cannot say the thing. Here they can. Hand-rating 28 mechanisms against every
 * actor would also be asserting 100-odd impact claims no evidence backs, which
 * is the one thing this registry is built not to do.
 *
 * Three declared signals, strongest first. The highest that applies wins.
 *
 *   high    The actor can enact an intervention that targets this mechanism.
 *           A published lever is the least ambiguous form of agency there is.
 *   medium  The mechanism is the actor's own force — `facets.actor` resolves
 *           to them — or `facets.removability` names them as able to remove it.
 *           They can change it by changing what they do, without an
 *           intervention existing yet.
 *   low     The actor holds a perspective on it: the mechanism is visible from
 *           where they sit, and nothing more.
 *
 * An actor with none of the three is absent rather than scored `low`, so the
 * map says "no declared relationship" instead of "no power", which are
 * different claims.
 *
 * This coexists with `facets.removability` and replaces nothing: removability
 * is what the Lean proofs and the UI badges key off, and it is one of the
 * inputs here rather than a competitor to the output.
 */
import type { RegistryBundle, ActorNode, MechanismNode } from '@hoba/registry-core/types';

/**
 * How much purchase one actor has on one mechanism.
 *
 * Named `AgencyLevel`, not `AgencyZone`: the registry already has an
 * `AgencyZone` and it answers a different question — whether a situation's
 * causes sit inside or outside the candidate's control
 * (endogenous/exogenous/mixed). This is a per-actor magnitude, not that.
 */
export type AgencyLevel = 'low' | 'medium' | 'high';

const RANK: Record<AgencyLevel, number> = { low: 0, medium: 1, high: 2 };

/** Actor slug → the actor, indexed by every vocabulary that resolves to them. */
function crosswalk(actors: readonly ActorNode[]) {
  const byFacet = new Map<string, string>();
  const byIntervention = new Map<string, string>();
  const byId = new Map<string, string>();
  for (const a of actors) {
    byId.set(a.id, a.slug);
    const aliases = a.aliases as { facet?: string[]; intervention?: string[] } | undefined;
    for (const f of aliases?.facet ?? []) byFacet.set(f, a.slug);
    for (const i of aliases?.intervention ?? []) byIntervention.set(i, a.slug);
  }
  return { byFacet, byIntervention, byId };
}

export function agencyZones(bundle: RegistryBundle, mechanismId: string): Record<string, AgencyLevel> {
  const mechanism = bundle.mechanisms.find((m) => m.id === mechanismId) as MechanismNode | undefined;
  if (!mechanism) return {};

  const { byFacet, byIntervention, byId } = crosswalk(bundle.actors);
  const zones: Record<string, AgencyLevel> = {};
  const claim = (slug: string | undefined, zone: AgencyLevel) => {
    if (!slug) return;
    const held = zones[slug];
    if (held === undefined || RANK[zone] > RANK[held]) zones[slug] = zone;
  };

  // low — it is visible from where they sit.
  for (const p of mechanism.perspectives) claim(byId.get(p.actor), 'low');

  // medium — it is their own force, or theirs to remove.
  claim(byFacet.get(mechanism.facets.actor), 'medium');
  if (mechanism.facets.removability === 'candidate') {
    claim([...byId.values()].find((s) => s === 'candidate'), 'medium');
  }

  // high — they hold a published lever against it.
  for (const i of bundle.interventions) {
    if (!i.targets.includes(mechanismId)) continue;
    claim(byIntervention.get(i.actor), 'high');
  }

  return zones;
}
