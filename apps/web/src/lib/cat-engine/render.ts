/**
 * Vector Cat Engine — SVG Vector Renderer
 *
 * Flat "kawaii sticker" art direction: one shared vertical fur gradient in
 * user space so head, body, ears and tail read as a single object; uniform
 * outlines; seams hidden by draw order (tail and ears behind, head over the
 * body top). A per-pose layout table anchors the head, neckline, tail, paws,
 * fur-pattern spots and prop slots so every combination stays attached.
 */

import { getEyeDetails, resolveColors, shiftTone } from './colors.js';
import { createRng } from './prng.js';
import type { CatDNA, CatColors } from './types.js';

interface PoseLayout {
  /** Where the canonical head center (250,185) lands, with scale and tilt. */
  head: { x: number; y: number; scale: number; tilt: number };
  /** Anchor for neck accessories; null when the neck is hidden (box). */
  neckline: { cx: number; cy: number; rx: number } | null;
  tail: { x: number; y: number; angle: number };
  shadow: { cx: number; cy: number; rx: number; ry: number };
  patternSpots: Array<[number, number]>;
  paws: Array<[number, number]>;
  propLeft: [number, number];
  propRight: [number, number];
  /** Body layer markup (drawn behind the head). */
  body: string;
  /** Path data of the body silhouette, used to clip fur patterns. */
  clip: string;
  /** Markup drawn in front of the head/face (box front panel + paws). */
  overlay?: string;
}

export function renderCatSVG(
  dna: CatDNA,
  options: { width?: number; height?: number; idPrefix?: string } = {}
): string {
  const width = options.width ?? 500;
  const height = options.height ?? 500;
  const prefix = options.idPrefix ?? `cat-${dna.seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const colors = resolveColors(dna);

  const layout = buildPoseLayout(dna, colors, prefix);
  const defs = renderDefs(prefix, colors, dna, layout);
  const backdrop = renderBackdrop(dna, colors, prefix);
  const ground = `<ellipse cx="${layout.shadow.cx}" cy="${layout.shadow.cy}" rx="${r1(layout.shadow.rx)}" ry="${layout.shadow.ry}" fill="url(#${prefix}-ground)"/>`;
  const tail = renderTail(dna, colors, layout);
  const propsBehind = renderProps(dna, colors, layout, 'behind');
  const bodyShading = renderBodyShading(colors, layout, prefix);
  const coat = renderCoatOverlays(dna, colors, layout, prefix);
  const neckAcc = renderNeckAccessory(dna, colors, layout);
  const head = renderHead(dna, colors, prefix, layout);
  const propsFront = renderProps(dna, colors, layout, 'front');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="${width}" height="${height}" data-cat-seed="${dna.seed}" style="overflow:visible;user-select:none;">${defs}<g class="cat-root">${backdrop}${ground}<g class="cat-figure" filter="url(#${prefix}-shadow)">${tail}${propsBehind}<g class="cat-body">${layout.body}</g>${bodyShading}${coat}${neckAcc}${head}${layout.overlay ?? ''}${propsFront}</g></g></svg>`;
}

const r1 = (n: number): number => Math.round(n * 10) / 10;

function renderDefs(prefix: string, colors: CatColors, dna: CatDNA, layout: PoseLayout): string {
  const eyeLeftInfo =
    dna.eyeColor === 'heterochromia' ? getEyeDetails('cyanSky') : getEyeDetails(dna.eyeColor);
  const eyeRightInfo =
    dna.eyeColor === 'heterochromia' ? getEyeDetails('amberGold') : getEyeDetails(dna.eyeColor);
  const furTop = colors.furTop ?? shiftTone(colors.primary, 16);
  const furBottom = colors.furBottom ?? shiftTone(colors.primary, -20);

  const eyeGrad = (id: string, info: typeof eyeLeftInfo) =>
    `<radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0%" stop-color="${info.glow}"/><stop offset="52%" stop-color="${info.main}"/><stop offset="100%" stop-color="${info.dark}"/></radialGradient>`;

  return (
    `<defs>` +
    `<filter id="${prefix}-shadow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="${colors.shadow}" flood-opacity="0.85"/></filter>` +
    `<linearGradient id="${prefix}-fur" x1="0" y1="70" x2="0" y2="440" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${furTop}"/><stop offset="0.45" stop-color="${colors.primary}"/><stop offset="1" stop-color="${furBottom}"/></linearGradient>` +
    eyeGrad(`${prefix}-eye-left`, eyeLeftInfo) +
    eyeGrad(`${prefix}-eye-right`, eyeRightInfo) +
    `<radialGradient id="${prefix}-ground" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${colors.shadow}" stop-opacity="0.65"/><stop offset="70%" stop-color="${colors.shadow}" stop-opacity="0.25"/><stop offset="100%" stop-color="${colors.shadow}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${prefix}-blush-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${colors.blush}" stop-opacity="0.75"/><stop offset="70%" stop-color="${colors.blush}" stop-opacity="0.3"/><stop offset="100%" stop-color="${colors.blush}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${prefix}-aura" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.35"/><stop offset="60%" stop-color="${colors.primary}" stop-opacity="0.12"/><stop offset="100%" stop-color="${colors.primary}" stop-opacity="0"/></radialGradient>` +
    `<clipPath id="${prefix}-bodyclip"><path d="${layout.clip}"/></clipPath>` +
    `</defs>`
  );
}

/* ------------------------------------------------------------------ */
/* Pose layouts                                                        */
/* ------------------------------------------------------------------ */

