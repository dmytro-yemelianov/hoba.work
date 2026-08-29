import { describe, expect, it } from 'vitest';
import { checkConformance } from '@hoba/registry';

const verdicts = (report: ReturnType<typeof checkConformance>) =>
  Object.fromEntries(report.gates.map((g) => [g.reason.code, g.verdict]));

describe('conformance', () => {
  it('fails a stated minimum only when the arithmetic says so', () => {
    expect(verdicts(checkConformance({ years: 4 }, { required_years: 5 }))['years.short']).toBe('fails');
    expect(verdicts(checkConformance({ years: 5 }, { required_years: 5 }))['years.met']).toBe('passes');
    // No dated history offered: the check does not guess.
    expect(verdicts(checkConformance({}, { required_years: 5 }))['years.unknown']).toBe('undetermined');
  });

  it('calls a requirement nobody could meet a fact about the posting', () => {
    const report = checkConformance({ years: 4 }, { required_years: 8, technology_age: 5 });
    expect(report.unsatisfiable).toHaveLength(1);
    expect(report.unsatisfiable[0]!.reason).toEqual({ code: 'years.impossible', params: { required: 8, existed: 5 } });
    // It is still true that this particular person is short of the number.
    expect(verdicts(report)['years.short']).toBe('fails');
  });

  it('never turns a missing keyword into a failure', () => {
    // Whether a phrase is a knockout rule or one input to a ranking model is
    // not visible from outside, so the honest verdict is that it is unknown.
    const report = checkConformance({ skills: ['go'] }, { required_skills: ['go', 'kubernetes', 'rust'] });
    expect(report.gates).toHaveLength(1);
    expect(report.gates[0]!.verdict).toBe('undetermined');
    expect(report.gates[0]!.reason.params.missing).toBe('kubernetes, rust');
    expect(report.stops_at).toBeUndefined();
  });

  it('decides authorisation and location, and admits when it cannot', () => {
    const outside = checkConformance(
      { authorised_for: ['ukraine'], located_in: 'ukraine' },
      { requires_authorisation_in: 'Germany', hiring_locations: ['Germany', 'Poland'] }
    );
    expect(verdicts(outside)['authorisation.absent']).toBe('fails');
    expect(verdicts(outside)['location.outside']).toBe('fails');

    const inside = checkConformance(
      { authorised_for: ['Germany'], located_in: 'germany' },
      { requires_authorisation_in: 'germany', hiring_locations: ['Germany'] }
    );
    expect(verdicts(inside)['authorisation.present']).toBe('passes');
    expect(verdicts(inside)['location.inside']).toBe('passes');

    const unsaid = checkConformance({}, { requires_authorisation_in: 'Germany', hiring_locations: ['Germany'] });
    expect(verdicts(unsaid)['authorisation.unknown']).toBe('undetermined');
    expect(verdicts(unsaid)['location.unknown']).toBe('undetermined');
  });

  it('treats a band as a ceiling, not a floor', () => {
    expect(verdicts(checkConformance({ expectation: 90 }, { band_min: 50, band_max: 80 }))['band.above']).toBe('fails');
    // Under the band is not a gate the process closes on; it is not a pass fail.
    expect(verdicts(checkConformance({ expectation: 40 }, { band_min: 50, band_max: 80 }))['band.under']).toBe('passes');
    expect(verdicts(checkConformance({ expectation: 60 }, { band_min: 50, band_max: 80 }))['band.inside']).toBe('passes');
    expect(verdicts(checkConformance({ expectation: 60 }, {}))['band.unpublished']).toBe('undetermined');
  });

  it('stops where a run would actually stop, in funnel order', () => {
    const report = checkConformance(
      { years: 2, located_in: 'ukraine', expectation: 200 },
      { required_years: 5, hiring_locations: ['Germany'], band_min: 50, band_max: 80 }
    );
    // Three gates fail; the one reported is the earliest in the funnel.
    expect(report.gates.filter((g) => g.verdict === 'fails')).toHaveLength(3);
    expect(report.stops_at!.gate).toBe('bar.automated_filter_parser_threshold');
    expect(report.stops_at!.state).toBe('machine-check');
  });

  it('says nothing at all when it is given nothing', () => {
    const report = checkConformance({}, {});
    expect(report.gates).toEqual([]);
    expect(report.stops_at).toBeUndefined();
    expect(report.undetermined).toBe(0);
  });

  it('anchors every gate to a barrier and a state of the canonical path', () => {
    const report = checkConformance(
      { years: 4, skills: [], authorised_for: ['Germany'], located_in: 'Germany', expectation: 60 },
      {
        required_years: 5,
        required_skills: ['go'],
        requires_authorisation_in: 'Germany',
        hiring_locations: ['Germany'],
        band_min: 50,
        band_max: 80,
      }
    );
    for (const gate of report.gates) {
      expect(gate.gate, gate.reason.code).toMatch(/^bar\.[a-z0-9_]+$/);
      expect(gate.state.length, gate.reason.code).toBeGreaterThan(0);
      expect(gate.mechanisms.length, gate.reason.code).toBeGreaterThan(0);
      for (const m of gate.mechanisms) expect(m).toMatch(/^mech\.[a-z0-9_]+$/);
    }
  });
});
