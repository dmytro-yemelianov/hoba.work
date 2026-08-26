# hoba — System & Website Specification

**Expansion:** Hiring Obstacles & Barriers Atlas  
**Domain:** `hoba.work`  
**Version:** 0.4.1  
**Status:** implementation-ready foundation  
**Primary language:** English  
**Secondary language:** Ukrainian  
**Audience:** implementers, contributors, editors, researchers, hiring practitioners, candidates

**Revision 0.4.1:** canonical domain changed from `hoba.cc` to the acquired `hoba.work`; public URL and service namespace recommendations updated accordingly.

---

## 0. Executive Summary

**hoba** is a public, versioned, machine-readable atlas of hiring obstacles, observable signals, hidden mechanisms, recurring contradictions, feedback loops, and possible interventions.

The project exists because hiring outcomes are usually communicated as weak, ambiguous signals: silence, generic rejection language, rescheduling, role closure, reposting, compensation changes, contradictory feedback, or unexplained process termination. Candidates often interpret these signals emotionally because the actual mechanism is hidden.

hoba replaces that interpretation loop with a structured diagnostic protocol:

> **H — Hard facts**  
> **O — Obstacle**  
> **B — Behind the obstacle**  
> **A — Agency**

A **HOBA Analysis** starts from what is directly known, localizes the barrier where the process stopped, enumerates mechanisms compatible with the evidence without pretending certainty, and separates what can be acted on from what is outside candidate control.

The public website is one interface to the registry. The registry itself is the product: a Git-versioned knowledge graph exposed as web pages, JSON, CSV, GraphML, OpenAPI, and MCP tools.

The long-term goal is not only diagnosis. With explicit opt-in, anonymized and normalized observations can form an aggregate dataset for measuring recurring hiring barriers and evaluating whether interventions actually improve the process.

---

# 1. Product Identity

## 1.1 Name

The canonical brand name is lowercase:

> **hoba**

Expanded form:

> **Hiring Obstacles & Barriers Atlas**

`hoba` is always preferred in public wordmarks and prose. `HOBA` is reserved for the analysis protocol, identifiers, technical namespaces, and acronym expansion.

Examples:

- `hoba.work`
- `hoba registry`
- `HOBA Analysis`
- `HOBA-M-014`

Canonical public domain:

> **`hoba.work`**

The `.work` TLD is part of the product semantics: hoba is about the systems, obstacles, and evidence surrounding work and hiring. `hoba.work` is the canonical origin for public links, citations, API documentation, and dataset references.

## 1.2 Brand Meaning

The mascot is a cat grooming itself with one straight leg raised: the recognizable “хоба” pose.

The behavior is thematically relevant: grooming can function as a pause/displacement behavior when an animal is uncertain or caught between competing impulses. hoba uses the same metaphor for ambiguous hiring outcomes: when the signal is unclear, do not invent a story; pause, separate observation from interpretation, and analyze the system.

Brand idea:

> **When the signal is unclear, map the system.**

Alternative short line:

> **Separate signal from story.**

## 1.3 Logo & Mascot System

The identity has two related but distinct assets:

**Logo mark**
- black, minimal, geometric;
- no enclosing circle;
- two equal simplified leg forms, one raised diagonally and one horizontal;
- circular cat head between the legs;
- triangular ears aligned with virtual rays extending outward from the leg-junction point;
- no tongue, facial features, fur detail, or decorative anatomy;
- must remain recognizable at favicon size.

**Mascot**
- a more expressive cat in the same grooming pose;
- used sparingly for empty states, 404, onboarding, releases, stickers, and community material;
- never allowed to visually dominate data, methodology, or analysis pages.

## 1.4 Tone

The editorial voice is:

- forensic;
- calm;
- technically precise;
- dry rather than motivational;
- occasionally deadpan, but never cynical about candidates or employers;
- explicit about uncertainty.

The core aesthetic contrast is intentional: **serious system, slightly absurd cat**.

---

# 2. Purpose and Non-Goals

## 2.1 Purpose

hoba maps:

1. **what a candidate actually observed**;
2. **where the hiring process stopped**;
3. **what mechanisms are compatible with that observation**;
4. **what can and cannot be inferred**;
5. **where candidate agency exists**;
6. **what diagnostic probes are reasonable**;
7. **what recurring patterns or loops appear across the system**;
8. **what interventions could reduce failure, opacity, or noise**.

The key distinction is ontological:

> An observation is not a cause.  
> A rejection message is not necessarily a reason.  
> A compatible mechanism is not a proven mechanism.

