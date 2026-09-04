# Contributing to hoba

We welcome contributions to expand and refine the **Hiring Obstacles & Barriers Atlas** (`hoba.work`).


## The task runner

Every repeatable chore has one entry point:

```
pnpm task check              # validate → typecheck → unit → build → e2e, stops at the first failure
pnpm task check registry     # or a single stage
pnpm task new mechanism "Title of the thing"
pnpm task specimens          # coverage, mirror parity, forbidden names
pnpm task preview            # build and serve, reuses a running server
pnpm task shots /registry /observations/obs.feedback_stating_candidate_is_overqualified_for_the_grade
pnpm task deploy-preview     # branch deploy
```

`pnpm task new` scaffolds both language mirrors with the next free ID and
frontmatter that already validates, so the first `pnpm task check registry`
passes before a word of prose is written.

## 1. Ground Rules & Epistemic Standards

1. **No Defamation or Naming:** Never include the name of any employer, recruiter, interviewer, ATS vendor, or candidate in public registry entries.
2. **Honest Baseline Preservation:** New mechanisms or modifications must not undermine legitimate merit-based mechanisms (e.g. genuine skill shortfalls).
3. **No False Precision:** Never assign subjective percentages or probabilities without rigorous empirical evidence.
4. **Strict Acyclicity for Barriers:** Funnel barrier progression via `precedes` must form a strictly acyclic DAG.
5. **Tarjan SCC Loops:** Mechanism causal loops must represent verified feedback cycles.

## 2. Pull Request Checklist

Before submitting a pull request, ensure all local checks pass:

```bash
# Typecheck everything
pnpm typecheck

# Validate Zod schemas, referential integrity, DAG acyclicity, loop declarations, EN/UK parity
pnpm validate:strict

# Run unit/integration tests, then the browser suite against the built site
pnpm test
pnpm build && pnpm e2e

# Regenerate committed exports (schemas/, site/public/**) and verify the deterministic build
pnpm build
git status --short   # generated files must be committed alongside content changes
```

The CLI checks use native TypeScript 7 (`tsc`). Astro and typescript-eslint
temporarily use the `@typescript/typescript6` compatibility package because
TypeScript 7.0 does not expose the programmatic API embedded-language tooling
needs. Both compilers are installed side by side; remove the compatibility
alias once that API is available upstream.

When you publish a content release, bump `version` in `registry.yaml` (format `YYYY.MM.N`) and set `updated_at`
to the release timestamp. Bump `schema_version` only when the entity contract in `packages/registry-core/src/schemas.ts` changes.

## 3. Adding New Nodes

- Artifacts: Place in `/content/artifacts/A-xxx.md` (and `/content-uk/artifacts/A-xxx.md`)
- Barriers: Place in `/content/barriers/B-xxx.md` (and `/content-uk/barriers/B-xxx.md`)
- Mechanisms: Place in `/content/mechanisms/M-xxx.md` (and `/content-uk/mechanisms/M-xxx.md`)
- Patterns: Place in `/content/patterns/P-xxx.md` (and `/content-uk/patterns/P-xxx.md`)
- Loops: Place in `/content/loops/L-xxx.md` (and `/content-uk/loops/L-xxx.md`)
- Interventions: Place in `/content/interventions/I-xxx.md` (and `/content-uk/interventions/I-xxx.md`)

Each node must have valid YAML frontmatter conforming to schemas in `@hoba/registry`.

Rules the validator enforces beyond the schema:

- every `evidence_ids` / `emissions[].evidence` entry must resolve to an `EVD-xxx` record;
- `superseded_by` requires `status: deprecated` and must point at an existing node;
- barrier `order` values are unique and increase along `precedes`;
- loop `edges` and `entry_points` stay inside the loop's `mechanisms`; an edge that the source mechanism does not
  declare in `amplifies`/`masks` is reported as a warning (the loop is editorial prose until it is declared);
- an intervention listed in a pattern/loop `interventions` field must include that pattern/loop in its `targets`
  (and vice versa) — this is what produces `mitigates` edges in the graph;
- the Ukrainian mirror must contain exactly the same IDs and structural fields; only prose may differ.

## Triage

Issues carry one epic label (`epic:*`) and one kind label (`content`, `defect`,
`design`). They live on [the roadmap board](https://github.com/users/dmytro-yemelianov/projects/4),
ordered by what unblocks what rather than by size — the reasoning is in
[ROADMAP.md](ROADMAP.md).

Two rules a registry entry has to clear before it is merged, both enforced by
tests rather than by review:

- **Non-inferences are required.** An entry that says what a signal means
  without saying what it does not mean is a complaint, not a registry entry.
- **No company, product or person is named.** `pnpm task specimens` fails the
  build on it. A named employer would turn the atlas into the blacklist the
  methodology forbids.
