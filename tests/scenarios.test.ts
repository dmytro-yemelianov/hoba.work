import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, expect, it } from 'vitest';
import {
  loadScenarios,
  scenarioSchema,
  validateScenarios,
  loadRegistryFromRoot,
  resolveRegistryRoot,
} from '@hoba/registry';

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');

function writeScenarios(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoba-scenarios-'));
  fs.mkdirSync(path.join(dir, 'data', 'scenarios'), { recursive: true });
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, 'data', 'scenarios', name), body);
  }
  return dir;
}

const VALID = `id: scenario.fixture_case
title:
  en: "A fixture case"
  uk: "Фіксетний випадок"
observations:
  - "obs.complete_silence_after_submission"
compatible_mechanisms:
  - "mech.automated_keyword_qualification_filter"
excluded_claims:
  - "The recruiter deliberately ghosted the candidate"
agency:
  candidate:
    - "int.candidate_ats_parser_conformance_test_utility"
`;

describe('scenarioSchema', () => {
  it('requires a dotted scenario id, a bilingual title and at least one observation', () => {
    expect(
      scenarioSchema.safeParse({
        id: 'scenario.x',
        title: { en: 'A', uk: 'Б' },
        observations: ['obs.y'],
      }).success
    ).toBe(true);
    // A scenario id is its own namespace — no ontology prefix may stand in for it.
    expect(
      scenarioSchema.safeParse({
        id: 'obs.x',
        title: { en: 'A', uk: 'Б' },
        observations: ['obs.y'],
      }).success
    ).toBe(false);
    // Both languages, because the registry is judged in each on its own.
    expect(
      scenarioSchema.safeParse({ id: 'scenario.x', title: { en: 'A' }, observations: ['obs.y'] })
        .success
    ).toBe(false);
    // A scenario with nothing observed is not a scenario.
    expect(
      scenarioSchema.safeParse({ id: 'scenario.x', title: { en: 'A', uk: 'Б' }, observations: [] })
        .success
    ).toBe(false);
  });

  it('types each array to the namespace it references', () => {
    const base = { id: 'scenario.x', title: { en: 'A', uk: 'Б' }, observations: ['obs.y'] };
    expect(
      scenarioSchema.safeParse({ ...base, compatible_mechanisms: ['bar.wrong'] }).success
    ).toBe(false);
    expect(scenarioSchema.safeParse({ ...base, compatible_barriers: ['mech.wrong'] }).success).toBe(
      false
    );
    expect(scenarioSchema.safeParse({ ...base, process_states: ['proc.right'] }).success).toBe(
      true
    );
  });
});

describe('loadScenarios', () => {
  it('returns an empty list when the directory does not exist', () => {
    expect(loadScenarios(fs.mkdtempSync(path.join(os.tmpdir(), 'hoba-empty-')))).toEqual([]);
  });

  it('loads every scenario file, deterministically ordered', () => {
    const dir = writeScenarios({
      'b.yaml': VALID,
      'a.yaml': VALID.replace('scenario.fixture_case', 'scenario.aaa'),
    });
    expect(loadScenarios(dir).map((s) => s.id)).toEqual(['scenario.aaa', 'scenario.fixture_case']);
  });
});

describe('validateScenarios', () => {
  it('accepts a scenario whose every reference resolves against the ontology', () => {
    expect(validateScenarios(loadScenarios(writeScenarios({ 'a.yaml': VALID })), bundle)).toEqual(
      []
    );
  });

  it('reports an unresolvable ID as an error, not a warning — this is a build failure', () => {
    const broken = VALID.replace(
      'obs.complete_silence_after_submission',
      'obs.no_such_observation'
    );
    const issues = validateScenarios(loadScenarios(writeScenarios({ 'a.yaml': broken })), bundle);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.severity).toBe('error');
    expect(issues[0]!.rule).toBe('dangling-reference');
    expect(issues[0]!.message).toContain('obs.no_such_observation');
  });

  it('checks every referencing array, not just observations', () => {
    const broken = VALID.replace(
      'mech.automated_keyword_qualification_filter',
      'mech.no_such_mechanism'
    ).replace('int.candidate_ats_parser_conformance_test_utility', 'int.no_such_intervention');
    const messages = validateScenarios(loadScenarios(writeScenarios({ 'a.yaml': broken })), bundle)
      .map((i) => i.message)
      .join('\n');
    expect(messages).toContain('mech.no_such_mechanism');
    expect(messages).toContain('int.no_such_intervention');
  });

  it('rejects two scenarios claiming the same id', () => {
    const dir = writeScenarios({ 'a.yaml': VALID, 'b.yaml': VALID });
    expect(
      validateScenarios(loadScenarios(dir), bundle).some((i) => i.rule === 'duplicate-id')
    ).toBe(true);
  });
});

describe('the one-directional guarantee', () => {
  it('is structural: no ontology entity in the real registry can hold a scenario reference', () => {
    // Not a lint. The ontology schemas define no field that could carry one, so
    // a scenario id cannot appear anywhere in a parsed bundle.
    expect(JSON.stringify(bundle)).not.toContain('scenario.');
  });
});
