import { describe, expect, it } from 'vitest';
import { closure, gaps, identifiability, indistinguishability } from '@hoba/registry';
import { artifact, barrier, intervention, makeBundle, mechanism } from './helpers';
import { findRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

const emits = (...ids: string[]) =>
  ids.map((artifactId) => ({ artifact: artifactId, evidence: [], observed_at: [], fidelity: 'direct' as const, likelihood: 'high' as const }));

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

it('separates the one-step neighbours from what is only reached through them', () => {
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

    const out = closure(bundle, 'M-001');
    expect(out.directAffects).toEqual(['A-001', 'B-001']);
    // B-002 and B-003 are downstream of the gate, not of the mechanism.
    expect(out.affects.filter((id) => !out.directAffects.includes(id))).toEqual(['B-002', 'B-003']);
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

describe('identifiability', () => {
  it('calls a mechanism never-alone when another emits everything it does', () => {
    const bundle = makeBundle({
      artifacts: [artifact({ id: 'A-001' }), artifact({ id: 'A-002' })],
      mechanisms: [
        mechanism({ id: 'M-001', emissions: emits('A-001') }),
        mechanism({ id: 'M-002', emissions: emits('A-001', 'A-002') }),
      ],
      loops: [],
      patterns: [],
      interventions: [],
    });

    const out = identifiability(bundle);
    // Strict subset, not an exact tie: M-001 has no trace M-002 cannot also
    // leave, so nothing observable ever narrows to M-001 alone.
    expect(out.neverAlone).toEqual([{ mechanism: 'M-001', coveredBy: ['M-002'] }]);
    expect(out.identifying).toEqual([{ artifact: 'A-002', mechanism: 'M-002' }]);
  });

  it('treats an exact tie as subsumption in both directions', () => {
    const bundle = makeBundle({
      artifacts: [artifact({ id: 'A-001' })],
      mechanisms: [
        mechanism({ id: 'M-001', emissions: emits('A-001') }),
        mechanism({ id: 'M-002', emissions: emits('A-001') }),
      ],
      loops: [],
      patterns: [],
      interventions: [],
    });

    expect(identifiability(bundle).neverAlone).toEqual([
      { mechanism: 'M-001', coveredBy: ['M-002'] },
      { mechanism: 'M-002', coveredBy: ['M-001'] },
    ]);
    expect(identifiability(bundle).identifying).toEqual([]);
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
    expect(omissions.map((m) => m.id)).toEqual([
      'mech.automated_keyword_qualification_filter',
      'mech.communication_or_working_style_friction',
      'mech.domain_specificity_over_weighting',
      'mech.location_or_timezone_compliance_constraint',
    ]);
  });

  it('cannot separate every mechanism by observation, and says which', () => {
    // The client account added two members deliberately. M-025 joins the
    // outreach class: bid-conditional pooling differs from M-009 and M-016 in
    // whether a bid record exists, which is structural and invisible from
    // outside — exactly what SPEC-MODEL 2a says. M-026 ties M-005: whether the
    // internal person was earmarked before the search or became available
    // during it sits in a staffing record no message describes. Both ties are
    // published findings, not accidents.
    expect(report.indistinguishable.map((c) => c.mechanisms)).toEqual([
      ['mech.bench_priority_fill', 'mech.pre_selected_internal_candidate'],
      [
        'mech.bid_conditional_talent_pool',
        'mech.recruiter_volume_quota_incentive_distortion',
        'mech.speculative_sourcing_talent_pooling_without_opening',
      ],
    ]);
  });

  it('names every cause no observation can pin down', () => {
    // Stronger than the class count above, which sees only exact ties. A
    // mechanism whose trace is a strict subset of another's is never alone
    // either — so adding an observation can make one side of a pair
    // identifiable while leaving the other subsumed, and that is not progress
    // this list will let us overstate.
    // A-016 stopped identifying M-005 when M-026 arrived — an honest loss:
    // "an internal hire was named" genuinely does not say which structure
    // produced it.
    expect(report.identifiability.neverAlone.map((n) => n.mechanism)).toEqual([
      'mech.automated_keyword_qualification_filter',
      'mech.bench_priority_fill',
      'mech.bid_conditional_talent_pool',
      'mech.employment_gap_downranking_bias',
      'mech.experience_age_grading_mismatch',
      'mech.genuine_technical_skill_shortfall',
      'mech.pre_selected_internal_candidate',
      'mech.recruiter_volume_quota_incentive_distortion',
      'mech.speculative_sourcing_talent_pooling_without_opening',
      'mech.stronger_competing_candidate_in_final_cohort',
    ]);
  });
});
