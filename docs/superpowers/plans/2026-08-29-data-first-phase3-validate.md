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

## Order and rationale

3.1 first: the other three depend on the epistemic vocabulary, and `validate_analysis`
checks invariants that do not exist until it lands. 3.2 is independent and small in code,
large in content. 3.3 before 3.4, because an analysis references the same ontology ids a
scenario does and reuses its resolution helper.

Each slice ends green on all six gates and is committed on its own.
