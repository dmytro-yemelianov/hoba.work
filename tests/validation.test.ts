import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  COLLECTION_FOR,
  ID_PATTERNS,
  registryContentHash,
  READER_FACING_TYPES,
  compareBundleStructure,
  entityTypeSchema,
  loadRegistryFromRoot,
  nodesOfTypes,
  resolveRegistryRoot,
  validateRegistry,
  validateRegistryBundle,
  evidenceSchema,
} from '@hoba/registry';
import { barrier, intervention, loop, makeBundle, mechanism, pattern } from './helpers';

const rules = (bundle: ReturnType<typeof makeBundle>) =>
  validateRegistryBundle(bundle).map((i) => `${i.severity}:${i.rule}`);

describe('validateRegistryBundle', () => {
  it('accepts a minimal valid bundle without issues', () => {
    expect(validateRegistryBundle(makeBundle())).toEqual([]);
    expect(validateRegistry(makeBundle()).ok).toBe(true);
  });

  it('flags dangling references for every relation type', () => {
    const bundle = makeBundle({
      mechanisms: [
        mechanism({
          id: 'M-001',
          honest_baseline: true,
          operates_at: ['B-999'],
          emissions: [{ artifact: 'A-999', evidence: ['EVD-999'], observed_at: [] }],
          amplifies: ['M-999'],
          masks: ['M-998'],
        }),
      ],
      patterns: [
        pattern({
          id: 'P-001',
          required_artifacts: ['A-999'],
          compatible_mechanisms: ['M-999'],
          interventions: ['I-999'],
        }),
      ],
      loops: [loop({ id: 'L-001', mechanisms: ['M-001', 'M-999'] })],
      interventions: [intervention({ id: 'I-001', targets: ['M-999'], evidence_ids: ['EVD-999'] })],
    });
    const issues = validateRegistryBundle(bundle).filter((i) => i.rule === 'dangling-reference');
    const messages = issues.map((i) => i.message).join('\n');
    for (const ref of ['B-999', 'A-999', 'EVD-999', 'M-999', 'M-998', 'I-999'])
      expect(messages).toContain(ref);
    expect(issues.every((i) => i.severity === 'error')).toBe(true);
  });

  // Design doc §6: a claim may never be authored as `proven` without at least
  // one linked evidence record whose kind is `primary` or `research`.
  // `compatible` never implies `proven` — a tier is not jumped without the
  // evidence for the jump.
  describe('the proven tier', () => {
    const withEvidence = (kind: string) =>
      makeBundle({
        mechanisms: [
          mechanism({
            id: 'M-001',
            honest_baseline: true,
            operates_at: ['B-001'],
            evidence_level: 'proven',
            evidence_ids: ['EVD-001'],
          }),
        ],
        evidence: [
          {
            id: 'EVD-001',
            type: 'evidence',
            title: 'A source',
            kind,
            summary: 'A fixture evidence record.',
            aliases: [],
          } as never,
        ],
      });

    it('accepts proven when the linked evidence is primary or research', () => {
      for (const kind of ['primary', 'research']) {
        expect(
          validateRegistryBundle(withEvidence(kind)).filter((i) => i.rule === 'unsupported-claim')
        ).toEqual([]);
      }
    });

    it('rejects proven when the linked evidence is too weak to carry it', () => {
      for (const kind of ['survey', 'reporting', 'anecdote', 'illustrative']) {
        const issues = validateRegistryBundle(withEvidence(kind)).filter(
          (i) => i.rule === 'unsupported-claim'
        );
        expect(issues, kind).toHaveLength(1);
        expect(issues[0]!.severity).toBe('error');
        expect(issues[0]!.nodeId).toBe('M-001');
      }
    });

    it('rejects proven with no linked evidence at all', () => {
      const bundle = makeBundle({
        mechanisms: [
          mechanism({
            id: 'M-001',
            honest_baseline: true,
            operates_at: ['B-001'],
            evidence_level: 'proven',
            evidence_ids: [],
          }),
        ],
      });
      expect(
        validateRegistryBundle(bundle).filter((i) => i.rule === 'unsupported-claim')
      ).toHaveLength(1);
    });

    it('leaves every tier below proven alone, however thin its evidence', () => {
      for (const level of [
        'observed',
        'compatible',
        'supported',
        'strongly_supported',
        'contradicted',
        'unknown',
      ]) {
        const bundle = makeBundle({
          mechanisms: [
            mechanism({
              id: 'M-001',
              honest_baseline: true,
              operates_at: ['B-001'],
              evidence_level: level as never,
              evidence_ids: [],
            }),
          ],
        });
        expect(
          validateRegistryBundle(bundle).filter((i) => i.rule === 'unsupported-claim'),
          level
        ).toEqual([]);
      }
    });
  });

  // A source nobody cites is either a link someone forgot or weight carried for
  // nothing. Rev. Proc. 2025-28 sat unused while an era's prose made two claims
  // that came from it, and nothing said so.
  describe('unused evidence', () => {
    it('warns about an evidence record no entry cites', () => {
      const bundle = makeBundle();
      bundle.evidence = [
        ...bundle.evidence,
        {
          id: 'EVD-777',
          type: 'evidence',
          title: 'Nobody cites me',
          kind: 'research',
          summary: 'A fixture evidence record.',
          aliases: [],
        } as never,
      ];
      const issues = validateRegistryBundle(bundle).filter((i) => i.rule === 'unused-evidence');
      expect(issues).toHaveLength(1);
      expect(issues[0]!.severity).toBe('warning');
      expect(issues[0]!.nodeId).toBe('EVD-777');
    });

    it('counts a citation from an era, a process or an actor — not only from the claim-bearing types', () => {
      // These three are absent from `allNodes`, which is why their citations
      // were invisible to every rule that reads it.
      for (const collection of ['eras', 'processes', 'actors'] as const) {
        const bundle = makeBundle();
        bundle.evidence = [
          ...bundle.evidence,
          {
            id: 'EVD-777',
            type: 'evidence',
            title: 'Cited',
            kind: 'research',
            summary: 'A fixture evidence record.',
            aliases: [],
          } as never,
        ];
        (bundle as never as Record<string, unknown[]>)[collection] = [
          { id: 'x', evidence_ids: ['EVD-777'], indicators: [] } as never,
        ];
        expect(
          validateRegistryBundle(bundle).filter(
            (i) => i.rule === 'unused-evidence' && i.nodeId === 'EVD-777'
          ),
          collection
        ).toEqual([]);
      }
    });

    it('stays quiet when every record is cited', () => {
      expect(
        validateRegistryBundle(makeBundle()).filter((i) => i.rule === 'unused-evidence')
      ).toEqual([]);
    });
  });

  it('requires at least one active honest-baseline mechanism', () => {
    const bundle = makeBundle();
    bundle.mechanisms = bundle.mechanisms.map((m) => ({ ...m, honest_baseline: false }));
    expect(rules(bundle)).toContain('error:honest-baseline');

    const deprecated = makeBundle();
    deprecated.mechanisms[0] = {
      ...deprecated.mechanisms[0],
      status: 'deprecated',
      superseded_by: 'M-002',
    };
    expect(rules(deprecated)).toContain('error:honest-baseline');
  });

  it('enforces superseded_by / status consistency', () => {
    const bundle = makeBundle();
    bundle.observations[0] = { ...bundle.observations[0], superseded_by: 'A-001' };
    const found = rules(bundle);
    expect(found).toContain('error:lifecycle');
    expect(
      validateRegistryBundle(bundle).some((i) => i.message.includes('cannot supersede itself'))
    ).toBe(true);
  });

  it('enforces barrier order uniqueness and monotonic precedes', () => {
    const bundle = makeBundle({
      barriers: [
        barrier({ id: 'B-001', order: 2, precedes: ['B-002'] }),
        barrier({ id: 'B-002', order: 2 }),
      ],
    });
    const found = validateRegistryBundle(bundle).filter((i) => i.rule === 'barrier-order');
    expect(found).toHaveLength(2);
  });

  it('detects barrier cycles via the full pipeline', () => {
    const bundle = makeBundle({
      barriers: [
        barrier({ id: 'B-001', order: 1, precedes: ['B-002'] }),
        barrier({ id: 'B-002', order: 2, precedes: ['B-001'] }),
      ],
    });
    const report = validateRegistry(bundle);
    expect(report.ok).toBe(false);
    expect(
      report.errors.some((e) => e.rule === 'barrier-cycle' || e.rule === 'barrier-order')
    ).toBe(true);
  });

  it('warns when a loop edge is not declared on the mechanism (editorial-only loop)', () => {
    const bundle = makeBundle();
    bundle.mechanisms[1] = { ...bundle.mechanisms[1], amplifies: [] }; // M-002 no longer amplifies M-001
    const issues = validateRegistryBundle(bundle);
    expect(
      issues.some(
        (i) => i.rule === 'undeclared-loop-edge' && i.severity === 'warning' && i.nodeId === 'L-001'
      )
    ).toBe(true);
  });

  it('errors when loop edges or entry points leave the loop membership', () => {
    const bundle = makeBundle({
      loops: [
        loop({
          id: 'L-001',
          mechanisms: ['M-001', 'M-002'],
          entry_points: ['M-999'],
          edges: [
            { from: 'M-001', to: 'M-999', relation: 'amplifies' },
            { from: 'M-002', to: 'M-001', relation: 'amplifies' },
          ],
        }),
      ],
    });
    expect(validateRegistryBundle(bundle).filter((i) => i.rule === 'loop-membership')).toHaveLength(
      2
    );
  });

  it('warns on non-reciprocal pattern/loop ↔ intervention links in both directions', () => {
    const bundle = makeBundle({
      patterns: [pattern({ id: 'P-001', interventions: ['I-001'] })],
      loops: [loop({ id: 'L-001' })],
      interventions: [intervention({ id: 'I-001', targets: ['L-001'] })],
    });
    const recip = validateRegistryBundle(bundle).filter((i) => i.rule === 'reciprocity');
    expect(recip.map((i) => i.nodeId).sort()).toEqual(['I-001', 'P-001']);
  });

  it('rejects duplicate probe IDs and duplicate emissions', () => {
    const bundle = makeBundle();
    bundle.observations.push({ ...bundle.observations[0], id: 'A-002' }); // same probe id
    bundle.mechanisms[0] = {
      ...bundle.mechanisms[0],
      emissions: [
        { artifact: 'A-001', evidence: [], observed_at: [] },
        { artifact: 'A-001', evidence: [], observed_at: [] },
      ],
    };
    const found = rules(bundle);
    expect(found).toContain('error:duplicate-id');
    expect(found).toContain('error:duplicate-edge');
  });
});

