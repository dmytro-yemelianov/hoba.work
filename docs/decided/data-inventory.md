# Data inventory and source-of-truth rules

**Status:** decided and enforced.

## Canonical contract

`packages/registry-core/src/catalog.ts` is the executable inventory contract. It
names every ontology collection, its source path, ID form, purpose, boundaries,
schema/API path, and supported consumption surfaces. Generators and consumers
import that catalog; they must not maintain independent entity lists.

The measured, serializable projection is generated at:

- `/data/latest/inventory.json` — current inventory;
- `/data/releases/<registry-version>/inventory.json` — release snapshot.

The explicit coverage boundary is authored at `data/coverage/model.json` and
published with a derived summary at:

- `/data/latest/coverage.json` — current coverage model and metrics;
- `/data/releases/<registry-version>/coverage.json` — release snapshot.

Run `pnpm audit:coverage` to print the weakest dimensions and every partial or
absent slot. The detailed editorial baseline is recorded in
`docs/audits/2026-09-05-content-and-coverage-audit.md`.

Counts come from the validated registry bundle and auxiliary data loaders. They
are never hand-authored in documentation.

## Authority layers

| Layer | Authored where | Authority |
| --- | --- | --- |
| Ontology and evidence | `data/{en,uk}/entities/**`, `data/evidence/**` | Canonical source of truth |
| Scenarios | `data/scenarios/*.yaml` | Validated compositions over canonical IDs; not an entity type |
| Coverage boundary | `data/coverage/model.json` | Authored inventory of covered, partial, and absent situation slots |
| Archetypes | `data/archetypes/*.yaml` | Presentation-only nicknames and grid positions; not evidence |
| Formal substrate | Produced by `lift(bundle)` | Derived output; never authored or edited as a second model |
| REST, OpenAPI, schemas, exports, LLM text, Lean, worker bundle | Build output | Deterministic projections; never edit by hand |

The ontology contains exactly the values accepted by `entityTypeSchema` and
listed by `ENTITY_CATALOG`. A test compares those sets, the bundle collection
map, the authored directories, OpenAPI, JSON Schemas, REST output, NDJSON,
search, lookup, and the generated inventory.

## Projection boundaries

The full registry JSON, NDJSON, REST API, JSON Schemas, CLI lookup/search, and
MCP lookup/search cover all ontology collections. Graph JSON, GraphML, and
node/edge CSV are intentionally a narrower relationship projection: the six
reader-facing finding types only. `inventory.json` declares this boundary so a
consumer cannot reasonably mistake graph node count for total ontology count.

## Choosing an interface

Do not copy this decision table into another implementation. The live version
is `USAGE_SITUATIONS` in the catalog and is published in `inventory.json` and on
the Developers page.

- Read and explore: website.
- Fetch a known ID: REST, `hoba show`, or MCP `get_node`.
- Search without an ID: CLI or MCP across all ontology collections.
- Start from a recurring situation: a validated scenario.
- Bulk ingest: `registry.json` or NDJSON.
- Analyze relationships: graph JSON/GraphML/CSV, accepting its six-type scope.
- Generate a typed client: OpenAPI plus JSON Schemas.
- Give an agent exact data access: MCP, rather than pasted prompt context.
- Propose data: edit authored sources, then run validation and regenerate.
- Prove invariants: regenerate the formal projection and run Lean.

## Change procedure

1. Add or change the authored source, schema, or catalog entry—not generated output.
2. If the public contract changes, bump `schema_version` in `registry.yaml`.
3. Run `pnpm validate:strict`, `pnpm typecheck`, and `pnpm test`.
4. Run `pnpm build`; review every generated diff.
5. Run `pnpm e2e`.
6. CI repeats the gates and fails on generated drift.

Adding an ontology type is incomplete until the inventory test proves its
authored directories, bundle mapping, schema, REST list/item endpoints, OpenAPI
component, NDJSON rows, search, and lookup. This is the mechanism that prevents
the former `record` omission from recurring.
