# Data-First Architecture — Phase 1: Canonicalize — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the target JSON Schema documents (`schema/entity.schema.json`, `relation.schema.json`, `scenario.schema.json`, `analysis.schema.json`) and a generated old-code → new-dotted-ID mapping table for every entity in the registry, without moving or rewriting a single content file.

**Architecture:** A new pure-function module in `packages/registry/src/migration.ts` computes the ID mapping from the already-loaded `RegistryBundle` (deterministic slugification + collision detection); a thin CLI wrapper in `scripts/` runs it against the real registry and writes the reviewable artifact. The four new `schema/*.json` files are hand-authored JSON Schema documents describing the *target* shape — they are not wired into the live Zod-based validation pipeline yet (that's Phase 3); this phase only produces documents and a report, so the live site's build and validation are untouched throughout.

**Tech Stack:** TypeScript, Zod (existing), vitest, tsx (existing script runner), plain JSON Schema draft-07 (matching the project's existing convention in `schemas/*.schema.json`).

**Spec:** `docs/superpowers/specs/2026-08-28-data-first-architecture-design.md` — this plan implements that design's §3 (taxonomy/ID prefixes), §4 (Scenario schema), §5 (Analysis schema), and the first bullet of §14's Phase 1 ("write schema/*.json; generate the full old-code → new-ID mapping table … do not move any files yet"). Read the design doc's §3 and §6 before starting Task 4 — the enum values used in every schema below come from there verbatim.

## Global Constraints

- No content file under `content/`, `content-uk/`, or `evidence/` may be created, deleted, moved, or edited by this plan. This phase is read-only with respect to registry content — it only reads the loaded bundle and writes new files under `packages/registry/src/`, `scripts/`, `schema/`, `migration/`, and `tests/`.
- ID prefix table (design doc §3), copied verbatim — used in every task below:
  `artifact→obs`, `barrier→bar`, `mechanism→mech`, `pattern→pat`, `loop→loop`, `intervention→int`, `workflow→proc`, `actor→actor`, `era→era`, `record→record`, `evidence→evidence`.
- Epistemic-level enum (design doc §6), copied verbatim, used in every schema that references claim strength: `observed | compatible | supported | strongly_supported | proven | contradicted | unknown`.
- JSON Schema draft version: `http://json-schema.org/draft-07/schema#`, matching every existing file under `schemas/`.
- A slug collision (two entities of the same type producing the same name) is a **build-blocking error**, never auto-resolved. See design doc §3.
- `pnpm typecheck` and `pnpm test` must pass after every task.

---

### Task 1: ID slugification and mapping-table builder

**Files:**
- Create: `packages/registry/src/migration.ts`
- Modify: `packages/registry/src/index.ts` (add one export line)
- Test: `tests/migration.test.ts`

**Interfaces:**
- Produces: `slugifyTitle(title: string): string`, `TYPE_ID_PREFIX: Record<string, string>`, `buildIdMapping(bundle: RegistryBundle): IdMappingResult`, and the types `IdMappingEntry { oldId: string; newId: string; type: string; title: string }`, `IdMappingCollision { type: string; slug: string; entities: string[] }`, `IdMappingResult { mappings: IdMappingEntry[]; collisions: IdMappingCollision[] }`. Task 2 and Task 3 both import these from `@hoba/registry`.
- Consumes: `RegistryBundle` from `./types.js` (already defined — has `.artifacts`, `.barriers`, `.mechanisms`, `.patterns`, `.loops`, `.interventions`, `.workflows`, `.actors`, `.eras`, `.records`, `.evidence`, each an array of objects with at least `id: string` and `title: string`).

- [ ] **Step 1: Write the failing tests**

Create `tests/migration.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildIdMapping, slugifyTitle, TYPE_ID_PREFIX } from '@hoba/registry';
import type { RegistryBundle } from '@hoba/registry';

describe('slugifyTitle', () => {
  it('lowercases and joins words with underscores', () => {
    expect(slugifyTitle('Automated Filter & Parser Threshold')).toBe('automated_filter_parser_threshold');
  });

  it('collapses runs of punctuation into a single underscore', () => {
    expect(slugifyTitle('Generic "closer alignment" rejection template')).toBe(
      'generic_closer_alignment_rejection_template'
    );
  });

  it('strips leading and trailing underscores', () => {
    expect(slugifyTitle('  --Leading and trailing--  ')).toBe('leading_and_trailing');
  });

  it('is deterministic: the same title always produces the same slug', () => {
    const title = 'Pre-Selected Internal Candidate';
    expect(slugifyTitle(title)).toBe(slugifyTitle(title));
  });
});

describe('TYPE_ID_PREFIX', () => {
  it('covers all 11 ontology types with the prefixes from the design doc', () => {
    expect(TYPE_ID_PREFIX).toEqual({
      artifact: 'obs',
      barrier: 'bar',
      mechanism: 'mech',
      pattern: 'pat',
      loop: 'loop',
      intervention: 'int',
      workflow: 'proc',
      actor: 'actor',
      era: 'era',
      record: 'record',
      evidence: 'evidence',
    });
  });
});

function fixtureBundle(overrides: Partial<RegistryBundle> = {}): RegistryBundle {
  return {
    artifacts: [],
    barriers: [],
    mechanisms: [],
    patterns: [],
    loops: [],
    interventions: [],
    workflows: [],
    actors: [],
    eras: [],
    records: [],
    evidence: [],
    ...overrides,
  } as unknown as RegistryBundle;
}

describe('buildIdMapping', () => {
  it('maps a single entity to <prefix>.<slug>', () => {
    const bundle = fixtureBundle({
      barriers: [{ id: 'B-002', title: 'Automated Filter & Parser Threshold' } as never],
    });
    const result = buildIdMapping(bundle);
    expect(result.mappings).toEqual([
      { oldId: 'B-002', newId: 'bar.automated_filter_parser_threshold', type: 'barrier', title: 'Automated Filter & Parser Threshold' },
    ]);
    expect(result.collisions).toEqual([]);
  });

  it('maps every collection using its own type prefix', () => {
    const bundle = fixtureBundle({
      artifacts: [{ id: 'A-002', title: 'Generic rejection' } as never],
      mechanisms: [{ id: 'M-005', title: 'Pre-Selected Internal Candidate' } as never],
      evidence: [{ id: 'EVD-001', title: 'Hidden Workers' } as never],
    });
    const result = buildIdMapping(bundle);
    const byOld = Object.fromEntries(result.mappings.map((m) => [m.oldId, m.newId]));
    expect(byOld['A-002']).toBe('obs.generic_rejection');
    expect(byOld['M-005']).toBe('mech.pre_selected_internal_candidate');
    expect(byOld['EVD-001']).toBe('evidence.hidden_workers');
  });

  it('detects a collision when two entities of the same type slugify identically', () => {
    const bundle = fixtureBundle({
      patterns: [
        { id: 'P-001', title: 'Seniority Double Bind' } as never,
        { id: 'P-099', title: 'seniority   double bind!!' } as never,
      ],
    });
    const result = buildIdMapping(bundle);
    expect(result.collisions).toEqual([
      { type: 'pattern', slug: 'seniority_double_bind', entities: ['P-001', 'P-099'] },
    ]);
  });

  it('does not flag a collision across different types even with the same slug', () => {
    const bundle = fixtureBundle({
      barriers: [{ id: 'B-001', title: 'Shared Name' } as never],
      mechanisms: [{ id: 'M-001', title: 'Shared Name' } as never],
    });
    const result = buildIdMapping(bundle);
    expect(result.collisions).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/migration.test.ts`
Expected: FAIL — `Cannot find module '../packages/registry/src/migration.js'` (the file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

Create `packages/registry/src/migration.ts`:

```ts
import type { RegistryBundle } from './types.js';

export interface IdMappingEntry {
  oldId: string;
  newId: string;
  type: string;
  title: string;
}

export interface IdMappingCollision {
  type: string;
  slug: string;
  entities: string[];
}

export interface IdMappingResult {
  mappings: IdMappingEntry[];
  collisions: IdMappingCollision[];
}

/** Design doc §3's type → new-ID-prefix table. */
export const TYPE_ID_PREFIX: Record<string, string> = {
  artifact: 'obs',
  barrier: 'bar',
  mechanism: 'mech',
  pattern: 'pat',
  loop: 'loop',
  intervention: 'int',
  workflow: 'proc',
  actor: 'actor',
  era: 'era',
  record: 'record',
  evidence: 'evidence',
};

/** Deterministic name-slug derivation (design doc §3). */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

interface TitledId {
  id: string;
  title: string;
}

/**
 * Builds the old-code -> new dotted-ID mapping for every entity in a loaded
 * bundle. Read-only: never touches content files. A collision (two entities
 * of the same type slugifying to the same name) is reported, never
 * auto-resolved (design doc §3).
 */
export function buildIdMapping(bundle: RegistryBundle): IdMappingResult {
  const collections: Array<{ type: string; items: TitledId[] }> = [
    { type: 'artifact', items: bundle.artifacts as unknown as TitledId[] },
    { type: 'barrier', items: bundle.barriers as unknown as TitledId[] },
    { type: 'mechanism', items: bundle.mechanisms as unknown as TitledId[] },
    { type: 'pattern', items: bundle.patterns as unknown as TitledId[] },
    { type: 'loop', items: bundle.loops as unknown as TitledId[] },
    { type: 'intervention', items: bundle.interventions as unknown as TitledId[] },
    { type: 'workflow', items: bundle.workflows as unknown as TitledId[] },
    { type: 'actor', items: bundle.actors as unknown as TitledId[] },
    { type: 'era', items: bundle.eras as unknown as TitledId[] },
    { type: 'record', items: bundle.records as unknown as TitledId[] },
    { type: 'evidence', items: bundle.evidence as unknown as TitledId[] },
  ];

  const mappings: IdMappingEntry[] = [];
  const collisions: IdMappingCollision[] = [];

  for (const { type, items } of collections) {
    const prefix = TYPE_ID_PREFIX[type];
    const oldIdsBySlug = new Map<string, string[]>();

    for (const item of items) {
      const slug = slugifyTitle(item.title);
      const existing = oldIdsBySlug.get(slug) ?? [];
      existing.push(item.id);
      oldIdsBySlug.set(slug, existing);
    }

    for (const [slug, oldIds] of oldIdsBySlug) {
      if (oldIds.length > 1) collisions.push({ type, slug, entities: oldIds });
    }

    for (const item of items) {
      mappings.push({
        oldId: item.id,
        newId: `${prefix}.${slugifyTitle(item.title)}`,
        type,
        title: item.title,
      });
    }
  }

  return { mappings, collisions };
}
```

Add the export to `packages/registry/src/index.ts` (append to the existing list of `export * from` lines):

```ts
export * from './migration.js';
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/migration.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Typecheck**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/registry/src/migration.ts packages/registry/src/index.ts tests/migration.test.ts
git commit -m "feat(registry): add deterministic ID-slugification and mapping-table builder"
```

---

### Task 2: Prove the real registry migrates without collisions

**Files:**
- Modify: `tests/migration.test.ts` (append one integration test)

**Interfaces:**
- Consumes: `buildIdMapping` from Task 1; `loadRegistryFromRoot` and `resolveRegistryRoot` from `../packages/registry/src/index.js` (already exported today — used the same way in `scripts/validate.ts`).

This task's outcome is genuinely uncertain — unlike Task 1's synthetic fixtures, this runs against all ~150 real entities. If it fails, that is real information: a genuine title collision exists in production content and needs a human naming decision before Phase 2 can start. Do not "fix" a failure by loosening the collision check — surface it.

- [ ] **Step 1: Write the failing test**

Append to `tests/migration.test.ts`:

```ts
import { loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';

describe('buildIdMapping against the real registry', () => {
  it('produces zero collisions across all current content', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const result = buildIdMapping(bundle);

    if (result.collisions.length > 0) {
      const report = result.collisions
        .map((c) => `  [${c.type}] "${c.slug}" shared by: ${c.entities.join(', ')}`)
        .join('\n');
      throw new Error(`${result.collisions.length} title collision(s) found:\n${report}`);
    }

    expect(result.collisions).toEqual([]);
  });

  it('maps every entity in the real registry exactly once', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const result = buildIdMapping(bundle);

    const expectedCount =
      bundle.artifacts.length +
      bundle.barriers.length +
      bundle.mechanisms.length +
      bundle.patterns.length +
      bundle.loops.length +
      bundle.interventions.length +
      bundle.workflows.length +
      bundle.actors.length +
      bundle.eras.length +
      bundle.records.length +
      bundle.evidence.length;

    expect(result.mappings).toHaveLength(expectedCount);
    expect(new Set(result.mappings.map((m) => m.newId)).size).toBe(expectedCount);
  });
});
```

- [ ] **Step 2: Run it**

Run: `npx vitest run tests/migration.test.ts`
Expected: both new tests PASS, proving the current ~150 entities produce zero collisions and a unique new ID each. **If either fails, stop here and resolve the reported collision(s) or duplicate-ID issue with a human before continuing to Task 3** — do not proceed with a known collision unresolved.

- [ ] **Step 3: Commit**

```bash
git add tests/migration.test.ts
git commit -m "test(registry): prove the live registry maps to unique dotted IDs with zero collisions"
```

---

### Task 3: Generate the reviewable mapping-table artifact

**Files:**
- Create: `scripts/generate-id-mapping.ts`
- Modify: `package.json` (add one script entry)
- Create (generated, not hand-edited): `migration/id-mapping.json`

**Interfaces:**
- Consumes: `buildIdMapping`, `loadRegistryFromRoot`, `resolveRegistryRoot` from `@hoba/registry` (the package alias — matches the import style already used in `scripts/validate.ts`, not the relative-path style used elsewhere).

- [ ] **Step 1: Write the script**

Create `scripts/generate-id-mapping.ts`:

```ts
/**
 * Generates the old-code -> new dotted-namespace ID mapping table for the
 * data-first architecture migration (Phase 1: Canonicalize). Read-only —
 * writes one report file, touches no content under content/, content-uk/,
 * or evidence/.
 *
 *   pnpm generate:id-mapping
 */
import fs from 'node:fs';
import path from 'node:path';
import { buildIdMapping, loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');
const result = buildIdMapping(bundle);

const outDir = path.join(root, 'migration');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'id-mapping.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');

console.log(`${result.mappings.length} entities mapped -> ${path.relative(root, outPath)}`);

if (result.collisions.length > 0) {
  console.error(`\n${result.collisions.length} collision(s) found — resolve before Phase 2:`);
  for (const c of result.collisions) {
    console.error(`  [${c.type}] slug "${c.slug}" shared by: ${c.entities.join(', ')}`);
  }
  process.exit(1);
}

console.log('✓ No collisions.');
```

- [ ] **Step 2: Add the package.json script entry**

In `package.json`, in the `"scripts"` block, add (alphabetically next to `"e2e"`/`"lean"`, matching the existing ordering):

```json
    "generate:id-mapping": "tsx scripts/generate-id-mapping.ts",
```

- [ ] **Step 3: Run it against the real registry**

Run: `pnpm generate:id-mapping`
Expected output: `150 entities mapped -> migration/id-mapping.json` (or whatever the current total is — recount if content changed since this plan was written) followed by `✓ No collisions.`, exit code 0.

- [ ] **Step 4: Spot-check the generated file**

Open `migration/id-mapping.json` and confirm: `B-002` maps to `bar.automated_filter_parser_threshold`, `A-002` maps to `obs.generic_closer_alignment_rejection_template`, `EVD-046` (added earlier this session) is present and maps under the `evidence` type.

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-id-mapping.ts package.json migration/id-mapping.json
git commit -m "feat(scripts): generate the reviewable old-code to new-ID mapping table"
```

---

### Task 4: `schema/entity.schema.json` — the common ontology envelope

**Files:**
- Create: `schema/entity.schema.json`
- Test: `tests/target-schema.test.ts`

This schema defines only the fields **shared by every one of the 11 ontology types** — `id`, `type`, `title`, `status`, `aliases`, `evidence_level`, `evidence_ids`, `agency_zones`. Per-type extra fields (a barrier's `precedes`, a mechanism's `emissions`, etc.) remain owned by that type's own generated schema under `schemas/*.schema.json` — duplicating them here would violate the no-duplication rule (a fact has exactly one schema that owns it). Those per-type schemas get regenerated with the new ID pattern and expanded `evidence_level` enum in Phase 3, once the Zod source of truth actually changes; this task only publishes the target common contract.

- [ ] **Step 1: Write the failing test**

Create `tests/target-schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const schemaDir = path.join(__dirname, '..', 'schema');

function readSchema(file: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(schemaDir, file), 'utf8'));
}

describe('schema/entity.schema.json', () => {
  const schema = readSchema('entity.schema.json') as {
    $schema: string;
    required: string[];
    properties: Record<string, { type?: string; enum?: string[]; pattern?: string }>;
  };

  it('declares draft-07, matching the rest of the project', () => {
    expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
  });

  it('requires id, type, title, and status', () => {
    expect(schema.required).toEqual(expect.arrayContaining(['id', 'type', 'title', 'status']));
  });

  it('enumerates exactly the 11 ontology types, and never "scenario"', () => {
    expect(schema.properties.type.enum).toEqual(
      expect.arrayContaining([
        'observation', 'barrier', 'mechanism', 'pattern', 'loop',
        'intervention', 'process', 'actor', 'era', 'record', 'evidence',
      ])
    );
    expect(schema.properties.type.enum).toHaveLength(11);
    expect(schema.properties.type.enum).not.toContain('scenario');
  });

  it('has no field capable of referencing a scenario or analysis ID', () => {
    expect(schema.properties).not.toHaveProperty('scenario_id');
    expect(schema.properties).not.toHaveProperty('scenario_ids');
    expect(schema.properties).not.toHaveProperty('analysis_id');
    expect(schema.properties).not.toHaveProperty('analysis_ids');
  });

  it('the id field pattern matches the 11 dotted prefixes', () => {
    const pattern = new RegExp(schema.properties.id.pattern!);
    expect(pattern.test('bar.automated_filter_parser_threshold')).toBe(true);
    expect(pattern.test('mech.pipeline_refresh')).toBe(true);
    expect(pattern.test('scenario.application_silence')).toBe(false);
    expect(pattern.test('B-002')).toBe(false);
  });

  it('evidence_level enumerates the 7-state epistemic model, not the old 4-state one', () => {
    expect(schema.properties.evidence_level.enum).toEqual([
      'observed', 'compatible', 'supported', 'strongly_supported', 'proven', 'contradicted', 'unknown',
    ]);
  });

  it('agency_zones values are low/medium/high', () => {
    const agencyZones = schema.properties.agency_zones as unknown as {
      additionalProperties: { enum: string[] };
    };
    expect(agencyZones.additionalProperties.enum).toEqual(['low', 'medium', 'high']);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, open '.../schema/entity.schema.json'`

- [ ] **Step 3: Write the schema**

Create `schema/entity.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hoba.work/schema/entity.schema.json",
  "title": "HOBA Ontology Entity (common envelope)",
  "description": "Fields shared by every ontology entity type. Per-type additional fields (a barrier's precedes, a mechanism's emissions, etc.) are owned by that type's own generated schema under /schemas — this file defines only the common contract every one of the 11 types must satisfy. 'scenario' and 'analysis' are deliberately absent from the type enum: they are separate layers over the ontology, never ontology entities themselves.",
  "type": "object",
  "required": ["id", "type", "title", "status"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^(obs|bar|mech|pat|loop|int|proc|actor|era|record|evidence)\\.[a-z0-9_]+$",
      "description": "Dotted-namespace canonical ID: <type-prefix>.<snake_case_name>."
    },
    "type": {
      "type": "string",
      "enum": [
        "observation", "barrier", "mechanism", "pattern", "loop",
        "intervention", "process", "actor", "era", "record", "evidence"
      ]
    },
    "title": { "type": "string", "minLength": 1 },
    "status": {
      "type": "string",
      "enum": ["draft", "active", "deprecated", "superseded", "removed"]
    },
    "aliases": {
      "type": "array",
      "items": { "type": "string" },
      "default": [],
      "description": "Legacy short-code IDs this entity is reachable by (e.g. B-002). Populated by the ID-rename migration; never authored by hand for a newly created entity."
    },
    "evidence_level": {
      "type": "string",
      "enum": ["observed", "compatible", "supported", "strongly_supported", "proven", "contradicted", "unknown"]
    },
    "evidence_ids": {
      "type": "array",
      "items": { "type": "string", "pattern": "^evidence\\.[a-z0-9_]+$" },
      "default": []
    },
    "agency_zones": {
      "type": "object",
      "additionalProperties": { "type": "string", "enum": ["low", "medium", "high"] },
      "description": "Per-actor-type impact level. Additive alongside mechanism.facets.removability — not a replacement for it."
    },
    "superseded_by": { "type": "string" },
    "deprecated": {
      "type": "object",
      "required": ["reason"],
      "properties": {
        "reason": { "type": "string" },
        "replaced_by": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Commit**

```bash
git add schema/entity.schema.json tests/target-schema.test.ts
git commit -m "feat(schema): publish the target common ontology-entity envelope"
```

---

### Task 5: `schema/relation.schema.json`

**Files:**
- Create: `schema/relation.schema.json`
- Modify: `tests/target-schema.test.ts` (append one describe block)

Endpoint-type pairs below are copied from the actual current edge-building code (`packages/registry/src/graph.ts`'s `buildEdges()`), not invented: `precedes` is barrier→barrier; `operates_at` is mechanism→barrier; `emits` is mechanism→observation; `amplifies`/`masks` are mechanism→mechanism (their frontmatter field is typed `mechanismId`); `instantiates` is (observation or mechanism)→pattern; `targets`/`mitigates` are intervention→(mechanism or barrier) / intervention→(pattern or loop), chosen by the target's own type at edge-build time.

- [ ] **Step 1: Write the failing test**

Append to `tests/target-schema.test.ts`:

```ts
describe('schema/relation.schema.json', () => {
  const schema = readSchema('relation.schema.json') as {
    required: string[];
    properties: { relation: { enum: string[] } };
  };

  it('requires from, to, and relation', () => {
    expect(schema.required).toEqual(['from', 'to', 'relation']);
  });

  it('enumerates the 8 relation types used by the graph builder', () => {
    expect(schema.properties.relation.enum).toEqual([
      'operates_at', 'emits', 'amplifies', 'masks',
      'precedes', 'instantiates', 'targets', 'mitigates',
    ]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: FAIL — `ENOENT ... relation.schema.json`

- [ ] **Step 3: Write the schema**

Create `schema/relation.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hoba.work/schema/relation.schema.json",
  "title": "HOBA Ontology Relation",
  "description": "An edge between two ontology entities. Endpoint-type pairs match packages/registry/src/graph.ts's buildEdges().",
  "type": "object",
  "required": ["from", "to", "relation"],
  "properties": {
    "from": { "type": "string" },
    "to": { "type": "string" },
    "relation": {
      "type": "string",
      "enum": ["operates_at", "emits", "amplifies", "masks", "precedes", "instantiates", "targets", "mitigates"]
    }
  },
  "allOf": [
    {
      "if": { "properties": { "relation": { "const": "precedes" } } },
      "then": {
        "description": "barrier -> barrier",
        "properties": { "from": { "pattern": "^bar\\." }, "to": { "pattern": "^bar\\." } }
      }
    },
    {
      "if": { "properties": { "relation": { "const": "operates_at" } } },
      "then": {
        "description": "mechanism -> barrier",
        "properties": { "from": { "pattern": "^mech\\." }, "to": { "pattern": "^bar\\." } }
      }
    },
    {
      "if": { "properties": { "relation": { "const": "emits" } } },
      "then": {
        "description": "mechanism -> observation",
        "properties": { "from": { "pattern": "^mech\\." }, "to": { "pattern": "^obs\\." } }
      }
    },
    {
      "if": { "properties": { "relation": { "enum": ["amplifies", "masks"] } } },
      "then": {
        "description": "mechanism -> mechanism",
        "properties": { "from": { "pattern": "^mech\\." }, "to": { "pattern": "^mech\\." } }
      }
    },
    {
      "if": { "properties": { "relation": { "const": "instantiates" } } },
      "then": {
        "description": "(observation | mechanism) -> pattern",
        "properties": { "from": { "pattern": "^(obs|mech)\\." }, "to": { "pattern": "^pat\\." } }
      }
    },
    {
      "if": { "properties": { "relation": { "const": "targets" } } },
      "then": {
        "description": "intervention -> (mechanism | barrier)",
        "properties": { "from": { "pattern": "^int\\." }, "to": { "pattern": "^(mech|bar)\\." } }
      }
    },
    {
      "if": { "properties": { "relation": { "const": "mitigates" } } },
      "then": {
        "description": "intervention -> (pattern | loop)",
        "properties": { "from": { "pattern": "^int\\." }, "to": { "pattern": "^(pat|loop)\\." } }
      }
    }
  ]
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: PASS — 9 tests total (7 from Task 4 + 2 new).

- [ ] **Step 5: Commit**

```bash
git add schema/relation.schema.json tests/target-schema.test.ts
git commit -m "feat(schema): publish the target relation schema with verified endpoint-type pairs"
```

---

### Task 6: `schema/scenario.schema.json`

**Files:**
- Create: `schema/scenario.schema.json`
- Modify: `tests/target-schema.test.ts` (append one describe block)

- [ ] **Step 1: Write the failing test**

Append to `tests/target-schema.test.ts`:

```ts
describe('schema/scenario.schema.json', () => {
  const schema = readSchema('scenario.schema.json') as {
    required: string[];
    properties: Record<string, { pattern?: string }>;
  };

  it('requires id, title, and at least one observation', () => {
    expect(schema.required).toEqual(['id', 'title', 'observations']);
  });

  it('has no field that an ontology entity could reciprocally reference', () => {
    // Scenarios reference the ontology one-directionally; this is a schema
    // for the scenario side of that relationship only.
    expect(schema.properties.id.pattern).toBe('^scenario\\.[a-z0-9_]+$');
  });

  it('every entity-referencing array is pattern-constrained to that entity type\'s prefix', () => {
    expect((schema.properties.observations as { items: { pattern: string } }).items.pattern).toBe('^obs\\.[a-z0-9_]+$');
    expect((schema.properties.compatible_mechanisms as { items: { pattern: string } }).items.pattern).toBe('^mech\\.[a-z0-9_]+$');
    expect((schema.properties.compatible_barriers as { items: { pattern: string } }).items.pattern).toBe('^bar\\.[a-z0-9_]+$');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: FAIL — `ENOENT ... scenario.schema.json`

- [ ] **Step 3: Write the schema**

Create `schema/scenario.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hoba.work/schema/scenario.schema.json",
  "title": "HOBA Scenario",
  "description": "A validated composition of ontology entities describing a coherent situation. Not an ontology entity itself: 'scenario' never appears in entity.schema.json's type enum. References ontology IDs one-directionally — no ontology entity schema has a field capable of referencing a scenario ID.",
  "type": "object",
  "required": ["id", "title", "observations"],
  "properties": {
    "id": { "type": "string", "pattern": "^scenario\\.[a-z0-9_]+$" },
    "title": {
      "type": "object",
      "required": ["en", "uk"],
      "properties": { "en": { "type": "string" }, "uk": { "type": "string" } }
    },
    "observations": {
      "type": "array",
      "minItems": 1,
      "items": { "type": "string", "pattern": "^obs\\.[a-z0-9_]+$" }
    },
    "compatible_mechanisms": {
      "type": "array",
      "default": [],
      "items": { "type": "string", "pattern": "^mech\\.[a-z0-9_]+$" }
    },
    "compatible_barriers": {
      "type": "array",
      "default": [],
      "items": { "type": "string", "pattern": "^bar\\.[a-z0-9_]+$" }
    },
    "process_states": {
      "type": "array",
      "default": [],
      "items": { "type": "string", "pattern": "^proc\\.[a-z0-9_]+$" }
    },
    "evidence": {
      "type": "array",
      "default": [],
      "items": { "type": "string", "pattern": "^evidence\\.[a-z0-9_]+$" }
    },
    "excluded_claims": {
      "type": "array",
      "default": [],
      "items": { "type": "string" }
    },
    "agency": {
      "type": "object",
      "default": {},
      "additionalProperties": {
        "type": "array",
        "items": { "type": "string", "pattern": "^int\\.[a-z0-9_]+$" }
      }
    }
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: PASS — 12 tests total.

- [ ] **Step 5: Commit**

```bash
git add schema/scenario.schema.json tests/target-schema.test.ts
git commit -m "feat(schema): publish the target Scenario schema as a non-ontology composition layer"
```

---

### Task 7: `schema/analysis.schema.json`

**Files:**
- Create: `schema/analysis.schema.json`
- Modify: `tests/target-schema.test.ts` (append one describe block)

- [ ] **Step 1: Write the failing test**

Append to `tests/target-schema.test.ts`:

```ts
describe('schema/analysis.schema.json', () => {
  const schema = readSchema('analysis.schema.json') as {
    required: string[];
    description: string;
    properties: Record<string, unknown>;
  };

  it('requires the full structured-analysis shape from the design doc', () => {
    expect(schema.required).toEqual([
      'input_type', 'source_text', 'observations', 'interpretations',
      'compatible_entities', 'unknowns', 'agency', 'prohibited_conclusions', 'registry_version',
    ]);
  });

  it('documents that this is not canonical ontology data', () => {
    expect(schema.description).toMatch(/not canonical/i);
  });

  it('confidence and claim_level use the same 7-state epistemic enum as entity.schema.json', () => {
    const entitySchema = readSchema('entity.schema.json') as { properties: { evidence_level: { enum: string[] } } };
    const observationItem = (schema.properties.observations as { items: { properties: { confidence: { enum: string[] } } } }).items;
    const compatibleItem = (schema.properties.compatible_entities as { items: { properties: { claim_level: { enum: string[] } } } }).items;

    expect(observationItem.properties.confidence.enum).toEqual(entitySchema.properties.evidence_level.enum);
    expect(compatibleItem.properties.claim_level.enum).toEqual(entitySchema.properties.evidence_level.enum);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: FAIL — `ENOENT ... analysis.schema.json`

- [ ] **Step 3: Write the schema**

Create `schema/analysis.schema.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://hoba.work/schema/analysis.schema.json",
  "title": "HOBA Structured Analysis Object",
  "description": "Not canonical ontology data. The portable output shape for an interpretation of a concrete input (a social post, a rejection sequence, etc.) against the registry. Produced by the analyzer, CLI, and MCP; validated on the way out by validate_analysis; never stored under /data.",
  "type": "object",
  "required": [
    "input_type", "source_text", "observations", "interpretations",
    "compatible_entities", "unknowns", "agency", "prohibited_conclusions", "registry_version"
  ],
  "properties": {
    "input_type": {
      "type": "string",
      "enum": ["social_post", "candidate_story", "funnel_metrics", "recruiter_report", "job_description", "rejection_sequence"]
    },
    "source_text": { "type": "string" },
    "observations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["text", "registry_refs", "confidence"],
        "properties": {
          "text": { "type": "string" },
          "registry_refs": { "type": "array", "items": { "type": "string", "pattern": "^obs\\.[a-z0-9_]+$" } },
          "confidence": {
            "type": "string",
            "enum": ["observed", "compatible", "supported", "strongly_supported", "proven", "contradicted", "unknown"]
          }
        }
      }
    },
    "interpretations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["text", "classification"],
        "properties": {
          "text": { "type": "string" },
          "classification": { "type": "string", "enum": ["author_interpretation", "analyzer_interpretation"] }
        }
      }
    },
    "compatible_entities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "claim_level", "reason"],
        "properties": {
          "id": { "type": "string" },
          "claim_level": {
            "type": "string",
            "enum": ["observed", "compatible", "supported", "strongly_supported", "proven", "contradicted", "unknown"]
          },
          "reason": { "type": "string" }
        }
      }
    },
    "unknowns": { "type": "array", "items": { "type": "string" } },
    "agency": {
      "type": "object",
      "additionalProperties": { "type": "array", "items": { "type": "string", "pattern": "^int\\.[a-z0-9_]+$" } }
    },
    "prohibited_conclusions": { "type": "array", "items": { "type": "string" } },
    "registry_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" }
  }
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run tests/target-schema.test.ts`
Expected: PASS — 15 tests total.

- [ ] **Step 5: Run the full test suite and typecheck**

Run: `pnpm test && pnpm typecheck`
Expected: everything passes — this phase touched no existing file's behavior, only added new modules, scripts, schemas, and tests.

- [ ] **Step 6: Commit**

```bash
git add schema/analysis.schema.json tests/target-schema.test.ts
git commit -m "feat(schema): publish the target Structured Analysis Object schema"
```

---

## Self-review notes

- **Spec coverage:** design doc §3 (taxonomy/prefixes) → Task 1/4; §4 (Scenario) → Task 6; §5 (Analysis) → Task 7; §14 Phase 1 bullet (schemas + mapping table, no file moves) → all 7 tasks. §6's epistemic enum and §3's collision rule are load-bearing constants copied verbatim into Global Constraints and reused in Tasks 1, 4, and 7 so no task risks drifting from the design doc's own values.
- **Type consistency:** `IdMappingEntry`/`IdMappingCollision`/`IdMappingResult` are defined once in Task 1 and reused unchanged by Tasks 2 and 3; `TYPE_ID_PREFIX`'s 11 keys match `entity.schema.json`'s `type` enum values used in Task 4 (via the current-type-name → new-type-name pairing in the Global Constraints table) and the ID `pattern` regex's prefix alternation in Tasks 4–7.
- **No placeholders:** every step has literal, runnable code or an exact command; the two genuinely open items from the design doc (§16: `show`/`get` CLI overlap, redirect-module location) belong to later phases and are not referenced by any task here.

## Next phases

Phase 2 (Migrate — the 11 per-type rename PRs using `migration/id-mapping.json` as the driving table) gets its own plan document once this one is merged and `migration/id-mapping.json` reflects the actual, current registry content.
