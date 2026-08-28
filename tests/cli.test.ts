import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REPO_ROOT } from './helpers';

/** Runs the CLI from source (tsx + root tsconfig paths), so no build step is required. */
function hoba(args: string[], opts: { expectFailure?: boolean } = {}): { stdout: string; status: number } {
  try {
    const stdout = execFileSync('npx', ['tsx', '--tsconfig', path.join(REPO_ROOT, 'tsconfig.json'), 'packages/cli/src/cli.ts', ...args], {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { stdout, status: 0 };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    if (!opts.expectFailure) throw new Error(`CLI failed (${e.status}): ${e.stderr}`);
    return { stdout: `${e.stdout ?? ''}${e.stderr ?? ''}`, status: e.status ?? 1 };
  }
}

describe('hoba CLI', { timeout: 20000 }, () => {
  it('shows an entity and emits JSON on request', () => {
    expect(hoba(['show', 'M-001']).stdout).toContain('Genuine Technical Skill Shortfall');
    const json = JSON.parse(hoba(['show', 'B-013', '--json']).stdout);
    expect(json.node.stage).toBe('pre-posting');
    expect(json.registry_version).toMatch(/^\d{4}\.\d{2}\.\d+$/);
  });

  it('explains an observation and reports unknown ids', () => {
    const json = JSON.parse(hoba(['explain', 'A-004', 'A-999', '--stage', 'technical', '--json']).stdout);
    expect(json.analysis.hard_facts.unknown_artifact_ids).toEqual(['A-999']);
    expect(json.analysis.obstacle.identified_barriers.map((b: { id: string }) => b.id)).toEqual(['B-005', 'B-006']);
    expect(json.analysis.counts.probes).toBe(1);
  });

  it('rejects an unknown stage and an unknown id with exit code 1', () => {
    const stage = hoba(['explain', 'A-004', '--stage', 'bogus'], { expectFailure: true });
    expect(stage.status).toBe(1);
    expect(stage.stdout).toContain('Unknown stage');
    expect(hoba(['show', 'Z-000'], { expectFailure: true }).status).toBe(1);
  });

  it('searches with type filters', () => {
    const json = JSON.parse(hoba(['search', 'reposted', '--types', 'artifact', '--json']).stdout);
    expect(json.results.every((r: { type: string }) => r.type === 'artifact')).toBe(true);
    expect(json.results.map((r: { id: string }) => r.id)).toContain('A-004');
  });

  it('diagnoses temporal latency and dwell anomalies', () => {
    const json = JSON.parse(hoba(['latency', 'WF-001', 'recruiter-queue', '45', '--json']).stdout);
    expect(json.anomalies.length).toBeGreaterThan(0);
    const queued = json.anomalies.find((a: { toState: string }) => a.toState === 'recruiter-screen');
    expect(queued.severity).toBe('stalled_anomalous');
    expect(queued.implicatedMechanisms).toContain('M-006');
  });

  it('computes financial runway and solvency risk profiles', () => {
    const json = JSON.parse(hoba(['runway', '25000', '3500', '--json']).stdout);
    expect(json.runwayMonths).toBeCloseTo(7.14, 1);
    expect(json.riskStatus).toBe('solvent');

    const vulnerable = JSON.parse(hoba(['runway', '4000', '2500', '--json']).stdout);
    expect(vulnerable.riskStatus).toBe('acute_exhaustion_vulnerability');
  });

  it('evaluates pattern emptiness in JSON and formatted text', () => {
    const json = JSON.parse(hoba(['patterns', '--json']).stdout);
    expect(json.computedEmptyCount).toBe(4);
    expect(json.proseAssertedCount).toBe(0);

    const txt = hoba(['patterns']).stdout;
    expect(txt).toContain('COMPUTED EMPTY');
    expect(txt).toContain('pat.seniority_double_bind');
  });

  it('audits flow conservation across financial records', () => {
    const json = JSON.parse(hoba(['conservation', '--json']).stdout);
    expect(json.isConserved).toBe(true);
    expect(json.violations).toEqual([]);
  });

  it('executes analysis for empirical scenarios', () => {
    const json = JSON.parse(hoba(['explain', '--scenario', 'ghost-refresh', '--json']).stdout);
    expect(json.scenario).toBe('ghost-refresh');
    expect(json.analysis.hard_facts.selected_artifacts.map((a: { id: string }) => a.id)).toEqual(['A-001', 'A-004', 'A-021']);
    expect(json.analysis.hard_facts.stage).toBe('sourcing');
    expect(json.analysis.counts.compatible_mechanisms).toBeGreaterThan(0);

    const txt = hoba(['explain', '--scenario', 'ats-knockout']).stdout;
    expect(txt).toContain('Automated Parsing Knockout');
    expect(txt).toContain('A-008');
  });

  it('validates both mirrors strictly with no warnings', () => {
    const out = hoba(['validate', '--strict']);
    expect(out.stdout).toContain('0 error(s), 0 warning(s)');
  });
});