## 2.2 Non-Goals

hoba is explicitly **not**:

- a company blacklist;
- a recruiter blacklist;
- a “ghost job” accusation engine;
- a job board;
- an ATS replacement;
- an application CRM;
- a personal rejection diary;
- a “failure score” for candidates;
- a coaching service promising employment outcomes;
- a legal discrimination determination tool;
- a system for inferring intent from weak evidence.

No real employer, recruiter, interviewer, ATS vendor, or individual is named in public registry entries.

---

# 3. HOBA Analysis Protocol

A **HOBA Analysis** is the primary human-facing diagnostic procedure.

## H — Hard facts

Capture only direct observations and verifiable context.

Examples:

- application submitted;
- recruiter replied;
- three interviews completed;
- exact stage reached;
- standardized rejection received;
- interview cancelled;
- role described as closed;
- materially similar role observed later;
- compensation range changed;
- explicit feedback stated a skill gap.

Forbidden in H:

- “they lied”;
- “it was a ghost job”;
- “the manager disliked me”;
- “they had an internal candidate” unless independently established.

Output: one or more **Artifact/Observation nodes** plus contextual facts.

## O — Obstacle

Localize the structural gate where progress stopped or stalled.

Examples:

- application ingestion;
- ATS filtering;
- recruiter screen;
- technical screen;
- take-home review;
- hiring-manager review;
- team interview;
- compensation reconciliation;
- budget/headcount approval;
- reference/background eligibility;
- post-offer administration.

Output: one or more **Barrier nodes**.

## B — Behind the obstacle

List mechanisms compatible with H + O.

Mechanisms are ranked only when evidence supports ranking. Otherwise the result is an uncalibrated compatibility set.

Examples:

- genuine core-skill mismatch;
- stronger competing candidate;
- résumé parser failure;
- unstated compensation mismatch;
- headcount freeze;
- pre-selected internal candidate;
- stale requisition;
- hidden evaluation rubric;
- scheduling/resource failure;
- generic feedback masking another decision.

Output: **Mechanism nodes**, evidence level, uncertainty, non-inferences, related Patterns/Loops.

## A — Agency

Separate mechanisms by removability:

- **candidate** — the applicant can reasonably change or test something;
- **intermediary** — a recruiter/manager/platform may be able to clarify or alter it;
- **none** — candidate optimization cannot directly remove the mechanism.

Then offer only bounded diagnostic probes or actions.

Examples:

- use parser-safe CV formatting on a comparable application;
- request the compensation band before later stages;
- ask whether a reposted role is a new requisition;
- request a concrete skill example from feedback;
- no useful candidate action available.

A HOBA Analysis ends when the remaining ambiguity cannot be reduced non-destructively.

It must be valid for the system to conclude:

> **Low signal. No additional candidate action is justified by the available evidence.**

---

# 4. Registry Ontology

The curated knowledge graph contains six first-class public entity types.

```text
Observation / Artifact (A)
        ▲
        │ emitted by
Mechanism (M) ───────────────► Intervention (I)
        │                         targets
        │ operates at
        ▼
Barrier (B)

Loop (L)    = persistent causal cycle among mechanisms
Pattern (P) = recurring contradiction / double-bind / reversal / impossibility
```

## 4.1 Canonical IDs

All public IDs are globally namespaced:

- `HOBA-A-001` — Artifact / Observation
- `HOBA-B-001` — Barrier
- `HOBA-M-001` — Mechanism
- `HOBA-P-001` — Pattern
- `HOBA-L-001` — Loop
- `HOBA-I-001` — Intervention

IDs are permanent, never reused, and remain resolvable after deprecation.

Deprecated nodes use:

```yaml
status: deprecated
superseded_by: HOBA-M-041
```

## 4.2 Artifact / Observation (`A`)

What the candidate directly sees, receives, or experiences.

Examples:

- complete silence after submission;
- generic “closer alignment” rejection;
- role closed after final interview;
- materially similar role reposted;
- compensation reduced after prior agreement;
- take-home assignment exceeding stated scope;
- interview repeatedly rescheduled.

Public UI label: **Observation**.  
Internal/schema term may remain: `artifact`.

## 4.3 Barrier (`B`)

A structural gate in the hiring funnel.

Barriers are relatively few, stable, and ordered as a DAG.

Example stages:

`pre-posting → sourcing → ingestion → screening → recruiter → technical → team → offer → post-offer`

## 4.4 Mechanism (`M`)

