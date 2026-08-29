/**
 * Integration checks over the real registry content under data/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  compareBundleStructure,
  HOBADiagnosticEngine,
  HOBAKnowledgeGraph,
  loadRegistryFromRoot,
  validateRegistry,
} from '@hoba/registry';
import { CONTENT_DIRS } from '@hoba/registry';
import { REPO_ROOT } from './helpers';
import { observationSchema, barrierSchema, mechanismSchema, patternSchema, loopSchema, interventionSchema, processSchema, eraSchema, actorSchema } from '@hoba/registry';

/**
 * Zod strips unknown keys, so frontmatter naming a field its schema does not
 * define is discarded in silence — the author writes it, the loader drops it,
 * and nothing says so. That is how four workflows and six actors carried an
 * `evidence_level` that never reached the validator, which meant the
 * `unsupported-claim` invariant could not have fired on them whatever they
 * claimed.
 */
describe('no frontmatter field is silently dropped', () => {
  const SCHEMAS: Record<string, { _def: { shape: () => Record<string, unknown> } }> = {
    observation: observationSchema as never,
    barrier: barrierSchema as never,
    mechanism: mechanismSchema as never,
    pattern: patternSchema as never,
    loop: loopSchema as never,
    intervention: interventionSchema as never,
    process: processSchema as never,
    era: eraSchema as never,
    actor: actorSchema as never,
  };

  for (const [dir, schema] of Object.entries(SCHEMAS)) {
    it(`every top-level key authored in ${CONTENT_DIRS.en}/${dir} is defined by its schema`, () => {
      const defined = new Set(Object.keys(schema._def.shape()));
      const root = path.join(REPO_ROOT, CONTENT_DIRS.en, dir);
      const orphans = new Map<string, string[]>();

      for (const file of fs.readdirSync(root).filter((f) => f.endsWith('.md'))) {
        const text = fs.readFileSync(path.join(root, file), 'utf-8');
        const frontmatter = text.split('---')[1] ?? '';
        for (const key of frontmatter.matchAll(/^([a-z_]+):/gm)) {
          const name = key[1]!;
          if (defined.has(name)) continue;
          orphans.set(name, [...(orphans.get(name) ?? []), file]);
        }
      }

      expect(
        [...orphans].map(([key, files]) => `${key} (in ${files.length} file(s), e.g. ${files[0]})`),
        `${CONTENT_DIRS.en}/${dir}: these keys are authored but dropped on load`
      ).toEqual([]);
    });
  }
});

const bundle = loadRegistryFromRoot(REPO_ROOT, 'en');
const uk = loadRegistryFromRoot(REPO_ROOT, 'uk');
const graph = new HOBAKnowledgeGraph(bundle);
const engine = new HOBADiagnosticEngine(bundle, graph);

