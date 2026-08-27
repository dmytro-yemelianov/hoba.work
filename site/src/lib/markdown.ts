/**
 * Every page as Markdown.
 *
 * The site is a registry, and a registry should be readable without a browser.
 * These documents are not a dump of the JSON: they are the same page, written
 * for a reader who is piping it somewhere — frontmatter that identifies the
 * entity, the prose, the specimens as fenced blocks, and every relation as a
 * link that resolves on the live site.
 *
 * One file per entity per language, emitted into the internal trees, so the
 * edge worker can serve it either at `/mechanisms/M-001.md` or at the canonical
 * URL under `Accept: text/markdown`.
 */
import type {
  ActorNode,
  ArtifactNode,
  BarrierNode,
  InterventionNode,
  LoopNode,
  MechanismNode,
  PatternNode,
  RegistryBundle,
  Specimen,
  WorkflowNode,
} from '@hoba/registry';
import type { Lang, Translate } from '../i18n/utils';
import { asHeading } from '../i18n/utils';

export const SITE = 'https://hoba.work';

type Entity = ActorNode | ArtifactNode | BarrierNode | InterventionNode | LoopNode | MechanismNode | PatternNode | WorkflowNode;

const ROUTES: Record<string, string> = {
  actor: 'actors',
  artifact: 'artifacts',
  barrier: 'barriers',
  mechanism: 'mechanisms',
  pattern: 'patterns',
  loop: 'loops',
  intervention: 'interventions',
  workflow: 'workflows',
};

/** A registry ID as a link that works wherever the document is pasted. */
export function idLink(id: string, bundle: RegistryBundle): string {
  const node = [...bundle.artifacts, ...bundle.barriers, ...bundle.mechanisms, ...bundle.patterns, ...bundle.loops, ...bundle.interventions].find(
    (n) => n.id === id
  );
  if (!node) return `\`${id}\``;
  return `[${id}](${SITE}/${ROUTES[node.type]}/${id}) — ${node.title}`;
}

function frontmatter(entity: Entity, lang: Lang, bundle: RegistryBundle): string[] {
  return [
    '---',
    `id: ${entity.id}`,
    `type: ${entity.type}`,
    `title: ${JSON.stringify(entity.title)}`,
    `lang: ${lang}`,
    `registry: ${bundle.version}`,
    `canonical: ${SITE}/${ROUTES[entity.type]}/${entity.id}`,
    `json: ${SITE}/api/v1/${ROUTES[entity.type]}/${entity.id}.json`,
    '---',
    '',
  ];
}

/** Specimens keep their shape: a fenced block reads as the document it is. */
function renderSpecimen(specimen: Specimen, t: Translate): string[] {
  const out = [`**${specimen.label}**${specimen.context ? ` · ${specimen.context}` : ''} — *${t('specimen.badge')}*`, ''];
  out.push('```');
  if (specimen.subject) out.push(`${asHeading(t('specimen.subject.line'))}: ${specimen.subject}`, '');
  for (const line of specimen.lines) {
    const stamp = [line.at, line.speaker].filter(Boolean).join(' ');
    const marker = line.tell ? '> ' : '  ';
    out.push(`${marker}${stamp ? `${stamp}  ` : ''}${line.text}`);
  }
  out.push('```', '');
  if (specimen.reading) out.push(`*${asHeading(t('specimen.reading'))}* ${specimen.reading}`, '');
  return out;
}

function bullets(heading: string, items: string[]): string[] {
  if (!items.length) return [];
  return [`## ${heading}`, '', ...items.map((i) => `- ${i}`), ''];
}

