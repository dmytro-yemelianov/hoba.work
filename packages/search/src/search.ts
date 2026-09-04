import { READER_FACING_TYPES, type ReaderFacingType } from '@hoba/registry-core/schemas';
import type { RegistryBundle, RegistryNode } from '@hoba/registry-core/types';

/**
 * What `searchBundle` actually indexes: the six kinds a reader meets, plus
 * records.
 *
 * It used to be `Exclude<EntityType, 'evidence'>`, which was only correct while
 * those two lists happened to agree. They no longer do: the type enum covers
 * all eleven ontology kinds, and search covers the seven with prose to search.
 */
export type SearchableType = ReaderFacingType | 'record';

export interface SearchHit {
  type: SearchableType;
  id: string;
  title: string;
  /** The searchable prose for the node (summary, or description for barriers). */
  text: string;
  node: RegistryNode;
  /** Lower is better. 0 = exact ID match, 1 = title match, 2 = prose match. */
  rank: number;
}

export interface SearchOptions {
  types?: SearchableType[];
  limit?: number;
}

const nodeText = (node: RegistryNode): string =>
  'summary' in node ? node.summary : node.description;

/**
 * Case-insensitive substring search across IDs, titles and summaries.
 * Shared by the CLI, the MCP server and (potentially) the site so all surfaces
 * agree on what "search" means.
 */
export function searchBundle(
  bundle: RegistryBundle,
  query: string,
  options: SearchOptions = {}
): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const wanted = new Set<SearchableType>(options.types ?? [...READER_FACING_TYPES, 'record']);

  const pools: RegistryNode[] = [
    ...bundle.observations,
    ...bundle.barriers,
    ...bundle.mechanisms,
    ...bundle.patterns,
    ...bundle.loops,
    ...bundle.interventions,
    ...(bundle.records ?? []),
  ];

  const hits: SearchHit[] = [];
  for (const node of pools) {
    if (!wanted.has(node.type)) continue;
    const text = nodeText(node);
    let rank: number | undefined;
    if (node.id.toLowerCase() === q) rank = 0;
    else if (node.id.toLowerCase().includes(q) || node.title.toLowerCase().includes(q)) rank = 1;
    else if (text.toLowerCase().includes(q)) rank = 2;
    if (rank === undefined) continue;
    hits.push({ type: node.type, id: node.id, title: node.title, text, node, rank });
  }

  hits.sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id));
  return options.limit ? hits.slice(0, options.limit) : hits;
}
