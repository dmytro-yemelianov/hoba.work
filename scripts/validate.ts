import path from 'node:path';
import {
  HOBAKnowledgeGraph,
  loadRegistryFromDirectory,
  validateRegistryBundle,
} from '@hoba/registry';

const rootDir = process.cwd();
const contentDir = path.join(rootDir, 'content');
const evidenceDir = path.join(rootDir, 'evidence');

console.log('--- Validating HOBA Registry Content (English) ---');
const bundleEn = loadRegistryFromDirectory(contentDir, evidenceDir);
const issuesEn = validateRegistryBundle(bundleEn);

if (issuesEn.length > 0) {
  console.error('Validation errors found in content:');
  for (const issue of issuesEn) {
    console.error(`[${issue.severity.toUpperCase()}] ${issue.nodeId ? `(${issue.nodeId}) ` : ''}${issue.message}`);
  }
  process.exit(1);
}

const graphEn = new HOBAKnowledgeGraph(bundleEn);

// 1. Barrier DAG validation
const dagRes = graphEn.validateBarrierDAG();
if (!dagRes.valid) {
  console.error(`Barrier DAG Validation failed: ${dagRes.error}`);
  process.exit(1);
}
console.log(`✓ Barrier DAG is strictly acyclic (${bundleEn.barriers.length} barriers sorted: ${dagRes.sorted?.join(' -> ')})`);

// 2. Tarjan SCC check
const sccs = graphEn.findMechanismSCCs();
console.log(`✓ Tarjan Mechanism SCC check: found ${sccs.length} strongly connected component cycle(s):`);
for (const scc of sccs) {
  console.log(`  - SCC cycle: [${scc.join(', ')}]`);
}

// Check Ukrainian mirror
console.log('--- Validating HOBA Registry Content (Ukrainian Mirror) ---');
const contentUkDir = path.join(rootDir, 'content-uk');
const bundleUk = loadRegistryFromDirectory(contentUkDir, evidenceDir);
const issuesUk = validateRegistryBundle(bundleUk);

if (issuesUk.length > 0) {
  console.error('Validation errors found in content-uk:');
  for (const issue of issuesUk) {
    console.error(`[${issue.severity.toUpperCase()}] ${issue.nodeId ? `(${issue.nodeId}) ` : ''}${issue.message}`);
  }
  process.exit(1);
}

console.log(`✓ All ${bundleEn.artifacts.length} Artifacts valid`);
console.log(`✓ All ${bundleEn.barriers.length} Barriers valid`);
console.log(`✓ All ${bundleEn.mechanisms.length} Mechanisms valid (honest baseline preserved)`);
console.log(`✓ All ${bundleEn.patterns.length} Patterns valid`);
console.log(`✓ All ${bundleEn.loops.length} Loops valid`);
console.log(`✓ All ${bundleEn.interventions.length} Interventions valid`);
console.log(`✓ All ${bundleEn.evidence.length} Evidence records valid`);
console.log('--- Registry Validation PASSED ---');