/** The whole document for one entity, in one language. */
export function entityMarkdown(entity: Entity, lang: Lang, t: Translate, bundle: RegistryBundle): string {
  const out = frontmatter(entity, lang, bundle);
  out.push(`# ${entity.title}`, '');

  const summary = 'summary' in entity ? entity.summary : 'description' in entity ? entity.description : '';
  if (summary) out.push(summary, '');

  const facts: string[] = [];
  if ('stages' in entity) facts.push(`${asHeading(t('common.stage'))}: ${entity.stages.map((s) => t(`stage.${s}`)).join(', ')}`);
  if ('stage' in entity) facts.push(`${asHeading(t('common.stage'))}: ${t(`stage.${entity.stage}`)}`);
  if ('order' in entity) facts.push(t('bar.order', { n: entity.order }));
  if ('facets' in entity) {
    facts.push(`${asHeading(t('facet.actor'))}: ${t(`actor.${entity.facets.actor}`)}`);
    facts.push(`${asHeading(t('facet.nature'))}: ${t(`nature.${entity.facets.nature}`)}`);
    facts.push(`${asHeading(t('facet.visibility'))}: ${t(`visibility.${entity.facets.visibility}`)}`);
    facts.push(`${asHeading(t('facet.removability'))}: ${t(`removability.short.${entity.facets.removability}`)}`);
    if (entity.honest_baseline) facts.push(t('mech.honest'));
  }
  if ('actor' in entity && typeof entity.actor === 'string') facts.push(`${asHeading(t('int.actor'))}: ${t(`iactor.${entity.actor}`)}`);
  if ('scope' in entity) facts.push(`${asHeading(t('int.scope'))}: ${t(`scope.${entity.scope}`)}`);
  if ('cost' in entity) facts.push(`${asHeading(t('int.cost'))}: ${t(`cost.${entity.cost}`)}`);
  if ('evidence_level' in entity) facts.push(`${asHeading(t('common.evidence'))}: ${t(`level.${entity.evidence_level}`)}`);
  out.push(...bullets(t('md.facts'), facts));

  if ('pass_condition' in entity) out.push(`## ${asHeading(t('bar.pass'))}`, '', entity.pass_condition, '');
  if ('trigger_rule' in entity) out.push(`## ${asHeading(t('patterns.trigger'))}`, '', entity.trigger_rule, '');

  if ('specimens' in entity && entity.specimens.length) {
    out.push(`## ${t('specimen.section')}`, '', t('specimen.disclaimer'), '');
    for (const specimen of entity.specimens) out.push(...renderSpecimen(specimen, t));
  }

  if ('establishes' in entity) out.push(...bullets(asHeading(t('pat.establishes')), entity.establishes));
  if ('non_inferences' in entity) out.push(...bullets(asHeading(t('art.nonInf')), entity.non_inferences));
  if ('expected_effects' in entity) out.push(...bullets(asHeading(t('int.effects')), entity.expected_effects));
  if ('measurements' in entity) out.push(...bullets(asHeading(t('int.measurements')), entity.measurements.map((m) => `\`${m}\``)));

  if ('probes' in entity && entity.probes.length) {
    out.push(
      ...bullets(
        t('art.probes'),
        entity.probes.map((p) => `**${p.id}** (${t(`cost.${p.cost}`)}) — ${p.action} → ${p.expected_signal}`)
      )
    );
  }

  // Relations, each one a link that resolves wherever this file ends up.
  const relations: string[] = [];
  if ('operates_at' in entity) relations.push(...entity.operates_at.map((id) => `${t('relation.operates_at')} — ${idLink(id, bundle)}`));
  if ('emissions' in entity) relations.push(...entity.emissions.map((e) => `${t('relation.emits')} — ${idLink(e.artifact, bundle)}`));
  if ('amplifies' in entity) relations.push(...entity.amplifies.map((id) => `${t('relation.amplifies')} — ${idLink(id, bundle)}`));
  if ('masks' in entity) relations.push(...entity.masks.map((id) => `${t('relation.masks')} — ${idLink(id, bundle)}`));
  if ('precedes' in entity) relations.push(...entity.precedes.map((id) => `${t('relation.precedes')} — ${idLink(id, bundle)}`));
  if ('required_artifacts' in entity) relations.push(...entity.required_artifacts.map((id) => idLink(id, bundle)));
  if ('compatible_mechanisms' in entity) relations.push(...entity.compatible_mechanisms.map((id) => idLink(id, bundle)));
  if ('mechanisms' in entity && Array.isArray(entity.mechanisms)) relations.push(...entity.mechanisms.map((id) => idLink(id, bundle)));
  if ('targets' in entity) relations.push(...entity.targets.map((id) => `${t('relation.targets')} — ${idLink(id, bundle)}`));
  out.push(...bullets(t('md.relations'), relations));

  if ('edges' in entity && Array.isArray(entity.edges)) {
    out.push(...bullets(t('loop.edges'), entity.edges.map((e) => `${e.from} ${t(`relation.${e.relation}`)} ${e.to}`)));
  }

  out.push('---', '', t('md.footer'), '');
  return out.join('\n');
}

/** The whole catalogue, for a reader who wants one file rather than seventy. */
export function catalogueMarkdown(bundle: RegistryBundle, lang: Lang, t: Translate): string {
  const out = [
    '---',
    `title: ${JSON.stringify(t('registry.title'))}`,
    `lang: ${lang}`,
    `registry: ${bundle.version}`,
    `canonical: ${SITE}/registry`,
    `json: ${SITE}/data/latest/registry.json`,
    '---',
    '',
    `# ${t('registry.title')}`,
    '',
    t('registry.intro', { n: bundle.artifacts.length + bundle.barriers.length + bundle.mechanisms.length + bundle.patterns.length + bundle.loops.length + bundle.interventions.length }),
    '',
  ];

  const sections: [string, Entity[]][] = [
    [t('entity.plural.artifact'), bundle.artifacts],
    [t('entity.plural.barrier'), bundle.barriers],
    [t('entity.plural.mechanism'), bundle.mechanisms],
    [t('entity.plural.pattern'), bundle.patterns],
    [t('entity.plural.loop'), bundle.loops],
    [t('entity.plural.intervention'), bundle.interventions],
  ];

  for (const [heading, nodes] of sections) {
    out.push(`## ${heading}`, '');
    for (const node of nodes) {
      const summary = 'summary' in node ? node.summary : 'description' in node ? node.description : '';
      out.push(`- [${node.id}](${SITE}/${ROUTES[node.type]}/${node.id}) **${node.title}** — ${summary}`);
    }
    out.push('');
  }

  out.push('---', '', t('md.footer'), '');
  return out.join('\n');
}
