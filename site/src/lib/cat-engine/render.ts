/**
 * Vector Cat Engine — SVG Vector Renderer
 * Mathematically structured, scalable procedural SVG generator.
 * Masterfully crafted with 3D spherical lighting, subsurface scattering, and lifelike anatomy.
 */

import { getEyeDetails, resolveColors } from './colors.js';
import type { CatDNA, CatColors } from './types.js';

export function renderCatSVG(dna: CatDNA, options: { width?: number; height?: number; idPrefix?: string } = {}): string {
  const width = options.width ?? 500;
  const height = options.height ?? 500;
  const prefix = options.idPrefix ?? `cat-${dna.seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const colors = resolveColors(dna);

  const defs = renderDefs(prefix, colors, dna);
  const backdrop = renderBackdrop(dna, colors, prefix);
  const tail = renderTail(dna, colors, prefix);
  const body = renderBody(dna, colors, prefix);
  const patterns = renderFurPatterns(dna, colors);
  const headAndEars = renderHeadAndEars(dna, colors, prefix);
  const face = renderFace(dna, colors, prefix);
  const accessories = renderAccessories(dna, colors);
  const props = renderProps(dna, colors);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="${width}" height="${height}" data-cat-seed="${dna.seed}" style="overflow:visible;user-select:none;">${defs}<g class="cat-root">${backdrop}${tail}${body}${patterns}${headAndEars}${face}${accessories}${props}</g></svg>`;
}

function renderDefs(prefix: string, colors: CatColors, dna: CatDNA): string {
  const eyeLeftInfo = dna.eyeColor === 'heterochromia' ? getEyeDetails('cyanSky') : getEyeDetails(dna.eyeColor);
  const eyeRightInfo = dna.eyeColor === 'heterochromia' ? getEyeDetails('amberGold') : getEyeDetails(dna.eyeColor);
  const shadeTone = colors.shading ?? colors.secondary;

  return `<defs>` +
    `<filter id="${prefix}-shadow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="${colors.shadow}" flood-opacity="0.6"/></filter>` +
    `<filter id="${prefix}-ao" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="blur"/><feOffset dx="0" dy="3.5" result="offsetBlur"/><feComponentTransfer in="offsetBlur" result="shadow"><feFuncA type="linear" slope="0.35"/></feComponentTransfer><feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<filter id="${prefix}-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>` +
    `<radialGradient id="${prefix}-head-vol" cx="36%" cy="30%" r="68%" fx="28%" fy="22%"><stop offset="0%" stop-color="${colors.highlight}" stop-opacity="0.55"/><stop offset="35%" stop-color="${colors.primary}"/><stop offset="78%" stop-color="${colors.secondary}"/><stop offset="100%" stop-color="${shadeTone}"/></radialGradient>` +
    `<radialGradient id="${prefix}-body-vol" cx="34%" cy="28%" r="72%" fx="26%" fy="20%"><stop offset="0%" stop-color="${colors.highlight}" stop-opacity="0.45"/><stop offset="38%" stop-color="${colors.primary}"/><stop offset="80%" stop-color="${colors.secondary}"/><stop offset="100%" stop-color="${shadeTone}"/></radialGradient>` +
    `<radialGradient id="${prefix}-belly-vol" cx="46%" cy="36%" r="64%" fx="40%" fy="28%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.85"/><stop offset="45%" stop-color="${colors.belly}"/><stop offset="88%" stop-color="${colors.secondary}" stop-opacity="0.32"/><stop offset="100%" stop-color="${shadeTone}" stop-opacity="0.48"/></radialGradient>` +
    `<radialGradient id="${prefix}-muzzle-grad" cx="38%" cy="34%" r="65%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/><stop offset="45%" stop-color="${colors.whiskerPad ?? colors.belly}"/><stop offset="90%" stop-color="${colors.secondary}" stop-opacity="0.28"/><stop offset="100%" stop-color="${shadeTone}" stop-opacity="0.42"/></radialGradient>` +
    `<radialGradient id="${prefix}-nose-grad" cx="38%" cy="30%" r="62%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/><stop offset="35%" stop-color="${colors.nose}"/><stop offset="85%" stop-color="${colors.noseLeather ?? colors.nose}"/><stop offset="100%" stop-color="${colors.lineStroke}" stop-opacity="0.75"/></radialGradient>` +
    `<linearGradient id="${prefix}-ear-left-sss" x1="25%" y1="15%" x2="75%" y2="85%"><stop offset="0%" stop-color="${colors.nose}" stop-opacity="0.88"/><stop offset="35%" stop-color="${colors.innerEar}"/><stop offset="80%" stop-color="${colors.innerEarShadow ?? colors.innerEar}" stop-opacity="0.95"/><stop offset="100%" stop-color="${colors.secondary}" stop-opacity="0.4"/></linearGradient>` +
    `<linearGradient id="${prefix}-ear-right-sss" x1="75%" y1="15%" x2="25%" y2="85%"><stop offset="0%" stop-color="${colors.nose}" stop-opacity="0.88"/><stop offset="35%" stop-color="${colors.innerEar}"/><stop offset="80%" stop-color="${colors.innerEarShadow ?? colors.innerEar}" stop-opacity="0.95"/><stop offset="100%" stop-color="${colors.secondary}" stop-opacity="0.4"/></linearGradient>` +
    `<radialGradient id="${prefix}-blush-grad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${colors.blush}" stop-opacity="0.8"/><stop offset="60%" stop-color="${colors.blush}" stop-opacity="0.35"/><stop offset="100%" stop-color="${colors.blush}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${prefix}-eye-left" cx="36%" cy="32%" r="64%" fx="30%" fy="26%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="22%" stop-color="${eyeLeftInfo.glow}"/><stop offset="58%" stop-color="${eyeLeftInfo.main}"/><stop offset="86%" stop-color="${eyeLeftInfo.dark}"/><stop offset="100%" stop-color="${eyeLeftInfo.ring}"/></radialGradient>` +
    `<radialGradient id="${prefix}-eye-right" cx="36%" cy="32%" r="64%" fx="30%" fy="26%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="22%" stop-color="${eyeRightInfo.glow}"/><stop offset="58%" stop-color="${eyeRightInfo.main}"/><stop offset="86%" stop-color="${eyeRightInfo.dark}"/><stop offset="100%" stop-color="${eyeRightInfo.ring}"/></radialGradient>` +
    `<radialGradient id="${prefix}-ground-shadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${colors.shadow}" stop-opacity="0.8"/><stop offset="55%" stop-color="${colors.shadow}" stop-opacity="0.32"/><stop offset="100%" stop-color="${colors.shadow}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="${prefix}-fur-grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="${colors.highlight}" stop-opacity="0.35"/><stop offset="30%" stop-color="${colors.primary}"/><stop offset="100%" stop-color="${colors.secondary}"/></linearGradient>` +
    `<radialGradient id="${prefix}-aura" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.4"/><stop offset="60%" stop-color="${colors.primary}" stop-opacity="0.14"/><stop offset="100%" stop-color="${colors.primary}" stop-opacity="0"/></radialGradient>` +
  `</defs>`;
}

