import {
  ArtifactNode,
  BarrierNode,
  GraphEdge,
  InterventionNode,
  LoopNode,
  MechanismNode,
  PatternNode,
  RegistryBundle,
  RegistryGraph,
  RegistryNode,
} from './types.js';

export class HOBAKnowledgeGraph {
  public bundle: RegistryBundle;
  public nodeMap: Map<string, RegistryNode | any> = new Map();
  public edges: GraphEdge[] = [];
  public adjacency: Map<string, { target: string; edge: GraphEdge }[]> = new Map();
  public reverseAdjacency: Map<string, { source: string; edge: GraphEdge }[]> = new Map();

  constructor(bundle: RegistryBundle) {
    this.bundle = bundle;
    this.indexNodes();
    this.buildEdges();
  }

  private indexNodes() {
    for (const a of this.bundle.artifacts) this.nodeMap.set(a.id, a);
    for (const b of this.bundle.barriers) this.nodeMap.set(b.id, b);
    for (const m of this.bundle.mechanisms) this.nodeMap.set(m.id, m);
    for (const p of this.bundle.patterns) this.nodeMap.set(p.id, p);
    for (const l of this.bundle.loops) this.nodeMap.set(l.id, l);
    for (const i of this.bundle.interventions) this.nodeMap.set(i.id, i);
    for (const e of this.bundle.evidence) this.nodeMap.set(e.id, e);
  }

  private addEdge(
    source: string,
    target: string,
    type: GraphEdge['type'],
    meta: Partial<GraphEdge> = {}
  ) {
    const id = `${source}->${type}->${target}`;
    const edge: GraphEdge = {
      id,
      source,
      target,
      type,
      ...meta,
    };
    this.edges.push(edge);

    if (!this.adjacency.has(source)) this.adjacency.set(source, []);
    this.adjacency.get(source)!.push({ target, edge });

    if (!this.reverseAdjacency.has(target)) this.reverseAdjacency.set(target, []);
    this.reverseAdjacency.get(target)!.push({ source, edge });
  }

  private buildEdges() {
    this.edges = [];
    this.adjacency.clear();
    this.reverseAdjacency.clear();

    // 1. Barriers -> precedes
    for (const b of this.bundle.barriers) {
      for (const nextId of b.precedes) {
        this.addEdge(b.id, nextId, 'precedes');
      }
    }

    // 2. Mechanisms -> operates_at, emits, amplifies, masks
    for (const m of this.bundle.mechanisms) {
      for (const barrierId of m.operates_at) {
        this.addEdge(m.id, barrierId, 'operates_at');
      }
      for (const emission of m.emissions) {
        this.addEdge(m.id, emission.artifact, 'emits', {
          fidelity: emission.fidelity,
          likelihood: emission.likelihood,
        });
      }
      for (const amp of m.amplifies) {
        this.addEdge(m.id, amp, 'amplifies');
      }
      for (const mask of m.masks) {
        this.addEdge(m.id, mask, 'masks');
      }
    }

    // 3. Patterns -> instantiates
    for (const p of this.bundle.patterns) {
      for (const artId of p.required_artifacts) {
        this.addEdge(artId, p.id, 'instantiates');
      }
      for (const mechId of p.compatible_mechanisms) {
        this.addEdge(mechId, p.id, 'instantiates');
      }
    }

    // 4. Interventions -> targets, mitigates
    for (const i of this.bundle.interventions) {
      for (const targetId of i.targets) {
        const targetNode = this.nodeMap.get(targetId);
        if (targetNode?.type === 'pattern' || targetNode?.type === 'loop') {
          this.addEdge(i.id, targetId, 'mitigates');
        } else {
          this.addEdge(i.id, targetId, 'targets');
        }
      }
    }
  }

  public getNode(id: string): RegistryNode | undefined {
    return this.nodeMap.get(id);
  }

