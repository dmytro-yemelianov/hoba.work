import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadRegistryFromRoot, findRegistryRoot } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

/**
 * Documents a reader is meant to treat as current. Everything else at the root
 * is a record of work already done and keeps the names that were canonical when
 * it was written: CHANGELOG.md is the release history; DRAFT-WF-004.md decided
 * the client funnel, which now exists as `proc.client_account_hiring_funnel`;
 * PLAN-SUBSTRATE.md and RFC-RECORDS.md planned the substrate and the record
 * format, both of which shipped. Rewriting those would falsify the record.
 */
const LIVING = ['README.md', 'CONTRIBUTING.md', 'ROADMAP.md', 'SPEC-MODEL.md'];

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
});
