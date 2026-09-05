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
        bundle.processes.length +
        scenarios.length
    );
    expect(lift.summary.assigned_sources).toBe(lift.summary.sources);
    expect(lift.summary.refuted).toBe(0);
    expect(lift.summary.coordinates_total).toBe(summarizeCaseSpace().coverageCoordinates);
    expect(lift.summary.one_wise_slots_total).toBe(summarizeCaseSpace().oneWiseSlots);
  });

  it('makes reviewed scenario assignments visible without claiming full prose coverage', () => {
    expect(lift.summary.coordinates_touched).toBe(14);
    expect(lift.summary.one_wise_slots_touched).toBe(52);
    expect(lift.summary.pairwise_slots_touched).toBe(332);
    expect(lift.summary.declared_coordinates).toBe(42);
    expect(lift.summary.declared_known).toBe(15);
    expect(lift.summary.declared_inferred).toBe(7);
    expect(lift.summary.declared_unknown).toBe(20);

    const touched = new Set(lift.coordinates.map((coordinate) => coordinate.coordinate));
    expect(touched).toEqual(
      new Set([
        'block.nature',
        'block.owner',
        'chain.class',
        'cohort.state',
        'entry.path',
        'epilogue',
        'evidence.level',
        'jurisdiction',
        'outcome.signal',
        'party.set',
        'requisition.state',
        'stage.terminal',
        'statement.fidelity',
        'visibility.candidate',
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
