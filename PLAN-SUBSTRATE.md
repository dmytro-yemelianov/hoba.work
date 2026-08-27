# Substrate implementation plan

How SPEC-MODEL.md becomes code and content without breaking a site that is
live in two languages. The spec is the *what*; this is the *in which order and
behind which gates*.

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

**A2. Lift and project — the gate.** `lift(bundle) → Substrate` and
`project(substrate) → bundle`, with the equivalence test over both mirrors.
The one real design problem lives here: B-\* barriers and workflow states are
the same points authored twice, so the lift unifies each pair into one
condition and the projection regenerates both surfaces. When this passes, the
barrier↔state sync check in `tests/content.test.ts` is true by construction —
it stays as a regression tripwire but can no longer fail first.
*Size: L. This is the crux of the whole plan.*

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

**A4. The new expressiveness, smallest first.** Three schema additions in the
`observed_at` style — a field, a lift rule, a test:
- `arity` on the three comparative mechanisms (M-002, M-009, M-018) plus the
  cohort object their conditions range over;
- statement links on the observations that are statements (A-002 is one,
  A-001 is an absence — the lift already knows the difference);
- visibility classes replacing the single `facets.visibility` value in the
  substrate, with the facet kept in the projection so nothing public moves.
*Size: M.*

**A5. Records and flows.** The first substrate-native authored content: a
one-page format RFC (goes to you before any file is written), then the chain
shapes — own-account, client-account, agency placement, applicant runway —
as records and flows with **no amounts**. Chains are computed from them, never
authored. Surfaces: the entry pages and `/data` gain the shape of *who funds
this seat and who is paid along the way*; the freeze entry gains its three
chains. Public data exports gain a new optional file; `schema_version` minor
bump. *Size: M code, M content ×2 languages.*

**A6. The query engine swap.** `narrow()`, `checkConformance()` and the
diagnostic engine become three instances of one projection-consistency query
over the substrate. Swap order per module: equivalence test first, rewire
second, delete third. The wizard, CLI and MCP read the same engine at the end.
*Size: L, but mechanical after A3.*

**A7. Lean, last.** The substrate becomes what the proofs quantify over:
funnel-order acyclicity, one-condition-per-gate, and conservation move from
WF-003-specific theorems to substrate-level ones. Current proofs stay green
throughout via the projection. *Size: M, deliberately unblocking — nothing
waits on it.*

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

**B2. The epilogue.** States past `hired` in the funnel and the canonical
path: start-date shift, no-show in both directions, probation, probation-end
outcomes. The probation-cost parameter cited from law records (Ukraine's
labour code articles on the trial period; one EU contrast). Lean's depth
constant changes and the proofs are updated with it — that is a planned edit,
not a break. *Size: M content ×2, S code.*

**B3. Statement-adjacent observations** as the sourcing turns them up — the
republished-posting-with-new-date pattern from the DOU threads is the first
candidate. Only entries that split something, per the A-015…A-019 discipline.
*Size: S, opportunistic.*

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

1. Now: agreement on this sequencing, or reordering. On agreement the stages
   become issues on the project board, as the roadmap convention requires.
2. At A5: the one-page records-and-flows format RFC, before any file exists.
3. At B1: the WF-004-versus-variant call, made on drafts, not in the abstract.

First work on approval: A1 and B1 in parallel — the schema needs no decisions,
and the client account needs nothing from the schema.
