/**
 * Share cards, one per entity per language.
 *
 * Same mechanism as verbacorpus — satori turns a layout into SVG, resvg turns
 * that into a PNG — but run at build time rather than in the Worker. That keeps
 * it off any plan that meters CPU per request, keeps `_worker.js` a plain
 * dependency-free module (the tests import it directly, and CI forbids
 * generated output under site/public), and makes every card a cacheable static
 * asset instead of a render.
 *
 * The card leads with the tell: the one line from the entity's first specimen
 * that the entry exists to point at. A card that only carried a title would be
 * a link preview; this one is an argument.
 */
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import {
  findRegistryRoot,
  loadRegistryFromRoot,
  type ContentLang,
  type RegistryBundle,
  type Specimen,
} from '@hoba/registry';

const root = findRegistryRoot(process.cwd());
if (!root) throw new Error('build-cards: registry root not found');
const OUT = path.join(root, 'site', 'dist', 'cards');

// Layer hues, matching --g-* in the site's dark theme.
const HUE: Record<string, string> = {
  artifact: '#a371f7',
  barrier: '#3fb950',
  mechanism: '#58a6ff',
  pattern: '#f0883e',
  loop: '#db61a2',
  intervention: '#22d3ee',
};
const BG = '#0a0c10';
const TEXT = '#e6edf3';
const MUTED = '#8b949e';
const LINE = '#1f2633';

const FONT_DIR = path.join(root, 'node_modules', '@fontsource', 'inter', 'files');
const font = (name: string) => fs.readFileSync(path.join(FONT_DIR, name));

/**
 * Inter ships as subsets, and satori resolves at most one file per
 * family+weight — two files called "Inter" at weight 400 means the second is
 * never consulted and every Cyrillic glyph renders as a NO GLYPH box. The
 * subsets therefore get distinct family names and are listed as a fallback
 * chain on `fontFamily`, which satori does walk.
 */
const SUBSETS = ['latin', 'cyrillic', 'cyrillic-ext', 'latin-ext'] as const;
const FAMILY = SUBSETS.map((s) => `Inter-${s}`).join(', ');
const FONTS = SUBSETS.flatMap((subset) =>
  ([400, 600] as const).map((weight) => ({
    name: `Inter-${subset}`,
    data: font(`inter-${subset}-${weight}-normal.woff`),
    weight,
    style: 'normal' as const,
  }))
);

const LABELS: Record<ContentLang, Record<string, string>> = {
  en: { artifact: 'Observation', barrier: 'Barrier', mechanism: 'Mechanism', pattern: 'Pattern', loop: 'Loop', intervention: 'Intervention', badge: 'reconstruction' },
  uk: { artifact: 'Спостереження', barrier: 'Барʼєр', mechanism: 'Механізм', pattern: 'Патерн', loop: 'Цикл', intervention: 'Інтервенція', badge: 'реконструкція' },
};

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style: { display: 'flex', ...style }, children } });
const text = (value: string, style: Record<string, unknown>): Node => el('div', style, value);

/** The line the entry exists to point at, if the entity has one. */
function tell(specimens: Specimen[]): { label: string; line: string } | undefined {
  for (const specimen of specimens) {
    const marked = specimen.lines.find((l) => l.tell);
    if (marked) return { label: specimen.label, line: marked.text };
  }
  return undefined;
}

