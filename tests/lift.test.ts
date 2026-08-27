import { describe, expect, it } from 'vitest';
import { findRegistryRoot, lift, loadRegistryFromRoot, project, validateSubstrate } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

/**
 * The equivalence gate (PLAN-SUBSTRATE A2).
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
      if (id.startsWith('B-')) expect(rest, id).not.toHaveProperty('pass_condition');
      if (id.startsWith('M-')) {
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
        const fromEntities = (t.entities ?? []).filter((e) => e.startsWith('B-')).map((e) => `cnd:${e.toLowerCase()}`);
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
});
