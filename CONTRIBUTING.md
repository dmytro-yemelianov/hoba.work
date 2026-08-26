# Contributing to hoba

We welcome contributions to expand and refine the **Hiring Obstacles & Barriers Atlas** (`hoba.work`).

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

When you publish a content release, bump `version` in `registry.yaml` (format `YYYY.MM.N`) and set `updated_at`
to the release timestamp. Bump `schema_version` only when the entity contract in `packages/registry/src/schemas.ts` changes.

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
