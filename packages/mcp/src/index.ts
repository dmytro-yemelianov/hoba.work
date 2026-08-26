#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadRegistryFromDirectory,
  RegistryBundle,
} from '@hoba/registry';

// Resolve content directory
function getBundle(): RegistryBundle {
  const root = process.cwd();
  let contentDir = path.join(root, 'content');
  let evidenceDir = path.join(root, 'evidence');

  if (!fs.existsSync(contentDir)) {
    contentDir = path.resolve(root, '..', '..', 'content');
    evidenceDir = path.resolve(root, '..', '..', 'evidence');
  }

  return loadRegistryFromDirectory(contentDir, evidenceDir);
}

const bundle = getBundle();
const graph = new HOBAKnowledgeGraph(bundle);
const engine = new HOBADiagnosticEngine(bundle, graph);

const server = new Server(
  {
    name: 'hoba-mcp',
    version: '0.4.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_registry',
        description: 'Search across all entities in the HOBA knowledge graph (Observations, Barriers, Mechanisms, Patterns, Loops, Interventions)',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term or keyword' },
            types: {
              type: 'array',
              items: { type: 'string', enum: ['artifact', 'barrier', 'mechanism', 'pattern', 'loop', 'intervention'] },
              description: 'Optional entity types to filter by'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_node',
        description: 'Retrieve full specification of an entity by its canonical ID (e.g. A-001, B-005, M-014, P-001, L-001, I-001)',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Canonical HOBA entity identifier' }
          },
          required: ['id']
        }
      },
      {
        name: 'explain_observation',
        description: 'Execute forensic HOBA Analysis protocol for an observed signal at an optional hiring stage',
        inputSchema: {
          type: 'object',
          properties: {
            artifact_id: { type: 'string', description: 'Observed Artifact ID (e.g. A-004)' },
            stage: { type: 'string', description: 'Hiring funnel stage (e.g. screening, technical, team, offer)' }
          },
          required: ['artifact_id']
        }
      },
      {
        name: 'find_compatible_mechanisms',
        description: 'Retrieve all mechanisms structurally compatible with a set of observed artifacts and funnel stages',
        inputSchema: {
          type: 'object',
          properties: {
            artifact_ids: { type: 'array', items: { type: 'string' }, description: 'List of observed artifact IDs' },
            stage: { type: 'string', description: 'Hiring funnel stage' }
          },
          required: ['artifact_ids']
        }
      },
      {
        name: 'get_diagnostic_probes',
        description: 'Retrieve candidate-actionable diagnostic probes to test underlying mechanisms without assumptions',
        inputSchema: {
          type: 'object',
          properties: {
            artifact_id: { type: 'string', description: 'Observed Artifact ID' }
          },
          required: ['artifact_id']
        }
      },
      {
        name: 'find_patterns',
        description: 'Find recurring graph contradiction patterns matching observed artifacts or mechanisms',
        inputSchema: {
          type: 'object',
          properties: {
            artifact_ids: { type: 'array', items: { type: 'string' }, description: 'Optional list of artifact IDs' },
            mechanism_ids: { type: 'array', items: { type: 'string' }, description: 'Optional list of mechanism IDs' }
          }
        }
      },
      {
        name: 'get_interventions',
        description: 'Retrieve targeted system interventions designed to mitigate a barrier, mechanism, or causal loop',
        inputSchema: {
          type: 'object',
          properties: {
            target_id: { type: 'string', description: 'Target entity ID (e.g. M-004, B-001, L-001)' }
          },
          required: ['target_id']
        }
      },
      {
        name: 'traverse_graph',
        description: 'Traverse the knowledge graph starting from a node with given relation and depth limits',
        inputSchema: {
          type: 'object',
          properties: {
            start_id: { type: 'string', description: 'Starting node ID' },
            depth: { type: 'number', description: 'Max traversal depth (default: 1)' },
            direction: { type: 'string', enum: ['out', 'in', 'both'], description: 'Edge direction' }
          },
          required: ['start_id']
        }
      },
      {
        name: 'get_methodology',
        description: 'Retrieve HOBA methodology, epistemic verbs, honest-baseline rules, and ontology documentation',
        inputSchema: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'Optional topic (e.g. ontology, protocol, epistemic_rules, non_goals)' }
          }
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_registry': {
        const query = String(args?.query || '').toLowerCase();
        const types = args?.types as string[] | undefined;

        const results: any[] = [];
        const match = (item: any) =>
          item.id.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          (item.summary && item.summary.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query));

        if (!types || types.includes('artifact')) {
          results.push(...bundle.artifacts.filter(match));
        }
        if (!types || types.includes('barrier')) {
          results.push(...bundle.barriers.filter(match));
        }
        if (!types || types.includes('mechanism')) {
          results.push(...bundle.mechanisms.filter(match));
        }
        if (!types || types.includes('pattern')) {
          results.push(...bundle.patterns.filter(match));
        }
        if (!types || types.includes('loop')) {
          results.push(...bundle.loops.filter(match));
        }
        if (!types || types.includes('intervention')) {
          results.push(...bundle.interventions.filter(match));
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ registry_version: bundle.version, count: results.length, results }, null, 2),
            },
          ],
        };
      }

      case 'get_node': {
        const id = String(args?.id || '');
        const node = graph.getNode(id);
        if (!node) {
          return { isError: true, content: [{ type: 'text', text: `Node ${id} not found in HOBA registry.` }] };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify({ registry_version: bundle.version, node }, null, 2) }],
        };
      }

      case 'explain_observation': {
        const artifactId = String(args?.artifact_id || '');
        const stage = args?.stage as any;
        const res = engine.analyze({ artifacts: [artifactId], stage });
        return {
          content: [{ type: 'text', text: JSON.stringify({ registry_version: bundle.version, analysis: res }, null, 2) }],
        };
      }

      case 'find_compatible_mechanisms': {
        const artifactIds = (args?.artifact_ids as string[]) || [];
        const stage = args?.stage as any;
        const res = engine.analyze({ artifacts: artifactIds, stage });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  registry_version: bundle.version,
                  compatible_mechanisms: res.behind.compatible_mechanisms,
                  agency_partition: {
                    candidate_removable: res.agency.candidate_removable,
                    intermediary_dependent: res.agency.intermediary_dependent,
                    exogenous_no_agency: res.agency.exogenous_no_agency,
                  },
                  non_inferences: res.behind.non_inferences,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_diagnostic_probes': {
        const artifactId = String(args?.artifact_id || '');
        const node = bundle.artifacts.find((a) => a.id === artifactId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  registry_version: bundle.version,
                  artifact_id: artifactId,
                  probes: node?.probes || [],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'find_patterns': {
        const artifactIds = new Set((args?.artifact_ids as string[]) || []);
        const mechanismIds = new Set((args?.mechanism_ids as string[]) || []);

        const matched = bundle.patterns.filter((p) => {
          const hasArt = p.required_artifacts.some((a) => artifactIds.has(a));
          const hasMech = p.compatible_mechanisms.some((m) => mechanismIds.has(m));
          return hasArt || hasMech;
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  registry_version: bundle.version,
                  matched_patterns: matched.length > 0 ? matched : bundle.patterns,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_interventions': {
        const targetId = String(args?.target_id || '');
        const matched = bundle.interventions.filter((i) => i.targets.includes(targetId));
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  registry_version: bundle.version,
                  target_id: targetId,
                  interventions: matched,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'traverse_graph': {
        const startId = String(args?.start_id || '');
        const depth = Number(args?.depth || 1);
        const direction = (args?.direction as any) || 'both';

        const res = graph.getNeighbors(startId, { depth, direction });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  registry_version: bundle.version,
                  start_id: startId,
                  neighbors_count: res.nodes.length,
                  nodes: res.nodes,
                  edges: res.edges,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_methodology': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  registry_version: bundle.version,
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
                  core_rule: 'When the signal is unclear, do not invent a story; pause, separate observation from interpretation, and map the system.',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error executing tool ${name}: ${error.message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal MCP Server error:', err);
  process.exit(1);
});
