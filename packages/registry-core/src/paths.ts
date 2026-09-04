import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ContentLang } from './types.js';

export const MANIFEST_FILENAME = 'registry.yaml';

/** Everything the registry is made of lives under here (design doc §9). */
export const DATA_DIR = 'data';

/**
 * One directory of authored entities per language.
 *
 * The language sits *above* the entities rather than beside them — `data/en/`
 * and `data/uk/`, not `data/` and `data-uk/` — because neither mirror is the
 * default one. The validator judges both and `compareBundleStructure` is
 * symmetric; the old `content/` versus `content-uk/` encoded a hierarchy the
 * code has never had.
 */
export const CONTENT_DIRS: Record<ContentLang, string> = {
  en: path.join(DATA_DIR, 'en', 'entities'),
  uk: path.join(DATA_DIR, 'uk', 'entities'),
};

/** Evidence is language-neutral: a citation is the same document either way. */
export const EVIDENCE_DIR = path.join(DATA_DIR, 'evidence');

/** Scenarios compose the ontology rather than belonging to it, but they are data. */
export const SCENARIO_DIR = path.join(DATA_DIR, 'scenarios');

/**
 * Archetypes are hand-authored flavor, not canonical fact — a nickname and a
 * grid placement for an entity, never validated against evidence the way the
 * rest of the registry is. Kept in their own tree so they can never be
 * mistaken for something `validateRegistry` covers.
 */
export const ARCHETYPE_DIR = path.join(DATA_DIR, 'archetypes');

/** True when `dir` looks like the root of a hoba registry checkout. */
export function isRegistryRoot(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, CONTENT_DIRS.en)) &&
    fs.existsSync(path.join(dir, MANIFEST_FILENAME))
  );
}

/**
 * Walk upwards from `startDir` until a registry root is found.
 * Used by the CLI, the MCP server and the site so that none of them has to
 * hard-code `../..` assumptions about where they are launched from.
 */
export function findRegistryRoot(startDir: string): string | undefined {
  let current = path.resolve(startDir);
  for (;;) {
    if (isRegistryRoot(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

/**
 * Resolve the registry root from (in order): an explicit directory, the
 * `HOBA_ROOT` environment variable, the current working directory, and the
 * location of the calling module (so `node packages/cli/dist/cli.js` works
 * from anywhere inside the repository).
 */
export function resolveRegistryRoot(
  options: { explicit?: string; fromModuleUrl?: string } = {}
): string {
  const candidates: string[] = [];
  if (options.explicit) candidates.push(path.resolve(options.explicit));
  if (process.env.HOBA_ROOT) candidates.push(path.resolve(process.env.HOBA_ROOT));
  candidates.push(process.cwd());
  if (options.fromModuleUrl) candidates.push(path.dirname(fileURLToPath(options.fromModuleUrl)));

  for (const candidate of candidates) {
    const root = findRegistryRoot(candidate);
    if (root) return root;
  }

  throw new Error(
    `Could not locate a hoba registry root (a directory containing "${CONTENT_DIRS.en}/" and "${MANIFEST_FILENAME}"). ` +
      `Tried: ${candidates.join(', ')}. Pass --dir <path> or set HOBA_ROOT.`
  );
}

export function contentDirFor(root: string, lang: ContentLang = 'en'): string {
  return path.join(root, CONTENT_DIRS[lang]);
}

export function evidenceDirFor(root: string): string {
  return path.join(root, EVIDENCE_DIR);
}

export function manifestPathFor(root: string): string {
  return path.join(root, MANIFEST_FILENAME);
}

/** Read the `version` field of a package.json given its URL or path. */
export function readPackageVersion(packageJson: URL | string): string {
  const file = packageJson instanceof URL ? fileURLToPath(packageJson) : packageJson;
  const parsed = JSON.parse(fs.readFileSync(file, 'utf-8')) as { version?: string };
  if (!parsed.version) throw new Error(`No "version" field in ${file}`);
  return parsed.version;
}
