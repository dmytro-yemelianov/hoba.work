import { describe, expect, it } from 'vitest';
import { findRegistryRoot, lift, loadRegistryFromRoot, project, validateSubstrate } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

/**
 * The equivalence gate (PLAN-SUBSTRATE A2 & A4).
 *
 * The substrate provably subsumes the authored model: lifting the bundle and
 * projecting it back reproduces the loader's output exactly, for both
 * mirrors. From here on this may never go red, and no capability may be built
 * on the substrate that is not behind it.
 */
describe.each(['en', 'uk'] as const)('the equivalence gate (%s)', (lang) => {
  const bundle = loadRegistryFromRoot(findRegistryRoot(REPO_ROOT)!, lang);
  const lifted = lift(bundle);

  it('projects back to the exact bundle', () => {
    expect(project(lifted)).toEqual(bundle);
  });

  it('lifts to a substrate that validates clean', () => {
    expect(validateSubstrate(lifted.substrate)).toEqual([]);
  });

  it('keeps the substrate authoritative: no stripped field survives in the sidecar', () => {
    // If a title or a structural field leaks into the sidecar, the projection
    // would read it from the wrong place and drift silently. This is the
    // assert that keeps "computed before authored" honest.
    for (const [id, rest] of Object.entries(lifted.sidecar.entities)) {
      expect(rest, id).not.toHaveProperty('title');
      if (id.startsWith('B-') || id.startsWith('bar.')) expect(rest, id).not.toHaveProperty('pass_condition');
      if (id.startsWith('M-') || id.startsWith('mech.')) {
        expect(rest, id).not.toHaveProperty('operates_at');
        expect(rest, id).not.toHaveProperty('emissions');
      }
    }
  });

  it('keeps edge conditions consistent with the authored transitions', () => {
    // Conditions-on-edges exist twice on purpose during the strangler phase:
    // structurally in the process, presentationally in the sidecar entity
    // lists. This is what stops the two from drifting apart.
    for (const w of bundle.workflows) {
      const proc = lifted.substrate.processes.find((p) => p.id === `prc:${w.id.toLowerCase()}`)!;
      w.transitions.forEach((t, i) => {
        const fromEntities = (t.entities ?? []).filter((e) => e.startsWith('B-') || e.startsWith('bar.')).map((e) => `cnd:${e.toLowerCase()}`);
        expect(proc.transitions[i]!.conditions, `${w.id} #${i}`).toEqual(fromEntities);
      });
    }
  });

  it('anchors every mechanism at gates that actually gate something', () => {
    for (const c of lifted.substrate.conditions) {
      expect(c.gates.length, c.id).toBeGreaterThan(0);
      if (c.accounts_for.length > 0)
        for (const anchor of c.accounts_for)
          expect(lifted.substrate.conditions.some((x) => x.id === anchor), `${c.id} -> ${anchor}`).toBe(true);
    }
  });

  it('assigns comparative arity and cohorts to the three comparative mechanisms (A4)', () => {
    const comparativeIds = [
      'cnd:m-002',
      'cnd:mech.stronger_competing_candidate_in_final_cohort',
      'cnd:m-009',
      'cnd:mech.recruiter_volume_quota_incentive_distortion',
      'cnd:m-018',
      'cnd:mech.domain_specificity_over_weighting',
    ];
    for (const c of lifted.substrate.conditions) {
      if (comparativeIds.includes(c.id)) {
        expect(c.arity, c.id).toBe('comparative');
        expect(c.cohort, c.id).toBe('coh:requisition.pool');
        expect(lifted.substrate.cohorts.some((coh) => coh.id === c.cohort)).toBe(true);
      } else {
        expect(c.arity, c.id).toBe('absolute');
        expect(c.cohort, c.id).toBeUndefined();
      }
    }
  });

  it('distinguishes absences (A-001) from communicative statement observations (A4)', () => {
    const silence = lifted.substrate.eventClasses.find((e) => e.id === 'evc:a-001')!;
    expect(silence.communicates).toBe(false);
    expect(lifted.substrate.statements.some((s) => s.id === 'sta:a-001')).toBe(false);

    const rejection = lifted.substrate.eventClasses.find((e) => e.id === 'evc:a-002')!;
    expect(rejection.communicates).toBe(true);
    expect(lifted.substrate.statements.some((s) => s.id === 'sta:a-002')).toBe(true);
  });

  it('declares visibility rules across candidate audience and subject classes (A4)', () => {
    expect(lifted.substrate.visibilityRules.length).toBeGreaterThan(0);
    const audienceClasses = new Set(lifted.substrate.visibilityRules.map((v) => v.audience));
    expect(audienceClasses.has('cls:actor')).toBe(true);
  });

  it('lifts authored records into substrate records and flows with exact projection (A5)', () => {
    expect(bundle.records.length).toBe(13);
    expect(lifted.substrate.flows.length).toBeGreaterThan(0);
    for (const r of bundle.records) {
      expect(lifted.substrate.records.some((rec) => rec.id === `rec:${r.id.toLowerCase()}`)).toBe(true);
      for (const f of r.flows) {
        expect(
          lifted.substrate.flows.some(
            (flow) => flow.from === `rec:${r.id.toLowerCase()}` && flow.to === `rec:${f.to.toLowerCase()}`
          )
        ).toBe(true);
      }
    }
  });
});
