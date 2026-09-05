import { describe, expect, it } from 'vitest';
import { matchScenarios, type EmpiricalScenario } from '@hoba/registry';

const scenarios: EmpiricalScenario[] = [
  {
    id: 'scenario.exact',
    title: 'Exact case',
    summary: 'The same two observations at screening.',
    stage: 'screening',
    artifacts: ['obs.one', 'obs.two'],
  },
  {
    id: 'scenario.partial',
    title: 'Partial case',
    summary: 'One shared observation and two absent ones.',
    stage: 'technical',
    artifacts: ['obs.one', 'obs.three', 'obs.four'],
  },
  {
    id: 'scenario.stage_only',
    title: 'Same stage, different facts',
    summary: 'A stage alone must not create a match.',
    stage: 'screening',
    artifacts: ['obs.five'],
  },
];

describe('scenario matching', () => {
  it('ranks exact factual and stage overlap first', () => {
    const matches = matchScenarios(
      { artifacts: ['obs.one', 'obs.two'], stage: 'screening' },
      scenarios
    );

    expect(matches.map((match) => match.scenario.id)).toEqual([
      'scenario.exact',
      'scenario.partial',
    ]);
    expect(matches[0]).toMatchObject({
      score: 1,
      shared: ['obs.one', 'obs.two'],
      missing: [],
      extra: [],
      stageMatch: true,
    });
  });

  it('reports missing and extra observations instead of hiding the mismatch', () => {
    const [match] = matchScenarios(
      { artifacts: ['obs.one', 'obs.unrelated'], stage: 'screening' },
      scenarios
    );

    expect(match?.scenario.id).toBe('scenario.exact');
    expect(match?.shared).toEqual(['obs.one']);
    expect(match?.missing).toEqual(['obs.two']);
    expect(match?.extra).toEqual(['obs.unrelated']);
  });

  it('never matches on stage alone', () => {
    expect(matchScenarios({ artifacts: ['obs.unknown'], stage: 'screening' }, scenarios)).toEqual(
      []
    );
  });

  it('returns no suggestions before the reader provides a fact', () => {
    expect(matchScenarios({ artifacts: [], stage: 'screening' }, scenarios)).toEqual([]);
  });
});
