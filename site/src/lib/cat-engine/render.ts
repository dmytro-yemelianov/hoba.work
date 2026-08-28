/**
 * Vector Cat Engine — SVG Vector Renderer
 * Mathematically structured, scalable procedural SVG generator.
 */

import { resolveColors } from './colors';
import type { CatDNA, CatColors } from './types';

export function renderCatSVG(dna: CatDNA, options: { width?: number; height?: number; idPrefix?: string } = {}): string {
  const width = options.width ?? 500;
  const height = options.height ?? 500;
  const prefix = options.idPrefix ?? `cat-${dna.seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const colors = resolveColors(dna);

  const defs = renderDefs(prefix, colors, dna);
  const backdrop = renderBackdrop(dna, colors, prefix);
  const tail = renderTail(dna, colors);
  const body = renderBody(dna, colors);
  const patterns = renderFurPatterns(dna, colors);
  const headAndEars = renderHeadAndEars(dna, colors);
  const face = renderFace(dna, colors);
  const accessories = renderAccessories(dna, colors);
  const props = renderProps(dna, colors);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="${width}" height="${height}" data-cat-seed="${dna.seed}" style="overflow: visible; user-select: none;">
  ${defs}
  <g class="cat-root">
    ${backdrop}
    ${tail}
    ${body}
    ${patterns}
    ${headAndEars}
    ${face}
    ${accessories}
    ${props}
  </g>
</svg>`;
}

function renderDefs(prefix: string, colors: CatColors, dna: CatDNA): string {
  return `<defs>
    <!-- Soft Drop Shadow -->
    <filter id="${prefix}-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="${colors.shadow}" />
    </filter>

    <!-- Neon Glow -->
    <filter id="${prefix}-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Fur Linear Gradient -->
    <linearGradient id="${prefix}-fur-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.highlight}" stop-opacity="0.25" />
      <stop offset="30%" stop-color="${colors.primary}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>

    <!-- Eye Gradient Left -->
    <radialGradient id="${prefix}-eye-left" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="20%" stop-color="${colors.eyeLeft}" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Eye Gradient Right -->
    <radialGradient id="${prefix}-eye-right" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="20%" stop-color="${colors.eyeRight}" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Aura Radial Gradient -->
    <radialGradient id="${prefix}-aura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="0.35" />
      <stop offset="60%" stop-color="${colors.primary}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${colors.primary}" stop-opacity="0" />
    </radialGradient>
  </defs>`;
}

function renderBackdrop(dna: CatDNA, colors: CatColors, prefix: string): string {
  switch (dna.backdropTheme) {
    case 'sparkleStars':
      return `<g class="backdrop-sparkles" opacity="0.85">
        <!-- 4-point stars -->
        <path d="M 80 120 Q 80 140 100 140 Q 80 140 80 160 Q 80 140 60 140 Q 80 140 80 120 Z" fill="#fbbf24" filter="url(#${prefix}-glow)" />
        <path d="M 420 100 Q 420 115 435 115 Q 420 115 420 130 Q 420 115 405 115 Q 420 115 420 100 Z" fill="#fde047" />
        <path d="M 410 380 Q 410 395 425 395 Q 410 395 410 410 Q 410 395 395 395 Q 410 395 410 380 Z" fill="#fbbf24" />
        <path d="M 90 390 Q 90 400 100 400 Q 90 400 90 410 Q 90 400 80 400 Q 90 400 90 390 Z" fill="#fde047" />
        <circle cx="140" cy="80" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="360" cy="70" r="4" fill="#ffffff" opacity="0.9" />
        <circle cx="440" cy="260" r="3" fill="#ffffff" opacity="0.6" />
        <circle cx="60" cy="270" r="3" fill="#ffffff" opacity="0.7" />
      </g>`;

    case 'floatingHearts':
      return `<g class="backdrop-hearts" opacity="0.8">
        <path d="M 80 140 C 80 125, 60 125, 60 140 C 60 155, 80 170, 80 170 C 80 170, 100 155, 100 140 C 100 125, 80 125, 80 140 Z" fill="#f43f5e" />
        <path d="M 420 130 C 420 118, 404 118, 404 130 C 404 142, 420 154, 420 154 C 420 154, 436 142, 436 130 C 436 118, 420 118, 420 130 Z" fill="#fb7185" />
        <path d="M 410 360 C 410 350, 396 350, 396 360 C 396 370, 410 380, 410 380 C 410 380, 424 370, 424 360 C 424 350, 410 350, 410 360 Z" fill="#fda4af" />
        <path d="M 100 370 C 100 362, 88 362, 88 370 C 88 378, 100 386, 100 386 C 100 386, 112 378, 112 370 C 112 362, 100 362, 100 370 Z" fill="#f43f5e" />
      </g>`;

    case 'pawPrints':
      return `<g class="backdrop-paws" opacity="0.25" fill="${colors.primary}">
        <!-- Top left paw -->
        <g transform="translate(60, 90) rotate(-20) scale(0.6)">
          <ellipse cx="20" cy="28" rx="14" ry="11" />
          <circle cx="8" cy="10" r="5" /><circle cx="18" cy="6" r="5" /><circle cx="28" cy="8" r="5" /><circle cx="36" cy="14" r="4.5" />
        </g>
        <!-- Top right paw -->
        <g transform="translate(400, 110) rotate(25) scale(0.7)">
          <ellipse cx="20" cy="28" rx="14" ry="11" />
          <circle cx="8" cy="10" r="5" /><circle cx="18" cy="6" r="5" /><circle cx="28" cy="8" r="5" /><circle cx="36" cy="14" r="4.5" />
        </g>
        <!-- Bottom left paw -->
        <g transform="translate(70, 370) rotate(15) scale(0.65)">
          <ellipse cx="20" cy="28" rx="14" ry="11" />
          <circle cx="8" cy="10" r="5" /><circle cx="18" cy="6" r="5" /><circle cx="28" cy="8" r="5" /><circle cx="36" cy="14" r="4.5" />
        </g>
        <!-- Bottom right paw -->
        <g transform="translate(390, 380) rotate(-30) scale(0.6)">
          <ellipse cx="20" cy="28" rx="14" ry="11" />
          <circle cx="8" cy="10" r="5" /><circle cx="18" cy="6" r="5" /><circle cx="28" cy="8" r="5" /><circle cx="36" cy="14" r="4.5" />
        </g>
      </g>`;

    case 'glowingAura':
      return `<circle cx="250" cy="260" r="210" fill="url(#${prefix}-aura)" />`;

    case 'cozyPillow':
      return `<g class="backdrop-pillow">
        <!-- Pillow Base -->
        <path d="M 80 390 C 70 340, 430 340, 420 390 C 425 440, 75 440, 80 390 Z" fill="#e0e7ff" stroke="#c7d2fe" stroke-width="3" />
        <!-- Pillow Tassels -->
        <circle cx="76" cy="390" r="7" fill="#818cf8" />
        <circle cx="424" cy="390" r="7" fill="#818cf8" />
        <path d="M 120 390 Q 250 410 380 390" stroke="#c7d2fe" stroke-width="2" fill="none" stroke-dasharray="6 6" />
      </g>`;

    case 'cyberGrid':
      return `<g class="backdrop-cyber" opacity="0.35">
        <circle cx="250" cy="250" r="190" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 8" fill="none" />
        <circle cx="250" cy="250" r="140" stroke="#ec4899" stroke-width="1" fill="none" />
        <line x1="50" y1="250" x2="450" y2="250" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.4" />
        <line x1="250" y1="50" x2="250" y2="450" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.4" />
      </g>`;

    case 'fishPattern':
      return `<g class="backdrop-fish" opacity="0.3" stroke="${colors.primary}" stroke-width="2" fill="none">
        <path d="M 70 120 C 90 110, 110 130, 130 120 L 140 110 L 140 130 Z" />
        <path d="M 410 140 C 390 130, 370 150, 350 140 L 340 130 L 340 150 Z" />
        <path d="M 90 380 C 110 370, 130 390, 150 380 L 160 370 L 160 390 Z" />
      </g>`;

    default:
      return '';
  }
}

