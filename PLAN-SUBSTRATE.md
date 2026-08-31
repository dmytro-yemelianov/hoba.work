# Substrate implementation plan

How SPEC-MODEL.md becomes code and content without breaking a site that is
live in two languages. The spec is the *what*; this is the *in which order and
behind which gates*.

## Where this stands (2026-08-31)

Stages A1–A7 and B1–B3 were tracked as issues #21–#30. All ten are complete
and closed; the equivalence gate remains live and green.

| stage | state |
|---|---|
| A1 schema | **done** — `056b55e`. The two parse-enforced policies held. |
| A2 gate | **done** — `3abe97c`. Held on both mirrors on the first run. |
| A3 derivations | **done**. Queries re-derived with 100% equivalence; pattern finding: `pat.seniority_double_bind` & `pat.experience_age_impossibility` computed-empty, `pat.closed_then_reposted_requisition_motif` & `pat.compensation_double_bind` prose-asserted. |
| A4 expressiveness | **done**. Comparative arity & cohorts on `mech.stronger_competing_candidate_in_final_cohort`/`mech.recruiter_volume_quota_incentive_distortion`/`mech.domain_specificity_over_weighting`; statements on communicative observations; visibility rules in substrate. |
| A5 records & flows | **done**. 4 seed shapes (R-001–R-013) authored in EN & UK at zero amounts; lifted to substrate records & flows. |
| A6 engine swap | **done**. `narrow()`, `checkConformance()`, `separation()` rewired to unified substrate derivations. |
| A7 Lean | **done**. Substrate summary, conditions, processes, records, flow conservation, and DAG theorems kernel-proved in Lean. |
| B1 client account | **done**. `client` actor, `bar.client_profile_approval_and_client_interview`, `proc.client_account_hiring_funnel` (13 states / 16 transitions), `mech.bid_conditional_talent_pool`, `mech.bench_priority_fill` across both mirrors. |
| B2 epilogue | **done**. `bar.probation_period_post_start_confirmation`, `mech.start_date_slippage_and_post_acceptance_revocation`, `mech.probation_used_as_extended_de_facto_interview`, `obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation`, `evidence.probation_period_limits_and_dismissal_standards_ukraine_labour_code_art_26_28`, `evidence.statutory_notice_and_contractual_probation_parameters_uk_employment_rights_act_1996` across both mirrors. |
| B3 observations | **done**. `obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body` (republished posting with refreshed date) splitting `mech.stale_or_orphaned_job_requisition` and `mech.genuine_technical_skill_shortfall`/`mech.bid_conditional_talent_pool`. |
| C1 total discrimination | **done**. Probe exclusions and rationales audited and landed across all 21 observations in both mirrors. |
| C2 temporal matrix | **done**. Full latency bounds (`latency_expected_days`, `latency_max_days`) added across `proc.the_hiring_funnel_end_to_end`, `proc.an_application_inside_the_ats`, `proc.client_account_hiring_funnel`; temporal anomaly engine implemented. |
| C3 economic calculus | **done**. Runway calculus (`substrateCalculateRunway`), fee yield distributions, and flow conservation verification (`substrateVerifyFlowConservation`). |
| C4 formal temporal proofs | **done**. Lean 4 kernel theorems on topological acyclicity, event class presence, condition partition, and depth bounds. |

The two design decisions are now embodied in the shipped model. Records use
the RFC's `R-` prefix, closed record classes and zero-amount seed shapes.
Client-account hiring is a separate `proc.client_account_hiring_funnel`, with
the `client` stage and `bench-filled` as its own terminal.

## Invariants, before any stage

1. **`pnpm task check` is green after every commit.** No stage is allowed a
   broken intermediate state on `main`.
2. **The equivalence gate.** From the moment the substrate exists, a test
   lifts the loaded bundle into it, projects back, and deep-equals the result
   against the loader's output — both mirrors. The loader is already
   deterministic (verified: two loads are byte-identical), so this needs no
   golden files. Until this gate passes, no new capability may be built on the
   substrate; after it passes, it may never go red.
