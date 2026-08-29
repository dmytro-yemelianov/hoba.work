/**
 * Cloudflare Pages worker (Advanced Mode): one URL per page, language resolved
 * per request.
 *
 * Every page is prerendered twice, into internal trees at /_i/en/… and
 * /_i/uk/…. Nothing public carries a language. For an HTML navigation the
 * worker picks a language and serves the matching internal asset under the
 * address the reader asked for.
 *
 * Precedence, strongest signal first:
 *   ?lang=en|uk  → an explicit, shareable override; also writes the cookie
 *   hoba_lang    → the reader's own earlier choice
 *   Accept-Language — Ukrainian if it lists Ukrainian, English if it lists
 *                     anything else; a stated preference outranks geography
 *   Cloudflare geo (UA), only when the browser said nothing
 *   English
 *
 * The last rule is load-bearing. A request with no language signal is a
 * crawler, an OG scraper or a bare curl, and it must receive the language
 * sitemap.xml and the canonical URLs describe.
 *
 * /uk/… and /_i/… are permanently redirected to the public path, so every link
 * shared before this change stays alive.
 *
 * Every page is also a document. `/mechanisms/M-001.md` and the canonical URL
 * under `Accept: text/markdown` are the same file, negotiated the same way, so
 * a reader piping the site somewhere gets the language they would have read.
 */
const LANG_COOKIE = 'hoba_lang';
const LANGS = ['en', 'uk'];
const INTERNAL = '/_i';
const NON_HTML = /\.[a-z0-9]+$/i;
const STATIC_PREFIXES = ['/api/', '/data/', '/schemas/', '/_astro/', '/icons/'];

