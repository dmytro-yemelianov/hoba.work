import { describe, expect, it } from 'vitest';
import {
  loadRegistryFromRoot,
  loadScenarios,
  liftRegistryCaseSpace,
  resolveRegistryRoot,
  summarizeCaseSpace,
} from '@hoba/registry';

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');
const scenarios = loadScenarios(root);
const lift = liftRegistryCaseSpace(bundle, scenarios);

describe('case-space lift', () => {
  it('projects the current corpus into a lower-bound set of partial fibres', () => {
    expect(lift.summary.sources).toBe(
      bundle.observations.length +
        bundle.barriers.length +
        bundle.mechanisms.length +
        bundle.patterns.length +
        bundle.loops.length +
        bundle.interventions.length +
        bundle.records.length +
        bundle.evidence.length +
        bundle.processes.length +
        bundle.eras.length +
        scenarios.length
    );
    expect(lift.summary.assigned_sources).toBe(lift.summary.sources);
    expect(lift.summary.refuted).toBe(0);
    expect(lift.summary.coordinates_total).toBe(summarizeCaseSpace().coverageCoordinates);
    expect(lift.summary.one_wise_slots_total).toBe(summarizeCaseSpace().oneWiseSlots);
  });

  it('makes reviewed scenario assignments visible without claiming full prose coverage', () => {
    expect(lift.summary.coordinates_touched).toBe(37);
    expect(lift.summary.one_wise_slots_touched).toBe(134);
    expect(lift.summary.pairwise_slots_touched).toBe(2268);
    expect(lift.summary.declared_coordinates).toBe(201);
    expect(lift.summary.declared_known).toBe(171);
    expect(lift.summary.declared_inferred).toBe(9);
    expect(lift.summary.declared_unknown).toBe(21);

    const touched = new Set(lift.coordinates.map((coordinate) => coordinate.coordinate));
    expect(touched).toEqual(
      new Set([
        'arrangement',
        'bargain.state',
        'block.arity',
        'block.determinacy',
        'block.nature',
        'block.owner',
        'chain.class',
        'cohort.state',
        'cost.borne_by',
        'distortion.origin',
        'domain',
        'entry.path',
        'epilogue',
        'era.regime',
        'evidence.level',
        'evidence.role',
        'funding.source',
        'funding.state',
        'jurisdiction',
        'latitude.candidate',
        'latitude.employer',
        'latency.class',
        'memory.carried',
        'military.status',
        'outcome.signal',
        'party.set',
        'plurality',
        'population.affected',
        'principal.side',
        'requisition.state',
        'stage.terminal',
        'statement.fidelity',
        'visibility.candidate',
        'visibility.summary',
        'worksite.anchor',
        'worksite.cadence',
        'worksite.mode',
      ])
    );
  });

  it('lifts scenarios as fibres rather than as fully specified cases', () => {
    const scenario = lift.lifts.find((item) => item.source.id === 'scenario.application_silence');
    expect(scenario).toBeDefined();
    expect(scenario!.source.type).toBe('scenario');
    expect(Object.keys(scenario!.assignment).length).toBeLessThan(12);
    expect(scenario!.declarations.length).toBeGreaterThan(0);
    expect(scenario!.assignment['evidence.level']).toBeDefined();
    expect(scenario!.admissibility.verdict).toBe('admissible');
  });
});
