import { describe, expect, it } from 'vitest';
import { buildIdMapping, slugifyTitle, TYPE_ID_PREFIX, loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';
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