3. **Public URLs and ids do not change.** An entity keeps the same public id
   either side of the lift — on the site, in the API, in the exports. Substrate
   ids are derived from it (`cnd:bar.automated_filter_parser_threshold`),
   internal, and never in a URL.
4. **Shapes first, amounts and instances only with evidence** — the settled
   discipline, applied to every stage below, not only the money.
5. **Each language judged on its own.** Every authored addition lands in both
   mirrors, written separately, as the standing rule requires.

## The architectural decision the plan rests on

**The substrate is computed before it is authored.** Stage one derives the
entire substrate mechanically from the ten-type content that already exists —
no file moves, no rewrite of 120 entries. Authoring changes only where the ten
types *cannot say the thing*: fidelity links, chain shapes, cohort arity,
visibility overrides, epilogue states. Those arrive as small new fields and
small new files, the way `observed_at` did, never as a migration.

This is also the risk containment: the worst outcome would be a second model
living beside the first. The equivalence gate makes that impossible by
construction — there is one source of truth (the content), one derivation, and
a proof that the derivation loses nothing.

## Two tracks

Track A is code; track B is content in the *current* types. They are
independent until A5, which is the first stage where content needs the
substrate to exist.

---

### Track A — the substrate

**A1. Schema.** `packages/graph/src/substrate/` — types and Zod for the
four primitives and their settled refinements: record classes and records;
parties as records that emit; event classes, events, order positions, optional
`elapsed`; conditions with `owner` (three positions), `determinacy`, `arity`;
visibility classes with per-entry overrides; statement records with the
existing fidelity enum; flows; processes; cohorts. Unit tests on the schema
alone. *No content, no site change. Size: M.*
**Done.** The two policies live in the parser as designed: a flow amount
refuses to parse without evidence, a comparative condition without its cohort.
`validateSubstrate()` reports every referential problem at once.

**A2. Lift and project — the gate.** `lift(bundle) → Substrate` and
`project(substrate) → bundle`, with the equivalence test over both mirrors.
The one real design problem lives here: B-\* barriers and workflow states are
the same points authored twice, so the lift unifies each pair into one
condition and the projection regenerates both surfaces. When this passes, the
barrier↔state sync check in `tests/content.test.ts` is true by construction —
it stays as a regression tripwire but can no longer fail first.
*Size: L. This is the crux of the whole plan.*
**Done, and it held on the first run — both mirrors, deep-equal.** It demanded
two schema amendments straight from the spec's view table: conditions gained
`causes` (a mechanism-condition's emitted events) and `accounts_for` (the
gates it is an account of). One data finding, resolved by documented rule:
`bar.application_ingestion` is owned by the candidate on `proc.the_hiring_funnel_end_to_end`'s edge and by the vendor on
`proc.an_application_inside_the_ats`'s; the first workflow's reading wins until visibility is per-party
(A4). An authority test proves no stripped field survives in the sidecar.

**A3. Existing derivations, re-derived.** Prove "one query family" on things
that already have answers: `gaps()` (subsumption, identifiability),
`separation()`, loops, route counting — each re-implemented as a substrate
query with an equivalence test against the current implementation. Nothing is
rewired yet; the site keeps reading the old code. Then the one genuinely new
computation: **pattern emptiness**. Each P-\* trigger gets expressed as a
condition set and checked. The spec names the risk plainly — one of the four
may not compute — and either outcome is a finding: a computed pattern gets
promoted, an uncomputable one is published as prose-asserted, honestly
labelled. *Size: M, plus the pattern finding whatever it turns out to be.*
**Done.** `packages/graph/src/substrate/derivations.ts` implements the full
query family (`substrateGaps`, `substrateSeparation`, `substrateNarrow`,
`substrateClosure`, `substrateLoops`, `substrateProcessMetrics`) with 100%
equivalence across both mirrors (`tests/derivations.test.ts`). Pattern emptiness
evaluated: `pat.seniority_double_bind` (seniority double bind) and `pat.experience_age_impossibility` (experience-age impossibility)
compute as strictly empty sets over discrete ranks and technology age bounds;
`pat.closed_then_reposted_requisition_motif` (closed-then-reposted) and `pat.compensation_double_bind` (compensation double bind) are honestly
classified as `prose_asserted` due to unobservable hidden states and opaque bands.

