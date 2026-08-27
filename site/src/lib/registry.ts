/**
 * Build-time access to the registry for Astro pages.
 *
 * Bundles are loaded once per language and cached for the whole build — every
 * page used to re-read and re-validate all content files on its own.
 */
import {
  findRegistryRoot,
  HOBAKnowledgeGraph,
  loadRegistryFromRoot,
  stageIdSchema,
  type ContentLang,
  type RegistryBundle,
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
    bundle.artifacts.length +
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
    artifacts: strip(bundle.artifacts),
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
 * WF-003 is the process written as the commitments it is supposed to keep, and
 * every other entry in the registry is positioned against it: a barrier is the
 * point where one of those commitments stops being kept, an intervention is
 * something that holds one of them up. These two lookups are what let a
 * detail page say which it is without the page knowing anything about
 * workflows.
 */
export const IDEAL_PATH_ID = 'WF-003';

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
