# Data-First Architecture — Phase 2, Slice 2: Rename `barrier` (16 entities) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename all 16 `barrier` entities (`B-001`..`B-016`) to their dotted-namespace IDs (`bar.<slug>`), reusing Slice 1's proven `rename-entities.ts`/`generate-redirects.ts` mechanism unchanged, and fix everything specific to `barrier` that the rename touches: hardcoded gate-check literals in business logic, one stale UI example string, and a proactive UI hardening pass so long dotted IDs never overflow a small viewport again (Slice 1 discovered this bug class reactively, one page at a time, during its own final review — this plan closes it up front instead).

**Architecture:** No new production mechanism is designed in this plan — `packages/registry/src/migration.ts` (`applyIdRename`, `planFileRename`, `insertAlias`), `scripts/rename-entities.ts`, and `scripts/generate-redirects.ts` are all already generic across entity types and require zero changes. This plan is almost entirely "apply the proven mechanism to `barrier`, then fix what breaks" — the actual design work happened in Slice 1.

**Tech Stack:** Same as Slice 1 — TypeScript, `git mv`, vitest, tsx, Astro/Tailwind for the UI fix, Lean 4 for the formal proofs.

**Spec:** `docs/superpowers/specs/2026-08-28-data-first-architecture-design.md` §8 (migration mechanics) and §14 Phase 2 ("Migrate — run the codemod, one PR per entity type"). This plan implements the SECOND of 11 PRs (`barrier`, 16 entities).

**Real ID mappings for this slice** (from `migration/id-mapping.json`, generated in Phase 1 — do not recompute):

| Old ID | New ID |
|---|---|
| B-001 | `bar.application_ingestion` |
| B-002 | `bar.automated_filter_parser_threshold` |
| B-003 | `bar.inbound_screening_triage` |
| B-004 | `bar.recruiter_screening_call` |
| B-005 | `bar.technical_screen_live_assessment` |
| B-006 | `bar.take_home_work_sample_evaluation` |
| B-007 | `bar.hiring_manager_in_depth_review` |
| B-008 | `bar.team_cross_functional_panel` |
| B-009 | `bar.compensation_levelling_reconciliation` |
| B-010 | `bar.headcount_executive_budget_approval` |
| B-011 | `bar.reference_background_verification` |
| B-012 | `bar.offer_closing_contract_execution` |
| B-013 | `bar.requisition_approval_public_posting` |
| B-014 | `bar.outbound_sourcing_talent_pool_contact` |
| B-015 | `bar.client_profile_approval_and_client_interview` |
| B-016 | `bar.probation_period_post_start_confirmation` |

## Global Constraints

- Every reference to an entity ID in this codebase's content is written as a double-quoted YAML string: `"B-002"`. The codemod relies on this being universally true — if a task's own testing surfaces a file that references an ID *unquoted* or via single quotes, stop and report it.
- `git mv`, never `fs.rename` or delete+recreate — file history must survive every rename in this plan.
- `pnpm validate`, `pnpm typecheck`, and `pnpm test` must pass after every task. `pnpm build` must pass after Task 3 (the real rename) and Task 4 (redirect regeneration).
- **`pnpm task check` (the FULL gate — validate → typecheck → unit tests → build → Lean proofs → e2e) must pass before this plan is considered done.** Slice 1's plan omitted e2e from its own gates entirely and that omission was only caught by Slice 1's final whole-branch review, after real regressions had already landed — do not repeat that gap here. Task 5 runs this explicitly as its own step.
- The `migration/id-mapping.json` artifact is the source of truth for old-ID → new-ID pairs (see the table above — already read from it, do not recompute).
- Distinguish real-registry-dependent test assertions from synthetic-fixture test assertions before touching any test file: a test that builds its own data via `makeBundle()`, `barrier({...})`, or `writeTempRegistry({...})` with an arbitrary ID like `'B-001'` is testing generic logic with throwaway data and must NOT be touched by this rename — only a test that loads real content (via `loadRegistryFromRoot`, the real `hoba` CLI binary, or a real MCP server instance) and asserts a *real* barrier's ID needs updating. Confirmed by pre-planning survey: `tests/cli.test.ts` and `tests/mcp.test.ts` are real-registry-dependent; `tests/diagnostics.test.ts`, `tests/gaps.test.ts`, `tests/loader.test.ts`, `tests/validation.test.ts`, `tests/migration.test.ts`, `tests/target-schema.test.ts` all use synthetic fixtures for their `B-0xx` references and need no changes for this rename.

