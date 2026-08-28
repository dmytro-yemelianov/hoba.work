# Data-First Architecture — Phase 2, Slice 1: Rename Codemod + Redirects, Piloted on `pattern` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the reusable ID-rename codemod and the legacy-URL redirect mechanism, then apply both for real to the 4 `pattern` entities — the lowest-centrality, page-having entity type — proving the whole rename+redirect pipeline end to end before it touches any of the other 10 types.

**Architecture:** The codemod does exact-quoted-token text substitution (`"P-001"` → `"pat.seniority_double_bind"`) across every file under `content/`, `content-uk/`, and `evidence/` — not a YAML-parse-and-reserialize round trip, which would risk reformatting hand-authored block scalars and quote styles. This one substitution pass simultaneously updates the entity's own `id` field and every external cross-reference to it (structured array fields, and the two untyped mixed-ID arrays found during Phase 2 planning: era's `entities` and actor's nested `recommendations[].targets`), because every reference in this codebase is written as a double-quoted YAML string and nothing else in a content file happens to share that exact quoted substring. The redirect mechanism keeps `site/public/_worker.js` a single, dependency-free file (matching its existing "tests import it directly, no bundler" design) by embedding a generated-but-committed lookup table inside a clearly delimited block in the same file, rather than adding a sibling import or a runtime fetch.

**Tech Stack:** TypeScript, Node `fs`/`path`/`child_process`, vitest, tsx, `git mv` (via `child_process.execSync`, to preserve file history — a plain `fs.rename` would not).

**Spec:** `docs/superpowers/specs/2026-08-28-data-first-architecture-design.md` §8 (migration mechanics: aliases, generated redirects, git mv) and §14 Phase 2 ("Migrate — run the codemod, one PR per entity type"). This plan implements the FIRST of those 11 PRs (`pattern`, 4 entities) plus the redirect mechanism §8 requires to exist before any real URL changes.

**Scope decision carried from planning, not in the design doc:** the design doc's §9 target repo structure moves content into `data/entities/<type>/`. This plan does **not** do that move — entities are renamed in place, `content/patterns/P-001.md` → `content/patterns/pat.seniority_double_bind.md`, same directory. Interleaving a directory move with 11 separate ID-rename passes multiplies the risk surface for no benefit; moving every already-renamed file from `content/` to `data/entities/` in one bulk pass, once all 11 types are done, is a strictly simpler, lower-risk operation. Flagging this now so it isn't silently forgotten: **the `content/` → `data/entities/` move is its own future step, after Phase 2 completes for all 11 types.**

## Global Constraints

- Every reference to an entity ID in this codebase's content is written as a double-quoted YAML string: `"P-001"`. The codemod relies on this being universally true — if a task's own testing surfaces a file that references an ID *unquoted* or via single quotes, stop and report it; do not silently extend the token format without flagging it.
- `git mv`, never `fs.rename` or delete+recreate — file history must survive every rename in this plan.
- The pilot type is `pattern` (`P-001`..`P-004`, prefix `pat`) — confirmed lowest-centrality of the 7 page-having types: not part of the barrier DAG, not part of the Lean-verified loop/SCC invariants, referenced by a small, enumerable set of files (2 interventions, 1 era, 2 actors, per the pre-planning survey).
- Known cross-reference field names for `pattern` specifically, confirmed against real content during planning (informational — the codemod does not special-case these; it is a blind quoted-token replace, this list is only for verifying nothing was missed after the fact): `pattern.required_artifacts`, `pattern.compatible_mechanisms`, `pattern.interventions`, `intervention.targets`, `era.entities`, `actor.recommendations[].targets`.
- `pnpm validate`, `pnpm typecheck`, and `pnpm test` must pass after every task. `pnpm build` must pass after Task 4 (the real pilot application) and Task 6 (the redirect wiring).
- The `migration/id-mapping.json` artifact from Phase 1 is the source of truth for old-ID → new-ID pairs. Do not recompute or second-guess its 4 pattern entries; read them directly.

---

### Task 1: `applyIdRename` — quoted-token substitution across the content tree

