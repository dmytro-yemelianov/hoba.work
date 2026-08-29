/**
 * Build-time access to the registry for Astro pages.
 *
 * Bundles are loaded once per language and cached for the whole build — every
 * page used to re-read and re-validate all content files on its own.
 */
import {
  empiricalScenarios,
  findRegistryRoot,
  HOBAKnowledgeGraph,
  loadRegistryFromRoot,
  stageIdSchema,
  type ContentLang,
  type EmpiricalScenario,
  type RegistryBundle,
  type ActorNode,
  type EraNode,
  type WorkflowNode,
  type WorkflowState,
} from '@hoba/registry';
import pkg from '../../package.json';

const root = findRegistryRoot(process.cwd());
if (!root) {
  throw new Error(`hoba-site: could not find the registry root (content/ + registry.yaml) above ${process.cwd()}`);
}

export const registryRoot: string = root;
export const siteVersion: string = pkg.version;
/** Funnel stages in canonical order (shared with CLI/MCP validation). */
export const STAGES = stageIdSchema.options;

const bundles = new Map<ContentLang, RegistryBundle>();
const graphs = new Map<ContentLang, HOBAKnowledgeGraph>();

export function getBundle(lang: ContentLang = 'en'): RegistryBundle {
  let bundle = bundles.get(lang);
  if (!bundle) {
    bundle = loadRegistryFromRoot(root!, lang);
    bundles.set(lang, bundle);
  }
  return bundle;
}

export function getGraph(lang: ContentLang = 'en'): HOBAKnowledgeGraph {
  let graph = graphs.get(lang);
  if (!graph) {
    graph = new HOBAKnowledgeGraph(getBundle(lang));
    graphs.set(lang, graph);
  }
  return graph;
}



export function countGraphNodes(bundle: RegistryBundle): number {
  return (
    bundle.observations.length +
    bundle.barriers.length +
    bundle.mechanisms.length +
    bundle.patterns.length +
    bundle.loops.length +
    bundle.interventions.length
  );
}

/** Registry without markdown bodies — what client-side scripts need, at a fraction of the page weight. */
export function slimBundle(bundle: RegistryBundle): RegistryBundle {
  const strip = <T extends { content?: string }>(items: T[]): T[] =>
    items.map(({ content: _content, ...rest }) => rest as T);
  return {
    ...bundle,
    observations: strip(bundle.observations),
    barriers: strip(bundle.barriers),
    mechanisms: strip(bundle.mechanisms),
    patterns: strip(bundle.patterns),
    loops: strip(bundle.loops),
    interventions: strip(bundle.interventions),
  };
}


/**
 * The canonical path.
 *
 * The canonical path is the process written as the commitments it is supposed to
 * keep, and every other entry is positioned against it: a barrier is the
 * point where one of those commitments stops being kept, an intervention is
 * something that holds one of them up. These two lookups are what let a
 * detail page say which it is without the page knowing anything about
 * workflows.
 */
export const IDEAL_PATH_ID = 'proc.the_path_as_it_is_supposed_to_run';

export interface IdealPlacement {
  workflow: WorkflowNode;
  state: WorkflowState;
}

function idealPath(bundle: RegistryBundle): WorkflowNode | undefined {
  return bundle.workflows.find((w) => w.id === IDEAL_PATH_ID);
}

/** The commitment this entity is a departure from, if it is one. */
export function idealDeviation(bundle: RegistryBundle, id: string): IdealPlacement | undefined {
  const workflow = idealPath(bundle);
  const state = workflow?.states.find((s) => s.deviations.includes(id));
  return workflow && state ? { workflow, state } : undefined;
}

/** The commitments this entity helps hold, if it is an intervention or a signal. */
export function idealSupport(bundle: RegistryBundle, id: string): IdealPlacement[] {
  const workflow = idealPath(bundle);
  if (!workflow) return [];
  return workflow.states.filter((s) => s.entities.includes(id)).map((state) => ({ workflow, state }));
}

/** Anchor for one state of one workflow on /process. */
export const stateAnchor = (workflowId: string, stateId: string): string => `${workflowId}-${stateId}`;


/** The eras that name this entity as one of the things they made ordinary. */
export function erasNaming(bundle: RegistryBundle, id: string): EraNode[] {
  return bundle.eras.filter((era) => era.entities.includes(id));
}


const PERSPECTIVE_ROUTES: Record<string, string> = {
  observation: 'observations',
  barrier: 'barriers',
  mechanism: 'mechanisms',
  pattern: 'patterns',
  loop: 'loops',
  intervention: 'interventions',
};

