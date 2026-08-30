/**
 * Reading a rejection letter back into the registry.
 *
 * The wizard on /analyze asks a person to translate their experience into the
 * atlas's vocabulary first — pick a stage, tick the traces. That is backwards:
 * the reader has a letter, and the vocabulary is the atlas's job. This matches
 * the letter itself against what the registry already holds, which is every
 * observation's specimens: reconstructed documents, in both languages.
 *
 * Deliberately not a model. The result has to be explainable to someone who has
 * just been rejected — every match returns the phrases that produced it, and a
 * weak match says so rather than rounding up to a confident answer.
 *
 * Nothing here touches the network. A rejection letter almost always names the
 * employer, and the registry may never contain one; matching in the browser and
 * storing nothing is what makes it safe to paste at all.
 */

/** A word reduced to a comparable stem: enough for two languages that both inflect. */
const STEM_LENGTH = 6;
const MIN_WORD = 4;

const stems = (text: string): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .split(' ')
    .filter((w) => w.length >= MIN_WORD);
  return words.map((w) => w.slice(0, STEM_LENGTH));
};

export interface ObservationLike {
  id: string;
  title: string;
  summary?: string;
  stages?: readonly string[];
  specimens?: ReadonlyArray<{ lines?: ReadonlyArray<{ text?: string }>; reading?: string }>;
}

export interface Match {
  id: string;
  title: string;
  /** Relative to the best match, for ordering and for a bar in the UI. */
  score: number;
  /**
   * Whether this is an answer rather than a guess.
   *
   * Relative score cannot say: the leader is always 1. It takes an absolute
   * floor — enough distinctive vocabulary shared at all — and a margin over the
   * runner-up, because two entries a letter cannot separate is exactly the
   * ceiling this atlas publishes rather than rounds away.
   */
  confident: boolean;
  /** The words from the pasted text that put this entry here, in its own words. */
  hits: string[];
  stages: readonly string[];
}

/** Everything the registry has written down about how an observation reads. */
const surfaceOf = (o: ObservationLike): string =>
  [
    o.title,
    o.summary ?? '',
    ...(o.specimens ?? []).flatMap((s) => [...(s.lines ?? []).map((l) => l.text ?? ''), s.reading ?? '']),
  ].join(' ');

/**
 * Matches, best first.
 *
 * A stem shared with every entry says nothing — "application", "role" — so each
 * one is weighted by how few entries use it. Without that, every letter matches
 * the entry about silence, because silence is described in the most ordinary
 * words in the registry.
 */
export function matchObservations(text: string, observations: readonly ObservationLike[]): Match[] {
  const pasted = new Set(stems(text));
  if (pasted.size === 0 || observations.length === 0) return [];

  const vocab = observations.map((o) => ({ observation: o, stems: new Set(stems(surfaceOf(o))) }));
  const documentCount = new Map<string, number>();
  for (const { stems: set } of vocab) {
    for (const stem of set) documentCount.set(stem, (documentCount.get(stem) ?? 0) + 1);
  }

  const weight = (stem: string): number => {
    const seen = documentCount.get(stem) ?? 0;
    if (seen === 0) return 0;
    return Math.log(observations.length / seen);
  };

  const scored = vocab.map(({ observation, stems: set }) => {
    let raw = 0;
    const hits: string[] = [];
    for (const stem of set) {
      if (!pasted.has(stem)) continue;
      const w = weight(stem);
      if (w <= 0) continue;
      raw += w;
      hits.push(stem);
    }
    // Divided by the size of what it is being compared against, or the entry
    // with the longest specimen wins every letter on volume alone — which is
    // how an ordinary "we will not be moving forward" was landing on the entry
    // about never hearing back at all.
    const score = raw / Math.sqrt(set.size * pasted.size);
    return { observation, score, hits };
  });

  // Two shared distinctive words is a coincidence; the floor is what makes
  // "not about hiring" return nothing instead of a ranked list of nothing.
  const MIN_HITS = 3;
  const eligible = scored.filter((s) => s.hits.length >= MIN_HITS && s.score > 0)
    .sort((a, b) => b.score - a.score);
  if (eligible.length === 0) return [];

  const best = eligible[0]!.score;
  const runnerUp = eligible[1]?.score ?? 0;
  // Measured against the letters in tests/match.test.ts, not guessed: a
  // template rejection scores 0.60 at a margin of 1.50 and one naming an
  // internal hire 0.38 at 2.04, while an ordinary "we will not be moving
  // forward" — which names no reason and so genuinely identifies nothing —
  // scores 0.30 at 1.12 and must fail. Three letters is a thin basis; these are
  // set so that each of the two criteria rejects that letter on its own.
  const ABSOLUTE_FLOOR = 0.34;
  const MARGIN = 1.25;
  const leaderIsAnswer = best >= ABSOLUTE_FLOOR && (runnerUp === 0 || best / runnerUp >= MARGIN);

  return eligible
    .map(({ observation, score, hits }, index) => ({
      id: observation.id,
      title: observation.title,
      score: score / best,
      confident: index === 0 && leaderIsAnswer,
      hits: hits.sort((a, b) => weight(b) - weight(a)).slice(0, 6),
      stages: observation.stages ?? [],
    }))
    .sort((a, b) => b.score - a.score);
}
