# Data-First Architecture — Phase 2, Slice 7: Workflow Migration (`WF-001`..`WF-004` → `proc.*`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all 4 workflow entities from legacy short codes to canonical dotted IDs (`proc.<slug>`), preserving `aliases: ["WF-0xx"]`, and resolve the two hazards this type introduces that the previous six slices did not have: a hard-coded canonical-path constant threaded through site, build and proof code, and workflow IDs that reach the DOM as element ids and URL fragments.

---

## 1. Scope

- **Entities renamed:** 4 workflows in `content/workflows/` and `content-uk/workflows/`.
  - `WF-001` → `proc.the_hiring_funnel_end_to_end`
  - `WF-002` → `proc.an_application_inside_the_ats`
  - `WF-003` → `proc.the_path_as_it_is_supposed_to_run`
  - `WF-004` → `proc.client_account_hiring_funnel`
- **No public entity route and no redirects.** Workflows are not in `generate-redirects.ts`'s
  `TYPE_ROUTE` table; they surface through `/process`, so `LEGACY_ALIASES` stays at 89.
- **Out of scope, by the precedent of slices 1–6:** the narrative docs (`README.md`,
  `ROADMAP.md`, `SPEC-MODEL.md`, `CHANGELOG.md`, `PLAN-SUBSTRATE.md`, `DRAFT-WF-004.md`,
  `formal/README.md`) still carry legacy codes from every earlier slice and are left alone.
- **CI gates:** `validate:strict`, `typecheck`, `test`, `build`, `lean`, `e2e`.

---

## 2. The two hazards specific to this type

### Hazard A — the canonical-path constant
`WF-003` is not just content: it is looked up by string in five places
(`site/src/lib/registry.ts`'s `IDEAL_PATH_ID`, `site/src/lib/markdown.ts`,
`check.astro`, `graph.astro`, `scripts/build-lean.ts`) and asserted in
`tests/content.test.ts`. Each must move to the dotted ID together; a missed one
fails closed (the lookup returns `undefined`), which the gates catch.

### Hazard B — dots in DOM ids and CSS selectors
`stateAnchor(workflow.id, state.id)` becomes an element `id` and a URL fragment.
`proc.the_path_as_it_is_supposed_to_run-declined` is a valid HTML id and a valid
fragment, and the client script reads it with `getElementById` and an
`[data-workflow="…"]` attribute selector — both dot-safe. But a CSS *id selector*
`#proc.the_path…` parses the dot as a class boundary. `e2e/process.spec.ts`
uses one. Every such selector must become an attribute selector.

---

## 3. Tasks

### Task 1: Execute the workflow rename codemod
- Run `pnpm rename-entities --type workflow --dir workflows`; verify 8 files renamed
  with `aliases: ["WF-0xx"]`, and `transitions[].from/to` plus `states[].entities` intact.

### Task 2: Retire the hard-coded `WF-003` / `WF-001` lookups
- Update `IDEAL_PATH_ID`, `markdown.ts`, `check.astro`, `graph.astro`, `build-lean.ts`,
  and the `OnboardingTour.astro` `[data-workflow="…"]` selector.

### Task 3: Resolve the visible-chrome copy
- A 33-character dotted ID does not fit a toolbar button or an 11px pill.
  Where the ID sat as a parenthetical beside a human name that already says the same
  thing, drop the parenthetical and keep the name; keep the canonical dotted ID in the
  `title` tooltip, where length is free. Applies to `graph.astro` (button, HUD heading,
  HUD mode pill) and the three `tour.*` keys in `site/src/i18n/ui.ts`, both languages.

### Task 4: Sweep tests, e2e and proof comments
- `tests/content.test.ts`, `tests/mcp.test.ts`, `tests/cli.test.ts`, `tests/derivations.test.ts`.
- `e2e/process.spec.ts`, converting `#WF-003-…` id selectors to `[id="…"]` attribute
  selectors and escaping the dot in the URL regex.
- Comment-only references in `packages/registry/src/substrate/lift.ts`,
  `formal/Hoba/Theorems.lean`, and the MCP `process_id` description.

### Task 5: Full gate
- `pnpm task check` end to end, then commit.
