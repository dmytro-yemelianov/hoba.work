/**
 * Ralph Visual Quality Loop — Automated Evaluator & Aesthetic Rubric
 * Scores procedural vector cats and visual assets across 4 core dimensions (100 pts total).
 */

import { generateDNA } from './prng.js';
import { renderCatSVG } from './render.js';
import { resolveColors } from './colors.js';
import type { CatDNA } from './types.js';

export interface QualityScore {
  total: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  breakdown: {
    emotionalSoul: { score: number; max: 25; notes: string[] };
    colorHarmony: { score: number; max: 25; notes: string[] };
    geometryPrecision: { score: number; max: 25; notes: string[] };
    vectorCleanliness: { score: number; max: 25; notes: string[] };
  };
  dna: CatDNA;
  svgLength: number;
  recommendations: string[];
}

/**
 * Evaluate a single CatDNA or seed against the Ralph Visual Quality Rubric.
 */
export function evaluateCatQuality(input: string | CatDNA): QualityScore {
  const dna: CatDNA = typeof input === 'string' ? generateDNA(input) : input;
  const svg = renderCatSVG(dna);
  const colors = resolveColors(dna);

  const notesSoul: string[] = [];
  const notesColor: string[] = [];
  const notesGeom: string[] = [];
  const notesVector: string[] = [];
  const recs: string[] = [];

  // 1. Dimension 1: Emotional Soul & Expressiveness (25 pts)
  let soulScore = 0;
  if (dna.blushIntensity > 0.3) {
    soulScore += 6;
    notesSoul.push('Expressive warm cheek blush present');
  } else {
    soulScore += 2;
    recs.push('Increase blushIntensity for warmer emotional presence');
  }

  if (['animeSparkle', 'wink', 'curvedHappy', 'shockedRound'].includes(dna.eyeShape)) {
    soulScore += 8;
    notesSoul.push('High-emotion eye gaze with specular highlights');
  } else {
    soulScore += 5;
  }

  if (dna.mouthEmotion !== 'neutralW') {
    soulScore += 7;
    notesSoul.push(`Distinct mouth emotion: ${dna.mouthEmotion}`);
  } else {
    soulScore += 3;
    recs.push('Consider expressive mouth variant (:3, blep, smile, gasp)');
  }

  if (dna.headAccessory !== 'none' || dna.neckAccessory !== 'none' || dna.propItem !== 'none') {
    soulScore += 4;
    notesSoul.push('Character accessory/companion prop gives story context');
  }

  // 2. Dimension 2: Color Harmony & Luminescence (25 pts)
  let colorScore = 0;
  if (colors.shading !== colors.primary) {
    colorScore += 7;
    notesColor.push('Coherent multi-tone fur shading gradient applied');
  }

  if (colors.eyeLeft && colors.eyeRight) {
    colorScore += 7;
    notesColor.push(`Vibrant eye pigmentation (${dna.eyeColor})`);
  }

  if (dna.backdropTheme !== 'transparent') {
    colorScore += 6;
    notesColor.push(`Harmonious backdrop atmosphere (${dna.backdropTheme})`);
  } else {
    colorScore += 4;
  }

  if (colors.innerEar && colors.nose) {
    colorScore += 5;
    notesColor.push('Soft pink inner ear and nose accents present');
  }

  // 3. Dimension 3: Geometry & Topological Precision (25 pts)
  let geomScore = 0;
  if (svg.includes('viewBox="0 0 500 500"')) {
    geomScore += 8;
    notesGeom.push('Normalized 500x500 viewport bounds adhered to');
  }

  if (svg.includes('<filter id=') && svg.includes('<feDropShadow')) {
    geomScore += 7;
    notesGeom.push('Volumetric soft drop shadow and ambient depth active');
  }

  if (svg.includes('cat-root') && svg.includes('cat-face') && svg.includes('cat-head-ears')) {
    geomScore += 10;
    notesGeom.push(
      'Strict anatomy hierarchy (backdrop -> tail -> body -> head -> face -> acc -> props)'
    );
  }

  // 4. Dimension 4: Vector Cleanliness & Web Efficiency (25 pts)
  let vectorScore = 0;
  const svgSize = Buffer.byteLength(svg, 'utf8');

  if (svgSize < 16_000) {
    vectorScore += 10;
    notesVector.push(`Compact SVG payload (${(svgSize / 1024).toFixed(1)} KB < 16 KB)`);
  } else {
    vectorScore += 5;
    recs.push('Optimize vector path count to keep SVG payload lightweight');
  }

  if (!svg.includes('NaN') && !svg.includes('undefined')) {
    vectorScore += 8;
    notesVector.push('Zero NaN/undefined geometric artifacts');
  }

  if (svg.includes('data-cat-seed=')) {
    vectorScore += 7;
    notesVector.push('Deterministic DNA seed embedded for reproducible pipeline');
  }

  const total = soulScore + colorScore + geomScore + vectorScore;
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'D';

  return {
    total,
    grade,
    breakdown: {
      emotionalSoul: { score: soulScore, max: 25, notes: notesSoul },
      colorHarmony: { score: colorScore, max: 25, notes: notesColor },
      geometryPrecision: { score: geomScore, max: 25, notes: notesGeom },
      vectorCleanliness: { score: vectorScore, max: 25, notes: notesVector },
    },
    dna,
    svgLength: svgSize,
    recommendations: recs,
  };
}

/**
 * Run a batch Ralph quality audit over multiple seeds.
 */
export function auditPopulation(seeds: string[]): {
  count: number;
  averageScore: number;
  gradeDistribution: Record<string, number>;
  lowestScoring: QualityScore;
  highestScoring: QualityScore;
} {
  const scores = seeds.map((s) => evaluateCatQuality(s));
  scores.sort((a, b) => b.total - a.total);

  const totalSum = scores.reduce((sum, s) => sum + s.total, 0);
  const dist: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  for (const s of scores) {
    dist[s.grade] = (dist[s.grade] || 0) + 1;
  }

  return {
    count: scores.length,
    averageScore: Math.round((totalSum / scores.length) * 10) / 10,
    gradeDistribution: dist,
    lowestScoring: scores[scores.length - 1],
    highestScoring: scores[0],
  };
}
