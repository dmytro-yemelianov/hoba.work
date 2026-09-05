import { describe, expect, it } from 'vitest';
import {
  loadCoverageModel,
  loadRegistryFromRoot,
  loadScenarios,
  resolveRegistryRoot,
  summarizeCoverage,
  validateCoverageModel,
} from '@hoba/registry';

const root = resolveRegistryRoot();
const model = loadCoverageModel(root);
const bundle = loadRegistryFromRoot(root, 'en');
const scenarios = loadScenarios(root);

describe('coverage boundary', () => {
  it('validates every non-absent slot against a canonical entity or scenario', () => {
    expect(validateCoverageModel(model, bundle, scenarios)).toEqual([]);
  });

  it('states the current boundary numerically instead of claiming universal coverage', () => {
    const summary = summarizeCoverage(model);
    expect(summary.total).toBe(92);
    expect(summary.covered).toBe(50);
    expect(summary.partial).toBe(19);
    expect(summary.absent).toBe(23);
    expect(summary.score_percent).toBe(64.7);
  });

  it('keeps the highest-risk missing populations explicit', () => {
    const populations = model.dimensions.find(
      (dimension) => dimension.id === 'affected_population'
    );
    expect(populations).toBeDefined();
    expect(
      populations!.values
        .filter((value) => value.status === 'absent')
        .map((value) => value.id)
        .sort()
    ).toEqual([
      'caregiving_schedule',
      'disabled_or_accommodation',
      'gender_pregnancy',
      'race_ethnicity',
      'religion',
      'sexual_orientation_gender_identity',
    ]);
  });
});