The force or process that causes a barrier to reject, stall, misclassify, or remain unresolved.

Mechanism nature:

- `rule`
- `incentive`
- `bias`
- `noise`
- `void`

A credible registry must include legitimate merit-based mechanisms as mandatory baselines.

## 4.5 Pattern (`P`)

A recurring graph configuration that is useful to name without asserting a single hidden cause.

Launch examples:

- **Seniority Double Bind**
- **Closed-Then-Reposted**
- **Experience-Age Impossibility**
- **Compensation Double Bind**

Pattern pages explicitly separate:

1. observed configuration;
2. compatible mechanisms;
3. what the pattern establishes;
4. what it does not establish.

## 4.6 Loop (`L`)

A persistent causal cycle among mechanisms.

Example:

`employment gap → automated downranking → fewer interviews → longer employment gap`

Loops are validated from graph SCCs and cannot exist only as editorial prose.

## 4.7 Intervention (`I`)

A proposed change intended to reduce a barrier, mechanism, opacity, or harmful feedback loop.

Examples:

- auto-close requisitions when headcount approval expires;
- disclose compensation band before technical stages;
- structured rejection taxonomy after late-stage interviews;
- parser conformance test for uploaded résumés;
- remove employment-gap duration from automated ranking features;
- separate internal-transfer compliance postings from externally competitive roles.

Interventions target system actors rather than only candidates.

Fields:

```yaml
id: HOBA-I-001
type: intervention
title: Auto-close stale requisitions
targets: [HOBA-M-004, HOBA-B-009]
actor: employer-policy
scope: organizational
cost: low | medium | high
evidence_level: hypothesis | supported | established
expected_effect:
  - reduce stale public listings
  - reduce ambiguous post-application silence
measurement:
  - stale_requisition_rate
  - closure_latency
```

---

# 5. Graph Relations

Core relations:

| Relation | From → To | Meaning |
|---|---|---|
| `operates_at` | Mechanism → Barrier | mechanism acts at gate |
| `emits` | Mechanism → Artifact | mechanism can generate observable signal |
| `amplifies` | Mechanism → Mechanism | first increases probability/severity of second |
| `masks` | Mechanism → Mechanism | first can provide plausible cover for second |
| `precedes` | Barrier → Barrier | funnel ordering; strictly acyclic |
| `instantiates` | Artifact/Mechanism → Pattern | node participates in pattern |
| `targets` | Intervention → Mechanism/Barrier/Loop | intervention attempts to change system behavior |
| `mitigates` | Intervention → Pattern/Loop | intervention is intended to weaken recurring structure |

`emits` carries edge metadata because fidelity belongs to the relationship, not to either node intrinsically.

Example:

```yaml
emissions:
  - artifact: HOBA-A-004
    fidelity: euphemism
    likelihood: null
    evidence: [E-013]
```

---

# 6. Classification Facets

Every Mechanism requires explicit facet coordinates.

```yaml
facets:
  actor: system | recruiter | hiring-manager | policy | external | candidate
  nature: rule | incentive | bias | noise | void
  visibility: observable | inferable | opaque
  removability: candidate | intermediary | none
```

`stage` belongs to Barrier.  
`fidelity` belongs to Mechanism→Artifact emission edges.

Useful derived groupings:

- **Endogenous Zone:** `removability: candidate`
- **Exogenous Zone:** `removability: intermediary | none`

These groupings indicate locus of agency, not blame.

---

# 7. Evidence and Epistemic Rules

## 7.1 Evidence Kinds

- `primary`
- `research`
- `reporting`
- `survey`
- `anecdote`
- `illustrative`

## 7.2 Evidence Levels

- `established`
- `supported`
- `hypothesis`
- `illustrative`

Publication status and evidence strength are separate fields.

## 7.3 Language Rules

The UI uses four explicit epistemic verbs:

- **Observed** — directly present in a source/event.
- **Compatible with** — mechanism could produce the observation.
- **Supported** — evidence raises confidence beyond mere compatibility.
- **Established** — evidence supports the precise causal claim rendered.

Forbidden leap:

`role reposted` → `role was fake`

unless independent evidence establishes that mechanism.

## 7.4 No False Precision

A graph relation does not imply probability.

At launch, most analyses use **Topological / Uncalibrated Mode**:

- compatible mechanism count;
- candidate-removable count;
- exogenous count;
- probe power;
- residual ambiguity band.

Bayesian ranking is enabled only when stage-conditioned priors and emission likelihoods are sourced/calibrated for the complete compared hypothesis set.

