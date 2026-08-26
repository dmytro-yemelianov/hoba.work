import fs from 'node:fs';
import path from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  artifactSchema,
  barrierSchema,
  evidenceSchema,
  HOBAKnowledgeGraph,
  interventionSchema,
  loadRegistryFromDirectory,
  loopSchema,
  mechanismSchema,
  patternSchema,
  registryBundleSchema,
  validateRegistryBundle,
} from '@hoba/registry';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');
const evidenceDir = path.join(rootDir, 'evidence');
const sitePublicDir = path.join(rootDir, 'site', 'public');
const schemasDir = path.join(rootDir, 'schemas');

console.log('Building HOBA Registry and machine-readable exports...');

const bundle = loadRegistryFromDirectory(contentDir, evidenceDir);
const issues = validateRegistryBundle(bundle);
if (issues.length > 0) {
  console.error('Validation errors:', issues);
  process.exit(1);
}

const graph = new HOBAKnowledgeGraph(bundle);
const dagResult = graph.validateBarrierDAG();
if (!dagResult.valid) {
  console.error('DAG validation failed:', dagResult.error);
  process.exit(1);
}

// Ensure output directories
fs.mkdirSync(schemasDir, { recursive: true });
fs.mkdirSync(path.join(sitePublicDir, 'schemas'), { recursive: true });
fs.mkdirSync(path.join(sitePublicDir, 'data', 'latest'), { recursive: true });
fs.mkdirSync(path.join(sitePublicDir, 'data', 'releases', bundle.version), { recursive: true });
fs.mkdirSync(path.join(sitePublicDir, 'api', 'v1'), { recursive: true });

// 1. Generate JSON Schemas
const schemas = {
  'artifact.schema.json': zodToJsonSchema(artifactSchema, 'Artifact'),
  'barrier.schema.json': zodToJsonSchema(barrierSchema, 'Barrier'),
  'mechanism.schema.json': zodToJsonSchema(mechanismSchema, 'Mechanism'),
  'pattern.schema.json': zodToJsonSchema(patternSchema, 'Pattern'),
  'loop.schema.json': zodToJsonSchema(loopSchema, 'Loop'),
  'intervention.schema.json': zodToJsonSchema(interventionSchema, 'Intervention'),
  'evidence.schema.json': zodToJsonSchema(evidenceSchema, 'Evidence'),
  'registry.schema.json': zodToJsonSchema(registryBundleSchema, 'RegistryBundle'),
};

for (const [filename, schemaObj] of Object.entries(schemas)) {
  const jsonStr = JSON.stringify(schemaObj, null, 2);
  fs.writeFileSync(path.join(schemasDir, filename), jsonStr, 'utf-8');
  fs.writeFileSync(path.join(sitePublicDir, 'schemas', filename), jsonStr, 'utf-8');
}
console.log('✓ Generated JSON schemas in schemas/ and site/public/schemas/');

// 2. Generate Static Data Exports
const registryJson = JSON.stringify(bundle, null, 2);
fs.writeFileSync(path.join(sitePublicDir, 'data', 'latest', 'registry.json'), registryJson, 'utf-8');
fs.writeFileSync(path.join(sitePublicDir, 'data', 'releases', bundle.version, 'registry.json'), registryJson, 'utf-8');

// NDJSON
const ndjsonLines = [
  ...bundle.artifacts.map((a) => JSON.stringify(a)),
  ...bundle.barriers.map((b) => JSON.stringify(b)),
  ...bundle.mechanisms.map((m) => JSON.stringify(m)),
  ...bundle.patterns.map((p) => JSON.stringify(p)),
  ...bundle.loops.map((l) => JSON.stringify(l)),
  ...bundle.interventions.map((i) => JSON.stringify(i)),
  ...bundle.evidence.map((e) => JSON.stringify(e)),
].join('\n');
fs.writeFileSync(path.join(sitePublicDir, 'data', 'latest', 'registry.ndjson'), ndjsonLines, 'utf-8');

// CSVs
const { nodesCSV, edgesCSV } = graph.toCSV();
fs.writeFileSync(path.join(sitePublicDir, 'data', 'latest', 'nodes.csv'), nodesCSV, 'utf-8');
fs.writeFileSync(path.join(sitePublicDir, 'data', 'latest', 'edges.csv'), edgesCSV, 'utf-8');

// GraphML
const graphml = graph.toGraphML();
fs.writeFileSync(path.join(sitePublicDir, 'data', 'latest', 'graph.graphml'), graphml, 'utf-8');
fs.writeFileSync(path.join(sitePublicDir, 'data', 'releases', bundle.version, 'graph.graphml'), graphml, 'utf-8');

// Cytoscape JSON
const cytoscapeJson = JSON.stringify(graph.toCytoscapeJSON(), null, 2);
fs.writeFileSync(path.join(sitePublicDir, 'data', 'latest', 'graph.json'), cytoscapeJson, 'utf-8');

console.log('✓ Generated machine exports (registry.json, registry.ndjson, nodes.csv, edges.csv, graph.graphml, graph.json)');

