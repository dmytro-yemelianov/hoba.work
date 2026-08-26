import { describe, expect, it } from 'vitest';
import path from 'node:path';
import {
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadRegistryFromDirectory,
  validateRegistryBundle,
} from '@hoba/registry';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');
const evidenceDir = path.join(rootDir, 'evidence');

describe('HOBA Knowledge Graph & Registry Tests', () => {
  const bundle = loadRegistryFromDirectory(contentDir, evidenceDir);
  const graph = new HOBAKnowledgeGraph(bundle);
  const engine = new HOBADiagnosticEngine(bundle, graph);

  it('should load bundle and satisfy all validation rules with zero errors', () => {
    const issues = validateRegistryBundle(bundle);
    expect(issues).toEqual([]);
    expect(bundle.barriers.length).toBeGreaterThanOrEqual(10);
    expect(bundle.mechanisms.length).toBeGreaterThanOrEqual(22);
    expect(bundle.artifacts.length).toBeGreaterThanOrEqual(12);
    expect(bundle.patterns.length).toBeGreaterThanOrEqual(4);
    expect(bundle.loops.length).toBeGreaterThanOrEqual(3);
    expect(bundle.interventions.length).toBeGreaterThanOrEqual(5);
  });

  it('should preserve honest-baseline mechanisms', () => {
    const honestBaselines = bundle.mechanisms.filter((m) => m.honest_baseline);
    expect(honestBaselines.length).toBeGreaterThanOrEqual(1);
    expect(honestBaselines.some((m) => m.id === 'M-001')).toBe(true);
  });

  it('should enforce strictly acyclic DAG on Barriers', () => {
    const dagRes = graph.validateBarrierDAG();
    expect(dagRes.valid).toBe(true);
    expect(dagRes.sorted).toBeDefined();
    expect(dagRes.sorted?.length).toBe(bundle.barriers.length);
  });

  it('should discover SCC loops in Mechanism amplifies graph', () => {
    const sccs = graph.findMechanismSCCs();
    expect(sccs.length).toBeGreaterThanOrEqual(1);
  });

  it('should run HOBA Diagnostic Engine and produce structured 4-step decomposition', () => {
    const result = engine.analyze({
      artifacts: ['A-004'],
      stage: 'technical',
    });

    expect(result.mode).toBe('topological_uncalibrated');
    expect(result.hard_facts.selected_artifacts.length).toBe(1);
    expect(result.obstacle.identified_barriers.length).toBeGreaterThan(0);
    expect(result.behind.compatible_mechanisms.length).toBeGreaterThan(0);
    expect(result.agency.diagnostic_probes.length).toBeGreaterThan(0);
    expect(result.agency.agency_zone).toBeDefined();
    expect(result.epistemic_disclaimer).toContain('Topological / Uncalibrated Analysis');
  });

  it('should generate valid Cytoscape, GraphML, and CSV exports', () => {
    const cyto = graph.toCytoscapeJSON();
    expect(cyto.elements.nodes.length).toBeGreaterThan(0);
    expect(cyto.elements.edges.length).toBeGreaterThan(0);

    const graphml = graph.toGraphML();
    expect(graphml).toContain('<graphml');
    expect(graphml).toContain('</graphml>');

    const { nodesCSV, edgesCSV } = graph.toCSV();
    expect(nodesCSV).toContain('M-001');
    expect(edgesCSV).toContain('operates_at');
  });
});