function buildPoseLayout(dna: CatDNA, colors: CatColors, prefix: string): PoseLayout {
  const k = dna.chonkFactor;
  const w = (x: number): number => r1(250 + (x - 250) * k);
  const fur = `url(#${prefix}-fur)`;
  const stroke = colors.lineStroke;
  const outline = `fill="${fur}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"`;

  const paw = (x: number, y: number, rx = 25, ry = 13): string =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${outline}/>` +
    `<line x1="${x - rx * 0.3}" y1="${y - ry * 0.55}" x2="${x - rx * 0.3}" y2="${y + ry * 0.45}" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
    `<line x1="${x + rx * 0.3}" y1="${y - ry * 0.55}" x2="${x + rx * 0.3}" y2="${y + ry * 0.45}" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`;

  const beans = (x: number, y: number, s = 1): string =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    `<ellipse cx="0" cy="0" rx="16" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/>` +
    `<ellipse cx="0" cy="2.5" rx="6" ry="4.5" fill="${colors.nose}"/>` +
    `<circle cx="-8.5" cy="-4" r="2.6" fill="${colors.nose}"/><circle cx="-2.5" cy="-6.5" r="2.6" fill="${colors.nose}"/><circle cx="3.5" cy="-6.5" r="2.6" fill="${colors.nose}"/><circle cx="9" cy="-4" r="2.4" fill="${colors.nose}"/>` +
    `</g>`;

  switch (dna.pose) {
    case 'sitting': {
      const clip = `M ${w(178)} 262 C ${w(150)} 320 ${w(142)} 384 ${w(172)} 402 C ${w(205)} 416 ${w(295)} 416 ${w(328)} 402 C ${w(358)} 384 ${w(350)} 320 ${w(322)} 262 C ${w(300)} 232 ${w(200)} 232 ${w(178)} 262 Z`;
      return {
        head: { x: 250, y: 178, scale: 1, tilt: 0 },
        neckline: { cx: 250, cy: 258, rx: r1(50 * k) },
        tail: { x: w(326), y: 386, angle: -18 },
        shadow: { cx: 250, cy: 410, rx: 122 * k, ry: 14 },
        patternSpots: [
          [w(192), 312],
          [w(308), 312],
          [w(205), 366],
          [w(295), 366],
        ],
        paws: [
          [w(218), 402],
          [w(282), 402],
        ],
        propLeft: [96, 402],
        propRight: [404, 402],
        clip,
        body:
          `<path d="${clip}" ${outline}/>` +
          `<ellipse cx="250" cy="362" rx="${r1(50 * k)}" ry="66" fill="${colors.belly}" opacity="0.9" clip-path="url(#${prefix}-bodyclip)"/>` +
          paw(w(218), 402) +
          paw(w(282), 402),
      };
    }

    case 'loaf': {
      const clip = `M ${w(138)} 404 C ${w(112)} 382 ${w(116)} 318 ${w(150)} 292 C ${w(192)} 252 ${w(308)} 252 ${w(350)} 292 C ${w(384)} 318 ${w(388)} 382 ${w(362)} 404 Z`;
      return {
        head: { x: 250, y: 205, scale: 1, tilt: 0 },
        neckline: { cx: 250, cy: 276, rx: r1(56 * k) },
        tail: { x: w(352), y: 394, angle: 70 },
        shadow: { cx: 250, cy: 410, rx: 132 * k, ry: 13 },
        patternSpots: [
          [w(182), 330],
          [w(318), 330],
          [w(215), 370],
          [w(285), 370],
        ],
        paws: [
          [w(202), 400],
          [w(298), 400],
        ],
        propLeft: [90, 404],
        propRight: [410, 404],
        clip,
        body:
          `<path d="${clip}" ${outline}/>` +
          `<path d="M ${w(178)} 404 Q ${w(202)} 390 ${w(226)} 404" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>` +
          `<path d="M ${w(274)} 404 Q ${w(298)} 390 ${w(322)} 404" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`,
      };
    }

    case 'orb': {
      const r = 100 * k;
      const clip = `M 250 ${305 - r} A ${r} ${r} 0 1 1 249.9 ${305 - r} Z`;
      return {
        head: { x: 250, y: 212, scale: 1.02, tilt: 0 },
        neckline: { cx: 250, cy: 292, rx: r1(54 * k) },
        tail: { x: r1(250 + r * 0.72), y: 372, angle: -25 },
        shadow: { cx: 250, cy: r1(309 + r), rx: 105 * k, ry: 12 },
        patternSpots: [
          [r1(250 - r * 0.55), 300],
          [r1(250 + r * 0.55), 300],
          [250, r1(305 + r * 0.5)],
        ],
        paws: [
          [220, r1(305 + r * 0.86)],
          [280, r1(305 + r * 0.86)],
        ],
        propLeft: [r1(250 - r - 48), 404],
        propRight: [r1(250 + r + 48), 404],
        clip,
        body:
          `<circle cx="250" cy="305" r="${r1(r)}" ${outline}/>` +
          `<circle cx="250" cy="352" r="${r1(66 * k)}" fill="${colors.belly}" opacity="0.88" clip-path="url(#${prefix}-bodyclip)"/>` +
          beans(220, r1(305 + r * 0.82), 0.95) +
          beans(280, r1(305 + r * 0.82), 0.95),
      };
    }

    case 'longcat': {
      const x0 = w(196);
      const bw = r1(w(304) - w(196));
      const clip = `M ${x0} 256 L ${x0} 358 Q ${x0} 406 ${r1(x0 + 48)} 406 L ${r1(x0 + bw - 48)} 406 Q ${r1(x0 + bw)} 406 ${r1(x0 + bw)} 358 L ${r1(x0 + bw)} 256 Q ${r1(x0 + bw)} 208 ${r1(x0 + bw - 48)} 208 L ${r1(x0 + 48)} 208 Q ${x0} 208 ${x0} 256 Z`;
      return {
        head: { x: 250, y: 174, scale: 1, tilt: 0 },
        neckline: { cx: 250, cy: 256, rx: r1(44 * k) },
        tail: { x: w(298), y: 390, angle: -12 },
        shadow: { cx: 250, cy: 412, rx: 96 * k, ry: 12 },
        patternSpots: [
          [w(220), 285],
          [w(280), 322],
          [w(225), 360],
        ],
        paws: [
          [w(222), 402],
          [w(278), 402],
        ],
        propLeft: [108, 404],
        propRight: [392, 404],
        clip,
        body:
          `<path d="${clip}" ${outline}/>` +
          `<rect x="${w(216)}" y="256" width="${r1(w(284) - w(216))}" height="150" rx="30" fill="${colors.belly}" opacity="0.88" clip-path="url(#${prefix}-bodyclip)"/>` +
          paw(w(222), 402, 22, 12) +
          paw(w(278), 402, 22, 12),
      };
    }

    case 'chilling': {
      const clip = `M 108 352 C 96 312 138 284 195 282 C 235 278 340 278 372 292 C 402 306 402 372 372 390 C 330 404 150 404 118 392 C 100 384 100 368 108 352 Z`;
      return {
        head: { x: 163, y: 262, scale: 0.98, tilt: -8 },
        neckline: { cx: 172, cy: 346, rx: 42 },
        tail: { x: 382, y: 356, angle: -30 },
        shadow: { cx: 250, cy: 408, rx: 152, ry: 13 },
        patternSpots: [
          [245, 312],
          [325, 316],
          [285, 368],
        ],
        paws: [
          [212, 394],
          [352, 394],
        ],
        propLeft: [66, 400],
        propRight: [434, 400],
        clip,
        body:
          `<path d="${clip}" ${outline}/>` +
          `<ellipse cx="272" cy="352" rx="90" ry="46" fill="${colors.belly}" opacity="0.88" clip-path="url(#${prefix}-bodyclip)"/>` +
          `<path d="M 316 292 L 316 268 Q 316 250 331 250 Q 346 250 346 268 L 346 292" ${outline}/>` +
          beans(331, 258, 0.82) +
          paw(212, 394, 23, 12) +
          paw(352, 394, 20, 11),
      };
    }

    case 'pounce': {
      const clip = `M 136 396 C 126 372 148 344 192 332 C 234 320 284 310 326 302 C 362 296 390 312 392 340 C 394 368 376 392 344 396 Z`;
      return {
        head: { x: 178, y: 288, scale: 0.95, tilt: 5 },
        neckline: { cx: 184, cy: 364, rx: 38 },
        tail: { x: 376, y: 318, angle: -55 },
        shadow: { cx: 258, cy: 406, rx: 142, ry: 12 },
        patternSpots: [
          [300, 334],
          [350, 342],
          [255, 348],
        ],
        paws: [
          [150, 396],
          [216, 396],
        ],
        propLeft: [84, 400],
        propRight: [432, 396],
        clip,
        body: `<path d="${clip}" ${outline}/>` + paw(150, 396, 25, 12) + paw(216, 396, 25, 12),
      };
    }

    case 'stretching': {
      const clip = `M 118 392 C 122 376 140 366 176 352 C 224 332 270 306 316 288 C 348 276 380 288 388 314 C 394 340 380 372 352 388 C 300 402 160 402 118 392 Z`;
      return {
        head: { x: 148, y: 316, scale: 0.92, tilt: -12 },
        neckline: null,
        tail: { x: 368, y: 302, angle: -50 },
        shadow: { cx: 255, cy: 402, rx: 150, ry: 12 },
        patternSpots: [
          [300, 322],
          [345, 332],
          [252, 344],
        ],
        paws: [
          [128, 392],
          [188, 390],
        ],
        propLeft: [72, 398],
        propRight: [434, 398],
        clip,
        body:
          `<path d="${clip}" ${outline}/>` +
          paw(128, 392, 28, 11) +
          paw(188, 390, 26, 11) +
          paw(352, 392, 24, 12),
      };
    }

    case 'box':
    default: {
      const clip = `M 198 330 L 198 288 Q 198 248 238 248 L 262 248 Q 302 248 302 288 L 302 330 Z`;
      const card = '#d9a05c';
      const cardDark = '#b57a3a';
      const cardLine = '#7c4a1e';
      const boxPaw = (x: number): string =>
        `<g transform="translate(${x} 0)">` +
        `<rect x="-14" y="282" width="28" height="36" rx="14" ${outline}/>` +
        `<line x1="-4.5" y1="306" x2="-4.5" y2="314" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="4.5" y1="306" x2="4.5" y2="314" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `</g>`;
      return {
        head: { x: 250, y: 232, scale: 1.02, tilt: 0 },
        neckline: null,
        tail: { x: 356, y: 302, angle: -35 },
        shadow: { cx: 250, cy: 414, rx: 136, ry: 12 },
        patternSpots: [
          [230, 282],
          [272, 300],
        ],
        paws: [],
        propLeft: [94, 404],
        propRight: [406, 404],
        clip,
        body:
          `<rect x="152" y="262" width="196" height="44" rx="4" fill="${cardDark}" stroke="${cardLine}" stroke-width="3.5" stroke-linejoin="round"/>` +
          `<rect x="160" y="270" width="180" height="36" fill="#5d3a14"/>` +
          `<path d="${clip}" ${outline}/>`,
        overlay:
          `<g class="box-front">` +
          `<rect x="140" y="298" width="220" height="110" rx="7" fill="${card}" stroke="${cardLine}" stroke-width="4" stroke-linejoin="round"/>` +
          `<path d="M 140 305 L 360 305 L 352 320 L 148 320 Z" fill="${cardDark}" opacity="0.7"/>` +
          `<rect x="239" y="298" width="22" height="110" fill="#f0c987" opacity="0.5"/>` +
          `<rect x="192" y="334" width="116" height="38" rx="6" fill="#fdf3df" stroke="#a8763e" stroke-width="2.5"/>` +
          `<text x="250" y="352" text-anchor="middle" font-size="14" font-weight="bold" fill="${cardLine}" font-family="monospace">hoba cat</text>` +
          `<text x="250" y="366" text-anchor="middle" font-size="9" fill="#a8763e" font-family="monospace">fragile · priceless</text>` +
          boxPaw(212) +
          boxPaw(288) +
          `</g>`,
      };
    }
  }
}

/** One soft shadow band near the ground plus nothing else — flat, not glossy. */
function renderBodyShading(colors: CatColors, layout: PoseLayout, prefix: string): string {
  const s = layout.shadow;
  return `<ellipse cx="${s.cx}" cy="${s.cy - 8}" rx="${r1(s.rx * 1.05)}" ry="34" fill="${colors.shading ?? colors.secondary}" opacity="0.12" clip-path="url(#${prefix}-bodyclip)"/>`;
}

/* ------------------------------------------------------------------ */
/* Coat patterns (clipped to the body silhouette)                      */
/* ------------------------------------------------------------------ */

function renderCoatOverlays(
  dna: CatDNA,
  colors: CatColors,
  layout: PoseLayout,
  prefix: string
): string {
  const accent = colors.tertiary ?? colors.secondary;
  const rng = createRng(`${dna.seed}::pattern`);
  const parts: string[] = [];

  if (dna.coatStyle === 'calico' && layout.patternSpots.length >= 2) {
    const [a, b] = layout.patternSpots;
    parts.push(
      `<ellipse cx="${a[0]}" cy="${a[1]}" rx="44" ry="36" fill="${colors.secondary}" opacity="0.9" transform="rotate(-14 ${a[0]} ${a[1]})"/>`,
      `<ellipse cx="${b[0]}" cy="${b[1]}" rx="38" ry="30" fill="${colors.tertiary}" opacity="0.88" transform="rotate(12 ${b[0]} ${b[1]})"/>`
    );
  }

  switch (dna.furPattern) {
    case 'tabbyStripes':
      for (const [x, y] of layout.patternSpots.slice(0, 4)) {
        parts.push(
          `<path d="M ${x - 26} ${y} C ${x - 10} ${y - 15} ${x + 10} ${y - 15} ${x + 26} ${y} C ${x + 10} ${y - 5} ${x - 10} ${y - 5} ${x - 26} ${y} Z" fill="${colors.secondary}" opacity="0.55"/>`
        );
      }
      break;

    case 'dappledSpots':
      for (const [x, y] of layout.patternSpots) {
        const jx = r1(x + (rng() - 0.5) * 22);
        const jy = r1(y + (rng() - 0.5) * 18);
        parts.push(
          `<circle cx="${jx}" cy="${jy}" r="${r1(8 + rng() * 6)}" fill="${colors.secondary}" opacity="0.5"/>`
        );
        if (rng() > 0.5)
          parts.push(
            `<circle cx="${r1(jx + 18)}" cy="${r1(jy + 12)}" r="${r1(4 + rng() * 4)}" fill="${colors.secondary}" opacity="0.4"/>`
          );
      }
      break;

    case 'heartPatch': {
      const [x, y] = layout.patternSpots[0] ?? [300, 320];
      parts.push(
        `<path d="M ${x} ${y} C ${x} ${y - 13} ${x - 17} ${y - 13} ${x - 17} ${y} C ${x - 17} ${y + 12} ${x} ${y + 24} ${x} ${y + 24} C ${x} ${y + 24} ${x + 17} ${y + 12} ${x + 17} ${y} C ${x + 17} ${y - 13} ${x} ${y - 13} ${x} ${y} Z" fill="${accent}" opacity="0.92"/>`
      );
      break;
    }

    case 'bellyPatch':
    case 'socksAndBib': {
      const n = layout.neckline;
      const bx = n ? n.cx : 250;
      const by = n ? n.cy + 28 : 292;
      const brx = n ? r1(n.rx * 0.82) : 38;
      parts.push(
        `<ellipse cx="${bx}" cy="${by}" rx="${brx}" ry="42" fill="${colors.belly === '#ffffff' ? '#ffffff' : shiftTone(colors.belly, 10)}" opacity="0.95"/>`
      );
      break;
    }

    default:
      break;
  }

  const clipped =
    parts.length > 0
      ? `<g class="fur-patterns" clip-path="url(#${prefix}-bodyclip)">${parts.join('')}</g>`
      : '';

  // Socks sit on the paw shapes, which are outside the body clip.
  let socks = '';
  if (dna.furPattern === 'socksAndBib' && layout.paws.length > 0) {
    socks =
      `<g class="fur-socks">` +
      layout.paws
        .map(
          ([x, y]) =>
            `<ellipse cx="${x}" cy="${y}" rx="21" ry="10.5" fill="#ffffff" opacity="0.92"/>` +
            `<line x1="${x - 7}" y1="${y - 5}" x2="${x - 7}" y2="${y + 4}" stroke="${colors.lineStroke}" stroke-width="2" stroke-linecap="round"/>` +
            `<line x1="${x + 7}" y1="${y - 5}" x2="${x + 7}" y2="${y + 4}" stroke="${colors.lineStroke}" stroke-width="2" stroke-linecap="round"/>`
        )
        .join('') +
      `</g>`;
  }

  return clipped + socks;
}

/* ------------------------------------------------------------------ */
/* Tail (drawn behind the body, base hidden by the silhouette)         */
/* ------------------------------------------------------------------ */

function renderTail(dna: CatDNA, colors: CatColors, layout: PoseLayout): string {
  const stroke = colors.lineStroke;
  const tone = colors.pointed ? colors.secondary : colors.primary;
  const { x, y, angle } = layout.tail;
  const rot = r1(angle + dna.tailWagAngle * 0.6);

  const tube = (d: string, outer: number, inner: number): string =>
    `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${outer}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${tone}" stroke-width="${inner}" stroke-linecap="round" stroke-linejoin="round"/>`;

  let inner = '';
  switch (dna.tailType) {
    case 'fluffyPlume':
      inner =
        `<path d="M -14 4 C 20 8 48 -10 58 -48 C 66 -84 48 -110 26 -104 C 8 -99 14 -76 6 -56 C -2 -36 -14 -18 -14 4 Z" fill="${tone}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 30 -96 C 42 -90 48 -74 46 -58" fill="none" stroke="${colors.highlight}" stroke-width="3" opacity="0.5" stroke-linecap="round"/>`;
      break;
    case 'curlySpiral':
      inner = tube(
        'M 0 0 C 42 -2 70 -26 68 -58 C 66 -90 36 -98 26 -78 C 18 -62 38 -54 46 -66',
        22,
        15
      );
      break;
    case 'bobtailBun':
      inner =
        `<circle cx="8" cy="-12" r="19" fill="${tone}" stroke="${stroke}" stroke-width="4"/>` +
        `<path d="M -2 -20 Q 8 -26 18 -20" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.45" stroke-linecap="round"/>`;
      break;
    case 'zigzagKink':
      inner = tube('M 0 0 L 34 -26 L 14 -58 L 48 -88', 20, 13);
      break;
    case 'candyCane':
      inner =
        tube('M 0 0 C 34 -8 56 -40 52 -76 C 49 -102 26 -106 20 -90', 21, 14) +
        `<circle cx="20" cy="-90" r="9" fill="#ffffff" stroke="${stroke}" stroke-width="3"/>`;
      break;
    case 'sleekWhip':
    default:
      inner = tube(
        'M 0 0 C 38 -4 62 -34 58 -74 C 55 -102 30 -110 24 -92 C 20 -80 34 -76 40 -86',
        21,
        14
      );
      break;
  }

  return `<g class="cat-tail" transform="translate(${x} ${y}) rotate(${rot})">${inner}</g>`;
}

/* ------------------------------------------------------------------ */
/* Head, ears, face (canonical space centered at 250,185)              */
/* ------------------------------------------------------------------ */

function renderHead(dna: CatDNA, colors: CatColors, prefix: string, layout: PoseLayout): string {
  const stroke = colors.lineStroke;
  const fur = `url(#${prefix}-fur)`;
  const outline = `fill="${fur}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"`;
  const h = dna;

  let headPath = '';
  switch (dna.headShape) {
    case 'fluffyCheeks':
      headPath = `<path d="M 250 108 C 198 108 166 138 163 180 C 148 186 150 198 162 202 C 150 210 152 222 165 224 C 155 232 160 244 174 242 C 192 256 220 262 250 262 C 280 262 308 256 326 242 C 340 244 345 232 335 224 C 348 222 350 210 338 202 C 350 198 352 186 337 180 C 334 138 302 108 250 108 Z" ${outline}/>`;
      break;
    case 'triangle':
      headPath = `<path d="M 250 112 C 216 112 187 124 173 149 C 158 178 166 226 196 249 C 221 264 279 264 304 249 C 334 226 342 178 327 149 C 313 124 284 112 250 112 Z" ${outline}/>`;
      break;
    case 'heart':
      headPath = `<path d="M 250 116 C 200 112 166 136 163 176 C 160 214 196 250 250 260 C 304 250 340 214 337 176 C 334 136 300 112 250 116 Z" ${outline}/>`;
      break;
    case 'chonky':
      headPath = `<path d="M 250 118 C 186 118 150 148 150 190 C 150 231 191 258 250 258 C 309 258 350 231 350 190 C 350 148 314 118 250 118 Z" ${outline}/>`;
      break;
    case 'oval':
      headPath = `<path d="M 250 102 C 206 102 177 139 177 188 C 177 237 209 265 250 265 C 291 265 323 237 323 188 C 323 139 294 102 250 102 Z" ${outline}/>`;
      break;
    case 'round':
    default:
      headPath = `<path d="M 250 108 C 197 108 163 141 163 186 C 163 231 200 262 250 262 C 300 262 337 231 337 186 C 337 141 303 108 250 108 Z" ${outline}/>`;
      break;
  }

  const ears = renderEars(dna, colors, prefix);

  const foreheadMark =
    dna.furPattern === 'tabbyStripes'
      ? `<g class="forehead-m" stroke="${colors.secondary}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"><path d="M 231 134 L 239 152 L 250 140 L 261 152 L 269 134"/></g>`
      : '';

  const banditMask =
    dna.furPattern === 'maskedBandit'
      ? `<g class="mask-bandit" fill="${colors.secondary}" opacity="0.4"><ellipse cx="215" cy="178" rx="27" ry="21"/><ellipse cx="285" cy="178" rx="27" ry="21"/></g>`
      : '';

  const pointedMuzzle = colors.pointed
    ? `<ellipse cx="250" cy="209" rx="32" ry="22" fill="${colors.secondary}" opacity="0.4"/>`
    : '';

  const sheen = `<path d="M 206 130 C 220 119 244 114 264 117" stroke="${colors.highlight}" stroke-width="4.5" opacity="0.35" fill="none" stroke-linecap="round"/>`;

  const blushOp = r1(0.75 * h.blushIntensity);
  const blush = `<g class="cat-blush" opacity="${blushOp}"><ellipse cx="192" cy="213" rx="15" ry="8.5" fill="url(#${prefix}-blush-grad)"/><ellipse cx="308" cy="213" rx="15" ry="8.5" fill="url(#${prefix}-blush-grad)"/></g>`;

  const face = renderFace(dna, colors, prefix);
  const headAcc = renderHeadAccessory(dna, colors);

  const { x, y, scale, tilt } = layout.head;
  const t = `translate(${x} ${y}) rotate(${tilt}) scale(${scale}) translate(-250 -185)`;
  return `<g class="cat-head-and-ears cat-head-ears" transform="${t}">${ears}${headPath}${sheen}${banditMask}${pointedMuzzle}${foreheadMark}${blush}${face}${headAcc}</g>`;
}

function renderEars(dna: CatDNA, colors: CatColors, prefix: string): string {
  const stroke = colors.lineStroke;
  const fur = colors.pointed ? colors.secondary : `url(#${prefix}-fur)`;
  const outline = `fill="${fur}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"`;
  const inner = `fill="${colors.innerEar}"`;

  let left = '';
  switch (dna.earType) {
    case 'fold':
      left =
        `<path d="M 184 136 C 174 116 180 94 200 88 C 218 94 226 114 219 130 C 208 139 193 141 184 136 Z" ${outline}/>` +
        `<path d="M 192 116 Q 203 106 213 116" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      break;
    case 'curl':
      left =
        `<path d="M 178 154 C 166 116 172 80 196 58 C 202 76 200 92 194 106 C 210 96 222 82 226 64 C 236 92 228 126 210 142 C 198 151 186 155 178 154 Z" ${outline}/>` +
        `<path d="M 190 132 C 184 112 188 94 198 80 C 206 94 206 110 202 124 C 198 130 193 132 190 132 Z" ${inner} opacity="0.85"/>`;
      break;
    case 'lynx':
      left =
        `<path d="M 179 158 C 167 116 171 80 187 60 C 211 74 231 96 240 120 C 226 140 204 152 179 158 Z" ${outline}/>` +
        `<path d="M 188 140 C 181 112 185 92 194 79 C 209 90 222 104 228 117 C 218 130 203 137 188 140 Z" ${inner}/>` +
        `<path d="M 186 66 C 180 50 178 40 183 26 C 191 38 194 52 195 62 Z" fill="${stroke}"/>`;
      break;
    case 'bigServal':
      left =
        `<path d="M 170 162 C 150 108 156 54 178 28 C 214 50 242 88 250 122 C 232 146 202 158 170 162 Z" ${outline}/>` +
        `<path d="M 181 148 C 167 106 172 66 186 46 C 213 66 233 96 239 119 C 226 137 203 146 181 148 Z" ${inner}/>`;
      break;
    case 'roundBear':
      left = `<circle cx="196" cy="120" r="28" ${outline}/><circle cx="198" cy="123" r="13" ${inner}/>`;
      break;
    case 'floppy':
      left =
        `<path d="M 182 146 C 156 126 138 138 136 164 C 136 190 156 204 178 197 C 192 190 198 170 197 150 Z" ${outline}/>` +
        `<path d="M 176 152 C 160 142 148 150 148 168 C 149 184 162 192 175 187 C 183 182 186 168 184 156 Z" ${inner} opacity="0.8"/>`;
      break;
    case 'classic':
    default:
      left =
        `<path d="M 179 158 C 167 116 171 80 187 60 C 211 74 231 96 240 120 C 226 140 204 152 179 158 Z" ${outline}/>` +
        `<path d="M 188 140 C 181 112 185 92 194 79 C 209 90 222 104 228 117 C 218 130 203 137 188 140 Z" ${inner}/>`;
      break;
  }

  const tilt = r1(dna.earAngleOffset);
  return `<g class="cat-ears cat-ears-${dna.earType}" transform="rotate(${tilt} 250 150)"><g>${left}</g><g transform="translate(500 0) scale(-1 1)">${left}</g></g>`;
}

function renderFace(dna: CatDNA, colors: CatColors, prefix: string): string {
  const stroke = colors.lineStroke;
  const whisker = colors.whisker ?? colors.lineStroke;
  const eyeLeftInfo =
    dna.eyeColor === 'heterochromia' ? getEyeDetails('cyanSky') : getEyeDetails(dna.eyeColor);
  const eyeRightInfo =
    dna.eyeColor === 'heterochromia' ? getEyeDetails('amberGold') : getEyeDetails(dna.eyeColor);
  const gradL = `${prefix}-eye-left`;
  const gradR = `${prefix}-eye-right`;

  const sparkleEye = (cx: number, grad: string, info: typeof eyeLeftInfo): string =>
    `<g class="eye-sparkle">` +
    `<ellipse cx="${cx}" cy="180" rx="16.5" ry="19" fill="url(#${grad})" stroke="${info.dark}" stroke-width="1.5" stroke-opacity="0.55"/>` +
    `<ellipse cx="${cx}" cy="183" rx="9.5" ry="12" fill="#131c2e"/>` +
    `<circle cx="${cx - 5.5}" cy="172" r="5" fill="#ffffff"/>` +
    `<circle cx="${cx + 5}" cy="188" r="2.4" fill="#ffffff" opacity="0.9"/>` +
    `</g>`;

  const happyArc = (cx: number): string =>
    `<path d="M ${cx - 15} 183 Q ${cx} 164 ${cx + 15} 183" stroke="${stroke}" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  let eyes = '';
  switch (dna.eyeShape) {
    case 'curvedHappy':
      eyes = happyArc(215) + happyArc(285);
      break;
    case 'sleepyLids':
      eyes = [215, 285]
        .map(
          (cx, i) =>
            `<g><path d="M ${cx - 14} 181 Q ${cx} 192 ${cx + 14} 181 L ${cx + 14} 181 Q ${cx} 198 ${cx - 14} 181 Z" fill="url(#${i === 0 ? gradL : gradR})"/>` +
            `<path d="M ${cx - 15} 180 Q ${cx} 172 ${cx + 15} 180" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/>` +
            `<path d="M ${cx + 15} 180 L ${cx + 19} 184" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/></g>`
        )
        .join('');
      break;
    case 'shockedRound':
      eyes = [
        [215, gradL, eyeLeftInfo],
        [285, gradR, eyeRightInfo],
      ]
        .map(
          ([cx, grad, info]) =>
            `<g><circle cx="${cx}" cy="179" r="18.5" fill="#ffffff" stroke="${stroke}" stroke-width="3"/>` +
            `<circle cx="${cx}" cy="180" r="11" fill="url(#${grad})" stroke="${(info as typeof eyeLeftInfo).dark}" stroke-width="1" stroke-opacity="0.5"/>` +
            `<circle cx="${cx}" cy="181" r="5" fill="#131c2e"/>` +
            `<circle cx="${(cx as number) - 3.5}" cy="175" r="3" fill="#ffffff"/></g>`
        )
        .join('');
      break;
    case 'sassySquint':
      eyes = [
        [215, gradL, -6],
        [285, gradR, 6],
      ]
        .map(
          ([cx, grad, rot]) =>
            `<g transform="rotate(${rot} ${cx} 180)"><ellipse cx="${cx}" cy="180" rx="15" ry="8.5" fill="url(#${grad})"/>` +
            `<circle cx="${cx}" cy="181" r="4.5" fill="#131c2e"/>` +
            `<circle cx="${(cx as number) - 2}" cy="178" r="1.8" fill="#ffffff"/>` +
            `<path d="M ${(cx as number) - 15} 175 L ${(cx as number) + 15} 175" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/></g>`
        )
        .join('');
      break;
    case 'wink':
      eyes = happyArc(215) + sparkleEye(285, gradR, eyeRightInfo);
      break;
    case 'derpCross':
      eyes =
        `<g><circle cx="215" cy="179" r="17" fill="#ffffff" stroke="${stroke}" stroke-width="3"/>` +
        `<circle cx="222" cy="180" r="8.5" fill="url(#${gradL})"/><circle cx="223" cy="181" r="4" fill="#131c2e"/><circle cx="220" cy="177" r="2" fill="#ffffff"/></g>` +
        `<g><circle cx="285" cy="179" r="15" fill="#ffffff" stroke="${stroke}" stroke-width="3"/>` +
        `<circle cx="279" cy="181" r="7.5" fill="url(#${gradR})"/><circle cx="278" cy="182" r="3.5" fill="#131c2e"/><circle cx="276" cy="179" r="1.8" fill="#ffffff"/></g>`;
      break;
    case 'slitPredator':
      eyes = [
        [215, gradL],
        [285, gradR],
      ]
        .map(
          ([cx, grad]) =>
            `<g><path d="M ${(cx as number) - 17} 180 Q ${cx} 162 ${(cx as number) + 17} 180 Q ${cx} 198 ${(cx as number) - 17} 180 Z" fill="url(#${grad})"/>` +
            `<ellipse cx="${cx}" cy="180" rx="3" ry="10.5" fill="#131c2e"/>` +
            `<circle cx="${(cx as number) - 5}" cy="174" r="2.6" fill="#ffffff"/></g>`
        )
        .join('');
      break;
    case 'animeSparkle':
    default:
      eyes = sparkleEye(215, gradL, eyeLeftInfo) + sparkleEye(285, gradR, eyeRightInfo);
      break;
  }

  const nose =
    `<g class="cat-nose">` +
    `<path d="M 242 200 C 245 197 255 197 258 200 C 259 205 254 210 250 211 C 246 210 241 205 242 200 Z" fill="${colors.nose}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
    `<ellipse cx="247" cy="201.5" rx="2" ry="1.1" fill="#ffffff" opacity="0.7"/>` +
    `<line x1="250" y1="211" x2="250" y2="217" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
    `</g>`;

  let mouth = '';
  switch (dna.mouthEmotion) {
    case 'blep':
      mouth =
        `<path d="M 236 217 Q 243 224 250 217 Q 257 224 264 217" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M 244 219 C 244 232 256 232 256 219 Z" fill="${colors.tongue}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
      break;
    case 'smugSmile':
      mouth = `<path d="M 240 218 Q 254 222 268 212" fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round"/>`;
      break;
    case 'gaspO':
      mouth =
        `<ellipse cx="250" cy="223" rx="8.5" ry="10" fill="#131c2e" stroke="${stroke}" stroke-width="2"/>` +
        `<ellipse cx="250" cy="227" rx="5" ry="4" fill="${colors.tongue}"/>`;
      break;
    case 'grumpyLine':
      mouth = `<path d="M 238 222 Q 250 215 262 222" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case 'yowlScream':
      mouth =
        `<path d="M 234 216 Q 250 244 266 216 Z" fill="#7f1d34" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<ellipse cx="250" cy="228" rx="7.5" ry="5.5" fill="${colors.tongue}"/>` +
        `<polygon points="239,216 241.5,222 244,216" fill="#ffffff"/>` +
        `<polygon points="256,216 258.5,222 261,216" fill="#ffffff"/>`;
      break;
    case 'sleepyZ':
      mouth =
        `<path d="M 241 219 Q 250 223 259 219" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<g fill="${colors.accent}" font-family="sans-serif" font-weight="bold" opacity="0.9"><text x="322" y="132" font-size="18">z</text><text x="340" y="112" font-size="24">Z</text><text x="362" y="88" font-size="30">Z</text></g>`;
      break;
    case 'neutralW':
      mouth = `<path d="M 238 218 Q 244 223 250 218 Q 256 223 262 218" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>`;
      break;
    case 'purr3':
    default:
      mouth = `<path d="M 234 216 Q 242 226 250 218 Q 258 226 266 216" fill="none" stroke="${stroke}" stroke-width="2.8" stroke-linecap="round"/>`;
      break;
  }

  const wl = dna.whiskerLength;
  const wx = r1(52 * wl);
  const whiskers =
    `<g class="cat-whiskers" stroke="${whisker}" stroke-width="1.8" stroke-linecap="round" opacity="0.75" fill="none">` +
    `<path d="M 224 206 Q ${224 - wx * 0.55} 199 ${224 - wx} 197"/>` +
    `<path d="M 224 214 Q ${224 - wx * 0.6} 214 ${224 - wx * 1.06} 216"/>` +
    `<path d="M 226 221 Q ${226 - wx * 0.5} 228 ${226 - wx * 0.92} 234"/>` +
    `<path d="M 276 206 Q ${276 + wx * 0.55} 199 ${276 + wx} 197"/>` +
    `<path d="M 276 214 Q ${276 + wx * 0.6} 214 ${276 + wx * 1.06} 216"/>` +
    `<path d="M 274 221 Q ${274 + wx * 0.5} 228 ${274 + wx * 0.92} 234"/>` +
    `</g>`;

  const whiskerDots =
    `<g fill="${stroke}" opacity="0.35">` +
    `<circle cx="233" cy="210" r="1.3"/><circle cx="238" cy="215" r="1.3"/><circle cx="232" cy="219" r="1.3"/>` +
    `<circle cx="267" cy="210" r="1.3"/><circle cx="262" cy="215" r="1.3"/><circle cx="268" cy="219" r="1.3"/>` +
    `</g>`;

  const butterfly =
    dna.propItem === 'butterflyOnNose'
      ? `<g class="prop-butterfly" transform="translate(250 193) scale(0.85)">` +
        `<ellipse cx="-9" cy="-9" rx="8" ry="11" transform="rotate(-32 -9 -9)" fill="#38bdf8" stroke="${stroke}" stroke-width="1.5"/>` +
        `<ellipse cx="9" cy="-9" rx="8" ry="11" transform="rotate(32 9 -9)" fill="#7dd3fc" stroke="${stroke}" stroke-width="1.5"/>` +
        `<ellipse cx="0" cy="-7" rx="2.2" ry="6.5" fill="#0f172a"/>` +
        `</g>`
      : '';

  return `<g class="cat-face">${eyes}${nose}${mouth}${whiskerDots}${whiskers}${butterfly}</g>`;
}

/* ------------------------------------------------------------------ */
/* Accessories                                                         */
/* ------------------------------------------------------------------ */

function renderHeadAccessory(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;

  switch (dna.headAccessory) {
    case 'wizardHat':
      return (
        `<g class="acc-wizard-hat">` +
        `<path d="M 194 112 L 250 8 L 306 112 Z" fill="#4338ca" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>` +
        `<path d="M 214 112 L 250 8 L 250 112 Z" fill="#6366f1" opacity="0.55"/>` +
        `<ellipse cx="250" cy="113" rx="66" ry="14" fill="#3730a3" stroke="${stroke}" stroke-width="3.5"/>` +
        `<polygon points="250,52 253.5,61 263,61 255.5,67 258.5,76 250,70.5 241.5,76 244.5,67 237,61 246.5,61" fill="#fde047"/>` +
        `</g>`
      );
    case 'royalCrown':
      return (
        `<g class="acc-crown">` +
        `<path d="M 212 116 L 212 82 L 230 100 L 250 72 L 270 100 L 288 82 L 288 116 Z" fill="#f59e0b" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<rect x="212" y="108" width="76" height="9" fill="#d97706" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="212" cy="82" r="4" fill="#ef4444" stroke="${stroke}" stroke-width="1"/>` +
        `<circle cx="250" cy="72" r="5" fill="#3b82f6" stroke="${stroke}" stroke-width="1"/>` +
        `<circle cx="288" cy="82" r="4" fill="#ef4444" stroke="${stroke}" stroke-width="1"/>` +
        `</g>`
      );
    case 'fishOnHead':
      return (
        `<g class="acc-fish-head">` +
        `<path d="M 216 108 C 232 90 268 90 284 108 C 274 118 262 122 250 122 C 238 122 226 118 216 108 Z" fill="#22d3ee" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M 284 108 L 300 96 L 298 116 Z" fill="#06b6d4" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<circle cx="234" cy="104" r="3" fill="#0f172a"/><circle cx="233" cy="103" r="1" fill="#ffffff"/>` +
        `</g>`
      );
    case 'flowerCrown':
      return (
        `<g class="acc-flowers">` +
        [
          [198, 122, '#fda4af', 11],
          [230, 110, '#f472b6', 13],
          [270, 110, '#c084fc', 12],
          [302, 122, '#7dd3fc', 11],
        ]
          .map(
            ([x, y, c, r]) =>
              `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${stroke}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="${(r as number) * 0.35}" fill="#fde047"/>`
          )
          .join('') +
        `</g>`
      );
    case 'frogBeanie':
      return (
        `<g class="acc-frog-beanie">` +
        `<path d="M 186 128 C 186 84 314 84 314 128 C 292 118 208 118 186 128 Z" fill="#4ade80" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>` +
        `<circle cx="216" cy="88" r="13" fill="#4ade80" stroke="${stroke}" stroke-width="3"/><circle cx="216" cy="88" r="7.5" fill="#ffffff"/><circle cx="216" cy="88" r="4" fill="#131c2e"/><circle cx="214.5" cy="86.5" r="1.5" fill="#ffffff"/>` +
        `<circle cx="284" cy="88" r="13" fill="#4ade80" stroke="${stroke}" stroke-width="3"/><circle cx="284" cy="88" r="7.5" fill="#ffffff"/><circle cx="284" cy="88" r="4" fill="#131c2e"/><circle cx="282.5" cy="86.5" r="1.5" fill="#ffffff"/>` +
        `</g>`
      );
    case 'chefHat':
      return (
        `<g class="acc-chef-hat">` +
        `<path d="M 214 116 L 214 96 C 186 84 202 42 236 54 C 246 30 274 30 284 54 C 318 42 334 84 286 96 L 286 116 Z" fill="#ffffff" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>` +
        `<rect x="214" y="104" width="72" height="13" fill="#e2e8f0" stroke="${stroke}" stroke-width="2.5"/>` +
        `</g>`
      );
    case 'sunglasses':
      return (
        `<g class="acc-sunglasses">` +
        `<rect x="190" y="164" width="52" height="32" rx="13" fill="#0f172a" stroke="${stroke}" stroke-width="2.5"/>` +
        `<rect x="258" y="164" width="52" height="32" rx="13" fill="#0f172a" stroke="${stroke}" stroke-width="2.5"/>` +
        `<path d="M 242 176 L 258 176" stroke="#0f172a" stroke-width="5"/>` +
        `<path d="M 190 176 L 172 168 M 310 176 L 328 168" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M 200 172 L 216 188" stroke="#7dd3fc" stroke-width="3" opacity="0.7" stroke-linecap="round"/>` +
        `<path d="M 268 172 L 284 188" stroke="#7dd3fc" stroke-width="3" opacity="0.7" stroke-linecap="round"/>` +
        `</g>`
      );
    case 'angelHalo':
      return `<g class="acc-halo"><ellipse cx="250" cy="62" rx="48" ry="13" fill="none" stroke="#fbbf24" stroke-width="6"/><ellipse cx="250" cy="62" rx="48" ry="13" fill="none" stroke="#fef08a" stroke-width="2.5"/></g>`;
    case 'sproutLeaf':
      return (
        `<g class="acc-sprout">` +
        `<path d="M 250 112 C 250 92 248 80 240 70" fill="none" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round"/>` +
        `<path d="M 240 70 C 226 62 218 64 212 74 C 224 82 236 80 240 70 Z" fill="#4ade80" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<path d="M 240 70 C 252 56 264 54 274 60 C 268 74 252 78 240 70 Z" fill="#22c55e" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `</g>`
      );
    case 'partyHat':
      return (
        `<g class="acc-party-hat">` +
        `<polygon points="250,32 222,112 278,112" fill="#ec4899" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M 233 82 Q 250 74 267 82" stroke="#7dd3fc" stroke-width="5" fill="none"/>` +
        `<circle cx="250" cy="28" r="7" fill="#fde047" stroke="${stroke}" stroke-width="2"/>` +
        `</g>`
      );
    case 'devilHorns':
      return (
        `<g class="acc-devil-horns">` +
        `<path d="M 196 118 C 182 96 176 78 178 58 C 194 74 204 96 210 114 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M 304 118 C 318 96 324 78 322 58 C 306 74 296 96 290 114 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `</g>`
      );
    default:
      return '';
  }
}

function renderNeckAccessory(dna: CatDNA, colors: CatColors, layout: PoseLayout): string {
  const n = layout.neckline;
  if (!n || dna.neckAccessory === 'none') return '';
  const stroke = colors.lineStroke;
  const { cx, cy, rx } = n;

  switch (dna.neckAccessory) {
    case 'bellCollar':
      return (
        `<g class="acc-bell-collar">` +
        `<path d="M ${cx - rx} ${cy - 4} Q ${cx} ${cy + 12} ${cx + rx} ${cy - 4}" fill="none" stroke="#dc2626" stroke-width="10" stroke-linecap="round"/>` +
        `<circle cx="${cx}" cy="${cy + 15}" r="9" fill="#f59e0b" stroke="${stroke}" stroke-width="2.5"/>` +
        `<circle cx="${cx - 2.5}" cy="${cy + 12}" r="2.5" fill="#fef08a"/>` +
        `<line x1="${cx - 5}" y1="${cy + 16}" x2="${cx + 5}" y2="${cy + 16}" stroke="${stroke}" stroke-width="1.5"/>` +
        `<circle cx="${cx}" cy="${cy + 19.5}" r="1.8" fill="${stroke}"/>` +
        `</g>`
      );
    case 'bowTie': {
      const s = Math.min(rx * 0.62, 34);
      return (
        `<g class="acc-bowtie">` +
        `<path d="M ${cx} ${cy + 6} L ${cx - s} ${cy - 6} L ${cx - s} ${cy + 18} Z" fill="#dc2626" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<path d="M ${cx} ${cy + 6} L ${cx + s} ${cy - 6} L ${cx + s} ${cy + 18} Z" fill="#dc2626" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<circle cx="${cx}" cy="${cy + 6}" r="6" fill="#991b1b" stroke="${stroke}" stroke-width="2"/>` +
        `</g>`
      );
    }
    case 'warmScarf': {
      const hang = Math.max(24, Math.min(46, layout.shadow.cy - cy - 14));
      return (
        `<g class="acc-scarf">` +
        `<path d="M ${cx - rx} ${cy - 2} Q ${cx} ${cy + 18} ${cx + rx} ${cy - 2} L ${cx + rx - 4} ${cy + 12} Q ${cx} ${cy + 30} ${cx - rx + 4} ${cy + 12} Z" fill="#f97316" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M ${r1(cx + rx * 0.42)} ${cy + 16} L ${r1(cx + rx * 0.68)} ${cy + hang} L ${r1(cx + rx * 0.3)} ${cy + hang + 4} L ${r1(cx + rx * 0.14)} ${cy + 22} Z" fill="#ea580c" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<line x1="${r1(cx + rx * 0.28)}" y1="${r1(cy + hang * 0.62)}" x2="${r1(cx + rx * 0.56)}" y2="${r1(cy + hang * 0.56)}" stroke="#fed7aa" stroke-width="3.5" stroke-linecap="round"/>` +
        `</g>`
      );
    }
    case 'fishbonePendant':
      return (
        `<g class="acc-fishbone">` +
        `<path d="M ${cx - rx} ${cy - 4} Q ${cx} ${cy + 10} ${cx + rx} ${cy - 4}" fill="none" stroke="#64748b" stroke-width="3"/>` +
        `<g transform="translate(${cx} ${cy + 18})" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round">` +
        `<line x1="-10" y1="0" x2="10" y2="0"/><line x1="-5" y1="-5" x2="-5" y2="5"/><line x1="1" y1="-5" x2="1" y2="5"/>` +
        `<path d="M 10 0 L 16 -5 L 16 5 Z" fill="#e2e8f0" stroke-width="1.5"/>` +
        `<circle cx="-13" cy="0" r="2.5" fill="#e2e8f0" stroke="none"/>` +
        `</g>` +
        `</g>`
      );
    case 'pearlNecklace': {
      const pearls: string[] = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const px = r1(cx - rx + 2 * rx * t);
        const py = r1(cy + Math.sin(Math.PI * t) * 14);
        const pr = 4 + Math.sin(Math.PI * t) * 2.5;
        pearls.push(
          `<circle cx="${px}" cy="${py}" r="${r1(pr)}" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>`
        );
      }
      return `<g class="acc-pearls">${pearls.join('')}</g>`;
    }
    case 'bandanaPirate':
      return (
        `<g class="acc-bandana">` +
        `<path d="M ${cx - rx} ${cy - 4} Q ${cx} ${cy + 8} ${cx + rx} ${cy - 4} L ${cx + 10} ${cy + 34} Q ${cx} ${cy + 40} ${cx - 10} ${cy + 34} Z" fill="#1e293b" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<circle cx="${cx}" cy="${cy + 14}" r="5" fill="#ffffff"/>` +
        `<circle cx="${cx - 2}" cy="${cy + 13}" r="1.3" fill="#1e293b"/><circle cx="${cx + 2}" cy="${cy + 13}" r="1.3" fill="#1e293b"/>` +
        `<path d="M ${cx - 4} ${cy + 19} L ${cx + 4} ${cy + 19}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>` +
        `</g>`
      );
    default:
      return '';
  }
}

