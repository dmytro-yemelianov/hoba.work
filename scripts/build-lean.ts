/**
 * The registry as Lean terms.
 *
 * Names become indices on the way out, so every proposition in `formal/` is
 * arithmetic over finite lists and the kernel can discharge it with `decide` —
 * no `native_decide`, no compiler in the trusted base, no mathlib.
 *
 * `rank` is a longest-path layering. For a DAG it climbs along every edge,
 * which is what `Forward` asserts and what the acyclicity and route-length
 * theorems are proved from. For a machine with a cycle no such layering exists,
 * the generator emits its best attempt, and `Forward` is then provably false —
 * which is the point: WF-001 has a back edge and WF-003 does not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { findRegistryRoot, loadRegistryFromRoot, lift, type RegistryBundle, type WorkflowNode } from '@hoba/registry';

const root = findRegistryRoot(process.cwd());
if (!root) throw new Error('build-lean: registry root not found');
const OUT = path.join(root, 'formal', 'Hoba', 'Data.lean');

const bundle: RegistryBundle = loadRegistryFromRoot(root, 'en');

/** One index space for every entity a state can point at. */
const entityIds = [
  ...bundle.artifacts, ...bundle.barriers, ...bundle.mechanisms,
  ...bundle.patterns, ...bundle.loops, ...bundle.interventions,
].map((n) => n.id).sort();
const entityIndex = new Map(entityIds.map((id, i) => [id, i] as const));

const KIND: Record<string, string> = { initial: 'Kind.initial', active: 'Kind.active', terminal: 'Kind.terminal' };

interface Emitted {
  n: number;
  kinds: string[];
  deviations: number[][];
  edges: [number, number][];
  rank: number[];
  names: string[];
}