function renderBackdrop(dna: CatDNA, colors: CatColors, prefix: string): string {
  switch (dna.backdropTheme) {
    case 'sparkleStars':
      return `<g class="backdrop-sparkles" opacity="0.85">` +
        `<path d="M 80 120 Q 80 140 100 140 Q 80 140 80 160 Q 80 140 60 140 Q 80 140 80 120 Z" fill="#fbbf24" filter="url(#${prefix}-glow)"/>` +
        `<path d="M 420 100 Q 420 115 435 115 Q 420 115 420 130 Q 420 115 405 115 Q 420 115 420 100 Z" fill="#fde047"/>` +
        `<path d="M 410 380 Q 410 395 425 395 Q 410 395 410 410 Q 410 395 395 395 Q 410 395 410 380 Z" fill="#fbbf24"/>` +
        `<path d="M 90 390 Q 90 400 100 400 Q 90 400 90 410 Q 90 400 80 400 Q 90 400 90 390 Z" fill="#fde047"/>` +
        `<circle cx="140" cy="80" r="3" fill="#ffffff" opacity="0.8"/>` +
        `<circle cx="360" cy="70" r="4" fill="#ffffff" opacity="0.9"/>` +
        `<circle cx="440" cy="260" r="3" fill="#ffffff" opacity="0.6"/>` +
        `<circle cx="60" cy="270" r="3" fill="#ffffff" opacity="0.7"/>` +
      `</g>`;

    case 'floatingHearts':
      return `<g class="backdrop-hearts" opacity="0.8">` +
        `<path d="M 80 140 C 80 125, 60 125, 60 140 C 60 155, 80 170, 80 170 C 80 170, 100 155, 100 140 C 100 125, 80 125, 80 140 Z" fill="#f43f5e"/>` +
        `<path d="M 420 130 C 420 118, 404 118, 404 130 C 404 142, 420 154, 420 154 C 420 154, 436 142, 436 130 C 436 118, 420 118, 420 130 Z" fill="#fb7185"/>` +
        `<path d="M 410 360 C 410 350, 396 350, 396 360 C 396 370, 410 380, 410 380 C 410 380, 424 370, 424 360 C 424 350, 410 350, 410 360 Z" fill="#fda4af"/>` +
        `<path d="M 100 370 C 100 362, 88 362, 88 370 C 88 378, 100 386, 100 386 C 100 386, 112 378, 112 370 C 112 362, 100 362, 100 370 Z" fill="#f43f5e"/>` +
      `</g>`;

    case 'pawPrints':
      return `<g class="backdrop-paws" opacity="0.25" fill="${colors.primary}">` +
        `<g transform="translate(60, 90) rotate(-20) scale(0.6)"><ellipse cx="20" cy="28" rx="14" ry="11"/><circle cx="8" cy="10" r="5"/><circle cx="18" cy="6" r="5"/><circle cx="28" cy="8" r="5"/><circle cx="36" cy="14" r="4.5"/></g>` +
        `<g transform="translate(400, 110) rotate(25) scale(0.7)"><ellipse cx="20" cy="28" rx="14" ry="11"/><circle cx="8" cy="10" r="5"/><circle cx="18" cy="6" r="5"/><circle cx="28" cy="8" r="5"/><circle cx="36" cy="14" r="4.5"/></g>` +
        `<g transform="translate(70, 370) rotate(15) scale(0.65)"><ellipse cx="20" cy="28" rx="14" ry="11"/><circle cx="8" cy="10" r="5"/><circle cx="18" cy="6" r="5"/><circle cx="28" cy="8" r="5"/><circle cx="36" cy="14" r="4.5"/></g>` +
        `<g transform="translate(390, 380) rotate(-30) scale(0.6)"><ellipse cx="20" cy="28" rx="14" ry="11"/><circle cx="8" cy="10" r="5"/><circle cx="18" cy="6" r="5"/><circle cx="28" cy="8" r="5"/><circle cx="36" cy="14" r="4.5"/></g>` +
      `</g>`;

    case 'glowingAura':
      return `<circle cx="250" cy="260" r="210" fill="url(#${prefix}-aura)"/>`;

    case 'cozyPillow':
      return `<g class="backdrop-pillow">` +
        `<path d="M 80 390 C 70 340, 430 340, 420 390 C 425 440, 75 440, 80 390 Z" fill="#e0e7ff" stroke="#c7d2fe" stroke-width="3"/>` +
        `<circle cx="76" cy="390" r="7" fill="#818cf8"/>` +
        `<circle cx="424" cy="390" r="7" fill="#818cf8"/>` +
        `<path d="M 120 390 Q 250 410 380 390" stroke="#c7d2fe" stroke-width="2" fill="none" stroke-dasharray="6 6"/>` +
      `</g>`;

    case 'cyberGrid':
      return `<g class="backdrop-cyber" opacity="0.35">` +
        `<circle cx="250" cy="250" r="190" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 8" fill="none"/>` +
        `<circle cx="250" cy="250" r="140" stroke="#ec4899" stroke-width="1" fill="none"/>` +
        `<line x1="50" y1="250" x2="450" y2="250" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.4"/>` +
        `<line x1="250" y1="50" x2="250" y2="450" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.4"/>` +
      `</g>`;

    case 'fishPattern':
      return `<g class="backdrop-fish" opacity="0.3" stroke="${colors.primary}" stroke-width="2" fill="none">` +
        `<path d="M 70 120 C 90 110, 110 130, 130 120 L 140 110 L 140 130 Z"/>` +
        `<path d="M 410 140 C 390 130, 370 150, 350 140 L 340 130 L 340 150 Z"/>` +
        `<path d="M 90 380 C 110 370, 130 390, 150 380 L 160 370 L 160 390 Z"/>` +
      `</g>`;

    default:
      return '';
  }
}

function renderTail(dna: CatDNA, colors: CatColors, prefix: string): string {
  const angle = dna.tailWagAngle;
  const stroke = colors.lineStroke;
  const fill = `url(#${prefix}-body-vol)`;

  switch (dna.tailType) {
    case 'fluffyPlume':
      return `<g class="cat-tail" transform="rotate(${angle} 340 330)">` +
        `<path d="M 320 340 C 370 340, 440 310, 440 220 C 440 150, 380 140, 360 170 C 350 185, 365 210, 355 230 C 340 260, 310 310, 320 340 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 430 200 Q 452 190 435 225 Q 448 240 425 255" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M 360 185 Q 380 175 375 205" fill="none" stroke="${colors.highlight}" stroke-width="2" opacity="0.6" stroke-linecap="round"/>` +
        `<path d="M 370 155 C 385 145, 410 150, 425 180 C 410 175, 390 170, 370 155 Z" fill="${colors.highlight}" opacity="0.65"/>` +
      `</g>`;

    case 'curlySpiral':
      return `<g class="cat-tail" transform="rotate(${angle} 330 340)">` +
        `<path d="M 330 340 C 380 340, 430 300, 420 230 C 410 170, 340 180, 350 220 C 355 240, 380 240, 380 225" fill="none" stroke="${colors.primary}" stroke-width="24" stroke-linecap="round"/>` +
        `<path d="M 330 340 C 380 340, 430 300, 420 230 C 410 170, 340 180, 350 220 C 355 240, 380 240, 380 225" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M 335 330 C 375 330, 415 295, 408 235" fill="none" stroke="${colors.highlight}" stroke-width="4" opacity="0.4" stroke-linecap="round"/>` +
      `</g>`;

    case 'bobtailBun':
      return `<g class="cat-tail">` +
        `<circle cx="340" cy="330" r="24" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<circle cx="345" cy="325" r="16" fill="${colors.secondary}" opacity="0.4"/>` +
        `<path d="M 356 316 Q 366 324 358 334 Q 365 342 350 348" fill="none" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>` +
      `</g>`;

    case 'zigzagKink':
      return `<g class="cat-tail">` +
        `<path d="M 325 340 L 380 300 L 350 240 L 410 190" fill="none" stroke="${colors.primary}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M 325 340 L 380 300 L 350 240 L 410 190" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</g>`;

    case 'candyCane':
      return `<g class="cat-tail">` +
        `<path d="M 330 340 C 380 340, 420 290, 420 210 C 420 160, 380 150, 365 175" fill="none" stroke="${colors.primary}" stroke-width="18" stroke-linecap="round"/>` +
        `<path d="M 330 340 C 380 340, 420 290, 420 210 C 420 160, 380 150, 365 175" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>` +
        `<circle cx="365" cy="175" r="10" fill="#ffffff" stroke="${stroke}" stroke-width="3"/>` +
      `</g>`;

    case 'sleekWhip':
    default:
      return `<g class="cat-tail" transform="rotate(${angle} 330 340)">` +
        `<path d="M 330 340 C 390 340, 430 280, 410 200 C 400 160, 360 170, 370 195" fill="none" stroke="${colors.primary}" stroke-width="18" stroke-linecap="round"/>` +
        `<path d="M 330 340 C 390 340, 430 280, 410 200 C 400 160, 360 170, 370 195" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M 335 330 C 385 330, 418 275, 400 205" fill="none" stroke="${colors.highlight}" stroke-width="3" opacity="0.45" stroke-linecap="round"/>` +
      `</g>`;
  }
}