/* ------------------------------------------------------------------ */
/* Props (small companions beside the cat, never on top of it)         */
/* ------------------------------------------------------------------ */

function renderProps(
  dna: CatDNA,
  colors: CatColors,
  layout: PoseLayout,
  layer: 'behind' | 'front'
): string {
  const stroke = colors.lineStroke;
  const [lx, ly] = layout.propLeft;
  const [rx, ry] = layout.propRight;

  const FRONT_PROPS = new Set(['laserDot']);
  const isFront = FRONT_PROPS.has(dna.propItem);
  if ((layer === 'front') !== isFront) return '';

  switch (dna.propItem) {
    case 'coffeeMug':
      return (
        `<g class="prop-coffee" transform="translate(${rx} ${ry})">` +
        `<rect x="-21" y="-40" width="42" height="40" rx="7" fill="#0284c7" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M 21 -32 C 34 -32 34 -12 21 -12" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>` +
        `<path d="M -8 -46 Q -12 -56 -8 -66" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>` +
        `<path d="M 6 -46 Q 10 -56 6 -66" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>` +
        `</g>`
      );
    case 'yarnBall':
      return (
        `<g class="prop-yarn" transform="translate(${lx} ${ly})">` +
        `<circle cx="0" cy="-22" r="24" fill="#f43f5e" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M -16 -30 Q 0 -22 16 -30 M -18 -16 Q 0 -8 18 -16 M -8 -44 Q 2 -30 14 -38" fill="none" stroke="#fda4af" stroke-width="2.2" stroke-linecap="round"/>` +
        `<path d="M 22 -12 Q 48 -2 84 -6" fill="none" stroke="#f43f5e" stroke-width="2.8" stroke-linecap="round"/>` +
        `</g>`
      );
    case 'laserDot':
      return (
        `<g class="prop-laser" transform="translate(${lx} ${ly})">` +
        `<circle cx="0" cy="0" r="13" fill="#f43f5e" opacity="0.3"/>` +
        `<circle cx="0" cy="0" r="6.5" fill="#ef4444"/>` +
        `<circle cx="0" cy="0" r="2.5" fill="#ffffff"/>` +
        `</g>`
      );
    case 'mouseFriend':
      return (
        `<g class="prop-mouse" transform="translate(${rx} ${ry})">` +
        `<ellipse cx="0" cy="-11" rx="19" ry="12" fill="#94a3b8" stroke="${stroke}" stroke-width="2.5"/>` +
        `<circle cx="-13" cy="-20" r="6.5" fill="#fbcfe8" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="-17" cy="-11" r="2.2" fill="#131c2e"/>` +
        `<path d="M 19 -11 Q 38 -16 34 -2" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>` +
        `</g>`
      );
    case 'fishSkeleton':
      return (
        `<g class="prop-fish-bones" transform="translate(${rx - 30} ${ry - 14})" stroke="#cbd5e1" stroke-linecap="round">` +
        `<path d="M 0 0 L -9 -6 L -9 6 Z" fill="#cbd5e1" stroke-width="2" stroke-linejoin="round"/>` +
        `<line x1="0" y1="0" x2="38" y2="0" stroke-width="3"/>` +
        `<line x1="10" y1="-7" x2="10" y2="7" stroke-width="2"/><line x1="19" y1="-7" x2="19" y2="7" stroke-width="2"/><line x1="28" y1="-7" x2="28" y2="7" stroke-width="2"/>` +
        `<path d="M 38 0 L 47 -7 L 47 7 Z" fill="#cbd5e1" stroke-width="2" stroke-linejoin="round"/>` +
        `</g>`
      );
    case 'pottedPlant':
      return (
        `<g class="prop-plant" transform="translate(${rx} ${ry})">` +
        `<path d="M -16 -30 L 16 -30 L 12 0 L -12 0 Z" fill="#ea580c" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<rect x="-19" y="-37" width="38" height="8" rx="2.5" fill="#c2410c" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="0" cy="-48" r="13" fill="#22c55e" stroke="${stroke}" stroke-width="2.5"/>` +
        `<circle cx="-10" cy="-42" r="8" fill="#16a34a" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="10" cy="-42" r="8" fill="#16a34a" stroke="${stroke}" stroke-width="2"/>` +
        `</g>`
      );
    case 'butterflyOnNose':
      return ''; // rendered inside the face so it rides the head transform
    default:
      return '';
  }
}

