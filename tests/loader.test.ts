import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTENT_DIRS, findRegistryRoot, loadRegistryFromDirectory, loadRegistryFromRoot, RegistryLoadError } from '@hoba/registry';
import { REPO_ROOT, writeTempRegistry } from './helpers';

const validArtifact = `---
id: "A-001"
type: "observation"
title: "Silence"
summary: "No acknowledgement of any kind is received after submitting."
stages: ["ingestion"]
non_inferences: ["Does not prove review."]
---

# Silence

Body text.
`;

describe('loadRegistryFromDirectory', () => {
  it('parses frontmatter, keeps the markdown body as content, and applies schema defaults', () => {
    const root = writeTempRegistry({ 'data/en/entities/observation/A-001.md': validArtifact });
    const bundle = loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en));
    expect(bundle.version).toBe('1.0.0');
    expect(bundle.observations).toHaveLength(1);
    expect(bundle.observations[0].content).toContain('Body text.');
    expect(bundle.observations[0].status).toBe('active');
    expect(bundle.observations[0].probes).toEqual([]);
    expect(bundle.observations[0].evidence_ids).toEqual([]);
  });

  it('also accepts plain YAML entity files', () => {
    const root = writeTempRegistry({
      'content/evidence-free/.keep': '',
      'data/evidence/EVD-001.yaml': 'id: EVD-001\ntype: evidence\ntitle: Some study\nkind: research\nsummary: A long enough summary.\n',
    });
    const bundle = loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en));
    expect(bundle.evidence.map((e) => e.id)).toEqual(['EVD-001']);
  });

  it('reports schema failures with the offending file path and field', () => {
    const root = writeTempRegistry({
      'data/en/entities/observation/A-001.md': validArtifact.replace('stages: ["ingestion"]', 'stages: ["nowhere"]'),
    });
    expect(() => loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en))).toThrow(RegistryLoadError);
    expect(() => loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en))).toThrow(/A-001\.md.*stages/);
  });

  it('rejects files without frontmatter and a missing manifest', () => {
    const root = writeTempRegistry({ 'data/en/entities/observation/A-001.md': '# no frontmatter\n' });
    expect(() => loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en))).toThrow(/frontmatter/);

    fs.rmSync(path.join(root, 'registry.yaml'));
    expect(() => loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en))).toThrow(/manifest/);
  });

  it('orders barriers by funnel order regardless of file order', () => {
    const b = (id: string, order: number) =>
      `---\nid: "${id}"\ntype: "barrier"\ntitle: "Gate ${id}"\nstage: "screening"\norder: ${order}\ndescription: "A long enough description."\npass_condition: "Passes eventually."\n---\n`;
    const root = writeTempRegistry({ 'data/en/entities/barrier/B-001.md': b('B-001', 2), 'data/en/entities/barrier/B-002.md': b('B-002', 1) });
    expect(loadRegistryFromDirectory(path.join(root, CONTENT_DIRS.en)).barriers.map((x) => x.id)).toEqual(['B-002', 'B-001']);
  });
});

describe('findRegistryRoot / loadRegistryFromRoot', () => {
  it('walks upwards to the repository root and loads both mirrors', () => {
    expect(findRegistryRoot(path.join(REPO_ROOT, 'packages', 'cli', 'src'))).toBe(REPO_ROOT);
    expect(findRegistryRoot('/')).toBeUndefined();
    expect(loadRegistryFromRoot(REPO_ROOT, 'uk').observations.length).toBe(loadRegistryFromRoot(REPO_ROOT, 'en').observations.length);
  });
});
