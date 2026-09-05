# hoba — Hiring Obstacles & Barriers Atlas

[![CI](https://github.com/dmytro-yemelianov/hoba.work/actions/workflows/ci.yml/badge.svg)](https://github.com/dmytro-yemelianov/hoba.work/actions/workflows/ci.yml)
[![License: MIT / CC BY-SA 4.0](https://img.shields.io/badge/License-MIT%20%7C%20CC%20BY--SA%204.0-blue.svg)](LICENSE)
[![Canonical Origin](https://img.shields.io/badge/domain-hoba.work-blueviolet)](https://hoba.work)

> **Turn hiring outcomes into structured facts.**  
> *When the signal is unclear, do not invent a story; pause, separate observation from interpretation, and map the system.*

---

## 0. Overview

**hoba** is a public, versioned, machine-readable atlas of technical hiring obstacles, observable signals, hidden mechanisms, recurring contradictions, causal feedback loops, and targeted system interventions.

The public web application at [`hoba.work`](https://hoba.work) is one interface to the registry. The registry itself is the core product: a Git-versioned knowledge graph exposed as web pages, static REST JSON API, OpenAPI 3.1, Model Context Protocol (MCP) server, CLI, CSV, and GraphML exports. The generated [`inventory.json`](https://hoba.work/data/latest/inventory.json) is the machine-readable map of every collection, auxiliary dataset, surface, boundary, and recommended use.

---

## 1. The hoba Diagnostic Protocol

A **hoba Analysis** is a forensic procedure designed to replace emotional interpretation of weak signals with structured, testable facts:

| Step | Principle | Scope & Output |
|---|---|---|
| **H — Hard facts** | Direct observations only | Emails received, stage reached, timeline. Zero intent mind-reading. Emits **Observation nodes (`A`)**. |
| **O — Obstacle** | Funnel localization | Structural gate where progress stalled. Emits **Funnel Barrier DAG (`B`)**. |
| **B — Behind the obstacle** | Mechanism compatibility | Enumerate mechanisms logically compatible with evidence. Preserves honest baseline competence factors alongside structural friction. Emits **Mechanism nodes (`M`)**, **Patterns (`P`)**, and **Loops (`L`)**. |
| **A — Agency** | Partitioning & Probes | Partitions mechanisms into Candidate Action (Endogenous), Intermediary, and Exogenous (No Agency). Emits bounded, low-cost diagnostic probes. |

---

## 2. Knowledge Graph Ontology

```text
Observation / Artifact (A)
        ▲
        │ emitted by
Mechanism (M) ───────────────► Intervention (I)
        │                         targets
        │ operates at
        ▼
Barrier (B)

Loop (L)    = persistent causal cycle among mechanisms (validated via Tarjan SCC)
Pattern (P) = recurring contradiction / double-bind / reversal
```

- **Observations (`A-xxx`):** Observable artifacts (silence, generic rejection, role reposted, scope creep).
- **Barriers (`B-xxx`):** Strictly acyclic DAG of hiring funnel structural gates.
- **Mechanisms (`M-xxx`):** Forces operating at gates with explicit classification facets (`actor`, `nature`, `visibility`, `removability`). Includes mandatory honest-baseline mechanisms.
- **Patterns (`P-xxx`):** Named systemic motifs (e.g. *Seniority Double Bind*, *Closed-Then-Reposted*).
- **Loops (`L-xxx`):** Causal cycles among mechanisms validated via graph SCCs.
- **Interventions (`I-xxx`):** Targeted process and policy changes for employers, recruiters, and ATS platforms.

Five more types share this tree without a diagram of their own: **Actors** (who holds a seat — candidate, recruiter, client, ATS vendor…), **Processes** (the funnel and its variants, as state machines), **Eras** (periods the hiring economy passed through), **Evidence** (what backs a claim), and **Records** (authored financial shapes — who funds a seat and who is paid along the way). A **Scenario** composes over these types but is not one itself: it names a reusable set of observations for `/analyze` and the CLI to start from, never a fact the registry asserts.

### Ontology and substrate are two layers, not a count in dispute

Asking "how many types does hoba have" has two right answers depending on which layer is asked. The **ontology** above — eleven authored types plus scenarios — is what a reader, the CLI, and the MCP server see: the vocabulary this document teaches. Underneath it, `lift()` mechanically derives a **formal substrate** of four primitives that the Lean proofs and cross-cutting queries (`gaps`, `separation`, `narrow`, loop detection) actually run over:

```text
Canonical authored registry
Observation / Barrier / Mechanism / Pattern / Loop / Intervention / …
                │
              lift()
                ▼
Formal substrate
Record / Event / Condition / Visibility
                │
        queries + proofs
                ▼
Web / CLI / API / MCP
```

The substrate is never a second, competing model: `project(substrate)` regenerates the original registry exactly, and a test enforces that equivalence (see `PLAN-SUBSTRATE.md`, stage A2). Nothing is authored twice — a person writes ontology entries and scenarios; the substrate itself is computed from them on every build, never by hand.

---

## 3. Monorepo Structure

```text
.
├── packages/
│   ├── registry-core/  # @hoba/registry-core: Zod schemas, types, paths — no Node built-ins
│   ├── graph/          # @hoba/graph: traversal, diagnostics, agency, the substrate lift
│   ├── validator/      # @hoba/validator: registry rules, gaps, conformance, scenarios
│   ├── search/         # @hoba/search: the index the site and the CLI both query
│   ├── registry/       # @hoba/registry: the facade — plus /core (browser) and /edge (worker)
│   ├── cli/            # @hoba/cli: the "hoba" command (search, show, explain, validate)
│   └── mcp/            # @hoba/mcp: Model Context Protocol server for AI coding assistants
├── apps/web/           # Astro 7 + Tailwind 4 + Cytoscape static site, and the Pages worker
├── data/
│   ├── en/entities/    # Canonical English Markdown + YAML frontmatter
│   ├── uk/entities/    # Ukrainian mirror — same ids, same structure
│   ├── evidence/       # Evidence records cited by entries, in one language-neutral tree
│   ├── scenarios/      # Validated compositions the CLI and /analyze run against
│   └── archetypes/     # Presentation-only nicknames/grid positions; never canonical claims
├── formal/lean/        # Lean 4 kernel proofs over the generated model
├── schemas/            # Generated JSON Schema per entity type (do not edit by hand)
├── schema/             # Hand-written schemas for what is not an entity (analysis, relations)
├── scripts/            # build-registry, build-worker, validate, generate-redirects, task
├── tests/              # Vitest unit and integration suites
├── e2e/                # Playwright browser suites, desktop and mobile
├── docs/decided/       # Questions that are settled; names frozen at the time of writing
├── spec/               # Versioned system & website specification
├── migration/          # The short-code → dotted-id mapping, kept as migration history
└── registry.yaml       # Release manifest: registry version, schema version, timestamp
```

---

## 4. Quick Start & Development

### Prerequisites
- Node.js >= 22.13
- pnpm >= 10

### Installation & Build
```bash
# Clone the repository
git clone https://github.com/dmytro-yemelianov/hoba.work.git
cd hoba.work

# Install dependencies across all workspace packages
pnpm install

# Typecheck scripts, tests and all packages
pnpm typecheck

# Validate schemas, referential integrity, barrier DAG, loop declarations and EN/UK parity
pnpm validate            # warnings are reported, errors fail
pnpm validate:strict     # warnings fail too

# Unit + integration tests (registry, validator, diagnostics, i18n dictionary, language worker,
# CLI and MCP server run from source)
pnpm test

# Lint + format check (ESLint flat config + Prettier); `pnpm format` writes the fixes
pnpm lint
pnpm format

# Unit + integration tests with a V8 coverage report
pnpm coverage

# Browser tests against the built site: routing/i18n, theme, data views, wizard, graph, 404,
# mobile navigation, link integrity, axe WCAG 2.1 AA in light and dark (needs `pnpm build` first)
pnpm e2e

# Build all packages, regenerate static exports/schemas/API, and build the Astro website
pnpm build
```

Generated files under `schemas/` and `apps/web/public/{api,data,schemas,openapi.json}` are committed and must be
regenerated with `pnpm build:registry` after any content change — CI fails if they drift.

### Quality Gates
A husky pre-commit hook runs `pnpm lint && pnpm validate:strict && pnpm typecheck` on every commit. CI
additionally runs the coverage report, a production-dependency security audit that fails on high and
critical advisories, byte-drift checks on the generated
exports, the Lean kernel build, and Playwright + axe e2e. `.prettierignore` keeps Prettier away from
generated trees so formatters and generators cannot fight.

### Versioning
`registry.yaml` is the single source of truth for the **registry version** (semver, bump on every content
release), the **schema version** (semver, bump when the entity contract changes) and the release timestamp
(set explicitly so exports stay byte-deterministic). The **site/package version** lives in `package.json`;
package bumps and changelog entries go through Changesets — add one with `pnpm changeset`, then `pnpm release`
runs the full flow (version → publish → validate → build).

### Running Local Development Server
```bash
pnpm dev
# Opens Astro development server at http://localhost:3000
```

---

## 5. Machine & Developer Interfaces

The [data inventory decision](docs/decided/data-inventory.md) defines the
source-of-truth layers, projection boundaries, supported interfaces, and the
required procedure for adding a data type.

### Static REST API
Flat files under `https://hoba.work/api/v1/`, served from disk with no database
behind them. Every collection has an index and one document per entry:
- `GET /api/v1/observations/index.json` — every observation
- `GET /api/v1/barriers/index.json` — every barrier, in stage order
- `GET /api/v1/mechanisms/index.json` — every mechanism with its facets
- `GET /api/v1/mechanisms/mech.ats_parser_extraction_failure.json` — one entry
- `GET /api/v1/records/index.json` — every financial/contract/runway record
- `GET /api/v1/graph/index.json` — nodes and edges for the explorer
- OpenAPI 3.1 contract, generated from the registry: [`/openapi.json`](https://hoba.work/openapi.json)

The `index.json` is not decoration: these paths are excluded from the worker and
served as static files, so a directory does not resolve to its index. The
contract lists all 24 paths (two for each of the 11 collections, plus the API index and graph projection).

### Validation over HTTP
`POST /validate/{analysis,scenario,claim}` check a submitted document against the
deployed release. They call the same library functions the build and the MCP
server call, so there is no second implementation of any rule:
```bash
curl -sX POST https://hoba.work/validate/claim \
  -H 'content-type: application/json' \
  -d '{"id":"mech.bench_priority_fill","claim_level":"proven"}'
# -> valid:false, "which the registry itself carries only as \"compatible\""
```

### Model Context Protocol (MCP) Server
Equip AI agents and IDE assistants with direct access to **hoba** knowledge. The packages are **not yet published to
npm**; run the server from a local checkout (`pnpm install && pnpm build:packages`):
```json
{
  "mcpServers": {
    "hoba": {
      "command": "node",
      "args": ["/path/to/hoba.work/packages/mcp/dist/index.js", "--dir", "/path/to/hoba.work"]
    }
  }
}
```
The registry root is resolved from `--dir`, then `$HOBA_ROOT`, then by walking up from the working directory.
Tools: `get_registry_info`, `get_data_inventory`, `search_registry`, `get_node`, `get_scenario`, `explain_observation`, `find_compatible_mechanisms`,
`get_diagnostic_probes`, `find_patterns`, `get_interventions`, `traverse_graph`, `get_methodology`,
`detect_temporal_anomalies`, `calculate_runway`, `verify_flow_conservation`, `evaluate_pattern_emptiness`,
`validate_entity_ids`, `validate_scenario`, `validate_analysis`, `validate_claim`.

### CLI Tool
```bash
alias hoba="node $PWD/packages/cli/dist/cli.js"

# Run forensic hoba analysis on one or more observations
hoba explain obs.materially_similar_role_reposted_shortly_after_rejection --stage technical
hoba explain obs.complete_silence_after_submission obs.materially_similar_role_reposted_shortly_after_rejection --json
# Legacy short codes still resolve, so an old note or link keeps working:
hoba explain obs.materially_similar_role_reposted_shortly_after_rejection --stage technical

# Diagnose stage dwell anomalies and identify stalled mechanisms
hoba latency proc.the_hiring_funnel_end_to_end recruiter-queue 45 --json

# Calculate candidate runway horizon, exhaustion risk, and vulnerability notes
hoba runway 24000 3500

# Evaluate formal algebraic emptiness and contradiction proofs across all patterns
hoba patterns

# Audit financial flow conservation across records
hoba conservation

# Search across the knowledge graph
hoba search "reposted" --types observation,pattern

# Inspect detailed entity specification (`get` is the same command)
hoba show mech.genuine_technical_skill_shortfall

# What an entity is connected to, and by which relation
hoba graph pat.compensation_double_bind

# Read an authored scenario, or list the scenarios there are
hoba scenario scenario.application_silence
hoba scenario

# Registry metadata
hoba registry stats
hoba registry version
hoba registry inventory --json

# Validate content (schemas, references, DAG, loop declarations, EN/UK parity)
hoba validate --strict
```

### Formal Verification (Lean 4)
All four canonical workflows (`proc.*`), barrier dependency DAGs, cycle properties, and flow conservation invariants are formalized and proved directly in the **Lean 4** kernel:
```bash
# Build formal Lean data and discharge kernel theorems
pnpm lean
```
Key kernel-proved theorems include:
- `ideal_acyclic` & `ideal_route_bounded`: Canonical hiring path `proc.the_path_as_it_is_supposed_to_run` terminates in $\le 12$ ranks.
- `observed_has_cycle`: Observed funnel `proc.the_hiring_funnel_end_to_end` contains the closed-then-reposted cycle `pat.closed_then_reposted_requisition_motif`.
- `substrate_gates_acyclic`: Structural barrier lattice is strictly acyclic.
- `substrate_condition_partition`: Exact partition of substrate conditions into barriers and mechanisms.
- `substrate_flows_positive`: Conservation and validity of all financial resource flows.

### Machine-readable inventory and exports
- Inventory and usage guide: [`/data/latest/inventory.json`](https://hoba.work/data/latest/inventory.json)
- Coverage boundary: [`/data/latest/coverage.json`](https://hoba.work/data/latest/coverage.json)
- Case-space lift: [`/data/latest/case-lift.json`](https://hoba.work/data/latest/case-lift.json)
- Acquisition backlog: [`/data/latest/coverage-backlog.json`](https://hoba.work/data/latest/coverage-backlog.json)
- JSON bundle: [`/data/latest/registry.json`](https://hoba.work/data/latest/registry.json)
- NDJSON lines: [`/data/latest/registry.ndjson`](https://hoba.work/data/latest/registry.ndjson)
- CSV Nodes: [`/data/latest/nodes.csv`](https://hoba.work/data/latest/nodes.csv)
- CSV Edges: [`/data/latest/edges.csv`](https://hoba.work/data/latest/edges.csv)
- GraphML: [`/data/latest/graph.graphml`](https://hoba.work/data/latest/graph.graphml)

`registry.json` and NDJSON cover all 11 ontology collections. The graph JSON,
GraphML, and node/edge CSV files are intentionally narrower: they contain the
six reader-facing finding types and their relationships, not the entire data inventory.

---

## 6. Website: Languages & Themes

- Every page is prerendered in **English** (`/…`, canonical) and **Ukrainian** (`/uk/…`), including entity detail
  pages; `<link rel="alternate" hreflang>` ties the pairs together. UI copy lives in `apps/web/src/i18n/ui.ts` (the `uk`
  dictionary is typed against `en` and parity-tested); registry prose comes from the mirrored entity files in
  `data/en/` and `data/uk/` (structural parity enforced by `pnpm validate`).
- `apps/web/public/_worker.js` (Cloudflare Pages Advanced Mode) negotiates the language for unprefixed HTML requests:
  explicit choice (`hoba_lang` cookie, set by the switcher) → `Accept-Language: uk` → Cloudflare geo `UA` → and, with
  no signal at all, Ukrainian. `/uk/…` URLs are always honoured; assets and `/api`, `/data`, `/schemas` are never redirected.
- Catalog pages (Registry, Patterns) render the same data as a **table (default)**, a compact list, or cards; the
  switch persists to `localStorage` and is applied before paint via `<html data-view>`.
- Light and dark themes: the toggle in the navbar persists to `localStorage`; without a stored choice the site follows
  `prefers-color-scheme`, defaulting to dark when the browser reports none. Surfaces use CSS tokens
  (`apps/web/src/styles/theme.css`); palette tints carry explicit `dark:` variants.

---

## 7. Epistemic Posture & Rules

1. **No False Precision:** Logical compatibility in the graph does not imply probability without calibrated priors.
2. **Honest Baselines:** Candidate skill-depth shortfalls, leveling mismatches, and communication friction are mandatory baseline mechanisms.
3. **No Intent Mind-Reading:** The registry classifies structural forces, never accusing named individuals or organizations of hidden malice.
4. **Explicit Verbs:** Claims strictly adhere to *Observed*, *Compatible with*, *Supported*, and *Established*.
5. **Loops Are Graph Facts:** A loop is only "established" when every edge is declared on the mechanisms themselves
   (`amplifies` / `masks`) so Tarjan SCC detection can confirm it; `pnpm validate` warns about editorial-only loops.

---

## 8. Author & Licensing

- **Author:** [Dmytro Yemelianov](https://github.com/dmytro-yemelianov)
- **Registry Content:** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
- **Code & Toolchain:** [MIT License](LICENSE)
