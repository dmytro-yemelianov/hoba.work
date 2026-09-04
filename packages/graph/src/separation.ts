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
import type {
  DiagnosticProbe,
  Narrowing,
  ProbeResult,
  SeparationReport,
} from '@hoba/registry-core/types';
import {
  substrateNarrow,
  substrateSeparates,
  substrateSeparation,
} from './substrate/derivations.js';

/**
 * Apply probe results in the order they were reported.
 *
 * `M0 includes M1 includes M2 ...` — each step can only remove, never add. A
 * result whose outcome excludes nothing still appears in the trace, because
 * "we checked and it settled nothing" is a finding the reader needs.
 */
export function narrow(
  compatible: string[],
  probes: DiagnosticProbe[],
  results: ProbeResult[]
): Narrowing {
  return substrateNarrow(compatible, probes, results);
}

/** A probe separates two mechanisms when one of its outcomes excludes exactly one of them. */
export function separates(probe: DiagnosticProbe, a: string, b: string): boolean {
  return substrateSeparates(probe, a, b);
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
