import { describe, expect, it } from 'vitest';
import { entityTypeSchema } from '@hoba/registry';
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

  it('is matched by the live Zod enum, kind for kind — DoD 1', () => {
    // `observation` now agrees on both sides. `process` is still pending the
    // second half of the type rename, so the map carries exactly one entry.
    const live = entityTypeSchema.options;
    expect(live).toHaveLength(11);
    expect(live).not.toContain('scenario');
    expect(new Set(live).size).toBe(live.length);

    const RENAMED: Record<string, string> = { process: 'workflow' };
    const target = (schema.properties.type.enum as string[]).map((k) => RENAMED[k] ?? k);
    expect([...live].sort()).toEqual([...target].sort());
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

  it('constrains superseded_by and deprecated.replaced_by to ontology ID patterns, never a scenario ID', () => {
    const ontologyIdPattern = new RegExp(schema.properties.superseded_by!.pattern!);
    expect(ontologyIdPattern.test('bar.some_other_barrier')).toBe(true);
    expect(ontologyIdPattern.test('scenario.application_silence')).toBe(false);

    const deprecated = schema.properties.deprecated as unknown as {
      properties: { replaced_by: { items: { pattern: string } } };
    };
    const replacedByPattern = new RegExp(deprecated.properties.replaced_by.items.pattern);
    expect(replacedByPattern.test('mech.pipeline_refresh')).toBe(true);
    expect(replacedByPattern.test('scenario.application_silence')).toBe(false);
  });
});

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

describe('schema/scenario.schema.json', () => {
  const schema = readSchema('scenario.schema.json') as {
    required: string[];
    properties: Record<string, { pattern?: string }>;
  };

  it('requires id, title, and at least one observation', () => {
    expect(schema.required).toEqual(['id', 'title', 'observations']);
  });

  it('uses a scenario.* ID namespace disjoint from every ontology type prefix', () => {
    // The complementary check — that no ontology entity schema has a field
    // capable of referencing a scenario ID — lives in the entity.schema.json
    // describe block earlier in this file.
    expect(schema.properties.id.pattern).toBe('^scenario\\.[a-z0-9_]+$');
  });

  it('every entity-referencing array is pattern-constrained to that entity type\'s prefix', () => {
    expect((schema.properties.observations as { items: { pattern: string } }).items.pattern).toBe('^obs\\.[a-z0-9_]+$');
    expect((schema.properties.compatible_mechanisms as { items: { pattern: string } }).items.pattern).toBe('^mech\\.[a-z0-9_]+$');
    expect((schema.properties.compatible_barriers as { items: { pattern: string } }).items.pattern).toBe('^bar\\.[a-z0-9_]+$');
  });
});

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
