# Substrate implementation plan

How SPEC-MODEL.md becomes code and content without breaking a site that is
live in two languages. The spec is the *what*; this is the *in which order and
behind which gates*.

## Where this stands (2026-08-29)

Stages are issues #21–#30 on the board. The gate is live and green.

| stage | state |
|---|---|
| A1 schema | **done** — `056b55e`. The two parse-enforced policies held. |
| A2 gate | **done** — `3abe97c`. Held on both mirrors on the first run. |
| A3 derivations | **done**. Queries re-derived with 100% equivalence; pattern finding: P-001 & P-003 computed-empty, P-002 & P-004 prose-asserted. |
| A4 expressiveness | **done**. Comparative arity & cohorts on M-002/M-009/M-018; statements on communicative observations; visibility rules in substrate. |
| A5 records & flows | **done**. 4 seed shapes (R-001–R-013) authored in EN & UK at zero amounts; lifted to substrate records & flows. |
| A6 engine swap | **done**. `narrow()`, `checkConformance()`, `separation()` rewired to unified substrate derivations. |
| A7 Lean | **done**. Substrate summary, conditions, processes, records, flow conservation, and DAG theorems kernel-proved in Lean. |
| B1 client account | **done**. `client` actor, `B-015`, `WF-004` (13 states / 16 transitions), `M-025`, `M-026` across both mirrors. |
| B2 epilogue | **done**. `B-016`, `M-027`, `M-028`, `A-020`, `EVD-040`, `EVD-041` across both mirrors. |
| B3 observations | **done**. `A-021` (republished posting with refreshed date) splitting `M-006` and `M-001`/`M-025`. |
| C1 total discrimination | **done**. Probe exclusions and rationales audited and landed across all observations A-001..A-021 in both mirrors. |
| C2 temporal matrix | **done**. Full latency bounds (`latency_expected_days`, `latency_max_days`) added across WF-001, WF-002, WF-004; temporal anomaly engine implemented. |
| C3 economic calculus | **done**. Runway calculus (`substrateCalculateRunway`), fee yield distributions, and flow conservation verification (`substrateVerifyFlowConservation`). |
| C4 formal temporal proofs | **done**. Lean 4 kernel theorems on topological acyclicity, event class presence, condition partition, and depth bounds. |

Open decisions, both with the author: the RFC's three points, and the
WF-004-versus-variant call with its two sub-questions (the `client` stage
value; `bench-filled` as its own terminal).

## Invariants, before any stage

1. **`pnpm task check` is green after every commit.** No stage is allowed a
   broken intermediate state on `main`.
2. **The equivalence gate.** From the moment the substrate exists, a test
   lifts the loaded bundle into it, projects back, and deep-equals the result
   against the loader's output — both mirrors. The loader is already
   deterministic (verified: two loads are byte-identical), so this needs no
   golden files. Until this gate passes, no new capability may be built on the
   substrate; after it passes, it may never go red.
3. **Public URLs and ids do not change.** `B-002` stays `B-002` on the site,
   in the API, in the exports. Substrate ids are derived (`cnd:B-002`),
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

**A1. Schema.** `packages/registry/src/substrate/` — types and Zod for the
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
B-001 is owned by the candidate on WF-001's edge and by the vendor on
WF-002's; the first workflow's reading wins until visibility is per-party
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
**Done.** `packages/registry/src/substrate/derivations.ts` implements the full
query family (`substrateGaps`, `substrateSeparation`, `substrateNarrow`,
`substrateClosure`, `substrateLoops`, `substrateProcessMetrics`) with 100%
equivalence across both mirrors (`tests/derivations.test.ts`). Pattern emptiness
evaluated: P-001 (seniority double bind) and P-003 (experience-age impossibility)
compute as strictly empty sets over discrete ranks and technology age bounds;
P-002 (closed-then-reposted) and P-004 (compensation double bind) are honestly
classified as `prose_asserted` due to unobservable hidden states and opaque bands.

**A4. The new expressiveness, smallest first.** Three schema additions in the
`observed_at` style — a field, a lift rule, a test:
- `arity` on the three comparative mechanisms (M-002, M-009, M-018) plus the
  cohort object their conditions range over;
