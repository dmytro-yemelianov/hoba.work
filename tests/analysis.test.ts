import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { analysisSchema, validateAnalysis, claimRank, loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

const bundle = loadRegistryFromRoot(resolveRegistryRoot(), 'en');
const example = () =>
  JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'tests', 'examples', 'rejection-sequence.json'), 'utf-8'));

describe('analysisSchema', () => {
  it('accepts the worked example', () => {
    const parsed = analysisSchema.safeParse(example());
    expect(parsed.success ? [] : parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([]);
  });

  it('requires every field the contract marks required', () => {
    for (const field of ['input_type', 'source_text', 'observations', 'interpretations', 'compatible_entities', 'unknowns', 'agency', 'prohibited_conclusions', 'registry_version']) {
      const a = example();
      delete a[field];
      expect(analysisSchema.safeParse(a).success, field).toBe(false);
    }
  });

  it('closes the input_type and classification vocabularies', () => {
    const a = example();
    a.input_type = 'a_thing_that_is_not_an_input_type';
    expect(analysisSchema.safeParse(a).success).toBe(false);

    const b = example();
    b.interpretations[0].classification = 'fact';
    expect(analysisSchema.safeParse(b).success).toBe(false);
  });

  it('requires a semver registry version, the date-coded form having been retired', () => {
    for (const v of ['1.0.0', '2.13.4']) {
      const a = example();
      a.registry_version = v;
      expect(analysisSchema.safeParse(a).success, v).toBe(true);
    }
    for (const v of ['whenever', '1.0', '2026.08.3']) {
      const a = example();
      a.registry_version = v;
      expect(analysisSchema.safeParse(a).success, v).toBe(false);
    }
  });
});

describe('validateAnalysis', () => {
  it('passes the worked example clean', () => {
    expect(validateAnalysis(example(), bundle)).toEqual([]);
  });

  it('reports a reference that does not resolve against the ontology', () => {
    const a = example();
    a.compatible_entities[0].id = 'mech.no_such_mechanism';
    a.observations[0].registry_refs = ['obs.no_such_observation'];
    a.agency.candidate = ['int.no_such_intervention'];
    const messages = validateAnalysis(a, bundle).map((i) => i.message).join('\n');
    for (const ref of ['mech.no_such_mechanism', 'obs.no_such_observation', 'int.no_such_intervention']) {
      expect(messages).toContain(ref);
    }
  });

  // Design doc §6: `compatible` never implies `proven`. An interpretation of a
  // single input cannot raise a registry claim above what the registry itself
  // carries.
  it('refuses a claim stronger than the entity it cites', () => {
    const a = example();
    a.compatible_entities[0].claim_level = 'proven';
    const issues = validateAnalysis(a, bundle).filter((i) => i.rule === 'overclaim');
    expect(issues).toHaveLength(1);
    expect(issues[0]!.severity).toBe('error');
    expect(issues[0]!.message).toContain('mech.stale_or_orphaned_job_requisition');
  });

  it('allows a claim at or below the entity’s own level', () => {
    const a = example();
    // mech.headcount_freeze_or_budget_cancellation is authored above `compatible`.
    a.compatible_entities[1].claim_level = 'observed';
    expect(validateAnalysis(a, bundle).filter((i) => i.rule === 'overclaim')).toEqual([]);
  });

  it('leaves the two states that are not points on the scale alone', () => {
    for (const level of ['contradicted', 'unknown']) {
      const a = example();
      a.compatible_entities[0].claim_level = level;
      expect(validateAnalysis(a, bundle).filter((i) => i.rule === 'overclaim'), level).toEqual([]);
    }
  });
});

describe('claimRank', () => {
  it('orders the scale weakest to strongest and leaves the two off-scale states unranked', () => {
    const ranked = ['observed', 'compatible', 'supported', 'strongly_supported', 'proven'].map((l) => claimRank(l)!);
    expect(ranked).toEqual([...ranked].sort((a, b) => a - b));
    expect(new Set(ranked).size).toBe(ranked.length);
    expect(claimRank('contradicted')).toBeNull();
    expect(claimRank('unknown')).toBeNull();
  });
});

describe('an analysis is not canonical data', () => {
  it('lives outside data/ and is referenced by nothing in the registry', () => {
    expect(fs.existsSync(path.join(REPO_ROOT, 'data', 'analyses'))).toBe(false);
    expect(JSON.stringify(bundle)).not.toContain('analysis.');
  });
});