// GENERATED — do not edit by hand. Run `pnpm generate:redirects` to refresh
// from every entity's `aliases` field. See scripts/generate-redirects.ts.
const LEGACY_ALIASES = {
  "A-001": "/observations/obs.complete_silence_after_submission",
  "A-002": "/observations/obs.generic_closer_alignment_rejection_template",
  "A-003": "/observations/obs.position_closed_after_final_interview_without_hire",
  "A-004": "/observations/obs.materially_similar_role_reposted_shortly_after_rejection",
  "A-005": "/observations/obs.compensation_band_reduced_or_altered_mid_process",
  "A-006": "/observations/obs.take_home_assignment_exceeding_reasonable_stated_scope",
  "A-007": "/observations/obs.multiple_interview_reschedulings_or_interviewer_no_show",
  "A-008": "/observations/obs.explicit_feedback_citing_skill_depth_shortfall",
  "A-009": "/observations/obs.rejection_within_minutes_of_application_submission",
  "A-010": "/observations/obs.communication_mismatch_or_tone_friction_in_panel",
  "A-011": "/observations/obs.offer_rescinded_or_delayed_due_to_internal_freeze",
  "A-012": "/observations/obs.unsolicited_recruiter_outreach_followed_by_ghosting",
  "A-013": "/observations/obs.feedback_stating_candidate_is_overqualified_for_the_grade",
  "A-014": "/observations/obs.conflicting_feedback_across_different_interviewers",
  "A-015": "/observations/obs.rejection_after_the_application_sat_pending_for_months",
  "A-016": "/observations/obs.rejection_naming_an_internal_hire_as_the_outcome",
  "A-017": "/observations/obs.rejection_naming_a_jurisdiction_or_work_eligibility_ground",
  "A-018": "/observations/obs.rejection_naming_a_specific_industry_sector_as_required",
  "A-019": "/observations/obs.feedback_naming_as_absent_something_the_submitted_work_contains",
  "A-020": "/observations/obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation",
  "A-021": "/observations/obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body",
  "B-001": "/barriers/bar.application_ingestion",
  "B-002": "/barriers/bar.automated_filter_parser_threshold",
  "B-003": "/barriers/bar.inbound_screening_triage",
  "B-004": "/barriers/bar.recruiter_screening_call",
  "B-005": "/barriers/bar.technical_screen_live_assessment",
  "B-006": "/barriers/bar.take_home_work_sample_evaluation",
  "B-007": "/barriers/bar.hiring_manager_in_depth_review",
  "B-008": "/barriers/bar.team_cross_functional_panel",
  "B-009": "/barriers/bar.compensation_levelling_reconciliation",
  "B-010": "/barriers/bar.headcount_executive_budget_approval",
  "B-011": "/barriers/bar.reference_background_verification",
  "B-012": "/barriers/bar.offer_closing_contract_execution",
  "B-013": "/barriers/bar.requisition_approval_public_posting",
  "B-014": "/barriers/bar.outbound_sourcing_talent_pool_contact",
  "B-015": "/barriers/bar.client_profile_approval_and_client_interview",
  "B-016": "/barriers/bar.probation_period_post_start_confirmation",
  "I-001": "/interventions/int.auto_close_stale_job_requisitions",
  "I-002": "/interventions/int.upfront_compensation_band_disclosure",
  "I-003": "/interventions/int.standardized_late_stage_rejection_feedback_taxonomy",
  "I-004": "/interventions/int.remove_career_gap_feature_from_automated_ranking_models",
  "I-005": "/interventions/int.candidate_ats_parser_conformance_test_utility",
  "I-006": "/interventions/int.strict_take_home_timebox_blinded_evaluation_rubric",
  "I-007": "/interventions/int.requirements_drawn_from_the_team_s_own_backlog",
  "I-008": "/interventions/int.internal_candidacy_stated_in_the_posting",
  "I-009": "/interventions/int.outreach_states_the_requisition_behind_it",
  "I-010": "/interventions/int.distinct_closure_status_for_unreviewed_applications",
  "I-011": "/interventions/int.screening_note_bound_to_observations_and_disposition_codes",
  "I-012": "/interventions/int.candidate_work_index_submitted_with_the_application",
  "I-013": "/interventions/int.publish_the_technical_screen_s_columns_and_threshold_before_the_round",
  "I-014": "/interventions/int.interview_seats_booked_with_prep_time_and_a_second_name_on_the_rota",
  "I-015": "/interventions/int.dated_funding_certification_before_the_final_round",
  "I-016": "/interventions/int.verification_discrepancy_disclosure_and_reconciliation_window",
  "I-017": "/interventions/int.recorded_finalist_standing_with_a_dated_re_entry_route",
  "L-001": "/loops/loop.employment_gap_penalty_loop",
  "L-002": "/loops/loop.take_home_opportunity_cost_saturation_loop",
  "L-003": "/loops/loop.inflated_requirements_search_saturation_loop",
  "M-001": "/mechanisms/mech.genuine_technical_skill_shortfall",
  "M-002": "/mechanisms/mech.stronger_competing_candidate_in_final_cohort",
  "M-003": "/mechanisms/mech.ats_parser_extraction_failure",
  "M-004": "/mechanisms/mech.unstated_compensation_band_discrepancy",
  "M-005": "/mechanisms/mech.pre_selected_internal_candidate",
  "M-006": "/mechanisms/mech.stale_or_orphaned_job_requisition",
  "M-007": "/mechanisms/mech.headcount_freeze_or_budget_cancellation",
  "M-008": "/mechanisms/mech.automated_keyword_qualification_filter",
  "M-009": "/mechanisms/mech.recruiter_volume_quota_incentive_distortion",
  "M-010": "/mechanisms/mech.hidden_evaluation_rubric_or_undisclosed_priority",
  "M-011": "/mechanisms/mech.employment_gap_downranking_bias",
  "M-012": "/mechanisms/mech.interview_resource_scheduling_saturation",
  "M-013": "/mechanisms/mech.mid_process_role_requirement_redefinition",
  "M-014": "/mechanisms/mech.location_or_timezone_compliance_constraint",
  "M-015": "/mechanisms/mech.communication_or_working_style_friction",
  "M-016": "/mechanisms/mech.speculative_sourcing_talent_pooling_without_opening",
  "M-017": "/mechanisms/mech.experience_age_grading_mismatch",
  "M-018": "/mechanisms/mech.domain_specificity_over_weighting",
  "M-019": "/mechanisms/mech.take_home_evaluation_fatigue_asymmetry",
  "M-020": "/mechanisms/mech.automated_application_expiration_timeout",
  "M-021": "/mechanisms/mech.reference_check_discrepancy_or_regulatory_ineligibility",
  "M-022": "/mechanisms/mech.hiring_manager_consensus_impasse",
  "M-023": "/mechanisms/mech.portfolio_work_artifact_misinterpretation",
  "M-024": "/mechanisms/mech.inflated_requisition_requirements_vs_actual_team_needs",
  "M-025": "/mechanisms/mech.bid_conditional_talent_pool",
  "M-026": "/mechanisms/mech.bench_priority_fill",
  "M-027": "/mechanisms/mech.start_date_slippage_and_post_acceptance_revocation",
  "M-028": "/mechanisms/mech.probation_used_as_extended_de_facto_interview",
  "P-001": "/patterns/pat.seniority_double_bind",
  "P-002": "/patterns/pat.closed_then_reposted_requisition_motif",
  "P-003": "/patterns/pat.experience_age_impossibility",
  "P-004": "/patterns/pat.compensation_double_bind"
};
// END GENERATED

/**
 * Collections that changed name. Every URL under the old prefix moves to the
 * new one, extension and all, so `/artifacts/obs.x.md` lands on
 * `/observations/obs.x.md`.
 */
const RENAMED_ROUTES = {
  '/artifacts': '/observations',
};

