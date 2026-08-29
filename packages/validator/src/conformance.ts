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













import { substrateCheckConformance } from '@hoba/graph/substrate/derivations';
import type { CandidateProfile, ConformanceReport, PostingFacets } from '@hoba/registry-core/types';

/**
 * Run the check.
 *
 * Order matters: the gates are returned in funnel order so that `stops_at` is
 * the first place a run would actually halt, not the worst-sounding one.
 */
export function checkConformance(profile: CandidateProfile, posting: PostingFacets): ConformanceReport {
  return substrateCheckConformance(profile, posting);
}
