# Data-First Architecture — Phase 2, Slice 3: Mechanism Migration (`M-001`..`M-028` → `mech.*`) — Implementation Plan

> **Goal:** Migrate all 28 mechanism entities from legacy short codes (`M-001`..`M-028`) to canonical semantic dotted IDs (`mech.<slug>`), preserving backward compatibility via alias maps, HTTP 301 redirects, and verified by the 6-gate CI invariant suite.

---

## 1. Overview & Scope

- **Entities to rename:** 28 mechanisms in `content/mechanisms/` and `content-uk/mechanisms/`.
- **Target format:** `mech.<slug>.md` with `aliases: ["M-0xx"]`.
- **Cross-references updated:**
  - `patterns/*.md`: `compatible_mechanisms`
  - `loops/*.md`: `mechanisms`
  - `interventions/*.md`: `targets` (when targeting mechanisms)
  - `workflows/*.md`: `states[].entities`
  - Content prose referencing mechanism IDs
- **Substrate & Derivations:**
  - Substrate condition naming: `cnd:mech.<slug>`
  - Indistinguishability & Identifiability derivations over Substrate
- **Edge Routing:**
  - Regenerate `site/public/_worker.js` (20 existing + 28 new = 48 redirects)
- **CI Gates:**
  - `validate:strict`, `typecheck`, `test`, `build`, `lean`, `e2e`

---

## 2. Tasks & Execution Plan

### Task 1: Pre-Migration Substrate & UI Audit
- Audit `packages/registry/src/substrate/` for mechanism ID parsing (`lift.ts`, `project.ts`, `derivations.ts`).
- Ensure UI templates handle `mech.*` IDs gracefully without horizontal scroll or layout shifts.

### Task 2: Execute Mechanism Rename Codemod
- Run: `pnpm rename-entities --type mechanism --dir mechanisms`
- Verify:
  - All 28 files in `content/mechanisms/` and `content-uk/mechanisms/` renamed to `mech.*.md`.
  - `aliases: ["M-0xx"]` preserved in YAML frontmatter.
  - Cross-references across patterns, loops, interventions, workflows, and evidence files updated.
- Run `pnpm validate` to verify referential integrity and schema conformance.

### Task 3: Update Unit & Integration Test Suites
- Update mechanism ID assertions across:
  - `tests/cli.test.ts`
  - `tests/mcp.test.ts`
  - `tests/lift.test.ts`
  - `tests/derivations.test.ts`
  - `tests/gaps.test.ts`
- Run `pnpm typecheck && pnpm test` and commit.

### Task 4: Regenerate Redirects & Worker Tests
- Run: `pnpm generate:redirects` (expect 48 total redirects).
- Add mechanism redirect test cases to `tests/worker.test.ts`.
- Verify with `npx vitest run tests/worker.test.ts` and commit.

### Task 5: E2E Suite, Lean Proofs & Full Gate Verification
- Sweep remaining `M-0xx` references in `e2e/` test specifications.
- Regenerate Lean 4 data definitions: `pnpm build:lean && pnpm lean`.
- Run full CI invariant gate: `pnpm task check`.
- Commit and finalize Slice 3.