function renderTail(dna: CatDNA, colors: CatColors): string {
  const angle = dna.tailWagAngle;
  const stroke = colors.lineStroke;
  const fill = colors.primary;

  switch (dna.tailType) {
    case 'fluffyPlume':
      return `<g class="cat-tail" transform="rotate(${angle} 340 330)">
        <path d="M 320 340 C 370 340, 440 310, 440 220 C 440 150, 380 140, 360 170 C 350 185, 365 210, 355 230 C 340 260, 310 310, 320 340 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round" />
        <!-- Fluffy tufts on tail -->
        <path d="M 430 200 Q 450 190 435 225 Q 445 240 425 255" fill="none" stroke="${stroke}" stroke-width="2" />
        <!-- Tail Tip highlight -->
        <path d="M 370 155 C 385 145, 410 150, 425 180 C 410 175, 390 170, 370 155 Z" fill="${colors.highlight}" opacity="0.6" />
      </g>`;

    case 'curlySpiral':
      return `<g class="cat-tail" transform="rotate(${angle} 330 340)">
        <path d="M 330 340 C 380 340, 430 300, 420 230 C 410 170, 340 180, 350 220 C 355 240, 380 240, 380 225"
          fill="none" stroke="${fill}" stroke-width="24" stroke-linecap="round" />
        <path d="M 330 340 C 380 340, 430 300, 420 230 C 410 170, 340 180, 350 220 C 355 240, 380 240, 380 225"
          fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
      </g>`;

    case 'bobtailBun':
      return `<g class="cat-tail">
        <circle cx="340" cy="330" r="22" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <circle cx="345" cy="325" r="16" fill="${colors.secondary}" opacity="0.4" />
      </g>`;

    case 'zigzagKink':
      return `<g class="cat-tail">
        <path d="M 325 340 L 380 300 L 350 240 L 410 190"
          fill="none" stroke="${fill}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 325 340 L 380 300 L 350 240 L 410 190"
          fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </g>`;

    case 'candyCane':
      return `<g class="cat-tail">
        <path d="M 330 340 C 380 340, 420 290, 420 210 C 420 160, 380 150, 365 175"
          fill="none" stroke="${fill}" stroke-width="18" stroke-linecap="round" />
        <path d="M 330 340 C 380 340, 420 290, 420 210 C 420 160, 380 150, 365 175"
          fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
        <!-- White candy cane tip -->
        <circle cx="365" cy="175" r="10" fill="#ffffff" stroke="${stroke}" stroke-width="3" />
      </g>`;

    case 'sleekWhip':
    default:
      return `<g class="cat-tail" transform="rotate(${angle} 330 340)">
        <path d="M 330 340 C 390 340, 430 280, 410 200 C 400 160, 360 170, 370 195"
          fill="none" stroke="${fill}" stroke-width="18" stroke-linecap="round" />
        <path d="M 330 340 C 390 340, 430 280, 410 200 C 400 160, 360 170, 370 195"
          fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />
      </g>`;
  }
}

