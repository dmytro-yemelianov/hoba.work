import { describe, expect, it } from 'vitest';
import { narrow, separates, separation, type ProbeResult } from '@hoba/registry';
import type { DiagnosticProbe } from '@hoba/registry';

/** A probe whose single interesting outcome rules out exactly `excludes`. */
const probe = (id: string, excludes: string[]): DiagnosticProbe => ({
  id: `PROBE-${id}`,
  action: 'Do the bounded thing.',
  expected_signal: 'Something legible comes back.',
  cost: 'low',
  outcomes: [
    {
      id: 'yes',
      label: 'It came back.',
      weighs_against: [],
      excludes,
      because: excludes.length ? 'Definitionally incompatible.' : '',
    },
    { id: 'no', label: 'Nothing came back.', weighs_against: [], excludes: [], because: '' },
  ],
});

const ALL = ['M-001', 'M-002', 'M-003', 'M-004'];

describe('narrowing', () => {
  it('does not eliminate a mechanism when an outcome only weighs against it', () => {
    const diagnostic = probe('WEIGHT', []);
    diagnostic.outcomes[0]!.weighs_against = ['M-001'];
    diagnostic.outcomes[0]!.because =
      'This makes the mechanism less plausible without ruling it out.';

    const out = narrow(ALL, [diagnostic], [{ probe: 'PROBE-WEIGHT', outcome: 'yes' }]);

    expect(out.remaining).toEqual(ALL);
    expect(out.steps[0]!.eliminated).toEqual([]);
  });

  it('only ever removes, and records a step that removed nothing', () => {
    const probes = [probe('A', ['M-001']), probe('B', [])];
    const results: ProbeResult[] = [
      { probe: 'PROBE-A', outcome: 'yes' },
      { probe: 'PROBE-B', outcome: 'yes' },
    ];
    const out = narrow(ALL, probes, results);

    expect(out.remaining).toEqual(['M-002', 'M-003', 'M-004']);
    expect(out.steps.map((s) => s.eliminated)).toEqual([['M-001'], []]);
    // "We checked and it settled nothing" is a finding, so the step stays.
    expect(out.steps).toHaveLength(2);
    expect(out.steps[1]!.remaining).toBe(3);
  });

  it('is monotone: the set never grows, whatever order the results arrive in', () => {
    const probes = [probe('A', ['M-001']), probe('B', ['M-002', 'M-003'])];
    const forward = narrow(ALL, probes, [
      { probe: 'PROBE-A', outcome: 'yes' },
      { probe: 'PROBE-B', outcome: 'yes' },
    ]);
    const backward = narrow(ALL, probes, [
      { probe: 'PROBE-B', outcome: 'yes' },
      { probe: 'PROBE-A', outcome: 'yes' },
    ]);
    expect(forward.remaining).toEqual(backward.remaining);
    expect(forward.remaining).toEqual(['M-004']);
    for (const step of forward.steps) expect(step.remaining).toBeLessThanOrEqual(ALL.length);
  });

  it('reports a result naming something that does not exist rather than throwing', () => {
    const out = narrow(
      ALL,
      [probe('A', ['M-001'])],
      [
        { probe: 'PROBE-NOPE', outcome: 'yes' },
        { probe: 'PROBE-A', outcome: 'not-an-outcome' },
      ]
    );
    expect(out.unknown).toHaveLength(2);
    expect(out.remaining).toEqual(ALL);
  });

  it('excluding a mechanism that was never compatible changes nothing', () => {
    const out = narrow(['M-002'], [probe('A', ['M-001'])], [{ probe: 'PROBE-A', outcome: 'yes' }]);
    expect(out.remaining).toEqual(['M-002']);
    expect(out.steps[0]!.eliminated).toEqual([]);
  });
});

describe('separation', () => {
  it('separates a pair only when an outcome excludes exactly one of them', () => {
    const p = probe('A', ['M-001', 'M-002']);
    expect(separates(p, 'M-001', 'M-003')).toBe(true);
    // Both excluded by the same outcome: the probe cannot tell them apart.
    expect(separates(p, 'M-001', 'M-002')).toBe(false);
    expect(separates(p, 'M-003', 'M-004')).toBe(false);
  });

  it('returns a smallest cover, not the first set that happens to work', () => {
    const wide = probe('WIDE', ['M-001', 'M-002']);
    const a = probe('A', ['M-001', 'M-003']);
    const b = probe('B', ['M-001', 'M-004']);
    const report = separation(ALL, [wide, a, b]);

    expect(report.exact).toBe(true);
    // The set it returns settles everything settleable...
    expect(report.indistinguishable_pairs).toEqual([]);
    // ...in two probes, and no single one of the three would have done.
    expect(report.minimal_probes).toHaveLength(2);
    for (const single of [wide, a, b]) {
      expect(separation(ALL, [single]).indistinguishable_pairs.length).toBeGreaterThan(0);
    }
    // Using all three would also cover; the point is that it does not say so.
    expect(separation(ALL, [wide, a, b]).minimal_probes.length).toBeLessThan(3);
  });

  it('says plainly when nothing available can tell anything apart', () => {
    const report = separation(ALL, [probe('A', []), probe('B', [])]);
    expect(report.minimal_probes).toEqual([]);
    expect(report.separable_pairs).toBe(0);
    expect(report.indistinguishable_pairs).toHaveLength(6);
    // Four mechanisms, all mutually indistinguishable: one group.
    expect(report.indistinguishable_groups).toEqual([ALL]);
  });

  it('groups what the evidence cannot reach, and leaves the rest out of it', () => {
    // The probe splits {M-001, M-002} from {M-003, M-004} and nothing else.
    const report = separation(ALL, [probe('SPLIT', ['M-001', 'M-002'])]);
    expect(report.indistinguishable_pairs).toEqual([
      ['M-001', 'M-002'],
      ['M-003', 'M-004'],
    ]);
    expect(report.indistinguishable_groups).toEqual([
      ['M-001', 'M-002'],
      ['M-003', 'M-004'],
    ]);
    expect(report.minimal_probes).toEqual(['PROBE-SPLIT']);
  });

  it('has nothing to separate when one mechanism is left', () => {
    const report = separation(['M-001'], [probe('A', ['M-001'])]);
    expect(report.separable_pairs).toBe(0);
    expect(report.minimal_probes).toEqual([]);
    expect(report.indistinguishable_groups).toEqual([]);
  });
});