describe('compareBundleStructure', () => {
  it('ignores translated prose but catches structural drift, missing and extra nodes', () => {
    const en = makeBundle();
    const uk = makeBundle();
    uk.observations[0] = {
      ...uk.observations[0],
      title: 'Переклад',
      summary: 'Перекладений опис достатньої довжини.',
      non_inferences: ['Не доводить.'],
    };
    expect(compareBundleStructure(en, uk)).toEqual([]);

    uk.mechanisms[0] = { ...uk.mechanisms[0], operates_at: ['B-002'] };
    uk.interventions = [];
    uk.patterns.push(pattern({ id: 'P-002' }));
    const rulesFound = compareBundleStructure(en, uk).map((i) => `${i.rule}:${i.nodeId}`);
    expect(rulesFound).toContain('mirror-drift:M-001');
    expect(rulesFound).toContain('mirror-missing:I-001');
    expect(rulesFound).toContain('mirror-extra:P-002');
  });
});

describe('ID_PATTERNS accepts both the legacy short code and the new dotted-namespace format', () => {
  it('still accepts every legacy short code (backward compatibility during the phased rename)', () => {
    expect(ID_PATTERNS.artifact.test('A-002')).toBe(true);
    expect(ID_PATTERNS.barrier.test('B-002')).toBe(true);
    expect(ID_PATTERNS.mechanism.test('M-001')).toBe(true);
    expect(ID_PATTERNS.pattern.test('P-001')).toBe(true);
    expect(ID_PATTERNS.loop.test('L-001')).toBe(true);
    expect(ID_PATTERNS.intervention.test('I-002')).toBe(true);
    expect(ID_PATTERNS.evidence.test('EVD-046')).toBe(true);
    expect(ID_PATTERNS.record.test('R-001')).toBe(true);
    expect(ID_PATTERNS.era.test('E-004')).toBe(true);
  });

  it('now also accepts the new dotted-namespace format for every type', () => {
    expect(ID_PATTERNS.artifact.test('obs.generic_closer_alignment_rejection_template')).toBe(true);
    expect(ID_PATTERNS.barrier.test('bar.automated_filter_parser_threshold')).toBe(true);
    expect(ID_PATTERNS.mechanism.test('mech.pipeline_refresh')).toBe(true);
    expect(ID_PATTERNS.pattern.test('pat.seniority_double_bind')).toBe(true);
    expect(ID_PATTERNS.loop.test('loop.some_cycle')).toBe(true);
    expect(ID_PATTERNS.intervention.test('int.some_change')).toBe(true);
    expect(ID_PATTERNS.evidence.test('evidence.hidden_workers')).toBe(true);
    expect(ID_PATTERNS.record.test('record.some_budget')).toBe(true);
    expect(ID_PATTERNS.era.test('era.zero_rates')).toBe(true);
  });

  it('still rejects garbage that matches neither format', () => {
    expect(ID_PATTERNS.pattern.test('not-a-real-id')).toBe(false);
    expect(ID_PATTERNS.pattern.test('P-1')).toBe(false); // wrong digit count for the legacy format
    expect(ID_PATTERNS.pattern.test('pat.')).toBe(false); // empty name after the dotted prefix
    expect(ID_PATTERNS.pattern.test('scenario.application_silence')).toBe(false); // wrong prefix entirely
  });
});

