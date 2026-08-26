import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  artifactSchema,
  barrierSchema,
  evidenceSchema,
  interventionSchema,
  loopSchema,
  mechanismSchema,
  patternSchema,
} from './schemas.js';
import {
  ArtifactNode,
  BarrierNode,
  EvidenceRecord,
  InterventionNode,
  LoopNode,
  MechanismNode,
  PatternNode,
  RegistryBundle,
} from './types.js';

export interface ParseResult<T> {
  data: T;
  content: string;
  filePath: string;
}

export function parseMarkdownFile<T>(filePath: string): ParseResult<T> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    throw new Error(`File at ${filePath} is missing valid YAML frontmatter delimiters (---)`);
  }

  const rawYaml = match[1];
  const markdownBody = match[2].trim();
  const parsed = yaml.load(rawYaml) as any;

  return {
    data: parsed,
    content: markdownBody,
    filePath,
  };
}

export function loadRegistryFromDirectory(baseDir: string, evidenceDir?: string): RegistryBundle {
  const artifactsDir = path.join(baseDir, 'artifacts');
  const barriersDir = path.join(baseDir, 'barriers');
  const mechanismsDir = path.join(baseDir, 'mechanisms');
  const patternsDir = path.join(baseDir, 'patterns');
  const loopsDir = path.join(baseDir, 'loops');
  const interventionsDir = path.join(baseDir, 'interventions');
  const actualEvidenceDir = evidenceDir || path.resolve(baseDir, '..', 'evidence');

  const artifacts: ArtifactNode[] = [];
  const barriers: BarrierNode[] = [];
  const mechanisms: MechanismNode[] = [];
  const patterns: PatternNode[] = [];
  const loops: LoopNode[] = [];
  const interventions: InterventionNode[] = [];
  const evidence: EvidenceRecord[] = [];

  const readDirSafe = (dir: string): string[] => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.yml'));
  };

  // 1. Artifacts
  for (const file of readDirSafe(artifactsDir)) {
    const filePath = path.join(artifactsDir, file);
    const { data, content } = parseMarkdownFile<any>(filePath);
    const validated = artifactSchema.parse({ ...data, content });
    artifacts.push(validated as ArtifactNode);
  }

  // 2. Barriers
  for (const file of readDirSafe(barriersDir)) {
    const filePath = path.join(barriersDir, file);
    const { data, content } = parseMarkdownFile<any>(filePath);
    const validated = barrierSchema.parse({ ...data, content });
    barriers.push(validated as BarrierNode);
  }

  // 3. Mechanisms
  for (const file of readDirSafe(mechanismsDir)) {
    const filePath = path.join(mechanismsDir, file);
    const { data, content } = parseMarkdownFile<any>(filePath);
    const validated = mechanismSchema.parse({ ...data, content });
    mechanisms.push(validated as MechanismNode);
  }

  // 4. Patterns
  for (const file of readDirSafe(patternsDir)) {
    const filePath = path.join(patternsDir, file);
    const { data, content } = parseMarkdownFile<any>(filePath);
    const validated = patternSchema.parse({ ...data, content });
    patterns.push(validated as PatternNode);
  }

  // 5. Loops
  for (const file of readDirSafe(loopsDir)) {
    const filePath = path.join(loopsDir, file);
    const { data, content } = parseMarkdownFile<any>(filePath);
    const validated = loopSchema.parse({ ...data, content });
    loops.push(validated as LoopNode);
  }

  // 6. Interventions
  for (const file of readDirSafe(interventionsDir)) {
    const filePath = path.join(interventionsDir, file);
    const { data, content } = parseMarkdownFile<any>(filePath);
    const validated = interventionSchema.parse({ ...data, content });
    interventions.push(validated as InterventionNode);
  }

  // 7. Evidence
  for (const file of readDirSafe(actualEvidenceDir)) {
    const filePath = path.join(actualEvidenceDir, file);
    let parsed: any;
    if (file.endsWith('.md')) {
      const res = parseMarkdownFile<any>(filePath);
      parsed = res.data;
    } else {
      const raw = fs.readFileSync(filePath, 'utf-8');
      parsed = yaml.load(raw);
    }
    const validated = evidenceSchema.parse(parsed);
    evidence.push(validated as EvidenceRecord);
  }

  // Sort nodes for deterministic ordering
  artifacts.sort((a, b) => a.id.localeCompare(b.id));
  barriers.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  mechanisms.sort((a, b) => a.id.localeCompare(b.id));
  patterns.sort((a, b) => a.id.localeCompare(b.id));
  loops.sort((a, b) => a.id.localeCompare(b.id));
  interventions.sort((a, b) => a.id.localeCompare(b.id));
  evidence.sort((a, b) => a.id.localeCompare(b.id));

  return {
    version: '2026.08.1',
    schema_version: '1.0.0',
    updated_at: '2026-08-26T20:00:00Z',
    artifacts,
    barriers,
    mechanisms,
    patterns,
    loops,
    interventions,
    evidence,
  };
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  nodeId?: string;
  message: string;
}

