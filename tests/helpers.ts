import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {
  ArtifactNode,
  BarrierNode,
  InterventionNode,
  LoopNode,
  MechanismNode,
  PatternNode,
  RegistryBundle,
} from '@hoba/registry';

export const REPO_ROOT = path.resolve(__dirname, '..');

export const artifact = (over: Partial<ArtifactNode> & { id: string }): ArtifactNode => ({
  type: 'artifact',
  title: `Artifact ${over.id}`,
  summary: 'A sufficiently long summary for the fixture.',
  stages: ['screening'],
  status: 'active',
  evidence_level: 'supported',
  evidence_ids: [],
  probes: [],
  specimens: [],
  non_inferences: ['Does not establish anything by itself.'],
  ...over,
});

export const barrier = (over: Partial<BarrierNode> & { id: string; order: number }): BarrierNode => ({
  type: 'barrier',
  title: `Barrier ${over.id}`,
  stage: 'screening',
  precedes: [],
  description: 'A sufficiently long description for the fixture.',
  pass_condition: 'Passes when the fixture says so.',
  status: 'active',
  evidence_level: 'established',
  evidence_ids: [],
  ...over,
});

export const mechanism = (over: Partial<MechanismNode> & { id: string }): MechanismNode => ({
  type: 'mechanism',
  title: `Mechanism ${over.id}`,
  summary: 'A sufficiently long summary for the fixture.',
  operates_at: ['B-001'],
  emissions: [],
  facets: { actor: 'system', nature: 'rule', visibility: 'opaque', removability: 'none' },
  amplifies: [],
  masks: [],
  status: 'active',
  evidence_level: 'supported',
  honest_baseline: false,
  evidence_ids: [],
  specimens: [],
  non_inferences: ['Does not establish intent.'],
  ...over,
});

export const pattern = (over: Partial<PatternNode> & { id: string }): PatternNode => ({
  type: 'pattern',
  title: `Pattern ${over.id}`,
  summary: 'A sufficiently long summary for the fixture.',
  required_artifacts: ['A-001'],
  compatible_mechanisms: ['M-001'],
  specimens: [],
  trigger_rule: 'Triggers when the fixture says so.',
  establishes: ['Something structural.'],
  non_inferences: ['Not malice.'],
  interventions: [],
  status: 'active',
  evidence_level: 'supported',
  evidence_ids: [],
  ...over,
});

export const loop = (over: Partial<LoopNode> & { id: string }): LoopNode => ({
  type: 'loop',
  title: `Loop ${over.id}`,
  summary: 'A sufficiently long summary for the fixture.',
  mechanisms: ['M-001', 'M-002'],
  edges: [
    { from: 'M-001', to: 'M-002', relation: 'amplifies' },
    { from: 'M-002', to: 'M-001', relation: 'amplifies' },
  ],
  entry_points: ['M-001'],
  interventions: [],
  status: 'active',
  evidence_level: 'supported',
  evidence_ids: [],
  ...over,
});

export const intervention = (over: Partial<InterventionNode> & { id: string }): InterventionNode => ({
  type: 'intervention',
  title: `Intervention ${over.id}`,
  summary: 'A sufficiently long summary for the fixture.',
  targets: ['M-001'],
  actor: 'employer-policy',
  scope: 'organizational',
  cost: 'low',
  status: 'active',
  evidence_level: 'supported',
  expected_effects: ['Less noise.'],
  measurements: ['noise_rate'],
  evidence_ids: [],
  ...over,
});

/** A minimal, fully valid bundle: 2 barriers, 2 mechanisms forming a declared cycle, 1 artifact, 1 pattern, 1 loop, 1 intervention. */
export function makeBundle(over: Partial<RegistryBundle> = {}): RegistryBundle {
  return {
    version: '2026.01.1',
    schema_version: '1.0.0',
    updated_at: '2026-01-01T00:00:00Z',
    artifacts: [
      artifact({
        id: 'A-001',
        stages: ['screening'],
        probes: [{ id: 'PROBE-A-001-1', action: 'Check the spam folder.', expected_signal: 'An acknowledgement.', cost: 'low' }],
      }),
    ],
    barriers: [
      barrier({ id: 'B-001', order: 1, stage: 'screening', precedes: ['B-002'] }),
      barrier({ id: 'B-002', order: 2, stage: 'technical' }),
    ],
    mechanisms: [
      mechanism({
        id: 'M-001',
        operates_at: ['B-001'],
        emissions: [{ artifact: 'A-001', fidelity: 'direct', likelihood: 'high', evidence: [] }],
        facets: { actor: 'candidate', nature: 'rule', visibility: 'inferable', removability: 'candidate' },
        honest_baseline: true,
        amplifies: ['M-002'],
      }),
      mechanism({ id: 'M-002', operates_at: ['B-002'], amplifies: ['M-001'] }),
    ],
    patterns: [pattern({ id: 'P-001', interventions: ['I-001'] })],
    loops: [loop({ id: 'L-001' })],
    interventions: [intervention({ id: 'I-001', targets: ['M-001', 'P-001'] })],
    evidence: [
      { id: 'EVD-001', type: 'evidence', title: 'Fixture evidence', kind: 'research', summary: 'A fixture evidence record.' },
    ],
    ...over,
  };
}

/** Write a throwaway registry checkout (registry.yaml + content/ + evidence/) and return its root. */
export function writeTempRegistry(files: Record<string, string>): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hoba-test-'));
  fs.writeFileSync(
    path.join(root, 'registry.yaml'),
    'version: "2026.01.1"\nschema_version: "1.0.0"\nupdated_at: "2026-01-01T00:00:00Z"\n'
  );
  fs.mkdirSync(path.join(root, 'content'), { recursive: true });
  fs.mkdirSync(path.join(root, 'evidence'), { recursive: true });
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return root;
}