- statement links on the observations that are statements (A-002 is one,
  A-001 is an absence — the lift already knows the difference);
- visibility classes replacing the single `facets.visibility` value in the
  substrate, with the facet kept in the projection so nothing public moves.
*Size: M.*
**Done.** `packages/registry/src/substrate/lift.ts` attaches `cohort: 'coh:requisition.pool'`
and `arity: 'comparative'` to M-002, M-009, M-018; attaches statements to all
communicative observations while preserving A-001 as non-communicating silence;
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
delegated directly to substrate derivations in `packages/registry/src/substrate/derivations.ts`.
CLI, MCP, wizard, and test suite run over the unified substrate engine.

**A7. Lean, last.** The substrate becomes what the proofs quantify over:
funnel-order acyclicity, one-condition-per-gate, and conservation move from
WF-003-specific theorems to substrate-level ones. Current proofs stay green
throughout via the projection. *Size: M, deliberately unblocking — nothing
waits on it.*
**Done.** `SubstrateSummary` data emitted to `formal/Hoba/Data.lean`; substrate-level
theorems for barrier condition counts, mechanism condition counts, condition partitioning,
flow conservation, process tracking, and DAG acyclicity kernel-proved in `formal/Hoba/Theorems.lean`.

### Track B — content the current types can already hold

**B1. The client account.** No substrate needed for most of it: a `client`
actor; the client-approval gate (a new B-\* after the panel, owned by a party
outside the employer); the bid-conditional pool and bench mechanisms; the
client-account walk of the funnel (either WF-004 or a variant lens on WF-001 —
decided when writing, whichever reads better); and the re-read the spec
ordered — every entry that quietly assumes an own-account company, B-005's
cost asymmetry first. All ×2 languages. Sourcing per the standing rule; the
Ukrainian civil-service statute (EVD-039) already anchors the mandated-posting
premise. *Size: L content. Starts immediately — it depends on nothing in
track A.*
**Done.** `client` actor, `B-015` (Client Profile Approval and Client Interview,
stage: `client`, order 15), `WF-004` (Client account hiring funnel: 13 states,
16 transitions), `M-025` and `M-026` across both mirrors. All formal Lean proofs
and tests pass cleanly.

**B2. The epilogue.** States past `hired` in the funnel and the canonical
path: start-date shift, no-show in both directions, probation, probation-end
outcomes. The probation-cost parameter cited from law records (Ukraine's
labour code articles on the trial period; one EU contrast). Lean's depth
constant changes and the proofs are updated with it — that is a planned edit,
not a break. *Size: M content ×2, S code.*
**Done.** Authored `B-016` (Probation Period & Post-Start Confirmation),
`M-027` (Start-Date Slippage and Post-Acceptance Revocation), `M-028` (Probation
Used as Extended De-Facto Interview), `A-020` (Offer accepted followed by delayed
start date or revocation), `EVD-040` (Ukraine KZpP art. 26–28), and `EVD-041`
(UK ERA 1996 s. 86) across both English and Ukrainian mirrors.

**B3. Statement-adjacent observations** as the sourcing turns them up — the
republished-posting-with-new-date pattern from the DOU threads is the first
candidate. Only entries that split something, per the A-015…A-019 discipline.
*Size: S, opportunistic.*
**Done.** Authored `A-021` (Republished job posting with refreshed date and identical
requirement body / Повторно опублікована вакансія з оновленою датою та ідентичним описом вимог)
with diagnostic probe `PROBE-A-021-1` separating `M-006` from active searches and `M-001`.

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

## What I need from you, and when

1. ~~Agreement on the sequencing~~ — given; the stages are issues #21–#30.
2. **Open:** the RFC's three points (`RFC-RECORDS.md`); silence = the
   recommendation stands.
3. **Open:** the WF-004-versus-variant call on the drafts
   (`DRAFT-WF-004.md`), plus its two sub-questions — the `client` stage value
   and `bench-filled` as its own terminal.

Next work that needs no decision: A3 — the existing derivations re-derived as
substrate queries, and the pattern-computability finding either way.
