/**
 * Entry bodies, generated from the frontmatter they were duplicating.
 *
 * Every registry entry repeated part of its own frontmatter below the `---`, so
 * the file reads on GitHub. Nothing rendered that copy — the site, the exports,
 * the CLI and the Markdown route all read the frontmatter — so it drifted, and
 * an editor wanting to change a summary had to find and change it twice, which
 * is also why several fixes in the copy-edit pass could not be expressed at all.
 *
 * The body is now derived. Eras and workflows are left alone: their bodies are
 * essays that say something the frontmatter does not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIRS, findRegistryRoot, loadRegistryFromRoot, type ContentLang, type RegistryBundle } from '@hoba/registry';

const root = findRegistryRoot(process.cwd());
if (!root) throw new Error('build-bodies: registry root not found');

const DIRS: Record<ContentLang, string> = CONTENT_DIRS;

interface Words {
  nonInferences: string;
  passCondition: string;
  structuralContext: string;
  causalRelations: string;
  mechanismNonInferences: string;
  triggerRule: string;
  establishes: string;
  notEstablishes: string;
  cycleDynamics: string;
  cycleLead: string;
  expectedEffects: string;
  measurements: string;
  actor: string;
  nature: string;
  removability: string;
  amplifies: string;
  masks: string;
  amplifiesEdge: string;
}

// Taken from the files as they stood, so generating changes nothing but the
// duplication itself. The apostrophe is normalised to U+02BC on the way out.
const WORDS: Record<ContentLang, Words> = {
  en: {
    nonInferences: 'Diagnostic Non-Inferences',
    passCondition: 'Pass Condition',
    structuralContext: 'Structural Context',
    causalRelations: 'Causal Relations',
    mechanismNonInferences: 'Non-Inferences',
    triggerRule: 'Trigger Rule',
    establishes: 'What this Establishes',
    notEstablishes: 'What this Does NOT Establish',
    cycleDynamics: 'Cycle Dynamics',
    cycleLead: 'This causal loop reinforces mechanisms across iterations:',
    expectedEffects: 'Expected Effects',
    measurements: 'Measurements',
    actor: 'Actor',
    nature: 'Nature',
    removability: 'Removability',
    amplifies: 'Amplifies',
    masks: 'Masks',
    amplifiesEdge: 'amplifies',
  },
  uk: {
    nonInferences: 'Діагностичні не-висновки',
    passCondition: 'Умова проходження',
    structuralContext: 'Структурний контекст',
    causalRelations: 'Причинно-наслідкові звʼязки',
    mechanismNonInferences: 'Не-висновки',
    triggerRule: 'Правило спрацьовування',
    establishes: 'Що це встановлює',
    notEstablishes: 'Чого це НЕ встановлює',
    cycleDynamics: 'Динаміка циклу',
    cycleLead: 'Цей причинний цикл підсилює механізми з кожною ітерацією:',
    expectedEffects: 'Очікувані ефекти',
    measurements: 'Вимірювання',
    actor: 'Актор',
    nature: 'Природа',
    removability: 'Усувність',
    amplifies: 'Посилює',
    masks: 'Маскує',
    amplifiesEdge: 'посилює',
  },
};

const section = (heading: string, ...lines: string[]): string[] => [`### ${heading}`, ...lines, ''];
const bullets = (items: string[]): string[] => items.map((i) => `- ${i}`);

function body(node: Record<string, any>, bundle: RegistryBundle, w: Words): string {
  const title = (id: string) =>
    [...bundle.mechanisms, ...bundle.observations, ...bundle.barriers].find((n) => n.id === id)?.title ?? id;
  const out: string[] = [`# ${node.title}`, '', node.summary ?? node.description, ''];

  switch (node.type) {
    case 'observation':
      out.push(...section(w.nonInferences, ...bullets(node.non_inferences)));
      break;
    case 'barrier':
      out.push(...section(w.passCondition, node.pass_condition));
      break;
    case 'mechanism':
      out.push(
        ...section(
          w.structuralContext,
          `- **${w.actor}:** \`${node.facets.actor}\``,
          `- **${w.nature}:** \`${node.facets.nature}\``,
          `- **${w.removability}:** \`${node.facets.removability}\``
        )
      );
      if (node.amplifies.length > 0 || node.masks.length > 0) {
        out.push(
          ...section(w.causalRelations, ...bullets([
            ...node.amplifies.map((id: string) => `${w.amplifies} \`${id}\` — ${title(id)}`),
            ...node.masks.map((id: string) => `${w.masks} \`${id}\` — ${title(id)}`),
          ]))
        );
      }
      out.push(...section(w.mechanismNonInferences, ...bullets(node.non_inferences)));
      break;
    case 'pattern':
      out.push(...section(w.triggerRule, node.trigger_rule));
      out.push(...section(w.establishes, ...bullets(node.establishes)));
      out.push(...section(w.notEstablishes, ...bullets(node.non_inferences)));
      break;
    case 'loop':
      out.push(
        ...section(
          w.cycleDynamics,
          w.cycleLead,
          ...bullets(node.edges.map((e: any) => `\`${e.from}\` ${w.amplifiesEdge} \`${e.to}\``))
        )
      );
      break;
    case 'intervention':
      out.push(...section(w.expectedEffects, ...bullets(node.expected_effects)));
      out.push(...section(w.measurements, ...bullets(node.measurements.map((m: string) => `\`${m}\``))));
      break;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

/**
 * The types with a derived body, as a pair: the bundle key is plural, the
 * directory is the singular type name. They stopped being the same string when
 * the entity tree moved under `data/<lang>/entities/<type>/`.
 */
const COLLECTIONS = [
  ['observations', 'observation'],
  ['barriers', 'barrier'],
  ['mechanisms', 'mechanism'],
  ['patterns', 'pattern'],
  ['loops', 'loop'],
  ['interventions', 'intervention'],
] as const;

let written = 0;
for (const lang of ['en', 'uk'] as const) {
  const bundle = loadRegistryFromRoot(root, lang);
  for (const [collection, dir] of COLLECTIONS) {
    for (const node of bundle[collection] as Record<string, any>[]) {
      const file = path.join(root, DIRS[lang], dir, `${node.id}.md`);
      const raw = fs.readFileSync(file, 'utf8');
      const end = raw.indexOf('\n---\n', 4) + 5;
      const next = raw.slice(0, end) + '\n' + body(node, bundle, WORDS[lang]);
      if (next !== raw) {
        fs.writeFileSync(file, next);
        written++;
      }
    }
  }
}
process.stdout.write(`bodies: ${written} rewritten from frontmatter\n`);