describe('registry content', () => {
  it('loads with zero validation errors and meets the seed taxonomy targets (spec §24)', () => {
    const report = validateRegistry(bundle);
    expect(report.errors).toEqual([]);
    expect(bundle.barriers.length).toBeGreaterThanOrEqual(10);
    expect(bundle.mechanisms.length).toBeGreaterThanOrEqual(22);
    expect(bundle.observations.length).toBeGreaterThanOrEqual(12);
    expect(bundle.patterns.length).toBeGreaterThanOrEqual(4);
    expect(bundle.loops.length).toBeGreaterThanOrEqual(3);
    expect(bundle.interventions.length).toBeGreaterThanOrEqual(5);
  });

  it('preserves honest-baseline mechanisms including M-001', () => {
    const honest = bundle.mechanisms.filter((m) => m.honest_baseline);
    expect(honest.length).toBeGreaterThanOrEqual(1);
    expect(honest.some((m) => m.id === 'mech.genuine_technical_skill_shortfall')).toBe(true);
  });

  it('keeps the barrier funnel strictly acyclic', () => {
    const dag = graph.validateBarrierDAG();
    expect(dag.valid).toBe(true);
    expect(dag.sorted).toHaveLength(bundle.barriers.length);
  });

  it('has at least one declared mechanism cycle backing a loop', () => {
    const sccs = graph.findMechanismSCCs();
    expect(sccs.length).toBeGreaterThanOrEqual(1);
    expect(bundle.loops.some((l) => sccs.some((scc) => l.mechanisms.every((m) => scc.includes(m))))).toBe(true);
  });

  it('runs the protocol end-to-end for a reposted-role observation', () => {
    const result = engine.analyze({ artifacts: ['A-004'], stage: 'technical' });
    expect(result.mode).toBe('topological_uncalibrated');
    expect(result.hard_facts.selected_artifacts).toHaveLength(1);
    expect(result.hard_facts.unknown_artifact_ids).toEqual([]);
    expect(result.obstacle.identified_barriers.length).toBeGreaterThan(0);
    expect(result.behind.compatible_mechanisms.length).toBeGreaterThan(0);
    expect(result.agency.diagnostic_probes.length).toBeGreaterThan(0);
    expect(result.agency.agency_zone).not.toBe('undetermined');
  });

  it('produces well-formed Cytoscape, GraphML and CSV exports', () => {
    const cyto = graph.toCytoscapeJSON();
    expect(cyto.elements.nodes.length).toBeGreaterThan(0);
    const nodeIds = new Set(cyto.elements.nodes.map((n) => n.data.id));
    for (const e of cyto.elements.edges) {
      expect(nodeIds.has(e.data.source)).toBe(true);
      expect(nodeIds.has(e.data.target)).toBe(true);
    }
    expect(new Set(cyto.elements.edges.map((e) => e.data.id)).size).toBe(cyto.elements.edges.length);

    const graphml = graph.toGraphML();
    expect(graphml.startsWith('<?xml')).toBe(true);
    expect(graphml.trim().endsWith('</graphml>')).toBe(true);

    const { nodesCSV, edgesCSV } = graph.toCSV();
    const header = nodesCSV.split('\n')[0].split(',').length;
    for (const line of nodesCSV.trim().split('\n')) expect(line.split('","').length).toBe(header);
    expect(edgesCSV).toContain('"operates_at"');
  });

  it('keeps the Ukrainian mirror structurally identical to the canonical content', () => {
    const uk = loadRegistryFromRoot(REPO_ROOT, 'uk');
    expect(validateRegistry(uk).errors).toEqual([]);
    expect(compareBundleStructure(bundle, uk)).toEqual([]);
  });
});

describe('specimens', () => {
  const readerFacing = (b: typeof bundle) =>
    [...b.observations, ...b.barriers, ...b.mechanisms, ...b.patterns, ...b.loops, ...b.interventions];

  it('covers every entity in the registry, in both languages', () => {
    for (const b of [bundle, uk]) {
      const missing = readerFacing(b).filter((node) => node.specimens.length === 0);
      expect(missing.map((n) => n.id)).toEqual([]);
    }
  });

  it('keeps the two mirrors structurally identical', () => {
    const shape = (b: typeof bundle) =>
      readerFacing(b)
        .map((n) => `${n.id}:${n.specimens.map((s) => `${s.kind}/${s.lines.length}`).join(',')}`)
        .sort();
    expect(shape(uk)).toEqual(shape(bundle));
  });

  it('marks the line each specimen is about, and says what to notice', () => {
    for (const node of readerFacing(bundle)) {
      for (const specimen of node.specimens) {
        expect(specimen.lines.some((line) => line.tell), `${node.id} ${specimen.label}`).toBe(true);
        expect(specimen.reading, `${node.id} ${specimen.label}`).toBeTruthy();
      }
    }
  });

  it('names no real company or person', () => {
    // Specimens are composites. A named employer would turn the atlas into the
    // blacklist its own methodology says it must not be.
    const forbidden = /\b(Google|Meta|Amazon|Microsoft|Apple|Netflix|Uber|Stripe|Revolut|Monobank|PrivatBank|EPAM|SoftServe|Luxoft)\b/i;
    for (const b of [bundle, uk]) {
      for (const node of readerFacing(b)) {
        for (const specimen of node.specimens) {
          const text = [specimen.label, specimen.subject, specimen.context, specimen.reading, ...specimen.lines.map((l) => `${l.speaker ?? ''} ${l.text}`)].join(' ');
          expect(forbidden.test(text), `${node.id}: ${text.slice(0, 80)}`).toBe(false);
        }
      }
    }
  });
});

