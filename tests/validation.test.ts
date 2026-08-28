import { describe, expect, it } from 'vitest';
import { ID_PATTERNS, compareBundleStructure, loadRegistryFromRoot, resolveRegistryRoot, validateRegistry, validateRegistryBundle } from '@hoba/registry';
import { barrier, intervention, loop, makeBundle, mechanism, pattern } from './helpers';

const rules = (bundle: ReturnType<typeof makeBundle>) => validateRegistryBundle(bundle).map((i) => `${i.severity}:${i.rule}`);

describe('validateRegistryBundle', () => {
  it('accepts a minimal valid bundle without issues', () => {
    expect(validateRegistryBundle(makeBundle())).toEqual([]);
    expect(validateRegistry(makeBundle()).ok).toBe(true);
  });

  it('flags dangling references for every relation type', () => {
    const bundle = makeBundle({
      mechanisms: [
        mechanism({ id: 'M-001', honest_baseline: true, operates_at: ['B-999'], emissions: [{ artifact: 'A-999', evidence: ['EVD-999'], observed_at: [] }], amplifies: ['M-999'], masks: ['M-998'] }),
      ],
      patterns: [pattern({ id: 'P-001', required_artifacts: ['A-999'], compatible_mechanisms: ['M-999'], interventions: ['I-999'] })],
      loops: [loop({ id: 'L-001', mechanisms: ['M-001', 'M-999'] })],
      interventions: [intervention({ id: 'I-001', targets: ['M-999'], evidence_ids: ['EVD-999'] })],
    });
    const issues = validateRegistryBundle(bundle).filter((i) => i.rule === 'dangling-reference');
    const messages = issues.map((i) => i.message).join('\n');
    for (const ref of ['B-999', 'A-999', 'EVD-999', 'M-999', 'M-998', 'I-999']) expect(messages).toContain(ref);
    expect(issues.every((i) => i.severity === 'error')).toBe(true);
  });

  it('requires at least one active honest-baseline mechanism', () => {
    const bundle = makeBundle();
    bundle.mechanisms = bundle.mechanisms.map((m) => ({ ...m, honest_baseline: false }));
    expect(rules(bundle)).toContain('error:honest-baseline');

    const deprecated = makeBundle();
    deprecated.mechanisms[0] = { ...deprecated.mechanisms[0], status: 'deprecated', superseded_by: 'M-002' };
    expect(rules(deprecated)).toContain('error:honest-baseline');
  });

  it('enforces superseded_by / status consistency', () => {
    const bundle = makeBundle();
    bundle.artifacts[0] = { ...bundle.artifacts[0], superseded_by: 'A-001' };
    const found = rules(bundle);
    expect(found).toContain('error:lifecycle');
    expect(validateRegistryBundle(bundle).some((i) => i.message.includes('cannot supersede itself'))).toBe(true);
  });

  it('enforces barrier order uniqueness and monotonic precedes', () => {
    const bundle = makeBundle({
      barriers: [barrier({ id: 'B-001', order: 2, precedes: ['B-002'] }), barrier({ id: 'B-002', order: 2 })],
    });
    const found = validateRegistryBundle(bundle).filter((i) => i.rule === 'barrier-order');
    expect(found).toHaveLength(2);
  });

  it('detects barrier cycles via the full pipeline', () => {
    const bundle = makeBundle({
      barriers: [barrier({ id: 'B-001', order: 1, precedes: ['B-002'] }), barrier({ id: 'B-002', order: 2, precedes: ['B-001'] })],
    });
    const report = validateRegistry(bundle);
    expect(report.ok).toBe(false);
    expect(report.errors.some((e) => e.rule === 'barrier-cycle' || e.rule === 'barrier-order')).toBe(true);
  });

  it('warns when a loop edge is not declared on the mechanism (editorial-only loop)', () => {
    const bundle = makeBundle();
    bundle.mechanisms[1] = { ...bundle.mechanisms[1], amplifies: [] }; // M-002 no longer amplifies M-001
    const issues = validateRegistryBundle(bundle);
    expect(issues.some((i) => i.rule === 'undeclared-loop-edge' && i.severity === 'warning' && i.nodeId === 'L-001')).toBe(true);
  });

  it('errors when loop edges or entry points leave the loop membership', () => {
    const bundle = makeBundle({
      loops: [loop({ id: 'L-001', mechanisms: ['M-001', 'M-002'], entry_points: ['M-999'], edges: [{ from: 'M-001', to: 'M-999', relation: 'amplifies' }, { from: 'M-002', to: 'M-001', relation: 'amplifies' }] })],
    });
    expect(validateRegistryBundle(bundle).filter((i) => i.rule === 'loop-membership')).toHaveLength(2);
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
    bundle.artifacts.push({ ...bundle.artifacts[0], id: 'A-002' }); // same probe id
    bundle.mechanisms[0] = { ...bundle.mechanisms[0], emissions: [{ artifact: 'A-001', evidence: [], observed_at: [] }, { artifact: 'A-001', evidence: [], observed_at: [] }] };
    const found = rules(bundle);
    expect(found).toContain('error:duplicate-id');
    expect(found).toContain('error:duplicate-edge');
  });
});

describe('compareBundleStructure', () => {
  it('ignores translated prose but catches structural drift, missing and extra nodes', () => {
    const en = makeBundle();
    const uk = makeBundle();
    uk.artifacts[0] = { ...uk.artifacts[0], title: 'Переклад', summary: 'Перекладений опис достатньої довжини.', non_inferences: ['Не доводить.'] };
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
      throw new Error(`Validation errors:\n${errors.map((e) => `  ${e.rule}: ${e.message}`).join('\n')}`);
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
});