/** Longest path from the sources; for a DAG this climbs along every edge. */
function layer(n: number, edges: [number, number][]): number[] {
  const rank = new Array<number>(n).fill(0);
  // Relaxation, bounded by n so a cycle cannot spin. A cycle leaves at least
  // one edge unrelaxed, which is exactly what `Forward` then reports.
  for (let pass = 0; pass < n; pass++) {
    let moved = false;
    for (const [from, to] of edges) {
      if (rank[to]! <= rank[from]!) {
        rank[to] = rank[from]! + 1;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return rank;
}

function machineFromWorkflow(workflow: WorkflowNode): Emitted {
  // The initial state is index 0, so `AllReachable m 0` is the statement it
  // looks like: everything is reachable from where the machine starts.
  const states = [...workflow.states].sort(
    (a, b) => Number(b.kind === 'initial') - Number(a.kind === 'initial')
  );
  const index = new Map(states.map((s, i) => [s.id, i] as const));
  const edges: [number, number][] = workflow.transitions.map((t) => [index.get(t.from)!, index.get(t.to)!]);
  return {
    n: states.length,
    kinds: states.map((s) => KIND[s.kind]!),
    deviations: states.map((s) => s.deviations.map((d) => entityIndex.get(d)).filter((i): i is number => i !== undefined)),
    edges,
    rank: layer(states.length, edges),
    names: states.map((s) => s.id),
  };
}

/** The barrier DAG as a machine: gates, `precedes` edges, sinks as terminals. */
function machineFromBarriers(): Emitted {
  const barriers = [...bundle.barriers].sort((a, b) => a.order - b.order);
  const index = new Map(barriers.map((b, i) => [b.id, i] as const));
  const edges: [number, number][] = [];
  for (const b of barriers) for (const next of b.precedes) edges.push([index.get(b.id)!, index.get(next)!]);
  const hasExit = new Set(edges.map(([from]) => from));
  return {
    n: barriers.length,
    kinds: barriers.map((_barrier, i) => (hasExit.has(i) ? (i === 0 ? KIND.initial! : KIND.active!) : KIND.terminal!)),
    deviations: barriers.map(() => []),
    edges,
    rank: layer(barriers.length, edges),
    names: barriers.map((b) => b.id),
  };
}

/**
 * The shortest closed walk, if the machine has one.
 *
 * Breadth-first rather than depth-first on purpose: the exhibited cycle ends up
 * in a theorem someone reads, and the tight one says what the long one says
 * with four states instead of eleven.
 */
function findCycle(m: Emitted): { start: number; tail: number[] } | undefined {
  const out = new Map<number, number[]>();
  for (const [from, to] of m.edges) out.set(from, [...(out.get(from) ?? []), to]);
  let best: { start: number; tail: number[] } | undefined;
  for (let start = 0; start < m.n; start++) {
    const queue: number[][] = [[start]];
    const seen = new Set<number>([start]);
    while (queue.length) {
      const route = queue.shift()!;
      const at = route[route.length - 1]!;
      for (const next of out.get(at) ?? []) {
        if (next === start) {
          const tail = route.slice(1);
          if (!best || tail.length < best.tail.length) best = { start, tail };
          queue.length = 0;
          break;
        }
        if (seen.has(next)) continue;
        seen.add(next);
        queue.push([...route, next]);
      }
    }
  }
  return best;
}

const list = (values: (string | number)[]) => `[${values.join(', ')}]`;
const pairs = (values: [number, number][]) => `[${values.map(([a, b]) => `(${a}, ${b})`).join(', ')}]`;
const nested = (values: number[][]) => `[${values.map((v) => list(v)).join(', ')}]`;

function emit(name: string, m: Emitted, comment: string): string[] {
  return [
    `/-- ${comment} -/`,
    `def ${name} : Machine where`,
    `  n := ${m.n}`,
    `  kind := ${list(m.kinds)}`,
    `  deviations := ${nested(m.deviations)}`,
    `  edges := ${pairs(m.edges)}`,
    `  rank := ${list(m.rank)}`,
    '',
    `/-- State names for \`${name}\`, in index order. -/`,
    `def ${name}Names : List String := ${list(m.names.map((s) => JSON.stringify(s)))}`,
    '',
  ];
}

const ideal = bundle.workflows.find((w) => w.id === 'WF-003');
const observed = bundle.workflows.find((w) => w.id === 'WF-001');
if (!ideal || !observed) throw new Error('build-lean: WF-003 and WF-001 are both required');

const idealM = machineFromWorkflow(ideal);
const observedM = machineFromWorkflow(observed);
const gatesM = machineFromBarriers();
const cycle = findCycle(observedM);
if (!cycle) throw new Error('build-lean: WF-001 is expected to contain a back edge; none was found');

const barrierIdx = bundle.barriers.map((b) => entityIndex.get(b.id)!).sort((a, b) => a - b);
const mechanismIdx = bundle.mechanisms.map((m) => entityIndex.get(m.id)!).sort((a, b) => a - b);

const lifted = lift(bundle);
const substrate = lifted.substrate;
const substrateBarrierConditions = substrate.conditions.filter((c) => c.id.startsWith('cnd:b-'));
const substrateMechanismConditions = substrate.conditions.filter((c) => c.id.startsWith('cnd:m-'));

const out: string[] = [
  '/-',
  '  Generated by `scripts/build-lean.ts` from the registry. Do not edit.',
  `  Registry ${bundle.version}, schema ${bundle.schema_version}.`,
  '-/',
  'import Hoba.Machine',
  '',
  'namespace Hoba',
  '',
  ...emit('ideal', idealM, 'WF-003, the canonical path: the process as the commitments it is supposed to keep.'),
  ...emit('observed', observedM, 'WF-001, the funnel as it actually runs.'),
  ...emit('gates', gatesM, 'The barrier DAG, ordered by funnel position.'),
  '/-- Every entity a state can name, in index order. -/',
  `def entityNames : List String := ${list(entityIds.map((id) => JSON.stringify(id)))}`,
  '',
  '/-- The barriers, as indices into `entityNames`. -/',
  `def barrierIds : List Nat := ${list(barrierIdx)}`,
  '',
  '/-- The mechanisms, as indices into `entityNames`. -/',
  `def mechanismIds : List Nat := ${list(mechanismIdx)}`,
  '',
  '/-- A closed walk found in the observed funnel: out of this state, and back. -/',
  `def observedCycleStart : Nat := ${cycle.start}`,
  `def observedCycleTail : List Nat := ${list(cycle.tail)}`,
  '',
  '/-- Substrate summary: conditions, processes, records, and event classes. -/',
  'def substrateSummary : SubstrateSummary where',
  `  conditionCount := ${substrate.conditions.length}`,
  `  processCount := ${substrate.processes.length}`,
  `  recordCount := ${substrate.records.length}`,
  `  flowCount := ${substrate.flows.length}`,
  `  barrierConditionCount := ${substrateBarrierConditions.length}`,
  `  mechanismConditionCount := ${substrateMechanismConditions.length}`,
  `  eventClassCount := ${substrate.eventClasses.length}`,
  '',
  'end Hoba',
  '',
];

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.join('\n'));
process.stdout.write(
  `lean: ${path.relative(root, OUT)} — ideal ${idealM.n} states/${idealM.edges.length} edges, ` +
    `observed ${observedM.n}/${observedM.edges.length}, gates ${gatesM.n}/${gatesM.edges.length}, ` +
    `cycle at ${observedM.names[cycle.start]} via ${cycle.tail.map((i) => observedM.names[i]).join(' → ')}\n`
);
