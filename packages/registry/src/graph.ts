import type { AnyRecord, GraphEdge, GraphRelation, RegistryBundle } from './types.js';

export interface NeighborhoodOptions {
  depth?: number;
  relations?: GraphRelation[];
  direction?: 'out' | 'in' | 'both';
}

export class HOBAKnowledgeGraph {
  public readonly bundle: RegistryBundle;
  public readonly nodeMap: Map<string, AnyRecord> = new Map();
  public readonly edges: GraphEdge[] = [];
  public readonly adjacency: Map<string, { target: string; edge: GraphEdge }[]> = new Map();
  public readonly reverseAdjacency: Map<string, { source: string; edge: GraphEdge }[]> = new Map();

  constructor(bundle: RegistryBundle) {
    this.bundle = bundle;
    this.indexNodes();
    this.buildEdges();
  }

  private indexNodes() {
    const collections = [
      this.bundle.observations,
      this.bundle.barriers,
      this.bundle.mechanisms,
      this.bundle.patterns,
      this.bundle.loops,
      this.bundle.interventions,
      this.bundle.evidence,
    ];
    for (const coll of collections) {
      for (const item of coll) {
        this.nodeMap.set(item.id, item);
        for (const alias of (item as { aliases?: string[] }).aliases ?? []) {
          this.nodeMap.set(alias, item);
        }
      }
    }
  }

  private addEdge(source: string, target: string, type: GraphRelation, meta: Partial<GraphEdge> = {}) {
    const edge: GraphEdge = { id: `${source}->${type}->${target}`, source, target, type, ...meta };
    this.edges.push(edge);

    if (!this.adjacency.has(source)) this.adjacency.set(source, []);
    this.adjacency.get(source)!.push({ target, edge });

    if (!this.reverseAdjacency.has(target)) this.reverseAdjacency.set(target, []);
    this.reverseAdjacency.get(target)!.push({ source, edge });
  }

  private buildEdges() {
    // 1. Barriers -> precedes
    for (const b of this.bundle.barriers) {
      for (const nextId of b.precedes) this.addEdge(b.id, nextId, 'precedes');
    }

    // 2. Mechanisms -> operates_at, emits, amplifies, masks
    for (const m of this.bundle.mechanisms) {
      for (const barrierId of m.operates_at) this.addEdge(m.id, barrierId, 'operates_at');
      for (const emission of m.emissions) {
        this.addEdge(m.id, emission.artifact, 'emits', {
          fidelity: emission.fidelity,
          likelihood: emission.likelihood,
        });
      }
      for (const amp of m.amplifies) this.addEdge(m.id, amp, 'amplifies');
      for (const mask of m.masks) this.addEdge(m.id, mask, 'masks');
    }

    // 3. Artifacts / Mechanisms -> instantiates -> Pattern
    for (const p of this.bundle.patterns) {
      for (const artId of p.required_artifacts) this.addEdge(artId, p.id, 'instantiates');
      for (const mechId of p.compatible_mechanisms) this.addEdge(mechId, p.id, 'instantiates');
    }

    // 4. Interventions -> targets (Mechanism/Barrier) | mitigates (Pattern/Loop)
    for (const i of this.bundle.interventions) {
      for (const targetId of i.targets) {
        const targetNode = this.nodeMap.get(targetId);
        const relation: GraphRelation =
          targetNode?.type === 'pattern' || targetNode?.type === 'loop' ? 'mitigates' : 'targets';
        this.addEdge(i.id, targetId, relation);
      }
    }
  }

  public getNode(id: string): AnyRecord | undefined {
    return this.nodeMap.get(id);
  }

  /** Breadth-first neighbourhood of `id` up to `depth` hops. */
  public getNeighbors(id: string, options: NeighborhoodOptions = {}): { nodes: AnyRecord[]; edges: GraphEdge[] } {
    const depth = Math.max(1, options.depth ?? 1);
    const direction = options.direction ?? 'both';
    const relations = options.relations ? new Set<GraphRelation>(options.relations) : undefined;
    const visitedNodes = new Set<string>([id]);
    const collectedEdges = new Set<GraphEdge>();

    let currentQueue = [id];

    for (let d = 0; d < depth && currentQueue.length > 0; d++) {
      const nextQueue: string[] = [];
      for (const curr of currentQueue) {
        if (direction === 'out' || direction === 'both') {
          for (const item of this.adjacency.get(curr) ?? []) {
            if (relations && !relations.has(item.edge.type)) continue;
            collectedEdges.add(item.edge);
            if (!visitedNodes.has(item.target)) {
              visitedNodes.add(item.target);
              nextQueue.push(item.target);
            }
          }
        }
        if (direction === 'in' || direction === 'both') {
          for (const item of this.reverseAdjacency.get(curr) ?? []) {
            if (relations && !relations.has(item.edge.type)) continue;
            collectedEdges.add(item.edge);
            if (!visitedNodes.has(item.source)) {
              visitedNodes.add(item.source);
              nextQueue.push(item.source);
            }
          }
        }
      }
      currentQueue = nextQueue;
    }

    const nodes = Array.from(visitedNodes)
      .map((nid) => this.getNode(nid))
      .filter((n): n is AnyRecord => Boolean(n));

    return { nodes, edges: Array.from(collectedEdges) };
  }