function renderBody(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  const fill = colors.primary;
  const chonk = dna.chonkFactor;

  switch (dna.pose) {
    case 'loaf':
      // Rounded bread loaf
      return `<g class="cat-body">
        <!-- Main Torso -->
        <path d="M 120 330 C 120 250, 380 250, 380 330 C 380 390, 120 390, 120 330 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Belly Highlight / Shadow -->
        <path d="M 140 345 C 140 300, 360 300, 360 345 C 360 380, 140 380, 140 345 Z"
          fill="${colors.secondary}" opacity="0.15" />
        <!-- Tucked Front Paws -->
        <ellipse cx="210" cy="365" rx="22" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <ellipse cx="280" cy="365" rx="22" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <!-- Paw toes -->
        <line x1="205" y1="365" x2="205" y2="375" stroke="${stroke}" stroke-width="2" />
        <line x1="215" y1="365" x2="215" y2="375" stroke="${stroke}" stroke-width="2" />
        <line x1="275" y1="365" x2="275" y2="375" stroke="${stroke}" stroke-width="2" />
        <line x1="285" y1="365" x2="285" y2="375" stroke="${stroke}" stroke-width="2" />
      </g>`;

    case 'sitting':
      // Upright noble sitting pose
      return `<g class="cat-body">
        <!-- Torso Teardrop -->
        <path d="M 170 210 C 140 280, ${110 * (2 - chonk)} 380, 160 390 C 210 395, 290 395, 340 390 C ${390 * chonk} 380, 360 280, 330 210 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Chest Fluff Bib -->
        <path d="M 210 220 Q 250 260 290 220 Q 250 310 210 220 Z" fill="${colors.belly}" opacity="0.85" />
        <!-- Front Paws (Straight) -->
        <path d="M 205 280 L 205 385 C 205 395, 235 395, 235 385 L 235 280 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="3.5" />
        <path d="M 265 280 L 265 385 C 265 395, 295 395, 295 385 L 295 280 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="3.5" />
        <!-- Toes on straight paws -->
        <line x1="215" y1="380" x2="215" y2="392" stroke="${stroke}" stroke-width="2" />
        <line x1="225" y1="380" x2="225" y2="392" stroke="${stroke}" stroke-width="2" />
        <line x1="275" y1="380" x2="275" y2="392" stroke="${stroke}" stroke-width="2" />
        <line x1="285" y1="380" x2="285" y2="392" stroke="${stroke}" stroke-width="2" />
      </g>`;

    case 'stretching':
      // Arched yoga stretch
      return `<g class="cat-body">
        <!-- Lowered chest, raised rear -->
        <path d="M 130 350 C 170 330, 260 300, 360 270 C 390 280, 390 350, 350 370 C 270 370, 180 370, 130 350 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Extended Front Paws -->
        <path d="M 140 340 L 90 375 C 80 382, 105 395, 115 385 L 170 355 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="3" />
        <path d="M 155 345 L 110 385 C 100 392, 125 400, 135 392 L 185 355 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="3" />
        <!-- Rear Thighs -->
        <circle cx="345" cy="325" r="45" fill="${fill}" stroke="${stroke}" stroke-width="3.5" />
      </g>`;

    case 'chilling':
      // Relaxed sprawled bean
      return `<g class="cat-body">
        <!-- Horizontal curved bean -->
        <path d="M 130 310 C 130 250, 370 250, 370 310 C 370 380, 130 380, 130 310 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Big soft tummy -->
        <ellipse cx="250" cy="320" rx="90" ry="40" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5" />
        <!-- Sprawled feet -->
        <ellipse cx="140" cy="345" rx="18" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5" />
        <ellipse cx="360" cy="345" rx="18" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="2.5" />
        <!-- Pink toe beans! -->
        <circle cx="140" cy="345" r="5" fill="${colors.nose}" />
        <circle cx="360" cy="345" r="5" fill="${colors.nose}" />
      </g>`;

    case 'pounce':
      // Low crouch ready to spring
      return `<g class="cat-body">
        <path d="M 120 330 C 160 300, 300 280, 380 300 C 400 330, 360 370, 310 370 C 220 370, 150 360, 120 330 Z"
          fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Tensed front paws -->
        <ellipse cx="160" cy="360" rx="24" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <ellipse cx="220" cy="360" rx="24" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <!-- Big rear spring muscle -->
        <ellipse cx="345" cy="325" rx="36" ry="32" fill="${fill}" stroke="${stroke}" stroke-width="3" />
      </g>`;

    case 'orb':
      // Spherical chonk
      return `<g class="cat-body">
        <circle cx="250" cy="300" r="${110 * chonk}" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Giant belly circle -->
        <circle cx="250" cy="320" r="${75 * chonk}" fill="${colors.belly}" opacity="0.9" />
        <!-- Tiny cute paws poking out bottom -->
        <ellipse cx="200" cy="${300 + 95 * chonk}" rx="18" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <ellipse cx="300" cy="${300 + 95 * chonk}" rx="18" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
      </g>`;

    case 'longcat':
      // Tubular elongated cat
      return `<g class="cat-body">
        <rect x="190" y="190" width="120" height="200" rx="45" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <rect x="215" y="220" width="70" height="150" rx="30" fill="${colors.belly}" opacity="0.9" />
        <!-- Tiny bottom paws -->
        <ellipse cx="215" cy="390" rx="16" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <ellipse cx="285" cy="390" rx="16" ry="12" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
      </g>`;

    case 'box':
    default:
      // Cat inside cardboard box
      return `<g class="cat-body">
        <!-- Cat chest in box -->
        <ellipse cx="250" cy="270" rx="80" ry="60" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <!-- Cardboard box -->
        <path d="M 120 290 L 380 290 L 360 410 L 140 410 Z" fill="#d97706" stroke="${stroke}" stroke-width="4" />
        <path d="M 120 290 L 90 260 L 140 260 L 155 290" fill="#b45309" stroke="${stroke}" stroke-width="3" />
        <path d="M 380 290 L 410 260 L 360 260 L 345 290" fill="#b45309" stroke="${stroke}" stroke-width="3" />
        <!-- Box tape & text -->
        <rect x="180" y="325" width="140" height="35" rx="6" fill="#fef3c7" stroke="${stroke}" stroke-width="2" />
        <text x="250" y="348" text-anchor="middle" font-size="16" font-weight="bold" fill="#78350f" font-family="monospace">📦 HOBA CAT</text>
        <!-- Two little paws hanging over the box edge -->
        <ellipse cx="205" cy="290" rx="20" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <ellipse cx="295" cy="290" rx="20" ry="14" fill="${colors.belly}" stroke="${stroke}" stroke-width="3" />
        <line x1="200" y1="288" x2="200" y2="298" stroke="${stroke}" stroke-width="2" />
        <line x1="210" y1="288" x2="210" y2="298" stroke="${stroke}" stroke-width="2" />
        <line x1="290" y1="288" x2="290" y2="298" stroke="${stroke}" stroke-width="2" />
        <line x1="300" y1="288" x2="300" y2="298" stroke="${stroke}" stroke-width="2" />
      </g>`;
  }
}

