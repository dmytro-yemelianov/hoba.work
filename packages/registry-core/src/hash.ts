/**
 * A content hash over the whole registry (design doc §10).
 *
 * A version number says what a release is called; the hash says what it
 * contains. Two checkouts with the same content produce the same digest, and
 * any edit — or any rename, which is what eleven slices of this migration
 * consisted of — produces a different one.
 *
 * Deterministic by construction: paths are sorted, and each file contributes
 * both its path and its bytes, so moving content between files is as visible as
 * changing it.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIRS, COVERAGE_MODEL_PATH, EVIDENCE_DIR, SCENARIO_DIR } from './paths.js';

/** Every tree the registry's content lives in, relative to the root. */
const HASHED_TREES = [CONTENT_DIRS.en, CONTENT_DIRS.uk, EVIDENCE_DIR, SCENARIO_DIR];
const HASHED_FILES = [COVERAGE_MODEL_PATH];
const HASHED_EXTENSIONS = new Set(['.md', '.yaml', '.yml']);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (HASHED_EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

export function registryContentHash(root: string): string {
  const files = [
    ...HASHED_TREES.flatMap((tree) => walk(path.join(root, tree))),
    ...HASHED_FILES.map((file) => path.join(root, file)).filter(fs.existsSync),
  ]
    // Posix separators so the digest does not depend on the platform it ran on.
    .map((full) => ({ rel: path.relative(root, full).split(path.sep).join('/'), full }))
    .sort((a, b) => a.rel.localeCompare(b.rel));

  const digest = crypto.createHash('sha256');
  for (const { rel, full } of files) {
    digest.update(rel);
    digest.update('\0');
    digest.update(fs.readFileSync(full));
    digest.update('\0');
  }
  return digest.digest('hex');
}