---

### Task 1: Proactive UI hardening — long dotted IDs must not overflow a small viewport

**Files:**
- Modify: `site/src/pages/[...locale]/barriers/[id].astro:36`
- Modify: `site/src/pages/[...locale]/mechanisms/[id].astro:45`
- Modify: `site/src/pages/[...locale]/artifacts/[id].astro:34`
- Modify: `site/src/pages/[...locale]/loops/[id].astro:35`
- Modify: `site/src/pages/[...locale]/interventions/[id].astro:38`
- Modify: `site/src/pages/[...locale]/actors/[id].astro:46`
- Modify: `site/src/pages/[...locale]/patterns/[id].astro:34`
- Modify: `site/src/pages/[...locale]/registry.astro:142`
- Modify: `site/src/pages/[...locale]/patterns.astro:55`

**Interfaces:** none — this is a pure CSS-class change, no new functions or types. Every one of these files renders `{<entity>.id}` inside a `font-mono` span with no line-break protection.

**Why now, why all of them at once:** Slice 1 discovered this exact bug class reactively — one page overflowed, got fixed, and the fix revealed the *next* page overflowed, because `e2e/responsive.spec.ts`'s 360px check short-circuits at the first failing page in its list. Three separate fix rounds were needed before every affected page was found. Barrier titles slug to up to 50 characters (`bar.client_profile_approval_and_client_interview`), comparable to or longer than the longest pattern ID that caused Slice 1's overflow chain. Fixing every remaining unprotected entity-ID span now, before the real barrier rename lands, means Task 5's e2e run either confirms this is already solved or fails once, with every remaining offender visible in one pass (Playwright's `page.evaluate` overflow check does still short-circuit per test, but since ALL of these are fixed together, there is no page left in the responsive suite's list that still carries this exact defect).

**Explicitly out of scope for this task:** the `pill pill-muted font-mono` cross-reference badges in `data.astro`, `process.astro`, `actors/[id].astro:95`, `ShareBar.astro`, and `EntityBadge.astro` — a visually different pattern (small inline badges, not page headers) not covered by this task's scope. If Task 5's e2e run finds one of these overflowing for a real barrier ID, treat that as a new, small finding to fix directly (same one-line pattern as this task), not a reason to have pre-emptively rewritten every pill in the codebase speculatively.

- [ ] **Step 1: Apply the fix to the 7 entity-detail-page header spans**

Each of these files has exactly one line of this shape — add `break-all` to the existing class list, changing nothing else:

`site/src/pages/[...locale]/barriers/[id].astro:36`
```diff
-        <span class="text-hoba-accent font-mono">{barrier.id}</span>
+        <span class="text-hoba-accent font-mono break-all">{barrier.id}</span>
```

`site/src/pages/[...locale]/mechanisms/[id].astro:45`
```diff
-        <span class="text-hoba-accent font-mono">{mechanism.id}</span>
+        <span class="text-hoba-accent font-mono break-all">{mechanism.id}</span>
```

`site/src/pages/[...locale]/artifacts/[id].astro:34`
```diff
-        <span class="text-hoba-accent font-mono">{artifact.id}</span>
+        <span class="text-hoba-accent font-mono break-all">{artifact.id}</span>
```

`site/src/pages/[...locale]/loops/[id].astro:35`
```diff
-        <span class="text-hoba-accent font-mono">{loop.id}</span>
+        <span class="text-hoba-accent font-mono break-all">{loop.id}</span>
```

`site/src/pages/[...locale]/interventions/[id].astro:38`
```diff
-        <span class="text-hoba-accent font-mono">{intervention.id}</span>
+        <span class="text-hoba-accent font-mono break-all">{intervention.id}</span>
```

`site/src/pages/[...locale]/actors/[id].astro:46`
```diff
-      <span class="text-hoba-accent font-mono">{actor.id}</span>
+      <span class="text-hoba-accent font-mono break-all">{actor.id}</span>
```