describe('actors', () => {
  it('resolves both actor vocabularies without gaps or collisions', () => {
    // `mechanism.facets.actor` and `intervention.actor` are separate enums that
    // both gesture at the same six parties. Actors declare which values resolve
    // to them; every value must be claimed exactly once or the join silently
    // drops entities.
    const facetOwners = new Map<string, string[]>();
    const interventionOwners = new Map<string, string[]>();
    for (const actor of bundle.actors) {
      for (const value of actor.aliases.facet) facetOwners.set(value, [...(facetOwners.get(value) ?? []), actor.id]);
      for (const value of actor.aliases.intervention) interventionOwners.set(value, [...(interventionOwners.get(value) ?? []), actor.id]);
    }

    const usedFacets = new Set(bundle.mechanisms.map((m) => m.facets.actor));
    const usedInterventions = new Set(bundle.interventions.map((i) => i.actor));

    expect([...usedFacets].filter((v) => !facetOwners.has(v))).toEqual([]);
    expect([...usedInterventions].filter((v) => !interventionOwners.has(v))).toEqual([]);
    expect([...facetOwners].filter(([, owners]) => owners.length > 1)).toEqual([]);
    expect([...interventionOwners].filter(([, owners]) => owners.length > 1)).toEqual([]);
  });

  it('states what each actor controls, cannot see, and is optimising for', () => {
    expect(bundle.actors.length).toBe(7);
    for (const actor of bundle.actors) {
      expect(actor.controls.length, actor.id).toBeGreaterThan(0);
      expect(actor.blind_to.length, actor.id).toBeGreaterThan(0);
      expect(actor.incentives.length, actor.id).toBeGreaterThan(0);
      expect(actor.specimens.length, actor.id).toBeGreaterThan(0);
    }
  });

  it('mirrors the actor set across both languages', () => {
    expect(uk.actors.map((a) => a.id)).toEqual(bundle.actors.map((a) => a.id));
  });
});

