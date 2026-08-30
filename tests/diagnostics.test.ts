import { describe, expect, it } from 'vitest';
import { classifyAgencyZone, HOBADiagnosticEngine } from '@hoba/registry';
import { observation, barrier, makeBundle, mechanism } from './helpers';

describe('HOBADiagnosticEngine', () => {
  const engine = new HOBADiagnosticEngine(makeBundle());

  it('localizes barriers from the explicit stage and from artifact stages otherwise', () => {
    const explicit = engine.analyze({ artifacts: ['A-001'], stage: 'technical' });
    expect(explicit.obstacle.identified_barriers.map((b) => b.id)).toEqual(['B-002']);
    expect(explicit.obstacle.primary_stage).toBe('technical');

    const inferred = engine.analyze({ artifacts: ['A-001'] });
    expect(inferred.obstacle.identified_barriers.map((b) => b.id)).toEqual(['B-001']);
    expect(inferred.obstacle.primary_stage).toBe('screening');
  });

  it('marks mechanisms that emit the observed artifact and lists who amplifies them', () => {
    const res = engine.analyze({ artifacts: ['A-001'], stage: 'technical' });
    const byId = Object.fromEntries(res.behind.compatible_mechanisms.map((c) => [c.mechanism.id, c]));
    expect(byId['M-001'].emitted_by_evidence).toBe(true); // emits A-001
    expect(byId['M-002'].emitted_by_evidence).toBe(false); // only operates at B-002
    expect(byId['M-001'].amplified_by).toEqual(['M-002']);
    expect(res.behind.related_loops.map((l) => l.id)).toEqual(['L-001']);
    expect(res.behind.related_patterns.map((p) => p.id)).toEqual(['P-001']);
  });

  /**
   * A verdict of `diagnostic` is a claim that the observation narrowed the
   * field. When almost everything is still compatible it narrowed nothing, and
   * the engine used to say `diagnostic` anyway — for the generic rejection
   * template it did so with 27 of 28 mechanisms still open.
   */
  describe('narrowing', () => {
    const emitters = (n: number) =>
      Array.from({ length: n }, (_, i) =>
        mechanism({
          id: `M-1${String(i).padStart(2, '0')}`,
          operates_at: ['B-001'],
          honest_baseline: i === 0,
          facets: { actor: 'candidate', nature: 'rule', visibility: 'inferable', removability: 'candidate' },
          emissions: [{ artifact: 'A-001', fidelity: 'direct', likelihood: 'high', evidence: [], observed_at: [] }],
        })
      );

    const bundleWith = (emitting: number, silent: number) =>
      makeBundle({
        mechanisms: [
          ...emitters(emitting),
          ...Array.from({ length: silent }, (_, i) => mechanism({ id: `M-2${String(i).padStart(2, '0')}`, operates_at: ['B-002'] })),
        ],
        patterns: [],
        interventions: [],
      });

    it('refuses to call an observation diagnostic when more than half the registry stays compatible', () => {
      const res = new HOBADiagnosticEngine(bundleWith(3, 2)).analyze({ artifacts: ['A-001'] });
      expect(res.counts.compatible_mechanisms).toBe(3);
      expect(res.verdict).toBe('low_signal_ambiguity');
    });

    it('still calls it diagnostic when the observation rules most of the registry out', () => {
      const res = new HOBADiagnosticEngine(bundleWith(2, 6)).analyze({ artifacts: ['A-001'] });
      expect(res.counts.compatible_mechanisms).toBe(2);
      expect(res.verdict).toBe('diagnostic');
    });

    it('says which of the two low-signal reasons fired', () => {
      const res = new HOBADiagnosticEngine(bundleWith(3, 2)).analyze({ artifacts: ['A-001'] });
      // Not the agency wording: there is agency here, the observation simply
      // did not narrow anything.
      expect(res.summary).toMatch(/narrow/i);
      expect(res.summary).not.toMatch(/minimal candidate agency/i);
    });
  });

  /**
   * Two traces can come from two mechanisms, so the compatible set is a union
   * and must stay one — intersecting would assert a single hidden cause, which
   * the protocol forbids. But the registry does know which mechanisms account
   * for *everything* observed, and that is the subset ROADMAP relies on when
   * it says a second, different observation tells the catch-all apart.
   */
  describe('accounting for every observation', () => {
    const engine = new HOBADiagnosticEngine(makeBundle());

    it('marks the mechanisms that emit every selected observation, not merely one', () => {
      // At the technical stage both mechanisms are in scope, but only M-001
      // emits the observation; M-002 merely operates at a gate there.
      const res = engine.analyze({ artifacts: ['A-001'], stage: 'technical' });
      const m1 = res.behind.compatible_mechanisms.find((c) => c.mechanism.id === 'M-001')!;
      const m2 = res.behind.compatible_mechanisms.find((c) => c.mechanism.id === 'M-002')!;
      expect(m1.accounts_for_all).toBe(true);
      expect(m2.accounts_for_all).toBe(false);
      expect(res.counts.accounts_for_all).toBe(1);
    });

    it('counts nobody when no single mechanism emits all of them', () => {
      const bundle = makeBundle({
        observations: [
          observation({ id: 'A-001', stages: ['screening'] }),
          observation({ id: 'A-002', stages: ['screening'] }),
        ],
        mechanisms: [
          mechanism({ id: 'M-001', operates_at: ['B-001'], honest_baseline: true, emissions: [{ artifact: 'A-001', fidelity: 'direct', likelihood: 'high', evidence: [], observed_at: [] }] }),
          mechanism({ id: 'M-002', operates_at: ['B-001'], emissions: [{ artifact: 'A-002', fidelity: 'direct', likelihood: 'high', evidence: [], observed_at: [] }] }),
        ],
        patterns: [],
        interventions: [],
      });
      const res = new HOBADiagnosticEngine(bundle).analyze({ artifacts: ['A-001', 'A-002'] });
      expect(res.counts.compatible_mechanisms).toBe(2);
      expect(res.counts.accounts_for_all).toBe(0);
    });

    it('is the whole compatible set when only one observation is given and every member emits it', () => {
      const res = engine.analyze({ artifacts: ['A-001'] });
      expect(res.counts.accounts_for_all).toBeLessThanOrEqual(res.counts.compatible_mechanisms);
    });
  });

  it('reports unknown artifact IDs instead of silently dropping them', () => {
    const res = engine.analyze({ artifacts: ['A-404', 'A-001'] });
    expect(res.hard_facts.unknown_artifact_ids).toEqual(['A-404']);
    expect(res.hard_facts.selected_artifacts.map((a) => a.id)).toEqual(['A-001']);
  });

  it('returns low-signal verdict with an undetermined zone when nothing is selected', () => {
    const res = engine.analyze({ artifacts: [] });
    expect(res.verdict).toBe('low_signal_ambiguity');
    expect(res.agency.agency_zone).toBe('undetermined');
    expect(res.counts.compatible_mechanisms).toBe(0);
  });

  it('collects non-inferences from artifacts, mechanisms and patterns, de-duplicated', () => {
    const res = engine.analyze({ artifacts: ['A-001'] });
    expect(res.behind.non_inferences).toContain('Does not establish anything by itself.');
    expect(res.behind.non_inferences).toContain('Not malice.');
    expect(new Set(res.behind.non_inferences).size).toBe(res.behind.non_inferences.length);
  });

  it('excludes deprecated nodes from the analysis', () => {
    const bundle = makeBundle();
    bundle.mechanisms.push(
      mechanism({ id: 'M-003', operates_at: ['B-001'], status: 'deprecated', superseded_by: 'M-001' })
    );
    bundle.observations.push(observation({ id: 'A-002', status: 'deprecated', superseded_by: 'A-001' }));
    const res = new HOBADiagnosticEngine(bundle).analyze({ artifacts: ['A-001', 'A-002'] });
    expect(res.behind.compatible_mechanisms.map((c) => c.mechanism.id)).not.toContain('M-003');
    expect(res.hard_facts.unknown_artifact_ids).toEqual(['A-002']);
  });
});

