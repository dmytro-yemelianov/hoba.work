# Data-First Architecture — Phase 2, Slice 11: Actor Migration (slug → `actor.*`, URLs unchanged) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give all 7 actors canonical dotted IDs (`actor.<slug>`) while keeping their public URLs on the bare slug (`/actors/recruiter`), closing Phase 2 at 11/11 types.

**Decision of record (owner, this session):** of the three ways to close — leave actors
as bare slugs, migrate ids and URLs together, or migrate the id and keep the URL — the
owner chose the third. The registry becomes fully consistent, no public URL moves, and
exactly one type carries an explicit id→route rule.

---

## 1. Why actors could not use the codemod

Every earlier slice renamed a globally unique token. An actor id is none of those things:

- **Three vocabularies share the same strings.** `actorId` (the 7 entity ids),
  `actorTypeSchema` (mechanism facets: adds `system`, `policy`, `external`) and
  `interventionActorSchema` (adds `recruiter-process`, `candidate-action`,
  `industry-standard`) overlap but are distinct closed enums. `"candidate"` appears 220
  times across content and only some of those are the actor entity. A blunt
  `applyIdRename` would corrupt the other two vocabularies.
- **`aliases` is already taken.** On actors it is `{ facet, intervention }` — enum values
  in other collections that resolve to this actor, not migration history. `insertAlias`
  throws on it by design.

The rename is therefore **field-scoped**: only the fields the schema types as `actorId`
are rewritten, identified by their key and indentation, which this repository's YAML
formats consistently.

| field | shape | rename? |
|---|---|---|
| actor entity `id` | `id: "recruiter"` | yes |
| `perspectives[].actor` | `    actor: "recruiter"` (4-space) | yes |
| workflow `states[]`/`transitions[].owner` | `    owner: "recruiter"` (4-space) | yes |
| record `owner_actor` | `owner_actor: "recruiter"` (0-space) | yes |
| mechanism `facets.actor` | `  actor: "recruiter"` (2-space) | **no** — `actorTypeSchema` |
| intervention `actor` | `actor: "recruiter"` (0-space) | **no** — `interventionActorSchema` |
| actor `aliases.facet[]` / `.intervention[]` | `    - "recruiter"` | **no** |

Both closed enums are the safety net: a missed field fails `actorId`, and a wrongly
rewritten one fails `actorTypeSchema` or `interventionActorSchema`, each with a path.

## 2. Keeping the URL

A new required `slug` field on the actor schema carries the public route segment, which
is also the pre-migration id. `id` is canonical everywhere in the registry; `slug` is used
only where a URL is built.

---

## 3. Tasks

### Task 1: Schema
- Add `slug` to `actorSchema`; move `actorId` to the seven dotted values.

### Task 2: The field-scoped rename
- `applyActorIdRename` in `packages/registry/src/migration.ts`, test-first, proving both
  that it rewrites the four `actorId` fields and that it leaves the other two
  vocabularies and the alias lists untouched.

### Task 3: Content
- Run it across both mirrors; add `slug:` to all 14 actor files.

### Task 4: The site
- Route param and every `/actors/…` href move to `slug`: `actors/[id].astro`,
  `actors/index.astro`, `Perspectives.astro`.
- `?lens=`, `data-lens` and `data-actor` stay on the canonical id, so the `LENSES`
  allowlist in `Layout.astro` and the pairwise rules in `theme.css` move to dotted ids.
- Both of those enumerate six actors and `LensSwitch` offers seven, so choosing **Client**
  today hides every perspective and reveals none. Since this slice rewrites every entry of
  both lists, the seventh is added rather than left broken.

### Task 5: Full gate
- `pnpm task check`, verifying `/actors/recruiter` still resolves and no redirect is
  emitted for actors (their `aliases` is an object, which `generate-redirects` already skips).
