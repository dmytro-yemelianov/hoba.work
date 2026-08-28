import fs from 'node:fs';
import path from 'node:path';
import type { RegistryBundle } from './types.js';

export interface IdMappingEntry {
  oldId: string;
  newId: string;
  type: string;
  title: string;
}

export interface IdMappingCollision {
  type: string;
  slug: string;
  entities: string[];
}

export interface IdMappingResult {
  mappings: IdMappingEntry[];
  collisions: IdMappingCollision[];
}

/** Design doc §3's type → new-ID-prefix table. */
export const TYPE_ID_PREFIX: Record<string, string> = {
  artifact: 'obs',
  barrier: 'bar',
  mechanism: 'mech',
  pattern: 'pat',
  loop: 'loop',
  intervention: 'int',
  workflow: 'proc',
  actor: 'actor',
  era: 'era',
  record: 'record',
  evidence: 'evidence',
};

/** Deterministic name-slug derivation (design doc §3). */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

interface TitledId {
  id: string;
  title: string;
}

/**
 * Builds the old-code -> new dotted-ID mapping for every entity in a loaded
 * bundle. Read-only: never touches content files. A collision (two entities
 * of the same type slugifying to the same name) is reported, never
 * auto-resolved (design doc §3).
 */
export function buildIdMapping(bundle: RegistryBundle): IdMappingResult {
  const collections: Array<{ type: string; items: TitledId[] }> = [
    { type: 'artifact', items: bundle.artifacts as unknown as TitledId[] },
    { type: 'barrier', items: bundle.barriers as unknown as TitledId[] },
    { type: 'mechanism', items: bundle.mechanisms as unknown as TitledId[] },
    { type: 'pattern', items: bundle.patterns as unknown as TitledId[] },
    { type: 'loop', items: bundle.loops as unknown as TitledId[] },
    { type: 'intervention', items: bundle.interventions as unknown as TitledId[] },
    { type: 'workflow', items: bundle.workflows as unknown as TitledId[] },
    { type: 'actor', items: bundle.actors as unknown as TitledId[] },
    { type: 'era', items: bundle.eras as unknown as TitledId[] },
    { type: 'record', items: bundle.records as unknown as TitledId[] },
    { type: 'evidence', items: bundle.evidence as unknown as TitledId[] },
  ];

  const mappings: IdMappingEntry[] = [];
  const collisions: IdMappingCollision[] = [];

  for (const { type, items } of collections) {
    const prefix = TYPE_ID_PREFIX[type];
    const oldIdsBySlug = new Map<string, string[]>();

    for (const item of items) {
      const slug = slugifyTitle(item.title);
      const existing = oldIdsBySlug.get(slug) ?? [];
      existing.push(item.id);
      oldIdsBySlug.set(slug, existing);
    }

    for (const [slug, oldIds] of oldIdsBySlug) {
      if (oldIds.length > 1) collisions.push({ type, slug, entities: oldIds });
    }

    for (const item of items) {
      mappings.push({
        oldId: item.id,
        newId: `${prefix}.${slugifyTitle(item.title)}`,
        type,
        title: item.title,
      });
    }
  }

  return { mappings, collisions };
}

export interface RenameApplication {
  oldId: string;
  newId: string;
  /** Paths relative to `root`, in the order they were found. */
  filesChanged: string[];
}

const RENAME_TREES = ['content', 'content-uk', 'evidence'];

/**
 * Replaces every double-quoted occurrence of `oldId` with `newId` across
 * content/, content-uk/, and evidence/. Anchored on the surrounding quote
 * characters so "P-0010" is never matched while renaming "P-001" — and
 * because every ID reference in this codebase's content is written as a
 * quoted YAML string, this single substitution simultaneously updates the
 * entity's own `id:` line and every external cross-reference to it,
 * including fields not explicitly modeled by the schema (era's `entities`,
 * actor's nested `recommendations[].targets`). No YAML parse/reserialize
 * round trip — every other byte of every touched file is preserved as-is.
 */
export function applyIdRename(root: string, oldId: string, newId: string): RenameApplication {
  const token = `"${oldId}"`;
  const replacement = `"${newId}"`;
  const filesChanged: string[] = [];

  for (const tree of RENAME_TREES) {
    const dir = path.join(root, tree);
    if (!fs.existsSync(dir)) continue;
    for (const file of walkMarkdownFiles(dir)) {
      const text = fs.readFileSync(file, 'utf8');
      if (!text.includes(token)) continue;
      fs.writeFileSync(file, text.split(token).join(replacement));
      filesChanged.push(path.relative(root, file));
    }
  }

  return { oldId, newId, filesChanged };
}

function walkMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

export interface FileRenamePlan {
  oldPath: string;
  newPath: string;
}

/** Computes git-mv source/destination pairs for one entity across every language tree it exists in. */
export function planFileRename(root: string, typeDir: string, oldId: string, newId: string): FileRenamePlan[] {
  const plans: FileRenamePlan[] = [];
  for (const tree of ['content', 'content-uk']) {
    const oldPath = path.join(root, tree, typeDir, `${oldId}.md`);
    if (!fs.existsSync(oldPath)) continue;
    plans.push({ oldPath, newPath: path.join(root, tree, typeDir, `${newId}.md`) });
  }
  return plans;
}

/**
 * Inserts `aliases:\n  - "<oldId>"` immediately after the file's `type:` line.
 * Call this AFTER applyIdRename has already rewritten the file's own `id:`
 * line to the new ID — this function only adds the new field, it does not
 * touch `id`.
 */
export function insertAlias(filePath: string, oldId: string): void {
  const text = fs.readFileSync(filePath, 'utf8');
  const marker = /^type: ".*"\n/m;
  if (!marker.test(text)) {
    throw new Error(`insertAlias: no "type:" line found in ${filePath}`);
  }
  const updated = text.replace(marker, (line) => `${line}aliases:\n  - "${oldId}"\n`);
  fs.writeFileSync(filePath, updated);
}