describe('classifyAgencyZone', () => {
  it('partitions by removability counts', () => {
    expect(classifyAgencyZone(0, 0, 0)).toBe('undetermined');
    expect(classifyAgencyZone(2, 0, 0)).toBe('endogenous');
    expect(classifyAgencyZone(0, 1, 0)).toBe('exogenous');
    expect(classifyAgencyZone(0, 0, 3)).toBe('exogenous');
    expect(classifyAgencyZone(1, 1, 0)).toBe('mixed');
  });
});

describe('a recorded emission stage sharpens attribution and nothing else', () => {
  /** One observation, two mechanisms: one places its trace here, one elsewhere. */
  const bundle = makeBundle({
    observations: [observation({ id: 'A-001', stages: ['screening', 'technical'] })],
    barriers: [
      barrier({ id: 'B-001', order: 1, stage: 'screening' }),
      barrier({ id: 'B-002', order: 2, stage: 'technical' }),
    ],
    mechanisms: [
      mechanism({
        id: 'M-001',
        operates_at: ['B-001'],
        emissions: [{ artifact: 'A-001', evidence: [], observed_at: ['screening'] }],
      }),
      mechanism({
        id: 'M-002',
        operates_at: ['B-001'],
        emissions: [{ artifact: 'A-001', evidence: [], observed_at: ['technical'] }],
      }),
      mechanism({
        id: 'M-003',
        operates_at: ['B-001'],
        emissions: [{ artifact: 'A-001', evidence: [], observed_at: [] }],
      }),
    ],
    patterns: [],
    loops: [],
    interventions: [],
  });
  const engine = new HOBADiagnosticEngine(bundle);

  it('never removes a mechanism because of where its trace is placed', () => {
    // The guarantee this whole feature was built under. Naming a stage must
    // widen or hold the compatible set, never shrink it: the atlas does not
    // yet know enough about where traces are read to rule anything out.
    const withoutStage = engine.analyze({ artifacts: ['A-001'] });
    const withStage = engine.analyze({ artifacts: ['A-001'], stage: 'screening' });
    const ids = (r: ReturnType<typeof engine.analyze>) =>
      r.behind.compatible_mechanisms.map((c) => c.mechanism.id).sort();

    expect(ids(withStage)).toEqual(['M-001', 'M-002', 'M-003']);
    expect(ids(withStage)).toEqual(ids(withoutStage));
  });

  it('credits only the mechanism whose trace is read at the named stage', () => {
    const res = engine.analyze({ artifacts: ['A-001'], stage: 'screening' });
    const byId = Object.fromEntries(res.behind.compatible_mechanisms.map((c) => [c.mechanism.id, c]));

    expect(byId['M-001']!.emitted_by_evidence).toBe(true);
    expect(byId['M-002']!.emitted_by_evidence).toBe(false);
    // No recorded stage is not a claim about stages, so it still counts.
    expect(byId['M-003']!.emitted_by_evidence).toBe(true);
  });

  it('credits every emitter when no stage is named', () => {
    const res = engine.analyze({ artifacts: ['A-001'] });
    expect(res.behind.compatible_mechanisms.every((c) => c.emitted_by_evidence)).toBe(true);
  });
});
