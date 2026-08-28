/**
 * Share cards, one per entity per language and one per top-level section.
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
  actor: '#8b949e',
  era: '#d29922',
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
  ([400, 600, 700] as const).map((weight) => ({
    name: `Inter-${subset}`,
    data: font(`inter-${subset}-${weight === 700 ? 600 : weight}-normal.woff`),
    weight,
    style: 'normal' as const,
  }))
);

const LABELS: Record<ContentLang, Record<string, string>> = {
  en: {
    actor: 'Actor',
    era: 'Era',
    artifact: 'Observation',
    barrier: 'Barrier',
    mechanism: 'Mechanism',
    pattern: 'Pattern',
    loop: 'Loop',
    intervention: 'Intervention',
    badge: 'reconstruction',
    causalAtlas: 'Causal Atlas',
  },
  uk: {
    actor: 'Актор',
    era: 'Епоха',
    artifact: 'Спостереження',
    barrier: 'Барʼєр',
    mechanism: 'Механізм',
    pattern: 'Патерн',
    loop: 'Цикл',
    intervention: 'Інтервенція',
    badge: 'реконструкція',
    causalAtlas: 'Причинний атлас',
  },
};

const STAGE_LABELS: Record<ContentLang, Record<string, string>> = {
  en: {
    pre_posting: 'Pre-posting',
    sourcing: 'Sourcing',
    screening: 'Screening',
    technical: 'Technical',
    interview: 'Interviews',
    offer: 'Offer & Decision',
    post_offer: 'Post-offer',
  },
  uk: {
    pre_posting: 'До публікації',
    sourcing: 'Сорсинг',
    screening: 'Скринінг',
    technical: 'Технічний етап',
    interview: 'Інтервʼю',
    offer: 'Офер і рішення',
    post_offer: 'Після оферу',
  },
};

const REMOVABILITY_LABELS: Record<ContentLang, Record<string, string>> = {
  en: {
    none: 'Exogenous (No agency)',
    candidate: 'Candidate Action',
    intermediary: 'Intermediary Dependent',
  },
  uk: {
    none: 'Поза контролем',
    candidate: 'Дії кандидата',
    intermediary: 'Залежить від посередника',
  },
};

const REMOVABILITY_COLORS: Record<string, string> = {
  none: '#f87171',
  candidate: '#34d399',
  intermediary: '#fbbf24',
};

const EVIDENCE_LABELS: Record<ContentLang, Record<number, string>> = {
  en: {
    1: 'Evidence: L1 (Primary Records)',
    2: 'Evidence: L2 (Verified Testimonies)',
    3: 'Evidence: L3 (Empirical Correlations)',
  },
  uk: {
    1: 'Доказовість: Рівень 1 (Первинні записи)',
    2: 'Доказовість: Рівень 2 (Верифіковані свідоцтва)',
    3: 'Доказовість: Рівень 3 (Емпіричні кореляції)',
  },
};

// Secondary hues for dual-tone generative mesh and glowing gradients
const SECONDARY_HUE: Record<string, string> = {
  actor: '#2dd4bf',
  era: '#f59e0b',
  artifact: '#38bdf8',
  barrier: '#f43f5e',
  mechanism: '#818cf8',
  pattern: '#ec4899',
  loop: '#fbbf24',
  intervention: '#34d399',
};

const EMOTIONAL_HOOKS: Record<ContentLang, Record<string, string>> = {
  en: {
    artifact: 'EMPIRICAL SIGNAL · SYSTEMIC EVIDENCE',
    barrier: 'SYSTEMIC BOTTLENECK · FUNNEL DISRUPTION',
    mechanism: 'CAUSAL ENGINE · UNDERLYING DYNAMICS',
    pattern: 'STRUCTURAL CONTRADICTION · EQUILIBRIUM TRAP',
    loop: 'REINFORCING FEEDBACK · VICIOUS CYCLE',
    intervention: 'LEVERAGE POINT · STRUCTURAL FIX',
    era: 'MACROECONOMIC REGIME · CAPITAL CYCLE',
    actor: 'ACTOR PERSPECTIVE · INCENTIVES & BLIND SPOTS',
    section: 'CAUSAL SYSTEMS ATLAS · OPEN RESEARCH',
  },
  uk: {
    artifact: 'РЕАЛЬНИЙ СИГНАЛ · ЕМПІРИЧНЕ СВІДЧЕННЯ',
    barrier: 'СИСТЕМНИЙ ТУПИК · ЖОРСТКИЙ БАРʼЄР ВОРОНКИ',
    mechanism: 'ПРИХОВАНИЙ МЕХАНІЗМ · ПРИЧИННА ДИНАМІКА',
    pattern: 'СИСТЕМНА СУПЕРЕЧНІСТЬ · РОЗРИВ КООРДИНАЦІЇ',
    loop: 'САМОПІДСИЛЮВАЛЬНА ПАСТКА · ЗАМКНЕНЕ КОЛО',
    intervention: 'ТОЧКА ЗЛАМУ · СТРУКТУРНЕ РІШЕННЯ',
    era: 'МАКРОЕКОНОМІЧНИЙ РЕЖИМ · ЕПОХА КАПІТАЛУ',
    actor: 'ПОЗИЦІЯ АКТОРА · МОТИВАЦІЯ ТА СЛІПІ ЗОНИ',
    section: 'ПРИЧИННИЙ АТЛАС · ВІДКРИТЕ ДОСЛІДЖЕННЯ',
  },
};

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children },
});
const rawSvg = (type: string, props: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { ...props, children },
});
const text = (value: string, style: Record<string, unknown>): Node => el('div', style, value);

/** Deterministic PRNG seeded by string (SFC32) */
function createRng(seedStr: string) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < seedStr.length; i++) {
    const k = seedStr.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  let a = h1, b = h2, c = h3, d = h4;
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (a + b | 0) + d | 0;
    d = d + 1 | 0;
    a = b ^ (b >>> 9);
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

/** Generates rich parametric generative vector graphics for the card background */
function generateParametricBackground(id: string, type: string, primaryHue: string, width: number, height: number): Node {
  const rng = createRng(`${id}-${type}-v3`);
  const secondaryHue = SECONDARY_HUE[type] ?? '#38bdf8';
  const elements: Node[] = [];

  // 1. Defs: Glowing gradients
  const defs = rawSvg('defs', {}, [
    rawSvg('radialGradient', { id: `glow-primary-${id}`, cx: '85%', cy: '25%', r: '65%' }, [
      rawSvg('stop', { offset: '0%', 'stop-color': primaryHue, 'stop-opacity': '0.36' }),
      rawSvg('stop', { offset: '45%', 'stop-color': primaryHue, 'stop-opacity': '0.10' }),
      rawSvg('stop', { offset: '100%', 'stop-color': primaryHue, 'stop-opacity': '0' }),
    ]),
    rawSvg('radialGradient', { id: `glow-secondary-${id}`, cx: '15%', cy: '85%', r: '55%' }, [
      rawSvg('stop', { offset: '0%', 'stop-color': secondaryHue, 'stop-opacity': '0.22' }),
      rawSvg('stop', { offset: '50%', 'stop-color': secondaryHue, 'stop-opacity': '0.06' }),
      rawSvg('stop', { offset: '100%', 'stop-color': secondaryHue, 'stop-opacity': '0' }),
    ]),
    rawSvg('linearGradient', { id: `line-grad-${id}`, x1: '0%', y1: '0%', x2: '100%', y2: '100%' }, [
      rawSvg('stop', { offset: '0%', 'stop-color': primaryHue, 'stop-opacity': '0.7' }),
      rawSvg('stop', { offset: '100%', 'stop-color': secondaryHue, 'stop-opacity': '0.2' }),
    ]),
  ]);
  elements.push(defs);

  // 2. Base radial glow fills
  elements.push(rawSvg('rect', { x: 0, y: 0, width, height, fill: `url(#glow-primary-${id})` }));
  elements.push(rawSvg('rect', { x: 0, y: 0, width, height, fill: `url(#glow-secondary-${id})` }));

  // 3. Technical background coordinate grid & micro crosshairs
  const gridSize = width > 1100 ? 100 : 80;
  for (let x = gridSize; x < width; x += gridSize * 2) {
    for (let y = gridSize; y < height; y += gridSize * 2) {
      if (rng() > 0.6) {
        // Micro crosshair (+)
        elements.push(
          rawSvg('line', { x1: x - 4, y1: y, x2: x + 4, y2: y, stroke: '#ffffff', 'stroke-opacity': '0.12', 'stroke-width': '1' }),
          rawSvg('line', { x1: x, y1: y - 4, x2: x, y2: y + 4, stroke: '#ffffff', 'stroke-opacity': '0.12', 'stroke-width': '1' })
        );
      }
    }
  }

  // 4. Parametric Flow Waves (Topological Iso-contours)
  const curveCount = 8;
  for (let i = 0; i < curveCount; i++) {
    const yStart = height * 0.15 + (height * 0.7 * (i / curveCount)) + (rng() - 0.5) * 60;
    const cp1x = width * (0.3 + (rng() - 0.5) * 0.2);
    const cp1y = yStart + (rng() - 0.5) * 180;
    const cp2x = width * (0.7 + (rng() - 0.5) * 0.2);
    const cp2y = yStart + (rng() - 0.5) * 180;
    const yEnd = yStart + (rng() - 0.5) * 120;

    const d = `M -20 ${yStart.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${width + 20} ${yEnd.toFixed(1)}`;
    const opacity = (0.08 + (i / curveCount) * 0.18).toFixed(2);
    const strokeWidth = (1 + rng() * 1.5).toFixed(1);
    const dashed = rng() > 0.7 ? '6 12' : 'none';

    elements.push(
      rawSvg('path', {
        d,
        stroke: i % 2 === 0 ? primaryHue : secondaryHue,
        'stroke-width': strokeWidth,
        'stroke-opacity': opacity,
        'stroke-dasharray': dashed,
        fill: 'none',
      })
    );
  }

  // 5. Parametric Graph Constellation (Causal Network Nodes & Interconnecting Arcs)
  const nodeCount = 14;
  const nodes: Array<{ x: number; y: number; r: number; color: string }> = [];
  const focusX = width * 0.72;
  const focusY = height * 0.42;

  for (let i = 0; i < nodeCount; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 60 + rng() * (width > 1100 ? 320 : 380);
    const nx = focusX + Math.cos(angle) * dist * 1.2;
    const ny = focusY + Math.sin(angle) * dist * 0.9;

    if (nx > 40 && nx < width - 40 && ny > 40 && ny < height - 40) {
      nodes.push({
        x: nx,
        y: ny,
        r: 2.5 + rng() * 4,
        color: rng() > 0.35 ? primaryHue : secondaryHue,
      });
    }
  }

  // Draw connecting causal edges between close nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.hypot(dx, dy);

      if (distance < 180) {
        const edgeOpacity = (0.28 * (1 - distance / 180)).toFixed(2);
        elements.push(
          rawSvg('line', {
            x1: nodes[i].x.toFixed(1),
            y1: nodes[i].y.toFixed(1),
            x2: nodes[j].x.toFixed(1),
            y2: nodes[j].y.toFixed(1),
            stroke: nodes[i].color,
            'stroke-width': '1.2',
            'stroke-opacity': edgeOpacity,
          })
        );
      }
    }
  }

  // Draw nodes & luminous outer halos
  for (const n of nodes) {
    // Outer halo ring
    elements.push(
      rawSvg('circle', {
        cx: n.x.toFixed(1),
        cy: n.y.toFixed(1),
        r: (n.r * 2.8).toFixed(1),
        stroke: n.color,
        'stroke-width': '1',
        'stroke-opacity': '0.3',
        fill: 'none',
      })
    );
    // Core node
    elements.push(
      rawSvg('circle', {
        cx: n.x.toFixed(1),
        cy: n.y.toFixed(1),
        r: n.r.toFixed(1),
        fill: n.color,
        'fill-opacity': '0.9',
      })
    );
  }

  // 6. Parametric Spiral / Vortex for Loops & Patterns
  if (type === 'loop' || type === 'pattern') {
    const spiralPoints: string[] = [];
    const centerX = focusX + 40;
    const centerY = focusY;
    for (let a = 0; a < Math.PI * 5; a += 0.25) {
      const rad = 10 + a * 14;
      const px = centerX + Math.cos(a) * rad;
      const py = centerY + Math.sin(a) * rad;
      spiralPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
    }
    elements.push(
      rawSvg('polyline', {
        points: spiralPoints.join(' '),
        stroke: primaryHue,
        'stroke-width': '1.8',
        'stroke-opacity': '0.4',
        'stroke-dasharray': '4 6',
        fill: 'none',
      })
    );
  }

  return rawSvg('svg', {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
  }, elements);
}

