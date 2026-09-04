/**
 * Discovery surface: robots.txt, sitemap.xml, llms.txt and llms-full.txt.
 *
 * All four are generated from the registry and the route list so they cannot
 * drift from what the site actually serves. The CI step that fails on a dirty
 * `apps/web/public` after a build is what keeps them honest.
 *
 * llms.txt follows the convention of a short orientation file at the root:
 * what this is, how it is structured, where the machine-readable copies live.
 * llms-full.txt is the whole registry as one flat document, because that is
 * what a model is actually going to want.
 */
import fs from 'node:fs';
import path from 'node:path';
import { READER_SLUGS } from '../apps/web/src/lib/readers';
import {
  buildDataInventory,
  findRegistryRoot,
  HOBAKnowledgeGraph,
  loadArchetypes,
  loadRegistryFromRoot,
  loadScenarios,
  type ContentLang,
  type RegistryBundle,
} from '@hoba/registry';

const SITE = 'https://hoba.work';
const root = findRegistryRoot(process.cwd());
if (!root) throw new Error('build-discovery: registry root not found');
const registryRoot: string = root;
const PUBLIC = path.join(root, 'apps', 'web', 'public');

/**
 * Pages a crawler is told about, read from the templates rather than listed
 * again — the hand-written list this replaces had drifted from the routes that
 * exist, and a page missing from the sitemap is missing silently.
 *
 * Two are held back on purpose:
 *   404   — an error page, not a destination.
 *   cats  — an easter egg; it is reachable, it is simply not advertised.
 */
const NOT_LISTED = new Set(['404', 'cats']);

const templateRoutes = (): string[] => {
  const dir = path.join(root, 'apps', 'web', 'src', 'pages', '[...locale]');
  const names: string[] = [];
  const walk = (d: string, prefix = '') => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name), `${prefix}${e.name}/`);
      else if (e.name.endsWith('.astro')) names.push(`${prefix}${e.name.replace(/\.astro$/, '')}`);
    }
  };
  walk(dir);
  const routes = names
    // `[id]` templates are entity routes, enumerated from the registry below.
    .filter((n) => !n.includes('[') && !NOT_LISTED.has(n))
    // `actors/index.astro` is the address `/actors`, the same way the top-level
    // `index.astro` is `/`.
    .map((n) => (n.endsWith('/index') ? n.slice(0, -'/index'.length) : n))
    .filter((n) => n !== 'index');
  return ['/', ...routes.sort().map((n) => `/${n}`)];
};

const STATIC_ROUTES = templateRoutes();

const entityRoutes = (bundle: RegistryBundle): string[] => [
  ...bundle.actors.map((a) => `/actors/${a.slug}`),
  ...bundle.observations.map((a) => `/observations/${a.id}`),
  ...bundle.barriers.map((b) => `/barriers/${b.id}`),
  ...bundle.mechanisms.map((m) => `/mechanisms/${m.id}`),
  ...bundle.patterns.map((p) => `/patterns/${p.id}`),
  ...bundle.loops.map((l) => `/loops/${l.id}`),
  ...bundle.interventions.map((i) => `/interventions/${i.id}`),
];

function robots(): string {
  return [
    '# hoba — Hiring Obstacles & Barriers Atlas',
    '# Every entity is also available as JSON under /api/v1/ and in bulk under /data/latest/.',
    '# Model-readable orientation: /llms.txt · full corpus: /llms-full.txt',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# The API and the bulk exports are the cheap way to read this site.',
    '# Crawling every HTML page to reconstruct them is wasted on both sides.',
    'User-agent: *',
    'Disallow: /api/v1/*/index.json',
    '',
    '# Both languages are prerendered into internal trees and served by the edge',
    '# worker under one language-free URL. The trees themselves are not addresses.',
    'User-agent: *',
    'Disallow: /_i/',
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
    '',
  ].join('\n');
}