function renderBody(dna: CatDNA, colors: CatColors, prefix: string): string {
  const stroke = colors.lineStroke;
  const fill = `url(#${prefix}-body-vol)`;
  const bellyFill = `url(#${prefix}-belly-vol)`;
  const chonk = dna.chonkFactor;
  const groundShadow = `<ellipse cx="250" cy="400" rx="${130 * chonk}" ry="18" fill="url(#${prefix}-ground-shadow)"/>`;

  switch (dna.pose) {
    case 'loaf':
      return `<g class="cat-body">` +
        `${groundShadow}` +
        `<path d="M 115 330 C 115 240, 385 240, 385 330 C 385 395, 115 395, 115 330 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 130 345 C 130 290, 370 290, 370 345 C 370 388, 130 388, 130 345 Z" fill="${colors.secondary}" opacity="0.22"/>` +
        `<path d="M 210 240 Q 250 270 290 240 Q 250 305 210 240 Z" fill="${bellyFill}" stroke="${stroke}" stroke-width="2" opacity="0.9"/>` +
        `<ellipse cx="205" cy="366" rx="24" ry="15" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/>` +
        `<ellipse cx="285" cy="366" rx="24" ry="15" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M 198 360 Q 198 375 200 376 M 208 360 Q 208 375 210 376" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M 278 360 Q 278 375 280 376 M 288 360 Q 288 375 290 376" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `<circle cx="204" cy="371" r="3.5" fill="${colors.nose}" opacity="0.6"/>` +
        `<circle cx="284" cy="371" r="3.5" fill="${colors.nose}" opacity="0.6"/>` +
      `</g>`;

    case 'sitting':
      return `<g class="cat-body">` +
        `${groundShadow}` +
        `<ellipse cx="160" cy="340" rx="${44 * chonk}" ry="50" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
        `<ellipse cx="340" cy="340" rx="${44 * chonk}" ry="50" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
        `<path d="M 175 205 C 145 275, ${120 * (2 - chonk)} 375, 160 390 C 210 395, 290 395, 340 390 C ${380 * chonk} 375, 355 275, 325 205 Z" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<path d="M 195 215 C 220 245, 250 250, 250 260 C 250 250, 280 245, 305 215 C 315 250, 280 310, 250 310 C 220 310, 185 250, 195 215 Z" fill="${bellyFill}" stroke="${stroke}" stroke-width="2" opacity="0.92"/>` +
        `<path d="M 215 225 Q 250 255 285 225 Q 250 290 215 225 Z" fill="#ffffff" opacity="0.45"/>` +
        `<path d="M 202 275 L 202 385 C 202 396, 238 396, 238 385 L 238 275 Z" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
        `<path d="M 262 275 L 262 385 C 262 396, 298 396, 298 385 L 298 275 Z" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
        `<line x1="214" y1="380" x2="214" y2="394" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="226" y1="380" x2="226" y2="394" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="274" y1="380" x2="274" y2="394" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="286" y1="380" x2="286" y2="394" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
      `</g>`;

    case 'stretching':
      return `<g class="cat-body">` +
        `<ellipse cx="250" cy="385" rx="150" ry="16" fill="url(#${prefix}-ground-shadow)"/>` +
        `<path d="M 125 345 C 165 325, 255 295, 355 265 C 392 278, 395 350, 352 372 C 270 372, 175 372, 125 345 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<circle cx="345" cy="320" r="${46 * chonk}" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
        `<path d="M 140 335 Q 200 330 230 355 Q 170 365 140 335 Z" fill="${bellyFill}" opacity="0.85"/>` +
        `<path d="M 140 335 L 85 375 C 75 382, 102 396, 114 386 L 170 352 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M 155 340 L 105 385 C 95 392, 122 402, 134 394 L 185 352 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>` +
        `<line x1="88" y1="378" x2="96" y2="384" stroke="${stroke}" stroke-width="2"/>` +
        `<line x1="108" y1="388" x2="116" y2="394" stroke="${stroke}" stroke-width="2"/>` +
      `</g>`;

    case 'chilling':
      return `<g class="cat-body">` +
        `${groundShadow}` +
        `<path d="M 125 305 C 125 240, 375 240, 375 305 C 375 382, 125 382, 125 305 Z" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<ellipse cx="250" cy="318" rx="92" ry="44" fill="${bellyFill}" stroke="${stroke}" stroke-width="2.5"/>` +
        `<ellipse cx="215" cy="275" rx="16" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5"/>` +
        `<ellipse cx="285" cy="275" rx="16" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5"/>` +
        `<g class="paw-left-beans" transform="translate(140, 345)">` +
          `<ellipse cx="0" cy="0" rx="20" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5"/>` +
          `<ellipse cx="0" cy="2" rx="7" ry="5" fill="${colors.nose}"/>` +
          `<circle cx="-10" cy="-5" r="3.2" fill="${colors.nose}"/><circle cx="-3" cy="-9" r="3.2" fill="${colors.nose}"/><circle cx="5" cy="-8" r="3.2" fill="${colors.nose}"/><circle cx="11" cy="-3" r="3" fill="${colors.nose}"/>` +
        `</g>` +
        `<g class="paw-right-beans" transform="translate(360, 345)">` +
          `<ellipse cx="0" cy="0" rx="20" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5"/>` +
          `<ellipse cx="0" cy="2" rx="7" ry="5" fill="${colors.nose}"/>` +
          `<circle cx="-11" cy="-3" r="3" fill="${colors.nose}"/><circle cx="-5" cy="-8" r="3.2" fill="${colors.nose}"/><circle cx="3" cy="-9" r="3.2" fill="${colors.nose}"/><circle cx="10" cy="-5" r="3.2" fill="${colors.nose}"/>` +
        `</g>` +
      `</g>`;

    case 'pounce':
      return `<g class="cat-body">` +
        `<ellipse cx="250" cy="375" rx="140" ry="16" fill="url(#${prefix}-ground-shadow)"/>` +
        `<path d="M 118 325 C 160 295, 300 275, 382 295 C 404 328, 362 372, 310 372 C 218 372, 148 362, 118 325 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<ellipse cx="345" cy="320" rx="38" ry="34" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>` +
        `<path d="M 145 320 Q 190 325 210 345 Q 165 355 145 320 Z" fill="${bellyFill}" opacity="0.85"/>` +
        `<ellipse cx="158" cy="358" rx="24" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/>` +
        `<ellipse cx="222" cy="358" rx="24" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/>` +
        `<line x1="152" y1="352" x2="152" y2="365" stroke="${stroke}" stroke-width="2"/><line x1="162" y1="352" x2="162" y2="365" stroke="${stroke}" stroke-width="2"/>` +
        `<line x1="216" y1="352" x2="216" y2="365" stroke="${stroke}" stroke-width="2"/><line x1="226" y1="352" x2="226" y2="365" stroke="${stroke}" stroke-width="2"/>` +
      `</g>`;

    case 'orb':
      return `<g class="cat-body">` +
        `<ellipse cx="250" cy="${300 + 105 * chonk}" rx="${120 * chonk}" ry="20" fill="url(#${prefix}-ground-shadow)"/>` +
        `<circle cx="250" cy="300" r="${110 * chonk}" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<circle cx="250" cy="320" r="${78 * chonk}" fill="${bellyFill}" opacity="0.94" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="M 215 220 Q 250 250 285 220 Q 250 270 215 220 Z" fill="#ffffff" opacity="0.6"/>` +
        `<g class="orb-paw-left" transform="translate(195, ${300 + 95 * chonk})"><ellipse cx="0" cy="0" rx="20" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/><circle cx="0" cy="2" r="4.5" fill="${colors.nose}"/><circle cx="-6" cy="-4" r="2.5" fill="${colors.nose}"/><circle cx="0" cy="-6" r="2.5" fill="${colors.nose}"/><circle cx="6" cy="-4" r="2.5" fill="${colors.nose}"/></g>` +
        `<g class="orb-paw-right" transform="translate(305, ${300 + 95 * chonk})"><ellipse cx="0" cy="0" rx="20" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/><circle cx="0" cy="2" r="4.5" fill="${colors.nose}"/><circle cx="-6" cy="-4" r="2.5" fill="${colors.nose}"/><circle cx="0" cy="-6" r="2.5" fill="${colors.nose}"/><circle cx="6" cy="-4" r="2.5" fill="${colors.nose}"/></g>` +
      `</g>`;

    case 'longcat':
      return `<g class="cat-body">` +
        `${groundShadow}` +
        `<rect x="185" y="185" width="130" height="205" rx="50" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<rect x="210" y="215" width="80" height="155" rx="35" fill="${bellyFill}" opacity="0.92" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="M 220 205 Q 250 225 280 205 Q 250 240 220 205 Z" fill="#ffffff" opacity="0.6"/>` +
        `<g transform="translate(215, 390)"><ellipse cx="0" cy="0" rx="18" ry="13" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/><circle cx="0" cy="1" r="3.5" fill="${colors.nose}"/></g>` +
        `<g transform="translate(285, 390)"><ellipse cx="0" cy="0" rx="18" ry="13" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/><circle cx="0" cy="1" r="3.5" fill="${colors.nose}"/></g>` +
      `</g>`;

    case 'box':
    default:
      return `<g class="cat-body">` +
        `<ellipse cx="250" cy="415" rx="140" ry="16" fill="url(#${prefix}-ground-shadow)"/>` +
        `<ellipse cx="250" cy="270" rx="85" ry="65" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<path d="M 205 230 Q 250 270 295 230 Q 250 300 205 230 Z" fill="${bellyFill}" opacity="0.9" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="M 115 290 L 385 290 L 362 412 L 138 412 Z" fill="#d97706" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 115 290 L 85 258 L 138 258 L 155 290 Z" fill="#b45309" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M 385 290 L 415 258 L 362 258 L 345 290 Z" fill="#b45309" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<rect x="175" y="325" width="150" height="36" rx="6" fill="#fef3c7" stroke="${stroke}" stroke-width="2"/>` +
        `<text x="250" y="349" text-anchor="middle" font-size="15" font-weight="bold" fill="#78350f" font-family="monospace">📦 hoba cat</text>` +
        `<g class="box-paw-left" transform="translate(205, 290)"><ellipse cx="0" cy="0" rx="22" ry="15" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/><line x1="-7" y1="-3" x2="-7" y2="8" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="-3" x2="5" y2="8" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/></g>` +
        `<g class="box-paw-right" transform="translate(295, 290)"><ellipse cx="0" cy="0" rx="22" ry="15" fill="${colors.belly}" stroke="${stroke}" stroke-width="3"/><line x1="-5" y1="-3" x2="-5" y2="8" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/><line x1="7" y1="-3" x2="7" y2="8" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/></g>` +
      `</g>`;
  }
}

