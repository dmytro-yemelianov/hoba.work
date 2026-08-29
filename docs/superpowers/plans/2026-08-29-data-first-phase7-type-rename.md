# Data-First Architecture — Phase 7: Type Rename (`artifact` → `observation`, `workflow` → `process`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the live model call two of its eleven kinds what the target contract calls them. `schema/entity.schema.json` enumerates `observation` and `process`; the code says `artifact` and `workflow`. The dotted IDs already say `obs.` and `proc.`, which is the strongest evidence this rename was always intended and was simply never done.

**Owner's go-ahead this session**, having been told it moves public URLs.

---

## 1. What is in scope, and why that boundary

The contracts define only the fields **every** kind shares — `id`, `type`, `title`,
`status`, `aliases`, `evidence_level`, `evidence_ids`, `agency_zones`, `superseded_by`,
`deprecated`. Per-type fields stay owned by their own schema, which the Phase 1 plan says
in as many words: duplicating them into the common contract would violate the
no-duplication rule.

So the rename is **the type name and everything derived from it**:

| | before | after |
|---|---|---|
| type value | `type: "artifact"` | `type: "observation"` |
| collection | `bundle.artifacts` | `bundle.observations` |
| directory | `content/artifacts/` | `content/observations/` |
| route | `/artifacts/<id>` | `/observations/<id>` |
| API | `/api/v1/artifacts` | `/api/v1/observations` |
| code | `artifactSchema`, `ArtifactNode` | `observationSchema`, `ObservationNode` |

and the same for `workflow` → `process`.

**Explicitly out of scope:** per-type field names that mention the old type —
`required_artifacts` on a pattern, `emissions[].artifact` on a mechanism, `artifacts` on
an empirical preset. They name a *relationship to* observations rather than the kind
itself, the contract does not reach them, and each is authored data that would need its
own alias burden. Left inconsistent on purpose, and recorded here so the inconsistency is
a decision rather than an oversight.

## 2. The public URLs do move

This is the first change in the whole migration that moves one. `/artifacts/<id>` becomes
`/observations/<id>`, and `/process` — the existing workflow *page* — is untouched, since
it is a page name rather than an entity route.

The alias table cannot carry this: it maps one legacy key to one path, and this is a
prefix rewrite over every observation at once. The worker gets a separate route-level
rule, and both forms are covered by tests.

## Where this stands (2026-08-29)

Both halves are in — `21248be` and `7674740`. The live enum and
`schema/entity.schema.json` now agree name for name on all eleven kinds, so the
`RENAMED` map the DoD 1 test had carried since Phase 3 is gone.

Each half broke the same two things, in the same way, and the gates caught both
each time: a substrate sidecar key renamed on the write side but not the read
side, which silently yields an empty list rather than an error; and a payload
key crossing the JSON boundary to a client script, renamed on one side only,
which typecheck cannot see. Worth knowing before the next collection rename.

## 3. Order

`artifact` → `observation` first and on its own, because it is the larger of the two by an
order of magnitude and touches the route layer. Then `workflow` → `process`. Each ends
green on all six gates and is committed separately, so a bisect lands on one or the other.

## 4. Why bother

Two kinds currently answer to one name in the data and another in the contract, and a
third in their own IDs. Every future reader has to learn that `obs.*` entities live in
`artifacts/` and are typed `artifact` — which is exactly the class of mismatch that
produced four of this session's nine defects.
