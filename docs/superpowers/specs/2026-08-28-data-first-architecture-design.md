# hoba.work — Data-First Architecture Migration: Design

**Status:** Approved design, ready for implementation planning
**Source brief:** `hoba-data-first-architecture-spec.md` (external, not checked into this repo), refined through review against the actual current codebase and two rounds of correction from the project owner.
**Scope:** Architectural — breaking ID rename, repository restructure, new Scenario/Analysis layers.

---

## 1. Why this exists

The external spec proposes a "registry defines reality, interfaces only project it" architecture. A line-by-line comparison against the current repository (`packages/registry/src/{schemas,validation,graph,search,loader}.ts`, the MCP server's `METHODOLOGY` object and 15 registered tools, `EMPIRICAL_SCENARIOS` in `diagnostics.ts`) shows **most of that principle is already implemented**, just under different names and with a narrower epistemic/ID vocabulary than the new spec wants. This document is not a green-field design — it is a migration from the current, already-fairly-rigorous system to the new spec's conventions, scoped to what actually needs to change.

The project owner chose the **full rename + restructure** option over two lighter alternatives (adopt-principles-keep-IDs, or hybrid dotted-IDs-for-new-types-only), with eyes open to the fact that this breaks every current `/artifacts/A-002`-style URL and touches the ID in essentially every file in the repo.

---

## 2. The three-layer model (binding correction from the project owner)

An earlier draft of this design listed `Scenario` as a peer entity type alongside barrier/mechanism/etc. This was wrong and has been corrected. The system has three layers, and they must stay structurally separate — not just conceptually distinct, but **impossible to blur in the schema**:

```text
Ontology
  ├── entities   (11 types, closed enum, see §3)
  ├── relations
  └── epistemic rules

Scenario
  └── validated composition / graph slice over the ontology
      (its own schema + storage namespace; references ontology IDs
       one-directionally — no ontology entity may reference a scenario)

Analysis
  └── interpretation of a concrete input using ontology + scenarios + methodology
      (its own schema; not canonical data; not stored under /data at all)
```

> Ontology defines what concepts exist.
> Scenario defines how existing concepts can compose into a coherent case.
> Analysis defines what we can responsibly say about a concrete input.

**Enforcement, not just documentation:** `scenario` must never appear as a value of the ontology `type` enum. No ontology schema (entity or relation) may have a field that references a scenario or analysis ID. This is checked structurally (the Zod schemas for entities literally have no such field to fill in) and by a validator rule that rejects any such reference if one is ever added.

---

## 3. Ontology taxonomy

One closed, unified `type` enum — this also **fixes an existing inconsistency**: today, `entityTypeSchema` only covers `artifact/barrier/mechanism/pattern/loop/intervention/evidence/record`; `actor`, `era`, and `workflow` exist as separate, ad-hoc schemas outside that enum, for no reason still relevant to the new model.

| `type` value | ID prefix | Current form | Count | Participates in the relation graph? |
|---|---|---|---|---|
| `observation` | `obs.*` | artifact (`A-xxx`) | 21 | yes |
| `barrier` | `bar.*` | barrier (`B-xxx`) | 16 | yes |
| `mechanism` | `mech.*` | mechanism (`M-xxx`) | 28 | yes |
| `pattern` | `pat.*` | pattern (`P-xxx`) | 4 | yes |
| `loop` | `loop.*` | loop (`L-xxx`) | 3 | yes |
| `intervention` | `int.*` | intervention (`I-xxx`) | 17 | yes |
| `process` | `proc.*` | workflow (`WF-xxx`) | 4 | no — state-machine states |
| `actor` | `actor.*` | actor (slug id) | 7 | no — referenced by mechanisms/interventions |
| `era` | `era.*` | era (`E-xxx`) | 4 | no — timeline dimension |
| `record` | `record.*` | record (`R-xxx`) | 13 | yes, within the flow-conservation subgraph only |
| `evidence` | `evidence.*` | evidence (`EVD-xxx`) | 48 | no — cited by entities, never a node |

`pattern`, `loop`, `era`, and `record` are not in the external spec's minimum §4 list. They stay: the spec's own wording is "the architecture should distinguish **at least** the following concepts," and all four are load-bearing existing product content (patterns and loops are Lean-verified against the graph's SCCs; era and record already back live indicator/evidence pages).

**What actually changes vs. stays the same:**
- The `type` field's English values are unchanged (`"barrier"` stays `"barrier"`). Only the `id` format changes.
- ID format: `<prefix>.<snake_case_name>`, e.g. `bar.automated_filter_parser_threshold` (was `B-002`).
- Every migrated entity keeps its old code as `aliases: ["B-002"]` — this field already exists in the external spec's own example schema (§7) and exists for exactly this purpose.

**Name derivation (deterministic, needed for the migration codemod):**
1. Take the entity's `title` (English).
2. Lowercase; replace runs of non-alphanumeric characters with a single underscore; strip leading/trailing underscores.
3. If two entities of the same type collide on the resulting name, **do not auto-disambiguate** — surface it as a migration-blocking error requiring a manual name choice. A collision means two entities have indistinguishable titles, which is itself worth a human look.

---

## 4. Scenario schema

`schema/scenario.schema.json`, stored at `data/scenarios/*.yaml` (the one place this migration *does* use a standalone YAML file per the external spec's literal example, since scenarios have no long-form rendered body the way ontology entities do).

```yaml
id: scenario.application_silence
title: { en: "Application followed by silence", uk: "Відгук без подальшої відповіді" }
observations: [obs.application_submitted, obs.no_response_21d]
compatible_mechanisms: [mech.screening_rejection, mech.pipeline_refresh]
compatible_barriers: []
process_states: []
evidence: []
excluded_claims:
  - "The recruiter deliberately ghosted the candidate"
agency:
  candidate: [int.follow_up_once]
```

**Validation rule:** every ID in every array must resolve against the loaded ontology bundle at build time. Unresolvable IDs are a build error, not a warning.

**Structural guarantee against the reverse reference:** no ontology schema (`observation`, `barrier`, `mechanism`, …) has a field capable of holding a scenario ID. This isn't just a lint rule — it's enforced by what fields the Zod schemas define.

---

## 5. Analysis schema

`schema/analysis.schema.json`, matching the external spec's §19 shape:

```json
{
  "input_type": "social_post",
  "source_text": "...",
  "observations": [{ "text": "...", "registry_refs": ["obs.high_application_volume"], "confidence": "observed" }],
  "interpretations": [{ "text": "...", "classification": "author_interpretation" }],
  "compatible_entities": [{ "id": "mech.pipeline_refresh", "claim_level": "compatible", "reason": "..." }],
  "unknowns": ["..."],
  "agency": { "candidate": ["int.measure_conversion_funnel"], "employer": [], "platform": [] },
  "prohibited_conclusions": ["A specific hidden mechanism is proven."],
  "registry_version": "1.0.0"
}
```

**This is not canonical data.** It does not live under `/data/`. It's the output shape produced by the analyzer, CLI, and MCP (`validate_analysis` checks conformance to this schema plus the epistemic invariants in §7 below). Example analyses used as test fixtures live under `tests/examples/`.

---

## 6. Epistemic model

Expand `evidence_level` from the current four states to the external spec's seven:

```text
current:  established | supported | hypothesis | illustrative
new:      observed | compatible | supported | strongly_supported | proven | contradicted | unknown
```

This is additive at the data level — every current value maps forward without loss (`established → proven` or `strongly_supported` depending on the entity, decided per-entity during migration, not by a blanket mechanical rule; `hypothesis → compatible`; `illustrative → illustrative` is removed as a level and folded into the evidence `kind` enum, which already has `illustrative` as a *source-kind*, not a claim-strength — these were conflating two different axes).

**Invariant, enforced by the validator (not just documented):** a claim may never be authored as `proven` without at least one linked `evidence_id` whose `kind` is `primary` or `research`. `compatible` never implies `proven` — the validator rejects any entity that jumps epistemic tiers without the evidence to support the jump.

`agency_zones` (spec's example: `{candidate: low, recruiter: medium, employer: high}`) is added as a new, purely additive field on mechanisms, alongside the existing `facets.removability` (`candidate/intermediary/none`) — not a replacement. They answer different questions: `removability` is what the Lean proofs and UI badges already key off (can this specific mechanism be removed, and by what class of actor); `agency_zones` is a broader per-actor-type impact map the spec wants for the intervention-recommendation flow. Both stay.

---

## 7. Storage format: Markdown + frontmatter, not pure YAML

The external spec's example tree shows one monolithic YAML file per type (`observations.yaml` holding all 21 observations). This design deviates from that literal example:

- Current entity content files render their markdown body directly as page prose (e.g., A-002's `# Generic "closer alignment" rejection template` section is the actual rendered page content). Moving that into a YAML string field loses markdown ergonomics for anything longer than a sentence.
- One file per entity (current practice) reviews, diffs, and blames far better than a shared multi-hundred-line file every editor touches for every unrelated entity.
- Frontmatter *is* YAML. `content/artifacts/A-002.md` → `data/entities/observation/obs.generic_closer_alignment_rejection.md` satisfies "YAML for human-maintained entities" (external spec §3.1) without a format change — only a location and filename change.

Scenarios (§4) are the one exception: they have no rendered body, so a standalone `.yaml` file per scenario (not monolithic — still one file per scenario, for the same diff/review reasons) is the right fit.

---

## 8. Migration mechanics for a live site

This is the highest-risk part of the migration. hoba.work is live, indexed by search engines, and this session alone added evidence citations that reference current URLs.

- **Aliases carry the old code forward.** Every migrated entity gets `aliases: ["B-002"]`. This is not cosmetic — `get_entity`, `search_registry`, and the site's routing all resolve by alias as well as canonical ID.
- **Redirects, generated, not hand-maintained.** The Worker (`site/public/_worker.js`) gets a legacy-alias lookup table generated at build time from the alias map. A request for `/barriers/B-002` returns a 301 to `/barriers/bar.automated_filter_parser_threshold`. This table is a build artifact, not something anyone edits by hand — if it drifts from the registry, the build regenerates it.
- **`git mv`, never delete+recreate.** File history (blame, log) must survive the move.
- **One mapping table drives one codemod.** Generate the full old-code → new-ID table once (with the collision check from §3), then run a single codemod that: renames files, rewrites frontmatter relations (`operates_at`, `emits`, `precedes`, `evidence_ids`, etc.), rewrites i18n copy that names IDs, rewrites test fixtures, rewrites the Lean model, rewrites CLI/MCP hardcoded examples, rewrites docs. Split into one PR per entity type (11 PRs) so each is independently reviewable and bisectable — but the mapping table itself is generated exactly once, upfront, so no PR uses a different mapping than another.

---

## 9. Repository structure (target)

```text
data/
  entities/
    observation/*.md   barrier/*.md    mechanism/*.md
    pattern/*.md        loop/*.md       intervention/*.md
    process/*.md        actor/*.md      era/*.md
    record/*.md
  evidence/*.md                      ← was /evidence, unchanged format
  scenarios/*.yaml                   ← new

schema/
  entity.schema.json                 ← consolidates packages/registry/src/schemas.ts's per-type Zod schemas as JSON Schema
  relation.schema.json
  scenario.schema.json               ← new
  analysis.schema.json               ← new

packages/
  registry-core/   ← loader.ts, core.ts, types.ts, paths.ts (unchanged content, new package boundary)
  validator/       ← validation.ts, conformance.ts, separation.ts, gaps.ts
  graph/           ← graph.ts, substrate/
  search/          ← search.ts
  cli/             ← same location, extended command set (§11)
  mcp/             ← same location, extended tools + hoba:// resources (§12)

apps/
  web/                                ← was site/

formal/
  lean/                               ← was formal/ (Hoba.lean, Hoba/*.lean)

tests/ , docs/                        ← existing structure already matches spec §27 closely
```

The `packages/registry` split into `registry-core`/`validator`/`graph`/`search` is a file-move plus import-path update — the modules already have this separation internally (`validation.ts`, `graph.ts`, and `search.ts` are already independently focused files with a one-way dependency shape), so this is packaging, not a rewrite.

---

## 10. Versioning

Retire the date-coded `registry_version: "2026.08.3"` in favor of strict semver, since this migration is exactly what external spec §22 defines as a MAJOR bump: `1.0.0`.

- Single source of truth: `data/registry.yaml` holds `version: "1.0.0"`.
- `build:registry` computes `registry_hash` (a content hash over every entity + scenario file) and writes both into `manifest.json` alongside a `generated_at` timestamp.
- Per-entity `version` numbers (external spec §7's example has one) are **explicitly deferred**, not part of this migration — current entities don't have them today, and adding them is a separate, additive feature that doesn't need to block this rename. Noted so it isn't silently forgotten.

---

## 11. CLI surface additions

Current commands (`search`, `show`, `explain`, `latency`, `runway`, `patterns`, `conservation`, `validate`) stay. Add, to close the gap with external spec §13:

```text
hoba get <id>                 (alias-aware — accepts both new IDs and legacy codes)
hoba graph <id>
hoba scenario <id>
hoba registry stats
hoba registry version
```

`show` and `get` end up doing very similar things (`show` already exists); reconcile during implementation rather than shipping two near-duplicate commands — flagged as an implementation-time decision, not a design blocker.

---

## 12. MCP surface additions

Current 15 tools stay (they already cover most of external spec §17 under different names: `get_node`≈`get_entity`, `traverse_graph`≈`get_neighbors`, `get_empirical_scenarios`≈`get_scenario`, `find_compatible_mechanisms`≈`find_compatible_entities`). Add:

- **Resources**, not just the existing `get_methodology` tool: `hoba://methodology/core`, `hoba://methodology/epistemic-rules`, `hoba://methodology/agency`, `hoba://methodology/evidence`, `hoba://methodology/non-goals` — for MCP clients that prefer resource URIs over tool calls. The existing `METHODOLOGY` object already has the content (`protocol`, `epistemic_verbs`, `ontology`, `non_goals`); this is a second exposure surface for the same data, not new content to write.
- **Validation tools**, genuinely new: `validate_entity_ids`, `validate_analysis`, `validate_claim`, `validate_scenario` — the first live use of the Analysis and Scenario schemas from §4–5.
- `get_scenario` gets renamed from `get_empirical_scenarios` once scenarios are a real schema-backed collection instead of the current hardcoded `EMPIRICAL_SCENARIOS` array in `diagnostics.ts`.

---

## 13. Explicit non-goals for this migration

Per external spec §31 ("should not add major new product features"):

- No new website pages, no new visual design work.
- No per-entity version numbers (§10).
- No live query-able API server (`apps/api`) — the current static-JSON-under-`site/public/api` projection already satisfies "the API is a projection of the registry"; a live server for the optional `POST /validate/*` endpoints can be a follow-up once the Analysis/Scenario validators exist as library functions (they'll need to exist as callable code regardless of whether they're exposed over HTTP).
- No docs-as-tested-examples CI gate (external spec §25) in this pass — flagged as immediate next work after this migration lands, not bundled into it, since it depends on the new IDs already being stable.

---

## 14. Phased rollout

1. **Canonicalize** — write `schema/*.json`; generate the full old-code → new-ID mapping table for all ~150 entities (collision check per §3); do not move any files yet.
2. **Migrate** — run the codemod, one PR per entity type (11 PRs), each: `git mv` + rewrite every reference that PR's type touches.
3. **Validate** — extend the validator for new IDs/aliases/epistemic states (§6); add the Scenario schema + validator; add the Analysis schema + validator.
4. **Generate** — regenerate every derived artifact (registry.json, graph exports, search index, entity/OG cards) under new IDs; generate the redirect map as a build artifact.
5. **Rewire consumers** — Worker routing + redirects; CLI additions (§11); MCP tool/resource additions (§12); doc updates.
6. **Conformance** — `validate_analysis`/`validate_scenario`/`validate_claim` wired end to end; registry semver + content hash (§10) live in every build.

---

## 15. Definition of Done

1. Exactly one canonical `type` enum covers all 11 ontology kinds; `scenario` is not in it.
2. Every entity has a resolvable dotted ID and an `aliases` entry for its legacy code.
3. Every legacy-code URL 301s to its canonical replacement, generated from the alias map.
4. Scenario and Analysis have their own schemas, storage namespace (Scenario) or output-only status (Analysis), and neither can be referenced from an ontology entity.
5. The epistemic-state validator rejects any entity claiming `proven` without qualifying evidence.
6. `agency_zones` and `removability` coexist without one having replaced the other.
7. CLI and MCP expose the same underlying data (§11–12).
8. Registry version is `1.0.0`, computed alongside a content hash, generated — never hand-typed.
9. All 11 migration PRs (one per entity type) are merged with git history intact on every moved file.
10. Every reference this session's own work added (the three evidence records, the B-002/A-002 links) survives the rename correctly.

---

## 16. Open items carried into implementation (not blocking design sign-off)

- Exact epistemic-level mapping per current entity (`established → proven` vs `strongly_supported`) needs a per-entity pass, not a mechanical rule — flagged in §6.
- `show` vs. new `get` CLI command overlap (§11).
- Whether redirects live in `_worker.js` directly or a generated lookup module it imports — an implementation detail, not an architecture question.
