import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { ZodError, ZodTypeAny, z } from 'zod';
import {
  artifactSchema,
  barrierSchema,
  evidenceSchema,
  interventionSchema,
  loopSchema,
  mechanismSchema,
  patternSchema,
  registryManifestSchema,
} from './schemas.js';
import type { ContentLang, RegistryBundle, RegistryManifest } from './types.js';
import { contentDirFor, evidenceDirFor, manifestPathFor } from './paths.js';

export interface ParseResult<T = unknown> {
  data: T;
  content: string;
  filePath: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const LOADABLE_EXTENSIONS = new Set(['.md', '.yaml', '.yml']);

/** Raised when a content file cannot be parsed or fails schema validation. Always carries the file path. */
export class RegistryLoadError extends Error {
  constructor(
    public readonly filePath: string,
    message: string,
    public readonly zodError?: ZodError
  ) {
    super(`${filePath}: ${message}`);
    this.name = 'RegistryLoadError';
  }
}

function formatZodError(error: ZodError): string {
  return error.issues.map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`).join('; ');
}

export function parseMarkdownFile<T = unknown>(filePath: string): ParseResult<T> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const match = fileContent.match(FRONTMATTER_RE);

  if (!match) {
    throw new RegistryLoadError(filePath, 'missing valid YAML frontmatter delimiters (---)');
  }

  return {
    data: yaml.load(match[1]) as T,
    content: match[2].trim(),
    filePath,
  };
}

/**
 * Parse a single entity file. Markdown files carry YAML frontmatter plus a body
 * (stored as `content`); plain YAML files are loaded verbatim.
 */
function loadEntityFile<S extends ZodTypeAny>(filePath: string, schema: S): z.infer<S> {
  let data: unknown;
  let content: string | undefined;

  if (path.extname(filePath) === '.md') {
    const parsed = parseMarkdownFile<Record<string, unknown>>(filePath);
    data = parsed.data;
    content = parsed.content || undefined;
  } else {
    data = yaml.load(fs.readFileSync(filePath, 'utf-8'));
  }

  if (data === null || typeof data !== 'object') {
    throw new RegistryLoadError(filePath, 'frontmatter must be a YAML mapping');
  }

  const result = schema.safeParse(content === undefined ? data : { ...data, content });
  if (!result.success) {
    throw new RegistryLoadError(filePath, formatZodError(result.error), result.error);
  }
  return result.data;
}

function listEntityFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => LOADABLE_EXTENSIONS.has(path.extname(f)))
    .sort()
    .map((f) => path.join(dir, f));
}

function loadEntityDir<S extends ZodTypeAny>(dir: string, schema: S): z.infer<S>[] {
  return listEntityFiles(dir).map((file) => loadEntityFile(file, schema));
}

export function loadRegistryManifest(manifestPath: string): RegistryManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new RegistryLoadError(manifestPath, 'registry manifest not found (expected registry.yaml at the repository root)');
  }
  const raw = yaml.load(fs.readFileSync(manifestPath, 'utf-8'));
  const result = registryManifestSchema.safeParse(raw);
  if (!result.success) {
    throw new RegistryLoadError(manifestPath, formatZodError(result.error), result.error);
  }
  return result.data;
}

export interface LoadRegistryOptions {
  /** Directory holding evidence records. Defaults to `<baseDir>/../evidence`. */
  evidenceDir?: string;
  /** Path to the release manifest. Defaults to `<baseDir>/../registry.yaml`. */
  manifestPath?: string;
}

/**
 * Load a registry from a content directory (e.g. `content/` or `content-uk/`).
 * Every file is schema-validated; the first failure aborts with a path-qualified
 * error. Output ordering is deterministic (sorted by ID; barriers by funnel order).
 */
export function loadRegistryFromDirectory(baseDir: string, options: LoadRegistryOptions = {}): RegistryBundle {
  const parent = path.resolve(baseDir, '..');
  const evidenceDir = options.evidenceDir ?? path.join(parent, 'evidence');
  const manifestPath = options.manifestPath ?? path.join(parent, 'registry.yaml');

  const manifest = loadRegistryManifest(manifestPath);

  const byId = <T extends { id: string }>(a: T, b: T) => a.id.localeCompare(b.id);

  const artifacts = loadEntityDir(path.join(baseDir, 'artifacts'), artifactSchema).sort(byId);
  const barriers = loadEntityDir(path.join(baseDir, 'barriers'), barrierSchema).sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id)
  );
  const mechanisms = loadEntityDir(path.join(baseDir, 'mechanisms'), mechanismSchema).sort(byId);
  const patterns = loadEntityDir(path.join(baseDir, 'patterns'), patternSchema).sort(byId);
  const loops = loadEntityDir(path.join(baseDir, 'loops'), loopSchema).sort(byId);
  const interventions = loadEntityDir(path.join(baseDir, 'interventions'), interventionSchema).sort(byId);
  const evidence = loadEntityDir(evidenceDir, evidenceSchema).sort(byId);

  return {
    ...manifest,
    artifacts,
    barriers,
    mechanisms,
    patterns,
    loops,
    interventions,
    evidence,
  };
}

/** Convenience: load the registry for a language mirror from a repository root. */
export function loadRegistryFromRoot(root: string, lang: ContentLang = 'en'): RegistryBundle {
  return loadRegistryFromDirectory(contentDirFor(root, lang), {
    evidenceDir: evidenceDirFor(root),
    manifestPath: manifestPathFor(root),
  });
}