function sitemap(routes: string[], lastmod: string): string {
  const url = (route: string, priority: string) =>
    `  <url>\n    <loc>${SITE}${route === '/' ? '/' : route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">'.replace(
      'www.sitemap.org',
      'www.sitemaps.org'
    ),
    ...routes.map((r) => url(r, r === '/' ? '1.0' : STATIC_ROUTES.includes(r) ? '0.8' : '0.6')),
    '</urlset>',
    '',
  ].join('\n');
}

function llms(bundle: RegistryBundle, graph: HOBAKnowledgeGraph): string {
  const inventory = buildDataInventory(bundle, {
    scenarios: loadScenarios(registryRoot).length,
    archetypes: loadArchetypes(registryRoot).length,
  });
  const graphProjection = graph.toCytoscapeJSON().elements;
  return [
    '# hoba — Hiring Obstacles & Barriers Atlas',
    '',
    `> A public, versioned, machine-readable registry of what goes wrong in hiring and what can be inferred from it. Registry ${bundle.version}, schema ${bundle.schema_version}. Content CC BY-SA 4.0, code MIT.`,
    '',
    'hoba separates an observation from its cause. A rejection email is a signal; the mechanisms that could have produced it are a separate layer; which of them a candidate can act on is a third. The registry never asserts which mechanism fired — only which are compatible, and which probes distinguish them.',
    '',
    '## Ontology',
    '',
    ...inventory.collections.map(
      (entry) =>
        `- **${entry.plural.en}** (\`${entry.type}\`, ${entry.count}; IDs ${entry.id_pattern}) — ${entry.purpose.en}`
    ),
    '',
    `Scenarios (${inventory.totals.scenarios}) are validated compositions over canonical IDs. Archetypes (${inventory.totals.archetypes}) are presentation-only overlays. The formal substrate is derived and never authored as a second source of truth.`,
    '',
    `The graph export is deliberately narrower than the ontology: ${graphProjection.nodes.length} reader-facing finding nodes and ${graphProjection.edges.length} edges over the relations \`operates_at\`, \`emits\`, \`amplifies\`, \`masks\`, \`precedes\`, \`instantiates\`, \`targets\`, \`mitigates\`.`,
    '',
    '## Reading it by machine',
    '',
    `- Full registry: ${SITE}/data/latest/registry.json`,
    `- Inventory, boundaries and usage choices: ${SITE}/data/latest/inventory.json`,
    `- One entity: ${SITE}/api/v1/mechanisms/mech.genuine_technical_skill_shortfall.json`,
    `- Any page as Markdown: ${SITE}/mechanisms/mech.genuine_technical_skill_shortfall.md — or the canonical URL with \`Accept: text/markdown\``,
    `- The whole catalogue as one document: ${SITE}/registry.md`,
    `- Graph: ${SITE}/data/latest/graph.json · ${SITE}/data/latest/graph.graphml`,
    `- Tabular: ${SITE}/data/latest/nodes.csv · ${SITE}/data/latest/edges.csv`,
    `- Schema: ${SITE}/data/latest/schema.json · OpenAPI: ${SITE}/openapi.json`,
    `- This file in full: ${SITE}/llms-full.txt`,
    '',
    'An MCP server ships in the repository (`packages/mcp`) exposing search, entity lookup, the diagnostic protocol, pattern matching and graph traversal over stdio.',
    '',
    '## What it will not do',
    '',
    '- It does not name or rank employers, and it holds no company records.',
    '- It does not attribute intent. Mechanisms describe structure, not motive.',
    '- Document excerpts on the site are reconstructions, written to be typical, and are labelled as such. They are not captured records.',
    '',
  ].join('\n');
}