describe('the actual renamed pattern content validates', () => {
  it('loads and validates the real registry with pattern entities already migrated to dotted IDs', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const issues = validateRegistry(bundle).issues;
    const errors = issues.filter((i) => i.severity === 'error');
    if (errors.length > 0) {
      throw new Error(
        `Validation errors:\n${errors.map((e) => `  ${e.rule}: ${e.message}`).join('\n')}`
      );
    }
    expect(errors).toEqual([]);
    // Confirm at least one pattern is actually in the new format, proving this
    // isn't a vacuous pass because the rename hasn't happened yet.
    expect(bundle.patterns.some((p) => p.id.startsWith('pat.'))).toBe(true);
  });
});

describe('aliases survive Zod parsing', () => {
  it('loads a renamed pattern entity with its aliases field intact, not stripped', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const renamed = bundle.patterns.find((p) => p.id === 'pat.seniority_double_bind');
    expect(renamed).toBeDefined();
    expect(renamed!.aliases).toEqual(['P-001']);
  });

  it('loads a renamed mechanism entity with its aliases field intact, not stripped', () => {
    const root = resolveRegistryRoot();
    const bundle = loadRegistryFromRoot(root, 'en');
    const renamed = bundle.mechanisms.find(
      (m) => m.id === 'mech.genuine_technical_skill_shortfall'
    );
    expect(renamed).toBeDefined();
    expect(renamed!.aliases).toEqual(['M-001']);
  });
});

