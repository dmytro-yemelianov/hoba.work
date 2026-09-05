# Case-space lift

**Status:** decided and enforced as a first executable lower bound.

## Model

A hiring case is not an authored story. It is a partial or total assignment in
the product space declared by `packages/registry-core/src/case-space.ts`.
Authored prose, examples, scenarios, and pages render over that mathematical
object; they do not define the denominator.

The current lift is:

```text
L₀ : structured corpus object -> partial case-space fibre
```

`L₀` reads only structured fields. It does not classify prose, infer motives, or
invent missing coordinates. If a coordinate is absent from the lift, the claim is
"not machine-authored yet", not "impossible".

```text
author YAML/MD
  -> validated entity/scenario objects
  -> deterministic lift rules
  -> partial assignments
  -> Γ admissibility
  -> coverage/skew metrics
```

## Published artifacts

- `/data/latest/coverage.json` contains the checklist-era coverage boundary, the
  case-space denominator, compact lift summary, and compact acquisition backlog.
- `/data/latest/case-lift.json` contains the full per-source assignments and
  rule trace.
- `/data/latest/coverage-backlog.json` contains the generated acquisition
  backlog: absent/thin coordinate dimensions, missing values, reviewed scenario
  unknowns, and strategically important pairwise skews.

Release snapshots live under `/data/releases/<registry-version>/` with the same
filenames.

## Current lower bound

The first executable lift intentionally exposes how little of the case-space is
yet encoded as structured coordinates:

| Metric | Value |
| --- | ---: |
| Lifted sources | 119 |
| Γ-refuted lifted fibres | 0 |
| Coordinates touched | 14 / 71 |
| 1-wise slots touched | 52 / 261 |
| Observed 2-wise slots | 332 |
| Acquisition backlog | 23 absent coordinate dimensions, 6 thin dimensions |
| Strategic pairwise targets | 9 |

Strong axes: evidence level, funnel stage, party, candidate visibility, block
nature. Weak or absent axes: worksite, military status, population affected,
funding source/state, requisition state, entry path, arrangement, domain,
latitudes, memory, jurisdiction, and outcome.

## Interpretation

The historical `data/coverage/model.json` remains useful as an editorial
checklist. It says which situations reviewers believe are covered, partial, or
absent. The lift answers a different question: which case coordinates are
machine-readable from the corpus today.

Both are required until prose is lifted into structured assignments:

- checklist high, lift low: prose or reviewer judgement exists, but no structured
  coordinate yet;
- checklist low, lift low: true acquisition gap;
- checklist low, lift high: the checklist is stale;
- checklist high, lift high: durable covered region.

## Next cuts

1. Add authored case-assignment overlays for scenarios first. Scenarios are
   already fibres and should become the review surface for partial coordinates.
2. Add a jurisdiction-regime registry for military/work-eligibility constraints.
3. Add a statement-record layer so `statement.fidelity = void` can be checked
   against actual statement absence.
4. Lift mechanisms from obsolete facets into first-class coordinates only after
   the scenario pilot proves the vocabulary.
