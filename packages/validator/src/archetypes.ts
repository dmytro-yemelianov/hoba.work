/**
 * Archetypes: a nickname and a grid placement for an entity, purely for
 * `/archetypes`.
 *
 * Deliberately not canonical fact. Every other authored field in this
 * registry traces to evidence or to the schemas it derives from; an
 * archetype traces to nothing but a hand-picked joke. It is validated only
 * for internal consistency (the id exists, nothing is duplicated) — never
 * folded into `validateRegistry`, so a bad pun can never fail the registry
 * gate, and a reader can never mistake it for a claim the atlas is making.
 *
 * One file per entity, matching the scenario convention: no long-form body,
 * so a standalone YAML file is simpler than a Markdown+frontmatter pair.
 *
 * Two axes today (`axis_x`, `axis_y`) because that is what renders as a
 * literal, at-a-glance grid — the thing that was asked for. The schema
 * leaves room for a third: an optional `facet` a future grid could use as a
 * filter or a color overlay without a shape change here.
 */
import { z } from 'zod';

const entityRef = z.string().regex(/^[a-z]+\.[a-z0-9_]+$/, 'must look like <prefix>.<name>');

export const archetypeAxisXSchema = z.enum(['lawful', 'neutral', 'chaotic']);
export const archetypeAxisYSchema = z.enum(['visible', 'ambiguous', 'hidden']);

export const archetypeSchema = z.object({
  id: entityRef,
  /** Both mirrors, because each language is judged on its own. */
  nickname: z.object({ en: z.string().min(1), uk: z.string().min(1) }),
  /** One line on why it sits where it sits — the joke's punchline, not a citation. */
  blurb: z.object({ en: z.string().min(1), uk: z.string().min(1) }),
  /** How systematic (lawful) vs. ad hoc (chaotic) the mechanism behind it is. */
  axis_x: archetypeAxisXSchema,
  /** Whether the person it happens to could ever spot it happening. */
  axis_y: archetypeAxisYSchema,
  /** Reserved for a future third dimension; unused by the current grid. */
  facet: z.string().optional(),
});

export type Archetype = z.infer<typeof archetypeSchema>;
export type ArchetypeAxisX = z.infer<typeof archetypeAxisXSchema>;
export type ArchetypeAxisY = z.infer<typeof archetypeAxisYSchema>;

/** The center-cell nod to "True Neutral" — every other cell is `${x} ${y}`, capitalized. */
export function archetypeBoxName(x: ArchetypeAxisX, y: ArchetypeAxisY): string {
  if (x === 'neutral' && y === 'ambiguous') return 'True Neutral';
  return `${x[0]!.toUpperCase()}${x.slice(1)} ${y[0]!.toUpperCase()}${y.slice(1)}`;
}

export interface ArchetypeIssue {
  file: string;
  message: string;
}

/**
 * Internal consistency only: every id must resolve, and no id may appear
 * twice. Coverage of every non-evidence entity is enforced separately, by
 * `tests/archetypes.test.ts` walking the full registry — kept out of this
 * function because it needs the complete bundle, not just a set of ids.
 */
export function validateArchetypes(
  archetypes: Archetype[],
  knownIds: ReadonlySet<string>
): ArchetypeIssue[] {
  const issues: ArchetypeIssue[] = [];
  const seen = new Map<string, number>();
  for (const a of archetypes) {
    seen.set(a.id, (seen.get(a.id) ?? 0) + 1);
    if (!knownIds.has(a.id))
      issues.push({
        file: `${a.id}.yaml`,
        message: `${a.id} does not name an entity the registry has`,
      });
  }
  for (const [id, count] of seen) {
    if (count > 1)
      issues.push({
        file: `${id}.yaml`,
        message: `${id} has ${count} archetype files, expected one`,
      });
  }
  return issues;
}
