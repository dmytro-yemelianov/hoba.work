#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadRegistryFromRoot,
  readPackageVersion,
  resolveRegistryRoot,
  searchBundle,
  stageIdSchema,
  type GraphRelation,
} from '@hoba/registry';

// ---------------------------------------------------------------------------
// Startup: locate and load the registry once. All diagnostics go to stderr —
// stdout is reserved for the MCP stdio transport.
// ---------------------------------------------------------------------------
function readDirArg(): string | undefined {
  const idx = process.argv.indexOf('--dir');
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

const version = readPackageVersion(new URL('../package.json', import.meta.url));

let registryRoot: string;
try {
  registryRoot = resolveRegistryRoot({ explicit: readDirArg(), fromModuleUrl: import.meta.url });
} catch (error) {
  console.error(`[hoba-mcp] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const bundle = loadRegistryFromRoot(registryRoot);
const graph = new HOBAKnowledgeGraph(bundle);
const engine = new HOBADiagnosticEngine(bundle, graph);
console.error(`[hoba-mcp] v${version} — registry ${bundle.version} loaded from ${registryRoot}`);

// ---------------------------------------------------------------------------
// Shared argument schemas
// ---------------------------------------------------------------------------
const searchableTypeSchema = z.enum(['artifact', 'barrier', 'mechanism', 'pattern', 'loop', 'intervention']);
const relationSchema = z.enum(['operates_at', 'emits', 'amplifies', 'masks', 'precedes', 'instantiates', 'targets', 'mitigates']);
const stageArg = stageIdSchema.optional().describe(`Hiring funnel stage. One of: ${stageIdSchema.options.join(', ')}`);

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

/** Every response carries the registry version (spec §14). */
const ok = (payload: Record<string, unknown>): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify({ registry_version: bundle.version, ...payload }, null, 2) }],
});

const fail = (message: string): ToolResult => ({
  isError: true,
  content: [{ type: 'text', text: message }],
});

const METHODOLOGY = {
  protocol: {
    H: 'Hard facts: Capture direct observations and verifiable context. No intent speculation.',
    O: 'Obstacle: Localize the structural gate / barrier where the funnel stopped.',
    B: 'Behind the obstacle: Enumerate compatible mechanisms without false certainty.',
    A: 'Agency: Separate mechanisms by removability (candidate, intermediary, none) and emit bounded probes.',
  },
  epistemic_verbs: {
    Observed: 'Directly present in empirical evidence or submission event.',
    Compatible_with: 'Mechanism could produce observation; logical compatibility only.',
    Supported: 'Evidence raises confidence beyond mere compatibility.',
    Established: 'Verified causal claim supported by rigorous data.',
  },
  ontology: {
    artifact: 'A-xxx — observable signal received by a candidate (silence, template rejection, repost).',
    barrier: 'B-xxx — structural funnel gate; `precedes` edges form a strictly acyclic DAG.',
    mechanism: 'M-xxx — force operating at gates, classified by actor / nature / visibility / removability.',
    pattern: 'P-xxx — recurring contradiction motif that is useful to name without asserting a single hidden cause.',
    loop: 'L-xxx — persistent causal cycle among mechanisms, validated from graph SCCs.',
    intervention: 'I-xxx — proposed change targeting a mechanism, barrier, pattern or loop.',
    evidence: 'EVD-xxx — citation record backing evidence levels.',
  },
  non_goals: [
    'Not a company or recruiter blacklist.',
    'Not a "ghost job" accusation engine.',
    'Not a personal rejection diary.',
    'Not a coaching service promising employment outcomes.',
    'Not a legal discrimination determination tool.',
  ],
  core_rule:
    'When the signal is unclear, do not invent a story; pause, separate observation from interpretation, and map the system.',
} as const;

type MethodologyTopic = keyof typeof METHODOLOGY;
const methodologyTopics = Object.keys(METHODOLOGY) as MethodologyTopic[];

// ---------------------------------------------------------------------------
// Server & tools
// ---------------------------------------------------------------------------
const server = new McpServer({ name: 'hoba-mcp', version });

server.registerTool(
  'get_registry_info',
  {
    description: 'Registry release metadata (version, schema version) and entity counts.',
    inputSchema: {},
  },
  async () =>
    ok({
      schema_version: bundle.schema_version,
      updated_at: bundle.updated_at,
      mode: 'topological_uncalibrated',
      counts: {
        artifacts: bundle.artifacts.length,
        barriers: bundle.barriers.length,
        mechanisms: bundle.mechanisms.length,
        patterns: bundle.patterns.length,
        loops: bundle.loops.length,
        interventions: bundle.interventions.length,
        evidence: bundle.evidence.length,
      },
      stages: stageIdSchema.options,
    })
);

server.registerTool(
  'search_registry',
  {
    description:
      'Search across all entities in the hoba knowledge graph (Observations, Barriers, Mechanisms, Patterns, Loops, Interventions) by ID, title or summary.',
    inputSchema: {
      query: z.string().min(1).describe('Search term or keyword'),
      types: z.array(searchableTypeSchema).optional().describe('Optional entity types to filter by'),
      limit: z.number().int().positive().max(100).optional().describe('Maximum number of results (default 25)'),
    },
  },
  async ({ query, types, limit }) => {
    const hits = searchBundle(bundle, query, { types, limit: limit ?? 25 });
    return ok({
      count: hits.length,
      results: hits.map((h) => ({
        type: h.type,
        id: h.id,
        title: h.title,
        summary: h.text,
        status: h.node.status,
        evidence_level: h.node.evidence_level,
      })),
    });
  }
);

server.registerTool(
  'get_node',
  {
    description: 'Retrieve the full specification of an entity by its canonical ID (e.g. A-001, B-005, M-014, P-001, L-001, I-001, EVD-001).',
    inputSchema: { id: z.string().describe('Canonical hoba entity identifier') },
  },
  async ({ id }) => {
    const node = graph.getNode(id);
    if (!node) return fail(`Node ${id} not found in hoba registry.`);
    return ok({ node });
  }
);

server.registerTool(
  'explain_observation',
  {
    description:
      'Execute the hoba forensic analysis protocol (H → O → B → A) for one or more observed artifacts at an optional funnel stage. Returns compatible mechanisms, agency partition, probes and explicit non-inferences. Never asserts a single hidden cause.',
    inputSchema: {
      artifact_ids: z.array(z.string()).min(1).describe('Observed Artifact IDs (e.g. ["A-004"])'),
      stage: stageArg,
    },
  },
  async ({ artifact_ids, stage }) => {
    const analysis = engine.analyze({ artifacts: artifact_ids, stage });
    if (analysis.hard_facts.selected_artifacts.length === 0) {
      return fail(`None of the provided artifact IDs exist in the registry: ${artifact_ids.join(', ')}`);
    }
    return ok({ analysis });
  }
);

server.registerTool(
  'find_compatible_mechanisms',
  {
    description: 'Retrieve all mechanisms structurally compatible with a set of observed artifacts and an optional funnel stage, partitioned by candidate agency.',
    inputSchema: {
      artifact_ids: z.array(z.string()).min(1).describe('List of observed artifact IDs'),
      stage: stageArg,
    },
  },
  async ({ artifact_ids, stage }) => {
    const res = engine.analyze({ artifacts: artifact_ids, stage });
    return ok({
      unknown_artifact_ids: res.hard_facts.unknown_artifact_ids,
      mode: res.mode,
      compatible_mechanisms: res.behind.compatible_mechanisms,
      agency_partition: {
        agency_zone: res.agency.agency_zone,
        candidate_removable: res.agency.candidate_removable,
        intermediary_dependent: res.agency.intermediary_dependent,
        exogenous_no_agency: res.agency.exogenous_no_agency,
      },
      non_inferences: res.behind.non_inferences,
    });
  }
);

server.registerTool(
  'get_diagnostic_probes',
  {
    description: 'Retrieve the bounded, candidate-actionable diagnostic probes attached to an observed artifact.',
    inputSchema: { artifact_id: z.string().describe('Observed Artifact ID') },
  },
  async ({ artifact_id }) => {
    const node = graph.getNode(artifact_id);
    if (!node || node.type !== 'artifact') return fail(`Artifact ${artifact_id} not found in hoba registry.`);
    return ok({ artifact_id, probes: node.probes, non_inferences: node.non_inferences });
  }
);

server.registerTool(
  'find_patterns',
  {
    description:
      'Find recurring contradiction patterns whose required artifacts or compatible mechanisms intersect the given IDs. With no filters, lists every pattern.',
    inputSchema: {
      artifact_ids: z.array(z.string()).optional().describe('Optional list of artifact IDs'),
      mechanism_ids: z.array(z.string()).optional().describe('Optional list of mechanism IDs'),
    },
  },
  async ({ artifact_ids, mechanism_ids }) => {
    const artifacts = new Set(artifact_ids ?? []);
    const mechanisms = new Set(mechanism_ids ?? []);
    const filterApplied = artifacts.size + mechanisms.size > 0;
    const matched = filterApplied
      ? bundle.patterns.filter(
          (p) => p.required_artifacts.some((a) => artifacts.has(a)) || p.compatible_mechanisms.some((m) => mechanisms.has(m))
        )
      : bundle.patterns;
    return ok({ filter_applied: filterApplied, count: matched.length, patterns: matched });
  }
);

server.registerTool(
  'get_interventions',
  {
    description: 'Retrieve targeted system interventions designed to mitigate a barrier, mechanism, pattern or causal loop.',
    inputSchema: { target_id: z.string().describe('Target entity ID (e.g. M-004, B-001, P-001, L-001)') },
  },
  async ({ target_id }) => {
    if (!graph.getNode(target_id)) return fail(`Target ${target_id} not found in hoba registry.`);
    const interventions = bundle.interventions.filter((i) => i.targets.includes(target_id));
    return ok({ target_id, count: interventions.length, interventions });
  }
);

server.registerTool(
  'traverse_graph',
  {
    description: 'Traverse the knowledge graph from a node, with optional relation filter, direction and depth limits (max depth 5).',
    inputSchema: {
      start_id: z.string().describe('Starting node ID'),
      depth: z.number().int().min(1).max(5).optional().describe('Max traversal depth (default 1)'),
      direction: z.enum(['out', 'in', 'both']).optional().describe('Edge direction (default both)'),
      relations: z.array(relationSchema).optional().describe('Only follow these relation types'),
    },
  },
  async ({ start_id, depth, direction, relations }) => {
    if (!graph.getNode(start_id)) return fail(`Node ${start_id} not found in hoba registry.`);
    const res = graph.getNeighbors(start_id, { depth, direction, relations: relations as GraphRelation[] | undefined });
    return ok({
      start_id,
      neighbors_count: res.nodes.length - 1,
      nodes: res.nodes.map((n) => ({ id: n.id, type: n.type, title: n.title })),
      edges: res.edges,
    });
  }
);

server.registerTool(
  'get_methodology',
  {
    description: `Retrieve hoba methodology documentation. Topics: ${methodologyTopics.join(', ')}. Omit topic for everything.`,
    inputSchema: { topic: z.enum(methodologyTopics as [MethodologyTopic, ...MethodologyTopic[]]).optional() },
  },
  async ({ topic }) => ok(topic ? { topic, [topic]: METHODOLOGY[topic] } : { ...METHODOLOGY })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('[hoba-mcp] Fatal MCP Server error:', err);
  process.exit(1);
});