function renderFurPatterns(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  const accent = colors.tertiary ?? colors.secondary;

  switch (dna.furPattern) {
    case 'tabbyStripes':
      return `<g class="fur-patterns-stripes" fill="${accent}" opacity="0.85">` +
        `<path d="M 185 278 Q 222 288 192 305 Z"/>` +
        `<path d="M 175 318 Q 218 324 182 340 Z"/>` +
        `<path d="M 315 278 Q 278 288 308 305 Z"/>` +
        `<path d="M 325 318 Q 282 324 318 340 Z"/>` +
      `</g>`;

    case 'dappledSpots':
      return `<g class="fur-patterns-spots" fill="${accent}" opacity="0.85">` +
        `<circle cx="190" cy="290" r="10"/><circle cx="210" cy="330" r="14"/><circle cx="290" cy="300" r="12"/><circle cx="310" cy="340" r="9"/><circle cx="250" cy="360" r="11"/>` +
      `</g>`;

    case 'heartPatch':
      return `<g class="fur-patterns-heart">` +
        `<path d="M 300 310 C 300 298, 285 298, 285 310 C 285 322, 300 334, 300 334 C 300 334, 315 322, 315 310 C 315 298, 300 298, 300 310 Z" fill="${accent}" stroke="${stroke}" stroke-width="2"/>` +
      `</g>`;

    case 'maskedBandit':
      return `<g class="fur-patterns-mask" fill="${colors.secondary}" opacity="0.65">` +
        `<ellipse cx="192" cy="176" rx="36" ry="24"/><ellipse cx="308" cy="176" rx="36" ry="24"/>` +
      `</g>`;

    default:
      return '';
  }
}

