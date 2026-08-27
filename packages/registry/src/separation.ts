/**
 * What a probe can settle, and what nothing available can.
 *
 * The protocol never asserts which mechanism fired; it holds a set of the ones
 * compatible with what was observed. A probe outcome narrows that set by
 * removing the mechanisms it is logically incompatible with — and the more
 * useful half of this file computes what remains impossible to determine, so
 * that the answer to "what should I check next" can honestly be "nothing here
 * will tell you".
 */
import type { DiagnosticProbe } from './types.js';

export interface ProbeResult {
  probe: string;
  outcome: string;
}

export interface NarrowingStep {
  probe: string;
  outcome: string;
  label: string;
  /** Why the elimination is forced, copied from the outcome. */
  because: string;
  /** Compatible mechanisms this outcome removed. Often none. */
  eliminated: string[];
  remaining: number;
}

export interface Narrowing {
  remaining: string[];
  steps: NarrowingStep[];
  /** Results naming a probe or an outcome that does not exist. */
  unknown: ProbeResult[];
}

/**
 * Apply probe results in the order they were reported.
 *
 * `M0 includes M1 includes M2 ...` — each step can only remove, never add. A
 * result whose outcome excludes nothing still appears in the trace, because
 * "we checked and it settled nothing" is a finding the reader needs.
 */
export function narrow(compatible: string[], probes: DiagnosticProbe[], results: ProbeResult[]): Narrowing {
  const byId = new Map(probes.map((p) => [p.id, p] as const));
  let remaining = [...compatible];
  const steps: NarrowingStep[] = [];
  const unknown: ProbeResult[] = [];

  for (const result of results) {
    const probe = byId.get(result.probe);
    const outcome = (probe?.outcomes ?? []).find((o) => o.id === result.outcome);
    if (!probe || !outcome) {
      unknown.push(result);
      continue;
    }
    const eliminated = remaining.filter((id) => outcome.excludes.includes(id));
    remaining = remaining.filter((id) => !outcome.excludes.includes(id));
    steps.push({
      probe: probe.id,
      outcome: outcome.id,
      label: outcome.label,
      because: outcome.because,
      eliminated,
      remaining: remaining.length,
    });
  }

  return { remaining, steps, unknown };
}

/** A probe separates two mechanisms when one of its outcomes excludes exactly one of them. */
export function separates(probe: DiagnosticProbe, a: string, b: string): boolean {
  return (probe.outcomes ?? []).some((o) => o.excludes.includes(a) !== o.excludes.includes(b));
}

export interface SeparationReport {
  /** Every pair no available probe can tell apart. */
  indistinguishable_pairs: [string, string][];
  /**
   * Those pairs collected by transitive closure.
   *
   * Membership of a group does not mean every pair inside it is
   * indistinguishable, only that each member is tied to another by a pair
   * nothing separates. It is a summary of where the evidence runs out, not a
   * partition.
   */
  indistinguishable_groups: string[][];
  /** The smallest probe set that separates everything separable. */
  minimal_probes: string[];
  /** How many pairs any probe can settle at all. */
  separable_pairs: number;
  /** False when the probe set was too large to search exactly and a greedy cover was used. */
  exact: boolean;
}

/** Above this the exact search stops being free. */
const EXACT_LIMIT = 18;

/**
 * The smallest set of probes that distinguishes everything distinguishable,
 * and the pairs that survive every probe there is.
 *
 * Exact by exhaustive search at registry scale, which is the right trade: an
 * approximate "you need these four" invites the reader to believe a fifth would
 * have helped.
 */
export function separation(compatible: string[], probes: DiagnosticProbe[]): SeparationReport {
  // Hand-built probes reach this from the CLI and from tests, so the field is
  // treated as optional here even though the schema always fills it.
  const usable = probes.filter((p) => (p.outcomes ?? []).some((o) => o.excludes.length > 0));

  const separable: [string, string][] = [];
  const indistinguishable: [string, string][] = [];
  for (let i = 0; i < compatible.length; i++) {
    for (let j = i + 1; j < compatible.length; j++) {
      const pair: [string, string] = [compatible[i]!, compatible[j]!];
      (usable.some((p) => separates(p, pair[0], pair[1])) ? separable : indistinguishable).push(pair);
    }
  }

  const covers = (chosen: DiagnosticProbe[]) => separable.every(([a, b]) => chosen.some((p) => separates(p, a, b)));

  let minimal: DiagnosticProbe[] = [];
  let exact = true;

  if (separable.length > 0) {
    if (usable.length <= EXACT_LIMIT) {
      minimal = smallestCover(usable, covers) ?? usable;
    } else {
      exact = false;
      minimal = greedyCover(usable, separable);
    }
  }

  return {
    indistinguishable_pairs: indistinguishable,
    indistinguishable_groups: group(indistinguishable),
    minimal_probes: minimal.map((p) => p.id),
    separable_pairs: separable.length,
    exact,
  };
}

/** Combinations smallest first; the first that covers is a minimum, not a heuristic. */
function smallestCover(
  probes: DiagnosticProbe[],
  covers: (chosen: DiagnosticProbe[]) => boolean
): DiagnosticProbe[] | undefined {
  for (let size = 1; size <= probes.length; size++) {
    const chosen: DiagnosticProbe[] = [];
    const walk = (start: number): DiagnosticProbe[] | undefined => {
      if (chosen.length === size) return covers(chosen) ? [...chosen] : undefined;
      for (let i = start; i < probes.length; i++) {
        chosen.push(probes[i]!);
        const found = walk(i + 1);
        chosen.pop();
        if (found) return found;
      }
      return undefined;
    };
    const found = walk(0);
    if (found) return found;
  }
  return undefined;
}

/** The fallback for a probe set too large to search: most new pairs first. */
function greedyCover(probes: DiagnosticProbe[], separable: [string, string][]): DiagnosticProbe[] {
  const chosen: DiagnosticProbe[] = [];
  let left = [...separable];
  while (left.length > 0) {
    let best: { probe: DiagnosticProbe; gain: number } | undefined;
    for (const probe of probes) {
      if (chosen.includes(probe)) continue;
      const gain = left.filter(([a, b]) => separates(probe, a, b)).length;
      if (!best || gain > best.gain) best = { probe, gain };
    }
    if (!best || best.gain === 0) break;
    chosen.push(best.probe);
    left = left.filter(([a, b]) => !separates(best!.probe, a, b));
  }
  return chosen;
}

/** Connected components over the indistinguishable pairs. */
function group(pairs: [string, string][]): string[][] {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    const seen = parent.get(x);
    if (seen === undefined || seen === x) return x;
    const root = find(seen);
    parent.set(x, root);
    return root;
  };
  for (const [a, b] of pairs) {
    if (!parent.has(a)) parent.set(a, a);
    if (!parent.has(b)) parent.set(b, b);
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }
  const groups = new Map<string, string[]>();
  for (const key of parent.keys()) {
    const root = find(key);
    groups.set(root, [...(groups.get(root) ?? []), key]);
  }
  return [...groups.values()]
    .map((g) => g.sort())
    .sort((a, b) => b.length - a.length || a[0]!.localeCompare(b[0]!));
}
