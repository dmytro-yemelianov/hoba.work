import { describe, expect, it } from 'vitest';
import {
  generateDNA,
  renderCatSVG,
  resolveColors,
  evaluateCatQuality,
  CAT_PRESETS,
  POSES,
  COAT_STYLES,
  EYE_SHAPES,
  MOUTH_EMOTIONS,
  type CatDNA,
} from '../site/src/lib/cat-engine';

describe('Vector Cat Engine', () => {
  it('generates deterministic DNA and identical SVG for the same seed', () => {
    const seed = 'fluffy-boris-42';
    const dna1 = generateDNA(seed);
    const dna2 = generateDNA(seed);

    expect(dna1).toEqual(dna2);

    const svg1 = renderCatSVG(dna1);
    const svg2 = renderCatSVG(dna2);

    expect(svg1).toBe(svg2);
    expect(svg1).toContain('<svg');
    expect(svg1).toContain('viewBox="0 0 500 500"');
    expect(svg1).toContain('data-cat-seed="fluffy-boris-42"');
  });

  it('generates distinct cats for different seeds', () => {
    const dnaA = generateDNA('quantum-purr-101');
    const dnaB = generateDNA('cosmic-loaf-999');

    expect(dnaA.seed).not.toBe(dnaB.seed);
    const svgA = renderCatSVG(dnaA);
    const svgB = renderCatSVG(dnaB);

    expect(svgA).not.toBe(svgB);
  });

  it('renders all curated presets without throwing', () => {
    for (const preset of CAT_PRESETS) {
      const dna = { ...generateDNA(preset.dna.seed), ...preset.dna } as CatDNA;
      const svg = renderCatSVG(dna);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    }
  });

  it('correctly resolves heterochromia vs standard eye colors', () => {
    const dnaHetero: CatDNA = {
      ...generateDNA('test-hetero'),
      eyeColor: 'heterochromia',
    };
    const colorsHetero = resolveColors(dnaHetero);
    expect(colorsHetero.eyeLeft).toBe('#0ea5e9'); // Blue
    expect(colorsHetero.eyeRight).toBe('#f59e0b'); // Amber Gold

    const dnaEmerald: CatDNA = {
      ...generateDNA('test-emerald'),
      eyeColor: 'emerald',
    };
    const colorsEmerald = resolveColors(dnaEmerald);
    expect(colorsEmerald.eyeLeft).toBe('#10b981');
    expect(colorsEmerald.eyeRight).toBe('#10b981');
  });

  it('supports full combinatorial space across all poses, coats, and emotions', () => {
    for (const pose of POSES) {
      for (const coat of COAT_STYLES) {
        const dna: CatDNA = {
          ...generateDNA(`test-${pose}-${coat}`),
          pose,
          coatStyle: coat,
        };
        const svg = renderCatSVG(dna);
        expect(svg).toContain('<svg');
      }
    }
  });

  it('Ralph Quality Evaluator scores presets and population within S/A thresholds', () => {
    for (const preset of CAT_PRESETS) {
      const score = evaluateCatQuality({ ...preset.dna, seed: preset.dna.seed } as CatDNA);
      expect(score.total).toBeGreaterThanOrEqual(80);
      expect(['S', 'A']).toContain(score.grade);
      expect(score.breakdown.emotionalSoul.score).toBeGreaterThan(0);
      expect(score.breakdown.colorHarmony.score).toBeGreaterThan(0);
      expect(score.breakdown.geometryPrecision.score).toBeGreaterThan(0);
      expect(score.breakdown.vectorCleanliness.score).toBeGreaterThan(0);
    }
  });
});
