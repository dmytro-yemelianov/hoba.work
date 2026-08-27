import { describe, expect, it } from 'vitest';
import { closure, gaps, indistinguishability } from '@hoba/registry';
import { artifact, barrier, intervention, makeBundle, mechanism } from './helpers';
import { findRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

const emits = (...ids: string[]) =>
  ids.map((artifactId) => ({ artifact: artifactId, evidence: [], fidelity: 'direct' as const, likelihood: 'high' as const }));

describe('closure', () => {
  it('is transitive through the gate order', () => {
    const bundle = makeBundle({
      barriers: [
        barrier({ id: 'B-001', order: 1, precedes: ['B-002'] }),
        barrier({ id: 'B-002', order: 2, precedes: ['B-003'] }),
        barrier({ id: 'B-003', order: 3 }),
      ],
      mechanisms: [mechanism({ id: 'M-001', operates_at: ['B-001'], emissions: emits('A-001') })],
      loops: [],
      patterns: [],
      interventions: [],
    });

    // The mechanism operates at the first gate, so every later gate is downstream of it.
    expect(closure(bundle, 'M-001').affects).toEqual(['A-001', 'B-001', 'B-002', 'B-003']);
  });

  it('reports the inverse direction and excludes the entry itself', () => {
    const bundle = makeBundle({
      barriers: [barrier({ id: 'B-001', order: 1 })],
      mechanisms: [mechanism({ id: 'M-001', operates_at: ['B-001'], emissions: emits('A-001') })],
      interventions: [intervention({ id: 'I-001', targets: ['M-001'] })],
      loops: [],
      patterns: [],
    });

    // Not B-001: `operates_at` runs mechanism -> gate, so the gate is where
    // M-001 acts, not something that bears on what M-001 emits.
    expect(closure(bundle, 'A-001').affectedBy).toEqual(['I-001', 'M-001']);
    expect(closure(bundle, 'M-001').affects).not.toContain('M-001');
  });

  it('terminates on a cycle', () => {
    const bundle = makeBundle({
      barriers: [
        barrier({ id: 'B-001', order: 1, precedes: ['B-002'] }),
        barrier({ id: 'B-002', order: 2, precedes: ['B-001'] }),
      ],
      mechanisms: [],
      loops: [],
      patterns: [],
      interventions: [],
    });

    expect(closure(bundle, 'B-001').affects).toEqual(['B-001', 'B-002']);
  });
});

describe('indistinguishability', () => {
  it('groups mechanisms that emit the same observations, ignoring order', () => {
    const bundle = makeBundle({
      artifacts: [artifact({ id: 'A-001' }), artifact({ id: 'A-002' })],
      mechanisms: [
        mechanism({ id: 'M-001', emissions: emits('A-001', 'A-002') }),
        mechanism({ id: 'M-002', emissions: emits('A-002', 'A-001') }),
        mechanism({ id: 'M-003', emissions: emits('A-001') }),
      ],
      loops: [],
      patterns: [],
      interventions: [],
    });

    const classes = indistinguishability(bundle);
    // M-003 emits a strict subset, which is still a distinction — only exact ties group.
    expect(classes).toEqual([{ signature: ['A-001', 'A-002'], mechanisms: ['M-001', 'M-002'] }]);
  });

  it('says nothing when every signature is unique', () => {
    const bundle = makeBundle({
      artifacts: [artifact({ id: 'A-001' }), artifact({ id: 'A-002' })],
      mechanisms: [
        mechanism({ id: 'M-001', emissions: emits('A-001') }),
        mechanism({ id: 'M-002', emissions: emits('A-002') }),
      ],
      loops: [],
      patterns: [],
      interventions: [],
    });

    expect(indistinguishability(bundle)).toEqual([]);
  });
});

describe('gaps', () => {
  it('separates a mechanism nobody can move from one nobody has addressed', () => {
    const bundle = makeBundle({
      mechanisms: [
        mechanism({ id: 'M-001', facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'none' } }),
        mechanism({ id: 'M-002', facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'candidate' } }),
      ],
      loops: [],
      patterns: [],
      interventions: [],
    });

    expect(gaps(bundle).unaddressedMechanisms).toEqual([
      { id: 'M-001', removability: 'none', outOfReach: true },
      { id: 'M-002', removability: 'candidate', outOfReach: false },
    ]);
  });

  it('credits an actor with a gate reached through a mechanism, not only directly', () => {
    const bundle = makeBundle({
      barriers: [barrier({ id: 'B-001', order: 1 }), barrier({ id: 'B-002', order: 2 })],
      mechanisms: [mechanism({ id: 'M-001', operates_at: ['B-002'] })],
      interventions: [intervention({ id: 'I-001', actor: 'recruiter-process', targets: ['M-001'] })],
      loops: [],
      patterns: [],
    });

    const report = gaps(bundle);
    expect(report.levers).toEqual([{ actor: 'recruiter-process', gates: ['B-002'] }]);
    expect(report.gatesWithoutLever).toEqual(['B-001']);
  });
});

describe('the published registry', () => {
  const bundle = loadRegistryFromRoot(findRegistryRoot(REPO_ROOT)!, 'en');
  const report = gaps(bundle);

  it('has a lever at every gate', () => {
    expect(report.gatesWithoutLever).toEqual([]);
  });

  it('leaves an intervention gap only where the registry admits one', () => {
    // A mechanism with no proposed change is only defensible when the atlas
    // also says no named actor holds a lever. Anything else is an omission,
    // and this test is what stops it being described as a finding.
    const omissions = report.unaddressedMechanisms.filter((m) => !m.outOfReach);
    expect(omissions.map((m) => m.id)).toEqual(['M-008', 'M-014', 'M-015', 'M-018']);
  });

  it('cannot separate every mechanism by observation, and says which', () => {
    // Half the catalogue sits in one of these classes. This is why the
    // protocol's probes narrow nothing: the vocabulary has no term for the
    // difference. Growing the number is a regression in diagnostic power.
    const grouped = report.indistinguishable.flatMap((c) => c.mechanisms);
    expect(report.indistinguishable.length).toBeLessThanOrEqual(5);
    expect(grouped.length).toBeLessThanOrEqual(12);
  });
});
