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

/** `/uk/...` routes render the Ukrainian mirror; everything else is canonical English. */
export function langFromUrl(url: URL): ContentLang {
  return url.pathname === '/uk' || url.pathname.startsWith('/uk/') ? 'uk' : 'en';
}

export const localePrefix = (lang: ContentLang): string => (lang === 'uk' ? '/uk' : '');

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