`site/src/pages/[...locale]/patterns/[id].astro:34`
```diff
-        <span class="text-hoba-accent font-mono">{pattern.id}</span>
+        <span class="text-hoba-accent font-mono break-all">{pattern.id}</span>
```

- [ ] **Step 2: Apply the fix to the 2 card-view spans**

These two use `w-16 shrink-0` (a fixed-width, non-shrinking flex item) — Slice 1 already discovered that `break-all` alone does nothing on a `shrink-0` element, since `flex-shrink: 0` disables the shrink algorithm outright before `break-all` ever gets a chance to wrap anything. Replace `shrink-0` with `max-w-full` (matching the exact fix already proven in `site/src/components/EntityRow.astro`), and add `break-all`:

`site/src/pages/[...locale]/registry.astro:142`
```diff
-          <span class="font-mono text-sm text-hoba-accent w-16 shrink-0">{node.id}</span>
+          <span class="font-mono text-sm text-hoba-accent w-16 break-all max-w-full">{node.id}</span>
```

`site/src/pages/[...locale]/patterns.astro:55`
```diff
-          <span class="font-mono text-sm text-hoba-accent w-16 shrink-0">{p.id}</span>
+          <span class="font-mono text-sm text-hoba-accent w-16 break-all max-w-full">{p.id}</span>
```

(`w-16` alone, without `shrink-0`, now behaves as a normal preferred width that `max-w-full` can still override on a narrow viewport — the same reasoning already validated on `EntityRow.astro` in Slice 1.)

- [ ] **Step 3: Verify no regression against the current (short) real IDs**

```bash
pnpm build
npx playwright test e2e/responsive.spec.ts
```

Expected: all pass, identically to before this change — `break-all`/`max-w-full` are no-ops for content that already fits (every currently-real ID is short enough not to wrap), so this step proves the change is safe, not that it fixes anything yet. The real proof that this actually prevents an overflow comes from Task 5's full e2e run, once Task 3 has landed real 50-character barrier IDs.

- [ ] **Step 4: Typecheck**

```bash
pnpm typecheck
```

Expected: clean (this task touches no TypeScript).

- [ ] **Step 5: Commit**

```bash
git add "site/src/pages/[...locale]/barriers/[id].astro" "site/src/pages/[...locale]/mechanisms/[id].astro" "site/src/pages/[...locale]/artifacts/[id].astro" "site/src/pages/[...locale]/loops/[id].astro" "site/src/pages/[...locale]/interventions/[id].astro" "site/src/pages/[...locale]/actors/[id].astro" "site/src/pages/[...locale]/patterns/[id].astro" "site/src/pages/[...locale]/registry.astro" "site/src/pages/[...locale]/patterns.astro"
git commit -m "fix(site): let every entity-ID span wrap instead of overflow, before barrier's longer IDs land"
```

---

### Task 2: Fix `substrateCheckConformance`'s hardcoded barrier-gate literals

**Files:**
- Modify: `packages/registry/src/substrate/derivations.ts` (the `substrateCheckConformance` function, lines ~696-794)
- Modify: `tests/conformance.test.ts` (2 assertions)

**Interfaces:** `substrateCheckConformance(profile: CandidateProfile, posting: PostingFacets, _substrate?: Substrate): ConformanceReport` does not read from the registry at all — every `gate:` value it returns is a free-standing string literal describing which barrier a check corresponds to. This task only changes those literals; the function's signature, its `GateOutcome` shape, and every other field it returns (`mechanisms: ['M-024', 'M-017']` etc. — unrelated `M-*` IDs, not part of this rename) are untouched.

- [ ] **Step 1: Write the failing test changes**

In `tests/conformance.test.ts`, change line 68:

```diff
-    expect(report.stops_at!.gate).toBe('B-002');
+    expect(report.stops_at!.gate).toBe('bar.automated_filter_parser_threshold');
```

And change line 92's regex (this function's gate labels are now uniformly the dotted format — no transitional dual-format support is needed here, since this is a business-logic literal that changes atomically with its own test in this one commit, unlike the schema-level `ID_PATTERNS` which must accept both formats during the whole phased migration):

