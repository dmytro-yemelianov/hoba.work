import { describe, expect, it } from 'vitest';
import { agencyZones, loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';
import { actor, intervention, makeBundle, mechanism } from './helpers';

/**
 * Three actors with the full vocabulary crosswalk the real registry declares:
 * a facet name and an intervention-actor name that both resolve back to them.
 */
const ACTORS = [
  actor({
    id: 'actor.candidate',
    slug: 'candidate',
    aliases: { facet: ['candidate'], intervention: ['candidate-action'] },
  }),
  actor({
    id: 'actor.recruiter',
    slug: 'recruiter',
    aliases: { facet: ['recruiter'], intervention: ['recruiter-process'] },
  }),
  actor({
    id: 'actor.employer_policy',
    slug: 'employer-policy',
    aliases: { facet: ['policy'], intervention: ['employer-policy'] },
  }),
];

const bundleWith = (
  m: Parameters<typeof mechanism>[0],
  interventions: Parameters<typeof intervention>[0][] = []
) =>
  makeBundle({
    actors: ACTORS,
    mechanisms: [mechanism({ honest_baseline: true, operates_at: ['B-001'], ...m })],
    interventions: interventions.map((i) => intervention(i)),
    patterns: [],
  });

describe('agencyZones', () => {
  it('gives an actor who can enact an intervention against the mechanism the highest zone', () => {
    const bundle = bundleWith(
      {
        id: 'M-100',
        facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'none' },
      },
      [{ id: 'I-100', targets: ['M-100'], actor: 'recruiter-process' }]
    );
    expect(agencyZones(bundle, 'M-100').recruiter).toBe('high');
  });

  it('gives the actor whose own force the mechanism is the middle zone', () => {
    const bundle = bundleWith({
      id: 'M-100',
      facets: { actor: 'recruiter', nature: 'rule', visibility: 'opaque', removability: 'none' },
    });
    expect(agencyZones(bundle, 'M-100').recruiter).toBe('medium');
  });

  it('reads removability as a statement about the candidate specifically', () => {
    const bundle = bundleWith({
      id: 'M-100',
      facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'candidate' },
    });
    expect(agencyZones(bundle, 'M-100').candidate).toBe('medium');
  });

  it('gives an actor who can only see the mechanism the lowest zone', () => {
    const bundle = bundleWith({
      id: 'M-100',
      facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'none' },
      perspectives: [{ actor: 'actor.employer_policy', sees: 'a', reads: 'b', does: 'c' }],
    });
    expect(agencyZones(bundle, 'M-100')['employer-policy']).toBe('low');
  });

  it('omits an actor with no declared relationship to the mechanism at all', () => {
    const bundle = bundleWith({
      id: 'M-100',
      facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'none' },
    });
    expect(agencyZones(bundle, 'M-100')).toEqual({});
  });

  it('takes the strongest claim when several rules apply to one actor', () => {
    const bundle = bundleWith(
      {
        id: 'M-100',
        facets: { actor: 'recruiter', nature: 'rule', visibility: 'opaque', removability: 'none' },
        perspectives: [{ actor: 'actor.recruiter', sees: 'a', reads: 'b', does: 'c' }],
      },
      [{ id: 'I-100', targets: ['M-100'], actor: 'recruiter-process' }]
    );
    // seeing it (low) and owning it (medium) both apply, but a lever outranks both.
    expect(agencyZones(bundle, 'M-100').recruiter).toBe('high');
  });

  it('returns nothing for an id that is not a mechanism', () => {
    expect(agencyZones(bundleWith({ id: 'M-100' }), 'M-404')).toEqual({});
  });
});

describe('agencyZones over the real registry', () => {
  const bundle = loadRegistryFromRoot(resolveRegistryRoot(), 'en');

  it('says something about every mechanism, keyed by actor slug', () => {
    const slugs = new Set(bundle.actors.map((a) => a.slug));
    for (const m of bundle.mechanisms) {
      const zones = agencyZones(bundle, m.id);
      expect(Object.keys(zones).length, m.id).toBeGreaterThan(0);
      for (const [k, v] of Object.entries(zones)) {
        expect(slugs.has(k), `${m.id}: ${k}`).toBe(true);
        expect(['low', 'medium', 'high']).toContain(v);
      }
    }
  });

  it('coexists with removability rather than replacing it — DoD 6', () => {
    for (const m of bundle.mechanisms) {
      expect(m.facets.removability).toBeDefined();
      expect(agencyZones(bundle, m.id)).toBeDefined();
    }
  });

  it('finds at least one actor with a real lever somewhere in the registry', () => {
    const anyHigh = bundle.mechanisms.some((m) =>
      Object.values(agencyZones(bundle, m.id)).includes('high')
    );
    expect(anyHigh).toBe(true);
  });
});
