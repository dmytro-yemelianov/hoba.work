# Data-First Architecture — Phase 6: Conformance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rollout step 6 — *"`validate_analysis`/`validate_scenario`/`validate_claim` wired end to end; registry semver + content hash (§10) live in every build."* The three validators were wired in Phase 5, so what remains is §10 and DoD 8.

---

## 1. Scope

- `registry.yaml`'s `version` becomes strict semver at `1.0.0`. §10 is explicit that this
  migration is what external spec §22 defines as a MAJOR bump.
- `build:registry` computes `registry_hash` over every entity and scenario file and writes
  it into `manifest.json`, so a release is identified by what it contains and not only by
  what it is called.
- The Analysis schema tightens `registry_version` to semver, which it could not do while
  the live registry emitted a calendar version.
- Per-entity `version` numbers stay **explicitly deferred**, as §10 says — noted so the
  deferral is not silently lost.

## 2. Two deliberate deviations

**`registry.yaml` stays at the repository root.** §10 names `data/registry.yaml`, but that
path assumes §9's target restructure (`content/` → `data/entities/`, `site/` → `apps/web/`,
the `packages/registry` split). None of that is in the phased rollout, and this file is the
marker `findRegistryRoot` locates the repository by. Moving it alone would half-do a
restructure and break root resolution for no gain in this step.

**No `generated_at`.** §10 asks for a build timestamp beside the hash. The project has
already decided against exactly that, in a comment in `registry.yaml` itself: *"`updated_at`
is set explicitly (not at build time) so registry exports stay byte-deterministic."* Build
artifacts are committed here, so a clock-derived field would dirty the tree on every build
and hide real changes in the noise. `updated_at` already dates the release, and
`registry_hash` — which is derived from content, not the clock — identifies it. Recording
the deviation rather than contradicting a standing decision in passing.

## 3. Tasks

### Task 1: The content hash
`registryContentHash(root)` over every entity and scenario file: sorted paths, path and
bytes both folded in, so a rename changes the hash as surely as an edit. Test-first, and
prove it is stable across calls, sensitive to content, and sensitive to file names.

### Task 2: Semver
`registryManifestSchema.version` to semver; `registry.yaml` to `1.0.0`; `manifest.json`
gains `registry_hash`; `hoba registry version` and the MCP `get_registry_info` report it.

### Task 3: Tighten the Analysis contract
`registry_version` to semver only, with the worked example updated — the dual form existed
solely because Phase 6 had not landed.

### Task 4: Parity (DoD 7)
DoD 7 asks that CLI and MCP expose the same underlying data. They now read the same
collections through the same library functions, but nothing asserts it. One test that
pins the version, counts and scenario ids reported by both.

### Task 5: Full gate, then commit.
