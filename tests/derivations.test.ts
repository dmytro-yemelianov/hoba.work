import { describe, expect, it } from 'vitest';
import {
  closure,
  evaluatePatternEmptiness,
  findRegistryRoot,
  gaps,
  identifiability,
  indistinguishability,
  lift,
  loadRegistryFromRoot,
  narrow,
  separation,
  substrateClosure,
  substrateCalculateRunway,
  substrateDetectTemporalAnomalies,
  substrateGaps,
  substrateIdentifiability,
  substrateIndistinguishability,
  substrateNarrow,
  substrateProcessMetrics,
  substrateSeparation,
  substrateVerifyFlowConservation,
  type DiagnosticProbe,
  type ProbeResult,
} from '@hoba/registry';
import { REPO_ROOT } from './helpers';

describe.each(['en', 'uk'] as const)('substrate derivations equivalence (%s)', (lang) => {
  const bundle = loadRegistryFromRoot(findRegistryRoot(REPO_ROOT)!, lang);
  const lifted = lift(bundle);

  it('substrateIndistinguishability produces identical classes to bundle indistinguishability', () => {
    const legacy = indistinguishability(bundle);
    const sub = substrateIndistinguishability(lifted.substrate);
    expect(sub).toEqual(legacy);
  });

  it('substrateIdentifiability produces identical identifying and neverAlone sets', () => {
    const legacy = identifiability(bundle);
    const sub = substrateIdentifiability(lifted.substrate);
    expect(sub).toEqual(legacy);
  });

  it('substrateClosure produces identical results across all mechanisms, barriers, and artifacts', () => {
    const sampleIds = [
      ...bundle.mechanisms.slice(0, 5).map((m) => m.id),
      ...bundle.barriers.slice(0, 5).map((b) => b.id),
      ...bundle.observations.slice(0, 5).map((a) => a.id),
      ...bundle.patterns.map((p) => p.id),
      ...bundle.interventions.slice(0, 3).map((i) => i.id),
    ];

    for (const id of sampleIds) {
      const legacy = closure(bundle, id);
      const sub = substrateClosure(lifted, id);
      expect(sub, `closure for ${id}`).toEqual(legacy);
    }
  });

  it('substrateGaps produces an identical GapReport to legacy gaps()', () => {
    const legacy = gaps(bundle);
    const sub = substrateGaps(lifted);
    expect(sub).toEqual(legacy);
  });

  it('substrateSeparation produces identical results to legacy separation()', () => {
    const compatible = bundle.mechanisms.slice(0, 8).map((m) => m.id);
    const mockProbes: DiagnosticProbe[] = [
      {
        id: 'PROBE-1',
        action: 'Check logs',
        expected_signal: 'Signal',
        cost: 'low',
        outcomes: [
          {
            id: 'out-1',
            label: 'Yes',
            weighs_against: [],
            excludes: [compatible[0]!, compatible[1]!],
            because: 'Rule',
          },
          { id: 'out-2', label: 'No', weighs_against: [], excludes: [], because: '' },
        ],
      },
      {
        id: 'PROBE-2',
        action: 'Ask recruiter',
        expected_signal: 'Answer',
        cost: 'low',
        outcomes: [
          {
            id: 'out-3',
            label: 'Yes',
            weighs_against: [],
            excludes: [compatible[0]!, compatible[2]!],
            because: 'Rule',
          },
        ],
      },
    ];

    const legacy = separation(compatible, mockProbes);
    const sub = substrateSeparation(compatible, mockProbes);
    expect(sub).toEqual(legacy);
  });

  it('substrateNarrow produces identical results to legacy narrow()', () => {
    const compatible = bundle.mechanisms.slice(0, 6).map((m) => m.id);
    const mockProbes: DiagnosticProbe[] = [
      {
        id: 'PROBE-1',
        action: 'Action',
        expected_signal: 'Signal',
        cost: 'low',
        outcomes: [
          {
            id: 'yes',
            label: 'Yes',
            weighs_against: [],
            excludes: [compatible[0]!],
            because: 'Exclusion',
          },
        ],
      },
    ];
    const results: ProbeResult[] = [{ probe: 'PROBE-1', outcome: 'yes' }];

    const legacy = narrow(compatible, mockProbes, results);
    const sub = substrateNarrow(compatible, mockProbes, results);
    expect(sub).toEqual(legacy);
  });

  it('substrateProcessMetrics extracts metrics for all workflows', () => {
    const metrics = substrateProcessMetrics(lifted.substrate);
    expect(metrics.length).toBe(bundle.processes.length);
    for (const m of metrics) {
      expect(m.stateCount).toBeGreaterThan(0);
      expect(m.transitionCount).toBeGreaterThan(0);
      expect(m.title).toBeTruthy();
    }
  });

  it('evaluates pattern emptiness with all 4 patterns algebraically proven computed_empty', () => {
    const report = evaluatePatternEmptiness(lifted);
    expect(report.patterns.length).toBe(4);
    expect(report.computedEmptyCount).toBe(4);
    expect(report.proseAssertedCount).toBe(0);

    const p1 = report.patterns.find((p) => p.id === 'pat.seniority_double_bind')!;
    expect(p1.status).toBe('computed_empty');
    expect(p1.contradictionDetails).toContain('Candidate experience simultaneously satisfies');

    const p2 = report.patterns.find((p) => p.id === 'pat.closed_then_reposted_requisition_motif')!;
    expect(p2.status).toBe('computed_empty');
    expect(p2.satisfyingSetDescription).toContain('empty set');

    const p3 = report.patterns.find((p) => p.id === 'pat.experience_age_impossibility')!;
    expect(p3.status).toBe('computed_empty');
    expect(p3.satisfyingSetDescription).toContain('empty set');

    const p4 = report.patterns.find((p) => p.id === 'pat.compensation_double_bind')!;
    expect(p4.status).toBe('computed_empty');
    expect(p4.satisfyingSetDescription).toContain('empty set');
  });

  it('detects temporal anomalies when actual dwell exceeds max bound', () => {
    const anomalies = substrateDetectTemporalAnomalies(
      lifted.substrate,
      'proc.the_hiring_funnel_end_to_end',
      'recruiter-queue',
      45
    );
    expect(anomalies.length).toBeGreaterThan(0);
    const queuedToScreen = anomalies.find((a) => a.toState === 'recruiter-screen')!;
    expect(queuedToScreen.severity).toBe('stalled_anomalous');
    expect(queuedToScreen.implicatedMechanisms).toContain('mech.stale_or_orphaned_job_requisition');
    expect(queuedToScreen.implicatedMechanisms).toContain(
      'mech.automated_application_expiration_timeout'
    );
  });

  it('calculates runway horizon and classifies risk profile correctly', () => {
    const solvent = substrateCalculateRunway(30000, 4000);
    expect(solvent.runwayMonths).toBe(7.5);
    expect(solvent.riskStatus).toBe('solvent');

    const vulnerable = substrateCalculateRunway(5000, 3000);
    expect(vulnerable.runwayMonths).toBeLessThan(3);
    expect(vulnerable.riskStatus).toBe('acute_exhaustion_vulnerability');
    expect(vulnerable.vulnerabilityNote).toContain('mech.experience_age_grading_mismatch');
  });

  it('verifies flow conservation across all authored funding records', () => {
    const report = substrateVerifyFlowConservation(lifted.substrate);
    expect(report.isConserved).toBe(true);
    expect(report.violations).toEqual([]);
  });
});