function renderFurPatterns(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  const accent = colors.tertiary ?? colors.secondary;

  switch (dna.furPattern) {
    case 'tabbyStripes':
      return `<g class="fur-patterns-stripes" fill="${accent}" opacity="0.8">
        <!-- Back and flank stripes -->
        <path d="M 190 280 Q 220 290 195 305 Z" />
        <path d="M 180 320 Q 215 325 185 340 Z" />
        <path d="M 310 280 Q 280 290 305 305 Z" />
        <path d="M 320 320 Q 285 325 315 340 Z" />
      </g>`;

    case 'dappledSpots':
      return `<g class="fur-patterns-spots" fill="${accent}" opacity="0.85">
        <circle cx="190" cy="290" r="10" />
        <circle cx="210" cy="330" r="14" />
        <circle cx="290" cy="300" r="12" />
        <circle cx="310" cy="340" r="9" />
        <circle cx="250" cy="360" r="11" />
      </g>`;

    case 'heartPatch':
      return `<g class="fur-patterns-heart">
        <path d="M 300 310 C 300 298, 285 298, 285 310 C 285 322, 300 334, 300 334 C 300 334, 315 322, 315 310 C 315 298, 300 298, 300 310 Z"
          fill="${accent}" stroke="${stroke}" stroke-width="2" />
      </g>`;

    case 'maskedBandit':
      return `<g class="fur-patterns-mask" fill="${colors.secondary}" opacity="0.6">
        <ellipse cx="190" cy="180" rx="35" ry="22" />
        <ellipse cx="310" cy="180" rx="35" ry="22" />
      </g>`;

    default:
      return '';
  }
}

function renderHeadAndEars(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  const fill = colors.primary;
  const tilt = dna.earAngleOffset;

  // Head center is roughly (250, 180)
  let headPath = '';
  switch (dna.headShape) {
    case 'fluffyCheeks':
      headPath = `<path d="M 170 170 C 140 140, 140 210, 125 215 C 150 240, 180 250, 250 250 C 320 250, 350 240, 375 215 C 360 210, 360 140, 330 170 C 300 130, 200 130, 170 170 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="4" />`;
      break;

    case 'triangle':
      headPath = `<path d="M 180 150 C 150 190, 190 250, 250 255 C 310 250, 350 190, 320 150 C 280 130, 220 130, 180 150 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="4" />`;
      break;

    case 'heart':
      headPath = `<path d="M 170 160 C 140 190, 180 250, 250 255 C 320 250, 360 190, 330 160 C 300 145, 270 155, 250 165 C 230 155, 200 145, 170 160 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="4" />`;
      break;

    case 'chonky':
      headPath = `<ellipse cx="250" cy="185" rx="105" ry="78" fill="${fill}" stroke="${stroke}" stroke-width="4" />`;
      break;

    case 'round':
    default:
      headPath = `<circle cx="250" cy="180" r="82" fill="${fill}" stroke="${stroke}" stroke-width="4" />`;
      break;
  }

  // Ear rendering
  let ears = '';
  switch (dna.earType) {
    case 'fold':
      // Folded Scottish fold ears
      ears = `<g class="cat-ears-fold">
        <path d="M 170 140 C 160 125, 190 120, 205 140 C 190 155, 175 155, 170 140 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 330 140 C 340 125, 310 120, 295 140 C 310 155, 325 155, 330 140 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
      </g>`;
      break;

    case 'lynx':
      // Ears with tufts
      ears = `<g class="cat-ears-lynx">
        <path d="M 170 150 L 145 70 L 220 125 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 170 140 L 155 90 L 205 125 Z" fill="${colors.innerEar}" />
        <!-- Lynx Tuft -->
        <path d="M 145 70 Q 135 45 140 35 Q 148 50 145 70 Z" fill="${stroke}" />

        <path d="M 330 150 L 355 70 L 280 125 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 330 140 L 345 90 L 295 125 Z" fill="${colors.innerEar}" />
        <!-- Lynx Tuft -->
        <path d="M 355 70 Q 365 45 360 35 Q 352 50 355 70 Z" fill="${stroke}" />
      </g>`;
      break;

    case 'bigServal':
      // Huge ears
      ears = `<g class="cat-ears-serval">
        <path d="M 165 160 L 120 40 L 230 120 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 165 145 L 135 65 L 215 115 Z" fill="${colors.innerEar}" />
        <path d="M 335 160 L 380 40 L 270 120 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 335 145 L 365 65 L 285 115 Z" fill="${colors.innerEar}" />
      </g>`;

    case 'roundBear':
      ears = `<g class="cat-ears-round">
        <circle cx="165" cy="115" r="32" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <circle cx="165" cy="115" r="20" fill="${colors.innerEar}" />
        <circle cx="335" cy="115" r="32" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <circle cx="335" cy="115" r="20" fill="${colors.innerEar}" />
      </g>`;

    case 'classic':
    default:
      ears = `<g class="cat-ears-classic" transform="rotate(${tilt} 250 150)">
        <!-- Left Ear -->
        <path d="M 175 145 L 140 75 L 220 120 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 175 135 L 152 90 L 208 118 Z" fill="${colors.innerEar}" />
        <!-- Right Ear -->
        <path d="M 325 145 L 360 75 L 280 120 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" />
        <path d="M 325 135 L 348 90 L 292 118 Z" fill="${colors.innerEar}" />
      </g>`;
      break;
  }

  // Forehead Tabby 'M' mark if striped
  const foreheadMark =
    dna.furPattern === 'tabbyStripes'
      ? `<g class="forehead-m" stroke="${colors.secondary}" stroke-width="3.5" fill="none" stroke-linecap="round">
          <path d="M 230 135 L 238 155 L 250 142 L 262 155 L 270 135" />
        </g>`
      : '';

  // Cheeks Blush
  const blush = `<g class="cat-blush" opacity="${dna.blushIntensity}">
    <ellipse cx="170" cy="195" rx="15" ry="9" fill="${colors.blush}" />
    <ellipse cx="330" cy="195" rx="15" ry="9" fill="${colors.blush}" />
  </g>`;

  return `<g class="cat-head-and-ears">
    ${ears}
    ${headPath}
    ${foreheadMark}
    ${blush}
  </g>`;
}

