/**
 * Generate every machine-readable export of the registry:
 *   schemas/*.schema.json, site/public/schemas/*, site/public/data/**,
 *   site/public/api/v1/** and site/public/openapi.json.
 *
 * Output is byte-deterministic for a given Git tree (spec §17): no timestamps
 * are generated here — `updated_at` comes from registry.yaml.
 */
import fs from 'node:fs';
import path from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { ZodTypeAny } from 'zod';
import {
  actorSchema,
  agencyZones,
  workflowSchema,
  eraSchema,
  artifactSchema,
  barrierSchema,
  evidenceSchema,
  formatValidationIssue,
  HOBAKnowledgeGraph,
  interventionSchema,
  loadRegistryFromRoot,
  loopSchema,
  mechanismSchema,
  patternSchema,
  readPackageVersion,
  registryBundleSchema,
  resolveRegistryRoot,
  validateRegistry,
  type RegistryBundle,
} from '@hoba/registry';

const SITE_ORIGIN = 'https://hoba.work';

const root = resolveRegistryRoot({ explicit: process.argv[2] });
const sitePublicDir = path.join(root, 'site', 'public');
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
const writeJson = (filePath: string, data: unknown) => writeText(filePath, JSON.stringify(data, null, 2) + '\n');
const resetDir = (dir: string) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

type EntityCollection = Exclude<keyof RegistryBundle, 'version' | 'schema_version' | 'updated_at'>;

interface EntityDef {
  collection: EntityCollection;
  name: string;
  schema: ZodTypeAny;
  summary: string;
}

const ENTITIES: EntityDef[] = [
  { collection: 'actors', name: 'Actor', schema: actorSchema, summary: 'Actors whose decisions the funnel is made of' },
  { collection: 'workflows', name: 'Workflow', schema: workflowSchema, summary: 'State machines the funnel runs as' },
  { collection: 'eras', name: 'Era', schema: eraSchema, summary: 'Periods of the hiring economy, told as where the money came from' },
  { collection: 'artifacts', name: 'Artifact', schema: artifactSchema, summary: 'Observations / Artifacts' },
  { collection: 'barriers', name: 'Barrier', schema: barrierSchema, summary: 'Funnel Barriers (strictly acyclic DAG)' },
  { collection: 'mechanisms', name: 'Mechanism', schema: mechanismSchema, summary: 'Mechanisms with classification facets' },
  { collection: 'patterns', name: 'Pattern', schema: patternSchema, summary: 'Recurring contradiction patterns' },
  { collection: 'loops', name: 'Loop', schema: loopSchema, summary: 'Causal loops (Tarjan SCC validated)' },
  { collection: 'interventions', name: 'Intervention', schema: interventionSchema, summary: 'Targeted system interventions' },
  { collection: 'evidence', name: 'Evidence', schema: evidenceSchema, summary: 'Evidence records' },
];

const schemaFile = (name: string) => `${name.toLowerCase()}.schema.json`;

// ---------------------------------------------------------------------------
// 1. JSON Schemas
// ---------------------------------------------------------------------------
const schemas: Record<string, unknown> = Object.fromEntries(
  ENTITIES.map((e) => [schemaFile(e.name), zodToJsonSchema(e.schema, e.name)])
);
schemas['registry.schema.json'] = zodToJsonSchema(registryBundleSchema, 'RegistryBundle');

resetDir(schemasDir);
resetDir(path.join(sitePublicDir, 'schemas'));
for (const [filename, schemaObj] of Object.entries(schemas)) {
  const withId = { $id: `${SITE_ORIGIN}/schemas/${filename}`, ...(schemaObj as object) };
  writeJson(path.join(schemasDir, filename), withId);
  writeJson(path.join(sitePublicDir, 'schemas', filename), withId);
}
console.log(`✓ Generated ${Object.keys(schemas).length} JSON schemas in schemas/ and site/public/schemas/`);

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