---

# 8. Observation Dataset and Data Collection

The canonical Registry and the empirical Dataset are separate products.

## 8.1 Registry

Curated, dateless, versioned ontology:

`A / B / M / P / L / I`

Stored in Git and reviewed editorially.

## 8.2 Observation Dataset

Optional empirical layer built from explicit opt-in submissions.

A submission is not a persistent candidate profile. It is a standalone anonymized **Evidence Bundle**.

Minimum normalized fields:

```yaml
schema_version: 1
observed_period: 2026-Q3
market_region: optional coarse region
role_family: backend | frontend | qa | data | devops | product | design | other
seniority_band: junior | middle | senior | staff-plus | leadership | unspecified
employment_type: permanent | contract | freelance | unspecified
stage: technical
artifacts:
  - HOBA-A-014
explicit_feedback: optional normalized category
analysis:
  barriers: [HOBA-B-006]
  compatible_mechanisms: [HOBA-M-002, HOBA-M-008]
  agency: candidate | mixed | exogenous
consent_to_aggregate: true
```

## 8.3 Data That Must Not Be Collected by Default

- candidate name;
- employer name;
- recruiter/interviewer name;
- exact email address;
- phone number;
- exact street location;
- exact salary unless separately justified and bucketed;
- raw CV;
- full rejection email;
- persistent cross-submission candidate ID;
- sensitive personal attributes.

Free text should be optional, quarantined from analytics, and automatically scanned for accidental identifiers before editorial review.

## 8.4 Why Coarse Time Exists

Registry entries remain dateless, but empirical observations need coarse periods such as quarter/year to answer whether the system changes over time.

No candidate timeline is required.

---

# 9. What the Dataset Can Measure

With sufficient evidence coverage, aggregate data can support analysis of:

- barrier frequency by hiring stage;
- observation frequency;
- proportion of low-signal vs informative outcomes;
- endogenous vs exogenous agency distribution;
- prevalence of explicit vs generic vs absent feedback;
- recurrence of named Patterns;
- persistence of feedback Loops;
- role-family and seniority differences;
- regional differences at safe aggregation levels;
- change over time;
- effect of documented interventions;
- where candidate optimization is likely to be useful;
- where additional candidate effort is structurally unlikely to alter the outcome.

The system must distinguish:

- **registry topology counts** — what exists in the model;
- **empirical dataset counts** — what was actually observed in submissions;
- **population prevalence claims** — allowed only when sampling supports them.

---

# 10. From Analysis to Change

hoba is designed around a closed improvement loop:

```text
Observe
  ↓
Classify
  ↓
Aggregate
  ↓
Detect patterns / loops
  ↓
Identify high-cost or low-signal barriers
  ↓
Define intervention
  ↓
Measure after change
  ↓
Revise registry and evidence
```

Examples of system-level questions:

- Which late-stage barriers produce the most opaque outcomes?
- Which mechanisms produce many different generic rejection artifacts?
- Which barriers have high candidate cost but low diagnostic value?
- Which Patterns recur across unrelated evidence bundles?
- Which interventions reduce ambiguity even when they do not change hire rate?
- Which candidate-facing “optimization advice” targets mostly exogenous mechanisms?

An intervention may be considered successful if it improves transparency or reduces waste even without increasing total hiring volume.

---

# 11. Website Information Architecture

## 11.1 Primary Navigation

- **Analyze**
- **Registry**
- **Patterns**
- **Graph**
- **Data**
- **Methodology**
- **Contribute**
- **Developers**
- **About**

## 11.2 Home Page

Hero:

> **hoba**  
> Hiring Obstacles & Barriers Atlas  
> **Turn hiring outcomes into structured facts.**

Primary CTA:

> **Run a HOBA Analysis**

Secondary CTA:

> **Explore the Registry**

Below hero: four-step HOBA protocol.

```text
H   Hard facts
O   Obstacle
B   Behind the obstacle
A   Agency
```

Then three product explanations:

1. **Diagnose without inventing a story**
2. **Explore recurring system patterns**
3. **Use aggregate data to test changes**

The mascot may appear once in the hero/empty-state area but not as the page's main visual hierarchy.

## 11.3 Analyze Page

A client-side, privacy-preserving wizard.

### Step H — Hard facts

Prompt:

> **What actually happened?**

Select/search observations and optionally add bounded context.

### Step O — Obstacle

Prompt:

> **Where did the process stop?**

Suggest Barriers based on selected Artifacts and stage.