function renderFace(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  const whiskerLen = dna.whiskerLength;

  // Eyes rendering
  let eyes = '';
  switch (dna.eyeShape) {
    case 'curvedHappy':
      // Happy closed eyes (^ ^)
      eyes = `<g class="cat-eyes-happy" stroke="${stroke}" stroke-width="4.5" fill="none" stroke-linecap="round">
        <path d="M 185 178 Q 205 160 225 178" />
        <path d="M 275 178 Q 295 160 315 178" />
      </g>`;
      break;

    case 'sleepyLids':
      // Sleepy half lids
      eyes = `<g class="cat-eyes-sleepy">
        <ellipse cx="205" cy="178" rx="18" ry="12" fill="${colors.eyeLeft}" stroke="${stroke}" stroke-width="3.5" />
        <circle cx="205" cy="178" r="7" fill="#020617" />
        <path d="M 185 174 Q 205 170 225 174" stroke="${stroke}" stroke-width="4.5" fill="none" />

        <ellipse cx="295" cy="178" rx="18" ry="12" fill="${colors.eyeRight}" stroke="${stroke}" stroke-width="3.5" />
        <circle cx="295" cy="178" r="7" fill="#020617" />
        <path d="M 275 174 Q 295 170 315 174" stroke="${stroke}" stroke-width="4.5" fill="none" />
      </g>`;

    case 'shockedRound':
      // Big shocked dinner plates
      eyes = `<g class="cat-eyes-shocked">
        <circle cx="200" cy="175" r="22" fill="#ffffff" stroke="${stroke}" stroke-width="4" />
        <circle cx="200" cy="175" r="16" fill="${colors.eyeLeft}" />
        <circle cx="200" cy="175" r="8" fill="#020617" />
        <circle cx="195" cy="170" r="4" fill="#ffffff" />

        <circle cx="300" cy="175" r="22" fill="#ffffff" stroke="${stroke}" stroke-width="4" />
        <circle cx="300" cy="175" r="16" fill="${colors.eyeRight}" />
        <circle cx="300" cy="175" r="8" fill="#020617" />
        <circle cx="295" cy="170" r="4" fill="#ffffff" />
      </g>`;

    case 'wink':
      // Wink: left happy, right open
      eyes = `<g class="cat-eyes-wink">
        <path d="M 185 178 Q 205 160 225 178" stroke="${stroke}" stroke-width="4.5" fill="none" stroke-linecap="round" />

        <circle cx="295" cy="175" r="18" fill="${colors.eyeRight}" stroke="${stroke}" stroke-width="4" />
        <circle cx="295" cy="175" r="10" fill="#020617" />
        <circle cx="290" cy="170" r="5" fill="#ffffff" />
        <circle cx="300" cy="180" r="2.5" fill="#ffffff" />
      </g>`;

    case 'derpCross':
      // Derpy cross-eyed
      eyes = `<g class="cat-eyes-derp">
        <circle cx="200" cy="175" r="18" fill="#ffffff" stroke="${stroke}" stroke-width="3.5" />
        <circle cx="210" cy="175" r="8" fill="#020617" />
        <circle cx="208" cy="172" r="2.5" fill="#ffffff" />

        <circle cx="300" cy="175" r="18" fill="#ffffff" stroke="${stroke}" stroke-width="3.5" />
        <circle cx="290" cy="175" r="8" fill="#020617" />
        <circle cx="288" cy="172" r="2.5" fill="#ffffff" />
      </g>`;

    case 'slitPredator':
      // Slit predatory pupils
      eyes = `<g class="cat-eyes-slit">
        <ellipse cx="205" cy="175" rx="18" ry="15" fill="${colors.eyeLeft}" stroke="${stroke}" stroke-width="3.5" />
        <path d="M 205 162 C 208 170, 208 180, 205 188 C 202 180, 202 170, 205 162 Z" fill="#020617" />

        <ellipse cx="295" cy="175" rx="18" ry="15" fill="${colors.eyeRight}" stroke="${stroke}" stroke-width="3.5" />
        <path d="M 295 162 C 298 170, 298 180, 295 188 C 292 180, 292 170, 295 162 Z" fill="#020617" />
      </g>`;

    case 'animeSparkle':
    default:
      // Anime Sparkle with double highlight
      eyes = `<g class="cat-eyes-anime">
        <!-- Left Eye -->
        <ellipse cx="205" cy="175" rx="20" ry="22" fill="${colors.eyeLeft}" stroke="${stroke}" stroke-width="4" />
        <ellipse cx="205" cy="175" rx="12" ry="14" fill="#020617" />
        <circle cx="198" cy="166" r="6" fill="#ffffff" />
        <circle cx="211" cy="182" r="3" fill="#ffffff" />
        <!-- Right Eye -->
        <ellipse cx="295" cy="175" rx="20" ry="22" fill="${colors.eyeRight}" stroke="${stroke}" stroke-width="4" />
        <ellipse cx="295" cy="175" rx="12" ry="14" fill="#020617" />
        <circle cx="288" cy="166" r="6" fill="#ffffff" />
        <circle cx="301" cy="182" r="3" fill="#ffffff" />
      </g>`;
      break;
  }

  // Nose (Tiny inverted triangle)
  const nose = `<path d="M 242 195 L 258 195 L 250 203 Z" fill="${colors.nose}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round" />`;

  // Mouth rendering
  let mouth = '';
  switch (dna.mouthEmotion) {
    case 'blep':
      // Little pink tongue sticking out
      mouth = `<g class="cat-mouth-blep">
        <path d="M 235 204 Q 243 212 250 204 Q 257 212 265 204" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />
        <!-- Tongue -->
        <path d="M 244 207 C 244 220, 256 220, 256 207 Z" fill="${colors.tongue}" stroke="${stroke}" stroke-width="2" />
        <line x1="250" y1="208" x2="250" y2="216" stroke="${stroke}" stroke-width="1" />
      </g>`;
      break;

    case 'smugSmile':
      mouth = `<path d="M 245 204 Q 255 206 268 198" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />`;
      break;

    case 'gaspO':
      mouth = `<g class="cat-mouth-gasp">
        <ellipse cx="250" cy="214" rx="10" ry="12" fill="#020617" stroke="${stroke}" stroke-width="2.5" />
        <path d="M 245 206 L 247 210 L 249 206" fill="#ffffff" />
        <path d="M 251 206 L 253 210 L 255 206" fill="#ffffff" />
      </g>`;

    case 'grumpyLine':
      mouth = `<path d="M 235 212 Q 250 204 265 212" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" />`;
      break;

    case 'yowlScream':
      mouth = `<g class="cat-mouth-yowl">
        <path d="M 232 204 Q 250 240 268 204 Z" fill="#991b1b" stroke="${stroke}" stroke-width="3" />
        <ellipse cx="250" cy="222" rx="8" ry="6" fill="${colors.tongue}" />
      </g>`;

    case 'sleepyZ':
      mouth = `<g class="cat-mouth-sleepy">
        <path d="M 240 206 Q 250 210 260 206" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />
        <!-- Floating Zzz -->
        <text x="320" y="140" font-size="20" font-weight="bold" fill="${colors.accent}" font-family="sans-serif">z</text>
        <text x="340" y="120" font-size="26" font-weight="bold" fill="${colors.accent}" font-family="sans-serif">Z</text>
        <text x="365" y="95" font-size="32" font-weight="bold" fill="${colors.accent}" font-family="sans-serif">Z</text>
      </g>`;

    case 'purr3':
    default:
      mouth = `<path d="M 232 204 Q 241 214 250 204 Q 259 214 268 204" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" />`;
      break;
  }

  // Whiskers (3 left, 3 right)
  const wl = 50 * whiskerLen;
  const whiskers = `<g class="cat-whiskers" stroke="${stroke}" stroke-width="2" stroke-linecap="round" opacity="0.85">
    <!-- Left Whiskers -->
    <line x1="165" y1="198" x2="${165 - wl}" y2="188" />
    <line x1="165" y1="204" x2="${165 - wl * 1.1}" y2="204" />
    <line x1="165" y1="210" x2="${165 - wl}" y2="218" />
    <!-- Right Whiskers -->
    <line x1="335" y1="198" x2="${335 + wl}" y2="188" />
    <line x1="335" y1="204" x2="${335 + wl * 1.1}" y2="204" />
    <line x1="335" y1="210" x2="${335 + wl}" y2="218" />
  </g>`;

  return `<g class="cat-face">
    ${eyes}
    ${nose}
    ${mouth}
    ${whiskers}
  </g>`;
}

