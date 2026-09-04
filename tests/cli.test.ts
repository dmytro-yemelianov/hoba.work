import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REPO_ROOT } from './helpers';

/** Runs the CLI from source (tsx + root tsconfig paths), so no build step is required. */
function hoba(
  args: string[],
  opts: { expectFailure?: boolean } = {}
): { stdout: string; status: number } {
  try {
    const stdout = execFileSync(
      'npx',
      [
        'tsx',
        '--tsconfig',
        path.join(REPO_ROOT, 'tsconfig.json'),
        'packages/cli/src/cli.ts',
        ...args,
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    return { stdout, status: 0 };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; status?: number };
    if (!opts.expectFailure) throw new Error(`CLI failed (${e.status}): ${e.stderr}`);
    return { stdout: `${e.stdout ?? ''}${e.stderr ?? ''}`, status: e.status ?? 1 };
  }
}

describe('hoba CLI', { timeout: 20000 }, () => {
  it('shows an entity and emits JSON on request', () => {
    expect(hoba(['show', 'mech.genuine_technical_skill_shortfall']).stdout).toContain(
      'Genuine Technical Skill Shortfall'
    );
    const json = JSON.parse(
      hoba(['show', 'bar.requisition_approval_public_posting', '--json']).stdout
    );
    expect(json.node.stage).toBe('pre-posting');
    expect(json.registry_version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  });

  it('explains an observation and reports unknown ids', () => {
    const json = JSON.parse(
      hoba([
        'explain',
        'obs.materially_similar_role_reposted_shortly_after_rejection',
        'A-999',
        '--stage',
        'technical',
        '--json',
      ]).stdout
    );
    expect(json.analysis.hard_facts.unknown_artifact_ids).toEqual(['A-999']);
    expect(json.analysis.obstacle.identified_barriers.map((b: { id: string }) => b.id)).toEqual([
      'bar.technical_screen_live_assessment',
      'bar.take_home_work_sample_evaluation',
    ]);
    expect(json.analysis.counts.probes).toBe(1);
  });

  it('rejects an unknown stage and an unknown id with exit code 1', () => {
    const stage = hoba(
      [
        'explain',
        'obs.materially_similar_role_reposted_shortly_after_rejection',
        '--stage',
        'bogus',
      ],
      { expectFailure: true }
    );
    expect(stage.status).toBe(1);
    expect(stage.stdout).toContain('Unknown stage');
    expect(hoba(['show', 'Z-000'], { expectFailure: true }).status).toBe(1);
  });

  it('searches with type filters', () => {
    const json = JSON.parse(
      hoba(['search', 'reposted', '--types', 'observation', '--json']).stdout
    );
    expect(json.results.every((r: { type: string }) => r.type === 'observation')).toBe(true);
    expect(json.results.map((r: { id: string }) => r.id)).toContain(
      'obs.materially_similar_role_reposted_shortly_after_rejection'
    );
  });

  it('diagnoses temporal latency and dwell anomalies', () => {
    const json = JSON.parse(
      hoba(['latency', 'proc.the_hiring_funnel_end_to_end', 'recruiter-queue', '45', '--json'])
        .stdout
    );
    expect(json.anomalies.length).toBeGreaterThan(0);
    const queued = json.anomalies.find(
      (a: { toState: string }) => a.toState === 'recruiter-screen'
    );
    expect(queued.severity).toBe('stalled_anomalous');
    expect(queued.implicatedMechanisms).toContain('mech.stale_or_orphaned_job_requisition');
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
    expect(json.analysis.hard_facts.selected_artifacts.map((a: { id: string }) => a.id)).toEqual([
      'obs.complete_silence_after_submission',
      'obs.materially_similar_role_reposted_shortly_after_rejection',
      'obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body',
    ]);
    expect(json.analysis.hard_facts.stage).toBe('sourcing');
    expect(json.analysis.counts.compatible_mechanisms).toBeGreaterThan(0);

    const txt = hoba(['explain', '--scenario', 'ats-knockout']).stdout;
    expect(txt).toContain('Automated Parsing Knockout');
    expect(txt).toContain('obs.explicit_feedback_citing_skill_depth_shortfall');
  });

  // Design doc §11: the surface the external spec asks for. `get` is not a
  // second implementation — §11 flags the `show`/`get` overlap and says
  // reconcile rather than ship two near-duplicates, so it is one command
  // reachable by both names.
  it('reaches the same entity under `get` as under `show`, by canonical ID and by legacy code', () => {
    const canonical = JSON.parse(
      hoba(['get', 'mech.genuine_technical_skill_shortfall', '--json']).stdout
    );
    const viaShow = JSON.parse(
      hoba(['show', 'mech.genuine_technical_skill_shortfall', '--json']).stdout
    );
    const viaAlias = JSON.parse(hoba(['get', 'M-001', '--json']).stdout);
    expect(canonical.node.id).toBe('mech.genuine_technical_skill_shortfall');
    expect(viaShow).toEqual(canonical);
    expect(viaAlias.node.id).toBe(canonical.node.id);
  });

  it('prints an entity’s neighbourhood with `graph`', () => {
    const json = JSON.parse(
      hoba(['graph', 'mech.genuine_technical_skill_shortfall', '--json']).stdout
    );
    expect(json.id).toBe('mech.genuine_technical_skill_shortfall');
    expect(json.neighbours.length).toBeGreaterThan(0);
    for (const n of json.neighbours) expect(n).toHaveProperty('relation');
    expect(hoba(['graph', 'nope.nothing'], { expectFailure: true }).status).toBe(1);
  });

  it('reads an authored scenario with `scenario`', () => {
    const json = JSON.parse(hoba(['scenario', 'scenario.application_silence', '--json']).stdout);
    expect(json.scenario.id).toBe('scenario.application_silence');
    expect(json.scenario.observations.length).toBeGreaterThan(0);
    // Listing with no argument names what is available.
    expect(hoba(['scenario']).stdout).toContain('scenario.application_silence');
    expect(hoba(['scenario', 'scenario.nope'], { expectFailure: true }).status).toBe(1);
  });

  it('reports registry stats and version', () => {
    const stats = JSON.parse(hoba(['registry', 'stats', '--json']).stdout);
    expect(stats.counts.mechanisms).toBeGreaterThan(0);
    expect(stats.counts.scenarios).toBeGreaterThanOrEqual(2);
    const version = JSON.parse(hoba(['registry', 'version', '--json']).stdout);
    expect(version.registry_version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
    expect(version.registry_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(version.schema_version).toMatch(/^\d+\.\d+\.\d+$/);
    // The plain form prints the version and nothing else to parse around.
    expect(hoba(['registry', 'version']).stdout.trim()).toBe(version.registry_version);
  });

  it('validates both mirrors strictly with no warnings', () => {
    const out = hoba(['validate', '--strict']);
    expect(out.stdout).toContain('0 error(s), 0 warning(s)');
  });
});
