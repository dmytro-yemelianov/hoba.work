import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ui } from '../apps/web/src/i18n/ui';
import {
  getBundle,
  getHomepageDiagnosticPreview,
  HOMEPAGE_SCENARIO_ID,
} from '../apps/web/src/lib/registry';

const root = process.cwd();

function registeredMcpTools(source: string): string[] {
  return [...source.matchAll(/server\.registerTool\(\s*['"]([^'"]+)['"]/g)]
    .map((match) => match[1]!)
    .sort();
}

function documentedMcpTools(source: string): string[] {
  const block = source.match(/const tools = \[([\s\S]*?)\n\];/);
  if (!block) throw new Error('developers.astro: could not find const tools array');
  return [...block[1]!.matchAll(/['"]([^'"]+)['"]/g)]
    .map((match) => match[1]!)
    .sort();
}

describe('projection integrity', () => {
  it('documents exactly the MCP tools the server registers', () => {
    const server = readFileSync(resolve(root, 'packages/mcp/src/index.ts'), 'utf8');
    const developers = readFileSync(resolve(root, 'apps/web/src/pages/[...locale]/developers.astro'), 'utf8');

    expect(documentedMcpTools(developers)).toEqual(registeredMcpTools(server));
  });

  it('projects the homepage diagnostic preview from a valid scenario and resolved registry nodes', () => {
    const idsByLanguage: string[][] = [];

    for (const lang of ['en', 'uk'] as const) {
      const bundle = getBundle(lang);
      const preview = getHomepageDiagnosticPreview(lang);

      expect(preview.scenario.id).toBe(HOMEPAGE_SCENARIO_ID);
      expect(preview.scenario.observations).toContain(preview.observation.id);
      expect(preview.stage).toBe(preview.scenario.stage);
      expect(preview.barrier.stage).toBe(preview.stage);
      expect(preview.mechanism.operates_at).toContain(preview.barrier.id);
      expect(preview.mechanism.emissions).toContainEqual(
        expect.objectContaining({ artifact: preview.observation.id, observed_at: expect.arrayContaining([preview.stage]) })
      );
      expect(preview.probe).toEqual(preview.observation.probes[0]);

      expect(preview.observation.title).toBe(bundle.observations.find((node) => node.id === preview.observation.id)?.title);
      expect(preview.barrier.title).toBe(bundle.barriers.find((node) => node.id === preview.barrier.id)?.title);
      expect(preview.mechanism.title).toBe(bundle.mechanisms.find((node) => node.id === preview.mechanism.id)?.title);

      idsByLanguage.push([preview.observation.id, preview.barrier.id, preview.mechanism.id, preview.probe.id]);
    }

    expect(idsByLanguage[1]).toEqual(idsByLanguage[0]);
  });

  it('keeps homepage registry counts as interpolated projections', () => {
    const countKeys = [
      'home.what',
      'home.cta.secondary',
      'home.role.researcher.desc',
      'home.tools.graph.desc',
      'home.gives.2.text',
      'home.gives.3.text',
      'tour.home.step1.text',
    ] as const;

    for (const lang of ['en', 'uk'] as const) {
      for (const key of countKeys) expect(ui[lang][key]).toContain('{n}');
    }
  });

  it('renders diagnostic entity facts only from the resolved preview object', () => {
    const component = readFileSync(resolve(root, 'apps/web/src/components/DiagnosticPreview.astro'), 'utf8');

    expect(component).not.toMatch(/\b(?:obs|bar|mech)\.[a-z0-9_]+\b/);
    expect(component).toContain('{observation.title}');
    expect(component).toContain('{barrier.title}');
    expect(component).toContain('{mechanism.title}');
    expect(component).toContain('{probe.action}');
  });
});