  public getNeighbors(id: string, options: { depth?: number; relations?: string[]; direction?: 'out' | 'in' | 'both' } = {}) {
    const depth = options.depth || 1;
    const direction = options.direction || 'both';
    const visitedNodes = new Set<string>([id]);
    const collectedEdges = new Set<GraphEdge>();

    let currentQueue = [id];

    for (let d = 0; d < depth; d++) {
      const nextQueue: string[] = [];
      for (const curr of currentQueue) {
        if (direction === 'out' || direction === 'both') {
          const outList = this.adjacency.get(curr) || [];
          for (const item of outList) {
            if (options.relations && !options.relations.includes(item.edge.type)) continue;
            collectedEdges.add(item.edge);
            if (!visitedNodes.has(item.target)) {
              visitedNodes.add(item.target);
              nextQueue.push(item.target);
            }
          }
        }
        if (direction === 'in' || direction === 'both') {
          const inList = this.reverseAdjacency.get(curr) || [];
          for (const item of inList) {
            if (options.relations && !options.relations.includes(item.edge.type)) continue;
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
      .filter((n): n is RegistryNode => Boolean(n));

    return {
      nodes,
      edges: Array.from(collectedEdges),
    };
  }

  public findPath(fromId: string, toId: string, maxDepth: number = 6): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();

    const dfs = (current: string, target: string, path: string[], depth: number) => {
      if (depth > maxDepth) return;
      if (current === target) {
        paths.push([...path, target]);
        return;
      }

      visited.add(current);
      const neighbors = this.adjacency.get(current) || [];
      for (const { target: next } of neighbors) {
        if (!visited.has(next)) {
          dfs(next, target, [...path, current], depth + 1);
        }
      }
      visited.delete(current);
    };

    dfs(fromId, toId, [], 0);
    return paths;
  }

  /**
   * Validate that Barrier graph formed by `precedes` is strictly acyclic (DAG)
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
        inDegree.set(next, (inDegree.get(next) || 0) + 1);
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
   * Tarjan's Strongly Connected Components (SCC) algorithm for Mechanism causal cycles
   */
  public findMechanismSCCs(): string[][] {
    let index = 0;
    const indices = new Map<string, number>();
    const lowlinks = new Map<string, number>();
    const onStack = new Set<string>();
    const stack: string[] = [];
    const sccs: string[][] = [];

    // Filter mechanisms and amplifies/masks relations
    const mechIds = new Set(this.bundle.mechanisms.map((m) => m.id));
    const mechAdj = new Map<string, string[]>();
    for (const m of this.bundle.mechanisms) {
      const targets = [
        ...m.amplifies.filter((id) => mechIds.has(id)),
        ...m.masks.filter((id) => mechIds.has(id)),
      ];
      mechAdj.set(m.id, targets);
    }

    const strongConnect = (v: string) => {
      indices.set(v, index);
      lowlinks.set(v, index);
      index++;
      stack.push(v);
      onStack.add(v);

      const neighbors = mechAdj.get(v) || [];
      for (const w of neighbors) {
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

        if (scc.length > 1) {
          sccs.push(scc);
        }
      }
    };

    for (const id of mechIds) {
      if (!indices.has(id)) {
        strongConnect(id);
      }
    }

    return sccs;
  }

  public toCytoscapeJSON(): { elements: { nodes: any[]; edges: any[] } } {
    const nodes = [
      ...this.bundle.artifacts.map((a) => ({
        data: {
          id: a.id,
          label: a.title,
          type: 'artifact',
          evidence_level: a.evidence_level,
          stages: a.stages,
        },
        classes: 'node-artifact',
      })),
      ...this.bundle.barriers.map((b) => ({
        data: {
          id: b.id,
          label: b.title,
          type: 'barrier',
          stage: b.stage,
          order: b.order,
          evidence_level: b.evidence_level,
        },
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
        data: {
          id: p.id,
          label: p.title,
          type: 'pattern',
          evidence_level: p.evidence_level,
        },
        classes: 'node-pattern',
      })),
      ...this.bundle.loops.map((l) => ({
        data: {
          id: l.id,
          label: l.title,
          type: 'loop',
          evidence_level: l.evidence_level,
        },
        classes: 'node-loop',
      })),
      ...this.bundle.interventions.map((i) => ({
        data: {
          id: i.id,
          label: i.title,
          type: 'intervention',
          actor: i.actor,
          cost: i.cost,
          evidence_level: i.evidence_level,
        },
        classes: 'node-intervention',
      })),
    ];

    const edges = this.edges.map((e) => ({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        fidelity: e.fidelity,
        likelihood: e.likelihood,
      },
      classes: `edge-${e.type}`,
    }));

    return { elements: { nodes, edges } };
  }

  public toGraphML(): string {
    const cytoscape = this.toCytoscapeJSON();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
    http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="d_label" for="node" attr.name="label" attr.type="string"/>
  <key id="d_type" for="node" attr.name="type" attr.type="string"/>
  <key id="d_evidence" for="node" attr.name="evidence_level" attr.type="string"/>
  <key id="d_edge_type" for="edge" attr.name="relation" attr.type="string"/>
  <graph id="HOBA" edgedefault="directed">\n`;

    for (const node of cytoscape.elements.nodes) {
      const d = node.data;
      xml += `    <node id="${d.id}">\n`;
      xml += `      <data key="d_label">${this.escapeXml(d.label)}</data>\n`;
      xml += `      <data key="d_type">${d.type}</data>\n`;
      xml += `      <data key="d_evidence">${d.evidence_level || 'supported'}</data>\n`;
      xml += `    </node>\n`;
    }

    for (const edge of cytoscape.elements.edges) {
      const d = edge.data;
      xml += `    <edge id="${d.id}" source="${d.source}" target="${d.target}">\n`;
      xml += `      <data key="d_edge_type">${d.type}</data>\n`;
      xml += `    </edge>\n`;
    }

    xml += `  </graph>\n</graphml>`;
    return xml;
  }

  public toCSV(): { nodesCSV: string; edgesCSV: string } {
    let nodesCSV = 'id,type,title,evidence_level,stage,removability,nature,actor\n';
    for (const a of this.bundle.artifacts) {
      nodesCSV += `"${a.id}","artifact","${this.escapeCSV(a.title)}","${a.evidence_level}","${a.stages.join(';')}",,"",\n`;
    }
    for (const b of this.bundle.barriers) {
      nodesCSV += `"${b.id}","barrier","${this.escapeCSV(b.title)}","${b.evidence_level}","${b.stage}",,"",\n`;
    }
    for (const m of this.bundle.mechanisms) {
      nodesCSV += `"${m.id}","mechanism","${this.escapeCSV(m.title)}","${m.evidence_level}",,"${m.facets.removability}","${m.facets.nature}","${m.facets.actor}"\n`;
    }
    for (const p of this.bundle.patterns) {
      nodesCSV += `"${p.id}","pattern","${this.escapeCSV(p.title)}","${p.evidence_level}",,,,\n`;
    }
    for (const l of this.bundle.loops) {
      nodesCSV += `"${l.id}","loop","${this.escapeCSV(l.title)}","${l.evidence_level}",,,,\n`;
    }
    for (const i of this.bundle.interventions) {
      nodesCSV += `"${i.id}","intervention","${this.escapeCSV(i.title)}","${i.evidence_level}",,,,${i.actor}\n`;
    }

    let edgesCSV = 'id,source,target,type,fidelity,likelihood\n';
    for (const e of this.edges) {
      edgesCSV += `"${e.id}","${e.source}","${e.target}","${e.type}","${e.fidelity || ''}","${e.likelihood || ''}"\n`;
    }

    return { nodesCSV, edgesCSV };
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private escapeCSV(str: string): string {
    return str.replace(/"/g, '""');
  }
}
