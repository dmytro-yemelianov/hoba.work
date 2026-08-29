#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  claimRank,
  registryContentHash,
  empiricalScenarios,
  loadScenarios,
  resolveScenarioId,
  evidenceKindSchema,
  evidenceLevelSchema,
  PROVING_EVIDENCE_KINDS,
  scenarioSchema,
  validateAnalysis,
  validateScenarios,
  evaluatePatternEmptiness,
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  lift,
  loadRegistryFromRoot,
  readPackageVersion,
  resolveRegistryRoot,
  searchBundle,
  stageIdSchema,
  substrateCalculateRunway,
  substrateDetectTemporalAnomalies,
  substrateVerifyFlowConservation,
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
    Strongly_supported: 'Converging evidence, short of direct verification of the causal claim.',
    Proven: 'Verified causal claim, and refused by the validator unless a primary or research record backs it.',
    Contradicted: 'The evidence runs against the claim.',
    Unknown: 'No claim about the world is being made — a description, not an assertion.',
  },
  ontology: {
    artifact: 'obs.* — observable signal received by a candidate (silence, template rejection, repost).',
    barrier: 'bar.* — structural funnel gate; `precedes` edges form a strictly acyclic DAG.',
    mechanism: 'mech.* — force operating at gates, classified by actor / nature / visibility / removability.',
    pattern: 'pat.* — recurring contradiction motif that is useful to name without asserting a single hidden cause.',
    loop: 'loop.* — persistent causal cycle among mechanisms, validated from graph SCCs.',
    intervention: 'int.* — proposed change targeting a mechanism, barrier, pattern or loop.',
    evidence: 'evidence.* — citation record backing evidence levels.',
    workflow: 'proc.* — a state machine over one subject, with the actor owning each state named.',
    actor: 'actor.* — a position the funnel is made of; addressed at /actors/<slug>.',
    era: 'era.* — a period of the hiring economy, told as where the money came from.',
    record: 'record.* — a financial record; flows between them conserve.',
    legacy_ids: 'Every entity keeps its pre-migration short code as an alias, so A-001, B-005, M-014 and the rest still resolve.',
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
    description:
      'Registry release metadata (semver version, content hash, schema version) and entity counts across every collection.',
    inputSchema: {},
  },
  async () =>
    ok({
      /** What this release contains, as opposed to what it is called (§10). */
      registry_hash: registryContentHash(registryRoot),
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
        workflows: bundle.workflows.length,
        actors: bundle.actors.length,
        eras: bundle.eras.length,
        records: bundle.records.length,
        evidence: bundle.evidence.length,
        scenarios: loadScenarios(registryRoot).length,
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
    description: 'Retrieve the full specification of an entity by its canonical dotted ID (e.g. obs.complete_silence_after_submission, bar.recruiter_screening_call, mech.employment_gap_downranking_bias, pat.seniority_double_bind, loop.employment_gap_penalty_loop, int.upfront_compensation_band_disclosure, EVD-001). Legacy short codes (A-001, B-005, M-014, …) still resolve as aliases.',
    inputSchema: { id: z.string().describe('Canonical hoba entity identifier') },
  },
  async ({ id }) => {
    const node = graph.getNode(id);
    if (!node) return fail(`Node ${id} not found in hoba registry.`);
    return ok({ node });
  }
);

server.registerTool(
  'get_scenario',
  {
    description:
      'Retrieve authored scenarios: validated compositions of ontology entities describing a coherent situation — what was observed, ' +
      'what is compatible with it, and what it explicitly does not establish. Omit `id` to list them all. Those carrying a summary and ' +
      'a stage double as diagnostic presets for explain_observation.',
    inputSchema: { id: z.string().optional().describe('Scenario ID, e.g. "scenario.application_silence". Omit to list every scenario.') },
  },
  async ({ id }) => {
    const scenarios = loadScenarios(registryRoot);
    if (!id) return ok({ count: scenarios.length, scenarios });
    const resolved = resolveScenarioId(scenarios, id);
    const found = scenarios.find((s) => s.id === resolved);
    if (!found) return fail(`Unknown scenario "${id}". Available: ${scenarios.map((s) => s.id).join(', ')}`);
    return ok({ scenario: found });
  }
);