```diff
-      expect(gate.gate, gate.reason.code).toMatch(/^B-\d{3}$/);
+      expect(gate.gate, gate.reason.code).toMatch(/^bar\.[a-z0-9_]+$/);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/conformance.test.ts`
Expected: FAIL — both changed assertions fail against the current code, which still returns `'B-002'`/`'B-013'`/`'B-009'`.

- [ ] **Step 3: Update the implementation**

In `packages/registry/src/substrate/derivations.ts`, inside `substrateCheckConformance` (search for `gate: 'B-013'`, `gate: 'B-002'`, `gate: 'B-009'`), replace each literal with its real new ID from the table at the top of this plan:

- `gate: 'B-013'` (1 occurrence, the `pre-posting`/`real-need` gate) → `gate: 'bar.requisition_approval_public_posting'`
- `gate: 'B-002'` (4 occurrences, all `ingestion`/`machine-check` gates: required-years, authorisation, hiring-location, required-skills) → `gate: 'bar.automated_filter_parser_threshold'`
- `gate: 'B-009'` (2 occurrences, both `compensation`/`level-and-band` gates: the `if` branch and the `else if` branch) → `gate: 'bar.compensation_levelling_reconciliation'`

Do not change the `stage`, `state`, `reason`, or `mechanisms` fields on any of these — only the `gate:` string literal.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/conformance.test.ts`
Expected: PASS — all tests in this file, including the two changed assertions.

- [ ] **Step 5: Full suite + typecheck**

```bash
pnpm typecheck && pnpm test
```

Expected: clean. No other test file references `substrateCheckConformance`'s gate output by a `B-0xx` literal (confirmed by pre-planning survey — `tests/gaps.test.ts`/`tests/diagnostics.test.ts` exercise different functions entirely, using their own synthetic barrier fixtures unrelated to this one).

- [ ] **Step 6: Commit**

```bash
git add packages/registry/src/substrate/derivations.ts tests/conformance.test.ts
git commit -m "fix(registry): update substrateCheckConformance's gate labels to the new barrier IDs"
```

---

### Task 3: Apply the real rename — all 16 `barrier` entities

**Files:**
- Renames (via `git mv`, executed by `scripts/rename-entities.ts`, not by hand): `content/barriers/{B-001..B-016}.md` and their `content-uk/barriers/` mirrors, to their new dotted-namespace filenames (per the table at the top of this plan).
- Content changes: every file across `content/`, `content-uk/`, `evidence/` that references any of the 16 barrier IDs (including `barrier.precedes` — barriers reference each other directly to form the DAG, e.g. `content/barriers/B-001.md`'s `precedes:\n  - "B-002"` — confirmed quoted, the existing codemod's assumption holds).
- Modify: `tests/cli.test.ts` (2 assertions — real-registry-dependent, confirmed by pre-planning survey)
- Modify: `tests/mcp.test.ts` (1 assertion — real-registry-dependent)
- Modify: `site/src/i18n/ui.ts` (1 stale example-ID string, both EN and UK)

**Interfaces:** none new — this task runs Slice 1's `scripts/rename-entities.ts` against real data and fixes what it breaks.

- [ ] **Step 1: Run the script**

```bash
pnpm rename-entities --type barrier --dir barriers
```

Expected output: 16 lines, one per entity, each reporting how many files it rewrote — cross-check every `oldId -> newId` line against the table at the top of this plan.

- [ ] **Step 2: Inspect the diff before validating**

```bash
git status
git diff --stat
```

Confirm: 16 barriers renamed in `content/barriers/` (and in `content-uk/barriers/` if the UK mirror exists for all 16 — check `ls content-uk/barriers/ | wc -l` first and compare); no file outside `content/`, `content-uk/`, `evidence/` appears in this diff (the script itself does not touch `derivations.ts`, `ui.ts`, or any test file — those are separate, explicit steps below).

- [ ] **Step 3: Validate the renamed registry**

```bash
pnpm validate
```

Expected: `0 error(s)`, and the barrier-DAG-acyclic check (`✓ Barrier DAG is strictly acyclic (...)`) still reports success, now printing the 16 new dotted IDs in its cycle path instead of the old short codes. **If the DAG check reports a cycle, or any barrier ID fails to resolve, stop — do not proceed.** The codemod rewrites `precedes:` edges the same way it rewrites every other quoted reference; a failure here means either a `precedes:` entry wasn't quoted (a real counterexample to this plan's Global Constraints, requiring investigation) or the rename introduced a genuine ordering inconsistency, neither of which should be worked around.

- [ ] **Step 4: Full suite**

```bash
pnpm typecheck && pnpm test
```

Expected: 2 real failures, both already anticipated and fixed in this same task (see Step 5) — do not treat them as a surprise requiring a stop:
- `tests/cli.test.ts:26` — `hoba(['show', 'B-013', '--json'])` — the CLI can no longer find `B-013` under its old code (aliases resolve to redirects at the worker layer in Slice 1's design, not inside the CLI's own `show` command — this is expected, not a regression).
- `tests/cli.test.ts:34` and `tests/mcp.test.ts:161` — assert real barrier IDs by their old short codes.

If ANY OTHER test fails beyond these two files, stop and investigate — that would mean a synthetic-fixture test this plan's pre-planning survey classified as unaffected was wrong, which is exactly the kind of finding to report rather than route around.

- [ ] **Step 5: Fix the two real-registry-dependent test files**

`tests/cli.test.ts`:

```diff
-    const json = JSON.parse(hoba(['show', 'B-013', '--json']).stdout);
+    const json = JSON.parse(hoba(['show', 'bar.requisition_approval_public_posting', '--json']).stdout);
```

```diff
-    expect(json.analysis.obstacle.identified_barriers.map((b: { id: string }) => b.id)).toEqual(['B-005', 'B-006']);
+    expect(json.analysis.obstacle.identified_barriers.map((b: { id: string }) => b.id)).toEqual(['bar.technical_screen_live_assessment', 'bar.take_home_work_sample_evaluation']);
```

`tests/mcp.test.ts` line 161 — note this array is sorted (`.sort()` is called on it), and a plain ASCII sort places every uppercase `M-...`/`bar....` — wait, `bar.*` is lowercase and sorts *after* any uppercase ID, so the correct sorted order changes shape, not just content:

```diff
-    expect(trav.nodes.map((n: { id: string }) => n.id).sort()).toEqual(['B-005', 'B-006', 'B-007', 'M-001']);
+    expect(trav.nodes.map((n: { id: string }) => n.id).sort()).toEqual(['M-001', 'bar.hiring_manager_in_depth_review', 'bar.take_home_work_sample_evaluation', 'bar.technical_screen_live_assessment']);
```

(Verify this sort order yourself rather than trusting this plan blindly — `'M-001'` sorts before any lowercase string in a plain JS `.sort()` because `'M'` is ASCII 77 and `'b'` is ASCII 98; among the three `bar.*` strings, compare `hiring_manager` vs `take_home` vs `technical` alphabetically to confirm this exact order.)

- [ ] **Step 6: Fix the stale example-ID string in `ui.ts`**

`site/src/i18n/ui.ts` line 946 (English):

```diff
-  'tour.registry.step1.text': 'Filter by entity type pill or search across IDs (e.g. B-002, M-001), titles, keywords, and stage attributes.',
+  'tour.registry.step1.text': 'Filter by entity type pill or search across IDs (e.g. bar.automated_filter_parser_threshold, M-001), titles, keywords, and stage attributes.',
```

`site/src/i18n/ui.ts` line 1926 (Ukrainian):

```diff
-  'tour.registry.step1.text': 'Фільтруйте за типами сутностей або шукайте за ID (наприклад, B-002, M-001), заголовками, ключовими словами та етапами.',
+  'tour.registry.step1.text': 'Фільтруйте за типами сутностей або шукайте за ID (наприклад, bar.automated_filter_parser_threshold, M-001), заголовками, ключовими словами та етапами.',
```

Before editing, re-run `grep -n "'tour.registry.step1.text'" site/src/i18n/ui.ts` to confirm these are still the only two occurrences and the line numbers still match — this file has been edited by both Slice 1 and this plan's own Task 3, so line numbers may have shifted slightly.

- [ ] **Step 7: Full suite again**

```bash
pnpm typecheck && pnpm test
```

Expected: clean, 0 failures.

- [ ] **Step 8: Build**

```bash
pnpm build
```

Expected: clean build, regenerating `site/dist` with the new barrier URLs.

- [ ] **Step 9: Visually verify one renamed page**

Serve the build and open the new URL for the old `B-002` (the most heavily-referenced barrier, per Task 2's finding — good stress test for both the rename and Task 1's overflow fix):

```bash
npx wrangler pages dev site/dist --port 8788 --ip 127.0.0.1 --compatibility-date 2026-07-21
```

Open `http://127.0.0.1:8788/barriers/bar.automated_filter_parser_threshold` with `Accept-Language: en`. Confirm: same title/content as the old `/barriers/B-002` page (only the URL changed), and the ID span at the top of the page wraps cleanly rather than overflowing — this is your first real confirmation that Task 1's fix actually works, not just that it didn't regress.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "content: rename all 16 barrier entities to their dotted-namespace IDs (B-0xx -> bar.*)"
```

---

### Task 4: Regenerate the redirect table

**Files:**
- Modify: `site/public/_worker.js` (the `LEGACY_ALIASES` block only — regenerated, not hand-edited)

**Interfaces:** none new — `scripts/generate-redirects.ts` (built in Slice 1) already reads every entity's `aliases` field from the live registry and already includes `barrier` in its `TYPE_ROUTE` table. This task is a pure data refresh.

- [ ] **Step 1: Run it**

```bash
pnpm generate:redirects
```

Expected: `Wrote 20 redirect(s) to site/public/_worker.js.` (4 pattern aliases from Slice 1 + 16 barrier aliases from Task 3 — if the count differs, stop and check whether every barrier file's `aliases:` field actually landed correctly in Task 3).

- [ ] **Step 2: Diff-check**

```bash
git diff site/public/_worker.js
```

Confirm: only the `LEGACY_ALIASES` object's contents changed (16 new entries added, the 4 existing pattern entries untouched); `legacyRedirect`'s logic is unchanged (this script only replaces the block between the `GENERATED`/`END GENERATED` markers).

- [ ] **Step 3: Add and run the worker tests for barrier redirects**

Append to `tests/worker.test.ts`'s existing `describe('legacy entity-ID redirects', ...)` block (do not modify the existing pattern-focused tests from Slice 1):

```ts
  it('redirects an old barrier short code to its new dotted-namespace path', () => {
    expect(legacyRedirect('/barriers/B-002')).toBe('/barriers/bar.automated_filter_parser_threshold');
  });

  it('redirects an old barrier short code requesting its Markdown representation', () => {
    expect(legacyRedirect('/barriers/B-002.md')).toBe('/barriers/bar.automated_filter_parser_threshold.md');
  });
