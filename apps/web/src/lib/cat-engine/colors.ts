/**
 * Vector Cat Engine — Color Palettes & Volumetric Shading
 */

import type { CatColors, CatDNA, CoatStyle, EyeColor } from './types.js';

export interface EyeVisualSpec {
  main: string;
  glow: string;
  dark: string;
  ring: string;
  corneaBounce: string;
}

export const EYE_COLOR_VALUES: Record<EyeColor, EyeVisualSpec> = {
  emerald: {
    main: '#10b981',
    glow: '#6ee7b7',
    dark: '#047857',
    ring: '#064e3b',
    corneaBounce: '#a7f3d0',
  },
  amberGold: {
    main: '#f59e0b',
    glow: '#fde68a',
    dark: '#b45309',
    ring: '#78350f',
    corneaBounce: '#fef3c7',
  },
  cyanSky: {
    main: '#06b6d4',
    glow: '#67e8f9',
    dark: '#0e7490',
    ring: '#164e63',
    corneaBounce: '#cffafe',
  },
  sapphireDeep: {
    main: '#3b82f6',
    glow: '#93c5fd',
    dark: '#1d4ed8',
    ring: '#1e3a8a',
    corneaBounce: '#dbeafe',
  },
  heterochromia: {
    main: '#0ea5e9',
    glow: '#f59e0b',
    dark: '#0369a1',
    ring: '#0c4a6e',
    corneaBounce: '#e0f2fe',
  },
  rubyGlow: {
    main: '#f43f5e',
    glow: '#fda4af',
    dark: '#be123c',
    ring: '#881337',
    corneaBounce: '#ffe4e6',
  },
  amethystViolet: {
    main: '#a855f7',
    glow: '#d8b4fe',
    dark: '#7e22ce',
    ring: '#581c87',
    corneaBounce: '#f3e8ff',
  },
  copperSun: {
    main: '#ea580c',
    glow: '#fdba74',
    dark: '#9a3412',
    ring: '#7c2d12',
    corneaBounce: '#ffedd5',
  },
};

