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
import {
  substrateNarrow,
  substrateSeparates,
  substrateSeparation,
} from './substrate/derivations.js';

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
  return substrateNarrow(compatible, probes, results);
}

/** A probe separates two mechanisms when one of its outcomes excludes exactly one of them. */
export function separates(probe: DiagnosticProbe, a: string, b: string): boolean {
  return substrateSeparates(probe, a, b);
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

/**
 * The smallest set of probes that distinguishes everything distinguishable,
 * and the pairs that survive every probe there is.
 *
 * Exact by exhaustive search at registry scale, which is the right trade: an
 * approximate "you need these four" invites the reader to believe a fifth would
 * have helped.
 */
export function separation(compatible: string[], probes: DiagnosticProbe[]): SeparationReport {
  return substrateSeparation(compatible, probes);
}