describe('processes', () => {
  const ids = new Set([
    ...bundle.observations.map((n) => n.id), ...bundle.barriers.map((n) => n.id),
    ...bundle.mechanisms.map((n) => n.id), ...bundle.patterns.map((n) => n.id),
    ...bundle.loops.map((n) => n.id), ...bundle.interventions.map((n) => n.id),
  ]);
  const actorIds = new Set(bundle.actors.map((a) => a.id));

  it('has exactly one initial state and at least one terminal state', () => {
    for (const wf of bundle.processes) {
      expect(wf.states.filter((s) => s.kind === 'initial').length, wf.id).toBe(1);
      expect(wf.states.filter((s) => s.kind === 'terminal').length, wf.id).toBeGreaterThan(0);
    }
  });

  it('never transitions to or from a state that does not exist', () => {
    for (const wf of bundle.processes) {
      const states = new Set(wf.states.map((s) => s.id));
      for (const t of wf.transitions) {
        expect(states.has(t.from), `${wf.id}: ${t.from} -> ${t.to}`).toBe(true);
        expect(states.has(t.to), `${wf.id}: ${t.from} -> ${t.to}`).toBe(true);
      }
    }
  });

  it('reaches every state from the initial one, and every terminal state', () => {
    for (const wf of bundle.processes) {
      const out = new Map<string, string[]>();
      for (const t of wf.transitions) out.set(t.from, [...(out.get(t.from) ?? []), t.to]);
      const start = wf.states.find((s) => s.kind === 'initial')!;
      const seen = new Set([start.id]);
      const queue = [start.id];
      while (queue.length) for (const next of out.get(queue.shift()!) ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
      const unreachable = wf.states.filter((s) => !seen.has(s.id)).map((s) => s.id);
      expect(unreachable, wf.id).toEqual([]);
    }
  });

  it('leaves no active state without a way out', () => {
    for (const wf of bundle.processes) {
      const hasExit = new Set(wf.transitions.map((t) => t.from));
      const stuck = wf.states.filter((s) => s.kind !== 'terminal' && !hasExit.has(s.id)).map((s) => s.id);
      expect(stuck, wf.id).toEqual([]);
    }
  });

  it('names a real actor and real entities everywhere', () => {
    for (const wf of bundle.processes) {
      for (const s of wf.states) {
        expect(actorIds.has(s.owner), `${wf.id}/${s.id}`).toBe(true);
        expect(s.entities.filter((e) => !ids.has(e)), `${wf.id}/${s.id}`).toEqual([]);
      }
      for (const t of wf.transitions) {
        expect(actorIds.has(t.owner), `${wf.id}: ${t.from} -> ${t.to}`).toBe(true);
        expect(t.entities.filter((e) => !ids.has(e)), `${wf.id}: ${t.from} -> ${t.to}`).toEqual([]);
      }
    }
  });

  it('keeps the two mirrors identical in shape', () => {
    const shape = (b: typeof bundle) =>
      b.processes.map((w) => `${w.id}:${w.states.map((s) => s.id).join('|')}:${w.transitions.map((t) => `${t.from}>${t.to}`).join('|')}`);
    expect(shape(uk)).toEqual(shape(bundle));
  });

  it('names a real entity in every deviation', () => {
    for (const wf of bundle.processes) {
      for (const s of wf.states) {
        expect(s.deviations.filter((e) => !ids.has(e)), `${wf.id}/${s.id}`).toEqual([]);
      }
    }
  });
});

/**
 * Every entry repeats part of its own frontmatter in its Markdown body, so the
 * file reads on GitHub. Nothing renders that copy — the site, the exports and
 * the CLI all read the frontmatter — which means it can drift silently, and it
 * did: rewriting `expected_effects` left the old wording sitting in the bodies,
 * promises and all, where no test was looking.
 */
describe('body and frontmatter agree', () => {
  const everything = (b: typeof bundle) => [
    ...b.observations, ...b.barriers, ...b.mechanisms,
    ...b.patterns, ...b.loops, ...b.interventions,
  ];

  /** Every string anywhere in the entry, which is what the body may quote. */
  const strings = (node: unknown, into: string[] = []): string[] => {
    if (typeof node === 'string') into.push(node);
    else if (Array.isArray(node)) for (const v of node) strings(v, into);
    else if (node && typeof node === 'object') {
      for (const [key, v] of Object.entries(node)) if (key !== 'content') strings(v, into);
    }
    return into;
  };

  it('never leaves a bullet in the body that the frontmatter no longer says', () => {
    const drifted: string[] = [];
    for (const b of [bundle, uk]) {
      for (const node of everything(b)) {
        const pool = strings(node).join('\n');
        for (const raw of (node.content ?? '').split('\n')) {
          const line = raw.trim();
          if (!line.startsWith('- ')) continue;
          // A line carrying a backticked id is a cross-reference — it quotes
          // another entry's title, which this entry's frontmatter holds only as
          // an id. What must agree is the prose an entry repeats about itself.
          if (/`([A-Z]+-\d+|[a-z0-9_.-]+)`/.test(line)) continue;
          const text = line.slice(2).replace(/^\*\*[^*]+\*\*:?\s*/, '').trim();
          if (text.length < 20 || /^`[^`]+`$/.test(text)) continue;
          if (!pool.includes(text)) drifted.push(`${node.id}: ${text.slice(0, 70)}`);
        }
      }
    }
    expect(drifted).toEqual([]);
  });
});

/**
 * An intervention proposes a change; it does not promise a result.
 *
 * The entries used to say "Eliminate formatting-induced silent parsing
 * failures" while the same entry's own recruiter perspective said the change
 * removes one of two indistinguishable cases and not the other. A promise the
 * entry itself contradicts is the false certainty the methodology exists to
 * forbid, so the shape of an effect is asserted rather than trusted.
 */
describe('intervention effects', () => {
  // Verbs that assert a total outcome nobody can verify, and nouns for states
  // of mind the atlas cannot observe from outside the system.
  const PROMISES =
    /\b(eliminat\w*|prevent\w*|ensur\w*|guarantee\w*|усува\w*|усунення|унеможлив\w*|гаранту\w*|запобіга\w*)\b/i;
  const FEELINGS = /\b(confidence|trust|satisfaction|fatigue|respect|впевненіст\w*|довір\w*|задоволен\w*|втом\w*)\b/i;

  it('states what changes, never what is promised', () => {
    for (const b of [bundle, uk]) {
      for (const intervention of b.interventions) {
        for (const effect of intervention.expected_effects) {
          expect(PROMISES.test(effect), `${intervention.id}: ${effect}`).toBe(false);
        }
      }
    }
  });

  it('never claims a state of mind it cannot observe', () => {
    for (const b of [bundle, uk]) {
      for (const intervention of b.interventions) {
        for (const effect of intervention.expected_effects) {
          expect(FEELINGS.test(effect), `${intervention.id}: ${effect}`).toBe(false);
        }
        // A metric is a claim about what can be counted, so the same rule holds:
        // `candidate_pipeline_satisfaction` was one an employer cannot compute.
        for (const metric of intervention.measurements) {
          expect(FEELINGS.test(metric), `${intervention.id}: ${metric}`).toBe(false);
        }
      }
    }
  });

  it('says which entry stops operating, for most of them', () => {
    // Not every effect can name an id, but an intervention whose effects name
    // none of its own targets is describing something other than its targets.
    const vague = bundle.interventions.filter(
      (i) => !i.expected_effects.some((e) => i.targets.some((t) => e.includes(t)))
    );
    expect(vague.map((i) => i.id)).toEqual([]);
  });
});

/**
 * Probes are the only thing in the atlas that claims to *settle* anything, so
 * the bar is the highest in the repository: an outcome may rule a mechanism out
 * only when the two cannot both be true, and it has to say why.
 */
describe('probe outcomes', () => {
  const probes = bundle.observations.flatMap((a) => a.probes);
  const ukProbes = uk.observations.flatMap((a) => a.probes);
  const mechanismIds = new Set(bundle.mechanisms.map((m) => m.id));

  it('gives every probe outcomes a candidate could tell apart', () => {
    for (const probe of probes) {
      expect(probe.outcomes.length, probe.id).toBeGreaterThan(1);
      const slugs = probe.outcomes.map((o) => o.id);
      expect(new Set(slugs).size, probe.id).toBe(slugs.length);
      for (const o of probe.outcomes) expect(o.label.length, `${probe.id}/${o.id}`).toBeGreaterThan(20);
    }
  });

  it('never rules out something that is not a mechanism, and never without a reason', () => {
    for (const probe of probes) {
      for (const o of probe.outcomes) {
        expect(o.excludes.filter((m) => !mechanismIds.has(m)), `${probe.id}/${o.id}`).toEqual([]);
        if (o.excludes.length > 0) expect(o.because.trim().length, `${probe.id}/${o.id}`).toBeGreaterThan(19);
      }
    }
  });

  it('mirrors the same outcomes into Ukrainian, and translates them', () => {
    const shape = (list: typeof probes) =>
      list.map((p) => `${p.id}:${p.outcomes.map((o) => `${o.id}[${o.excludes.join('|')}]`).join(',')}`);
    expect(shape(ukProbes)).toEqual(shape(probes));

    const byId = new Map(ukProbes.map((p) => [p.id, p]));
    for (const probe of probes) {
      probe.outcomes.forEach((o, i) => {
        expect(byId.get(probe.id)!.outcomes[i]!.label, `${probe.id}/${o.id} was not translated`).not.toBe(o.label);
      });
    }
  });
});

/**
 * The lens is only worth having if every seat it offers is honest: a
 * perspective attributed to an actor who cannot see the entry would be an
 * invention, and a recommendation aimed at an actor who does not control the
 * decision would be a wish.
 */
describe('perspectives', () => {
  const actorIds = new Set(bundle.actors.map((a) => a.id));
  const readerFacingEntities = [
    ...bundle.observations, ...bundle.barriers, ...bundle.mechanisms,
    ...bundle.patterns, ...bundle.loops, ...bundle.interventions,
  ];
  const ukEntities = [
    ...uk.observations, ...uk.barriers, ...uk.mechanisms,
    ...uk.patterns, ...uk.loops, ...uk.interventions,
  ];

  it('names a real actor, once each', () => {
    for (const node of readerFacingEntities) {
      const actors = node.perspectives.map((p) => p.actor);
      expect(actors.filter((a) => !actorIds.has(a)), node.id).toEqual([]);
      expect(new Set(actors).size, `${node.id} gives one actor two perspectives`).toBe(actors.length);
    }
  });

  it('gives every barrier and mechanism at least two points of view', () => {
    // These are the entries a reader arrives at from a search result, and the
    // ones where "it looked reasonable from here" is the whole argument.
    const thin = [...bundle.barriers, ...bundle.mechanisms]
      .filter((n) => n.perspectives.length < 2)
      .map((n) => `${n.id} (${n.perspectives.length})`);
    expect(thin).toEqual([]);
  });

  it('never puts a perspective in a seat the actor cannot see from', () => {
    // A perspective whose actor is the entry's own facet actor is always fair.
    // What this catches is the reverse: a perspective and no actor at all.
    for (const node of readerFacingEntities) {
      for (const p of node.perspectives) {
        expect(p.sees.length, `${node.id}/${p.actor}`).toBeGreaterThan(19);
        expect(p.reads.length, `${node.id}/${p.actor}`).toBeGreaterThan(19);
        expect(p.does.length, `${node.id}/${p.actor}`).toBeGreaterThan(19);
      }
    }
  });

  it('mirrors the same seats into Ukrainian, and translates them', () => {
    const shape = (nodes: typeof readerFacingEntities) =>
      nodes.map((n) => `${n.id}:${n.perspectives.map((p) => p.actor).join(',')}`);
    expect(shape(ukEntities)).toEqual(shape(readerFacingEntities));

    // A mirror that copied the English through would pass the shape check.
    const byId = new Map(ukEntities.map((n) => [n.id, n]));
    for (const node of readerFacingEntities) {
      const mirrored = byId.get(node.id)!;
      node.perspectives.forEach((p, i) => {
        expect(mirrored.perspectives[i]!.sees, `${node.id}/${p.actor} was not translated`).not.toBe(p.sees);
      });
    }
  });
});

describe('recommendations', () => {
  const ids = new Set([
    ...bundle.observations.map((n) => n.id), ...bundle.barriers.map((n) => n.id),
    ...bundle.mechanisms.map((n) => n.id), ...bundle.patterns.map((n) => n.id),
    ...bundle.loops.map((n) => n.id), ...bundle.interventions.map((n) => n.id),
  ]);
  const interventionIds = new Set(bundle.interventions.map((i) => i.id));

  it('gives every actor something it can actually do', () => {
    for (const actor of bundle.actors) {
      expect(actor.recommendations.length, actor.id).toBeGreaterThan(2);
    }
  });

  it('keeps recommendation ids unique inside an actor', () => {
    for (const actor of bundle.actors) {
      const slugs = actor.recommendations.map((r) => r.id);
      expect(new Set(slugs).size, actor.id).toBe(slugs.length);
    }
  });

  it('resolves every entry and intervention it cites', () => {
    for (const actor of bundle.actors) {
      for (const rec of actor.recommendations) {
        expect(rec.targets.filter((t) => !ids.has(t)), `${actor.id}/${rec.id}`).toEqual([]);
        expect(rec.interventions.filter((i) => !interventionIds.has(i)), `${actor.id}/${rec.id}`).toEqual([]);
      }
    }
  });

  it('states what each one costs the actor who does it', () => {
    // A recommendation with no stated cost reads as free, and none are free.
    for (const actor of bundle.actors) {
      for (const rec of actor.recommendations) {
        expect(rec.costs.length, `${actor.id}/${rec.id}`).toBeGreaterThan(9);
      }
    }
  });

  it('mirrors the same set into Ukrainian, and translates it', () => {
    const shape = (b: typeof bundle) => b.actors.map((a) => `${a.id}:${a.recommendations.map((r) => r.id).join(',')}`);
    expect(shape(uk)).toEqual(shape(bundle));
    const byId = new Map(uk.actors.map((a) => [a.id, a]));
    for (const actor of bundle.actors) {
      actor.recommendations.forEach((rec, i) => {
        expect(byId.get(actor.id)!.recommendations[i]!.title, `${actor.id}/${rec.id} was not translated`).not.toBe(rec.title);
      });
    }
  });
});

/**
 * Eras are the atlas's only claims about the world outside the funnel, so they
 * carry the strictest rule in the repository: no figure without a source.
 */
describe('eras', () => {
  const ids = new Set([
    ...bundle.observations.map((n) => n.id), ...bundle.barriers.map((n) => n.id),
    ...bundle.mechanisms.map((n) => n.id), ...bundle.patterns.map((n) => n.id),
    ...bundle.loops.map((n) => n.id), ...bundle.interventions.map((n) => n.id),
  ]);
  const evidenceIds = new Set(bundle.evidence.map((e) => e.id));

  it('sources every figure it prints', () => {
    for (const era of bundle.eras) {
      expect(era.indicators.length, era.id).toBeGreaterThan(0);
      for (const indicator of era.indicators) {
        expect(evidenceIds.has(indicator.evidence), `${era.id}: ${indicator.label}`).toBe(true);
      }
    }
  });

  it('gives every cited source a URL a reader can open', () => {
    const cited = new Set(bundle.eras.flatMap((e) => e.indicators.map((i) => i.evidence)));
    for (const record of bundle.evidence.filter((e) => cited.has(e.id))) {
      expect(record.url, record.id).toMatch(/^https:\/\//);
      expect(record.citation, record.id).toBeTruthy();
    }
  });

  it('names real registry entities', () => {
    for (const era of bundle.eras) {
      expect(era.entities.filter((e) => !ids.has(e)), era.id).toEqual([]);
    }
  });

  it('runs as one continuous timeline with no gap and no overlap', () => {
    const ordered = [...bundle.eras].sort((a, b) => a.from - b.from);
    for (const era of ordered) expect(era.to, era.id).toBeGreaterThanOrEqual(era.from);
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i]!.from, `${ordered[i - 1]!.id} → ${ordered[i]!.id}`).toBe(ordered[i - 1]!.to + 1);
    }
  });

  it('leaves exactly one era open-ended', () => {
    // An era with no `ended_by` is the one we are inside. Two would be a
    // contradiction, none would mean the page stops before the present.
    const open = bundle.eras.filter((e) => !e.ended_by);
    expect(open.map((e) => e.id)).toHaveLength(1);
  });

  it('mirrors every figure and source into Ukrainian unchanged', () => {
    const shape = (b: typeof bundle) =>
      b.eras.map((e) => `${e.id}:${e.from}-${e.to}:${e.indicators.map((i) => i.evidence).join(',')}:${e.entities.join(',')}`);
    expect(shape(uk)).toEqual(shape(bundle));
  });
});

/**
 * The canonical path is what the rest of the registry is measured against, so the
 * relationship has to hold both ways: no barrier may be missing from it, and
 * none may claim two different commitments as the one it breaks.
 */
describe('the canonical path', () => {
  const ideal = bundle.processes.find((w) => w.id === 'proc.the_path_as_it_is_supposed_to_run')!;
  const homes = (id: string) => ideal.states.filter((s) => s.deviations.includes(id)).map((s) => s.id);

  it('exists, and is the one workflow written as commitments', () => {
    expect(ideal, 'proc.the_path_as_it_is_supposed_to_run is missing').toBeDefined();
    expect(ideal.states.some((s) => s.deviations.length > 0)).toBe(true);
  });

  it('gives every barrier exactly one commitment it breaks', () => {
    const misplaced = bundle.barriers.map((b) => [b.id, homes(b.id)] as const).filter(([, at]) => at.length !== 1);
    expect(misplaced).toEqual([]);
  });

  it('places every mechanism somewhere on the path', () => {
    const orphans = bundle.mechanisms.filter((m) => homes(m.id).length === 0).map((m) => m.id);
    expect(orphans).toEqual([]);
  });

  it('treats a decline and a closed search as endings, not deviations', () => {
    // The point of the path: most candidates are declined and some searches
    // stop. What makes those part of it is that they are communicated.
    const terminal = ideal.states.filter((s) => s.kind === 'terminal').map((s) => s.id);
    expect(terminal).toContain('declined');
    expect(terminal).toContain('closed');
    expect(terminal).toContain('hired');
    for (const id of ['declined', 'closed']) {
      const state = ideal.states.find((s) => s.id === id)!;
      expect(state.visible_to_candidate, id).toBeTruthy();
    }
  });

  it('mirrors every deviation list into Ukrainian unchanged', () => {
    const ukIdeal = uk.processes.find((w) => w.id === 'proc.the_path_as_it_is_supposed_to_run')!;
    const shape = (w: typeof ideal) => w.states.map((s) => `${s.id}:${s.deviations.join(',')}:${s.entities.join(',')}`);
    expect(shape(ukIdeal)).toEqual(shape(ideal));
  });
});
