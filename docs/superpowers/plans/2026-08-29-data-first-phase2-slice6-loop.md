# Data-First Architecture — Phase 2, Slice 6: Loop Migration (`L-001`..`L-003` → `loop.*`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all 3 causal loop entities (`L-001`..`L-003`) from legacy short codes to canonical dotted IDs (`loop.<slug>`), preserving `aliases: ["L-0xx"]`, keeping the Tarjan SCC backing intact, expanding the edge redirect table to 89 entries, and passing all 6 CI gates.

---

## 1. Scope

- **Entities renamed:** 3 loops in `content/loops/` and `content-uk/loops/`.
  - `L-001` → `loop.employment_gap_penalty_loop`
  - `L-002` → `loop.take_home_opportunity_cost_saturation_loop`
  - `L-003` → `loop.inflated_requirements_search_saturation_loop`
- **Cross-references updated:** `actors/*.md` (`recommendations[].targets`), `eras/E-004.md` (`entities`),
  `interventions/*.md` (`targets`), and the prose/`expected_effects` references the quote-anchored
  codemod cannot reach.
- **Invariant to preserve:** every loop stays backed by a declared mechanism SCC (`scripts/validate.ts`).
- **Edge routing:** `LEGACY_ALIASES` grows 86 → 89 (4 patterns + 16 barriers + 28 mechanisms + 21 observations + 17 interventions + 3 loops).
- **CI gates:** `validate:strict`, `typecheck`, `test`, `build`, `lean`, `e2e`.

---

## 2. Tasks

### Task 1: Execute the loop rename codemod
- Run `pnpm rename-entities --type loop --dir loops`.
- Verify 6 files renamed (both mirrors) with `aliases: ["L-0xx"]` inserted after `type:`.
- Verify quoted cross-references rewritten across actors, eras and interventions in both mirrors.

### Task 2: Sweep the prose references the codemod cannot reach
- `applyIdRename` replaces only fully-quoted `"L-00x"` tokens; four `expected_effects` strings
  (EN + UK, `int.remove_career_gap_feature_from_automated_ranking_models` and
  `int.requirements_drawn_from_the_team_s_own_backlog`) mention the loop *inside* a sentence.
- Rewrite those frontmatter strings, then regenerate the rendered bodies with `pnpm build:bodies`.
- Confirm zero remaining `L-00x` occurrences under `content/`, `content-uk/`, `evidence/`.

### Task 3: Verify the SCC invariant and referential integrity
- Run `pnpm validate:strict`; all three loops must still report
  "is backed by a declared SCC", and both mirrors must stay structurally identical.

### Task 4: Regenerate redirects and extend worker tests
- Run `pnpm generate:redirects` (expect 89 redirects).
- Add loop redirect cases (bare + `.md`) to `tests/worker.test.ts`.

### Task 5: Sweep E2E specs, regenerate Lean data, run the full gate
- Update `/loops/L-001` route assertions in `e2e/cards.spec.ts`, `e2e/formats.spec.ts`,
  `e2e/i18n.spec.ts`, `e2e/responsive.spec.ts`, `e2e/specimens.spec.ts`.
- Regenerate `formal/Hoba/Data.lean` via the build and re-verify with `lake build`.
- Run `pnpm task check` end to end, then commit.