/* ------------------------------------------------------------------ */
/* Backdrops                                                           */
/* ------------------------------------------------------------------ */

function renderBackdrop(dna: CatDNA, colors: CatColors, prefix: string): string {
  const spark = (x: number, y: number, s: number, fill: string): string =>
    `<path d="M ${x} ${y - s} Q ${x + s * 0.12} ${y - s * 0.12} ${x + s} ${y} Q ${x + s * 0.12} ${y + s * 0.12} ${x} ${y + s} Q ${x - s * 0.12} ${y + s * 0.12} ${x - s} ${y} Q ${x - s * 0.12} ${y - s * 0.12} ${x} ${y - s} Z" fill="${fill}"/>`;

  switch (dna.backdropTheme) {
    case 'sparkleStars':
      return (
        `<g class="backdrop-sparkles" opacity="0.8">` +
        spark(85, 130, 15, '#fbbf24') +
        spark(420, 105, 12, '#fde047') +
        spark(415, 385, 11, '#fbbf24') +
        spark(88, 390, 9, '#fde047') +
        `<circle cx="140" cy="78" r="3" fill="#fde68a" opacity="0.8"/>` +
        `<circle cx="362" cy="66" r="3.5" fill="#fde68a" opacity="0.9"/>` +
        `<circle cx="446" cy="255" r="2.5" fill="#fde68a" opacity="0.6"/>` +
        `<circle cx="54" cy="265" r="2.5" fill="#fde68a" opacity="0.7"/>` +
        `</g>`
      );
    case 'floatingHearts': {
      const heart = (x: number, y: number, s: number, fill: string): string =>
        `<path d="M ${x} ${y} C ${x} ${y - s * 0.75} ${x - s} ${y - s * 0.75} ${x - s} ${y} C ${x - s} ${y + s * 0.7} ${x} ${y + s * 1.4} ${x} ${y + s * 1.4} C ${x} ${y + s * 1.4} ${x + s} ${y + s * 0.7} ${x + s} ${y} C ${x + s} ${y - s * 0.75} ${x} ${y - s * 0.75} ${x} ${y} Z" fill="${fill}"/>`;
      return (
        `<g class="backdrop-hearts" opacity="0.7">` +
        heart(80, 140, 17, '#fb7185') +
        heart(420, 128, 14, '#fda4af') +
        heart(408, 368, 12, '#fecdd3') +
        heart(96, 372, 11, '#fb7185') +
        `</g>`
      );
    }
    case 'pawPrints': {
      const pawPrint = (x: number, y: number, rot: number, s: number): string =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><ellipse cx="0" cy="10" rx="12" ry="9"/><circle cx="-11" cy="-6" r="4.5"/><circle cx="-3.5" cy="-10" r="4.5"/><circle cx="4.5" cy="-9" r="4.5"/><circle cx="12" cy="-4" r="4"/></g>`;
      return (
        `<g class="backdrop-paws" opacity="0.18" fill="${colors.accent}">` +
        pawPrint(70, 100, -20, 0.9) +
        pawPrint(420, 120, 25, 1) +
        pawPrint(80, 375, 15, 0.95) +
        pawPrint(415, 385, -30, 0.9) +
        `</g>`
      );
    }
    case 'glowingAura':
      return `<circle cx="250" cy="270" r="205" fill="url(#${prefix}-aura)"/>`;
    case 'cozyPillow':
      return (
        `<g class="backdrop-pillow">` +
        `<path d="M 92 382 C 84 338 416 338 408 382 C 414 424 86 424 92 382 Z" fill="#c7d2fe" stroke="#a5b4fc" stroke-width="3"/>` +
        `<path d="M 130 384 Q 250 402 370 384" stroke="#a5b4fc" stroke-width="2" fill="none" stroke-dasharray="5 7" opacity="0.8"/>` +
        `<circle cx="88" cy="382" r="6" fill="#818cf8"/>` +
        `<circle cx="412" cy="382" r="6" fill="#818cf8"/>` +
        `</g>`
      );
    case 'cyberGrid':
      return (
        `<g class="backdrop-cyber" opacity="0.3">` +
        `<circle cx="250" cy="255" r="192" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 8" fill="none"/>` +
        `<circle cx="250" cy="255" r="142" stroke="#ec4899" stroke-width="1" fill="none"/>` +
        `<line x1="46" y1="255" x2="454" y2="255" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.4"/>` +
        `<line x1="250" y1="52" x2="250" y2="458" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.4"/>` +
        `</g>`
      );
    case 'fishPattern': {
      const fish = (x: number, y: number, flip: number): string =>
        `<g transform="translate(${x} ${y}) scale(${flip} 1)"><path d="M 0 0 C 12 -8 28 -8 36 0 C 28 8 12 8 0 0 Z M 36 0 L 46 -7 L 46 7 Z"/><circle cx="10" cy="-1.5" r="1.6" fill="${colors.accent}" stroke="none"/></g>`;
      return (
        `<g class="backdrop-fish" opacity="0.28" stroke="${colors.accent}" stroke-width="2" fill="none">` +
        fish(66, 118, 1) +
        fish(388, 138, -1) +
        fish(90, 372, 1) +
        `</g>`
      );
    }
    default:
      return '';
  }
}
