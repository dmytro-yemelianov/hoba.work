/**
 * Integration checks over the real registry content (content/, content-uk/, evidence/).
 */
import { describe, expect, it } from 'vitest';
import {
  compareBundleStructure,
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadRegistryFromRoot,
  validateRegistry,
} from '@hoba/registry';
import { REPO_ROOT } from './helpers';

const bundle = loadRegistryFromRoot(REPO_ROOT, 'en');
const uk = loadRegistryFromRoot(REPO_ROOT, 'uk');
const graph = new HOBAKnowledgeGraph(bundle);
const engine = new HOBADiagnosticEngine(bundle, graph);

describe('registry content', () => {
  it('loads with zero validation errors and meets the seed taxonomy targets (spec §24)', () => {
    const report = validateRegistry(bundle);
    expect(report.errors).toEqual([]);
    expect(bundle.barriers.length).toBeGreaterThanOrEqual(10);
    expect(bundle.mechanisms.length).toBeGreaterThanOrEqual(22);
    expect(bundle.artifacts.length).toBeGreaterThanOrEqual(12);
    expect(bundle.patterns.length).toBeGreaterThanOrEqual(4);
    expect(bundle.loops.length).toBeGreaterThanOrEqual(3);
    expect(bundle.interventions.length).toBeGreaterThanOrEqual(5);
  });

  it('preserves honest-baseline mechanisms including M-001', () => {
    const honest = bundle.mechanisms.filter((m) => m.honest_baseline);
    expect(honest.length).toBeGreaterThanOrEqual(1);
    expect(honest.some((m) => m.id === 'M-001')).toBe(true);
  });

  it('keeps the barrier funnel strictly acyclic', () => {
    const dag = graph.validateBarrierDAG();
    expect(dag.valid).toBe(true);
    expect(dag.sorted).toHaveLength(bundle.barriers.length);
  });

  it('has at least one declared mechanism cycle backing a loop', () => {
    const sccs = graph.findMechanismSCCs();
    expect(sccs.length).toBeGreaterThanOrEqual(1);
    expect(bundle.loops.some((l) => sccs.some((scc) => l.mechanisms.every((m) => scc.includes(m))))).toBe(true);
  });

  it('runs the protocol end-to-end for a reposted-role observation', () => {
    const result = engine.analyze({ artifacts: ['A-004'], stage: 'technical' });
    expect(result.mode).toBe('topological_uncalibrated');
    expect(result.hard_facts.selected_artifacts).toHaveLength(1);
    expect(result.hard_facts.unknown_artifact_ids).toEqual([]);
    expect(result.obstacle.identified_barriers.length).toBeGreaterThan(0);
    expect(result.behind.compatible_mechanisms.length).toBeGreaterThan(0);
    expect(result.agency.diagnostic_probes.length).toBeGreaterThan(0);
    expect(result.agency.agency_zone).not.toBe('undetermined');
  });

  it('produces well-formed Cytoscape, GraphML and CSV exports', () => {
    const cyto = graph.toCytoscapeJSON();
    expect(cyto.elements.nodes.length).toBeGreaterThan(0);
    const nodeIds = new Set(cyto.elements.nodes.map((n) => n.data.id));
    for (const e of cyto.elements.edges) {
      expect(nodeIds.has(e.data.source)).toBe(true);
      expect(nodeIds.has(e.data.target)).toBe(true);
    }
    expect(new Set(cyto.elements.edges.map((e) => e.data.id)).size).toBe(cyto.elements.edges.length);

    const graphml = graph.toGraphML();
    expect(graphml.startsWith('<?xml')).toBe(true);
    expect(graphml.trim().endsWith('</graphml>')).toBe(true);

    const { nodesCSV, edgesCSV } = graph.toCSV();
    const header = nodesCSV.split('\n')[0].split(',').length;
    for (const line of nodesCSV.trim().split('\n')) expect(line.split('","').length).toBe(header);
    expect(edgesCSV).toContain('"operates_at"');
  });

  it('keeps the Ukrainian mirror structurally identical to the canonical content', () => {
    const uk = loadRegistryFromRoot(REPO_ROOT, 'uk');
    expect(validateRegistry(uk).errors).toEqual([]);
    expect(compareBundleStructure(bundle, uk)).toEqual([]);
  });
});

describe('specimens', () => {
  const readerFacing = (b: typeof bundle) =>
    [...b.artifacts, ...b.barriers, ...b.mechanisms, ...b.patterns, ...b.loops, ...b.interventions];

  it('covers every entity in the registry, in both languages', () => {
    for (const b of [bundle, uk]) {
      const missing = readerFacing(b).filter((node) => node.specimens.length === 0);
      expect(missing.map((n) => n.id)).toEqual([]);
    }
  });

  it('keeps the two mirrors structurally identical', () => {
    const shape = (b: typeof bundle) =>
      readerFacing(b)
        .map((n) => `${n.id}:${n.specimens.map((s) => `${s.kind}/${s.lines.length}`).join(',')}`)
        .sort();
    expect(shape(uk)).toEqual(shape(bundle));
  });

  it('marks the line each specimen is about, and says what to notice', () => {
    for (const node of readerFacing(bundle)) {
      for (const specimen of node.specimens) {
        expect(specimen.lines.some((line) => line.tell), `${node.id} ${specimen.label}`).toBe(true);
        expect(specimen.reading, `${node.id} ${specimen.label}`).toBeTruthy();
      }
    }
  });

  it('names no real company or person', () => {
    // Specimens are composites. A named employer would turn the atlas into the
    // blacklist its own methodology says it must not be.
    const forbidden = /\b(Google|Meta|Amazon|Microsoft|Apple|Netflix|Uber|Stripe|Revolut|Monobank|PrivatBank|EPAM|SoftServe|Luxoft)\b/i;
    for (const b of [bundle, uk]) {
      for (const node of readerFacing(b)) {
        for (const specimen of node.specimens) {
          const text = [specimen.label, specimen.subject, specimen.context, specimen.reading, ...specimen.lines.map((l) => `${l.speaker ?? ''} ${l.text}`)].join(' ');
          expect(forbidden.test(text), `${node.id}: ${text.slice(0, 80)}`).toBe(false);
        }
      }
    }
  });
});
