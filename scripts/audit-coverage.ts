/** Print the explicit coverage boundary and its strongest directional skews. */
import {
  loadCoverageModel,
  loadRegistryFromRoot,
  loadScenarios,
  liftRegistryCaseSpace,
  resolveRegistryRoot,
  serializeCaseSpaceMetrics,
  summarizeCoverage,
  validateCoverageModel,
} from '@hoba/registry';

const root = resolveRegistryRoot();
const model = loadCoverageModel(root);
const bundle = loadRegistryFromRoot(root, 'en');
const scenarios = loadScenarios(root);
const issues = validateCoverageModel(model, bundle, scenarios);
if (issues.length > 0) {
  for (const issue of issues) console.error(`${issue.rule}: ${issue.message}`);
  process.exit(1);
}

const summary = summarizeCoverage(model);
const caseSpace = serializeCaseSpaceMetrics();
const lift = liftRegistryCaseSpace(bundle, scenarios);
const compactLift = {
  version: lift.version,
  method: lift.method,
  summary: lift.summary,
  coordinates: lift.coordinates,
};
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ ...summary, case_space: caseSpace, lift: compactLift }, null, 2));
  process.exit(0);
}

console.log(
  `Coverage ${summary.score_percent}% weighted: ${summary.covered} covered, ` +
    `${summary.partial} partial, ${summary.absent} absent (${summary.total} slots).`
);
console.log(
  `Case space denominator: ${caseSpace.coverageCoordinates} coordinates, ` +
    `${caseSpace.oneWiseSlots} 1-wise slots, ` +
    `${caseSpace.twoWiseUnfilteredSlots} unfiltered 2-wise slots before Γ.`
);
console.log(
  `Lift lower bound: ${lift.summary.coordinates_touched}/${lift.summary.coordinates_total} coordinates, ` +
    `${lift.summary.one_wise_slots_touched}/${lift.summary.one_wise_slots_total} 1-wise slots, ` +
    `${lift.summary.pairwise_slots_touched} observed 2-wise slots from ${lift.summary.assigned_sources} sources.`
);
for (const dimension of [...summary.dimensions].sort(
  (a, b) => a.score_percent - b.score_percent || a.id.localeCompare(b.id)
)) {
  console.log(
    `${dimension.id.padEnd(24)} ${String(dimension.score_percent).padStart(5)}%  ` +
      `${dimension.covered} covered / ${dimension.partial} partial / ${dimension.absent} absent`
  );
}

console.log('\nOpen gaps:');
for (const dimension of model.dimensions) {
  const gaps = dimension.values.filter((value) => value.status !== 'covered');
  if (gaps.length === 0) continue;
  console.log(`- ${dimension.label.en}`);
  for (const gap of gaps) console.log(`  - ${gap.status}: ${gap.label.en}`);
}
