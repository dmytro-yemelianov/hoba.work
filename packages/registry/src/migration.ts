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
