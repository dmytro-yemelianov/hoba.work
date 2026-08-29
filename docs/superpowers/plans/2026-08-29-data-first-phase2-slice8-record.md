# Data-First Architecture — Phase 2, Slice 8: Record Migration (`R-001`..`R-013` → `record.*`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all 13 financial record entities from legacy short codes to canonical dotted IDs (`record.<slug>`), preserving `aliases: ["R-0xx"]` and the flow-conservation invariant.

---

## 1. Scope

- **Entities renamed:** 13 records in `content/records/` and `content-uk/records/`.
- **Cross-references:** `flows[].to` and `superseded_by`, both quoted, so the codemod reaches them.
- **No public entity route, no API collection, no redirects.** Records surface only as
  aggregate counts on `/data`, so `LEGACY_ALIASES` stays at 89.
- **Invariant to preserve:** `substrateVerifyFlowConservation` — every outward split still
  sums to ≤ 100% with no negative allocations, in the TypeScript derivation and the Lean kernel.
- **CI gates:** `validate:strict`, `typecheck`, `test`, `build`, `lean`, `e2e`.

---

## 2. Why this slice is smaller than the last

Slice 7's four defects all came from a workflow id being *parsed* — out of a substrate
composite key, out of a DOM anchor, out of a filename sort order. Records are parsed
in none of those ways:

- The substrate key is `rec:<id>` with no suffix, so nothing splits it on a dot.
  The one composite that does (`reads: rec:<id>#<field>`) already admits dots in its regex.
- `toPublicId`'s `rec:actor.` special case is not reachable from a `record.`-prefixed id.
- No record id reaches the DOM as an element id, a fragment, or a selector.
- `/data` renders counts, never a record id, so no layout can be pushed off a viewport.

The one thing to fix by hand is the prose on `/data`, which names the range `(R-001..R-013)`
and stops being true the moment the codemod runs.

---

## 3. Tasks

### Task 1: Execute the record rename codemod
- Run `pnpm rename-entities --type record --dir records`; verify 26 files renamed with
  `aliases: ["R-0xx"]`, and every `flows[].to` rewritten in both mirrors.

### Task 2: Sweep the one stale prose reference
- `site/src/pages/[...locale]/data.astro` names `(R-001..R-013)` beside a count that
  already says the same thing.

### Task 3: Full gate
- `pnpm task check` end to end, then commit.