```

(These exercise the exact `.md`-aware redirect logic Slice 1's final review added — this is the first real second entity type to prove that fix generalizes correctly beyond `pattern`.)

Run: `npx vitest run tests/worker.test.ts`
Expected: PASS — all tests, old and new.

- [ ] **Step 4: Full suite, typecheck, build**

```bash
pnpm typecheck && pnpm test && pnpm build
```

Expected: all clean.

- [ ] **Step 5: Commit**

```bash
git add site/public/_worker.js tests/worker.test.ts
git commit -m "feat(worker): regenerate the redirect table with the 16 new barrier aliases"
```

---

### Task 5: Full gate, including e2e

**Files:** none — this task runs the project's complete gate and fixes anything it finds.

**Interfaces:** none.

This is the task Slice 1's plan never had, and its absence was the single largest gap Slice 1's final review found. Running it as its own explicit task here — rather than assuming the per-task gates already prove readiness — is this plan's direct answer to that gap.

- [ ] **Step 1: Run the full gate**

```bash
pnpm task check
```

This runs, in order: `validate` → `typecheck` → unit `test` → `build` → Lean `proofs` → `e2e`.

- [ ] **Step 2: If `proofs` (Lean) reports anything other than success**

`formal/Hoba/Data.lean` is generated from live registry IDs by `scripts/build-lean.ts` and will need regenerating (this is `pnpm lean`'s `build:lean` step, which `pnpm task check` already runs as part of `proofs` — so this should self-heal). If `lake build` itself fails (a real proof breaking, not just stale data), stop and report — do not hand-edit a `.lean` proof file to route around a real failure.

Confirmed during this plan's own pre-planning survey: unlike Slice 1's pattern rename, neither `formal/Hoba/Theorems.lean` nor `formal/README.md` names a specific barrier ID in prose — only the generated `Data.lean` changes, and only mechanically. If Step 1 leaves `formal/Hoba/Data.lean` modified but uncommitted, add it to this task's commit; if it's already clean (regenerated and committed as part of the `task check` run itself, depending on how your local git state ends up), just confirm via `git status`.

- [ ] **Step 3: If `e2e` reports any failure**

Read the failure carefully before touching anything. Given Slice 1's own experience, the most likely categories, in order of likelihood:

1. **A stale ID literal in an e2e spec** — grep `e2e/*.spec.ts` for any remaining `'B-0\d\d'` literal referencing one of the 16 renamed barriers specifically (not every `B-0xx` string in `e2e/` is stale — most reference OTHER, not-yet-renamed barriers... wait, all 16 barriers are now renamed by this plan, so any `B-0xx` string anywhere in `e2e/` referencing barrier IDs 1-16 is now stale by definition). Update it to the real new ID from the table at the top of this plan.
2. **A layout overflow this plan's Task 1 didn't anticipate** — if it's the same `font-mono` no-wrap defect class (an unwrapped span/pill overflowing at 360px), the fix is the identical one-line `break-all` addition Task 1 used; find the offending element via the failing test's error message (Playwright reports the exact overflow amount and page path) and apply the same pattern. This is explicitly authorized here — do not treat it as scope creep, since it's the same finding class this plan's Task 1 already exists to close, just an instance neither Task 1's author nor this plan's author enumerated.
3. **Anything else** — stop and report. Do not guess at a fix for a failure that isn't one of the two patterns above; this plan's author didn't anticipate every possible failure mode, and a genuinely novel one deserves a fresh ruling, not an improvised patch.

For any fix made in this step, re-run the specific failing spec, then the full `pnpm task check` once more from the top to confirm nothing else regressed.

- [ ] **Step 4: Commit any fixes from Steps 2-3**

```bash
git add -A
git commit -m "fix: close gaps found by the full gate (validate/typecheck/test/build/proofs/e2e)"
```

(Skip this commit if Steps 2-3 needed no changes — i.e., `pnpm task check` passed clean on the first run.)

---

## Self-review notes

- **Spec coverage:** design doc §8's requirements (aliases carry the old code forward, redirects generated not hand-maintained, `git mv` never delete+recreate) → Task 3 (reuses Slice 1's mechanism verbatim). §14's "one PR per entity type" → this entire plan is that one PR for `barrier`.
- **Type consistency:** no new types are introduced by this plan — `RenameApplication`, `FileRenamePlan`, `GateOutcome`, `ConformanceReport` are all pre-existing and unchanged in shape; only their string-literal *contents* change (gate labels in Task 2, IDs in Task 3).
- **Real vs. synthetic test distinction, stated once, applied consistently:** the Global Constraints section states the rule; Task 3's Step 4 explicitly predicts exactly two files will need fixing and treats any third failure as a stop-and-investigate signal, rather than silently expanding scope.
- **No placeholders:** every code change in this plan uses the real ID from the table computed from `migration/id-mapping.json`, not an illustrative example needing later replacement (unlike Slice 1's Task 5, which had to seed 3 placeholder slugs because Task 4 hadn't run yet at plan-writing time — this plan doesn't have that problem, since Phase 1 already computed every type's mapping up front).
- **Risk carried forward, not hidden:** Task 3's Step 3 says stop on a DAG-acyclic failure rather than push forward; Task 5's Step 3 draws an explicit line between "same known finding class, fix it" and "novel failure, stop and report" rather than authorizing unlimited improvisation.

## Next slices

Once this slice is merged and deployed, the same 5-task shape (proactive UI-class check → type-specific business-logic/copy sweep → real rename → redirect regen → full gate) applies to each remaining type, though most won't need Task 1 again (the UI hardening is now done for every type that has an individual detail page). `evidence` (48 entities, flat directory, no per-language tree) and `actor` (7 entities, conflicting `aliases` field shape) each still need their own dedicated plan before reuse, per Slice 1's final review findings — do not attempt either with a naive `pnpm rename-entities --type evidence` / `--type actor` invocation without first resolving those documented blockers.