export interface SeenEntry {
  id: string;
  title: string;
  type: string;
  href: string;
}

/** Every entry this actor has a recorded view of — the actor page's index. */
export function entriesSeenBy(bundle: RegistryBundle, actor: ActorNode['id'], prefix: string): SeenEntry[] {
  const all = [
    ...bundle.observations, ...bundle.barriers, ...bundle.mechanisms,
    ...bundle.patterns, ...bundle.loops, ...bundle.interventions,
  ];
  return all
    .filter((node) => node.perspectives.some((p) => p.actor === actor))
    .map((node) => ({
      id: node.id,
      title: node.title,
      type: node.type,
      href: `${prefix}/${PERSPECTIVE_ROUTES[node.type]}/${node.id}`,
    }));
}


export interface RouteCount {
  total: number;
  /** How many distinct routes end at each terminal state, by state id. */
  byTerminal: Record<string, number>;
}

/**
 * How many distinct routes run through a workflow, and where they end.
 *
 * A cardinality, never a probability: the atlas has no basis for saying which
 * route a person takes, and counting them is the honest thing it can do
 * instead. Only meaningful for an acyclic machine — the canonical path is one, and
 * `formal/` proves it.
 */
export function countRoutes(workflow: WorkflowNode): RouteCount {
  const exits = new Map<string, string[]>();
  for (const t of workflow.transitions) exits.set(t.from, [...(exits.get(t.from) ?? []), t.to]);
  const start = workflow.states.find((s) => s.kind === 'initial') ?? workflow.states[0];
  if (!start) return { total: 0, byTerminal: {} };

  const memo = new Map<string, Record<string, number>>();
  const walk = (id: string, seen: Set<string>): Record<string, number> => {
    const cached = memo.get(id);
    if (cached) return cached;
    const out = exits.get(id) ?? [];
    if (out.length === 0) return { [id]: 1 };
    const totals: Record<string, number> = {};
    for (const next of out) {
      if (seen.has(next)) continue; // a cycle: not counted, and not counted twice
      for (const [terminal, n] of Object.entries(walk(next, new Set(seen).add(next)))) {
        totals[terminal] = (totals[terminal] ?? 0) + n;
      }
    }
    memo.set(id, totals);
    return totals;
  };

  const byTerminal = walk(start.id, new Set([start.id]));
  return { total: Object.values(byTerminal).reduce((a, b) => a + b, 0), byTerminal };
}


export interface Coverage {
  /** Gates with no proposed change attached to them. */
  gatesWithoutIntervention: string[];
  /** Causes with no proposed change attached to them. */
  mechanismsWithoutIntervention: string[];
  /** Entries that cite no published source. */
  entriesWithoutEvidence: string[];
  /** Funnel stages at which a candidate can observe nothing at all. */
  stagesWithoutObservation: string[];
  totals: { gates: number; mechanisms: number; entries: number };
}

/**
 * What the atlas does not cover, computed rather than claimed.
 *
 * A reader deciding how far to trust a registry is entitled to know where it is
 * thin, and the numbers are derivable from the registry itself — so they are
 * derived, on every build, instead of being a paragraph someone remembers to
 * update.
 */
export function coverage(bundle: RegistryBundle): Coverage {
  const targeted = new Set(bundle.interventions.flatMap((i) => i.targets));
  const entries = [
    ...bundle.observations, ...bundle.barriers, ...bundle.mechanisms,
    ...bundle.patterns, ...bundle.loops, ...bundle.interventions,
  ];
  const observedStages = new Set(bundle.observations.flatMap((a) => a.stages));

  return {
    gatesWithoutIntervention: bundle.barriers.filter((b) => !targeted.has(b.id)).map((b) => b.id),
    mechanismsWithoutIntervention: bundle.mechanisms.filter((m) => !targeted.has(m.id)).map((m) => m.id),
    entriesWithoutEvidence: entries.filter((e) => e.evidence_ids.length === 0).map((e) => e.id),
    stagesWithoutObservation: [...new Set(bundle.barriers.map((b) => b.stage))].filter((s) => !observedStages.has(s)),
    totals: { gates: bundle.barriers.length, mechanisms: bundle.mechanisms.length, entries: entries.length },
  };
}

/**
 * The diagnostic presets, read from `data/scenarios/` at build time rather than
 * compiled into the engine. Same four entries, now authored content.
 */
export const EMPIRICAL_SCENARIOS = empiricalScenarios(registryRoot);
export { type EmpiricalScenario };
