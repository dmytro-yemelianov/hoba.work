import { describe, expect, it } from 'vitest';
import { classifyAgencyZone, HOBADiagnosticEngine } from '@hoba/registry';
import { artifact, barrier, makeBundle, mechanism } from './helpers';

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
    bundle.artifacts.push(artifact({ id: 'A-002', status: 'deprecated', superseded_by: 'A-001' }));
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
    artifacts: [artifact({ id: 'A-001', stages: ['screening', 'technical'] })],
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
