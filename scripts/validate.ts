/**
 * Validate registry content for both language mirrors.
 *   pnpm validate            # errors fail, warnings are reported
 *   pnpm validate --strict   # warnings fail too
 */
import {
  compareBundleStructure,
  formatValidationIssue,
  HOBAKnowledgeGraph,
  loadRegistryFromRoot,
  loadCoverageModel,
  loadScenarios,
  liftRegistryCaseSpace,
  resolveRegistryRoot,
  summarizeCaseSpace,
  summarizeCoverage,
  validateCoverageModel,
  validateRegistry,
  validateScenarios,
  type ValidationIssue,
} from '@hoba/registry';

const strict = process.argv.includes('--strict');
const root = resolveRegistryRoot();

let errorCount = 0;
let warningCount = 0;

function report(label: string, issues: ValidationIssue[]) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  errorCount += errors.length;
  warningCount += warnings.length;
  console.log(`\n--- ${label} ---`);
  for (const issue of errors) console.error(formatValidationIssue(issue));
  for (const issue of warnings) console.warn(formatValidationIssue(issue));
  if (issues.length === 0) console.log('✓ No issues');
}

// 1. Canonical (English) content
const bundleEn = loadRegistryFromRoot(root, 'en');
report(
  `English content (registry ${bundleEn.version}, schema ${bundleEn.schema_version})`,
  validateRegistry(bundleEn).issues
);

const graphEn = new HOBAKnowledgeGraph(bundleEn);
const dag = graphEn.validateBarrierDAG();
if (dag.valid) console.log(`✓ Barrier DAG is strictly acyclic (${dag.sorted?.join(' -> ')})`);

const sccs = graphEn.findMechanismSCCs();
console.log(`✓ Tarjan SCC check: ${sccs.length} strongly connected mechanism cycle(s)`);
for (const scc of sccs) console.log(`  - [${scc.join(', ')}]`);
for (const loop of bundleEn.loops) {
  const confirmed = sccs.some((scc) => loop.mechanisms.every((m) => scc.includes(m)));
  console.log(
    `  ${confirmed ? '✓' : '⚠'} ${loop.id} ${confirmed ? 'is backed by a declared SCC' : 'is NOT fully backed by a declared mechanism cycle'}`
  );
}

// 2. Scenarios: compositions over the ontology, checked against it. Design doc
//    §4 makes an unresolvable id here a build error, never a warning — a
//    scenario naming an entity the registry does not have is broken, not weak.
const scenarios = loadScenarios(root);
report(`Scenarios (${scenarios.length})`, validateScenarios(scenarios, bundleEn));

const coverage = loadCoverageModel(root);
report(
  `Coverage model (${coverage.dimensions.length} dimensions)`,
  validateCoverageModel(coverage, bundleEn, scenarios)
);
const coverageSummary = summarizeCoverage(coverage);
const caseSpaceSummary = summarizeCaseSpace();
const liftSummary = liftRegistryCaseSpace(bundleEn, scenarios).summary;
console.log(
  `✓ Coverage boundary: ${coverageSummary.covered} covered, ${coverageSummary.partial} partial, ` +
    `${coverageSummary.absent} absent (${coverageSummary.score_percent}% weighted)`
);
console.log(
  `✓ Case space: ${caseSpaceSummary.coverageCoordinates} coordinates, ` +
    `${caseSpaceSummary.oneWiseSlots} 1-wise slots, ` +
    `${caseSpaceSummary.twoWiseUnfilteredSlots} unfiltered 2-wise slots, ` +
    `${caseSpaceSummary.constraints.hard} hard Γ constraints`
);
console.log(
  `✓ Case lift: ${liftSummary.coordinates_touched}/${liftSummary.coordinates_total} coordinates, ` +
    `${liftSummary.one_wise_slots_touched}/${liftSummary.one_wise_slots_total} 1-wise slots, ` +
    `${liftSummary.pairwise_slots_touched} observed 2-wise slots`
);

// 3. Ukrainian mirror: same rules + structural parity with the canonical content
const bundleUk = loadRegistryFromRoot(root, 'uk');
report('Ukrainian mirror', [
  ...validateRegistry(bundleUk).issues,
  ...compareBundleStructure(bundleEn, bundleUk),
]);

console.log(
  `\n${bundleEn.observations.length} artifacts, ${bundleEn.barriers.length} barriers, ${bundleEn.mechanisms.length} mechanisms, ` +
    `${bundleEn.patterns.length} patterns, ${bundleEn.loops.length} loops, ${bundleEn.interventions.length} interventions, ` +
    `${bundleEn.evidence.length} evidence records, ${scenarios.length} scenarios`
);
console.log(`${errorCount} error(s), ${warningCount} warning(s)`);

if (errorCount > 0 || (strict && warningCount > 0)) {
  console.error(
    strict && errorCount === 0
      ? '--strict: warnings are treated as errors'
      : 'Registry validation FAILED'
  );
  process.exit(1);
}
console.log('--- Registry Validation PASSED ---');