  /** All simple directed paths from `fromId` to `toId` (outbound edges only), bounded by `maxDepth`. */
  public findPath(fromId: string, toId: string, maxDepth: number = 6): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, path: string[], depth: number) => {
      if (depth > maxDepth) return;
      if (current === toId) {
        paths.push([...path, toId]);
        return;
      }

      visited.add(current);
      for (const { target: next } of this.adjacency.get(current) ?? []) {
        if (!visited.has(next)) dfs(next, [...path, current], depth + 1);
      }
      visited.delete(current);
    };

    dfs(fromId, [], 0);
    return paths;
  }

  /**
   * Validate that the Barrier graph formed by `precedes` is strictly acyclic (DAG)
   * and return its topological order (Kahn's algorithm).
   */
  public validateBarrierDAG(): { valid: boolean; error?: string; sorted?: string[] } {
    const barrierIds = new Set(this.bundle.barriers.map((b) => b.id));
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const b of this.bundle.barriers) {
      inDegree.set(b.id, 0);
      adj.set(b.id, []);
    }

    for (const b of this.bundle.barriers) {
      for (const next of b.precedes) {
        if (!barrierIds.has(next)) {
          return { valid: false, error: `Barrier ${b.id} precedes non-existent barrier ${next}` };
        }
        adj.get(b.id)!.push(next);
        inDegree.set(next, (inDegree.get(next) ?? 0) + 1);
      }
    }

    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }

    const sorted: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      sorted.push(u);
      for (const v of adj.get(u)!) {
        const newDeg = inDegree.get(v)! - 1;
        inDegree.set(v, newDeg);
        if (newDeg === 0) queue.push(v);
      }
    }

    if (sorted.length !== barrierIds.size) {
      return { valid: false, error: 'Barrier funnel graph contains cycles! Must be strictly acyclic (DAG).' };
    }

    return { valid: true, sorted };
  }

  /**
   * Tarjan's Strongly Connected Components over the Mechanism `amplifies`/`masks`
   * graph. Only non-trivial components (size > 1) are returned — these are the
   * causal cycles that Loop nodes must correspond to.
   */
  public findMechanismSCCs(): string[][] {
    let index = 0;
    const indices = new Map<string, number>();
    const lowlinks = new Map<string, number>();
    const onStack = new Set<string>();
    const stack: string[] = [];
    const sccs: string[][] = [];

    const mechIds = new Set(this.bundle.mechanisms.map((m) => m.id));
    const mechAdj = new Map<string, string[]>();
    for (const m of this.bundle.mechanisms) {
      mechAdj.set(m.id, [...m.amplifies, ...m.masks].filter((id) => mechIds.has(id)));
    }

    const strongConnect = (v: string) => {
      indices.set(v, index);
      lowlinks.set(v, index);
      index++;
      stack.push(v);
      onStack.add(v);

      for (const w of mechAdj.get(v) ?? []) {
        if (!indices.has(w)) {
          strongConnect(w);
          lowlinks.set(v, Math.min(lowlinks.get(v)!, lowlinks.get(w)!));
        } else if (onStack.has(w)) {
          lowlinks.set(v, Math.min(lowlinks.get(v)!, indices.get(w)!));
        }
      }

      if (lowlinks.get(v) === indices.get(v)) {
        const scc: string[] = [];
        let w: string;
        do {
          w = stack.pop()!;
          onStack.delete(w);
          scc.push(w);
        } while (w !== v);

        if (scc.length > 1) sccs.push(scc);
      }
    };

    for (const id of mechIds) {
      if (!indices.has(id)) strongConnect(id);
    }

    return sccs;
  }

  public toCytoscapeJSON(): { elements: { nodes: CytoscapeNode[]; edges: CytoscapeEdge[] } } {
    const nodes: CytoscapeNode[] = [
      ...this.bundle.observations.map((a) => ({
        data: { id: a.id, label: a.title, type: 'observation', evidence_level: a.evidence_level, stages: a.stages },
        classes: 'node-artifact',
      })),
      ...this.bundle.barriers.map((b) => ({
        data: { id: b.id, label: b.title, type: 'barrier', stage: b.stage, order: b.order, evidence_level: b.evidence_level },
        classes: 'node-barrier',
      })),
      ...this.bundle.mechanisms.map((m) => ({
        data: {
          id: m.id,
          label: m.title,
          type: 'mechanism',
          actor: m.facets.actor,
          nature: m.facets.nature,
          visibility: m.facets.visibility,
          removability: m.facets.removability,
          honest_baseline: m.honest_baseline,
          evidence_level: m.evidence_level,
        },
        classes: `node-mechanism removability-${m.facets.removability}`,
      })),
      ...this.bundle.patterns.map((p) => ({
        data: { id: p.id, label: p.title, type: 'pattern', evidence_level: p.evidence_level },
        classes: 'node-pattern',
      })),
      ...this.bundle.loops.map((l) => ({
        data: { id: l.id, label: l.title, type: 'loop', evidence_level: l.evidence_level },
        classes: 'node-loop',
      })),
      ...this.bundle.interventions.map((i) => ({
        data: { id: i.id, label: i.title, type: 'intervention', actor: i.actor, cost: i.cost, evidence_level: i.evidence_level },
        classes: 'node-intervention',
      })),
    ];

    const edges: CytoscapeEdge[] = this.edges.map((e) => ({
      data: { id: e.id, source: e.source, target: e.target, type: e.type, fidelity: e.fidelity, likelihood: e.likelihood },
      classes: `edge-${e.type}`,
    }));

    return { elements: { nodes, edges } };
  }

  public toGraphML(): string {
    const { nodes, edges } = this.toCytoscapeJSON().elements;
    const lines: string[] = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<graphml xmlns="http://graphml.graphdrawing.org/xmlns"',
      '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      '    xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns',
      '    http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
      '  <key id="d_label" for="node" attr.name="label" attr.type="string"/>',
      '  <key id="d_type" for="node" attr.name="type" attr.type="string"/>',
      '  <key id="d_evidence" for="node" attr.name="evidence_level" attr.type="string"/>',
      '  <key id="d_edge_type" for="edge" attr.name="relation" attr.type="string"/>',
      '  <graph id="HOBA" edgedefault="directed">',
    ];

    for (const { data: d } of nodes) {
      lines.push(`    <node id="${escapeXml(d.id)}">`);
      lines.push(`      <data key="d_label">${escapeXml(d.label)}</data>`);
      lines.push(`      <data key="d_type">${escapeXml(d.type)}</data>`);
      lines.push(`      <data key="d_evidence">${escapeXml(d.evidence_level)}</data>`);
      lines.push('    </node>');
    }

    for (const { data: d } of edges) {
      lines.push(`    <edge id="${escapeXml(d.id)}" source="${escapeXml(d.source)}" target="${escapeXml(d.target)}">`);
      lines.push(`      <data key="d_edge_type">${escapeXml(d.type)}</data>`);
      lines.push('    </edge>');
    }

    lines.push('  </graph>', '</graphml>');
    return lines.join('\n');
  }

  public toCSV(): { nodesCSV: string; edgesCSV: string } {
    const nodeRows: (string | number | undefined)[][] = [
      ['id', 'type', 'title', 'evidence_level', 'stage', 'removability', 'nature', 'actor'],
      ...this.bundle.observations.map((a) => [a.id, 'observation', a.title, a.evidence_level, a.stages.join(';'), '', '', '']),
      ...this.bundle.barriers.map((b) => [b.id, 'barrier', b.title, b.evidence_level, b.stage, '', '', '']),
      ...this.bundle.mechanisms.map((m) => [
        m.id,
        'mechanism',
        m.title,
        m.evidence_level,
        '',
        m.facets.removability,
        m.facets.nature,
        m.facets.actor,
      ]),
      ...this.bundle.patterns.map((p) => [p.id, 'pattern', p.title, p.evidence_level, '', '', '', '']),
      ...this.bundle.loops.map((l) => [l.id, 'loop', l.title, l.evidence_level, '', '', '', '']),
      ...this.bundle.interventions.map((i) => [i.id, 'intervention', i.title, i.evidence_level, '', '', '', i.actor]),
    ];

    const edgeRows: (string | number | undefined | null)[][] = [
      ['id', 'source', 'target', 'type', 'fidelity', 'likelihood'],
      ...this.edges.map((e) => [e.id, e.source, e.target, e.type, e.fidelity ?? '', e.likelihood ?? '']),
    ];

    return { nodesCSV: toCsv(nodeRows), edgesCSV: toCsv(edgeRows) };
  }
}

export interface CytoscapeNode {
  data: { id: string; label: string; type: string; evidence_level: string; [key: string]: unknown };
  classes: string;
}

export interface CytoscapeEdge {
  data: { id: string; source: string; target: string; type: GraphRelation; [key: string]: unknown };
  classes: string;
}

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 4180 CSV: every field quoted, embedded quotes doubled, CRLF-free output. */
function toCsv(rows: (string | number | undefined | null)[][]): string {
  return rows.map((row) => row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n') + '\n';
}