server.registerTool(
  'explain_observation',
  {
    description:
      'Execute the hoba forensic analysis protocol (H → O → B → A) for one or more observed artifacts or named empirical scenario at an optional funnel stage. Returns compatible mechanisms, agency partition, probes and explicit non-inferences. Never asserts a single hidden cause.',
    inputSchema: {
      artifact_ids: z.array(z.string()).optional().describe('Observed Artifact IDs (e.g. ["A-004"])'),
      stage: stageArg,
      scenario_id: z.string().optional().describe('Scenario ID used as a preset, e.g. "scenario.ghost_refresh". The pre-migration bare names ("ghost-refresh") still resolve.'),
    },
  },
  async ({ artifact_ids, stage, scenario_id }) => {
    let effectiveArtifacts = artifact_ids ?? [];
    let effectiveStage = stage;

    if (scenario_id) {
      const presets = empiricalScenarios(registryRoot);
      const sc = presets.find((s) => s.id === resolveScenarioId(presets, scenario_id));
      if (!sc) {
        const valid = presets.map((s) => s.id).join(', ');
        return fail(`Unknown scenario_id "${scenario_id}". Available scenarios: ${valid}`);
      }
      if (effectiveArtifacts.length === 0) {
        effectiveArtifacts = [...sc.artifacts];
      }
      if (!effectiveStage && sc.stage) {
        effectiveStage = sc.stage;
      }
    }

    if (effectiveArtifacts.length === 0) {
      return fail('Either artifact_ids or scenario_id must be provided.');
    }

    const analysis = engine.analyze({ artifacts: effectiveArtifacts, stage: effectiveStage });
    if (analysis.hard_facts.selected_artifacts.length === 0) {
      return fail(`None of the provided artifact IDs exist in the registry: ${effectiveArtifacts.join(', ')}`);
    }
    return ok({ scenario_id: scenario_id ?? null, analysis });
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
    const resolveId = (id: string) => graph.getNode(id)?.id ?? id;
    const artifacts = new Set((artifact_ids ?? []).map(resolveId));
    const mechanisms = new Set((mechanism_ids ?? []).map(resolveId));
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
    inputSchema: { target_id: z.string().describe('Target entity ID (e.g. mech.pre_selected_internal_candidate, bar.application_ingestion, pat.seniority_double_bind, loop.employment_gap_penalty_loop); legacy short codes resolve as aliases') },
  },
  async ({ target_id }) => {
    const node = graph.getNode(target_id);
    if (!node) return fail(`Target ${target_id} not found in hoba registry.`);
    const canonicalId = node.id;
    const interventions = bundle.interventions.filter((i) => i.targets.includes(canonicalId) || i.targets.includes(target_id));
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

const lifted = lift(bundle);

server.registerTool(
  'detect_temporal_anomalies',
  {
    description:
      'Diagnose temporal dwell anomalies and identify stalled or implicated mechanisms across hiring funnel stages.',
    inputSchema: {
      process_id: z.string().describe('Workflow ID (e.g. "proc.the_hiring_funnel_end_to_end", "proc.the_path_as_it_is_supposed_to_run", "proc.client_account_hiring_funnel"); legacy short codes resolve as aliases'),
      from_state: z.string().describe('Starting state ID where candidate is currently dwelling (e.g. "recruiter-queue")'),
      actual_days: z.number().nonnegative().describe('Number of elapsed calendar days in this state'),
    },
  },
  async ({ process_id, from_state, actual_days }) => {
    const anomalies = substrateDetectTemporalAnomalies(lifted.substrate, process_id, from_state, actual_days);
    return ok({
      process: process_id,
      from_state,
      actual_days,
      count: anomalies.length,
      anomalies,
    });
  }
);

server.registerTool(
  'calculate_runway',
  {
    description:
      'Compute candidate financial runway horizon, exhaustion risk profile, and vulnerability notes under monthly burn rate.',
    inputSchema: {
      savings: z.number().nonnegative().describe('Liquid savings in account currency'),
      monthly_burn: z.number().positive().describe('Monthly baseline living cost / burn rate'),
    },
  },
  async ({ savings, monthly_burn }) => {
    const calculus = substrateCalculateRunway(savings, monthly_burn);
    return ok({ ...calculus });
  }
);

server.registerTool(
  'verify_flow_conservation',
  {
    description: 'Audit financial flow conservation across all records in the registry knowledge graph.',
    inputSchema: {},
  },
  async () => {
    const report = substrateVerifyFlowConservation(lifted.substrate);
    return ok({
      record_count: lifted.substrate.records.length,
      flow_count: lifted.substrate.flows.length,
      ...report,
    });
  }
);

server.registerTool(
  'evaluate_pattern_emptiness',
  {
    description: 'Evaluate formal algebraic emptiness and contradiction proofs for all patterns in the registry.',
    inputSchema: {},
  },
  async () => {
    const report = evaluatePatternEmptiness(lifted);
    return ok({ ...report });
  }
);

// ---------------------------------------------------------------------------
// Methodology resources (design doc §12)
//
// A second exposure surface for what `get_methodology` already returns, for
// clients that prefer resource URIs to tool calls. The content is composed from
// the same METHODOLOGY object and the live schema enums — nothing here is
// authored twice.
// ---------------------------------------------------------------------------
const METHODOLOGY_RESOURCES: Record<string, { title: string; body: () => unknown }> = {
  core: {
    title: 'The HOBA protocol',
    body: () => ({ protocol: METHODOLOGY.protocol, core_rule: METHODOLOGY.core_rule, ontology: METHODOLOGY.ontology }),
  },
  'epistemic-rules': {
    title: 'How strongly a claim may be made',
    body: () => ({
      verbs: METHODOLOGY.epistemic_verbs,
      levels: evidenceLevelSchema.options,
      invariant:
        'An entity may not stand at "proven" without a linked evidence record of kind "primary" or "research". ' +
        'The validator rejects it; a tier is never jumped without the evidence for the jump.',
      off_scale: {
        contradicted: 'The evidence runs against the claim.',
        unknown: 'No claim about the world is being made — a description, not an assertion.',
      },
    }),
  },
  agency: {
    title: 'Who can change what',
    body: () => ({
      protocol_step: METHODOLOGY.protocol.A,
      removability: 'Per mechanism: candidate | intermediary | none. What the Lean proofs and UI badges key off.',
      agency_zones:
        'Per mechanism, per actor: high (holds an intervention targeting it), medium (it is their own force, or theirs to remove), ' +
        'low (they can see it and no more). Derived from the entities themselves, never authored, and absent for an actor with no declared relationship.',
      actors: bundle.actors.map((a) => ({ id: a.id, slug: a.slug, title: a.title })),
    }),
  },
  evidence: {
    title: 'What backs a claim',
    body: () => ({
      kinds: evidenceKindSchema.options,
      proving_kinds: PROVING_EVIDENCE_KINDS,
      count: bundle.evidence.length,
      rule: 'A citation raises a claim only when it addresses the specific mechanism, not the general topic.',
    }),
  },
  'non-goals': { title: 'What this is not', body: () => ({ non_goals: METHODOLOGY.non_goals }) },
};

for (const [topic, { title, body }] of Object.entries(METHODOLOGY_RESOURCES)) {
  server.registerResource(
    `methodology-${topic}`,
    `hoba://methodology/${topic}`,
    { title, description: title, mimeType: 'application/json' },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({ registry_version: bundle.version, topic, ...(body() as object) }, null, 2),
        },
      ],
    })
  );
}

