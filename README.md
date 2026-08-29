# hoba — Hiring Obstacles & Barriers Atlas

[![CI](https://github.com/dmytro-yemelianov/hoba.work/actions/workflows/ci.yml/badge.svg)](https://github.com/dmytro-yemelianov/hoba.work/actions/workflows/ci.yml)
[![License: MIT / CC BY-SA 4.0](https://img.shields.io/badge/License-MIT%20%7C%20CC%20BY--SA%204.0-blue.svg)](LICENSE)
[![Canonical Origin](https://img.shields.io/badge/domain-hoba.work-blueviolet)](https://hoba.work)

> **Turn hiring outcomes into structured facts.**  
> *When the signal is unclear, do not invent a story; pause, separate observation from interpretation, and map the system.*

---

## 0. Overview

**hoba** is a public, versioned, machine-readable atlas of technical hiring obstacles, observable signals, hidden mechanisms, recurring contradictions, causal feedback loops, and targeted system interventions.

The public web application at [`hoba.work`](https://hoba.work) is one interface to the registry. The registry itself is the core product: a Git-versioned knowledge graph exposed as web pages, static REST JSON API, OpenAPI 3.1, Model Context Protocol (MCP) server, CLI, CSV, and GraphML exports.

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

---

## 3. Monorepo Structure

```text
.
├── packages/
│   ├── registry/      # @hoba/registry: core knowledge graph, Zod schemas, diagnostic engine
│   ├── cli/           # @hoba/cli: "**hoba**" command-line tool (search, show, explain, validate)
│   └── mcp/           # @hoba/mcp: Model Context Protocol server for AI coding assistants
├── site/              # Astro 5 + Tailwind CSS + Cytoscape.js static web app (hoba.work)
├── content/           # Canonical English Markdown + YAML frontmatter registry content
├── content-uk/        # Mirrored Ukrainian localized registry content (same IDs & structure)
├── evidence/          # Evidence records cited by nodes
├── registry.yaml      # Release manifest: registry version, schema version, release timestamp
├── schemas/           # Generated JSON Schemas for all entity types (do not edit by hand)
├── scripts/           # build-registry.ts (exports/API/OpenAPI) and validate.ts
├── tests/             # Vitest unit + content integration suites
└── spec/              # Full **hoba** System & Website Specification
```

---

## 4. Quick Start & Development

### Prerequisites
- Node.js >= 20
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

# Browser tests against the built site: routing/i18n, theme, data views, wizard, graph, 404,
# mobile navigation, link integrity, axe WCAG 2.1 AA in light and dark (needs `pnpm build` first)
pnpm e2e

# Build all packages, regenerate static exports/schemas/API, and build the Astro website
pnpm build
```

Generated files under `schemas/` and `site/public/{api,data,schemas,openapi.json}` are committed and must be
regenerated with `pnpm build:registry` after any content change — CI fails if they drift.

### Versioning
`registry.yaml` is the single source of truth for the **registry version** (`YYYY.MM.N`, bump on every content
release), the **schema version** (semver, bump when the entity contract changes) and the release timestamp
(set explicitly so exports stay byte-deterministic). The **site/package version** lives in `package.json`.

### Running Local Development Server
```bash
pnpm dev
# Opens Astro development server at http://localhost:3000
```

---

## 5. Machine & Developer Interfaces

### Static REST API
Hosted with zero database latency under `https://hoba.work/api/v1/`:
- `GET /api/v1/artifacts` — List all observations
- `GET /api/v1/barriers` — List all barrier stages
- `GET /api/v1/mechanisms` — List all mechanisms with classification facets
- `GET /api/v1/graph` — Complete graph elements for visualization
- OpenAPI 3.1 Contract: [`/openapi.json`](https://hoba.work/openapi.json)

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
Tools: `get_registry_info`, `search_registry`, `get_node`, `explain_observation`, `find_compatible_mechanisms`,
`get_diagnostic_probes`, `find_patterns`, `get_interventions`, `traverse_graph`, `get_methodology`,
`detect_temporal_anomalies`, `calculate_runway`, `verify_flow_conservation`, `evaluate_pattern_emptiness`.

### CLI Tool
```bash
alias hoba="node $PWD/packages/cli/dist/cli.js"

# Run forensic hoba analysis on one or more observations
hoba explain obs.materially_similar_role_reposted_shortly_after_rejection --stage technical
hoba explain obs.complete_silence_after_submission obs.materially_similar_role_reposted_shortly_after_rejection --json
# Legacy short codes still resolve, so an old note or link keeps working:
hoba explain A-004 --stage technical

# Diagnose stage dwell anomalies and identify stalled mechanisms
hoba latency proc.the_hiring_funnel_end_to_end recruiter-queue 45 --json

# Calculate candidate runway horizon, exhaustion risk, and vulnerability notes
hoba runway 24000 3500

# Evaluate formal algebraic emptiness and contradiction proofs across all patterns
hoba patterns

# Audit financial flow conservation across records
hoba conservation

# Search across the knowledge graph
hoba search "reposted" --types artifact,pattern

# Inspect detailed entity specification
hoba show mech.genuine_technical_skill_shortfall

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

### Raw Graph Exports
- JSON bundle: [`/data/latest/registry.json`](https://hoba.work/data/latest/registry.json)
- NDJSON lines: [`/data/latest/registry.ndjson`](https://hoba.work/data/latest/registry.ndjson)
- CSV Nodes: [`/data/latest/nodes.csv`](https://hoba.work/data/latest/nodes.csv)
- CSV Edges: [`/data/latest/edges.csv`](https://hoba.work/data/latest/edges.csv)
- GraphML: [`/data/latest/graph.graphml`](https://hoba.work/data/latest/graph.graphml)

---

## 6. Website: Languages & Themes

- Every page is prerendered in **English** (`/…`, canonical) and **Ukrainian** (`/uk/…`), including entity detail
  pages; `<link rel="alternate" hreflang>` ties the pairs together. UI copy lives in `site/src/i18n/ui.ts` (the `uk`
  dictionary is typed against `en` and parity-tested); registry prose comes from `content/` and `content-uk/`.
- `site/public/_worker.js` (Cloudflare Pages Advanced Mode) negotiates the language for unprefixed HTML requests:
  explicit choice (`hoba_lang` cookie, set by the switcher) → `Accept-Language: uk` → Cloudflare geo `UA` → and, with
  no signal at all, Ukrainian. `/uk/…` URLs are always honoured; assets and `/api`, `/data`, `/schemas` are never redirected.
- Catalog pages (Registry, Patterns) render the same data as a **table (default)**, a compact list, or cards; the
  switch persists to `localStorage` and is applied before paint via `<html data-view>`.
- Light and dark themes: the toggle in the navbar persists to `localStorage`; without a stored choice the site follows
  `prefers-color-scheme`, defaulting to dark when the browser reports none. Surfaces use CSS tokens
  (`site/src/styles/theme.css`); palette tints carry explicit `dark:` variants.

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
