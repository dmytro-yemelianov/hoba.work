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

const norm = (value: string) => value.trim().toLowerCase();
const has = (list: string[] | undefined, value: string) => (list ?? []).some((v) => norm(v) === norm(value));

/**
 * Run the check.
 *
 * Order matters: the gates are returned in funnel order so that `stops_at` is
 * the first place a run would actually halt, not the worst-sounding one.
 */
export function checkConformance(profile: CandidateProfile, posting: PostingFacets): ConformanceReport {
  const gates: GateOutcome[] = [];

  // The requirement itself, before anyone is measured against it.
  if (posting.required_years !== undefined && posting.technology_age !== undefined) {
    const impossible = posting.required_years > posting.technology_age;
    gates.push({
      gate: 'B-013',
      stage: 'pre-posting',
      state: 'real-need',
      verdict: impossible ? 'unsatisfiable' : 'passes',
      reason: impossible
        ? { code: 'years.impossible', params: { required: posting.required_years, existed: posting.technology_age } }
        : { code: 'years.possible', params: { required: posting.required_years, existed: posting.technology_age } },
      mechanisms: ['M-024', 'M-017'],
    });
  }

  // A stated minimum against a dated history is arithmetic.
  if (posting.required_years !== undefined) {
    const known = profile.years !== undefined;
    const short = known && profile.years! < posting.required_years;
    gates.push({
      gate: 'B-002',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: !known ? 'undetermined' : short ? 'fails' : 'passes',
      reason: !known
        ? { code: 'years.unknown', params: { required: posting.required_years } }
        : short
          ? { code: 'years.short', params: { required: posting.required_years, have: profile.years! } }
          : { code: 'years.met', params: { required: posting.required_years, have: profile.years! } },
      mechanisms: ['M-008', 'M-011'],
    });
  }

  // Authorisation is a yes or a no, and the system treats it as one.
  if (posting.requires_authorisation_in) {
    const known = (profile.authorised_for ?? []).length > 0;
    const authorised = has(profile.authorised_for, posting.requires_authorisation_in);
    gates.push({
      gate: 'B-002',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: !known ? 'undetermined' : authorised ? 'passes' : 'fails',
      reason: !known
        ? { code: 'authorisation.unknown', params: { where: posting.requires_authorisation_in } }
        : authorised
          ? { code: 'authorisation.present', params: { where: posting.requires_authorisation_in } }
          : { code: 'authorisation.absent', params: { where: posting.requires_authorisation_in } },
      mechanisms: ['M-014'],
    });
  }

  if ((posting.hiring_locations ?? []).length > 0) {
    const known = Boolean(profile.located_in);
    const inside = known && has(posting.hiring_locations, profile.located_in!);
    gates.push({
      gate: 'B-002',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: !known ? 'undetermined' : inside ? 'passes' : 'fails',
      reason: !known
        ? { code: 'location.unknown', params: { places: (posting.hiring_locations ?? []).join(', ') } }
        : inside
          ? { code: 'location.inside', params: { where: profile.located_in! } }
          : { code: 'location.outside', params: { where: profile.located_in!, places: (posting.hiring_locations ?? []).join(', ') } },
      mechanisms: ['M-014'],
    });
  }

  // A missing phrase decides nothing on its own, and saying otherwise would be
  // the fiction this whole file exists to avoid.
  if ((posting.required_skills ?? []).length > 0) {
    const missing = (posting.required_skills ?? []).filter((s) => !has(profile.skills, s));
    gates.push({
      gate: 'B-002',
      stage: 'ingestion',
      state: 'machine-check',
      verdict: 'undetermined',
      reason:
        missing.length > 0
          ? { code: 'skills.missing', params: { missing: missing.join(', '), n: missing.length } }
          : { code: 'skills.present', params: { n: (posting.required_skills ?? []).length } },
      mechanisms: ['M-003', 'M-008', 'M-011'],
    });
  }

  // The band is the other place the answer is a number.
  if (profile.expectation !== undefined && (posting.band_min !== undefined || posting.band_max !== undefined)) {
    const above = posting.band_max !== undefined && profile.expectation > posting.band_max;
    const below = posting.band_min !== undefined && profile.expectation < posting.band_min;
    gates.push({
      gate: 'B-009',
      stage: 'compensation',
      state: 'level-and-band',
      verdict: above ? 'fails' : 'passes',
      reason: above
        ? { code: 'band.above', params: { expectation: profile.expectation, max: posting.band_max! } }
        : below
          ? { code: 'band.under', params: { expectation: profile.expectation, min: posting.band_min! } }
          : { code: 'band.inside', params: { expectation: profile.expectation } },
      mechanisms: ['M-004'],
    });
  } else if (posting.band_min === undefined && posting.band_max === undefined && profile.expectation !== undefined) {
    gates.push({
      gate: 'B-009',
      stage: 'compensation',
      state: 'level-and-band',
      verdict: 'undetermined',
      reason: { code: 'band.unpublished', params: {} },
      mechanisms: ['M-004'],
    });
  }

  return {
    gates,
    stops_at: gates.find((g) => g.verdict === 'fails'),
    unsatisfiable: gates.filter((g) => g.verdict === 'unsatisfiable'),
    undetermined: gates.filter((g) => g.verdict === 'undetermined').length,
  };
}