### Step B — Behind

Display:

- compatible mechanisms;
- evidence level;
- calibrated/uncalibrated badge;
- non-inferences;
- related patterns/loops.

### Step A — Agency

Display:

- candidate-removable mechanisms;
- intermediary-dependent mechanisms;
- no-agency mechanisms;
- diagnostic probes;
- explicit stop condition when further analysis is not useful.

Default behavior: analysis remains in browser memory only.

Optional final action:

> **Contribute anonymized observation**

This must be separate, explicit consent.

## 11.4 Registry Index

Search-first interface.

Filters:

- entity type;
- stage;
- actor;
- nature;
- visibility;
- removability;
- evidence level;
- pattern membership.

Public result cards always show entity type to prevent layer confusion.

## 11.5 Observation Page

Required sections:

1. Observation
2. Where it can occur
3. Diagnostic verdict
4. Compatible mechanisms
5. Diagnostic probes
6. What this does not tell you
7. Local graph
8. Related Patterns/Loops
9. Evidence/provenance
10. Machine-readable links

## 11.6 Barrier Page

Required sections:

- structural gate definition;
- stage;
- pass condition;
- mechanisms operating here;
- observations emitted around this barrier;
- candidate agency distribution;
- interventions targeting this barrier;
- local graph.

## 11.7 Mechanism Page

Required sections:

- mechanism definition;
- facets;
- barriers where it operates;
- observations it may emit;
- evidence level;
- honest-baseline flag;
- mechanisms it amplifies/masks;
- related loops/patterns;
- interventions targeting it;
- explicit non-inferences.

## 11.8 Pattern Page

Required sections:

1. minimal graph motif;
2. required observations;
3. trigger rule;
4. evidence bundles;
5. compatible mechanisms;
6. what it establishes;
7. what it does not establish;
8. relevant interventions.

## 11.9 Loop Page

Show:

- cycle diagram;
- member mechanisms;
- entry points;
- reinforcing edges;
- evidence;
- interventions that may break the cycle.

## 11.10 Intervention Page

Show:

- target mechanism/barrier/loop;
- responsible actor;
- proposed change;
- evidence level;
- expected effect;
- implementation cost band;
- measurement plan;
- before/after evidence when available.

## 11.11 Graph Explorer

Cytoscape.js full graph.

Controls:

- layer toggles: A/B/M/P/L/I;
- stage;
- actor;
- nature;
- visibility;
- removability;
- evidence level;
- edge types;
- show only paths from selected Observation;
- show only candidate-removable paths;
- show loops;
- show Patterns;
- show intervention targets.

The full graph is secondary navigation, never the default landing experience.

## 11.12 Data Page

Public aggregate dashboard only when sufficient empirical data exists.

Minimum charts:

- observations by stage;
- agency split;
- feedback fidelity distribution;
- top Patterns;
- trend by quarter;
- intervention before/after where valid.

Small samples must be suppressed or explicitly marked unstable.

## 11.13 Methodology Page

Explain:

- ontology;
- HOBA protocol;
- evidence levels;
- uncalibrated vs calibrated analysis;
- anonymization;
- sampling limitations;
- versioning;
- editorial process;
- conflict-of-interest policy.

## 11.14 Developers Page

Links to:

- REST/static API;
- OpenAPI;
- JSON Schema;
- MCP server;
- graph exports;
- CLI;
- npm package;
- versioned releases.

---

# 12. Technical Architecture

## 12.1 Principle

The website is a client of the registry. It is not the registry itself.

```text
Markdown / YAML
      │
      ▼
Zod validation
      │
      ▼
Graph + diagnostic build
      │
      ├── Static website
      ├── JSON API
      ├── OpenAPI
      ├── MCP
      ├── CSV / NDJSON
      ├── GraphML
      ├── npm package
      └── CLI data bundle
```

## 12.2 Recommended Stack

- **Language:** TypeScript
- **Content:** Markdown + YAML frontmatter
- **Schema:** Zod + generated JSON Schema
- **Site:** Astro
- **Styling:** Tailwind CSS
- **Graph:** Cytoscape.js
- **Static search:** Pagefind or equivalent build-time index
- **Tests:** Vitest
- **Build:** pnpm
- **CI:** GitHub Actions
- **Hosting:** Cloudflare Pages
- **Optional runtime:** Cloudflare Workers
- **Submission storage (later):** D1/R2 or equivalent, isolated from public registry build

No runtime database is required for registry browsing.

## 12.3 Repository Layout

