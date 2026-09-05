import type { EmpiricalScenario, StageId } from '@hoba/registry/core';

export interface ScenarioMatch {
  scenario: EmpiricalScenario;
  /** Relative structural fit, not a probability or causal confidence. */
  score: number;
  shared: string[];
  missing: string[];
  extra: string[];
  stageMatch: boolean;
}

export interface ScenarioMatchInput {
  artifacts: readonly string[];
  stage?: StageId;
}

/**
 * Rank validated scenarios by facts the reader selected.
 *
 * Signal fit is the F1 score over observation IDs: it rewards both covering
 * the scenario and avoiding a broad scenario that only incidentally overlaps.
 * An exact stage contributes a small, bounded tie-breaker. A stage alone can
 * never produce a match, because that would present every case at one funnel
 * gate as similar without a shared observed fact.
 */
export function matchScenarios(
  input: ScenarioMatchInput,
  scenarios: readonly EmpiricalScenario[]
): ScenarioMatch[] {
  const selected = new Set(input.artifacts);
  if (selected.size === 0) return [];

  return scenarios
    .map((scenario): ScenarioMatch | null => {
      const scenarioArtifacts = new Set(scenario.artifacts);
      const shared = [...scenarioArtifacts].filter((id) => selected.has(id));
      if (shared.length === 0) return null;

      const missing = [...scenarioArtifacts].filter((id) => !selected.has(id));
      const extra = [...selected].filter((id) => !scenarioArtifacts.has(id));
      const precision = shared.length / selected.size;
      const recall = shared.length / scenarioArtifacts.size;
      const signalFit = (2 * precision * recall) / (precision + recall);
      const stageMatch = Boolean(input.stage && scenario.stage === input.stage);

      return {
        scenario,
        score: signalFit * 0.85 + (stageMatch ? 0.15 : 0),
        shared,
        missing,
        extra,
        stageMatch,
      };
    })
    .filter((match): match is ScenarioMatch => match !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.shared.length - left.shared.length ||
        left.scenario.id.localeCompare(right.scenario.id)
    );
}
