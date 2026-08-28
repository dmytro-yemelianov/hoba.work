# formal

The registry's structural claims, checked by the Lean kernel.

```
lake build          # proves everything against the current registry
pnpm build:lean     # regenerates Hoba/Data.lean from content/
```

`Hoba/Machine.lean` is written by hand: a workflow as indices, the properties as
decidable predicates, and three theorems that hold for any machine — a forward
machine has no cycles, a chain climbs, and a route is no longer than the rank it
ends on.

`Hoba/Data.lean` is generated from the registry by `scripts/build-lean.ts`.
Names become indices on the way out, so every proposition is arithmetic over
finite lists and `decide` discharges it **in the kernel**. There is no
`native_decide` here and no mathlib: `#print axioms` on every theorem returns
nothing beyond `propext` and `Quot.sound`.

`Hoba/Theorems.lean` applies the general results to the actual data. It is the
difference between the vitest suite, which samples these properties on whatever
is in `content/` today, and a proof that fails to compile if the registry stops
satisfying them.

## What is proved

- **WF-003 is well-formed**, starts in exactly one place, ends in exactly three,
  leaves no non-terminal state without an exit, and reaches every state from the
  start.
- **WF-003 is acyclic**, because every edge climbs its rank — and therefore no
  route through it is longer than twelve steps.
- **Every barrier departs from exactly one commitment** on that path, and every
  mechanism from at least one. Not "at least one" for barriers: two would mean
  the path stated the same obligation twice, none would mean the registry
  documents a gate the path never promises anything about.
- **WF-001 returns.** No rank assignment makes it climb, and there is a closed
  walk of four edges out of `published` and back. The edge that closes it is
  `rejected → published` — `pat.closed_then_reposted_requisition_motif`, which
  the registry already documents as a pattern.
- **The barrier DAG is acyclic.**

The pair worth reading together is `ideal_terminates_observed_need_not`: the
path the process is supposed to follow terminates, the process as observed need
not, and the single structural difference between them is an edge that already
has a name in the registry.