/** The line the entry exists to point at, if the entity has one. */
function tell(specimens?: Specimen[]): { label: string; line: string } | undefined {
  if (!specimens) return undefined;
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
  specimens?: Specimen[];
  stage?: string;
  stages?: string[];
  target_stage?: string;
  operates_at?: string;
  facets?: { removability?: string };
  cost?: string;
  evidence_level?: number;
}

function card(entity: Entity, lang: ContentLang, bundle: RegistryBundle, size: 'og' | 'postcard') {
  const hue = HUE[entity.type] ?? MUTED;
  const labels = LABELS[lang];
  const excerpt = tell(entity.specimens);
  const body = entity.summary ?? entity.description ?? '';
  const width = size === 'og' ? 1200 : 1080;
  const height = size === 'og' ? 630 : 1350;
  const pad = size === 'og' ? 56 : 72;

  // Resolve Hook Category Kicker
  const hookKicker = EMOTIONAL_HOOKS[lang][entity.type] ?? EMOTIONAL_HOOKS[lang].section;

  // Resolve Stage badge
  const rawStage = entity.stage ?? entity.target_stage ?? entity.operates_at ?? (entity.stages && entity.stages[0]);
  const stageLabel = rawStage && STAGE_LABELS[lang][rawStage];

  // Resolve Removability / Agency Zone badge
  const rawRemovability = entity.facets?.removability;
  const removabilityLabel = rawRemovability && REMOVABILITY_LABELS[lang][rawRemovability];
  const removabilityColor = rawRemovability ? REMOVABILITY_COLORS[rawRemovability] : undefined;

  // Resolve Evidence badge
  const evidenceLabel = entity.evidence_level && EVIDENCE_LABELS[lang][entity.evidence_level];

  // Badges list with glassmorphism glow
  const badges: Node[] = [
    el('div', {
      alignItems: 'center',
      gap: 10,
      padding: size === 'og' ? '6px 14px' : '8px 18px',
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.07)',
      border: `1px solid rgba(255, 255, 255, 0.12)`,
    }, [
      el('div', { width: 10, height: 10, borderRadius: 999, backgroundColor: hue, boxShadow: `0 0 10px ${hue}` }),
      text(`${labels[entity.type] ?? entity.type} · ${entity.id}`, {
        fontSize: size === 'og' ? 20 : 26,
        color: TEXT,
        fontWeight: 700,
        letterSpacing: '-0.01em',
      }),
    ]),
  ];

  if (stageLabel) {
    badges.push(
      el('div', {
        padding: size === 'og' ? '6px 14px' : '8px 18px',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
      }, [
        text(stageLabel, { fontSize: size === 'og' ? 19 : 24, color: '#c9d1d9', fontWeight: 500 }),
      ])
    );
  }

  if (removabilityLabel) {
    badges.push(
      el('div', {
        padding: size === 'og' ? '6px 14px' : '8px 18px',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${removabilityColor ?? 'rgba(255, 255, 255, 0.1)'}44`,
      }, [
        text(removabilityLabel, { fontSize: size === 'og' ? 19 : 24, color: removabilityColor ?? MUTED, fontWeight: 700 }),
      ])
    );
  }

  // Header with Kicker + Badges + Brand Mark
  const header = el('div', { flexDirection: 'column', width: '100%', gap: 14 }, [
    el('div', { alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
      el('div', { alignItems: 'center', gap: 10 }, [
        el('div', { width: 8, height: 8, borderRadius: 999, backgroundColor: hue, boxShadow: `0 0 8px ${hue}` }),
        text(hookKicker, {
          fontSize: size === 'og' ? 15 : 20,
          color: '#8b949e',
          fontWeight: 700,
          letterSpacing: '0.12em',
        }),
      ]),
      el('div', { alignItems: 'center', gap: 8 }, [
        text('hoba', {
          fontSize: size === 'og' ? 26 : 34,
          color: TEXT,
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }),
        text('· atlas', {
          fontSize: size === 'og' ? 20 : 26,
          color: hue,
          fontWeight: 600,
        }),
      ]),
    ]),
    el('div', { alignItems: 'center', gap: 10, flexWrap: 'wrap' }, badges),
  ]);

  // Main Title (Huge, High Contrast)
  const title = text(truncate(entity.title, size === 'og' ? 88 : 110), {
    fontSize: size === 'og' ? 48 : 60,
    lineHeight: 1.15,
    color: '#ffffff',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginTop: size === 'og' ? 18 : 32,
  });

  // Specimen / Tell Callout (The Emotional Core)
  const middle = excerpt
    ? el('div', {
        flexDirection: 'column',
        marginTop: size === 'og' ? 20 : 36,
        padding: size === 'og' ? '18px 24px' : '26px 32px',
        borderRadius: 14,
        backgroundColor: 'rgba(13, 17, 23, 0.85)',
        border: `1px solid rgba(255, 255, 255, 0.12)`,
        borderLeft: `6px solid ${hue}`,
        position: 'relative',
      }, [
        el('div', { alignItems: 'flex-start', gap: 14 }, [
          text('“', {
            fontSize: size === 'og' ? 44 : 58,
            lineHeight: 0.9,
            color: hue,
            fontWeight: 800,
          }),
          el('div', { flexDirection: 'column', flexGrow: 1 }, [
            text(truncate(excerpt.line, size === 'og' ? 180 : 320), {
              fontSize: size === 'og' ? 26 : 32,
              lineHeight: 1.4,
              color: '#f0f6fc',
              fontWeight: 500,
            }),
            el('div', { alignItems: 'center', gap: 10, marginTop: 12 }, [
              text(excerpt.label, { fontSize: size === 'og' ? 18 : 22, color: '#8b949e', fontWeight: 600 }),
              text('·', { fontSize: size === 'og' ? 18 : 22, color: '#484f58' }),
              text(labels.badge, { fontSize: size === 'og' ? 17 : 21, color: hue, fontWeight: 600 }),
            ]),
          ]),
        ]),
      ])
    : el('div', {
        flexDirection: 'column',
        marginTop: size === 'og' ? 20 : 36,
        padding: size === 'og' ? '18px 24px' : '26px 32px',
        borderRadius: 14,
        backgroundColor: 'rgba(13, 17, 23, 0.7)',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
      }, [
        text(truncate(body, size === 'og' ? 220 : 380), {
          fontSize: size === 'og' ? 26 : 32,
          lineHeight: 1.45,
          color: '#c9d1d9',
        }),
      ]);

  // Bottom Status & Attribution Bar
  const footer = el('div', {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    width: '100%',
  }, [
    el('div', { alignItems: 'center', gap: 16 }, [
      text('https://hoba.work', {
        fontSize: size === 'og' ? 21 : 26,
        color: '#ffffff',
        fontWeight: 700,
        letterSpacing: '-0.01em',
      }),
      evidenceLabel
        ? el('div', {
            padding: '3px 10px',
            borderRadius: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }, [
            text(evidenceLabel, { fontSize: size === 'og' ? 16 : 20, color: '#8b949e', fontWeight: 500 }),
          ])
        : null,
    ].filter(Boolean)),
    el('div', { alignItems: 'center', gap: 10 }, [
      text(`${entity.id} · ${bundle.version}`, {
        fontSize: size === 'og' ? 18 : 22,
        color: '#8b949e',
        fontFamily: 'monospace',
      }),
    ]),
  ]);

  // Complete Card Layout with Parametric Background Underlay
  const bgVisual = generateParametricBackground(entity.id, entity.type, hue, width, height);

  return {
    tree: el('div', {
      width,
      height,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#07090e',
      padding: pad,
      fontFamily: FAMILY,
      position: 'relative',
      overflow: 'hidden',
    }, [
      bgVisual,
      el('div', {
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        position: 'relative',
      }, [
        el('div', { flexDirection: 'column' }, [header, title, middle]),
        footer,
      ]),
    ]),
    width,
    height,
  };
}

interface SectionCard {
  id: string;
  title: Record<ContentLang, string>;
  kicker: Record<ContentLang, string>;
  summary: Record<ContentLang, string>;
  hue: string;
}

const SECTION_CARDS: SectionCard[] = [
  {
    id: 'og-home',
    title: { en: 'Hiring Obstacles & Barriers Atlas', uk: 'Атлас барʼєрів та перешкод найму' },
    kicker: { en: 'Open Causal Atlas', uk: 'Відкритий причинний атлас' },
    summary: {
      en: '89 machine-readable causal nodes explaining why the tech hiring funnel breaks and what systemic dynamics operate behind the scenes.',
      uk: '89 верифікованих вузлів, що пояснюють, чому буксує воронка технічного найму та яка прихована динаміка стоїть за цим.',
    },
    hue: '#58a6ff',
  },
  {
    id: 'og-analyze',
    title: { en: 'Situation Diagnostic Wizard', uk: 'Діагностика ситуацій у воронці' },
    kicker: { en: 'HOBA Diagnostic Engine', uk: 'Діагностичний рушій HOBA' },
    summary: {
      en: 'Trace witnessed symptoms (H) through funnel obstacles (O) to root mechanisms (B) and falsifiable diagnostic probes (A).',
      uk: 'Відстежуйте спостережувані сигнали (H) через барʼєри воронки (O) до кореневих механізмів (B) та фальсифікованих проб (A).',
    },
    hue: '#a371f7',
  },
  {
    id: 'og-check',
    title: { en: 'Arithmetic Screening Checker', uk: 'Перевірка відповідності та відсіву' },
    kicker: { en: 'Automated Funnel Audit', uk: 'Аудит правил відбору' },
    summary: {
      en: 'Audit knockout screening arithmetic, turnaround feedback latency anomalies, and financial runway solvency risk.',
      uk: 'Аудит правил автоматичного відсіву, діагностика затримок зворотного звʼязку та фінансової витривалості runway.',
    },
    hue: '#3fb950',
  },
  {
    id: 'og-process',
    title: { en: 'Funnel Process Simulator', uk: 'Симулятор процесів воронки' },
    kicker: { en: 'Interactive State Machine', uk: 'Інтерактивний автомат станів' },
    summary: {
      en: 'Simulate realistic hiring pipelines, candidate visibility gaps, and branch deviations step-by-step with camera pan-zoom.',
      uk: 'Симуляція реалістичних пайплайнів найму, сліпих зон кандидата та відхилень від ідеального маршруту з авто-зумом.',
    },
    hue: '#22d3ee',
  },
  {
    id: 'og-graph',
    title: { en: 'Knowledge Graph Explorer', uk: 'Провідник причинного графа' },
    kicker: { en: '89 Nodes & Causal Edges', uk: '89 вузлів та причинні звʼязки' },
    summary: {
      en: 'Interactive visual graph with vertical swimlanes, canonical ideal path, and crosshair reticle inspection across the hiring funnel.',
      uk: 'Інтерактивний візуальний граф із 4 вертикальними swimlanes, ідеальним маршрутом та перехресним фокусуванням.',
    },
    hue: '#58a6ff',
  },
  {
    id: 'og-registry',
    title: { en: 'Atlas Registry & Schemas', uk: 'Реєстр атласу та схеми даних' },
    kicker: { en: 'Open Data Catalog', uk: 'Каталог відкритих даних' },
    summary: {
      en: 'Structured catalog of artifacts, barriers, mechanisms, patterns, loops, and interventions in JSON, CSV, and GraphML.',
      uk: 'Структурований каталог артефактів, барʼєрів, механізмів, патернів, циклів та інтервенцій у форматах JSON, CSV, GraphML.',
    },
    hue: '#d29922',
  },
  {
    id: 'og-patterns',
    title: { en: 'Systemic Contradictions', uk: 'Системні суперечності та патерни' },
    kicker: { en: 'Structural Analysis', uk: 'Структурний аналіз' },
    summary: {
      en: 'Formal contradictions and reinforcing feedback loops driving instability and coordination breakdowns in tech hiring.',
      uk: 'Формальні суперечності та самопідсилювальні петлі зворотного звʼязку в технічному наймі.',
    },
    hue: '#f0883e',
  },
  {
    id: 'og-eras',
    title: { en: 'Macroeconomic Eras', uk: 'Макроекономічні епохи' },
    kicker: { en: 'Historical Regimes', uk: 'Історичні режими' },
    summary: {
      en: 'The structural shift in tech employment from ZIRP capital expansion to post-2022 capital efficiency and discipline.',
      uk: 'Структурна трансформація ринку праці від експансії нульових ставок (ZIRP) до капітальної дисципліни.',
    },
    hue: '#d29922',
  },
  {
    id: 'og-actors',
    title: { en: 'Actor Perspectives & The Lens', uk: 'Перспективи акторів воронки' },
    kicker: { en: 'Multi-Role Analysis', uk: 'Мультирольовий аналіз' },
    summary: {
      en: 'Analyze what candidates, recruiters, hiring managers, and executives decide, incentivize, and what they cannot see.',
      uk: 'Аналіз того, що бачать і вирішують кандидати, рекрутери, наймаючі менеджери та інвестори.',
    },
    hue: '#8b949e',
  },
  {
    id: 'og-methodology',
    title: { en: 'Atlas Methodology', uk: 'Методологія побудови атласу' },
    kicker: { en: 'Causal Identification', uk: 'Причинна ідентифікація' },
    summary: {
      en: 'Separation of symptoms from mechanisms, DAG acyclicity, Tarjan SCC loop discovery, and formal Lean proofs.',
      uk: 'Розділення симптомів і причин, ациклічність DAG барʼєрів, виділення циклів Tarjan SCC та формальні доведення.',
    },
    hue: '#3fb950',
  },
  {
    id: 'og-developers',
    title: { en: 'Developer Tools & CLI', uk: 'Інструменти розробника та CLI' },
    kicker: { en: 'hoba CLI & MCP Server', uk: 'hoba CLI та MCP сервер' },
    summary: {
      en: 'Command-line diagnostics, Model Context Protocol server for AI agents, and raw REST API endpoints.',
      uk: 'Консольна діагностика, сервер протоколу Model Context Protocol (MCP) для AI-агентів та відкриті API.',
    },
    hue: '#58a6ff',
  },
  {
    id: 'og-data',
    title: { en: 'Open Data & Schemas', uk: 'Відкриті дані та схеми' },
    kicker: { en: 'Machine-Readable Assets', uk: 'Машиночитні ресурси' },
    summary: {
      en: 'Raw JSON-LD, OpenAPI schemas, nodes.csv, and machine-readable causal graphs for research.',
      uk: 'Сирі файли JSON-LD, OpenAPI схеми, nodes.csv та причинні графи для дослідників та аналітиків.',
    },
    hue: '#22d3ee',
  },
  {
    id: 'og-about',
    title: { en: 'About hoba', uk: 'Про проєкт hoba' },
    kicker: { en: 'Governance & Independence', uk: 'Незалежність та управління' },
    summary: {
      en: 'Why the atlas exists, why it remains independent and open-source, and citation guidelines.',
      uk: 'Чому створено атлас, чому він залишається відкритим і незалежним, та правила цитування.',
    },
    hue: '#a371f7',
  },
  {
    id: 'og-contribute',
    title: { en: 'Contribution Guide', uk: 'Як долучитися до атласу' },
    kicker: { en: 'Open Peer Review', uk: 'Відкрите рецензування' },
    summary: {
      en: 'How to submit new evidence records, reconstruct specimens, and contribute causal mechanisms.',
      uk: 'Як пропонувати нові записи свідоцтв, реконструювати артефакти та верифікувати причинні механізми.',
    },
    hue: '#3fb950',
  },
  {
    id: 'og-cats',
    title: { en: 'Vector Cat Generator', uk: 'Векторний генератор котиків' },
    kicker: { en: 'Parametric Vector Engine', uk: 'Параметричний векторний рушій' },
    summary: {
      en: 'Combinatorial parametric vector cat generator capable of rendering billions of distinct felines with custom poses, coats, and accessories.',
      uk: 'Параметричний генератор векторних котиків, що створює мільярди унікальних пухнастиків із вибором поз, забарвлень, емоцій та аксесуарів.',
    },
    hue: '#f43f5e',
  },
];

function sectionCard(sec: SectionCard, lang: ContentLang, bundle: RegistryBundle) {
  const width = 1200;
  const height = 630;
  const pad = 56;
  const hue = sec.hue;

  const header = el('div', { flexDirection: 'column', width: '100%', gap: 14 }, [
    el('div', { alignItems: 'center', justifyContent: 'space-between', width: '100%' }, [
      el('div', { alignItems: 'center', gap: 10 }, [
        el('div', { width: 8, height: 8, borderRadius: 999, backgroundColor: hue, boxShadow: `0 0 8px ${hue}` }),
        text(sec.kicker[lang].toUpperCase(), {
          fontSize: 16,
          color: '#8b949e',
          fontWeight: 700,
          letterSpacing: '0.12em',
        }),
      ]),
      el('div', { alignItems: 'center', gap: 8 }, [
        text('hoba', {
          fontSize: 26,
          color: '#ffffff',
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }),
        text('· atlas', {
          fontSize: 20,
          color: hue,
          fontWeight: 600,
        }),
      ]),
    ]),
    el('div', { alignItems: 'center', gap: 10 }, [
      el('div', {
        padding: '6px 14px',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        alignItems: 'center',
        gap: 8,
      }, [
        el('div', { width: 8, height: 8, borderRadius: 999, backgroundColor: hue }),
        text(LABELS[lang].causalAtlas, { fontSize: 18, color: '#f0f6fc', fontWeight: 600 }),
      ]),
      el('div', {
        padding: '6px 14px',
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }, [
        text(bundle.version, { fontSize: 17, color: '#8b949e', fontFamily: 'monospace' }),
      ]),
    ]),
  ]);

  const title = text(truncate(sec.title[lang], 78), {
    fontSize: 52,
    lineHeight: 1.15,
    color: '#ffffff',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    marginTop: 22,
  });

  const middle = el('div', {
    flexDirection: 'column',
    marginTop: 24,
    padding: '20px 26px',
    borderRadius: 14,
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderLeft: `6px solid ${hue}`,
  }, [
    text(truncate(sec.summary[lang], 240), {
      fontSize: 26,
      lineHeight: 1.45,
      color: '#e6edf3',
      fontWeight: 500,
    }),
  ]);

  const footer = el('div', {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
    width: '100%',
  }, [
    text('https://hoba.work', {
      fontSize: 21,
      color: '#ffffff',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    }),
    text('CAUSAL GRAPH · OPEN RESEARCH', {
      fontSize: 16,
      color: '#8b949e',
      fontFamily: 'monospace',
      letterSpacing: '1px',
    }),
  ]);

  const bgVisual = generateParametricBackground(sec.id, 'section', hue, width, height);

  return {
    tree: el('div', {
      width,
      height,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#07090e',
      padding: pad,
      fontFamily: FAMILY,
      position: 'relative',
      overflow: 'hidden',
    }, [
      bgVisual,
      el('div', {
        flexDirection: 'column',
        flexGrow: 1,
        justifyContent: 'space-between',
        position: 'relative',
      }, [
        el('div', { flexDirection: 'column' }, [header, title, middle]),
        footer,
      ]),
    ]),
    width,
    height,
  };
}

async function renderEntityCard(entity: Entity, lang: ContentLang, bundle: RegistryBundle, size: 'og' | 'postcard'): Promise<Buffer> {
  const { tree, width, height } = card(entity, lang, bundle, size);
  const svg = await satori(tree as never, { width, height, fonts: FONTS });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng());
}

async function renderSectionCard(sec: SectionCard, lang: ContentLang, bundle: RegistryBundle): Promise<Buffer> {
  const { tree, width, height } = sectionCard(sec, lang, bundle);
  const svg = await satori(tree as never, { width, height, fonts: FONTS });
  return Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng());
}

const collections = (bundle: RegistryBundle): Entity[] => [
  ...bundle.actors,
  ...bundle.eras,
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
    fs.mkdirSync(path.join(OUT, lang), { recursive: true });
  }

  const tasks: Array<() => Promise<{ path: string; png: Buffer }>> = [];

  for (const lang of langs) {
    const bundle = loadRegistryFromRoot(root!, lang);
    const dir = path.join(OUT, lang);

    // 1. Queue all entity cards
    for (const entity of collections(bundle)) {
      for (const size of ['og', 'postcard'] as const) {
        if (size === 'postcard' && !POSTCARD_TYPES.has(entity.type)) continue;
        const targetFile = path.join(dir, `${entity.id}${size === 'og' ? '' : '-postcard'}.png`);
        const targetLang = lang;
        const targetBundle = bundle;
        const targetEntity = entity;
        const targetSize = size;
        tasks.push(async () => {
          const png = await renderEntityCard(targetEntity, targetLang, targetBundle, targetSize);
          return { path: targetFile, png };
        });
      }
    }

    // 2. Queue all top-level section cards
    for (const sec of SECTION_CARDS) {
      const targetFile = path.join(dir, `${sec.id}.png`);
      const targetLang = lang;
      const targetBundle = bundle;
      const targetSec = sec;
      tasks.push(async () => {
        const png = await renderSectionCard(targetSec, targetLang, targetBundle);
        return { path: targetFile, png };
      });
    }
  }

  // Execute in batches of 16 for high-speed multi-core rendering
  const BATCH_SIZE = 16;
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((fn) => fn()));
    for (const { path: filePath, png } of results) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, png);
      written++;
      bytes += png.length;
    }
  }

  process.stdout.write(`cards: ${written} PNGs, ${(bytes / 1024 / 1024).toFixed(1)} MB in site/dist/cards/\n`);
}

main().catch((error) => {
  process.stderr.write(`build-cards: ${error.message}\n`);
  process.exit(1);
});
