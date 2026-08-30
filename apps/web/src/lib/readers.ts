/**
 * Who reads this atlas, and from where.
 *
 * Two of the three sit inside the funnel the registry describes, and the
 * registry already records what their seat sees on every entry. The third does
 * not sit in it at all: a researcher reads the model rather than looking out
 * from a point inside it, which is why that page offers no lens and shows the
 * evidence and the gaps instead.
 *
 * The distinction matters because the three pages must not become three
 * different atlases. They order the same entries differently and frame them for
 * a different question; nothing about an entry changes between them.
 */
import type { RegistryBundle } from '@hoba/registry';

export const READER_SLUGS = ['candidate', 'recruiter', 'researcher'] as const;
export type ReaderSlug = (typeof READER_SLUGS)[number];

/** The actor slug whose lens this reader starts in, where they occupy a seat. */
export const READER_SEAT: Record<ReaderSlug, string | null> = {
  candidate: 'candidate',
  recruiter: 'recruiter',
  researcher: null,
};

/**
 * What every one of these pages reports identically. Derived, so the claim that
 * the three readings share a registry is checked by arithmetic rather than
 * asserted in prose.
 */
export function sharedFooting(bundle: RegistryBundle): { entries: number; evidence: number; languages: number } {
  return {
    entries:
      bundle.observations.length + bundle.barriers.length + bundle.mechanisms.length +
      bundle.patterns.length + bundle.loops.length + bundle.interventions.length,
    evidence: bundle.evidence.length,
    languages: 2,
  };
}

/**
 * The entry shown on every reader page: the trace the most mechanisms emit, so
 * the example is the one the atlas has the most to say about, and it is chosen
 * by counting rather than picked.
 */
export function sharedExample(bundle: RegistryBundle) {
  const emitCount = (id: string) => bundle.mechanisms.filter((m) => m.emissions.some((e) => e.artifact === id)).length;
  const withBothSeats = bundle.observations.filter((o) => {
    const seats = (o.perspectives ?? []).map((p) => p.actor);
    return seats.includes('actor.candidate') && seats.includes('actor.recruiter');
  });
  return [...withBothSeats].sort((a, b) => emitCount(b.id) - emitCount(a.id) || a.id.localeCompare(b.id))[0]!;
}
