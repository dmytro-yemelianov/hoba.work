# Data-First Architecture — Phase 8: Repository Structure (§9)

**Goal:** Move the repository to the target tree in design doc §9.

**Owner's go-ahead this session**, on the recommendation below.

---

## The decision §9 does not make

§9's tree shows `data/entities/observation/*.md` and `data/evidence/*.md` — and
nothing at all for the Ukrainian mirror. That is not a small omission: every
entity in this registry exists twice, and `PLAN-SUBSTRATE.md`'s fifth invariant
is *"Each language judged on its own."* The target tree is silent on the single
most fundamental property of the layout.

Three shapes were possible: `data-uk/` beside `data/`, a `<id>.uk.md` sibling
per entity, or a language level inside `data/`. **Taken: the third.**

```
data/
  en/entities/<type>/*.md
  uk/entities/<type>/*.md
  evidence/*.md          ← language-neutral, as it already is
  scenarios/*.yaml       ← already here
```

It is the only one of the three that stops treating English as the default
location, which is how the validator has always treated the mirrors: it judges
both, and `compareBundleStructure` is symmetric. `content/` versus
`content-uk/` encoded a hierarchy the code does not have.

Type directories go singular (`entities/observation/`, not `observations/`),
following §9's own tree and matching the type name exactly. API collections stay
plural, which is a REST convention and a different surface.

## What makes this cheap

`paths.ts` already centralises the answer: `CONTENT_DIRS`, `EVIDENCE_DIR`,
`contentDirFor`, `evidenceDirFor`, `isRegistryRoot`. Most of the repository asks
that module rather than hard-coding a path. The exceptions are few and named in
the tasks below.

The root marker changes with the layout — `isRegistryRoot` looks for
`content/`, which will not exist — so it moves to `data/`.

## Tasks

1. **Move the trees.** `git mv` per type per language, plus `evidence/` →
   `data/evidence/`. History is preserved on every file, as it was through all
   eleven renames.
2. **Repoint `paths.ts`**, the one place that names the trees, and the handful
   that bypass it: `migration.ts` (`RENAME_TREES`, `planFileRename`'s default),
   `hash.ts` (`HASHED_TREES`), `loader.ts` (the evidence sibling), `validation.ts`,
   `build-bodies.ts`, `task.mjs`, and the test helpers' `writeTempRegistry`.
3. **Full gate**, then commit. Deferred to its own slices afterwards:
   `site/` → `apps/web/`, `formal/` → `formal/lean/`, and the
   `packages/registry` split into core/validator/graph/search.

---

## Where this stands (2026-08-30)

Done: the entity trees under `data/` (`5b9fc11`), and `site/` → `apps/web/`
plus `formal/` → `formal/lean/` (`f5c3838`).

Deferred, and deliberately last: the `packages/registry` split into
core/validator/graph/search. It churns every import in the repository for no
capability — the design doc itself calls it "packaging, not a rewrite" — and
`validation.ts`, `graph.ts` and `search.ts` already have the one-way dependency
shape the split would formalise. Worth doing when someone needs the boundary
enforced rather than merely described.

Two things the move surfaced, both older than it:

- `loadRegistryFromDirectory` found the manifest by counting `..` from the
  entity directory, which is why two extra levels broke it. It walks up now.
- `pnpm task new` had been broken since Phase 2 (deriving the next id by parsing
  `A-00N` out of filenames that stopped being numeric) and invalid since
  Phase 3 (templates authoring an `evidence_level` that left the enum). Nobody
  had scaffolded an entity since.
