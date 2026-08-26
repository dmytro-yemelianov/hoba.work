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
# Validate Zod schemas, DAG acyclicity, and referential integrity
pnpm validate

# Run test suite
pnpm test

# Verify successful deterministic build
pnpm build
```

## 3. Adding New Nodes

- Artifacts: Place in `/content/artifacts/A-xxx.md` (and `/content-uk/artifacts/A-xxx.md`)
- Barriers: Place in `/content/barriers/B-xxx.md` (and `/content-uk/barriers/B-xxx.md`)
- Mechanisms: Place in `/content/mechanisms/M-xxx.md` (and `/content-uk/mechanisms/M-xxx.md`)
- Patterns: Place in `/content/patterns/P-xxx.md` (and `/content-uk/patterns/P-xxx.md`)
- Loops: Place in `/content/loops/L-xxx.md` (and `/content-uk/loops/L-xxx.md`)
- Interventions: Place in `/content/interventions/I-xxx.md` (and `/content-uk/interventions/I-xxx.md`)

Each node must have valid YAML frontmatter conforming to schemas in `@hoba/registry`.