```text
/content
  /artifacts
  /barriers
  /mechanisms
  /patterns
  /loops
  /interventions
/content-uk
  /artifacts
  /barriers
  /mechanisms
  /patterns
  /loops
  /interventions
/evidence
/schemas
/packages
  /registry
  /cli
  /mcp
/site
/build
/scripts
/tests
```

---

# 13. Public API

The API is read-only at launch and can be generated as static JSON where possible.

Base:

`https://hoba.work/api/v1/`

Core endpoints:

```text
GET /api/v1/artifacts
GET /api/v1/artifacts/HOBA-A-001
GET /api/v1/barriers
GET /api/v1/barriers/HOBA-B-001
GET /api/v1/mechanisms
GET /api/v1/mechanisms/HOBA-M-001
GET /api/v1/patterns
GET /api/v1/loops
GET /api/v1/interventions
GET /api/v1/search?q=reposted
GET /api/v1/graph
GET /api/v1/neighbors/HOBA-M-001
GET /api/v1/path?from=HOBA-A-001&to=HOBA-B-004
GET /api/v1/explain?artifact=HOBA-A-001&stage=screening
```

Contract:

`/openapi.json`

Schemas:

```text
/schema/artifact.schema.json
/schema/barrier.schema.json
/schema/mechanism.schema.json
/schema/pattern.schema.json
/schema/loop.schema.json
/schema/intervention.schema.json
/schema/registry.schema.json
```

---

# 14. MCP Interface

Remote MCP should expose the registry as a source of structured hiring-system knowledge, not as an autonomous career coach.

Suggested tools:

```text
search_registry(query, types?, filters?)
get_node(id)
get_neighbors(id, relations?, depth?)
explain_observation(artifact_id, stage?)
find_compatible_mechanisms(artifact_ids, stage?)
get_diagnostic_probes(artifact_id, stage?)
find_patterns(artifact_ids?, mechanism_ids?)
get_interventions(target_id)
traverse_graph(start_id, relation?, depth?)
get_methodology(topic?)
```

MCP responses must expose:

- canonical IDs;
- evidence level;
- calibrated/uncalibrated state;
- non-inferences;
- registry version.

The MCP server must not fabricate a hidden cause when the registry returns ambiguity.

Suggested endpoint:

`https://mcp.hoba.work/`

---

# 15. Other Machine Interfaces

Launch/near-launch outputs:

```text
/data/latest/registry.json
/data/latest/registry.ndjson
/data/latest/nodes.csv
/data/latest/edges.csv
/data/latest/graph.graphml
/data/latest/schema.json
```

Later optional semantic exports:

```text
/data/latest/registry.jsonld
/data/latest/registry.ttl
```

A SPARQL endpoint is explicitly not a launch requirement.

---

# 16. CLI and Package

## 16.1 CLI

Command name:

```bash
hoba
```

Examples:

```bash
hoba search "position reposted"
hoba show HOBA-A-014
hoba explain HOBA-A-014 --stage technical
hoba graph HOBA-M-009 --depth 2
hoba validate ./content
hoba diff 2026.08.1 2026.09.0
```

## 16.2 npm Package

```bash
npm install @hoba/registry
```

Example:

```ts
import { registry } from '@hoba/registry'

registry.get('HOBA-M-014')
registry.neighbors('HOBA-M-014')
registry.explain('HOBA-A-004', { stage: 'technical' })
```

Python support is later-phase unless external demand appears.

---

# 17. Versioning and Reproducibility

Maintain separate versions:

- **schema version** — semantic/data contract;
- **registry version** — content release;
- **site version** — presentation/runtime.

Example:

```text
schema: 1.0.0
registry: 2026.08.1
site: 0.4.0
```

Versioned release paths:

```text
/data/releases/2026.08.1/registry.json
/data/releases/2026.08.1/graph.graphml
```

Every API/MCP response includes `registry_version`.

Determinism requirement:

> Given the same Git tree and lockfile, public registry build artifacts must be byte-deterministic.

---

# 18. Contribution Model

Registry content is Git-first.

Contributor workflow:

```bash
hoba new mechanism
hoba validate
hoba test
```

Pull-request checks:

```text
✓ schema valid
✓ references resolve
✓ no undeclared cycles
✓ evidence policy satisfied
✓ anonymization policy satisfied
✓ quantitative claims have provenance
✓ honest baseline preserved
⚠ semantic duplicate candidate: HOBA-M-014
```

Editorial review is required for published nodes.

