# Changelog

All notable changes to the **hoba** platform (Hiring Obstacles & Barriers Atlas) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) for both packages and registry content releases.

Registry releases used [Calendar Versioning](https://calver.org/) through `2026.08.3`.
That form said when a release was cut but nothing about compatibility, so the
data-first migration — which renamed every entity in the registry — retired it
for semver and numbered itself `1.0.0`. Entries below `1.0.0` keep the
date-coded registry versions and the short-code entity IDs they shipped with:
they were accurate when written, and a changelog that edits its own history is
worth less than one that does not.

---

## [Unreleased] (Registry 1.0.0, Schema 1.2.0)

The data-first architecture migration, end to end: all six rollout steps of
`docs/superpowers/specs/2026-08-28-data-first-architecture-design.md`, and every
item of its Definition of Done.

### Changed — every entity ID in the registry

All 165 entities across all 11 ontology kinds moved from short codes to
canonical dotted IDs, one reviewable slice per kind, `git mv` throughout so file
history survives:

| kind | n | example |
|---|---|---|
| observation | 21 | `A-001` → `obs.complete_silence_after_submission` |
| barrier | 16 | `B-002` → `bar.automated_filter_parser_threshold` |
| mechanism | 28 | `M-001` → `mech.genuine_technical_skill_shortfall` |
| pattern | 4 | `P-001` → `pat.seniority_double_bind` |
| loop | 3 | `L-001` → `loop.employment_gap_penalty_loop` |
| intervention | 17 | `I-002` → `int.upfront_compensation_band_disclosure` |
| workflow | 4 | `WF-003` → `proc.the_path_as_it_is_supposed_to_run` |
| record | 13 | `R-001` → `record.annual_engineering_department_budget` |
| era | 4 | `E-001` → `era.zero_rates_and_a_same_year_deduction` |
| evidence | 48 | `EVD-001` → `evidence.hidden_workers_untapped_talent_hbs_accenture` |
| actor | 7 | `recruiter` → `actor.recruiter` |

**Every legacy code still resolves**, as an alias in the graph and as a 301 from
its old URL — 89 redirects, generated from the entities themselves rather than
hand-listed. **No public URL moved.** Actors are the one type whose ID and route
diverge: a new required `slug` keeps `/actors/recruiter` where it is, and the
schema says why.

### Changed — the epistemic model

`evidence_level` moved from four states to the spec's seven (`observed`,
`compatible`, `supported`, `strongly_supported`, `proven`, `contradicted`,
`unknown`). The per-entity pass was decided by the entity's own evidence: of 33
`established` entries, 23 cite a `primary` or `research` record and became
`proven`; 10 do not and became `strongly_supported`. `illustrative` was retired
as a level — it conflated a source-kind with a claim-strength — and its one
holder, the canonical path, became `unknown`, because it describes rather than
asserts.

A new `unsupported-claim` validation error refuses any entity standing at
`proven` without evidence of a proving kind. A tier is not jumped without the
evidence for the jump.

Checking those counts against the built registry turned up a hole in the same
guarantee: `workflow`, `actor` and `era` never defined `evidence_level`, so
Zod dropped it on load and `unsupported-claim` could not have fired on them
whatever they claimed. Four workflows were authoring one — three funnels as
they run, and the canonical path as `unknown` — so `workflowSchema` now defines
it. Six actors were authoring an identical `supported` that distinguished no
actor from any other, so it is gone: an actor is a position the funnel is made
of, not a claim about the world. A test now fails on any frontmatter key its
schema does not define, naming the key and the file.

### Changed — the repository structure