**A4. The new expressiveness, smallest first.** Three schema additions in the
`observed_at` style — a field, a lift rule, a test:
- `arity` on the three comparative mechanisms (`mech.stronger_competing_candidate_in_final_cohort`, `mech.recruiter_volume_quota_incentive_distortion`, `mech.domain_specificity_over_weighting`) plus the
  cohort object their conditions range over;
- statement links on the observations that are statements (`obs.generic_closer_alignment_rejection_template` is one,
  `obs.complete_silence_after_submission` is an absence — the lift already knows the difference);
- visibility classes replacing the single `facets.visibility` value in the
  substrate, with the facet kept in the projection so nothing public moves.
*Size: M.*
**Done.** `packages/graph/src/substrate/lift.ts` attaches `cohort: 'coh:requisition.pool'`
and `arity: 'comparative'` to `mech.stronger_competing_candidate_in_final_cohort`, `mech.recruiter_volume_quota_incentive_distortion`, `mech.domain_specificity_over_weighting`; attaches statements to all
communicative observations while preserving `obs.complete_silence_after_submission` as non-communicating silence;
and populates substrate-level `visibilityRules`. The equivalence gate in
`tests/lift.test.ts` passes cleanly on both mirrors.

**A5. Records and flows.** The first substrate-native authored content: a
one-page format RFC (goes to you before any file is written), then the chain
shapes — own-account, client-account, agency placement, applicant runway —
as records and flows with **no amounts**. Chains are computed from them, never
authored. Surfaces: the entry pages and `/data` gain the shape of *who funds
this seat and who is paid along the way*; the freeze entry gains its three
chains. Public data exports gain a new optional file; `schema_version` minor
bump. *Size: M code, M content ×2 languages.*
**Done.** 13 authored records (`R-001`–`R-013`) authored in `content/records/` and
`content-uk/records/` across the four seed shapes with zero amounts; loaded,
validated, and lifted into substrate `records` and `flows` with clean projection
in `tests/lift.test.ts`.

**A6. The query engine swap.** `narrow()`, `checkConformance()` and the
diagnostic engine become three instances of one projection-consistency query
over the substrate. Swap order per module: equivalence test first, rewire
second, delete third. The wizard, CLI and MCP read the same engine at the end.
*Size: L, but mechanical after A3.*
**Done.** `narrow()`, `checkConformance()`, `separation()`, `separates()`
delegated directly to substrate derivations in `packages/graph/src/substrate/derivations.ts`.
CLI, MCP, wizard, and test suite run over the unified substrate engine.

**A7. Lean, last.** The substrate becomes what the proofs quantify over:
funnel-order acyclicity, one-condition-per-gate, and conservation move from
`proc.the_path_as_it_is_supposed_to_run`-specific theorems to substrate-level ones. Current proofs stay green
throughout via the projection. *Size: M, deliberately unblocking — nothing
waits on it.*
**Done.** `SubstrateSummary` data emitted to `formal/lean/Hoba/Data.lean`; substrate-level
theorems for barrier condition counts, mechanism condition counts, condition partitioning,
flow conservation, process tracking, and DAG acyclicity kernel-proved in `formal/lean/Hoba/Theorems.lean`.

### Track B — content the current types can already hold

**B1. The client account.** No substrate needed for most of it: a `client`
actor; the client-approval gate (a new B-\* after the panel, owned by a party
outside the employer); the bid-conditional pool and bench mechanisms; the
client-account walk of the funnel (either `proc.client_account_hiring_funnel` or a variant lens on `proc.the_hiring_funnel_end_to_end` —
decided when writing, whichever reads better); and the re-read the spec
ordered — every entry that quietly assumes an own-account company, `bar.technical_screen_live_assessment`'s
cost asymmetry first. All ×2 languages. Sourcing per the standing rule; the
Ukrainian civil-service statute (`evidence.openings_that_exist_because_a_rule_requires_them_ukraine_civil_service_competitions`) already anchors the mandated-posting
premise. *Size: L content. Starts immediately — it depends on nothing in
track A.*
**Done.** `client` actor, `bar.client_profile_approval_and_client_interview` (Client Profile Approval and Client Interview,
stage: `client`, order 15), `proc.client_account_hiring_funnel` (Client account hiring funnel: 13 states,
16 transitions), `mech.bid_conditional_talent_pool` and `mech.bench_priority_fill` across both mirrors. All formal Lean proofs
and tests pass cleanly.