Community submissions do not automatically become Registry truth. They first enter the empirical evidence queue.

---

# 19. Submission Service

This is optional for the initial launch but required for the empirical-data phase.

## 19.1 Principles

- opt-in only;
- no account required;
- no persistent candidate identifier;
- normalized fields first;
- free text optional;
- public dataset contains aggregates, not raw submissions;
- raw evidence is quarantined and access-controlled;
- explicit consent required for aggregation.

## 19.2 Flow

```text
HOBA Analysis in browser
       │
       ▼
User sees result
       │
       ├── Exit: nothing stored
       │
       └── Contribute anonymously
                  │
                  ▼
         PII scan + schema validation
                  │
                  ▼
             Evidence queue
                  │
                  ▼
          Aggregate publication
```

## 19.3 Anti-Abuse

- rate limiting;
- CAPTCHA only if abuse requires it;
- no public raw-text feed;
- deduplication heuristics;
- moderation queue;
- minimum sample thresholds for aggregate publication.

---

# 20. Privacy, Safety, and Legal Posture

## 20.1 Anonymization

Public content never names identifiable employers, recruiters, interviewers, candidates, or ATS vendors in incident evidence.

## 20.2 Defamation Guard

hoba describes mechanisms and patterns as classes. It does not publicly attribute hidden intent to a named organization.

## 20.3 Research Guard

Aggregate charts must distinguish convenience-sample observations from representative labor-market statistics.

## 20.4 Candidate Guard

The system must not reward rumination.

Forbidden UI:

- rejection streaks;
- failure counters;
- “days unemployed” counters;
- doom notifications;
- personalized employability score;
- gamified rejection totals.

The analysis should actively stop when evidence becomes non-diagnostic.

---

# 21. Internationalization

Canonical content language: English.

Ukrainian translation mirrors the same IDs and source files.

Example:

```text
/content/mechanisms/HOBA-M-001-*.md
/content-uk/mechanisms/HOBA-M-001-*.md
```

IDs and graph structure never change by language.

Public brand remains lowercase `hoba` in both languages.

---

# 22. Accessibility and Performance

Minimum requirements:

- WCAG AA contrast;
- full keyboard navigation;
- graph controls accessible outside canvas via equivalent lists;
- no information encoded only by color;
- static pages usable without JavaScript except interactive analysis/graph features;
- performance budget for home and registry detail pages;
- SVG logo and icons;
- responsive mobile-first layout.

---

# 23. Build Validation

Build stages:

```text
Content
  ↓
1. Zod schema validation
  ↓
2. Referential integrity
  ↓
3. Barrier DAG validation
  ↓
4. Tarjan SCC loop validation
  ↓
5. Pattern rule validation
  ↓
6. Evidence/editorial validation
  ↓
7. Diagnostic model generation
  ↓
8. Intervention target validation
  ↓
9. API/schema/export generation
  ↓
10. Static site generation
```

Build failure conditions include:

- dangling node IDs;
- barrier cycle;
- undeclared mechanism cycle;
- unsupported quantitative claim;
- missing evidence for calibrated probability;
- removal of all honest-baseline mechanisms;
- named organization/person in protected content;
- Pattern without `non_inference` section;
- Intervention with no target or measurement concept.

---

# 24. Initial Seed Taxonomy

## 24.1 Barriers — target 10–14

Suggested initial set:

1. application ingestion;
2. ATS/filter threshold;
3. sourcing/contact;
4. recruiter screen;
5. technical screen;
6. take-home/work sample;
7. hiring-manager review;
8. team/culture stage;
9. compensation reconciliation;
10. headcount/budget approval;
11. references/background;
12. post-offer administration.

## 24.2 Mechanisms — target 22–28

Must include at minimum:

- genuine skill-depth shortfall;
- stronger competing candidate;
- parser failure;
- compensation mismatch;
- pre-selected internal candidate;
- stale/orphaned requisition;
- headcount freeze;
- recruiter volume incentive;
- hidden evaluation rubric;
- automated expiration/reject workflow;
- employment-gap downranking;
- scheduling/resource failure;
- role redefinition mid-process;
- location/time-zone constraint;
- communication mismatch;
- requirement ambiguity.

## 24.3 Patterns — target 4–8

Launch:

- `HOBA-P-001` Seniority Double Bind
- `HOBA-P-002` Closed-Then-Reposted
- `HOBA-P-003` Experience-Age Impossibility
- `HOBA-P-004` Compensation Double Bind

## 24.4 Loops — target 3–5

