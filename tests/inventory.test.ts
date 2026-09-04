import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildDataInventory,
  COLLECTION_FOR,
  ENTITY_CATALOG,
  ENTITY_TYPES,
  entityTypeSchema,
  HOBAKnowledgeGraph,
  loadArchetypes,
  loadRegistryFromRoot,
  loadScenarios,
  READER_FACING_TYPES,
  searchBundle,
} from '@hoba/registry';

const root = process.cwd();
const bundle = loadRegistryFromRoot(root, 'en');
const scenarios = loadScenarios(root);
const archetypes = loadArchetypes(root);
const inventory = buildDataInventory(bundle, {
  scenarios: scenarios.length,
  archetypes: archetypes.length,
});

describe('canonical data inventory', () => {
  it('covers the entity enum and bundle map exactly once', () => {
    expect([...ENTITY_TYPES].sort()).toEqual([...entityTypeSchema.options].sort());
    expect(new Set(ENTITY_TYPES).size).toBe(ENTITY_TYPES.length);
    expect(ENTITY_CATALOG.map((entry) => entry.collection).sort()).toEqual(
      Object.values(COLLECTION_FOR).sort()
    );
    expect(inventory.totals.collections).toBe(entityTypeSchema.options.length);
  });

  it('measures every canonical and auxiliary dataset from source', () => {
    const expectedTotal = ENTITY_CATALOG.reduce(
      (sum, entry) => sum + bundle[entry.collection].length,
      0
    );
    const expectedNonEvidence = expectedTotal - bundle.evidence.length;

    expect(inventory.totals.ontology_entries).toBe(expectedTotal);
    expect(inventory.totals.non_evidence_entries).toBe(expectedNonEvidence);
    expect(inventory.totals.scenarios).toBe(scenarios.length);
    expect(inventory.totals.archetypes).toBe(archetypes.length);
    expect(archetypes).toHaveLength(expectedNonEvidence);

    for (const entry of ENTITY_CATALOG) {
      const directories =
        entry.type === 'evidence'
          ? [resolve(root, 'data/evidence')]
          : [
              resolve(root, `data/en/entities/${entry.type}`),
              resolve(root, `data/uk/entities/${entry.type}`),
            ];
      for (const directory of directories) {
        expect(existsSync(directory), entry.source).toBe(true);
        expect(
          readdirSync(directory).filter((file) => file.endsWith('.md')).length,
          `${entry.type} source count in ${directory}`
        ).toBe(bundle[entry.collection].length);
      }
    }
    expect(
      readdirSync(resolve(root, 'data/scenarios')).filter((f) => f.endsWith('.yaml'))
    ).toHaveLength(scenarios.length);
    expect(
      readdirSync(resolve(root, 'data/archetypes')).filter((f) => f.endsWith('.yaml'))
    ).toHaveLength(archetypes.length);
  });

  it('makes every recommendation resolve to a declared surface', () => {
    const surfaces = new Set(inventory.surfaces.map((surface) => surface.id));
    expect(inventory.situations.length).toBeGreaterThan(8);
    for (const situation of inventory.situations) {
      expect(situation.recommended.length, situation.id).toBeGreaterThan(0);
      for (const surface of situation.recommended) {
        expect(surfaces.has(surface), `${situation.id} -> ${surface}`).toBe(true);
      }
    }
  });

  it('looks up and searches every ontology type while keeping graph exports scoped', () => {
    const graph = new HOBAKnowledgeGraph(bundle);
    const exportedTypes = new Set(
      graph.toCytoscapeJSON().elements.nodes.map((node) => node.data.type)
    );
    expect([...exportedTypes].sort()).toEqual([...READER_FACING_TYPES].sort());

    for (const entry of ENTITY_CATALOG) {
      const first = bundle[entry.collection][0];
      expect(first, entry.type).toBeDefined();
      expect(graph.getNode(first!.id)?.id, `lookup ${entry.type}`).toBe(first!.id);
      expect(
        searchBundle(bundle, first!.id, { types: [entry.type], limit: 1 })[0]?.id,
        `search ${entry.type}`
      ).toBe(first!.id);
    }
  });

  it('publishes the measured inventory and complete 11-collection machine contract', () => {
    const published = JSON.parse(
      readFileSync(resolve(root, 'apps/web/public/data/latest/inventory.json'), 'utf8')
    );
    const ndjson = readFileSync(
      resolve(root, 'apps/web/public/data/latest/registry.ndjson'),
      'utf8'
    )
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    const openapi = JSON.parse(readFileSync(resolve(root, 'apps/web/public/openapi.json'), 'utf8'));

    expect(published).toEqual(inventory);
    expect(ndjson).toHaveLength(inventory.totals.ontology_entries);
    expect(ndjson.filter((item) => item.type === 'record')).toHaveLength(bundle.records.length);
    for (const entry of inventory.collections) {
      expect(openapi.paths[`/${entry.collection}/index.json`], entry.collection).toBeDefined();
      expect(openapi.paths[`/${entry.collection}/{id}.json`], entry.collection).toBeDefined();
      expect(openapi.components.schemas[entry.name], entry.name).toBeDefined();
    }
  });
});
