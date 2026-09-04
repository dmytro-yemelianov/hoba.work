import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { loadScenarios } from '@hoba/registry';
import { ui } from '../apps/web/src/i18n/ui';
import {
  getBundle,
  getHomepageDiagnosticPreview,
  HOMEPAGE_SCENARIO_ID,
} from '../apps/web/src/lib/registry';

const root = process.cwd();
const developersPath = resolve(root, 'apps/web/src/pages/[...locale]/developers.astro');

function literalArray(source: string, name: string): string[] {
  const block = source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
  if (!block) throw new Error(`developers.astro: could not find const ${name} array`);
  return [...block[1]!.matchAll(/['"]([^'"]+)['"]/g)].map((match) => match[1]!);
}

function registeredMcpTools(source: string): string[] {
  return [...source.matchAll(/server\.registerTool\(\s*['"]([^'"]+)['"]/g)]
    .map((match) => match[1]!)
    .sort();
}

function registeredMcpResources(source: string): string[] {
  const block = source.match(/const METHODOLOGY_RESOURCES[^\n]*= \{([\s\S]*?)\n\};/);
  if (!block) throw new Error('MCP server: could not find METHODOLOGY_RESOURCES');
  return [...block[1]!.matchAll(/^  (?:'([^']+)'|([a-z][a-z-]*)):\s*\{/gm)]
    .map((match) => `hoba://methodology/${match[1] ?? match[2]}`)
    .sort();
}

function documentedCliCommands(source: string): string[] {
  const block = source.match(/const cli = \[([\s\S]*?)\n\];/);
  if (!block) throw new Error('developers.astro: could not find const cli array');
  return [...block[1]!.matchAll(/\{\s*command:\s*'([^']+)'/g)].map((match) => match[1]!);
}

function cliArgs(command: string): string[] {
  const tokens = command.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  if (tokens.shift() !== 'hoba')
    throw new Error(`Documented command must start with hoba: ${command}`);
  return tokens.map((token) => {
    const quote = token[0];
    return (quote === '"' || quote === "'") && token.at(-1) === quote ? token.slice(1, -1) : token;
  });
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(?:astro|js|ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe('projection integrity', () => {
  it('documents exactly the MCP tools the server registers', () => {
    const server = readFileSync(resolve(root, 'packages/mcp/src/index.ts'), 'utf8');
    const developers = readFileSync(developersPath, 'utf8');

    expect(literalArray(developers, 'tools').sort()).toEqual(registeredMcpTools(server));
  });

  it('documents exactly the MCP methodology resources the server registers', () => {
    const server = readFileSync(resolve(root, 'packages/mcp/src/index.ts'), 'utf8');
    const developers = readFileSync(developersPath, 'utf8');

    expect(literalArray(developers, 'resources').sort()).toEqual(registeredMcpResources(server));
  });

  it('keeps documented REST collections aligned with OpenAPI and generated JSON', () => {
    const developers = readFileSync(developersPath, 'utf8');
    const documented = literalArray(developers, 'endpoints').sort();
    const openapi = JSON.parse(
      readFileSync(resolve(root, 'apps/web/public/openapi.json'), 'utf8')
    ) as {
      paths: Record<string, unknown>;
    };
    const collections = Object.keys(openapi.paths)
      .flatMap((path) => path.match(/^\/([^/]+)\/index\.json$/)?.[1] ?? [])
      .sort();

    expect(documented).toEqual(collections);
    for (const endpoint of documented) {
      expect(
        existsSync(resolve(root, `apps/web/public/api/v1/${endpoint}/index.json`)),
        endpoint
      ).toBe(true);
    }
  });

  it('documents exactly the generated latest data exports', () => {
    const developers = readFileSync(developersPath, 'utf8');
    const documented = literalArray(developers, 'exports').sort();
    const generated = readdirSync(resolve(root, 'apps/web/public/data/latest'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort();

    expect(documented).toEqual(generated);
  });

  it('executes every CLI command shown on the Developers page', { timeout: 60_000 }, () => {
    const developers = readFileSync(developersPath, 'utf8');
    const commands = documentedCliCommands(developers);
    expect(commands.length).toBeGreaterThan(0);

    for (const command of commands) {
      expect(() =>
        execFileSync(
          process.execPath,
          ['--import', 'tsx', 'packages/cli/src/cli.ts', ...cliArgs(command)],
          {
            cwd: root,
            encoding: 'utf8',
            env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
            stdio: ['ignore', 'pipe', 'pipe'],
          }
        )
      ).not.toThrow();
    }
  });

  it('resolves every canonical entity ID authored in site source', () => {
    const bundle = getBundle('en');
    const canonicalIds = new Set<string>();
    for (const value of Object.values(bundle)) {
      if (!Array.isArray(value)) continue;
      for (const candidate of value) {
        if (
          candidate &&
          typeof candidate === 'object' &&
          'id' in candidate &&
          typeof candidate.id === 'string'
        ) {
          canonicalIds.add(candidate.id);
        }
      }
    }
    for (const scenario of loadScenarios(root)) canonicalIds.add(scenario.id);

    const unresolved: string[] = [];
    const mentioned: string[] = [];
    // Canonical slugs are descriptive snake_case. Requiring an underscore
    // avoids mistaking property access and i18n keys (`actor.title`,
    // `bar.order`) for authored entity IDs. The three one-word actor IDs are
    // the only intentional exceptions in the current ontology.
    const idPattern =
      /\b(?:(?:actor|bar|era|evidence|int|loop|mech|obs|pat|proc|record|scenario)\.[a-z0-9]+_[a-z0-9_]+|actor\.(?:candidate|client|recruiter))\b/g;
    for (const file of sourceFiles(resolve(root, 'apps/web/src'))) {
      const source = readFileSync(file, 'utf8');
      const literals =
        source.match(/'(?:\\.|[^'\\\r\n])*'|"(?:\\.|[^"\\\r\n])*"|`(?:\\.|[^`\\])*`/g) ?? [];
      for (const literal of literals) {
        const authoredText = literal.slice(1, -1).replace(/\$\{[\s\S]*?\}/g, '');
        for (const match of authoredText.matchAll(idPattern)) {
          const id = match[0];
          mentioned.push(id);
          if (!canonicalIds.has(id)) unresolved.push(`${relative(root, file)}: ${id}`);
        }
      }
    }

    expect(mentioned.length).toBeGreaterThan(0);
    expect(unresolved).toEqual([]);
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
        expect.objectContaining({
          artifact: preview.observation.id,
          observed_at: expect.arrayContaining([preview.stage]),
        })
      );
      expect(preview.probe).toEqual(preview.observation.probes[0]);

      expect(preview.observation.title).toBe(
        bundle.observations.find((node) => node.id === preview.observation.id)?.title
      );
      expect(preview.barrier.title).toBe(
        bundle.barriers.find((node) => node.id === preview.barrier.id)?.title
      );
      expect(preview.mechanism.title).toBe(
        bundle.mechanisms.find((node) => node.id === preview.mechanism.id)?.title
      );

      idsByLanguage.push([
        preview.observation.id,
        preview.barrier.id,
        preview.mechanism.id,
        preview.probe.id,
      ]);
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
    const component = readFileSync(
      resolve(root, 'apps/web/src/components/DiagnosticPreview.astro'),
      'utf8'
    );

    expect(component).not.toMatch(/\b(?:obs|bar|mech)\.[a-z0-9_]+\b/);
    expect(component).toContain('{observation.title}');
    expect(component).toContain('{barrier.title}');
    expect(component).toContain('{mechanism.title}');
    expect(component).toContain('{probe.action}');
  });
});