Examples:

- employment-gap penalty loop;
- interview-preparation opportunity-cost loop;
- inflated-requirements / reduced-candidate-pool / prolonged-search loop.

## 24.5 Interventions — target 5–8

Seed interventions should deliberately target different actors:

- employer policy;
- recruiter process;
- ATS/system;
- hiring manager;
- candidate-removable diagnostic action.

---

# 25. Launch Scope

## Phase 0 — Foundation

- brand + domain;
- SVG logo;
- repository;
- schema;
- 10+ Barriers;
- 22+ Mechanisms;
- 12+ Artifacts;
- 4+ Patterns;
- 3+ Loops;
- 5+ Interventions;
- validation pipeline.

## Phase 1 — Public Registry

- home;
- registry search;
- node detail pages;
- local graph;
- global graph explorer;
- methodology;
- EN/UK;
- JSON/CSV/GraphML exports;
- OpenAPI;
- versioned releases.

## Phase 1.1 — HOBA Analysis

- client-side H/O/B/A wizard;
- uncalibrated diagnostic mode;
- probe generation from authored registry rules;
- share/copy/export without server persistence.

## Phase 1.2 — Developer Interfaces

- MCP;
- CLI;
- npm package;
- graph traversal endpoints.

## Phase 2 — Empirical Dataset

- anonymous opt-in submissions;
- moderation/evidence queue;
- aggregate data page;
- coarse temporal analysis;
- pattern frequency analysis.

## Phase 3 — Intervention Measurement

- intervention pages;
- before/after evidence;
- published change proposals;
- intervention outcome tracking at aggregate level.

---

# 26. Success Criteria

hoba is successful if it can do all of the following without overclaiming:

1. turn an ambiguous hiring event into structured observations;
2. separate observation, barrier, mechanism, and agency;
3. explicitly return uncertainty rather than inventing causal certainty;
4. identify recurring contradictions as queryable Patterns;
5. expose the same registry to humans and machines;
6. collect useful aggregate evidence without building personal rejection profiles;
7. produce concrete, measurable intervention proposals;
8. preserve a credible honest baseline where the candidate can genuinely be the limiting factor;
9. make historical releases reproducible and citable;
10. remain useful even if the maintainer gets hired tomorrow.

---

# 27. Canonical Positioning Copy

## One sentence

> **hoba is a structured atlas for turning ambiguous hiring outcomes into facts, barriers, compatible mechanisms, and actionable agency.**

## Short project explanation

> I could not get hired and noticed that many experienced specialists were reporting the same kind of uncertainty. Instead of building another place to complain about the market, I built a system for decomposing each hiring problem as a factual incident: what was observed, where the process stopped, what mechanisms are compatible with the evidence, and what is actually within the candidate’s control. With enough anonymized observations, the same model becomes a dataset for analyzing recurring barriers and patterns across the hiring system. That data can then be used to propose interventions and measure whether the process becomes more transparent, less wasteful, and more effective over time.

## Developer description

> **One canonical hiring-barrier knowledge graph, many interfaces: web, API, MCP, CLI, JSON, CSV, GraphML, and versioned data releases.**

---

# 28. Canonical URLs

```text
https://hoba.work/
https://hoba.work/analyze
https://hoba.work/registry
https://hoba.work/patterns
https://hoba.work/graph
https://hoba.work/data
https://hoba.work/methodology
https://hoba.work/contribute
https://hoba.work/developers
https://hoba.work/about

https://hoba.work/api/v1/...
https://hoba.work/openapi.json
https://hoba.work/data/latest/...
https://mcp.hoba.work/
```

Reserved service subdomains:

```text
api.hoba.work
mcp.hoba.work
data.hoba.work
docs.hoba.work
```

The canonical website origin is `https://hoba.work`. Path-based endpoints remain preferred for the initial deployment; subdomains should be activated only when deployment, caching, security, or protocol boundaries justify them. `mcp.hoba.work` is the preferred dedicated endpoint once the remote MCP service is deployed.

---

# 29. Licensing

Recommended:

- **Registry content:** CC BY-SA 4.0
- **Code/toolchain:** MIT
- **Empirical aggregate dataset:** publish under a separately declared open-data license after privacy and provenance rules are finalized.

Raw user submissions are not automatically open data.

---

# 30. Core Design Rule

If there is one rule every implementation, contributor, analysis, API, MCP client, and future feature must preserve, it is this:

> **hoba must make uncertainty more explicit, not merely replace one unsupported story with another.**
