import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadRegistryFromRoot, findRegistryRoot } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

/**
 * Documents a reader is meant to treat as current. PLAN-SUBSTRATE.md is one of
 * them despite reading as a plan: its stages are cited from source — lift.ts
 * names "the rule of the gate (PLAN-SUBSTRATE A2)" — so the code depends on it
 * being accurate.
 *
 * What is left out is `docs/decided/`, where a settled question keeps the names
 * that were canonical when it was written, and CHANGELOG.md, which is the
 * release history. Rewriting either would remove the evidence of when something
 * was decided. Renaming an entity is not that: it is the same entity, and
 * naming it as it is now makes the claim checkable rather than falsifying it —
 * which is why the living documents were migrated rather than frozen.
 */
const LIVING = ['README.md', 'CONTRIBUTING.md', 'ROADMAP.md', 'SPEC-MODEL.md', 'PLAN-SUBSTRATE.md'];

const bundle = loadRegistryFromRoot(findRegistryRoot(REPO_ROOT)!, 'en');
const collections = [
  bundle.observations, bundle.barriers, bundle.mechanisms, bundle.patterns, bundle.loops,
  bundle.interventions, bundle.evidence, bundle.actors, bundle.processes, bundle.eras, bundle.records,
];
const ids = new Set<string>();
const aliases = new Map<string, string>();
for (const c of collections) {
  for (const e of c as Array<{ id: string; aliases?: unknown }>) {
    ids.add(e.id);
    if (Array.isArray(e.aliases)) for (const a of e.aliases) aliases.set(String(a), e.id);
  }
}

const read = (f: string) => fs.readFileSync(path.join(REPO_ROOT, f), 'utf8');

describe('the documents that describe the registry as it is', () => {
  /**
   * The migration to dotted ids left short codes behind in prose, where nothing
   * type-checks and nothing links. A reader cannot look up `M-016`: it names
   * nothing in the registry, nothing on the site, and no file.
   */
  it('names entities by the ids they currently carry', () => {
    const stale: string[] = [];
    for (const f of LIVING) {
      for (const m of read(f).matchAll(/\b(?:[ABMPLIE]|EVD|WF)-\d{3}\b/g)) {
        if (aliases.has(m[0])) stale.push(`${f}: ${m[0]} → ${aliases.get(m[0])}`);
      }
    }
    expect(stale).toEqual([]);
  });

  /**
   * The other direction, and the one that matters after the next rename: an id
   * these documents assert exists must exist. Backticked only — prose mentions a
   * dotted prefix in other senses, and a claim about a specific entry is written
   * as code.
   */
  it('cites no entity that is not in the registry', () => {
    const missing: string[] = [];
    for (const f of LIVING) {
      for (const m of read(f).matchAll(/`((?:obs|bar|mech|pat|loop|int|proc|actor|era|record|evidence)\.[a-z0-9_]+)`/g)) {
        if (!ids.has(m[1])) missing.push(`${f}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
  /**
   * A path in backticks is a claim that a reader can open it. Eight of the
   * fourteen these documents named did not exist: the package split moved
   * `packages/registry/src/*` into three packages and the Lean sources moved
   * under `formal/lean/`, and prose is the one place a moved file leaves no
   * broken import behind.
   */
  it('points only at files and directories that exist', () => {
    const missing: string[] = [];
    for (const f of LIVING) {
      for (const m of read(f).matchAll(/`((?:packages|apps|scripts|tests|data|formal|e2e|docs)\/[A-Za-z0-9_.\/-]*)`/g)) {
        if (!fs.existsSync(path.join(REPO_ROOT, m[1].replace(/\/$/, '')))) missing.push(`${f}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });
  /**
   * A structure diagram sits inside a fence, so the backtick rule above never
   * saw it — and README's had rotted entirely: it still showed one `registry`
   * package after the split into five, `site/` for what is now `apps/web/`, and
   * `content/` and `content-uk/` for trees that moved under `data/` two
   * migrations ago. It is the first orientation a reader gets.
   */
  it('draws a tree whose every branch exists', () => {
    const missing: string[] = [];
    for (const f of LIVING) {
      const stack: string[] = [];
      for (const line of read(f).split('\n')) {
        const m = line.match(/^((?:[│ ] {3})*)(?:├──|└──) ([A-Za-z0-9_.\/-]+)/);
        if (!m) continue;
        const depth = m[1].length / 4;
        stack.length = depth;
        stack[depth] = m[2].replace(/\/$/, '');
        const rel = stack.slice(0, depth + 1).join('/');
        if (!fs.existsSync(path.join(REPO_ROOT, rel))) missing.push(`${f}: ${rel}`);
      }
    }
    expect(missing).toEqual([]);
  });
});
