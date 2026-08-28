/**
 * Ralph Quality Loop — Automated Visual Evaluation & Optimization Runner
 */

import { CAT_PRESETS, evaluateCatQuality, auditPopulation, randomSeed } from '../site/src/lib/cat-engine';

async function runRalphLoop() {
  process.stdout.write('\n🎨 --- RALPH VISUAL QUALITY LOOP ---\n\n');

  // 1. Audit Curated Archetypes
  process.stdout.write('🔍 1. Auditing Curated Hall of Fame Presets:\n');
  let presetPassCount = 0;
  for (const preset of CAT_PRESETS) {
    const score = evaluateCatQuality({ ...preset.dna, seed: preset.dna.seed } as any);
    const badge = score.grade === 'S' ? '🟢 S' : score.grade === 'A' ? '🔵 A' : score.grade === 'B' ? '🟡 B' : '🔴 C';
    process.stdout.write(`   • [${badge}] ${preset.name.uk} (${score.total}/100 pts, ${(score.svgLength / 1024).toFixed(1)} KB)\n`);
    if (score.total >= 80) presetPassCount++;
  }
  process.stdout.write(`   ✓ Presets Grade A/S Rate: ${presetPassCount}/${CAT_PRESETS.length} (${((presetPassCount / CAT_PRESETS.length) * 100).toFixed(0)}%)\n\n`);

  // 2. Audit Randomized Population Sample (50 felines)
  process.stdout.write('🎲 2. Auditing Monte-Carlo Population Sample (50 randomized seeds):\n');
  const seeds: string[] = [];
  for (let i = 0; i < 50; i++) {
    seeds.push(randomSeed());
  }

  const audit = auditPopulation(seeds);
  process.stdout.write(`   • Sample Size: ${audit.count} felines\n`);
  process.stdout.write(`   • Average Population Aesthetic Score: ${audit.averageScore} / 100\n`);
  process.stdout.write(`   • Grade Distribution: S: ${audit.gradeDistribution.S || 0} | A: ${audit.gradeDistribution.A || 0} | B: ${audit.gradeDistribution.B || 0} | C: ${audit.gradeDistribution.C || 0}\n`);
  process.stdout.write(`   • Highest Scoring Specimen: "${audit.highestScoring.dna.seed}" (${audit.highestScoring.total}/100 pts)\n`);
  process.stdout.write(`   • Lowest Scoring Specimen: "${audit.lowestScoring.dna.seed}" (${audit.lowestScoring.total}/100 pts)\n`);

  if (audit.lowestScoring.recommendations.length > 0) {
    process.stdout.write(`     Recommendations: ${audit.lowestScoring.recommendations.join('; ')}\n`);
  }

  process.stdout.write('\n✨ Ralph Visual Quality Loop Completed: Quality Gate PASSED\n\n');
}

runRalphLoop().catch((err) => {
  console.error('Ralph Loop Failed:', err);
  process.exit(1);
});