function renderHeadAndEars(dna: CatDNA, colors: CatColors, prefix: string): string {
  const stroke = colors.lineStroke;
  const fill = `url(#${prefix}-head-vol)`;
  const tilt = dna.earAngleOffset;

  let headPath = '';
  switch (dna.headShape) {
    case 'fluffyCheeks':
      headPath = `<g class="head-fluffy-silhouette">` +
        `<path d="M 170 145 C 135 140, 112 180, 122 195 C 104 206, 110 226, 128 236 C 114 246, 124 262, 154 256 C 180 262, 220 264, 250 264 C 280 264, 320 262, 346 256 C 376 262, 386 246, 372 236 C 390 226, 396 206, 378 195 C 388 180, 365 140, 330 145 C 295 125, 205 125, 170 145 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 132 208 Q 150 216 142 232" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.3" stroke-linecap="round"/>` +
        `<path d="M 368 208 Q 350 216 358 232" fill="none" stroke="${stroke}" stroke-width="2" opacity="0.3" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'triangle':
      headPath = `<path d="M 178 145 C 145 180, 185 244, 250 258 C 315 244, 355 180, 322 145 C 285 128, 215 128, 178 145 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
      break;

    case 'heart':
      headPath = `<path d="M 170 155 C 135 185, 175 248, 250 258 C 325 248, 365 185, 330 155 C 295 142, 268 152, 250 160 C 232 152, 205 142, 170 155 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
      break;

    case 'chonky':
      headPath = `<path d="M 155 158 C 118 185, 118 240, 165 256 C 205 266, 295 266, 335 256 C 382 240, 382 185, 345 158 C 310 132, 190 132, 155 158 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
      break;

    case 'oval':
      headPath = `<ellipse cx="250" cy="180" rx="78" ry="86" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`;
      break;

    case 'round':
    default:
      headPath = `<path d="M 172 145 C 132 170, 132 232, 175 252 C 210 260, 290 260, 325 252 C 368 232, 368 170, 328 145 C 295 128, 205 128, 172 145 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
      break;
  }

  let ears = '';
  switch (dna.earType) {
    case 'fold':
      ears = `<g class="cat-ears-fold">` +
        `<path d="M 168 148 C 150 132, 168 110, 198 126 C 208 132, 202 154, 176 156 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 174 138 Q 186 128 194 140" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M 332 148 C 350 132, 332 110, 302 126 C 292 132, 298 154, 324 156 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 326 138 Q 314 128 306 140" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'curl':
      ears = `<g class="cat-ears-curl">` +
        `<path d="M 175 145 C 155 110, 130 75, 148 65 C 160 58, 180 80, 222 122 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 172 135 C 158 115, 144 85, 154 78 C 164 74, 178 95, 208 118 Z" fill="url(#${prefix}-ear-left-sss)"/>` +
        `<path d="M 325 145 C 345 110, 370 75, 352 65 C 340 58, 320 80, 278 122 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 328 135 C 342 115, 356 85, 346 78 C 336 74, 322 95, 292 118 Z" fill="url(#${prefix}-ear-right-sss)"/>` +
      `</g>`;
      break;

    case 'lynx':
      ears = `<g class="cat-ears-lynx">` +
        `<path d="M 172 152 L 142 68 L 222 124 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 170 142 L 150 82 L 208 122 Z" fill="url(#${prefix}-ear-left-sss)"/>` +
        `<path d="M 162 135 Q 182 124 198 132 M 156 124 Q 174 114 188 120" stroke="${colors.highlight}" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M 142 68 Q 130 42 136 30 Q 146 48 142 68 Z" fill="${stroke}"/>` +
        `<path d="M 328 152 L 358 68 L 278 124 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 330 142 L 350 82 L 292 122 Z" fill="url(#${prefix}-ear-right-sss)"/>` +
        `<path d="M 338 135 Q 318 124 302 132 M 344 124 Q 326 114 312 120" stroke="${colors.highlight}" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M 358 68 Q 370 42 364 30 Q 354 48 358 68 Z" fill="${stroke}"/>` +
      `</g>`;
      break;

    case 'bigServal':
      ears = `<g class="cat-ears-serval">` +
        `<path d="M 165 160 L 118 36 L 232 118 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 165 145 L 130 58 L 216 112 Z" fill="url(#${prefix}-ear-left-sss)"/>` +
        `<path d="M 152 132 Q 172 118 195 125" stroke="${colors.highlight}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M 335 160 L 382 36 L 268 118 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 335 145 L 370 58 L 284 112 Z" fill="url(#${prefix}-ear-right-sss)"/>` +
        `<path d="M 348 132 Q 328 118 305 125" stroke="${colors.highlight}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'roundBear':
      ears = `<g class="cat-ears-round">` +
        `<circle cx="165" cy="115" r="33" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<circle cx="165" cy="115" r="21" fill="url(#${prefix}-ear-left-sss)"/>` +
        `<circle cx="335" cy="115" r="33" fill="${fill}" stroke="${stroke}" stroke-width="4"/>` +
        `<circle cx="335" cy="115" r="21" fill="url(#${prefix}-ear-right-sss)"/>` +
      `</g>`;
      break;

    case 'floppy':
      ears = `<g class="cat-ears-floppy">` +
        `<path d="M 175 145 C 135 130, 115 175, 140 200 C 160 210, 185 180, 195 150 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 165 150 C 140 145, 130 178, 148 192" fill="url(#${prefix}-ear-left-sss)"/>` +
        `<path d="M 325 145 C 365 130, 385 175, 360 200 C 340 210, 315 180, 305 150 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 335 150 C 360 145, 370 178, 352 192" fill="url(#${prefix}-ear-right-sss)"/>` +
      `</g>`;
      break;

    case 'classic':
    default:
      ears = `<g class="cat-ears-classic" transform="rotate(${tilt} 250 150)">` +
        `<path d="M 175 148 C 160 120, 136 90, 138 72 C 146 70, 185 100, 222 122 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 172 138 C 160 116, 145 92, 146 82 C 154 82, 180 102, 210 120 Z" fill="url(#${prefix}-ear-left-sss)"/>` +
        `<path d="M 160 130 Q 180 118 198 126 M 154 120 Q 172 110 186 116" stroke="${colors.highlight}" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
        `<path d="M 325 148 C 340 120, 364 90, 362 72 C 354 70, 315 100, 278 122 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M 328 138 C 340 116, 355 92, 354 82 C 346 82, 320 102, 290 120 Z" fill="url(#${prefix}-ear-right-sss)"/>` +
        `<path d="M 340 130 Q 320 118 302 126 M 346 120 Q 328 110 314 116" stroke="${colors.highlight}" stroke-width="2.5" stroke-linecap="round" fill="none"/>` +
      `</g>`;
      break;
  }

  const foreheadMark =
    dna.furPattern === 'tabbyStripes'
      ? `<g class="forehead-m" stroke="${colors.secondary}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M 230 135 L 238 155 L 250 142 L 262 155 L 270 135"/><path d="M 250 142 L 250 152" stroke-width="2.5"/></g>`
      : '';

  const browHighlight = `<path d="M 216 150 Q 250 142 284 150" stroke="${colors.highlight}" stroke-width="2.5" opacity="0.45" fill="none" stroke-linecap="round"/>`;

  const blush = `<g class="cat-blush" opacity="${dna.blushIntensity}">` +
    `<ellipse cx="168" cy="198" rx="18" ry="11" fill="url(#${prefix}-blush-grad)"/>` +
    `<ellipse cx="332" cy="198" rx="18" ry="11" fill="url(#${prefix}-blush-grad)"/>` +
  `</g>`;

  return `<g class="cat-head-and-ears cat-head-ears">${ears}${headPath}${browHighlight}${foreheadMark}${blush}</g>`;
}