**B2. The epilogue.** States past `hired` in the funnel and the canonical
path: start-date shift, no-show in both directions, probation, probation-end
outcomes. The probation-cost parameter cited from law records (Ukraine's
labour code articles on the trial period; one EU contrast). Lean's depth
constant changes and the proofs are updated with it — that is a planned edit,
not a break. *Size: M content ×2, S code.*
**Done.** Authored `bar.probation_period_post_start_confirmation` (Probation Period & Post-Start Confirmation),
`mech.start_date_slippage_and_post_acceptance_revocation` (Start-Date Slippage and Post-Acceptance Revocation), `mech.probation_used_as_extended_de_facto_interview` (Probation
Used as Extended De-Facto Interview), `obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation` (Offer accepted followed by delayed
start date or revocation), `evidence.probation_period_limits_and_dismissal_standards_ukraine_labour_code_art_26_28` (Ukraine KZpP art. 26–28), and `evidence.statutory_notice_and_contractual_probation_parameters_uk_employment_rights_act_1996`
(UK ERA 1996 s. 86) across both English and Ukrainian mirrors.

**B3. Statement-adjacent observations** as the sourcing turns them up — the
republished-posting-with-new-date pattern from the DOU threads is the first
candidate. Only entries that split something, per the `obs.rejection_after_the_application_sat_pending_for_months`…`obs.feedback_naming_as_absent_something_the_submitted_work_contains` discipline.
*Size: S, opportunistic.*
**Done.** Authored `obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body` (Republished job posting with refreshed date and identical
requirement body / Повторно опублікована вакансія з оновленою датою та ідентичним описом вимог)
with diagnostic probe `PROBE-`obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body`-1` separating `mech.stale_or_orphaned_job_requisition` from active searches and `mech.genuine_technical_skill_shortfall`.

---

## Order and dependencies

```
A1 ─ A2 ─ A3 ─┬─ A4 ─ A5 ─┐
              └─ A6 ←──────┴─ (A7 any time after A2)
B1 ──────────── B2 ─ B3        (parallel to all of track A)
```

Meeting point: A5's client-account chain shape attaches to B1's entries.
Nothing else crosses tracks.

## Reader-visible milestones

| after | the reader gets |
|---|---|
| B1 | the client-account funnel: the gate they wait at after passing everything, the bench, the bid-conditional role |
| A3 | `/data` publishes which patterns are computed and which are asserted — either way, a new honesty |
| A5 | every entry states who funds the seat and who is paid along the way; the freeze shows its three chains |
| B2 | the funnel no longer ends at the signature |
| A6 | the wizard, the CLI and the MCP answer from one engine |

A1, A2 and A4 are deliberately invisible: they are what makes the rest safe.

## Risks, named

- **A2 fails to reach byte-equality.** Most likely cause: an asymmetry between
  the mirrors the loader currently tolerates. Then the fix is in content, not
  in code, and the gate has done its job early.
- **A pattern does not compute.** Named in the spec as an acceptable outcome;
  the plan publishes it rather than papering over it.
- **Scope creep toward simulation.** The refusals in SPEC-MODEL §8 are the
  test list: any stage that would let the model say *which event will occur*
  is out of plan by definition.
- **Bilingual drift.** Every B-stage lands both mirrors in one commit, as now,
  and the language-parity checks stay the gate.

## Decisions implemented

1. The sequencing landed as issues #21–#30; all are closed as completed.
2. The records-and-flows RFC lives at
   `docs/decided/2026-08-rfc-records-and-flows.md`, and its three recommended
   choices are the implemented format.
3. The client funnel follows option A from
   `docs/decided/2026-08-draft-client-funnel.md`: a separate process, a
   dedicated `client` stage, and a distinct `bench-filled` terminal.

The substrate programme is complete. Follow-up work is tracked as separate
product and projection-integrity issues rather than as another substrate stage.