// ---------------------------------------------------------------------------
// Validation tools (design doc §12) — the first live use of the Scenario and
// Analysis schemas over MCP.
// ---------------------------------------------------------------------------
server.registerTool(
  'validate_entity_ids',
  {
    description:
      'Check whether entity IDs resolve against the registry, and report the canonical ID for any legacy short code. ' +
      'Use before composing a scenario or an analysis that names them.',
    inputSchema: { ids: z.array(z.string()).min(1).describe('Entity IDs, canonical or legacy') },
  },
  async ({ ids }) => {
    const results = ids.map((id) => {
      const node = graph.getNode(id);
      return node
        ? { id, resolves: true, canonical_id: node.id, type: node.type, is_alias: node.id !== id }
        : { id, resolves: false };
    });
    return ok({ all_resolve: results.every((r) => r.resolves), results });
  }
);

server.registerTool(
  'validate_scenario',
  {
    description:
      'Validate a scenario object against the Scenario schema and check that every entity it names exists. ' +
      'An unresolvable ID is an error, not a warning.',
    inputSchema: { scenario: z.record(z.unknown()).describe('A scenario object, as stored under data/scenarios/') },
  },
  async ({ scenario }) => {
    const parsed = scenarioSchema.safeParse(scenario);
    if (!parsed.success) {
      return ok({
        valid: false,
        issues: parsed.error.issues.map((i) => ({ severity: 'error', rule: 'schema', message: `${i.path.join('.') || '(root)'}: ${i.message}` })),
      });
    }
    const issues = validateScenarios([parsed.data], bundle);
    return ok({ valid: issues.length === 0, id: parsed.data.id, issues });
  }
);

server.registerTool(
  'validate_analysis',
  {
    description:
      'Validate a structured Analysis object: schema conformance, every named entity resolves, and no claim stands ' +
      'above the level the cited entity itself carries.',
    inputSchema: { analysis: z.record(z.unknown()).describe('An Analysis object, per schema/analysis.schema.json') },
  },
  async ({ analysis }) => {
    const issues = validateAnalysis(analysis, bundle);
    return ok({ valid: issues.length === 0, issues });
  }
);

server.registerTool(
  'validate_claim',
  {
    description:
      'Check one claim — an entity and the strength being claimed for it — against the epistemic rules. ' +
      'Answers whether the registry itself carries the claim that far.',
    inputSchema: {
      id: z.string().describe('Entity ID, canonical or legacy'),
      claim_level: evidenceLevelSchema.describe(`One of: ${evidenceLevelSchema.options.join(', ')}`),
    },
  },
  async ({ id, claim_level }) => {
    const node = graph.getNode(id);
    if (!node) return fail(`Entity ${id} not found in hoba registry.`);
    const carried = (node as { evidence_level?: string }).evidence_level ?? 'unknown';
    const claimed = claimRank(claim_level);
    const held = claimRank(carried);
    const overclaims = claimed !== null && held !== null && claimed > held;
    return ok({
      id: node.id,
      claim_level,
      registry_level: carried,
      valid: !overclaims,
      reason: overclaims
        ? `The registry carries ${node.id} only as "${carried}"; claiming "${claim_level}" asserts more than its evidence does.`
        : claimed === null || held === null
          ? `"${claim_level}" and "${carried}" are not both points on the epistemic scale, so neither outranks the other.`
          : `The registry carries ${node.id} as "${carried}", which is at least "${claim_level}".`,
    });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('[hoba-mcp] Fatal MCP Server error:', err);
  process.exit(1);
});
