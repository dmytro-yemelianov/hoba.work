/**
 * Which configured gates a profile fails, and only that.
 *
 * This is a conformance check, not an optimiser. It never rewrites anything and
 * it never scores anyone: given what a posting states as mandatory and what a
 * person can evidence, it reports the gates where the answer is arithmetic —
 * a number against a threshold, a location against a list — and says
 * `undetermined` everywhere else, which is most places.
 *
 * The employer side is a facet vector supplied by the reader, never a record of
 * a company. The atlas holds no company data and this file is not where that
 * changes.
 *
 * Two things it will not do. It will not tell anyone how likely they are to be
 * hired: there is no denominator for that and a fabricated one would invert the
 * point of the project. And a missing keyword is not a failure here — whether a
 * phrase is a knockout rule or one input to a ranking model is not visible from
 * outside the system, so the honest verdict is that it cannot be determined.
 */
import type { StageId } from './types.js';

export interface CandidateProfile {
  /** Years of relevant experience the dated history supports. */
  years?: number;
  /** Phrases the person can evidence, lowercased by the caller or by `check`. */
  skills?: string[];
  /** Where the person can lawfully work, as the reader names those places. */
  authorised_for?: string[];
  /** Where the person is, in the same vocabulary as `hiring_locations`. */
  located_in?: string;
  /** What they have said they expect, in the same unit as the band. */
  expectation?: number;
}

export interface PostingFacets {
  /** Years the posting states as a minimum. */
  required_years?: number;
  /** Phrases the posting states as mandatory. */
  required_skills?: string[];
  /** Where authorisation is required, if the posting says so. */
  requires_authorisation_in?: string;
  /** The places the posting says it hires in. */
  hiring_locations?: string[];
  band_min?: number;
  band_max?: number;
  /**
   * How long the required thing has existed, in years, where the reader knows.
   *
   * The one check here that can return a verdict about the posting rather than
   * about the person: a requirement for more years than the thing has existed
   * cannot be met by anybody.
   */
  technology_age?: number;
}

export type GateVerdict = 'passes' | 'fails' | 'undetermined' | 'unsatisfiable';

export interface GateReason {
  /** A message key the caller localises; this package holds no prose. */
  code: string;
  params: Record<string, string | number>;
}

export interface GateOutcome {
  /** The barrier this is about. */
  gate: string;
  stage: StageId;
  /** The state of the canonical path where it is decided. */
  state: string;
  verdict: GateVerdict;
  reason: GateReason;
  /** Registry mechanisms that operate here, for the reader to go and read. */
  mechanisms: string[];
}

export interface ConformanceReport {
  gates: GateOutcome[];
  /** The first gate that fails, if any: where a run would deterministically stop. */
  stops_at?: GateOutcome;
  /** Requirements nobody could meet, which is a fact about the posting. */
  unsatisfiable: GateOutcome[];
  /** How many gates the check simply cannot decide. */
  undetermined: number;
}

import { substrateCheckConformance } from './substrate/derivations.js';

/**
 * Run the check.
 *
 * Order matters: the gates are returned in funnel order so that `stops_at` is
 * the first place a run would actually halt, not the worst-sounding one.
 */
export function checkConformance(profile: CandidateProfile, posting: PostingFacets): ConformanceReport {
  return substrateCheckConformance(profile, posting);
}