/** Shift a #rrggbb color's lightness by `amt` (-255..255). */
export function shiftTone(hex: string, amt: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 0xff) + amt);
  const b = clamp((n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function getEyeDetails(colorOrName: EyeColor | string): EyeVisualSpec {
  if (colorOrName in EYE_COLOR_VALUES) {
    return EYE_COLOR_VALUES[colorOrName as EyeColor];
  }
  return {
    main: colorOrName,
    glow: '#ffffff',
    dark: '#0f172a',
    ring: '#020617',
    corneaBounce: '#e2e8f0',
  };
}

export const COAT_PALETTES: Record<CoatStyle, CatColors> = {
  ginger: {
    primary: '#ea580c',
    secondary: '#c2410c',
    tertiary: '#f97316',
    shading: '#9a3412',
    belly: '#ffedd5',
    innerEar: '#fca5a5',
    innerEarShadow: '#f87171',
    nose: '#fb7185',
    noseLeather: '#e11d48',
    tongue: '#f43f5e',
    eyeLeft: '#10b981',
    eyeRight: '#10b981',
    lineStroke: '#431407',
    blush: '#fb7185',
    accent: '#fdba74',
    shadow: 'rgba(67, 20, 7, 0.24)',
    highlight: '#fff7ed',
    whiskerPad: '#fed7aa',
  },
  voidBlack: {
    primary: '#151c2e',
    secondary: '#232e47',
    tertiary: '#334155',
    shading: '#020617',
    belly: '#1f2a42',
    innerEar: '#3d4a66',
    innerEarShadow: '#232e47',
    nose: '#8b9cb8',
    noseLeather: '#64748b',
    tongue: '#f43f5e',
    eyeLeft: '#f59e0b',
    eyeRight: '#f59e0b',
    lineStroke: '#04070f',
    blush: '#ec4899',
    accent: '#818cf8',
    shadow: 'rgba(0, 0, 0, 0.45)',
    highlight: '#94a3b8',
    whiskerPad: '#1e293b',
    whisker: '#8b9cb8',
  },
  snowWhite: {
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    tertiary: '#cbd5e1',
    shading: '#94a3b8',
    belly: '#ffffff',
    innerEar: '#fecdd3',
    innerEarShadow: '#fda4af',
    nose: '#fb7185',
    noseLeather: '#f43f5e',
    tongue: '#f43f5e',
    eyeLeft: '#0ea5e9',
    eyeRight: '#0ea5e9',
    lineStroke: '#334155',
    blush: '#fda4af',
    accent: '#e0e7ff',
    shadow: 'rgba(148, 163, 184, 0.28)',
    highlight: '#ffffff',
    whiskerPad: '#f1f5f9',
  },
  britishBlue: {
    primary: '#475569',
    secondary: '#334155',
    tertiary: '#1e293b',
    shading: '#0f172a',
    belly: '#64748b',
    innerEar: '#94a3b8',
    innerEarShadow: '#64748b',
    nose: '#334155',
    noseLeather: '#1e293b',
    tongue: '#f43f5e',
    eyeLeft: '#f59e0b',
    eyeRight: '#f59e0b',
    lineStroke: '#0f172a',
    blush: '#f472b6',
    accent: '#94a3b8',
    shadow: 'rgba(15, 23, 42, 0.3)',
    highlight: '#cbd5e1',
    whiskerPad: '#64748b',
    whisker: '#cbd5e1',
  },
  classicTabby: {
    primary: '#854d0e',
    secondary: '#713f12',
    tertiary: '#422006',
    shading: '#291404',
    belly: '#fef3c7',
    innerEar: '#fca5a5',
    innerEarShadow: '#f87171',
    nose: '#e11d48',
    noseLeather: '#be123c',
    tongue: '#f43f5e',
    eyeLeft: '#10b981',
    eyeRight: '#10b981',
    lineStroke: '#291404',
    blush: '#fb7185',
    accent: '#d97706',
    shadow: 'rgba(41, 20, 4, 0.28)',
    highlight: '#fef9c3',
    whiskerPad: '#fde68a',
  },
  tuxedo: {
    primary: '#090d16',
    secondary: '#1e293b',
    tertiary: '#334155',
    shading: '#020617',
    belly: '#ffffff',
    innerEar: '#fecdd3',
    innerEarShadow: '#fda4af',
    nose: '#fb7185',
    noseLeather: '#f43f5e',
    tongue: '#f43f5e',
    eyeLeft: '#10b981',
    eyeRight: '#10b981',
    lineStroke: '#020617',
    blush: '#fda4af',
    accent: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.4)',
    highlight: '#ffffff',
    whiskerPad: '#ffffff',
    whisker: '#cbd5e1',
  },
  calico: {
    primary: '#ffffff',
    secondary: '#ea580c',
    tertiary: '#0f172a',
    shading: '#cbd5e1',
    belly: '#ffffff',
    innerEar: '#fca5a5',
    innerEarShadow: '#f87171',
    nose: '#fb7185',
    noseLeather: '#f43f5e',
    tongue: '#f43f5e',
    eyeLeft: '#10b981',
    eyeRight: '#10b981',
    lineStroke: '#1e293b',
    blush: '#fda4af',
    accent: '#f97316',
    shadow: 'rgba(15, 23, 42, 0.25)',
    highlight: '#ffffff',
    whiskerPad: '#f8fafc',
  },
  siamese: {
    primary: '#f8fafc',
    secondary: '#334155',
    tertiary: '#1e293b',
    shading: '#cbd5e1',
    belly: '#f1f5f9',
    innerEar: '#475569',
    innerEarShadow: '#334155',
    nose: '#1e293b',
    noseLeather: '#0f172a',
    tongue: '#f43f5e',
    eyeLeft: '#0ea5e9',
    eyeRight: '#0ea5e9',
    lineStroke: '#0f172a',
    blush: '#fda4af',
    accent: '#475569',
    shadow: 'rgba(30, 41, 59, 0.25)',
    highlight: '#ffffff',
    whiskerPad: '#334155',
    pointed: true,
  },
  cyberNeon: {
    primary: '#4f46e5',
    secondary: '#7c3aed',
    tertiary: '#c026d3',
    shading: '#312e81',
    belly: '#06b6d4',
    innerEar: '#ec4899',
    innerEarShadow: '#db2777',
    nose: '#ec4899',
    noseLeather: '#db2777',
    tongue: '#f43f5e',
    eyeLeft: '#06b6d4',
    eyeRight: '#ec4899',
    lineStroke: '#1e1b4b',
    blush: '#f43f5e',
    accent: '#38bdf8',
    shadow: 'rgba(6, 182, 212, 0.35)',
    highlight: '#a5f3fc',
    whiskerPad: '#818cf8',
    furTop: '#6366f1',
    furBottom: '#c026d3',
    whisker: '#a5f3fc',
  },
  pastelMarshmallow: {
    primary: '#f472b6',
    secondary: '#c084fc',
    tertiary: '#38bdf8',
    shading: '#db2777',
    belly: '#fdf2f8',
    innerEar: '#fbcfe8',
    innerEarShadow: '#f472b6',
    nose: '#fb7185',
    noseLeather: '#f43f5e',
    tongue: '#f43f5e',
    eyeLeft: '#38bdf8',
    eyeRight: '#c084fc',
    lineStroke: '#831843',
    blush: '#f43f5e',
    accent: '#fbcfe8',
    shadow: 'rgba(131, 24, 67, 0.2)',
    highlight: '#ffffff',
    whiskerPad: '#fce7f3',
  },
};

export function resolveColors(dna: CatDNA): CatColors {
  const base = { ...COAT_PALETTES[dna.coatStyle] };
  const eye = EYE_COLOR_VALUES[dna.eyeColor];

  if (dna.eyeColor === 'heterochromia') {
    base.eyeLeft = '#0ea5e9'; // Blue
    base.eyeRight = '#f59e0b'; // Amber Gold
  } else {
    base.eyeLeft = eye?.main ?? '#10b981';
    base.eyeRight = eye?.main ?? '#10b981';
  }

  if (!base.shading) {
    base.shading = base.secondary;
  }

  return base;
}
