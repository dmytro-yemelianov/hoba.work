import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { describe, expect, it } from 'vitest';
import { registryContentHash, resolveRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';
import { REPO_ROOT } from './helpers';

function tempRegistry(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hoba-hash-'));
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return dir;
}

const BASE = {
  'content/mechanisms/mech.a.md': '---\nid: "mech.a"\n---\n',
  'content-uk/mechanisms/mech.a.md': '---\nid: "mech.a"\n---\n',
  'evidence/evidence.a.md': '---\nid: "evidence.a"\n---\n',
  'data/scenarios/a.yaml': 'id: scenario.a\n',
};

describe('registryContentHash', () => {
  it('is stable across calls over unchanged content', () => {
    const root = tempRegistry(BASE);
    expect(registryContentHash(root)).toBe(registryContentHash(root));
  });

  it('is the same for two checkouts with identical content', () => {
    expect(registryContentHash(tempRegistry(BASE))).toBe(registryContentHash(tempRegistry(BASE)));
  });

  it('changes when any byte of any entity changes', () => {
    const before = registryContentHash(tempRegistry(BASE));
    const after = registryContentHash(tempRegistry({ ...BASE, 'content/mechanisms/mech.a.md': '---\nid: "mech.a"\ntitle: "x"\n---\n' }));
    expect(after).not.toBe(before);
  });

  it('changes when a file is renamed, even though every byte of content is the same', () => {
    // A rename is exactly what eleven slices of this migration did, so the hash
    // has to see it. Folding only the bytes would miss it entirely.
    const before = registryContentHash(tempRegistry(BASE));
    const { 'content/mechanisms/mech.a.md': body, ...rest } = BASE;
    const after = registryContentHash(tempRegistry({ ...rest, 'content/mechanisms/mech.renamed.md': body }));
    expect(after).not.toBe(before);
  });

  it('covers scenarios, not only entities', () => {
    const before = registryContentHash(tempRegistry(BASE));
    const after = registryContentHash(tempRegistry({ ...BASE, 'data/scenarios/a.yaml': 'id: scenario.b\n' }));
    expect(after).not.toBe(before);
  });

  it('is a hex digest, not a path listing', () => {
    expect(registryContentHash(tempRegistry(BASE))).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('the release manifest', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'site', 'public', 'data', 'latest', 'manifest.json'), 'utf-8'));

  it('reports a semver registry version — DoD 8', () => {
    expect(manifest.registry_version).toMatch(/^\d+\.\d+\.\d+$/);
    // `2026.08.3` matches that too, so the discriminating assertion is that the
    // date-coded form is gone: §10 retires it in favour of strict semver.
    expect(manifest.registry_version).not.toMatch(/^\d{4}\.\d{2}\.\d+$/);
    expect(loadRegistryFromRoot(resolveRegistryRoot(), 'en').version).toBe(manifest.registry_version);
  });

  it('carries a content hash', () => {
    // Deliberately not compared against `registryContentHash(REPO_ROOT)` here:
    // the manifest is a build artifact and the unit gate runs before the build,
    // so that comparison would fail on any content edit until a rebuild — a
    // stale-artifact warning wearing a correctness test's clothes. That the
    // hash tracks content is proven above; that the manifest carries the
    // current one is enforced by the build writing it from the same function.
    expect(manifest.registry_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('dates the release from the authored manifest, not from the clock', () => {
    // Build artifacts are committed here; a build-time timestamp would dirty
    // the tree on every build and hide real changes in the noise.
    expect(manifest).not.toHaveProperty('generated_at');
    expect(manifest.updated_at).toBe(loadRegistryFromRoot(resolveRegistryRoot(), 'en').updated_at);
  });
});