function renderAccessories(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;
  let headAcc = '';
  let neckAcc = '';

  // 1. Head Accessories
  switch (dna.headAccessory) {
    case 'wizardHat':
      headAcc = `<g class="acc-wizard-hat">
        <!-- Hat base cone -->
        <path d="M 180 120 L 250 15 L 320 120 Z" fill="#4338ca" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round" />
        <!-- Hat brim -->
        <ellipse cx="250" cy="120" rx="75" ry="16" fill="#3730a3" stroke="${stroke}" stroke-width="3.5" />
        <!-- Gold buckle / star -->
        <rect x="235" y="100" width="30" height="15" fill="#f59e0b" stroke="${stroke}" stroke-width="2" />
        <polygon points="250,55 254,65 265,65 256,72 260,82 250,76 240,82 244,72 235,65 246,65" fill="#fde047" />
      </g>`;
      break;

    case 'royalCrown':
      headAcc = `<g class="acc-crown">
        <path d="M 205 125 L 205 85 L 225 105 L 250 75 L 275 105 L 295 85 L 295 125 Z"
          fill="#f59e0b" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" />
        <!-- Gemstones -->
        <circle cx="205" cy="85" r="4" fill="#ef4444" />
        <circle cx="250" cy="75" r="5" fill="#3b82f6" />
        <circle cx="295" cy="85" r="4" fill="#ef4444" />
        <circle cx="250" cy="115" r="4" fill="#ef4444" />
      </g>`;
      break;

    case 'fishOnHead':
      headAcc = `<g class="acc-fish-head">
        <path d="M 210 115 C 230 95, 270 95, 290 115 L 305 105 L 305 125 Z" fill="#06b6d4" stroke="${stroke}" stroke-width="3" />
        <circle cx="230" cy="110" r="3" fill="#ffffff" />
        <circle cx="230" cy="110" r="1.5" fill="#020617" />
      </g>`;
      break;

    case 'flowerCrown':
      headAcc = `<g class="acc-flowers">
        <circle cx="190" cy="120" r="12" fill="#fda4af" stroke="${stroke}" stroke-width="2" />
        <circle cx="190" cy="120" r="4" fill="#fde047" />
        <circle cx="225" cy="110" r="14" fill="#f472b6" stroke="${stroke}" stroke-width="2" />
        <circle cx="225" cy="110" r="5" fill="#fde047" />
        <circle cx="265" cy="110" r="13" fill="#c084fc" stroke="${stroke}" stroke-width="2" />
        <circle cx="265" cy="110" r="4.5" fill="#fde047" />
        <circle cx="300" cy="120" r="12" fill="#38bdf8" stroke="${stroke}" stroke-width="2" />
        <circle cx="300" cy="120" r="4" fill="#fde047" />
      </g>`;
      break;

    case 'frogBeanie':
      headAcc = `<g class="acc-frog-beanie">
        <path d="M 180 135 C 180 85, 320 85, 320 135 Z" fill="#22c55e" stroke="${stroke}" stroke-width="3.5" />
        <!-- Frog Eyes on top -->
        <circle cx="205" cy="85" r="15" fill="#22c55e" stroke="${stroke}" stroke-width="3" />
        <circle cx="205" cy="85" r="10" fill="#ffffff" />
        <circle cx="205" cy="85" r="5" fill="#020617" />

        <circle cx="295" cy="85" r="15" fill="#22c55e" stroke="${stroke}" stroke-width="3" />
        <circle cx="295" cy="85" r="10" fill="#ffffff" />
        <circle cx="295" cy="85" r="5" fill="#020617" />
      </g>`;
      break;

    case 'chefHat':
      headAcc = `<g class="acc-chef-hat">
        <path d="M 210 120 L 210 95 C 180 80, 200 35, 235 50 C 245 25, 275 25, 285 50 C 320 35, 335 80, 290 95 L 290 120 Z"
          fill="#ffffff" stroke="${stroke}" stroke-width="3.5" />
        <rect x="210" y="105" width="80" height="15" fill="#f1f5f9" stroke="${stroke}" stroke-width="2" />
      </g>`;
      break;

    case 'sunglasses':
      headAcc = `<g class="acc-sunglasses">
        <!-- Left Lens -->
        <path d="M 175 160 L 225 160 L 220 190 C 215 198, 185 198, 180 190 Z" fill="#0f172a" stroke="${stroke}" stroke-width="3" />
        <line x1="185" y1="168" x2="205" y2="188" stroke="#38bdf8" stroke-width="2" opacity="0.7" />
        <!-- Right Lens -->
        <path d="M 275 160 L 325 160 L 320 190 C 315 198, 285 198, 280 190 Z" fill="#0f172a" stroke="${stroke}" stroke-width="3" />
        <line x1="285" y1="168" x2="305" y2="188" stroke="#38bdf8" stroke-width="2" opacity="0.7" />
        <!-- Center Bridge -->
        <line x1="225" y1="165" x2="275" y2="165" stroke="#0f172a" stroke-width="4" />
      </g>`;
      break;

    case 'angelHalo':
      headAcc = `<g class="acc-halo">
        <ellipse cx="250" cy="70" rx="55" ry="14" fill="none" stroke="#fbbf24" stroke-width="6" />
        <ellipse cx="250" cy="70" rx="55" ry="14" fill="none" stroke="#fef08a" stroke-width="3" />
      </g>`;
      break;

    case 'sproutLeaf':
      headAcc = `<g class="acc-sprout">
        <path d="M 250 115 Q 250 85 235 75 Q 255 75 250 115" fill="#22c55e" stroke="${stroke}" stroke-width="2.5" />
        <path d="M 250 95 Q 265 85 275 90 Q 265 105 250 95" fill="#4ade80" stroke="${stroke}" stroke-width="2.5" />
      </g>`;
      break;

    case 'partyHat':
      headAcc = `<g class="acc-party-hat">
        <polygon points="250,30 215,115 285,115" fill="#ec4899" stroke="${stroke}" stroke-width="3" />
        <circle cx="250" cy="25" r="8" fill="#fde047" />
        <line x1="225" y1="90" x2="275" y2="90" stroke="#38bdf8" stroke-width="4" />
      </g>`;
      break;

    case 'devilHorns':
      headAcc = `<g class="acc-devil-horns">
        <path d="M 180 125 Q 160 80 145 65 Q 175 80 195 120 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3" />
        <path d="M 320 125 Q 340 80 355 65 Q 325 80 305 120 Z" fill="#ef4444" stroke="${stroke}" stroke-width="3" />
      </g>`;
      break;

    default:
      break;
  }

  // 2. Neck Accessories
  switch (dna.neckAccessory) {
    case 'bellCollar':
      neckAcc = `<g class="acc-bell-collar">
        <!-- Collar Strap -->
        <path d="M 195 240 Q 250 260 305 240" fill="none" stroke="#ef4444" stroke-width="9" stroke-linecap="round" />
        <!-- Golden Bell -->
        <circle cx="250" cy="255" r="10" fill="#f59e0b" stroke="${stroke}" stroke-width="2.5" />
        <line x1="244" y1="255" x2="256" y2="255" stroke="${stroke}" stroke-width="1.5" />
        <circle cx="250" cy="258" r="2" fill="${stroke}" />
      </g>`;
      break;

    case 'bowTie':
      neckAcc = `<g class="acc-bowtie">
        <polygon points="250,245 225,230 225,260" fill="#dc2626" stroke="${stroke}" stroke-width="2.5" />
        <polygon points="250,245 275,230 275,260" fill="#dc2626" stroke="${stroke}" stroke-width="2.5" />
        <circle cx="250" cy="245" r="6" fill="#b91c1c" stroke="${stroke}" stroke-width="2" />
      </g>`;

    case 'warmScarf':
      neckAcc = `<g class="acc-scarf">
        <path d="M 185 235 Q 250 265 315 235 Q 250 280 185 235 Z" fill="#f97316" stroke="${stroke}" stroke-width="3.5" />
        <!-- Dangling scarf tail -->
        <path d="M 270 255 L 290 320 L 315 315 L 295 250 Z" fill="#ea580c" stroke="${stroke}" stroke-width="3" />
        <!-- Stripes on scarf -->
        <line x1="278" y1="280" x2="303" y2="275" stroke="#fef08a" stroke-width="4" />
        <line x1="284" y1="300" x2="309" y2="295" stroke="#fef08a" stroke-width="4" />
      </g>`;

    case 'fishbonePendant':
      neckAcc = `<g class="acc-fishbone">
        <path d="M 195 240 Q 250 260 305 240" fill="none" stroke="#475569" stroke-width="3" />
        <!-- Fishbone charm -->
        <line x1="250" y1="255" x2="250" y2="280" stroke="#ffffff" stroke-width="3" />
        <circle cx="250" cy="254" r="5" fill="#ffffff" stroke="${stroke}" stroke-width="1.5" />
        <line x1="242" y1="262" x2="258" y2="262" stroke="#ffffff" stroke-width="2" />
        <line x1="244" y1="270" x2="256" y2="270" stroke="#ffffff" stroke-width="2" />
      </g>`;

    case 'pearlNecklace':
      neckAcc = `<g class="acc-pearls">
        <circle cx="205" cy="242" r="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="220" cy="248" r="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="236" cy="252" r="6.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="250" cy="254" r="7" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="264" cy="252" r="6.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="280" cy="248" r="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <circle cx="295" cy="242" r="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
      </g>`;

    case 'bandanaPirate':
      neckAcc = `<g class="acc-bandana">
        <polygon points="190,235 310,235 250,285" fill="#0f172a" stroke="${stroke}" stroke-width="3" />
        <!-- Skull mark -->
        <circle cx="250" cy="252" r="5" fill="#ffffff" />
        <circle cx="248" cy="252" r="1.5" fill="#0f172a" />
        <circle cx="252" cy="252" r="1.5" fill="#0f172a" />
      </g>`;

    default:
      break;
  }

  return `<g class="cat-accessories">
    ${neckAcc}
    ${headAcc}
  </g>`;
}

