/**
 * The projection: substrate plus sidecar, back into the authored bundle.
 *
 * The inverse of lift.ts, and the other half of the equivalence gate. Where
 * the substrate is authoritative — titles, barrier pass-conditions, mechanism
 * operates_at and emission order — the values here come from substrate
 * objects; the sidecar supplies everything it kept. Any drift between the two
 * representations surfaces as a deep-equality failure in the gate test.
 */
import type { RegistryBundle } from '@hoba/registry-core/types';
import type { Lifted } from './lift.js';

const up = (suffix: string) => suffix.toUpperCase();

export function project({ substrate, sidecar }: Lifted): RegistryBundle {
  const conditionById = new Map(substrate.conditions.map((c) => [c.id, c]));
  const eventById = new Map(substrate.eventClasses.map((e) => [e.id, e]));
  const recordById = new Map(substrate.records.map((r) => [r.id, r]));

  const publicOf = (substrateId: string) => {
    const raw = substrateId.split(':')[1]!;
    return /^[a-z]+-\d+$/i.test(raw) ? up(raw) : raw;
  };

  const flatTitle = (recId: string) => recordById.get(recId)!.title;

  const collect = <T>(collection: string, build: (id: string) => T): T[] =>
    (sidecar.order[collection] ?? []).map(build);

  const actors = collect('actors', (id) => ({
    ...sidecar.entities[id]!,
    title: flatTitle(`rec:${id.toLowerCase()}`),
  }));
  const eras = collect('eras', (id) => ({ ...sidecar.entities[id]!, title: flatTitle(`rec:${id.toLowerCase()}`) }));
  const evidence = collect('evidence', (id) => ({ ...sidecar.entities[id]!, title: flatTitle(`rec:${id.toLowerCase()}`) }));
  const interventions = collect('interventions', (id) => ({ ...sidecar.entities[id]!, title: flatTitle(`rec:${id.toLowerCase()}`) }));
  const patterns = collect('patterns', (id) => ({ ...sidecar.entities[id]!, title: flatTitle(`rec:${id.toLowerCase()}`) }));
  const loops = collect('loops', (id) => ({ ...sidecar.entities[id]!, title: flatTitle(`rec:${id.toLowerCase()}`) }));

  const observations = collect('observations', (id) => ({
    ...sidecar.entities[id]!,
    title: eventById.get(`evc:${id.toLowerCase()}`)!.title,
  }));

  const barriers = collect('barriers', (id) => {
    const c = conditionById.get(`cnd:${id.toLowerCase()}`)!;
    return { ...sidecar.entities[id]!, title: c.title, pass_condition: c.text };
  });

  const mechanisms = collect('mechanisms', (id) => {
    const c = conditionById.get(`cnd:${id.toLowerCase()}`)!;
    const meta = sidecar.emissionMeta[id]!;
    return {
      ...sidecar.entities[id]!,
      title: c.title,
      operates_at: c.accounts_for.map(publicOf),
      emissions: c.causes.map((evc, i) => ({ artifact: publicOf(evc), ...meta[i]! })),
    };
  });

  const processes = collect('processes', (id) => {
    const stateRest = (sidecar.entities[`${id}#states`]! as { states: Record<string, unknown>[] }).states;
    const transRest = (sidecar.entities[`${id}#transitions`]! as { transitions: Record<string, unknown>[] }).transitions;
    const states = stateRest.map((rest) => ({
      ...rest,
      title: eventById.get(`evc:${id.toLowerCase()}.${rest.id as string}`)!.title,
    }));
    return { ...sidecar.entities[id]!, title: recordTitleOrProcess(id), states, transitions: transRest };
  });

  function recordTitleOrProcess(workflowId: string): string {
    return substrate.processes.find((p) => p.id === `prc:${workflowId.toLowerCase()}`)!.title;
  }

  const records = collect('records', (id) => ({
    ...sidecar.entities[id]!,
    title: flatTitle(`rec:${id.toLowerCase()}`),
  }));

  return {
    version: sidecar.bundle.version,
    schema_version: sidecar.bundle.schema_version,
    updated_at: sidecar.bundle.updated_at,
    actors,
    processes,
    eras,
    observations,
    barriers,
    mechanisms,
    patterns,
    loops,
    interventions,
    evidence,
    records,
  } as unknown as RegistryBundle;
}