function truncate(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`;
}

interface Entity {
  id: string;
  type: string;
  title: string;
  summary?: string;
  description?: string;
  specimens: Specimen[];
}

function card(entity: Entity, lang: ContentLang, bundle: RegistryBundle, size: 'og' | 'postcard') {
  const hue = HUE[entity.type] ?? MUTED;
  const labels = LABELS[lang];
  const excerpt = tell(entity.specimens);
  const body = entity.summary ?? entity.description ?? '';
  const width = size === 'og' ? 1200 : 1080;
  const height = size === 'og' ? 630 : 1350;
  const pad = size === 'og' ? 72 : 88;

  const header = el('div', { alignItems: 'center', gap: 16 }, [
    el('div', { width: 12, height: 12, borderRadius: 999, backgroundColor: hue }),
    text(labels[entity.type] ?? entity.type, { fontSize: size === 'og' ? 26 : 32, color: MUTED, fontWeight: 600 }),
    text(entity.id, { fontSize: size === 'og' ? 26 : 32, color: hue, fontWeight: 600, letterSpacing: '0.04em' }),
  ]);

  const title = text(truncate(entity.title, size === 'og' ? 88 : 110), {
    fontSize: size === 'og' ? 58 : 68,
    lineHeight: 1.15,
    color: TEXT,
    fontWeight: 600,
    marginTop: 28,
  });

  const middle = excerpt
    ? el('div', { flexDirection: 'column', marginTop: 34, paddingLeft: 26, borderLeft: `4px solid ${hue}` }, [
        text(truncate(excerpt.line, size === 'og' ? 190 : 320), {
          fontSize: size === 'og' ? 30 : 38,
          lineHeight: 1.45,
          color: TEXT,
        }),
        text(`${excerpt.label} · ${labels.badge}`, { fontSize: size === 'og' ? 21 : 26, color: MUTED, marginTop: 16 }),
      ])
    : text(truncate(body, size === 'og' ? 220 : 380), {
        fontSize: size === 'og' ? 30 : 38,
        lineHeight: 1.45,
        color: MUTED,
        marginTop: 34,
      });

  const footer = el('div', { alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${LINE}`, paddingTop: 24 }, [
    text('hoba.work', { fontSize: size === 'og' ? 26 : 32, color: TEXT, fontWeight: 600 }),
    text(`${entity.id} · ${bundle.version}`, { fontSize: size === 'og' ? 22 : 28, color: MUTED }),
  ]);

  return {
    tree: el('div', {
      width,
      height,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: BG,
      padding: pad,
      fontFamily: FAMILY,
    }, [el('div', { flexDirection: 'column', flexGrow: 1 }, [header, title, middle]), footer]),
    width,
    height,
  };
}

async function render(entity: Entity, lang: ContentLang, bundle: RegistryBundle, size: 'og' | 'postcard'): Promise<Buffer> {
  const { tree, width, height } = card(entity, lang, bundle, size);
  const svg = await satori(tree as never, { width, height, fonts: FONTS });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng());
}

const collections = (bundle: RegistryBundle): Entity[] => [
  ...bundle.artifacts,
  ...bundle.barriers,
  ...bundle.mechanisms,
  ...bundle.patterns,
  ...bundle.loops,
  ...bundle.interventions,
];

// Postcards are the portrait, story-shaped variant; only the entries people
// actually share get one, so the deploy does not carry 500 images.
const POSTCARD_TYPES = new Set(['artifact', 'pattern']);

async function main(): Promise<void> {
  const langs: ContentLang[] = ['en', 'uk'];
  let written = 0;
  let bytes = 0;

  for (const lang of langs) {
    const bundle = loadRegistryFromRoot(root!, lang);
    const dir = path.join(OUT, lang);
    fs.mkdirSync(dir, { recursive: true });
    for (const entity of collections(bundle)) {
      for (const size of ['og', 'postcard'] as const) {
        if (size === 'postcard' && !POSTCARD_TYPES.has(entity.type)) continue;
        const png = await render(entity, lang, bundle, size);
        fs.writeFileSync(path.join(dir, `${entity.id}${size === 'og' ? '' : '-postcard'}.png`), png);
        written++;
        bytes += png.length;
      }
    }
  }

  process.stdout.write(`cards: ${written} PNGs, ${(bytes / 1024 / 1024).toFixed(1)} MB in site/dist/cards/\n`);
}

main().catch((error) => {
  process.stderr.write(`build-cards: ${error.message}\n`);
  process.exit(1);
});
