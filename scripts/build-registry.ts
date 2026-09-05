/**
 * Generate every machine-readable export of the registry:
 *   schemas/*.schema.json, apps/web/public/schemas/*, apps/web/public/data/**,
 *   apps/web/public/api/v1/** and apps/web/public/openapi.json.
 *
 * Output is byte-deterministic for a given Git tree (spec §17): no timestamps
 * are generated here — `updated_at` comes from registry.yaml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  actorSchema,
  authoredRecordSchema,
  agencyZones,
  buildDataInventory,
  ENTITY_CATALOG,
  registryContentHash,
  processSchema,
  eraSchema,
  observationSchema,
  barrierSchema,
  evidenceSchema,
  formatValidationIssue,
  HOBAKnowledgeGraph,
  interventionSchema,
  loadArchetypes,
  loadCoverageModel,
  loadRegistryFromRoot,
  loadScenarios,
  liftRegistryCaseSpace,
  loopSchema,
  mechanismSchema,
  patternSchema,
  readPackageVersion,
  registryBundleSchema,
  resolveRegistryRoot,
  serializeCaseSpaceMetrics,
  summarizeCoverage,
  validateRegistry,
  type EntityType,
} from '@hoba/registry';

const SITE_ORIGIN = 'https://hoba.work';

const root = resolveRegistryRoot({ explicit: process.argv[2] });
const sitePublicDir = path.join(root, 'apps', 'web', 'public');
const schemasDir = path.join(root, 'schemas');
const siteVersion = readPackageVersion(path.join(root, 'package.json'));

console.log(`Building hoba registry exports from ${root} ...`);

const bundle = loadRegistryFromRoot(root, 'en');
const report = validateRegistry(bundle);
for (const w of report.warnings) console.warn(formatValidationIssue(w));
if (!report.ok) {
  for (const e of report.errors) console.error(formatValidationIssue(e));
  console.error(`\nRegistry build aborted: ${report.errors.length} validation error(s).`);
  process.exit(1);
}

const graph = new HOBAKnowledgeGraph(bundle);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const writeText = (filePath: string, text: string) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, 'utf-8');
};
const writeJson = (filePath: string, data: unknown) =>
  writeText(filePath, JSON.stringify(data, null, 2) + '\n');
const resetDir = (dir: string) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

const ENTITY_SCHEMAS: Record<EntityType, z.ZodType> = {
  observation: observationSchema,
  barrier: barrierSchema,
  mechanism: mechanismSchema,
  pattern: patternSchema,
  loop: loopSchema,
  intervention: interventionSchema,
  actor: actorSchema,
  process: processSchema,
  era: eraSchema,
  evidence: evidenceSchema,
  record: authoredRecordSchema,
};

type EntityDef = (typeof ENTITY_CATALOG)[number] & { schema: z.ZodType };
const ENTITIES: EntityDef[] = ENTITY_CATALOG.map((entry) => ({
  ...entry,
  schema: ENTITY_SCHEMAS[entry.type],
}));

/**
 * Keep the public draft-07 + `#/definitions/<Name>` contract while using
 * Zod 4's native converter. Input mode preserves the accepted shape of fields
 * with defaults; the override preserves the registry's closed object schemas.
 */
function namedJsonSchema(schema: z.ZodType, name: string): Record<string, unknown> {
  const {
    $schema,
    definitions = {},
    ...definition
  } = z.toJSONSchema(schema, {
    target: 'draft-07',
    io: 'input',
    reused: 'ref',
    override: (ctx) => {
      if (ctx.zodSchema._zod.def.type === 'object') {
        ctx.jsonSchema.additionalProperties = false;
      }
    },
  });
  const reusableDefinitions: Record<string, unknown> =
    typeof definitions === 'object' && definitions !== null && !Array.isArray(definitions)
      ? Object.fromEntries(Object.entries(definitions))
      : {};

  return {
    $ref: `#/definitions/${name}`,
    definitions: { [name]: definition, ...reusableDefinitions },
    $schema,
  };
}

// ---------------------------------------------------------------------------
// 1. JSON Schemas
// ---------------------------------------------------------------------------
const schemas: Record<string, unknown> = Object.fromEntries(
  ENTITIES.map((e) => [e.schema_file, namedJsonSchema(e.schema, e.name)])
);
schemas['registry.schema.json'] = namedJsonSchema(registryBundleSchema, 'RegistryBundle');

