# Data-First Architecture — Phase 3: Validate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rollout step 3 of the design doc — *"extend the validator for new IDs/aliases/epistemic states (§6); add the Scenario schema + validator; add the Analysis schema + validator."* Phase 1 authored four target contracts under `schema/`; none is wired into the live Zod pipeline. Phase 3 wires them.

**Precondition, now met:** Phase 2 is complete. Every canonical id is dotted, which is what the `schema/*.json` id patterns (`^obs\.`, `^mech\.`, `^scenario\.`) assume.

---

## The four slices

### Slice 3.1 — The epistemic model (§6)

`evidence_level` goes from four states to seven:

```
current:  established | supported | hypothesis | illustrative
target:   observed | compatible | supported | strongly_supported | proven | contradicted | unknown
```

`schema/entity.schema.json` already states the target enum; this makes the Zod source of
truth agree with it.

**The per-entity pass.** §6 and §16 are explicit that `established` maps to `proven` *or*
`strongly_supported` per entity, never by blanket rule. The deciding question is the one
the validator is about to enforce anyway — does this entity's own evidence carry the
claim? Measured across the 33 `established` entities:

| → | n | why |
|---|---|---|
| `proven` | 23 | link at least one evidence record of kind `primary` or `research` |
| `strongly_supported` | 10 | 7 link only `survey`/`reporting`; 3 workflows link none |

`supported` stays. `hypothesis` (9) → `compatible`. `illustrative` is removed as a level:
one entity holds it (`proc.the_path_as_it_is_supposed_to_run`), and it is the canonical
path — a description of how the process is supposed to run, not a claim about the world.
It becomes `unknown`, the level for a claim not being asserted. No mapping raises a tier.

**The invariant, enforced not documented.** An entity at `proven` without a linked
evidence record of kind `primary` or `research` is a validation error. Tested in both
directions.

Touches the schema, all 112 entity pairs, the `level.*` i18n keys in both languages,
`methodology.astro`'s vocabulary, and the registry views.

### Slice 3.2 — `agency_zones` (§6, DoD 6)

A per-actor-type impact map on mechanisms (`{actor: low|medium|high}`), **additive
alongside** `facets.removability`, which the Lean proofs and UI badges key off. DoD item 6
is explicit that neither replaces the other. Authoring 28 mechanisms' zones is content
work and is the slice's bulk.

### Slice 3.3 — Scenario (§4)

`scenario.schema.json` as Zod, storage at `data/scenarios/*.yaml`, a loader, and the
build-time rule that **every id in every array must resolve against the loaded bundle —
a build error, not a warning**.

The structural guarantee comes for free and must be tested: no ontology schema has a field
that can hold a scenario id, so the reverse reference is unrepresentable rather than
merely linted.

### Slice 3.4 — Analysis (§5)

`analysis.schema.json` as Zod. **Output-only** — it is not canonical data, does not live
under `data/`, and nothing in the registry may reference it. `validate_analysis` checks
conformance plus the epistemic invariants, exposed through CLI and MCP. Example analyses
live in `tests/examples/`.

---

## Where this stands (2026-08-29)

| slice | state |
|---|---|
| 3.1 epistemic model | **done** — `0ae94e2`. Seven states live; 23 → `proven`, 10 → `strongly_supported`, 9 → `compatible`, 1 → `unknown`. The `unsupported-claim` rule refuses an unearned `proven`, verified against real content. |
| 3.3 Scenario | **done** — `8239180`. Schema, loader, build-time resolution (error, not warning), two seed scenarios, and the one-directional guarantee tested structurally. |
| 3.4 Analysis | **done** — `9ca2edd`. Schema, `validateAnalysis` with the overclaim invariant, worked example under `tests/examples/`. |
| 3.2 `agency_zones` | **open — a design question, below.** |

With 3.1, 3.3 and 3.4 in, rollout step 3's stated deliverables ("extend the
validator for new IDs/aliases/epistemic states; add the Scenario schema +
validator; add the Analysis schema + validator") are complete. 3.2 comes from
§6 and DoD 6 rather than from step 3's own list, and it is deliberately last.

### The open question on 3.2

§6 says `agency_zones` is "added as a new, purely additive **field** on
mechanisms". Authoring it means 28 mechanisms × 3–5 actors of impact ratings,
in both mirrors.

But the registry already declares everything those ratings would encode:

- which parties hold an intervention that **targets** this mechanism — the
  capacity to act on it, which is what agency *is*;
- `facets.removability` — whether it can be removed, and by which class of actor;
- which actors hold a stated `perspective` on it at all.

`PLAN-SUBSTRATE.md`'s founding principle points the other way from §6 here:
*"The substrate is computed before it is authored… Authoring changes only where
the ten types cannot say the thing."* On this reading the ten types **can** say
it, and hand-authoring 112 impact ratings would be inventing a story the
registry is otherwise careful not to tell — the opposite of its own core rule.

Three ways to settle it, for the owner:

1. **Derive it.** `agencyZones(bundle, mechanismId)` computed from targeting
   interventions, removability and perspectives. No new authored content, every
   value explainable, and it cannot drift from the entities it summarises.
2. **Author it as §6 says.** A per-mechanism editorial judgement that can say
   things the derivation cannot, at the cost of 112 values no evidence backs.
3. **Derive, then allow an override.** The computed value stands unless a
   mechanism declares one, the way `visibility` overrides already work in the
   substrate. More machinery than either, and the honest answer if a handful of
   mechanisms genuinely disagree with the derivation.

Recommendation: (1), and revisit (3) only if a real disagreement shows up.

## Order and rationale

3.1 first: the other three depend on the epistemic vocabulary, and `validate_analysis`
checks invariants that do not exist until it lands. 3.3 before 3.4, because an analysis
references the same ontology ids a scenario does and reuses its resolution helper — and in
the event both ended up keying `agency` by actor slug, which is the second thing Slice 11's
`slug` field earns its keep for. 3.2 last, and held: see the open question above.

Each slice ends green on all six gates and is committed on its own.