export function readCookie(cookieHeader, name) {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

export function parseAcceptLanguage(header) {
  if (!header) return [];
  return header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((l) => l.tag && !Number.isNaN(l.q) && l.q > 0)
    .sort((a, b) => b.q - a.q)
    .map((l) => l.tag);
}

/** 'uk' | 'en' */
export function preferredLocale({ query, cookie, acceptLanguage, country }) {
  if (LANGS.includes(query)) return query;

  const chosen = readCookie(cookie, LANG_COOKIE);
  if (LANGS.includes(chosen)) return chosen;

  const languages = parseAcceptLanguage(acceptLanguage);
  if (languages.some((tag) => tag === 'uk' || tag.startsWith('uk-'))) return 'uk';
  // A browser that named its languages has stated a preference. Geography is an
  // inference about the same question, and it does not get to overrule the
  // answer: someone in Kyiv running an English browser is telling us something.
  // It also keeps the test suite from depending on where it is run from.
  if (languages.length > 0) return 'en';
  if (country === 'UA') return 'uk';
  return 'en';
}

/** Markdown is a representation of a page, so it is negotiated like one. */
export const MARKDOWN = /\.md$/;

/** True when this path is served from disk as-is, with no language dimension. */
export function isStaticAsset(pathname) {
  if (MARKDOWN.test(pathname)) return false;
  return NON_HTML.test(pathname) || STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Which representation the reader asked for: the `.md` extension, or the
 * canonical URL with an Accept header that prefers Markdown over HTML.
 */
export function wantsMarkdown(pathname, accept) {
  if (MARKDOWN.test(pathname)) return true;
  if (!accept) return false;
  const markdown = accept.indexOf('text/markdown');
  if (markdown === -1) return false;
  const html = accept.indexOf('text/html');
  return html === -1 || markdown < html;
}

/**
 * Legacy and internal addresses collapse onto the public one. Returns the path
 * to redirect to, or null when the request is already at its public address.
 */
export function legacyRedirect(pathname) {
  if (pathname === '/uk' || pathname.startsWith('/uk/')) return pathname.slice(3) || '/';
  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    const stripped = pathname.replace(new RegExp(`^${INTERNAL}/(?:${LANGS.join('|')})(?=/|$)`), '');
    return stripped || '/';
  }
  const trimmed = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  const lastSegment = trimmed.slice(trimmed.lastIndexOf('/') + 1);
  const isMarkdown = MARKDOWN.test(lastSegment);
  const key = isMarkdown ? lastSegment.slice(0, -3) : lastSegment;
  // The alias table first, because its targets already carry the new
  // collection name — so `/artifacts/A-001` lands on its canonical
  // `/observations/obs.…` in one hop rather than two.
  if (Object.prototype.hasOwnProperty.call(LEGACY_ALIASES, key)) {
    return LEGACY_ALIASES[key] + (isMarkdown ? '.md' : '');
  }

  // A renamed *collection*, not a renamed entity: `artifact` became
  // `observation`. The alias table cannot express this — it maps one key to one
  // path, and this rewrites the prefix of every observation URL at once.
  for (const [from, to] of Object.entries(RENAMED_ROUTES)) {
    if (trimmed === from) return to;
    if (trimmed.startsWith(`${from}/`)) return to + trimmed.slice(from.length);
  }

  return null;
}

/**
 * Where the prerendered document actually lives. Always the trailing-slash
 * directory form: the bare and .html forms answer with a 308 whose Location
 * would leak the internal path.
 */
export function internalPath(pathname, lang, { markdown = false } = {}) {
  const bare = pathname.replace(MARKDOWN, '');
  if (markdown) return `${INTERNAL}/${lang}${bare === '/' || bare === '' ? '/index' : bare}.md`;
  const clean = bare === '/' ? '' : bare.replace(/\/$/, '');
  return `${INTERNAL}/${lang}${clean}/`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

    const redirect = legacyRedirect(url.pathname);
    if (redirect) {
      const location = new URL(redirect + url.search, url.origin);
      return new Response(null, { status: 301, headers: { location: location.toString() } });
    }

    if (isStaticAsset(url.pathname)) return env.ASSETS.fetch(request);

    const query = url.searchParams.get('lang');
    const lang = preferredLocale({
      query,
      cookie: request.headers.get('cookie'),
      acceptLanguage: request.headers.get('accept-language'),
      country: request.cf && request.cf.country,
    });

    const markdown = wantsMarkdown(url.pathname, request.headers.get('accept'));

    // The internal request must not carry the public query: it would miss the
    // asset and would pollute any cache key built from it.
    const internal = (path) => new Request(new URL(internalPath(path, lang, { markdown }), url.origin), request);
    let asset = await env.ASSETS.fetch(internal(url.pathname));
    if (asset.status === 404 && !markdown) {
      // Pages only knows about a root 404.html. Serve the not-found page from
      // the tree we resolved, so it is in the reader's language.
      const notFound = await env.ASSETS.fetch(internal('/404'));
      if (notFound.ok) asset = new Response(notFound.body, { ...notFound, status: 404 });
    }

    const response = new Response(asset.body, asset);
    if (markdown && asset.ok) response.headers.set('content-type', 'text/markdown; charset=utf-8');
    response.headers.set('content-language', lang);
    response.headers.set('vary', 'Accept, Accept-Language, Cookie');
    // A language-negotiated document is per-reader. The CDN does not cache HTML
    // here in any case; this states it rather than relying on that.
    response.headers.set('cache-control', 'private, no-cache');
    if (LANGS.includes(query)) {
      response.headers.append('set-cookie', `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`);
    }
    return response;
  },
};
