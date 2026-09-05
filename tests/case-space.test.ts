import { describe, expect, it } from 'vitest';
import {
  CASE_AXES,
  CASE_CONSTRAINTS,
  DERIVED_CASE_COORDINATES,
  assessCaseAssignment,
  summarizeCaseSpace,
} from '@hoba/registry';

describe('case space contract', () => {
  it('declares every axis and coordinate once, with non-empty finite domains', () => {
    const axisIds = CASE_AXES.map((axis) => axis.id);
    const derivedIds = DERIVED_CASE_COORDINATES.map((coordinate) => coordinate.id);

    expect(new Set(axisIds).size).toBe(axisIds.length);
    expect(new Set(derivedIds).size).toBe(derivedIds.length);
    expect(new Set([...axisIds, ...derivedIds]).size).toBe(axisIds.length + derivedIds.length);

    for (const axis of CASE_AXES) {
      expect(axis.values.length, axis.id).toBeGreaterThan(1);
      expect(new Set(axis.values).size, axis.id).toBe(axis.values.length);
    }
    for (const coordinate of DERIVED_CASE_COORDINATES) {
      expect(coordinate.values.length, coordinate.id).toBeGreaterThan(1);
      expect(new Set(coordinate.values).size, coordinate.id).toBe(coordinate.values.length);
    }
  });

  it('makes SPEC-CASE-SPACE arithmetic reproducible from data', () => {
    const summary = summarizeCaseSpace();

    expect(summary.nominalOrdinalAxes).toBe(28);
    expect(summary.subsetAxes).toBe(4);
    expect(summary.subsetArity).toBe(38);
    expect(summary.derivedCoordinates).toBe(5);
    expect(summary.coverageCoordinates).toBe(71);
    expect(summary.authoredContextCardinality).toBe(74_331_795_750_912_000_000n);
    expect(summary.subsetCardinality).toBe(274_877_906_944n);
    expect(summary.contextCardinality).toBe(20_432_168_435_399_603_339_132_928_000_000n);
    expect(summary.oneWiseSlots).toBe(261);
    expect(summary.twoWiseCoordinatePairs).toBe(2485);
    expect(summary.twoWiseUnfilteredSlots).toBe(33384);
  });

  it('keeps Γ explicit and stronger than the old prose checklist', () => {
    const summary = summarizeCaseSpace();

    expect(summary.constraints).toEqual({
      schema: 4,
      hard: 14,
      defeasible: 3,
    });
    expect(summary.executableHardConstraints).toBe(12);
    expect(new Set(CASE_CONSTRAINTS.map((item) => item.id)).size).toBe(CASE_CONSTRAINTS.length);
  });

  it('refutes impossible worksite and military combinations by named Γ constraint', () => {
    expect(
      assessCaseAssignment({
        'worksite.mode': 'remote_global',
        'worksite.cadence': '4_5_per_week',
      })
    ).toMatchObject({
      verdict: 'refuted',
      violations: ['hard.remote_has_no_regular_office_week'],
    });

    expect(
      assessCaseAssignment({
        'population.affected': ['military_status'],
        'military.status': 'not_applicable',
      })
    ).toMatchObject({
      verdict: 'refuted',
      violations: ['hard.military_ground_requires_status'],
    });
  });

  it('returns undetermined instead of pretending incomplete cases are admissible', () => {
    expect(
      assessCaseAssignment({
        'funding.source': 'unwon_bid',
      })
    ).toMatchObject({
      verdict: 'undetermined',
      violations: [],
      undetermined: ['hard.unwon_bid_is_conditional'],
    });
  });

  it('accepts representative assignments that satisfy executable Γ constraints', () => {
    expect(
      assessCaseAssignment({
        'funding.source': 'unwon_bid',
        'funding.state': 'conditional',
        'requisition.state': 'conditional_on_bid',
        'entry.path': 'rehire',
        'memory.carried': ['re_entry_standing'],
        'block.determinacy': 'judgement',
        'block.arity': 'comparative',
        'distortion.origin': 'channel',
        'statement.fidelity': 'distortion',
        'outcome.signal': 'successful_hire',
        epilogue: 'probation_confirmed',
        'worksite.mode': 'hybrid_fixed',
        'worksite.anchor': 'named_city',
        'worksite.cadence': '2_3_per_week',
        'latitude.employer': 'slack_outside_party',
        'latitude.candidate': 'slack_conditional',
        'party.set': ['candidate', 'recruiter', 'client'],
        'bargain.state': 'overlap',
        'population.affected': ['military_status', 'age'],
        'military.status': 'reserved_by_employer',
        'block.owner': 'outside_party',
      })
    ).toMatchObject({
      verdict: 'admissible',
      violations: [],
      undetermined: [],
    });
  });
});
