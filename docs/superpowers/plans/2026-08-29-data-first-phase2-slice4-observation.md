# Data-First Architecture — Phase 2, Slice 4: Observation/Artifact Entity Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all 21 observation/artifact entities (`A-001` through `A-021`) from short codes to canonical dotted IDs (`obs.<slug>`), preserving aliases `aliases: ["A-0xx"]`, updating emissions, scenarios, substrate liftings, redirects, UI components, and passing all 6 CI gates.

---

## 5 Tasks

1. **Codemod & Renaming**: Run `pnpm rename-entities --type artifact --dir artifacts`.
2. **Substrate & Diagnostics Update**: Update `lift.ts` (`obs.complete_silence_after_submission`), `diagnostics.ts` empirical scenarios, and `helpers.ts`.
3. **Edge Worker Redirects**: Run `pnpm generate:redirects` to generate 69 total redirects (4 patterns + 16 barriers + 28 mechanisms + 21 observations) into `site/public/_worker.js` and add worker tests.
4. **Site & UI Updates**: Update `index.astro`, `analyze.astro`, `check.astro`, `data.astro`, `developers.astro`, `build-discovery.ts`.
5. **Lean 4 Proofs & Test Verification**: Update test suites (`tests/`, `e2e/`), verify `lake build`, and run `pnpm task check`.
