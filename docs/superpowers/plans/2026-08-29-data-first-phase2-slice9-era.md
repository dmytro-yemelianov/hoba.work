# Data-First Architecture — Phase 2, Slice 9: Era Migration (`E-001`..`E-004` → `era.*`) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate all 4 era entities from legacy short codes to canonical dotted IDs (`era.<slug>`), preserving `aliases: ["E-0xx"]`, and fix the ordering dependency that would otherwise scramble a page whose whole argument is chronological.

---

## 1. Scope

- **Entities renamed:** 4 eras in `content/eras/` and `content-uk/eras/`.
- **Cross-references:** each era's `entities` list and each indicator's `evidence`, both quoted.
- **No per-entity route** (`/eras` is a single page with one `<article>` per era), so
  `LEGACY_ALIASES` stays at 89. There is a JSON collection under `/api/v1/eras/`.
- **CI gates:** `validate:strict`, `typecheck`, `test`, `build`, `lean`, `e2e`.

---

## 2. The hazard: chronology by filename

`/eras` renders `bundle.eras` in load order, which is filename order. Today that is
`E-001..E-004`, which happens to be chronological. After the rename the alphabetical
order is `a_fixed_number_of_seats` (2024–), `rates_up_payroll_repriced`,
`the_record_funding_years`, `zero_rates_and_a_same_year_deduction` (2008–) — near enough
to backwards, on a page built as a time strip proportional to real time.

`e2e/process.spec.ts` catches it (`spans[i][0] === spans[i-1][1] + 1`), but the fix is
not to appease the test: a timeline should order by time, not by what an entity is
called. Both the strip and the article list get an explicit sort on `from`.

This is the same class of defect as Slice 7's `/check` default, and the third time
filename order has silently carried meaning. Any remaining slice should assume it.

## 3. Dots in ids, again

Era ids reach the DOM as `<article id={era.id}>` and are linked as `#<id>` fragments
from the era tabs and from `EraNote`. Fragments and `getElementById` are dot-safe and
no client script CSS-selects an era, so the only breakage is in the e2e suite, which
uses `article[id^="E-"]` and asserts `/eras#E-004`.

---

## 4. Tasks

### Task 1: Execute the era rename codemod
- Run `pnpm rename-entities --type era --dir eras`; verify 8 files renamed with
  `aliases: ["E-0xx"]` and every `entities` cross-reference rewritten in both mirrors.

### Task 2: Order the timeline by time
- Sort in `eras.astro` so the strip, the articles and the `ShareBar` fallback no longer
  depend on filenames.

### Task 3: Sweep the e2e suite
- `article[id^="E-"]` → the dotted prefix; `/eras#E-004` → the canonical id with its
  dot escaped in the regex.

### Task 4: Full gate
- `pnpm task check` end to end, then commit.
