import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { REPO_ROOT } from './helpers';

/** Minimal JSON-RPC client over stdio against the MCP server run from source. */
class McpClient {
  private proc: ChildProcessWithoutNullStreams;
  private buffer = '';
  private pending = new Map<number, (msg: unknown) => void>();
  private nextId = 1;

  constructor() {
    this.proc = spawn('npx', ['tsx', '--tsconfig', path.join(REPO_ROOT, 'tsconfig.json'), 'packages/mcp/src/index.ts'], { cwd: REPO_ROOT });
    this.proc.stdout.on('data', (chunk: Buffer) => {
      this.buffer += chunk.toString();
      let idx: number;
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (!line) continue;
        const msg = JSON.parse(line) as { id?: number };
        if (msg.id !== undefined) this.pending.get(msg.id)?.(msg);
      }
    });
  }

  request(method: string, params: unknown = {}): Promise<any> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout waiting for ${method}`)), 20_000);
      this.pending.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
      this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  notify(method: string, params: unknown = {}) {
    this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  close() {
    this.proc.kill();
  }
}

const payload = (res: any) => JSON.parse(res.result.content[0].text);

describe('hoba MCP server', () => {
  let client: McpClient;

  beforeAll(async () => {
    client = new McpClient();
    const init = await client.request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'vitest', version: '0' } });
    expect(init.result.serverInfo.name).toBe('hoba-mcp');
    client.notify('notifications/initialized');
  }, 30_000);

  afterAll(() => client.close());

  it('lists the documented tools', async () => {
    const res = await client.request('tools/list');
    const names = res.result.tools.map((t: { name: string }) => t.name).sort();
    expect(names).toEqual(
      [
        'calculate_runway',
        'detect_temporal_anomalies',
        'evaluate_pattern_emptiness',
        'explain_observation',
        'find_compatible_mechanisms',
        'find_patterns',
        'get_diagnostic_probes',
        'get_empirical_scenarios',
        'get_interventions',
        'get_methodology',
        'get_node',
        'get_registry_info',
        'search_registry',
        'traverse_graph',
        'verify_flow_conservation',
      ].sort()
    );
  });

  it('every response carries the registry version', async () => {
    const info = payload(await client.request('tools/call', { name: 'get_registry_info', arguments: {} }));
    expect(info.registry_version).toMatch(/^\d{4}\.\d{2}\.\d+$/);
    expect(info.counts.barriers).toBeGreaterThanOrEqual(14);
    const node = payload(await client.request('tools/call', { name: 'get_node', arguments: { id: 'L-001' } }));
    expect(node.registry_version).toBe(info.registry_version);
    expect(node.node.mechanisms).toEqual(['M-011', 'M-008']);
  });

  it('explains observations and validates the stage argument', async () => {
    const ok = payload(await client.request('tools/call', { name: 'explain_observation', arguments: { artifact_ids: ['A-004'], stage: 'technical' } }));
    expect(ok.analysis.verdict).toBe('diagnostic');
    expect(ok.analysis.behind.compatible_mechanisms.length).toBeGreaterThan(0);

    const bad = await client.request('tools/call', { name: 'explain_observation', arguments: { artifact_ids: ['A-004'], stage: 'bogus' } });
    expect(bad.result?.isError ?? Boolean(bad.error)).toBe(true);

    const unknown = await client.request('tools/call', { name: 'explain_observation', arguments: { artifact_ids: ['A-999'] } });
    expect(unknown.result.isError).toBe(true);

    const scenarios = payload(await client.request('tools/call', { name: 'get_empirical_scenarios', arguments: {} }));
    expect(scenarios.scenarios.length).toBeGreaterThanOrEqual(4);
    expect(scenarios.scenarios.map((s: { id: string }) => s.id)).toContain('ghost-refresh');

    const scExplain = payload(await client.request('tools/call', { name: 'explain_observation', arguments: { scenario_id: 'ats-knockout' } }));
    expect(scExplain.scenario_id).toBe('ats-knockout');
    expect(scExplain.analysis.hard_facts.selected_artifacts.map((a: { id: string }) => a.id)).toEqual(['A-002', 'A-008', 'A-012']);
    expect(scExplain.analysis.counts.compatible_mechanisms).toBeGreaterThan(0);
  });

  it('evaluates temporal anomalies, runway, flow conservation, and pattern emptiness over MCP', async () => {
    const latency = payload(
      await client.request('tools/call', {
        name: 'detect_temporal_anomalies',
        arguments: { process_id: 'WF-001', from_state: 'recruiter-queue', actual_days: 45 },
      })
    );
    expect(latency.anomalies.length).toBeGreaterThan(0);
    expect(latency.anomalies[0].severity).toBe('stalled_anomalous');

    const runway = payload(
      await client.request('tools/call', {
        name: 'calculate_runway',
        arguments: { savings: 20000, monthly_burn: 4000 },
      })
    );
    expect(runway.runwayMonths).toBe(5);
    expect(runway.riskStatus).toBe('moderate_runway_stress');

    const conservation = payload(
      await client.request('tools/call', {
        name: 'verify_flow_conservation',
        arguments: {},
      })
    );
    expect(conservation.isConserved).toBe(true);

    const emptiness = payload(
      await client.request('tools/call', {
        name: 'evaluate_pattern_emptiness',
        arguments: {},
      })
    );
    expect(emptiness.computedEmptyCount).toBe(4);
  });

  it('find_patterns is honest about filtering and traverse_graph honours relation filters', async () => {
    const all = payload(await client.request('tools/call', { name: 'find_patterns', arguments: {} }));
    expect(all.filter_applied).toBe(false);
    const some = payload(await client.request('tools/call', { name: 'find_patterns', arguments: { artifact_ids: ['A-013'] } }));
    expect(some.filter_applied).toBe(true);
    expect(some.patterns.map((p: { id: string }) => p.id)).toEqual(['P-001']);

    const trav = payload(await client.request('tools/call', { name: 'traverse_graph', arguments: { start_id: 'M-001', depth: 1, relations: ['operates_at'] } }));
    expect(trav.nodes.map((n: { id: string }) => n.id).sort()).toEqual(['B-005', 'B-006', 'B-007', 'M-001']);
  });
});