const ndjson =
  ENTITIES.flatMap((e) => (bundle[e.collection] as unknown[]).map((item) => JSON.stringify(item))).join('\n') + '\n';
writeText(path.join(latestDir, 'registry.ndjson'), ndjson);

const { nodesCSV, edgesCSV } = graph.toCSV();
writeText(path.join(latestDir, 'nodes.csv'), nodesCSV);
writeText(path.join(latestDir, 'edges.csv'), edgesCSV);

const graphml = graph.toGraphML() + '\n';
writeText(path.join(latestDir, 'graph.graphml'), graphml);
writeText(path.join(releaseDir, 'graph.graphml'), graphml);

writeJson(path.join(latestDir, 'graph.json'), graph.toCytoscapeJSON());
writeJson(path.join(latestDir, 'schema.json'), schemas['registry.schema.json']);
writeJson(path.join(latestDir, 'manifest.json'), {
  registry_version: bundle.version,
  schema_version: bundle.schema_version,
  site_version: siteVersion,
  updated_at: bundle.updated_at,
});
console.log('✓ Generated machine exports (registry.json, registry.ndjson, nodes.csv, edges.csv, graph.graphml, graph.json, schema.json, manifest.json)');

// ---------------------------------------------------------------------------
// 3. Static REST API (site/public/api/v1/**)
// ---------------------------------------------------------------------------
const apiDir = path.join(sitePublicDir, 'api', 'v1');
resetDir(apiDir);

writeJson(path.join(apiDir, 'index.json'), {
  name: 'hoba Public API',
  version: 'v1',
  registry_version: bundle.version,
  schema_version: bundle.schema_version,
  openapi: '/openapi.json',
  endpoints: [...ENTITIES.map((e) => `/api/v1/${e.collection}`), '/api/v1/graph'],
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
  const items = (bundle[e.collection] as { id: string }[]).map((item) => withDerived(e.collection, item));
  writeJson(path.join(apiDir, e.collection, 'index.json'), { registry_version: bundle.version, count: items.length, items });
  for (const item of items) {
    writeJson(path.join(apiDir, e.collection, `${item.id}.json`), { registry_version: bundle.version, data: item });
  }
}

writeJson(path.join(apiDir, 'graph', 'index.json'), {
  registry_version: bundle.version,
  nodes_count: graph.nodeMap.size,
  edges_count: graph.edges.length,
  elements: graph.toCytoscapeJSON().elements,
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
    summary: `List all ${e.summary}`,
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
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: `Canonical ${e.name} ID` }],
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
    description: 'Hiring Obstacles & Barriers Atlas — versioned, read-only knowledge graph served as static JSON.',
    version: siteVersion,
    'x-registry-version': bundle.version,
    'x-schema-version': bundle.schema_version,
    contact: { name: 'Dmytro Yemelianov', url: `${SITE_ORIGIN}/about` },
    license: { name: 'MIT (code) / CC BY-SA 4.0 (content)', url: `${SITE_ORIGIN}/about#license` },
  },
  servers: [{ url: `${SITE_ORIGIN}/api/v1`, description: 'Canonical Production API' }],
  paths: {
    '/index.json': {
      get: { operationId: 'getApiIndex', summary: 'API index and registry version', responses: jsonResponse('Successful response', { type: 'object' }) },
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
        summary: 'Retrieve the complete knowledge graph (Cytoscape.js elements)',
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
      ENTITIES.map((e) => [e.name, { $ref: `${SITE_ORIGIN}/schemas/${schemaFile(e.name)}#/definitions/${e.name}` }])
    ),
  },
};

writeJson(path.join(sitePublicDir, 'openapi.json'), openApiSpec);
console.log(`✓ Generated openapi.json and static REST endpoints for ${ENTITIES.length} collections`);
console.log(`All registry build artifacts generated (registry ${bundle.version}, schema ${bundle.schema_version}, site ${siteVersion}).`);
