import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadArchetypes, loadRegistryFromRoot, resolveRegistryRoot, validateArchetypes } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

const root = resolveRegistryRoot();
const bundle = loadRegistryFromRoot(root, 'en');
const knownIds = new Set<string>([
  ...bundle.observations, ...bundle.barriers, ...bundle.mechanisms, ...bundle.patterns, ...bundle.loops,
  ...bundle.interventions, ...bundle.evidence, ...bundle.actors, ...bundle.processes, ...bundle.eras, ...bundle.records,
].map((e) => e.id));

/**
 * Archetypes are flavor, not fact — deliberately not part of `validateRegistry`
 * (see the doc comment on `archetypeSchema`). What this still guards: every
 * placed id must be real, and none may be placed twice. Coverage of all 96
 * entities is not required — a partial rollout is the current, honest state.
 */
describe('the /archetypes grid names entities that exist, once each', () => {
  const archetypes = loadArchetypes(root);

  it('has at least the pilot patterns', () => {
    expect(archetypes.length).toBeGreaterThanOrEqual(4);
  });

  it('names no id twice and nothing the registry does not have', () => {
    expect(validateArchetypes(archetypes, knownIds)).toEqual([]);
  });

  it('is complete and non-empty in both languages for every entry', () => {
    for (const a of archetypes) {
      expect(a.nickname.en.length, `${a.id} nickname.en`).toBeGreaterThan(0);
      expect(a.nickname.uk.length, `${a.id} nickname.uk`).toBeGreaterThan(0);
      expect(a.blurb.en.length, `${a.id} blurb.en`).toBeGreaterThan(0);
      expect(a.blurb.uk.length, `${a.id} blurb.uk`).toBeGreaterThan(0);
    }
  });

  it('keeps one file per id, named after the id', () => {
    const dir = path.join(REPO_ROOT, 'data', 'archetypes');
    for (const file of fs.readdirSync(dir)) {
      expect(file).toBe(`${file.replace(/\.ya?ml$/, '')}.yaml`);
      const id = file.replace(/\.ya?ml$/, '');
      expect(archetypes.some((a) => a.id === id), file).toBe(true);
    }
  });
});