resetDir(schemasDir);
resetDir(path.join(sitePublicDir, 'schemas'));
for (const [filename, schemaObj] of Object.entries(schemas)) {
  const withId = { $id: `${SITE_ORIGIN}/schemas/${filename}`, ...(schemaObj as object) };
  writeJson(path.join(schemasDir, filename), withId);
  writeJson(path.join(sitePublicDir, 'schemas', filename), withId);
}
console.log(
  `✓ Generated ${Object.keys(schemas).length} JSON schemas in schemas/ and apps/web/public/schemas/`
);

// ---------------------------------------------------------------------------
// 2. Static data exports (latest + immutable release snapshot)
// ---------------------------------------------------------------------------
const latestDir = path.join(sitePublicDir, 'data', 'latest');
const releaseDir = path.join(sitePublicDir, 'data', 'releases', bundle.version);
resetDir(latestDir);
fs.mkdirSync(releaseDir, { recursive: true });

const registryJson = JSON.stringify(bundle, null, 2) + '\n';
writeText(path.join(latestDir, 'registry.json'), registryJson);
writeText(path.join(releaseDir, 'registry.json'), registryJson);

const inventory = buildDataInventory(bundle, {
  scenarios: loadScenarios(root).length,
  archetypes: loadArchetypes(root).length,
});
writeJson(path.join(latestDir, 'inventory.json'), inventory);
writeJson(path.join(releaseDir, 'inventory.json'), inventory);

const coverageModel = loadCoverageModel(root);
const loadedScenarios = loadScenarios(root);
const caseLift = liftRegistryCaseSpace(bundle, loadedScenarios);
const coverage = {
  ...coverageModel,
  summary: summarizeCoverage(coverageModel),
  case_space: serializeCaseSpaceMetrics(),
  lift: {
    version: caseLift.version,
    method: caseLift.method,
    summary: caseLift.summary,
    coordinates: caseLift.coordinates,
  },
};
writeJson(path.join(latestDir, 'coverage.json'), coverage);
writeJson(path.join(releaseDir, 'coverage.json'), coverage);
writeJson(path.join(latestDir, 'case-lift.json'), caseLift);
writeJson(path.join(releaseDir, 'case-lift.json'), caseLift);

const ndjson =
  ENTITIES.flatMap((e) =>
    (bundle[e.collection] as unknown[]).map((item) => JSON.stringify(item))
  ).join('\n') + '\n';
writeText(path.join(latestDir, 'registry.ndjson'), ndjson);

const { nodesCSV, edgesCSV } = graph.toCSV();
writeText(path.join(latestDir, 'nodes.csv'), nodesCSV);
writeText(path.join(latestDir, 'edges.csv'), edgesCSV);

const graphml = graph.toGraphML() + '\n';
writeText(path.join(latestDir, 'graph.graphml'), graphml);
writeText(path.join(releaseDir, 'graph.graphml'), graphml);

const graphProjection = graph.toCytoscapeJSON();
writeJson(path.join(latestDir, 'graph.json'), graphProjection);
writeJson(path.join(latestDir, 'schema.json'), schemas['registry.schema.json']);
writeJson(path.join(latestDir, 'manifest.json'), {
  registry_version: bundle.version,
  /**
   * What this release contains, as opposed to what it is called (design doc
   * §10). Derived from every entity and scenario file, so it is identical
   * across checkouts and different after any edit or rename. No build-time
   * timestamp sits beside it: artifacts are committed here, and `updated_at`
   * is authored precisely so exports stay byte-deterministic.
   */
  registry_hash: registryContentHash(root),
  schema_version: bundle.schema_version,
  site_version: siteVersion,
  updated_at: bundle.updated_at,
});
console.log(
  '✓ Generated machine exports (inventory.json, coverage.json, case-lift.json, registry.json, registry.ndjson, nodes.csv, edges.csv, graph.graphml, graph.json, schema.json, manifest.json)'
);

// ---------------------------------------------------------------------------
// 3. Static REST API (apps/web/public/api/v1/**)
// ---------------------------------------------------------------------------
const apiDir = path.join(sitePublicDir, 'api', 'v1');
resetDir(apiDir);

writeJson(path.join(apiDir, 'index.json'), {
  name: 'hoba Public API',
  version: 'v1',
  registry_version: bundle.version,
  schema_version: bundle.schema_version,
  openapi: '/openapi.json',
  inventory: '/data/latest/inventory.json',
  coverage: '/data/latest/coverage.json',
  endpoints: [
    ...ENTITIES.flatMap((entity) => [
      `/api/v1/${entity.collection}/index.json`,
      `/api/v1/${entity.collection}/{id}.json`,
    ]),
    '/api/v1/graph/index.json',
  ],
});