describe('evidence aliases survive Zod parsing', () => {
  it('accepts and preserves an aliases field on an evidence record without stripping it', () => {
    const parsed = evidenceSchema.parse({
      id: 'evidence.test_fixture',
      type: 'evidence',
      title: 'Test evidence fixture for alias round-trip',
      kind: 'research',
      summary: 'A synthetic fixture used only to verify aliases is not stripped.',
      aliases: ['EVD-999'],
    });
    expect(parsed.aliases).toEqual(['EVD-999']);
  });

  it('defaults aliases to an empty array when the field is absent', () => {
    const parsed = evidenceSchema.parse({
      id: 'evidence.test_fixture_2',
      type: 'evidence',
      title: 'Test evidence fixture with no aliases field',
      kind: 'research',
      summary: 'A synthetic fixture used only to verify the default value.',
    });
    expect(parsed.aliases).toEqual([]);
  });
});

describe('the map from a kind to where a bundle keeps it', () => {
  /**
   * `satisfies Record<EntityType, keyof RegistryBundle>` checks the shape at
   * compile time; this checks that the key is actually there on a bundle, which
   * a type alone cannot promise for an optional collection.
   */
  it('names a real collection for every kind the schema has', () => {
    const bundle = makeBundle();
    const missing = entityTypeSchema.options.filter((kind) => {
      const key = COLLECTION_FOR[kind];
      return !key || !(key in bundle);
    });
    expect(missing).toEqual([]);
  });

  it('gathers the reader-facing kinds and nothing else', () => {
    const bundle = makeBundle();
    const gathered = nodesOfTypes(bundle, READER_FACING_TYPES)
      .map((n) => n.id)
      .sort();
    const expected = [
      ...bundle.observations,
      ...bundle.barriers,
      ...bundle.mechanisms,
      ...bundle.patterns,
      ...bundle.loops,
      ...bundle.interventions,
    ]
      .map((n) => n.id)
      .sort();
    expect(gathered).toEqual(expected);
  });
});

describe('the release manifest and the content it names', () => {
  /**
   * `registry.yaml` says "bump `version` on every content release", and nothing
   * enforced it: the published manifest read "1.0.0, 28 August" over content
   * that had changed twelve times since. The hash is derived from the files, so
   * recording it beside the version makes the two move together — a content
   * change fails here until the release is cut, and cutting one without
   * recomputing fails too.
   */
  it('names the content it actually ships', () => {
    const root = resolveRegistryRoot();
    const manifest = fs.readFileSync(path.join(root, 'registry.yaml'), 'utf8');
    const declared = manifest.match(/^release_hash:\s*"([0-9a-f]{64})"/m)?.[1];
    expect(
      declared,
      'registry.yaml must record the hash of the content this version names'
    ).toBeDefined();
    expect(registryContentHash(root)).toBe(declared);
  });
});
