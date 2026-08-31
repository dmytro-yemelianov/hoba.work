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
 * Every entity type except evidence: a citation is a source document, not a
 * phenomenon, and doesn't get a joke nickname. This is the set the grid is
 * now expected to cover completely — a coverage gap here means a real entity
 * was added to the registry without a matching archetype, not an in-progress
 * rollout (the rollout finished; see the commit history under data/archetypes/).
 */
const coverageIds = new Set<string>([
  ...bundle.observations, ...bundle.barriers, ...bundle.mechanisms, ...bundle.patterns, ...bundle.loops,
  ...bundle.interventions, ...bundle.actors, ...bundle.processes, ...bundle.eras, ...bundle.records,
].map((e) => e.id));

/**
 * Archetypes are flavor, not fact — deliberately not part of `validateRegistry`
 * (see the doc comment on `archetypeSchema`). What this still guards: every
 * placed id must be real, none may be placed twice, and — now that the grid
 * covers the whole registry — every non-evidence entity has exactly one.
 */
describe('the /archetypes grid names entities that exist, once each', () => {
  const archetypes = loadArchetypes(root);

  it('covers every entity in the registry except evidence citations', () => {
    const placed = new Set(archetypes.map((a) => a.id));
    const missing = [...coverageIds].filter((id) => !placed.has(id)).sort();
    expect(missing).toEqual([]);
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
