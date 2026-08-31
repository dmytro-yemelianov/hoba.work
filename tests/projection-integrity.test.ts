import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
});