/** The whole registry as one document, in the order a reader would need it. */
function llmsFull(bundle: RegistryBundle, graph: HOBAKnowledgeGraph): string {
  const out: string[] = [llms(bundle, graph), '---', ''];
  function section<T extends { id: string; title: string }>(
    heading: string,
    nodes: T[],
    body: (node: T) => string[]
  ): void {
    out.push(`## ${heading}`, '');
    for (const node of nodes) {
      out.push(`### ${node.id} — ${node.title}`, '');
      out.push(...body(node));
      out.push('');
    }
  }

  section('Observations', bundle.observations, (a) => [
    a.summary,
    '',
    `- Stages: ${a.stages.join(', ')} · Evidence: ${a.evidence_level}`,
    ...a.non_inferences.map((n) => `- Does NOT establish: ${n}`),
    ...a.probes.map((p) => `- Probe [${p.id}] (${p.cost}): ${p.action} → ${p.expected_signal}`),
  ]);

  section('Barriers', bundle.barriers, (b) => [
    b.description,
    '',
    `- Stage: ${b.stage} · Order: ${b.order} · Passes when: ${b.pass_condition}`,
    ...(b.precedes.length ? [`- Precedes: ${b.precedes.join(', ')}`] : []),
  ]);

  section('Mechanisms', bundle.mechanisms, (m) => [
    m.summary,
    '',
    `- Actor: ${m.facets.actor} · Nature: ${m.facets.nature} · Visibility: ${m.facets.visibility} · Removability: ${m.facets.removability}`,
    `- Operates at: ${m.operates_at.join(', ')}${m.honest_baseline ? ' · honest baseline' : ''}`,
    ...(m.emissions.length
      ? [
          `- Emits: ${m.emissions.map((e) => `${e.artifact} (${e.fidelity ?? 'unspecified'})`).join(', ')}`,
        ]
      : []),
    ...m.non_inferences.map((n) => `- Does NOT establish: ${n}`),
  ]);

  section('Patterns', bundle.patterns, (p) => [
    p.summary,
    '',
    `- Triggers when: ${p.trigger_rule}`,
    `- Requires: ${p.required_artifacts.join(', ')} · Mechanisms: ${p.compatible_mechanisms.join(', ')}`,
    ...p.establishes.map((e) => `- Establishes: ${e}`),
    ...p.non_inferences.map((n) => `- Does NOT establish: ${n}`),
  ]);

  section('Loops', bundle.loops, (l) => [
    l.summary,
    '',
    ...l.edges.map((e) => `- ${e.from} ${e.relation} ${e.to}`),
  ]);

  section('Interventions', bundle.interventions, (i) => [
    i.summary,
    '',
    `- Actor: ${i.actor} · Scope: ${i.scope} · Cost: ${i.cost}`,
    `- Targets: ${i.targets.join(', ')}`,
    ...i.expected_effects.map((e) => `- Expected: ${e}`),
  ]);

  section('Actors', bundle.actors, (a) => [
    a.summary,
    '',
    ...a.controls.map((c) => `- Decides: ${c}`),
    ...a.blind_to.map((b) => `- Cannot see: ${b}`),
    ...a.incentives.map((i) => `- Measured on: ${i}`),
    ...a.recommendations.map(
      (r) => `- Could do (${r.cost}): ${r.title} — ${r.rationale} Costs: ${r.costs}`
    ),
  ]);

  section('Processes', bundle.processes, (p) => [
    p.summary,
    '',
    `- Subject: ${p.subject} · Evidence: ${p.evidence_level}`,
    ...p.states.map(
      (s) =>
        `- State ${s.id} (${s.kind}, owner ${s.owner}): ${s.description}${s.max_dwell_days ? ` · max ${s.max_dwell_days} days` : ''}`
    ),
    ...p.transitions.map(
      (t) => `- Transition ${t.from} → ${t.to} (${t.owner}): ${t.label} · guard: ${t.guard}`
    ),
  ]);

  section('Eras', bundle.eras, (e) => [
    e.summary,
    '',
    `- Span: ${e.from}–${e.to}`,
    `- The money: ${e.capital}`,
    `- What it did to hiring: ${e.hiring}`,
    `- How you got in: ${e.entry}`,
    ...(e.ended_by ? [`- What closed it: ${e.ended_by}`] : []),
    ...e.indicators.map((i) => `- ${i.figure} — ${i.label} (${i.period}, ${i.evidence})`),
  ]);

  section('Financial records', bundle.records, (r) => [
    r.summary,
    '',
    `- Class: ${r.record_class} · Owner: ${r.owner}${r.owner_actor ? ` (${r.owner_actor})` : ''} · Visibility: ${r.visibility_default}`,
    ...r.flows.map(
      (flow) =>
        `- Flow to ${flow.to}: ${flow.label}${flow.percentage !== undefined ? ` · ${flow.percentage}%` : ''}${flow.fraction !== undefined ? ` · fraction ${flow.fraction}` : ''}`
    ),
  ]);

  section('Evidence', bundle.evidence, (e) => [
    e.summary,
    '',
    ...(e.citation ? [`- ${e.citation}`] : []),
    ...(e.url ? [`- ${e.url}`] : []),
  ]);

  out.push('## Validated scenario compositions', '');
  for (const scenario of loadScenarios(registryRoot)) {
    out.push(`### ${scenario.id} — ${scenario.title.en}`, '');
    if (scenario.summary) out.push(scenario.summary, '');
    out.push(`- Observations: ${scenario.observations.join(', ')}`);
    if (scenario.compatible_barriers.length)
      out.push(`- Compatible barriers: ${scenario.compatible_barriers.join(', ')}`);
    if (scenario.compatible_mechanisms.length)
      out.push(`- Compatible mechanisms: ${scenario.compatible_mechanisms.join(', ')}`);
    for (const claim of scenario.excluded_claims) out.push(`- Does NOT establish: ${claim}`);
    out.push('');
  }

  out.push('## Presentation-only archetype overlays', '');
  for (const archetype of loadArchetypes(registryRoot)) {
    out.push(
      `- **${archetype.id} — ${archetype.nickname.en}** (${archetype.axis_x}/${archetype.axis_y}): ${archetype.blurb.en}`
    );
  }
  out.push('');

  return out.join('\n');
}

const bundle = loadRegistryFromRoot(root, 'en' as ContentLang);
const graph = new HOBAKnowledgeGraph(bundle);
// One entry point per reader. They are a dynamic template, so the walk above
// skips them the way it skips entity routes, and they are named from the same
// list the pages are generated from.
const readerRoutes = READER_SLUGS.map((r) => `/for/${r}`);
const routes = [...STATIC_ROUTES, ...readerRoutes, ...entityRoutes(bundle)];
// From the manifest, never from a file mtime: a fresh checkout has different
// mtimes, which would make the build non-deterministic and fail CI's
// exports-are-up-to-date check on every run.
const lastmod = bundle.updated_at.slice(0, 10);

fs.writeFileSync(path.join(PUBLIC, 'robots.txt'), robots());
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sitemap(routes, lastmod));
fs.writeFileSync(path.join(PUBLIC, 'llms.txt'), llms(bundle, graph));
fs.writeFileSync(path.join(PUBLIC, 'llms-full.txt'), llmsFull(bundle, graph));

process.stdout.write(
  `discovery: robots.txt, sitemap.xml (${routes.length} urls), llms.txt, llms-full.txt\n`
);
