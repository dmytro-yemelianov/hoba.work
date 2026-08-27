import { describe, expect, it } from 'vitest';
import { compareBundleStructure, validateRegistry, validateRegistryBundle } from '@hoba/registry';
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