Everything the registry is made of moved under `data/`, per design doc §9:

    data/en/entities/<type>/*.md     data/evidence/*.md
    data/uk/entities/<type>/*.md     data/scenarios/*.yaml

§9's tree does not say where the Ukrainian mirror goes — it shows one entity
tree and no second one — so the language sits above the entities rather than
beside them, which is the only shape of the three considered that stops
treating English as the default location. Type directories are singular, named
exactly what their entities are typed; API collections stay plural.

`site/` became `apps/web/` and `formal/` became `formal/lean/`. Splitting
`packages/registry` into core/validator/graph/search remains deferred: the
design doc calls it "packaging, not a rewrite", and the modules already have
the dependency shape it would formalise.

All 282 entity files moved with `git mv`, so history follows each one.

### Changed — two kinds are now called what the contract calls them

`schema/entity.schema.json` has enumerated `observation` and `process` since
Phase 1, and the entities have carried `obs.*` and `proc.*` ids since Phase 2,
but the live model went on calling those kinds `artifact` and `workflow`. A
reader had to learn that `obs.*` entities live in `artifacts/` and are typed
`artifact` — the same class of mismatch that produced four of the defects
listed below. The i18n labels already read "Observation" in both languages.

The type value, collection, directory, route, API path, schema and node type all
moved together. **This is the only change in the migration that moves a public
URL**: `/artifacts/<id>` is now `/observations/<id>`, and the old prefix
redirects — in one hop even for a legacy short code, so `/artifacts/A-001` lands
directly on `/observations/obs.complete_silence_after_submission`.

Per-type field names that mention the old kinds (`required_artifacts` on a
pattern, `emissions[].artifact` on a mechanism) deliberately did not move: they
name a relationship *to* observations rather than the kind itself, and the
target contract leaves per-type fields to their own schemas.

### Added

- **Scenarios** (`data/scenarios/*.yaml`) — validated compositions of ontology
  entities: what was observed, what is compatible with it, and what it
  explicitly does not establish. Six of them, including the four diagnostic
  presets that used to be hardcoded in `diagnostics.ts`. Every ID must resolve
  at build time; an unresolvable one fails the build rather than warning.
- **Structured Analysis objects** — the output shape for reading one concrete
  input against the registry, with `validateAnalysis` enforcing that no claim
  stands above the level the cited entity itself carries.
- **`agency_zones`** on every mechanism — per-actor purchase (`high` for holding
  an intervention that targets it, `medium` for it being their own force or
  theirs to remove, `low` for merely seeing it). Derived from what the registry
  already declares rather than authored, and published alongside
  `facets.removability`, which it does not replace.
- **`registry_hash`** in `manifest.json` — a content digest over every entity
  and scenario file, so a release is identified by what it contains and not only
  by what it is called. Sensitive to renames as well as edits.
- **CLI**: `hoba graph <id>`, `hoba scenario [id]`, `hoba registry stats`,
  `hoba registry version`. `get` is an alias of `show` rather than a second
  near-identical command.
- **MCP**: methodology resources at `hoba://methodology/{core,epistemic-rules,agency,evidence,non-goals}`,
  and four validation tools — `validate_entity_ids`, `validate_scenario`,
  `validate_analysis`, `validate_claim`. `get_empirical_scenarios` became
  `get_scenario` now that scenarios are a real collection; the old bare names
  (`ghost-refresh`) still resolve.
- **A README that is executed.** `tests/readme.test.ts` extracts the `hoba …`
  lines from `README.md` and runs each as a test case, because the reason its
  examples went stale was that nothing ran them.

### Fixed

Nine defects surfaced during the migration, none of them in the renames — all
in code that assumed something about the shape of an ID, and each caught by a
gate rather than by reading:

- `substrateDetectTemporalAnomalies` stripped a composite key with a pattern
  that stopped at the first dot, silently matching no transitions at all.
- `/process` deep links parsed the anchor with a hardcoded `WF-\d+`.
- **Collection order is filename-derived**, which silently carried meaning three
  times: `/check`'s default workflow changed, and the era timeline — a strip
  proportional to real time — would have rendered near-backwards. Both now sort
  explicitly, on relevance and on year.
- Two `/check` badge colours had no light-theme pair, an accessibility failure
  hidden behind an accidental default.
- Choosing the **Client** lens hid every perspective and revealed none: the
  allowlist and the stylesheet each enumerated six actors by hand while the
  picker offered seven.
- Three layout overflows on 360px viewports, from IDs getting longer.

## [0.5.0] - 2026-08-28 (Registry 2026.08.3, Schema 1.2.0)

### Added
- **Substrate Graph Engine**: Unified four-primitive substrate model (`Record`, `EventClass`, `Condition`, `Flow`) supporting monotonic derivations, epistemic visibility gates, and bidirectional lifting/projection with 100% equivalence.
- **Formal Verification in Lean 4 Kernel**: Formalized state machines, topological ranking, cycle detection, path depth bounds ($\le 12$ on `WF-003`), and non-divergent resource flow conservation proved in kernel (`Hoba.Machine`, `Hoba.Theorems`).
- **Temporal Latency Bounds & Dwell Anomaly Engine**: Added empirical turnaround limits (`latency_expected_days`, `latency_max_days`) across all canonical workflows (`WF-001`, `WF-002`, `WF-003`, `WF-004`). Implemented `substrateDetectTemporalAnomalies` to identify stalled states and map them to hidden mechanisms (`M-006`, `M-020`, `M-025`, `M-009`, `M-007`, `M-027`).
- **Candidate Runway & Solvency Calculus**: Implemented `substrateCalculateRunway` computing liquid search horizons and classifying vulnerability risk profiles under down-levelling pressures (`M-017`, `P-004`).
- **Algebraic Pattern Emptiness Evaluation**: Formally proved that all 4 patterns (`P-001`..`P-004`) evaluate to `computed_empty` unsatisfiable contradictions under discrete rank, qualification invariance, tech timeline, and mutual information constraints.
- **New CLI Subcommands**:
  - `hoba latency <wf> <state> <days>`: diagnose dwell anomalies.
  - `hoba runway <savings> <monthly_burn>`: calculate runway and vulnerability.
  - `hoba patterns`: display algebraic status and contradiction proofs.
  - `hoba conservation`: audit flow conservation across financial records.
- **New MCP Agent Tools**: `detect_temporal_anomalies`, `calculate_runway`, `verify_flow_conservation`, `evaluate_pattern_emptiness`.
- **Interactive Web Calculators**: Added stage dwell anomaly diagnoser and runway solvency calculator on `/check`, and published pattern emptiness and latency matrix on `/data`.
- **Statutory & Primary Evidence Expansion**: Added `EVD-042`..`EVD-045` grounding interventions `I-008`, `I-014`, `I-015`, `I-017` in 5 U.S.C. § 2301, 29 C.F.R. § 1607.4, EU AI Act Annex III, Restatement of Employment Law § 2.02, and GDPR Art. 5(1)(e).

---

## [0.4.1] - 2026-08-26 (Registry 2026.08.2, Schema 1.1.0)
- Client account expansion: added `client` actor, `B-015`, `WF-004` (vendor sub-contracting flow), `M-025`, `M-026`.
- Epilogue expansion: added `B-016`, `M-027`, `M-028`, `A-020`, `EVD-040`, `EVD-041`.
