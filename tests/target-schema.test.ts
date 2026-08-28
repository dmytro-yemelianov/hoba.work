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