function renderProps(dna: CatDNA, colors: CatColors): string {
  const stroke = colors.lineStroke;

  switch (dna.propItem) {
    case 'coffeeMug':
      return `<g class="prop-coffee" transform="translate(350, 340)">
        <!-- Mug body -->
        <rect x="0" y="20" width="45" height="40" rx="6" fill="#0284c7" stroke="${stroke}" stroke-width="3" />
        <!-- Mug handle -->
        <path d="M 45 28 C 60 28, 60 52, 45 52" fill="none" stroke="${stroke}" stroke-width="3.5" />
        <!-- Steam curls -->
        <path d="M 15 15 Q 10 5 15 -5" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
        <path d="M 30 15 Q 35 5 30 -5" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" />
      </g>`;

    case 'yarnBall':
      return `<g class="prop-yarn" transform="translate(80, 360)">
        <circle cx="30" cy="30" r="28" fill="#f43f5e" stroke="${stroke}" stroke-width="3" />
        <!-- Yarn thread curves -->
        <path d="M 12 20 Q 30 30 48 20" fill="none" stroke="#fda4af" stroke-width="2.5" />
        <path d="M 15 35 Q 30 45 45 35" fill="none" stroke="#fda4af" stroke-width="2.5" />
        <!-- Loose unraveled thread -->
        <path d="M 55 45 Q 80 55 120 40 Q 150 25 180 35" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" />
      </g>`;

    case 'laserDot':
      return `<g class="prop-laser" transform="translate(100, 380)">
        <circle cx="0" cy="0" r="14" fill="#f43f5e" opacity="0.4" />
        <circle cx="0" cy="0" r="7" fill="#ef4444" />
        <circle cx="0" cy="0" r="3" fill="#ffffff" />
      </g>`;

    case 'mouseFriend':
      return `<g class="prop-mouse" transform="translate(360, 375)">
        <ellipse cx="25" cy="18" rx="20" ry="12" fill="#94a3b8" stroke="${stroke}" stroke-width="2.5" />
        <circle cx="12" cy="8" r="7" fill="#fbcfe8" stroke="${stroke}" stroke-width="2" />
        <circle cx="8" cy="16" r="2.5" fill="#020617" />
        <!-- Tail -->
        <path d="M 45 20 Q 65 15 60 30" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round" />
      </g>`;

    case 'fishSkeleton':
      return `<g class="prop-fish-bones" transform="translate(360, 380)">
        <path d="M 10 10 L 0 5 L 0 15 Z" fill="#e2e8f0" stroke="${stroke}" stroke-width="2" />
        <line x1="10" y1="10" x2="50" y2="10" stroke="#e2e8f0" stroke-width="3" />
        <line x1="20" y1="2" x2="20" y2="18" stroke="#e2e8f0" stroke-width="2" />
        <line x1="30" y1="2" x2="30" y2="18" stroke="#e2e8f0" stroke-width="2" />
        <line x1="40" y1="2" x2="40" y2="18" stroke="#e2e8f0" stroke-width="2" />
        <polygon points="50,10 60,3 60,17" fill="#e2e8f0" stroke="${stroke}" stroke-width="2" />
      </g>`;

    case 'pottedPlant':
      return `<g class="prop-plant" transform="translate(360, 330)">
        <!-- Terracotta Pot -->
        <polygon points="10,35 40,35 35,65 15,65" fill="#ea580c" stroke="${stroke}" stroke-width="2.5" />
        <rect x="7" y="28" width="36" height="8" rx="2" fill="#c2410c" stroke="${stroke}" stroke-width="2" />
        <!-- Succulent Leaves -->
        <circle cx="25" cy="20" r="14" fill="#22c55e" stroke="${stroke}" stroke-width="2" />
        <circle cx="16" cy="18" r="9" fill="#16a34a" stroke="${stroke}" stroke-width="2" />
        <circle cx="34" cy="18" r="9" fill="#16a34a" stroke="${stroke}" stroke-width="2" />
      </g>`;

    case 'butterflyOnNose':
      return `<g class="prop-butterfly" transform="translate(250, 185)">
        <!-- Left Wing -->
        <ellipse cx="-8" cy="-8" rx="9" ry="12" transform="rotate(-30 -8 -8)" fill="#38bdf8" stroke="${stroke}" stroke-width="1.5" />
        <!-- Right Wing -->
        <ellipse cx="8" cy="-8" rx="9" ry="12" transform="rotate(30 8 -8)" fill="#38bdf8" stroke="${stroke}" stroke-width="1.5" />
        <!-- Body -->
        <ellipse cx="0" cy="-6" rx="2.5" ry="7" fill="#0f172a" />
      </g>`;

    default:
      return '';
  }
}