function renderFace(dna: CatDNA, colors: CatColors, prefix: string): string {
  const stroke = colors.lineStroke;
  const whiskerLen = dna.whiskerLength;
  const eyeLeftInfo = dna.eyeColor === 'heterochromia' ? getEyeDetails('cyanSky') : getEyeDetails(dna.eyeColor);
  const eyeRightInfo = dna.eyeColor === 'heterochromia' ? getEyeDetails('amberGold') : getEyeDetails(dna.eyeColor);

  const makeLifelikeEye = (cx: number, cy: number, gradId: string, info: typeof eyeLeftInfo) => {
    return `<g class="lifelike-eye" transform="translate(${cx}, ${cy})">` +
      `<ellipse cx="0" cy="0" rx="21" ry="23" fill="url(#${gradId})" stroke="${info.ring}" stroke-width="2.5"/>` +
      `<path d="M -12 11 Q 0 20 12 11 Q 0 15 -12 11 Z" fill="${info.corneaBounce}" opacity="0.65"/>` +
      `<ellipse cx="0" cy="0" rx="12" ry="14" fill="#020617"/>` +
      `<path d="M -18 -8 Q 0 -2 18 -8 Q 0 -18 -18 -8 Z" fill="#020617" opacity="0.32"/>` +
      `<circle cx="-7" cy="-8" r="5.5" fill="#ffffff"/>` +
      `<circle cx="7" cy="7" r="2.8" fill="#ffffff" opacity="0.92"/>` +
      `<circle cx="-10" cy="-1" r="1.5" fill="#ffffff" opacity="0.7"/>` +
      `<path d="M -22 -6 Q 0 -20 22 -6" stroke="${stroke}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
    `</g>`;
  };

  let eyes = '';
  switch (dna.eyeShape) {
    case 'curvedHappy':
      eyes = `<g class="cat-eyes-happy" stroke="${stroke}" stroke-width="4.5" fill="none" stroke-linecap="round">` +
        `<path d="M 185 178 Q 205 158 225 178"/><path d="M 182 178 L 176 172" stroke-width="2.5"/>` +
        `<path d="M 275 178 Q 295 158 315 178"/><path d="M 318 178 L 324 172" stroke-width="2.5"/>` +
      `</g>`;
      break;

    case 'sleepyLids':
      eyes = `<g class="cat-eyes-sleepy">` +
        `<g transform="translate(205, 178)"><ellipse cx="0" cy="0" rx="19" ry="13" fill="url(#${prefix}-eye-left)" stroke="${eyeLeftInfo.ring}" stroke-width="2"/><ellipse cx="0" cy="2" rx="9" ry="7" fill="#020617"/><path d="M -8 7 Q 0 12 8 7" stroke="${eyeLeftInfo.corneaBounce}" stroke-width="2" fill="none" opacity="0.7"/><circle cx="-5" cy="-2" r="3" fill="#ffffff"/><path d="M -20 -3 Q 0 -6 20 -3" stroke="${stroke}" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>` +
        `<g transform="translate(295, 178)"><ellipse cx="0" cy="0" rx="19" ry="13" fill="url(#${prefix}-eye-right)" stroke="${eyeRightInfo.ring}" stroke-width="2"/><ellipse cx="0" cy="2" rx="9" ry="7" fill="#020617"/><path d="M -8 7 Q 0 12 8 7" stroke="${eyeRightInfo.corneaBounce}" stroke-width="2" fill="none" opacity="0.7"/><circle cx="-5" cy="-2" r="3" fill="#ffffff"/><path d="M -20 -3 Q 0 -6 20 -3" stroke="${stroke}" stroke-width="4.5" fill="none" stroke-linecap="round"/></g>` +
      `</g>`;
      break;

    case 'shockedRound':
      eyes = `<g class="cat-eyes-shocked">` +
        `<circle cx="200" cy="175" r="23" fill="#ffffff" stroke="${stroke}" stroke-width="4"/>` +
        `<circle cx="200" cy="175" r="17" fill="url(#${prefix}-eye-left)" stroke="${eyeLeftInfo.ring}" stroke-width="2"/>` +
        `<circle cx="200" cy="175" r="9" fill="#020617"/><circle cx="194" cy="168" r="5" fill="#ffffff"/><circle cx="206" cy="181" r="2.5" fill="#ffffff"/>` +
        `<circle cx="300" cy="175" r="23" fill="#ffffff" stroke="${stroke}" stroke-width="4"/>` +
        `<circle cx="300" cy="175" r="17" fill="url(#${prefix}-eye-right)" stroke="${eyeRightInfo.ring}" stroke-width="2"/>` +
        `<circle cx="300" cy="175" r="9" fill="#020617"/><circle cx="294" cy="168" r="5" fill="#ffffff"/><circle cx="306" cy="181" r="2.5" fill="#ffffff"/>` +
      `</g>`;
      break;

    case 'sassySquint':
      eyes = `<g class="cat-eyes-sassy">` +
        `<g transform="translate(205, 175) rotate(-8)"><ellipse cx="0" cy="0" rx="18" ry="12" fill="url(#${prefix}-eye-left)" stroke="${eyeLeftInfo.ring}" stroke-width="2"/><circle cx="2" cy="0" r="6" fill="#020617"/><circle cx="-3" cy="-3" r="2.8" fill="#ffffff"/><path d="M -18 -4 Q 0 -1 18 -4" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/></g>` +
        `<g transform="translate(295, 175) rotate(8)"><ellipse cx="0" cy="0" rx="18" ry="12" fill="url(#${prefix}-eye-right)" stroke="${eyeRightInfo.ring}" stroke-width="2"/><circle cx="-2" cy="0" r="6" fill="#020617"/><circle cx="-5" cy="-3" r="2.8" fill="#ffffff"/><path d="M -18 -4 Q 0 -1 18 -4" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/></g>` +
      `</g>`;
      break;

    case 'wink':
      eyes = `<g class="cat-eyes-wink">` +
        `<path d="M 185 178 Q 205 158 225 178" stroke="${stroke}" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M 182 178 L 176 172" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>` +
        `${makeLifelikeEye(295, 175, `${prefix}-eye-right`, eyeRightInfo)}` +
      `</g>`;
      break;

    case 'derpCross':
      eyes = `<g class="cat-eyes-derp">` +
        `<circle cx="200" cy="175" r="19" fill="#ffffff" stroke="${stroke}" stroke-width="3.5"/>` +
        `<circle cx="210" cy="175" r="11" fill="url(#${prefix}-eye-left)" stroke="${eyeLeftInfo.ring}" stroke-width="1.5"/><circle cx="210" cy="175" r="6" fill="#020617"/><circle cx="207" cy="171" r="2.8" fill="#ffffff"/>` +
        `<circle cx="300" cy="175" r="19" fill="#ffffff" stroke="${stroke}" stroke-width="3.5"/>` +
        `<circle cx="290" cy="175" r="11" fill="url(#${prefix}-eye-right)" stroke="${eyeRightInfo.ring}" stroke-width="1.5"/><circle cx="290" cy="175" r="6" fill="#020617"/><circle cx="287" cy="171" r="2.8" fill="#ffffff"/>` +
      `</g>`;
      break;

    case 'slitPredator':
      eyes = `<g class="cat-eyes-slit">` +
        `<ellipse cx="205" cy="175" rx="19" ry="16" fill="url(#${prefix}-eye-left)" stroke="${eyeLeftInfo.ring}" stroke-width="2.5"/>` +
        `<path d="M 205 160 C 209 170, 209 180, 205 190 C 201 180, 201 170, 205 160 Z" fill="#020617"/><circle cx="201" cy="168" r="3.2" fill="#ffffff"/><circle cx="209" cy="182" r="1.5" fill="#ffffff" opacity="0.8"/><path d="M 186 170 Q 205 158 224 170" stroke="${stroke}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="295" cy="175" rx="19" ry="16" fill="url(#${prefix}-eye-right)" stroke="${eyeRightInfo.ring}" stroke-width="2.5"/>` +
        `<path d="M 295 160 C 299 170, 299 180, 295 190 C 291 180, 291 170, 295 160 Z" fill="#020617"/><circle cx="291" cy="168" r="3.2" fill="#ffffff"/><circle cx="299" cy="182" r="1.5" fill="#ffffff" opacity="0.8"/><path d="M 276 170 Q 295 158 314 170" stroke="${stroke}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'animeSparkle':
    default:
      eyes = `<g class="cat-eyes-anime">${makeLifelikeEye(205, 175, `${prefix}-eye-left`, eyeLeftInfo)}${makeLifelikeEye(295, 175, `${prefix}-eye-right`, eyeRightInfo)}</g>`;
      break;
  }

  const whiskerPads = `<g class="cat-whisker-pads">` +
    `<path d="M 250 206 C 235 205, 222 211, 224 222 C 226 230, 240 230, 250 220 Z" fill="url(#${prefix}-muzzle-grad)" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M 250 206 C 265 205, 278 211, 276 222 C 274 230, 260 230, 250 220 Z" fill="url(#${prefix}-muzzle-grad)" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="233" cy="214" r="1.4" fill="${stroke}" opacity="0.45"/><circle cx="240" cy="218" r="1.4" fill="${stroke}" opacity="0.45"/><circle cx="234" cy="223" r="1.4" fill="${stroke}" opacity="0.45"/>` +
    `<circle cx="267" cy="214" r="1.4" fill="${stroke}" opacity="0.45"/><circle cx="260" cy="218" r="1.4" fill="${stroke}" opacity="0.45"/><circle cx="266" cy="223" r="1.4" fill="${stroke}" opacity="0.45"/>` +
  `</g>`;

  const nose = `<g class="cat-nose">` +
    `<path d="M 241 196 C 245 194, 255 194, 259 196 C 261 200, 255 207, 250 208 C 245 207, 239 200, 241 196 Z" fill="url(#${prefix}-nose-grad)" stroke="${stroke}" stroke-width="1.8" stroke-linejoin="round"/>` +
    `<path d="M 244 201 Q 246 203 248 201" stroke="${colors.lineStroke}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M 252 201 Q 254 203 256 201" stroke="${colors.lineStroke}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="247" cy="197" rx="2.2" ry="1.2" fill="#ffffff" opacity="0.75"/>` +
    `<line x1="250" y1="208" x2="250" y2="218" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/>` +
  `</g>`;

  let mouth = '';
  switch (dna.mouthEmotion) {
    case 'blep':
      mouth = `<g class="cat-mouth-blep">` +
        `<path d="M 233 218 Q 242 226 250 218 Q 258 226 267 218" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M 243 218 C 243 232, 257 232, 257 218 Z" fill="${colors.tongue}" stroke="${stroke}" stroke-width="2"/>` +
        `<line x1="250" y1="219" x2="250" y2="227" stroke="${colors.lineStroke}" stroke-width="1.2" opacity="0.6"/>` +
        `<circle cx="247" cy="223" r="1.5" fill="#ffffff" opacity="0.5"/>` +
      `</g>`;
      break;

    case 'smugSmile':
      mouth = `<g class="cat-mouth-smug">` +
        `<path d="M 243 218 Q 255 220 270 210" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M 270 210 Q 274 207 272 204" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'gaspO':
      mouth = `<g class="cat-mouth-gasp">` +
        `<ellipse cx="250" cy="224" rx="11" ry="13" fill="#020617" stroke="${stroke}" stroke-width="2.5"/>` +
        `<ellipse cx="250" cy="230" rx="7" ry="5" fill="${colors.tongue}"/>` +
        `<polygon points="244,213 246,218 248,213" fill="#ffffff"/>` +
        `<polygon points="252,213 254,218 256,213" fill="#ffffff"/>` +
      `</g>`;
      break;

    case 'grumpyLine':
      mouth = `<g class="cat-mouth-grumpy">` +
        `<path d="M 234 224 Q 250 216 266 224" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>` +
        `<path d="M 234 224 L 230 227 M 266 224 L 270 227" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'yowlScream':
      mouth = `<g class="cat-mouth-yowl">` +
        `<path d="M 230 216 Q 250 248 270 216 Z" fill="#881337" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<ellipse cx="250" cy="232" rx="9" ry="7" fill="${colors.tongue}"/>` +
        `<polygon points="236,216 238,223 241,216" fill="#ffffff"/>` +
        `<polygon points="259,216 262,223 264,216" fill="#ffffff"/>` +
      `</g>`;
      break;

    case 'sleepyZ':
      mouth = `<g class="cat-mouth-sleepy">` +
        `<path d="M 238 218 Q 250 223 262 218" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>` +
        `<text x="320" y="140" font-size="20" font-weight="bold" fill="${colors.accent}" font-family="sans-serif">z</text>` +
        `<text x="340" y="120" font-size="26" font-weight="bold" fill="${colors.accent}" font-family="sans-serif">Z</text>` +
        `<text x="365" y="95" font-size="32" font-weight="bold" fill="${colors.accent}" font-family="sans-serif">Z</text>` +
      `</g>`;
      break;

    case 'purr3':
    default:
      mouth = `<path d="M 232 216 Q 241 226 250 218 Q 259 226 268 216" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
      break;
  }

  const wl = 48 * whiskerLen;
  const whiskers = `<g class="cat-whiskers" stroke="${stroke}" stroke-width="2" stroke-linecap="round" opacity="0.88">` +
    `<path d="M 226 213 Q 170 204 ${226 - wl * 1.3} 195" fill="none"/>` +
    `<path d="M 224 219 Q 165 219 ${224 - wl * 1.4} 217" fill="none"/>` +
    `<path d="M 226 224 Q 170 234 ${226 - wl * 1.25} 242" fill="none"/>` +
    `<path d="M 274 213 Q 330 204 ${274 + wl * 1.3} 195" fill="none"/>` +
    `<path d="M 276 219 Q 335 219 ${276 + wl * 1.4} 217" fill="none"/>` +
    `<path d="M 274 224 Q 330 234 ${274 + wl * 1.25} 242" fill="none"/>` +
    `<path d="M 196 156 Q 182 144 168 140" fill="none" stroke-width="1.3" opacity="0.5"/>` +
    `<path d="M 304 156 Q 318 144 332 140" fill="none" stroke-width="1.3" opacity="0.5"/>` +
  `</g>`;

  return `<g class="cat-face">${eyes}${whiskerPads}${nose}${mouth}${whiskers}</g>`;
}

function renderAccessories(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  let headAcc = '';
  let neckAcc = '';

  switch (dna.headAccessory) {
    case 'wizardHat':
      headAcc = `<g class="acc-wizard-hat">` +
        `<path d="M 180 120 L 250 15 L 320 120 Z" fill="#4338ca" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>` +
        `<path d="M 180 120 L 250 15 L 250 120 Z" fill="#4f46e5" opacity="0.6"/>` +
        `<ellipse cx="250" cy="120" rx="76" ry="17" fill="#3730a3" stroke="${stroke}" stroke-width="3.5"/>` +
        `<rect x="235" y="100" width="30" height="15" fill="#f59e0b" stroke="${stroke}" stroke-width="2"/>` +
        `<polygon points="250,55 254,65 265,65 256,72 260,82 250,76 240,82 244,72 235,65 246,65" fill="#fde047"/>` +
      `</g>`;
      break;

    case 'royalCrown':
      headAcc = `<g class="acc-crown">` +
        `<path d="M 205 125 L 205 85 L 225 105 L 250 75 L 275 105 L 295 85 L 295 125 Z" fill="#f59e0b" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<rect x="205" y="115" width="90" height="10" fill="#d97706" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="205" cy="85" r="4.5" fill="#ef4444" stroke="${stroke}" stroke-width="1"/>` +
        `<circle cx="250" cy="75" r="5.5" fill="#3b82f6" stroke="${stroke}" stroke-width="1"/>` +
        `<circle cx="295" cy="85" r="4.5" fill="#ef4444" stroke="${stroke}" stroke-width="1"/>` +
        `<circle cx="250" cy="120" r="4" fill="#ef4444"/>` +
      `</g>`;
      break;

    case 'fishOnHead':
      headAcc = `<g class="acc-fish-head">` +
        `<path d="M 210 115 C 230 95, 270 95, 290 115 L 305 105 L 305 125 Z" fill="#06b6d4" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<circle cx="230" cy="110" r="3.5" fill="#ffffff"/>` +
        `<circle cx="230" cy="110" r="1.8" fill="#020617"/>` +
      `</g>`;
      break;

    case 'flowerCrown':
      headAcc = `<g class="acc-flowers">` +
        `<circle cx="190" cy="120" r="12" fill="#fda4af" stroke="${stroke}" stroke-width="2"/><circle cx="190" cy="120" r="4" fill="#fde047"/>` +
        `<circle cx="225" cy="110" r="14" fill="#f472b6" stroke="${stroke}" stroke-width="2"/><circle cx="225" cy="110" r="5" fill="#fde047"/>` +
        `<circle cx="265" cy="110" r="13" fill="#c084fc" stroke="${stroke}" stroke-width="2"/><circle cx="265" cy="110" r="4.5" fill="#fde047"/>` +
        `<circle cx="300" cy="120" r="12" fill="#38bdf8" stroke="${stroke}" stroke-width="2"/><circle cx="300" cy="120" r="4" fill="#fde047"/>` +
      `</g>`;
      break;

    case 'frogBeanie':
      headAcc = `<g class="acc-frog-beanie">` +
        `<path d="M 180 135 C 180 85, 320 85, 320 135 Z" fill="#22c55e" stroke="${stroke}" stroke-width="3.5"/>` +
        `<circle cx="205" cy="85" r="15" fill="#22c55e" stroke="${stroke}" stroke-width="3"/><circle cx="205" cy="85" r="10" fill="#ffffff"/><circle cx="205" cy="85" r="5" fill="#020617"/><circle cx="203" cy="83" r="2" fill="#ffffff"/>` +
        `<circle cx="295" cy="85" r="15" fill="#22c55e" stroke="${stroke}" stroke-width="3"/><circle cx="295" cy="85" r="10" fill="#ffffff"/><circle cx="295" cy="85" r="5" fill="#020617"/><circle cx="293" cy="83" r="2" fill="#ffffff"/>` +
      `</g>`;
      break;

    case 'chefHat':
      headAcc = `<g class="acc-chef-hat">` +
        `<path d="M 210 120 L 210 95 C 180 80, 200 35, 235 50 C 245 25, 275 25, 285 50 C 320 35, 335 80, 290 95 L 290 120 Z" fill="#ffffff" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>` +
        `<rect x="210" y="105" width="80" height="15" fill="#f1f5f9" stroke="${stroke}" stroke-width="2"/>` +
      `</g>`;
      break;

    case 'sunglasses':
      headAcc = `<g class="acc-sunglasses">` +
        `<path d="M 175 160 L 225 160 L 220 190 C 215 198, 185 198, 180 190 Z" fill="#0f172a" stroke="${stroke}" stroke-width="3"/>` +
        `<line x1="185" y1="168" x2="205" y2="188" stroke="#38bdf8" stroke-width="2" opacity="0.7"/>` +
        `<path d="M 275 160 L 325 160 L 320 190 C 315 198, 285 198, 280 190 Z" fill="#0f172a" stroke="${stroke}" stroke-width="3"/>` +
        `<line x1="285" y1="168" x2="305" y2="188" stroke="#38bdf8" stroke-width="2" opacity="0.7"/>` +
        `<line x1="225" y1="165" x2="275" y2="165" stroke="#0f172a" stroke-width="4"/>` +
      `</g>`;
      break;

    case 'angelHalo':
      headAcc = `<g class="acc-halo">` +
        `<ellipse cx="250" cy="70" rx="56" ry="15" fill="none" stroke="#fbbf24" stroke-width="6"/>` +
        `<ellipse cx="250" cy="70" rx="56" ry="15" fill="none" stroke="#fef08a" stroke-width="3"/>` +
      `</g>`;
      break;

    case 'sproutLeaf':
      headAcc = `<g class="acc-sprout">` +
        `<path d="M 250 115 Q 250 85 235 75 Q 255 75 250 115" fill="#22c55e" stroke="${stroke}" stroke-width="2.5"/>` +
        `<path d="M 250 95 Q 265 85 275 90 Q 265 105 250 95" fill="#4ade80" stroke="${stroke}" stroke-width="2.5"/>` +
      `</g>`;
      break;

    case 'partyHat':
      headAcc = `<g class="acc-party-hat">` +
        `<polygon points="250,30 215,115 285,115" fill="#ec4899" stroke="${stroke}" stroke-width="3"/>` +
        `<circle cx="250" cy="25" r="8" fill="#fde047"/>` +
        `<line x1="225" y1="90" x2="275" y2="90" stroke="#38bdf8" stroke-width="4"/>` +
      `</g>`;
      break;

    case 'devilHorns':
      headAcc = `<g class="acc-devil-horns">` +
        `<path d="M 180 125 Q 160 80 145 65 Q 175 80 195 120 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M 320 125 Q 340 80 355 65 Q 325 80 305 120 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3"/>` +
      `</g>`;
      break;

    default:
      break;
  }

  switch (dna.neckAccessory) {
    case 'bellCollar':
      neckAcc = `<g class="acc-bell-collar">` +
        `<path d="M 195 240 Q 250 262 305 240" fill="none" stroke="#ef4444" stroke-width="9" stroke-linecap="round"/>` +
        `<circle cx="250" cy="256" r="10.5" fill="#f59e0b" stroke="${stroke}" stroke-width="2.5"/>` +
        `<circle cx="248" cy="253" r="3" fill="#fef08a"/>` +
        `<line x1="244" y1="256" x2="256" y2="256" stroke="${stroke}" stroke-width="1.5"/>` +
        `<circle cx="250" cy="259" r="2" fill="${stroke}"/>` +
      `</g>`;
      break;

    case 'bowTie':
      neckAcc = `<g class="acc-bowtie">` +
        `<polygon points="250,245 225,230 225,260" fill="#dc2626" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<polygon points="250,245 275,230 275,260" fill="#dc2626" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<circle cx="250" cy="245" r="6.5" fill="#b91c1c" stroke="${stroke}" stroke-width="2"/>` +
      `</g>`;
      break;

    case 'warmScarf':
      neckAcc = `<g class="acc-scarf">` +
        `<path d="M 185 235 Q 250 265 315 235 Q 250 280 185 235 Z" fill="#f97316" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>` +
        `<path d="M 270 255 L 290 320 L 315 315 L 295 250 Z" fill="#ea580c" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<line x1="278" y1="280" x2="303" y2="275" stroke="#fef08a" stroke-width="4" stroke-linecap="round"/>` +
        `<line x1="284" y1="300" x2="309" y2="295" stroke="#fef08a" stroke-width="4" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'fishbonePendant':
      neckAcc = `<g class="acc-fishbone">` +
        `<path d="M 195 240 Q 250 260 305 240" fill="none" stroke="#475569" stroke-width="3"/>` +
        `<line x1="250" y1="255" x2="250" y2="280" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="250" cy="254" r="5" fill="#ffffff" stroke="${stroke}" stroke-width="1.5"/>` +
        `<line x1="242" y1="262" x2="258" y2="262" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="244" y1="270" x2="256" y2="270" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>` +
      `</g>`;
      break;

    case 'pearlNecklace':
      neckAcc = `<g class="acc-pearls">` +
        `<circle cx="205" cy="242" r="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
        `<circle cx="220" cy="248" r="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
        `<circle cx="236" cy="252" r="6.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
        `<circle cx="250" cy="254" r="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
        `<circle cx="264" cy="252" r="6.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
        `<circle cx="280" cy="248" r="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
        `<circle cx="295" cy="242" r="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>` +
      `</g>`;
      break;

    case 'bandanaPirate':
      neckAcc = `<g class="acc-bandana">` +
        `<polygon points="190,235 310,235 250,285" fill="#0f172a" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>` +
        `<circle cx="250" cy="252" r="5.5" fill="#ffffff"/>` +
        `<circle cx="248" cy="252" r="1.5" fill="#0f172a"/><circle cx="252" cy="252" r="1.5" fill="#0f172a"/>` +
      `</g>`;
      break;

    default:
      break;
  }

  return `<g class="cat-accessories">${neckAcc}${headAcc}</g>`;
}

function renderProps(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;

  switch (dna.propItem) {
    case 'coffeeMug':
      return `<g class="prop-coffee" transform="translate(350, 340)">` +
        `<rect x="0" y="20" width="45" height="40" rx="6" fill="#0284c7" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M 45 28 C 60 28, 60 52, 45 52" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>` +
        `<path d="M 15 15 Q 10 5 15 -5" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M 30 15 Q 35 5 30 -5" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>` +
      `</g>`;

    case 'yarnBall':
      return `<g class="prop-yarn" transform="translate(80, 360)">` +
        `<circle cx="30" cy="30" r="28" fill="#f43f5e" stroke="${stroke}" stroke-width="3"/>` +
        `<path d="M 12 20 Q 30 30 48 20" fill="none" stroke="#fda4af" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M 15 35 Q 30 45 45 35" fill="none" stroke="#fda4af" stroke-width="2.5" stroke-linecap="round"/>` +
        `<path d="M 55 45 Q 80 55 120 40 Q 150 25 180 35" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>` +
      `</g>`;

    case 'laserDot':
      return `<g class="prop-laser" transform="translate(100, 380)">` +
        `<circle cx="0" cy="0" r="14" fill="#f43f5e" opacity="0.4"/>` +
        `<circle cx="0" cy="0" r="7" fill="#ef4444"/>` +
        `<circle cx="0" cy="0" r="3" fill="#ffffff"/>` +
      `</g>`;

    case 'mouseFriend':
      return `<g class="prop-mouse" transform="translate(360, 375)">` +
        `<ellipse cx="25" cy="18" rx="20" ry="12" fill="#94a3b8" stroke="${stroke}" stroke-width="2.5"/>` +
        `<circle cx="12" cy="8" r="7" fill="#fbcfe8" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="8" cy="16" r="2.5" fill="#020617"/>` +
        `<path d="M 45 20 Q 65 15 60 30" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"/>` +
      `</g>`;

    case 'fishSkeleton':
      return `<g class="prop-fish-bones" transform="translate(360, 380)">` +
        `<path d="M 10 10 L 0 5 L 0 15 Z" fill="#e2e8f0" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
        `<line x1="10" y1="10" x2="50" y2="10" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>` +
        `<line x1="20" y1="2" x2="20" y2="18" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="30" y1="2" x2="30" y2="18" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>` +
        `<line x1="40" y1="2" x2="40" y2="18" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>` +
        `<polygon points="50,10 60,3 60,17" fill="#e2e8f0" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
      `</g>`;

    case 'pottedPlant':
      return `<g class="prop-plant" transform="translate(360, 330)">` +
        `<polygon points="10,35 40,35 35,65 15,65" fill="#ea580c" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>` +
        `<rect x="7" y="28" width="36" height="8" rx="2" fill="#c2410c" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="25" cy="20" r="14" fill="#22c55e" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="16" cy="18" r="9" fill="#16a34a" stroke="${stroke}" stroke-width="2"/>` +
        `<circle cx="34" cy="18" r="9" fill="#16a34a" stroke="${stroke}" stroke-width="2"/>` +
      `</g>`;

    case 'butterflyOnNose':
      return `<g class="prop-butterfly" transform="translate(250, 185)">` +
        `<ellipse cx="-8" cy="-8" rx="9" ry="12" transform="rotate(-30 -8 -8)" fill="#38bdf8" stroke="${stroke}" stroke-width="1.5"/>` +
        `<ellipse cx="8" cy="-8" rx="9" ry="12" transform="rotate(30 8 -8)" fill="#38bdf8" stroke="${stroke}" stroke-width="1.5"/>` +
        `<ellipse cx="0" cy="-6" rx="2.5" ry="7" fill="#0f172a"/>` +
      `</g>`;

    default:
      return '';
  }
}