/**
 * `agency_zones` is published on mechanisms but authored on none of them: it is
 * derived from the levers, facets and perspectives each mechanism already
 * declares (see `agencyZones`). Adding it here rather than to the frontmatter
 * keeps the single source of truth in the entities it summarises — a consumer
 * gets the field the design doc's §6 asks for, and it cannot drift from them.
 */
const withDerived = (collection: string, item: { id: string }) =>
  collection === 'mechanisms' ? { ...item, agency_zones: agencyZones(bundle, item.id) } : item;

for (const e of ENTITIES) {
  const items = (bundle[e.collection] as { id: string }[]).map((item) =>
    withDerived(e.collection, item)
  );
  writeJson(path.join(apiDir, e.collection, 'index.json'), {
    registry_version: bundle.version,
    count: items.length,
    items,
  });
  for (const item of items) {
    writeJson(path.join(apiDir, e.collection, `${item.id}.json`), {
      registry_version: bundle.version,
      data: item,
    });
  }
}

writeJson(path.join(apiDir, 'graph', 'index.json'), {
  registry_version: bundle.version,
  nodes_count: graphProjection.elements.nodes.length,
  edges_count: graph.edges.length,
  elements: graphProjection.elements,
});

// ---------------------------------------------------------------------------
// 4. OpenAPI 3.1 contract
// ---------------------------------------------------------------------------
const schemaRef = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const jsonResponse = (description: string, schema: unknown) => ({
  '200': { description, content: { 'application/json': { schema } } },
});
const listPath = (e: EntityDef) => ({
  get: {
    operationId: `list${e.name}s`,
    summary: `List all ${e.plural.en}`,
    tags: [e.name],
    responses: jsonResponse('Successful response', {
      type: 'object',
      required: ['registry_version', 'count', 'items'],
      properties: {
        registry_version: { type: 'string' },
        count: { type: 'integer' },
        items: { type: 'array', items: schemaRef(e.name) },
      },
    }),
  },
});
const itemPath = (e: EntityDef) => ({
  get: {
    operationId: `get${e.name}`,
    summary: `Get ${e.name} by ID`,
    tags: [e.name],
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: `Canonical ${e.name} ID`,
      },
    ],
    responses: {
      ...jsonResponse('Successful response', {
        type: 'object',
        required: ['registry_version', 'data'],
        properties: { registry_version: { type: 'string' }, data: schemaRef(e.name) },
      }),
      '404': { description: 'Unknown ID' },
    },
  },
});

const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'hoba API',
    description:
      'Hiring Obstacles & Barriers Atlas — versioned, read-only knowledge graph served as static JSON.',
    version: siteVersion,
    'x-registry-version': bundle.version,
    'x-schema-version': bundle.schema_version,
    contact: { name: 'Dmytro Yemelianov', url: `${SITE_ORIGIN}/about` },
    license: { name: 'MIT (code) / CC BY-SA 4.0 (content)', url: `${SITE_ORIGIN}/about#license` },
  },
  servers: [{ url: `${SITE_ORIGIN}/api/v1`, description: 'Canonical Production API' }],
  externalDocs: {
    description: 'Complete data inventory, boundaries, formats, and usage guidance',
    url: `${SITE_ORIGIN}/data/latest/inventory.json`,
  },
  paths: {
    '/index.json': {
      get: {
        operationId: 'getApiIndex',
        summary: 'API index and registry version',
        responses: jsonResponse('Successful response', { type: 'object' }),
      },
    },
    ...Object.fromEntries(
      ENTITIES.flatMap((e) => [
        [`/${e.collection}/index.json`, listPath(e)],
        [`/${e.collection}/{id}.json`, itemPath(e)],
      ])
    ),
    '/graph/index.json': {
      get: {
        operationId: 'getGraph',
        summary: 'Retrieve the reader-facing relationship projection (Cytoscape.js elements)',
        responses: jsonResponse('Successful response', {
          type: 'object',
          properties: {
            registry_version: { type: 'string' },
            nodes_count: { type: 'integer' },
            edges_count: { type: 'integer' },
            elements: { type: 'object' },
          },
        }),
      },
    },
  },
  components: {
    schemas: Object.fromEntries(
      ENTITIES.map((e) => [
        e.name,
        { $ref: `${SITE_ORIGIN}/schemas/${e.schema_file}#/definitions/${e.name}` },
      ])
    ),
  },
};

writeJson(path.join(sitePublicDir, 'openapi.json'), openApiSpec);
console.log(
  `✓ Generated openapi.json and static REST endpoints for ${ENTITIES.length} collections`
);
console.log(
  `All registry build artifacts generated (registry ${bundle.version}, schema ${bundle.schema_version}, site ${siteVersion}).`
);
