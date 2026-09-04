import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { REPO_ROOT } from './helpers';

/**
 * The README's CLI block, run.
 *
 * Every entity id in it went stale during the dotted-ID migration and nothing
 * noticed, because a documented command is only a claim until something runs
 * it. This extracts the `hoba …` lines straight out of the README rather than
 * restating them, so a command that is edited in one place cannot pass here by
 * being correct in the other.
 */
function readmeHobaCommands(): string[] {
  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf-8');
  return readme
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('hoba ') && !line.startsWith('hoba="'))
    .map((line) => line.replace(/^hoba /, ''));
}

/** Naive but sufficient for this block: no quoting beyond simple "…" arguments. */
function splitArgs(command: string): string[] {
  return (command.match(/"[^"]*"|\S+/g) ?? []).map((a) => a.replace(/^"|"$/g, ''));
}

describe('the README is executable', { timeout: 60000 }, () => {
  const commands = readmeHobaCommands();

  it('documents a CLI block at all', () => {
    expect(commands.length).toBeGreaterThanOrEqual(8);
  });

  it.each(commands)('hoba %s', (command) => {
    execFileSync(
      'npx',
      [
        'tsx',
        '--tsconfig',
        path.join(REPO_ROOT, 'tsconfig.json'),
        'packages/cli/src/cli.ts',
        ...splitArgs(command),
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
        env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
  });
});