// 3. Generate Static API endpoints in site/public/api/v1/
const apiDir = path.join(sitePublicDir, 'api', 'v1');

const writeJson = (filePath: string, data: any) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

writeJson(path.join(apiDir, 'index.json'), {
  name: 'HOBA Public API',
  version: 'v1',
  registry_version: bundle.version,
  endpoints: [
    '/api/v1/artifacts',
    '/api/v1/barriers',
    '/api/v1/mechanisms',
    '/api/v1/patterns',
    '/api/v1/loops',
    '/api/v1/interventions',
    '/api/v1/graph',
    '/api/v1/search',
  ],
});

writeJson(path.join(apiDir, 'artifacts', 'index.json'), { registry_version: bundle.version, count: bundle.artifacts.length, items: bundle.artifacts });
for (const a of bundle.artifacts) {
  writeJson(path.join(apiDir, 'artifacts', `${a.id}.json`), { registry_version: bundle.version, data: a });
}

writeJson(path.join(apiDir, 'barriers', 'index.json'), { registry_version: bundle.version, count: bundle.barriers.length, items: bundle.barriers });
for (const b of bundle.barriers) {
  writeJson(path.join(apiDir, 'barriers', `${b.id}.json`), { registry_version: bundle.version, data: b });
}

writeJson(path.join(apiDir, 'mechanisms', 'index.json'), { registry_version: bundle.version, count: bundle.mechanisms.length, items: bundle.mechanisms });
for (const m of bundle.mechanisms) {
  writeJson(path.join(apiDir, 'mechanisms', `${m.id}.json`), { registry_version: bundle.version, data: m });
}

writeJson(path.join(apiDir, 'patterns', 'index.json'), { registry_version: bundle.version, count: bundle.patterns.length, items: bundle.patterns });
for (const p of bundle.patterns) {
  writeJson(path.join(apiDir, 'patterns', `${p.id}.json`), { registry_version: bundle.version, data: p });
}

writeJson(path.join(apiDir, 'loops', 'index.json'), { registry_version: bundle.version, count: bundle.loops.length, items: bundle.loops });
for (const l of bundle.loops) {
  writeJson(path.join(apiDir, 'loops', `${l.id}.json`), { registry_version: bundle.version, data: l });
}

writeJson(path.join(apiDir, 'interventions', 'index.json'), { registry_version: bundle.version, count: bundle.interventions.length, items: bundle.interventions });
for (const i of bundle.interventions) {
  writeJson(path.join(apiDir, 'interventions', `${i.id}.json`), { registry_version: bundle.version, data: i });
}

writeJson(path.join(apiDir, 'graph', 'index.json'), {
  registry_version: bundle.version,
  nodes_count: graph.nodeMap.size,
  edges_count: graph.edges.length,
  elements: graph.toCytoscapeJSON().elements,
});

// OpenAPI Spec Generation
const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'hoba API',
    description: 'Hiring Obstacles & Barriers Atlas — Versioned Knowledge Graph API',
    version: '0.4.1',
    contact: {
      name: 'Dmytro Yemelianov',
      url: 'https://hoba.work/about',
    },
    license: {
      name: 'MIT / CC BY-SA 4.0',
      url: 'https://hoba.work/about#license',
    },
  },
  servers: [
    {
      url: 'https://hoba.work/api/v1',
      description: 'Canonical Production API',
    },
  ],
  paths: {
    '/artifacts': {
      get: {
        summary: 'List all Artifacts / Observations',
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/artifacts/{id}': {
      get: {
        summary: 'Get Artifact by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/barriers': {
      get: {
        summary: 'List all Barriers in the Funnel DAG',
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/barriers/{id}': {
      get: {
        summary: 'Get Barrier by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/mechanisms': {
      get: {
        summary: 'List all Mechanisms with Facets',
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/mechanisms/{id}': {
      get: {
        summary: 'Get Mechanism by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/patterns': {
      get: {
        summary: 'List all Recurring Graph Patterns',
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/loops': {
      get: {
        summary: 'List all Strongly Connected Causal Loops',
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/interventions': {
      get: {
        summary: 'List all Targeted System Interventions',
        responses: { '200': { description: 'Successful response' } },
      },
    },
    '/graph': {
      get: {
        summary: 'Retrieve complete knowledge graph structure (nodes & edges)',
        responses: { '200': { description: 'Successful response' } },
      },
    },
  },
};

fs.writeFileSync(path.join(sitePublicDir, 'openapi.json'), JSON.stringify(openApiSpec, null, 2), 'utf-8');
console.log('✓ Generated openapi.json and static REST endpoints');

// 4. Save compiled bundle in packages/registry/dist for standalone usage
fs.mkdirSync(path.join(rootDir, 'packages', 'registry', 'dist'), { recursive: true });
fs.writeFileSync(path.join(rootDir, 'packages', 'registry', 'dist', 'bundle.json'), registryJson, 'utf-8');

console.log('All registry build artifacts successfully generated!');