export function validateRegistryBundle(bundle: RegistryBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allIds = new Set<string>();

  const checkDuplicateId = (id: string, type: string) => {
    if (allIds.has(id)) {
      issues.push({ severity: 'error', nodeId: id, message: `Duplicate ID detected: ${id} across ${type}` });
    }
    allIds.add(id);
  };

  for (const a of bundle.artifacts) checkDuplicateId(a.id, 'artifacts');
  for (const b of bundle.barriers) checkDuplicateId(b.id, 'barriers');
  for (const m of bundle.mechanisms) checkDuplicateId(m.id, 'mechanisms');
  for (const p of bundle.patterns) checkDuplicateId(p.id, 'patterns');
  for (const l of bundle.loops) checkDuplicateId(l.id, 'loops');
  for (const i of bundle.interventions) checkDuplicateId(i.id, 'interventions');

  // Referential checks
  const barrierIds = new Set(bundle.barriers.map((b) => b.id));
  const artifactIds = new Set(bundle.artifacts.map((a) => a.id));
  const mechanismIds = new Set(bundle.mechanisms.map((m) => m.id));
  const patternIds = new Set(bundle.patterns.map((p) => p.id));
  const loopIds = new Set(bundle.loops.map((l) => l.id));
  const interventionIds = new Set(bundle.interventions.map((i) => i.id));
  const evidenceIds = new Set(bundle.evidence.map((e) => e.id));

  // 1. Barrier references
  for (const b of bundle.barriers) {
    for (const next of b.precedes) {
      if (!barrierIds.has(next)) {
        issues.push({ severity: 'error', nodeId: b.id, message: `Barrier precedes unknown barrier: ${next}` });
      }
    }
  }

  // 2. Mechanism references
  let hasHonestBaseline = false;
  for (const m of bundle.mechanisms) {
    if (m.honest_baseline) hasHonestBaseline = true;
    for (const bid of m.operates_at) {
      if (!barrierIds.has(bid)) {
        issues.push({ severity: 'error', nodeId: m.id, message: `Mechanism operates_at unknown barrier: ${bid}` });
      }
    }
    for (const em of m.emissions) {
      if (!artifactIds.has(em.artifact)) {
        issues.push({ severity: 'error', nodeId: m.id, message: `Mechanism emits unknown artifact: ${em.artifact}` });
      }
    }
    for (const amp of m.amplifies) {
      if (!mechanismIds.has(amp)) {
        issues.push({ severity: 'error', nodeId: m.id, message: `Mechanism amplifies unknown mechanism: ${amp}` });
      }
    }
    for (const mask of m.masks) {
      if (!mechanismIds.has(mask)) {
        issues.push({ severity: 'error', nodeId: m.id, message: `Mechanism masks unknown mechanism: ${mask}` });
      }
    }
  }

  if (!hasHonestBaseline) {
    issues.push({
      severity: 'error',
      message: 'Preservation Rule Violation: Registry must include honest-baseline mechanisms (honest_baseline: true)',
    });
  }

  // 3. Pattern references
  for (const p of bundle.patterns) {
    for (const aid of p.required_artifacts) {
      if (!artifactIds.has(aid)) {
        issues.push({ severity: 'error', nodeId: p.id, message: `Pattern references unknown required_artifact: ${aid}` });
      }
    }
    for (const mid of p.compatible_mechanisms) {
      if (!mechanismIds.has(mid)) {
        issues.push({ severity: 'error', nodeId: p.id, message: `Pattern references unknown compatible_mechanism: ${mid}` });
      }
    }
    for (const iid of p.interventions) {
      if (!interventionIds.has(iid)) {
        issues.push({ severity: 'error', nodeId: p.id, message: `Pattern references unknown intervention: ${iid}` });
      }
    }
  }

  // 4. Loop references
  for (const l of bundle.loops) {
    for (const mid of l.mechanisms) {
      if (!mechanismIds.has(mid)) {
        issues.push({ severity: 'error', nodeId: l.id, message: `Loop references unknown mechanism: ${mid}` });
      }
    }
    for (const edge of l.edges) {
      if (!mechanismIds.has(edge.from) || !mechanismIds.has(edge.to)) {
        issues.push({ severity: 'error', nodeId: l.id, message: `Loop edge references unknown mechanism: ${edge.from} -> ${edge.to}` });
      }
    }
  }

  // 5. Intervention references
  for (const i of bundle.interventions) {
    for (const target of i.targets) {
      if (!allIds.has(target)) {
        issues.push({ severity: 'error', nodeId: i.id, message: `Intervention targets unknown entity: ${target}` });
      }
    }
  }

  return issues;
}