**Files:**
- Modify: `packages/registry/src/migration.ts` (append; do not alter Phase 1's `slugifyTitle`/`buildIdMapping`/`TYPE_ID_PREFIX`)
- Modify: `packages/registry/src/index.ts` — no change needed, `migration.ts` is already re-exported wholesale from Phase 1.
- Test: `tests/migration.test.ts` (append; do not alter Phase 1's or Phase 1-Task-2's existing tests)

**Interfaces:**
- Consumes: `tests/helpers.ts`'s existing `writeTempRegistry(files: Record<string, string>): string` (already used by `tests/loader.test.ts` — writes a throwaway `registry.yaml` + `content/` + `evidence/` tree under a temp dir and returns its root).
- Produces: `applyIdRename(root: string, oldId: string, newId: string): RenameApplication`, and `RenameApplication { oldId: string; newId: string; filesChanged: string[] }` (paths in `filesChanged` are relative to `root`). Task 3's orchestration script imports this from `@hoba/registry`.

- [ ] **Step 1: Write the failing tests**

Append to `tests/migration.test.ts`:

```ts
import { applyIdRename } from '@hoba/registry';
import { writeTempRegistry } from './helpers';

describe('applyIdRename', () => {
  it('replaces the quoted old ID with the quoted new ID in every file that contains it', () => {
    const root = writeTempRegistry({
      'content/patterns/P-001.md': '---\nid: "P-001"\ntype: "pattern"\nrequired_artifacts:\n  - "A-002"\n---\n\n# Body\n',
      'content/interventions/I-002.md': '---\nid: "I-002"\ntype: "intervention"\ntargets:\n  - "P-001"\n  - "B-002"\n---\n',
      'content-uk/patterns/P-001.md': '---\nid: "P-001"\ntype: "pattern"\n---\n\n# Тіло\n',
      'evidence/EVD-001.md': '---\nid: "EVD-001"\ntype: "evidence"\n---\n',
    });

    const result = applyIdRename(root, 'P-001', 'pat.seniority_double_bind');

    expect(result).toEqual({
      oldId: 'P-001',
      newId: 'pat.seniority_double_bind',
      filesChanged: expect.arrayContaining([
        'content/patterns/P-001.md',
        'content/interventions/I-002.md',
        'content-uk/patterns/P-001.md',
      ]),
    });
    expect(result.filesChanged).toHaveLength(3);

    const pattern = fs.readFileSync(`${root}/content/patterns/P-001.md`, 'utf8');
    expect(pattern).toContain('id: "pat.seniority_double_bind"');
    expect(pattern).not.toContain('"P-001"');

    const intervention = fs.readFileSync(`${root}/content/interventions/I-002.md`, 'utf8');
    expect(intervention).toContain('- "pat.seniority_double_bind"');
    expect(intervention).toContain('- "B-002"'); // untouched, different ID

    const uk = fs.readFileSync(`${root}/content-uk/patterns/P-001.md`, 'utf8');
    expect(uk).toContain('id: "pat.seniority_double_bind"');
  });

  it('does not touch a file that only contains an unrelated ID', () => {
    const root = writeTempRegistry({
      'content/patterns/P-002.md': '---\nid: "P-002"\ntype: "pattern"\n---\n',
    });
    const result = applyIdRename(root, 'P-001', 'pat.seniority_double_bind');
    expect(result.filesChanged).toEqual([]);
    expect(fs.readFileSync(`${root}/content/patterns/P-002.md`, 'utf8')).toContain('"P-002"');
  });

  it('does not match a substring of a longer ID', () => {
    const root = writeTempRegistry({
      'content/patterns/P-001.md': '---\nid: "P-001"\ntype: "pattern"\n---\n',
      'content/patterns/P-0010.md': '---\nid: "P-0010"\ntype: "pattern"\n---\n',
    });
    const result = applyIdRename(root, 'P-001', 'pat.seniority_double_bind');
    expect(result.filesChanged).toEqual(['content/patterns/P-001.md']);
    expect(fs.readFileSync(`${root}/content/patterns/P-0010.md`, 'utf8')).toContain('"P-0010"');
  });
});
```

Note: `fs` is already imported at the top of `tests/migration.test.ts` from Phase 1's Task 2 (`import fs` is not there yet — check the file; if it only has `loadRegistryFromRoot`/`resolveRegistryRoot` from `@hoba/registry`, add `import fs from 'node:fs';` at the top alongside the existing imports).

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/migration.test.ts`
Expected: FAIL — `applyIdRename is not a function` (or a TypeScript error if `fs` import is missing — add it).

- [ ] **Step 3: Write the implementation**

Append to `packages/registry/src/migration.ts` (add `import fs from 'node:fs';` and `import path from 'node:path';` at the top of the file alongside the existing `import type { RegistryBundle } from './types.js';`):

```ts
export interface RenameApplication {
  oldId: string;
  newId: string;
  /** Paths relative to `root`, in the order they were found. */
  filesChanged: string[];
}

const RENAME_TREES = ['content', 'content-uk', 'evidence'];

/**
 * Replaces every double-quoted occurrence of `oldId` with `newId` across
 * content/, content-uk/, and evidence/. Anchored on the surrounding quote
 * characters so "P-0010" is never matched while renaming "P-001" — and
 * because every ID reference in this codebase's content is written as a
 * quoted YAML string, this single substitution simultaneously updates the
 * entity's own `id:` line and every external cross-reference to it,
 * including fields not explicitly modeled by the schema (era's `entities`,
 * actor's nested `recommendations[].targets`). No YAML parse/reserialize
 * round trip — every other byte of every touched file is preserved as-is.
 */
export function applyIdRename(root: string, oldId: string, newId: string): RenameApplication {
  const token = `"${oldId}"`;
  const replacement = `"${newId}"`;
  const filesChanged: string[] = [];

  for (const tree of RENAME_TREES) {
    const dir = path.join(root, tree);
    if (!fs.existsSync(dir)) continue;
    for (const file of walkMarkdownFiles(dir)) {
      const text = fs.readFileSync(file, 'utf8');
      if (!text.includes(token)) continue;
      fs.writeFileSync(file, text.split(token).join(replacement));
      filesChanged.push(path.relative(root, file));
    }
  }

  return { oldId, newId, filesChanged };
}

function walkMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/migration.test.ts`
Expected: PASS — 14 tests total (11 from Phase 1 [9 from Task 1 + 2 from Task 2] + 3 new).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add packages/registry/src/migration.ts tests/migration.test.ts
git commit -m "feat(registry): add applyIdRename, a format-preserving quoted-token codemod"
```

---

### Task 2: File rename planning + alias insertion

**Files:**
- Modify: `packages/registry/src/migration.ts` (append)
- Test: `tests/migration.test.ts` (append)

**Interfaces:**
- Produces: `planFileRename(root: string, typeDir: string, oldId: string, newId: string): FileRenamePlan[]`, `FileRenamePlan { oldPath: string; newPath: string }`, and `insertAlias(filePath: string, oldId: string): void`. Task 3's orchestration script consumes all three.
- `typeDir` is the content directory name for a type (e.g. `'patterns'`, `'barriers'`) — the caller (Task 3) supplies it; this function does not hardcode a type→directory table, since that table already exists nowhere reusable and inventing one here would duplicate Task 3's own type-dispatch. Keeping `typeDir` as a plain parameter keeps this function honest about what it actually needs.

- [ ] **Step 1: Write the failing tests**

Append to `tests/migration.test.ts`:

```ts
import { insertAlias, planFileRename } from '@hoba/registry';

describe('planFileRename', () => {
  it('plans a rename for every language tree where the old file exists', () => {
    const root = writeTempRegistry({
      'content/patterns/P-001.md': '---\nid: "P-001"\n---\n',
      'content-uk/patterns/P-001.md': '---\nid: "P-001"\n---\n',
    });
    const plans = planFileRename(root, 'patterns', 'P-001', 'pat.seniority_double_bind');
    expect(plans).toEqual([
      { oldPath: `${root}/content/patterns/P-001.md`, newPath: `${root}/content/patterns/pat.seniority_double_bind.md` },
      { oldPath: `${root}/content-uk/patterns/P-001.md`, newPath: `${root}/content-uk/patterns/pat.seniority_double_bind.md` },
    ]);
  });

  it('skips a language tree where the old file does not exist', () => {
    const root = writeTempRegistry({
      'content/actors/candidate.md': '---\nid: "candidate"\n---\n',
    });
    const plans = planFileRename(root, 'actors', 'candidate', 'actor.candidate');
    expect(plans).toHaveLength(1);
    expect(plans[0].oldPath).toBe(`${root}/content/actors/candidate.md`);
  });
});

describe('insertAlias', () => {
  it('inserts an aliases block immediately after the type: line', () => {
    const root = writeTempRegistry({
      'content/patterns/pat.seniority_double_bind.md': '---\nid: "pat.seniority_double_bind"\ntype: "pattern"\nsummary: "..."\n---\n\n# Body\n',
    });
    const filePath = `${root}/content/patterns/pat.seniority_double_bind.md`;
    insertAlias(filePath, 'P-001');
    const text = fs.readFileSync(filePath, 'utf8');
    expect(text).toBe(
      '---\nid: "pat.seniority_double_bind"\ntype: "pattern"\naliases:\n  - "P-001"\nsummary: "..."\n---\n\n# Body\n'
    );
  });

  it('throws a clear error when the file has no type: line to anchor on', () => {
    const root = writeTempRegistry({
      'content/patterns/broken.md': '---\nid: "x"\n---\n',
    });
    expect(() => insertAlias(`${root}/content/patterns/broken.md`, 'P-001')).toThrow(/no "type:" line/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/migration.test.ts`
Expected: FAIL — `planFileRename is not a function` / `insertAlias is not a function`.

- [ ] **Step 3: Write the implementation**

Append to `packages/registry/src/migration.ts`:

```ts
export interface FileRenamePlan {
  oldPath: string;
  newPath: string;
}

/** Computes git-mv source/destination pairs for one entity across every language tree it exists in. */
export function planFileRename(root: string, typeDir: string, oldId: string, newId: string): FileRenamePlan[] {
  const plans: FileRenamePlan[] = [];
  for (const tree of ['content', 'content-uk']) {
    const oldPath = path.join(root, tree, typeDir, `${oldId}.md`);
    if (!fs.existsSync(oldPath)) continue;
    plans.push({ oldPath, newPath: path.join(root, tree, typeDir, `${newId}.md`) });
  }
  return plans;
}

/**
 * Inserts `aliases:\n  - "<oldId>"` immediately after the file's `type:` line.
 * Call this AFTER applyIdRename has already rewritten the file's own `id:`
 * line to the new ID — this function only adds the new field, it does not
 * touch `id`.
 */
export function insertAlias(filePath: string, oldId: string): void {
  const text = fs.readFileSync(filePath, 'utf8');
  const marker = /^type: ".*"\n/m;
  if (!marker.test(text)) {
    throw new Error(`insertAlias: no "type:" line found in ${filePath}`);
  }
  const updated = text.replace(marker, (line) => `${line}aliases:\n  - "${oldId}"\n`);
  fs.writeFileSync(filePath, updated);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/migration.test.ts`
Expected: PASS — 18 tests total (14 from Task 1 + 4 new).

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add packages/registry/src/migration.ts tests/migration.test.ts
git commit -m "feat(registry): add planFileRename and insertAlias for the entity-rename codemod"
```

---

### Task 3: Orchestration script — `scripts/rename-entities.ts`

**Files:**
- Create: `scripts/rename-entities.ts`
- Modify: `package.json` (add one script entry)

**Interfaces:**
- Consumes: `applyIdRename`, `planFileRename`, `insertAlias` from `@hoba/registry` (Tasks 1-2); reads `migration/id-mapping.json` directly (it's plain JSON, no registry-loading needed — the whole point of this script is that it runs *before* the renamed content can be loaded by the normal Zod-validated loader, since the loader would reject files mid-rename).
- This script does the real `git mv` via `child_process.execSync('git mv ...')` — `applyIdRename`/`planFileRename` never call git themselves, keeping them pure-ish and independently testable (Tasks 1-2's tests never touch git).

This is the one task in this plan without a TDD test — it's a thin, one-shot CLI orchestrator wiring together three already-tested functions plus `git mv`, in the same spirit as `scripts/generate-id-mapping.ts` from Phase 1. Its correctness is proven by *running it for real* in Task 4, not by a unit test of the wiring itself.

- [ ] **Step 1: Write the script**

Create `scripts/rename-entities.ts`:

```ts
/**
 * Renames every entity of one type from its short code to its dotted-namespace
 * ID, using migration/id-mapping.json (generated in Phase 1) as the source of
 * truth. Per entity: rewrites every quoted reference across content/,
 * content-uk/, and evidence/ (applyIdRename), computes the git-mv plan for
 * every language tree it exists in (planFileRename), performs the git mv,
 * then inserts an `aliases:` entry recording the old code (insertAlias).
 *
 *   pnpm rename-entities --type pattern --dir patterns
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { applyIdRename, insertAlias, planFileRename, resolveRegistryRoot } from '@hoba/registry';

const args = process.argv.slice(2);
const typeIdx = args.indexOf('--type');
const dirIdx = args.indexOf('--dir');
const typeArg = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
const dirArg = dirIdx !== -1 ? args[dirIdx + 1] : undefined;
if (!typeArg || !dirArg) {
  console.error('Usage: pnpm rename-entities --type <entity-type> --dir <content-directory-name>');
  process.exit(1);
}

const root = resolveRegistryRoot();
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'migration', 'id-mapping.json'), 'utf8')) as {
  mappings: Array<{ oldId: string; newId: string; type: string }>;
};

const entries = mapping.mappings.filter((m) => m.type === typeArg);
if (entries.length === 0) {
  console.error(`No entries of type "${typeArg}" found in migration/id-mapping.json.`);
  process.exit(1);
}

console.log(`Renaming ${entries.length} ${typeArg} entit${entries.length === 1 ? 'y' : 'ies'}...`);

for (const { oldId, newId } of entries) {
  const { filesChanged } = applyIdRename(root, oldId, newId);
  console.log(`  ${oldId} -> ${newId}: rewrote ${filesChanged.length} file(s)`);

  const renames = planFileRename(root, dirArg, oldId, newId);
  for (const { oldPath, newPath } of renames) {
    execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: root, stdio: 'inherit' });
    insertAlias(newPath, oldId);
  }
}

console.log('Done. Review the diff, then run: pnpm validate && pnpm typecheck && pnpm test');
```

- [ ] **Step 2: Add the package.json script entry**

In `package.json`'s `"scripts"` block, add (alphabetically, next to `"registry:*"`/`"generate:id-mapping"` per Phase 1's convention):

```json
    "rename-entities": "tsx scripts/rename-entities.ts",
```

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`
Expected: clean. (No functional test for this task — see the note above; Task 4 is its real-world verification.)

- [ ] **Step 4: Commit**

```bash
git add scripts/rename-entities.ts package.json
git commit -m "feat(scripts): add the entity-rename orchestrator (git mv + reference rewrite + alias)"
```

---

### Task 4: Apply the pilot — rename all 4 `pattern` entities for real

**Files:**
- Renames (via `git mv`, executed by the script, not by hand): `content/patterns/{P-001,P-002,P-003,P-004}.md` and their `content-uk/patterns/` mirrors, to their new dotted-namespace filenames (read the actual new names from `migration/id-mapping.json` — do not hand-type them, they must come from the generated table).
- Content changes: every file across `content/`, `content-uk/`, `evidence/` that references any of the 4 pattern IDs.

**Interfaces:** none — this task runs Task 3's script against real data and verifies the result.

This task has no code to write. It is the actual, real-world execution of the codemod, and its correctness is judged by the project's own existing gates (`validate`, `typecheck`, `test`, `build`), not by new tests.

- [ ] **Step 1: Run the script**

```bash
pnpm rename-entities --type pattern --dir patterns
```

- [ ] **Step 2: Inspect the diff before validating**

```bash
git status
git diff --stat
```

Confirm: 4 patterns renamed in both `content/patterns/` and `content-uk/patterns/` (8 renames total, or fewer if a UK mirror is genuinely missing for one — check `content-uk/patterns/` had all 4 before running); every file the pre-planning survey named (`content/interventions/I-002.md`, `I-003.md`, `content/eras/E-004.md`, `content/actors/hiring-manager.md`, `content/actors/public-policy.md`, plus their `content-uk/` mirrors) shows a modified quoted-ID reference; no file outside `content/`, `content-uk/`, `evidence/` appears in the diff.

- [ ] **Step 3: Validate the renamed registry**

```bash
pnpm validate
```

Expected: `0 error(s)`. If this reports dangling references, unresolved IDs, or a broken barrier DAG, **stop — do not proceed to typecheck/test/build with a known validation failure.** A validation error here means a reference site the codemod's blind quoted-token pass didn't reach (or reached incorrectly) exists; find it, and if `applyIdRename`'s assumption (every reference is a double-quoted string) turns out to be wrong somewhere, that is real information requiring a fix to Task 1's function, not a workaround in content.

- [ ] **Step 4: Full suite**

```bash
pnpm typecheck && pnpm test
```

Expected: clean typecheck; full suite passes. Note: per the Phase 2 pre-planning survey, several existing test files hardcode pattern-adjacent IDs only incidentally (not P-001..P-004 specifically in most cases) — if any test genuinely asserts against one of the 4 renamed pattern IDs and now fails, update that one assertion to the new ID (do not broaden this task's scope beyond what the rename actually broke).

- [ ] **Step 5: Build**

```bash
pnpm build
```

Expected: clean build. This regenerates `site/dist` with the new pattern URLs (`/patterns/pat.seniority_double_bind` etc.) — confirmed safe by Phase 2 planning's routing survey, since `site/src/pages/[...locale]/patterns/[id].astro` derives its URL param directly from the loaded entity's `.id`, requiring no template change.

- [ ] **Step 6: Visually verify one renamed page**

Per this project's own established practice (screenshots, not greps, for UI verification): serve the build with `wrangler pages dev site/dist --port 8788 --ip 127.0.0.1 --compatibility-date 2026-07-21` and open `/patterns/pat.seniority_double_bind` (the exact new path for old `P-001`, read from `migration/id-mapping.json`). Confirm the page renders exactly as it did before the rename (same title "Seniority Double Bind", same content) — the only thing that should have changed is the URL.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "content: rename all 4 pattern entities to their dotted-namespace IDs (P-00x -> pat.*)"
```

---

### Task 5: Legacy-URL redirect table in `site/public/_worker.js`

**Files:**
- Modify: `site/public/_worker.js` (add a generated block + extend `legacyRedirect`)
- Modify: `tests/worker.test.ts` (append)

**Interfaces:**
- `legacyRedirect(pathname)` already exists (Phase-1-predating code) and returns a redirect path or `null`. This task extends it to also consult a new `LEGACY_ALIASES` lookup, without changing its existing behavior for `/uk/*` and `/_i/*` paths (both of those checks must still run and still take priority — they're unrelated to entity aliases and this task must not disturb them).
- `LEGACY_ALIASES: Record<string, string>` maps an old short code (e.g. `"P-001"`) directly to its new absolute path (e.g. `"/patterns/pat.seniority_double_bind"`) — Task 6 is what (re)generates this object's contents; this task only wires the lookup logic in, seeded with the 4 real pattern entries from Task 4 so the wiring can be tested against real data immediately.

- [ ] **Step 1: Write the failing tests**

Append to `tests/worker.test.ts` (find the file's existing `describe` blocks and add this as a new one at the end — do not modify existing tests):

```ts
describe('legacy entity-ID redirects', () => {
  it('redirects an old pattern short code to its new dotted-namespace path', () => {
    expect(legacyRedirect('/patterns/P-001')).toBe('/patterns/pat.seniority_double_bind');
  });

  it('leaves an already-canonical path alone', () => {
    expect(legacyRedirect('/patterns/pat.seniority_double_bind')).toBeNull();
  });

  it('leaves an unrelated, non-aliased path alone', () => {
    expect(legacyRedirect('/patterns/P-999')).toBeNull();
  });

  it('still redirects /uk/* and /_i/* exactly as before (unchanged behavior)', () => {
    expect(legacyRedirect('/uk/patterns')).toBe('/patterns');
    expect(legacyRedirect('/_i/en/patterns')).toBe('/patterns');
  });
});
```

(The 4 real `oldId -> newPath` pairs this test relies on must match exactly what Task 4 actually produced — read them from `migration/id-mapping.json` after Task 4 completes, rather than assuming the exact slug text shown in this plan's illustrative examples above; if Task 4's real slug for `P-001` differs even slightly from `pat.seniority_double_bind`, use the real one in this test.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/worker.test.ts`
Expected: FAIL — the pattern-redirect and already-canonical assertions fail (both currently return `null` from the existing `legacyRedirect`, since it doesn't know about entity aliases yet); the `/uk/*`/`/_i/*` assertions should already pass (proving this task hasn't broken anything yet, before the change).

- [ ] **Step 3: Write the implementation**

In `site/public/_worker.js`, add the generated block and extend `legacyRedirect`. Insert the block right after the existing constants near the top of the file (after the `STATIC_PREFIXES` line):

```js
// GENERATED — do not edit by hand. Run `pnpm generate:redirects` to refresh
// from every entity's `aliases` field. See scripts/generate-redirects.ts.
const LEGACY_ALIASES = {
  "P-001": "/patterns/pat.seniority_double_bind",
  "P-002": "/patterns/pat.REPLACE_WITH_REAL_SLUG",
  "P-003": "/patterns/pat.REPLACE_WITH_REAL_SLUG",
  "P-004": "/patterns/pat.REPLACE_WITH_REAL_SLUG",
};
// END GENERATED
```

(Replace the 3 placeholder slugs with the real ones from `migration/id-mapping.json` before running the tests — this plan cannot know them until Task 4 has actually run. This hand-seeded block is temporary scaffolding for this task only; Task 6 replaces it with a properly generated one covering every aliased entity, not just patterns.)

Then extend `legacyRedirect`:

```js
export function legacyRedirect(pathname) {
  if (pathname === '/uk' || pathname.startsWith('/uk/')) return pathname.slice(3) || '/';
  if (pathname === INTERNAL || pathname.startsWith(`${INTERNAL}/`)) {
    const stripped = pathname.replace(new RegExp(`^${INTERNAL}/(?:${LANGS.join('|')})(?=/|$)`), '');
    return stripped || '/';
  }
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (Object.prototype.hasOwnProperty.call(LEGACY_ALIASES, lastSegment)) {
    return LEGACY_ALIASES[lastSegment];
  }
  return null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/worker.test.ts`
Expected: PASS — all 4 new tests, plus every pre-existing test in this file still passing (the `/uk/*`/`/_i/*` behavior is unchanged; the new check only runs when neither of those match, since it's the third branch, not a replacement for the first two).

- [ ] **Step 5: Full suite + typecheck**

```bash
pnpm typecheck && pnpm test
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add site/public/_worker.js tests/worker.test.ts
git commit -m "feat(worker): redirect legacy pattern short-code URLs to their dotted-namespace paths"
```

---

### Task 6: Generate the redirect table from real registry data

**Files:**
- Create: `scripts/generate-redirects.ts`
- Modify: `site/public/_worker.js` (regenerate the `LEGACY_ALIASES` block — replace Task 5's hand-seeded version)
- Modify: `package.json` (add one script entry)

**Interfaces:**
- Consumes: `loadRegistryFromRoot`, `resolveRegistryRoot` from `@hoba/registry`. Reads every entity's `aliases` field directly from the loaded (post-rename) content — not from `migration/id-mapping.json`, because as later phases rename the remaining 10 types, this script must pick up their aliases too without anyone updating a second source of truth. `migration/id-mapping.json` is Phase 1's one-time snapshot; `aliases` on the live entities is the durable, ever-growing source.
- Only emits redirects for the 7 entity types confirmed to have an individual public page route during Phase 2 planning: `barrier` → `/barriers/`, `artifact` → `/artifacts/`, `mechanism` → `/mechanisms/`, `pattern` → `/patterns/`, `loop` → `/loops/`, `intervention` → `/interventions/`, `actor` → `/actors/`. (`process`/`era`/`record`/`evidence` are excluded — confirm each has no `[id].astro` route under `site/src/pages/[...locale]/` before running this in a later phase where those types gain aliases; if one turns out to have a page after all, add its route prefix to `TYPE_ROUTE` then, not speculatively now.)

- [ ] **Step 1: Write the script**

Create `scripts/generate-redirects.ts`:

```ts
/**
 * Regenerates the LEGACY_ALIASES block inside site/public/_worker.js from
 * every entity's `aliases` field in the live (English) registry. Idempotent:
 * safe to run after every phase of the entity-rename migration as more
 * types accumulate aliases.
 *
 *   pnpm generate:redirects
 */
import fs from 'node:fs';
import path from 'node:path';
import { loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';

const TYPE_ROUTE: Record<string, string> = {
  barrier: 'barriers',
  artifact: 'artifacts',
  mechanism: 'mechanisms',
  pattern: 'patterns',
  loop: 'loops',
  intervention: 'interventions',
  actor: 'actors',
};

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');

const collections: Array<{ type: string; items: Array<{ id: string; aliases?: string[] }> }> = [
  { type: 'barrier', items: bundle.barriers as never },
  { type: 'artifact', items: bundle.artifacts as never },
  { type: 'mechanism', items: bundle.mechanisms as never },
  { type: 'pattern', items: bundle.patterns as never },
  { type: 'loop', items: bundle.loops as never },
  { type: 'intervention', items: bundle.interventions as never },
  { type: 'actor', items: bundle.actors as never },
];

const entries: Record<string, string> = {};
for (const { type, items } of collections) {
  const route = TYPE_ROUTE[type];
  for (const item of items) {
    for (const alias of item.aliases ?? []) {
      entries[alias] = `/${route}/${item.id}`;
    }
  }
}

const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
const block =
  '// GENERATED — do not edit by hand. Run `pnpm generate:redirects` to refresh\n' +
  "// from every entity's `aliases` field. See scripts/generate-redirects.ts.\n" +
  `const LEGACY_ALIASES = ${JSON.stringify(sorted, null, 2)};\n` +
  '// END GENERATED';

const workerPath = path.join(root, 'site', 'public', '_worker.js');
const source = fs.readFileSync(workerPath, 'utf8');
const updated = source.replace(/\/\/ GENERATED[\s\S]*?\/\/ END GENERATED/, block);
if (updated === source && !source.includes('// GENERATED')) {
  throw new Error('generate-redirects: no GENERATED block found in _worker.js — has it been removed?');
}
fs.writeFileSync(workerPath, updated);

console.log(`Wrote ${Object.keys(sorted).length} redirect(s) to site/public/_worker.js.`);
```

- [ ] **Step 2: Add the package.json script entry**

```json
    "generate:redirects": "tsx scripts/generate-redirects.ts",
```

- [ ] **Step 3: Run it for real**

```bash
pnpm generate:redirects
```

Expected: `Wrote 4 redirect(s) to site/public/_worker.js.` (the 4 real pattern aliases from Task 4 — no other type has aliases yet).

- [ ] **Step 4: Diff-check the regenerated block**

```bash
git diff site/public/_worker.js
```

Confirm: only the `LEGACY_ALIASES` object's contents changed (Task 5's 3 placeholder slugs are now the real ones); `legacyRedirect`'s logic (added in Task 5) is untouched by this regeneration, since the script only replaces the block between the `GENERATED`/`END GENERATED` markers.

- [ ] **Step 5: Re-run the worker tests**

```bash
npx vitest run tests/worker.test.ts
```

Expected: PASS — Task 5's tests must still pass now that the placeholder slugs are real (if Task 5's test file used the real slugs from the start per its own note, this is a no-op confirmation; if it still has placeholders, fix them now to match).

- [ ] **Step 6: Full suite, typecheck, build**

```bash
pnpm typecheck && pnpm test && pnpm build
```

Expected: all clean.

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-redirects.ts package.json site/public/_worker.js
git commit -m "feat(scripts): generate the legacy-redirect table from real entity aliases"
```

---

## Self-review notes

- **Spec coverage:** design doc §8 (aliases carry the old code forward; redirects generated not hand-maintained; `git mv` never delete+recreate; one mapping table drives one codemod) → Tasks 1-4. §8's redirect requirement → Tasks 5-6. The `content/` → `data/entities/` move from §9 is explicitly deferred, flagged above, not silently dropped.
- **Type consistency:** `RenameApplication`, `FileRenamePlan` are defined once in Task 1/2 and consumed unchanged by Task 3's script. `LEGACY_ALIASES`'s shape (old-code key → absolute-path value) is identical between Task 5's hand-seeded version and Task 6's generated version — Task 6 replaces the block's *contents*, never its *shape*, so Task 5's `legacyRedirect` logic needs no changes when Task 6 lands.
- **No placeholders except one, explicitly flagged as such:** Task 5's 3 slug placeholders are intentional scaffolding for a task that must run before Task 4's real output exists at plan-writing time — Task 5's own steps say exactly when and how to replace them, and Task 6 supersedes them entirely one task later. This is different from an unresolved "TBD" — it has an exact, mechanical resolution path stated in the same task.
- **Risk carried forward, not hidden:** if Task 4's `pnpm validate` step fails, the plan explicitly says stop rather than push forward — a validation failure at that point means the codemod's core assumption (every reference is quoted) has a counterexample somewhere in real content, which is exactly the kind of finding that must surface, not get worked around.

## Next slices

Once this slice is merged and deployed (a live spot-check of the redirect — requesting `hoba.work/patterns/P-001` and confirming a 301 — belongs to whoever handles deployment, not this plan), the remaining 10 entity types each get the same treatment: `pnpm rename-entities --type <type> --dir <dir>` (Task 3's script, already generic) followed by `pnpm generate:redirects` (Task 6's script, already generic) — no new code needed for types 2-11, only the same verify-and-commit sequence as Task 4, one PR per type as the design doc specifies. The site-copy hardcoded-ID updates (homepage diagnostic-pipeline demo, `analyze.astro`'s observation groupings, `check.astro`'s mechanism groupings, `developers.astro`'s CLI examples, `i18n/ui.ts`'s two translated strings, `OnboardingTour.astro`'s CSS selector), the Lean script's two hardcoded `WF-001`/`WF-003` lookups, and the MCP server's ontology-prose rewrite are each scoped to the specific entity type they reference and should be folded into that type's own rename PR (e.g., the `WF-001`/`WF-003` fix rides along with the `process`/`workflow` type's rename; the MCP prose rewrite is type-spanning and can land in whichever PR is most convenient, or its own tiny follow-up).
