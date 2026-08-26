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

## 1. The HOBA Diagnostic Protocol

A **HOBA Analysis** is a forensic procedure designed to replace emotional interpretation of weak signals with structured, testable facts:

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

- **Observations (`HOBA-A-xxx`):** Observable artifacts (silence, generic rejection, role reposted, scope creep).
- **Barriers (`HOBA-B-xxx`):** Strictly acyclic DAG of hiring funnel structural gates.
- **Mechanisms (`HOBA-M-xxx`):** Forces operating at gates with explicit classification facets (`actor`, `nature`, `visibility`, `removability`). Includes mandatory honest-baseline mechanisms.
- **Patterns (`HOBA-P-xxx`):** Named systemic motifs (e.g. *Seniority Double Bind*, *Closed-Then-Reposted*).
- **Loops (`HOBA-L-xxx`):** Causal cycles among mechanisms validated via graph SCCs.
- **Interventions (`HOBA-I-xxx`):** Targeted process and policy changes for employers, recruiters, and ATS platforms.

---

## 3. Monorepo Structure

```text
.
├── packages/
│   ├── registry/      # @hoba/registry: core knowledge graph, Zod schemas, diagnostic engine
│   ├── cli/           # @hoba/cli: "hoba" command-line tool (search, show, explain, validate)
│   └── mcp/           # @hoba/mcp: Model Context Protocol server for AI coding assistants
├── site/              # Astro 5 + Tailwind CSS + Cytoscape.js static web app (hoba.work)
├── content/           # Canonical English Markdown + YAML frontmatter registry content
├── content-uk/        # Mirrored Ukrainian localized registry content
├── evidence/          # Empirical and research citations catalog
├── schemas/           # Auto-generated JSON Schemas for all entity types
├── scripts/           # Build and validation scripts (DAG acyclicity, SCC cycles, exports)
├── tests/             # Vitest test suite
└── spec/              # Full HOBA System & Website Specification
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

# Validate ontology schemas and DAG graph integrity
pnpm validate

# Run unit and integration tests
pnpm test

# Build all packages, static exports, schemas, and Astro website
pnpm build
```

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
Equip AI agents and IDE assistants with direct access to HOBA knowledge:
```json
{
  "mcpServers": {
    "hoba": {
      "command": "npx",
      "args": ["-y", "@hoba/mcp"]
    }
  }
}
```

### CLI Tool
```bash
# Run forensic HOBA analysis on an observation
npx @hoba/cli explain HOBA-A-004 --stage technical

# Search across the knowledge graph
npx @hoba/cli search "reposted"

# Inspect detailed entity specification
npx @hoba/cli show HOBA-M-001
```

### Raw Graph Exports
- JSON bundle: [`/data/latest/registry.json`](https://hoba.work/data/latest/registry.json)
- NDJSON lines: [`/data/latest/registry.ndjson`](https://hoba.work/data/latest/registry.ndjson)
- CSV Nodes: [`/data/latest/nodes.csv`](https://hoba.work/data/latest/nodes.csv)
- CSV Edges: [`/data/latest/edges.csv`](https://hoba.work/data/latest/edges.csv)
- GraphML: [`/data/latest/graph.graphml`](https://hoba.work/data/latest/graph.graphml)

---

## 6. Epistemic Posture & Rules

1. **No False Precision:** Logical compatibility in the graph does not imply probability without calibrated priors.
2. **Honest Baselines:** Candidate skill-depth shortfalls, leveling mismatches, and communication friction are mandatory baseline mechanisms.
3. **No Intent Mind-Reading:** The registry classifies structural forces, never accusing named individuals or organizations of hidden malice.
4. **Explicit Verbs:** Claims strictly adhere to *Observed*, *Compatible with*, *Supported*, and *Established*.

---

## 7. Author & Licensing

- **Author:** [Dmytro Yemelianov](https://github.com/dmytro-yemelianov)
- **Registry Content:** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)
- **Code & Toolchain:** [MIT License](LICENSE)
