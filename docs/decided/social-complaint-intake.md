# Social Complaint Intake and Classification

**Status:** decided specification  
**Scope:** social posts, first-person complaints, advice requests, and anecdotal reports  
**Relationship to case-space:** an ingestion and interpretation layer over the existing case-space; it does not replace the ontology or causal model.

## 1. Product goal

Turn an unstructured complaint into a reviewable case projection:

```
post -> claims -> observations -> case-space projection -> nearby cases -> next test
```

Hoba classifies the situation described by the author. It does not classify the author, diagnose motives, or treat one post as population-level evidence.

## 2. Core epistemic rule

Every extracted statement must retain its source span and one status:

| Status | Meaning |
|---|---|
| `reported` | The author explicitly states it. |
| `corroborated` | Supported by an attached or linked source. |
| `inferred` | A structured interpretation derived from reported facts. |
| `contested` | The source itself presents competing accounts. |
| `unverifiable` | Relevant, but not checkable from the supplied material. |
| `contradicted` | Conflicts with supplied evidence. |

An interpretation must never silently become an observation. “The ATS rejected me” is a causal claim; “I received an automated rejection within five minutes” is an observation.

## 3. Input contract

```ts
type ComplaintInput = {
  text: string;
  source?: {
    platform?: 'reddit' | 'linkedin' | 'x' | 'forum' | 'email' | 'other';
    url?: string;
    published_at?: string;
    author_consent?: 'not_requested' | 'granted' | 'denied';
  };
  language?: 'en' | 'uk' | 'other';
  attachments?: Array<{ kind: 'document' | 'image' | 'link'; label?: string }>;
};
```

The system may accept a URL, but must preserve the distinction between author text, quoted material, model paraphrase, and external evidence.

## 4. Normalized complaint model

```ts
type ComplaintAnalysis = {
  source: SourceMetadata;
  request_mode: 'explanation' | 'validation' | 'advice' | 'warning_others' | 'seeking_witnesses' | 'venting';
  claims: Claim[];
  observations: Observation[];
  projection: PartialCaseAssignment[];
  nearby_cases: NearbyCase[];
  uncertainty: UncertaintyItem[];
  next_tests: DiagnosticTest[];
  prohibited_conclusions: string[];
  privacy: PrivacyReport;
};

type Claim = {
  id: string;
  text_span: string;
  kind: 'observation' | 'interpretation' | 'emotion' | 'causal_claim' | 'request' | 'omission';
  status: ClaimStatus;
  confidence: 'high' | 'medium' | 'low';
  supports_observations?: string[];
};
```

`request_mode` describes what the post is doing, not whether it is valid. `venting` is not a quality judgment.

## 5. Projection rules

The intake layer may assign existing case-space coordinates only when:

1. an observation is directly stated or backed by supplied evidence;
2. the coordinate value exists in `CASE_AXES`;
3. the assignment carries provenance and status;
4. the assignment passes Γ;
5. uncertain interpretations remain `inferred` or `unknown`.

The existing nearby-case matcher remains structural retrieval only. Ranking may use shared observations and stage, but must not use mechanisms or evidence strength as hidden causal scores.

## 6. User-facing response

Every response should contain, when applicable:

1. **What you reported** — normalized observations with source spans.
2. **What this resembles** — nearby validated scenarios and shared signals.
3. **What is not established** — causal claims that exceed the evidence.
4. **What is missing** — the smallest facts that would distinguish explanations.
5. **Next useful test** — one to three low-cost checks or experiments.
6. **Emotional acknowledgement** — brief, non-patronizing, and separate from classification.

Example:

> Your post reports five recruiter conversations followed by silence. That resembles post-screen disappearance, but does not establish ATS rejection or discrimination. The cheapest next test is to separate applications by role, CV version, geography, and compensation range.

## 7. Privacy and safety requirements

- Redact names, contact details, addresses, usernames, and identifiers by default.
- Do not add a public post to the canonical corpus without explicit consent.
- Store source URLs separately from normalized public examples.
- Do not infer protected traits unless the author explicitly provides them and they are relevant to the described case.
- Do not rank or profile authors.
- Do not estimate prevalence from social-post frequency.
- Health, legal, immigration, military, and financial outputs require narrower uncertainty language and jurisdiction-specific evidence.
- Public output must state that Hoba is not a legal, medical, or employment decision-maker.

## 8. Initial use cases

The first supported use case is complaint-to-case analysis. The same model should support:

- job-search and recruiter ghosting complaints;
- workplace conflict and management complaints;
- customer-support and billing complaints;
- developer incident reports;
- housing and landlord disputes;
- education and admissions complaints;
- public-service and documentation failures in Ukraine;
- scam and fraud reports;
- founder/investor and fundraising complaints;
- community-level aggregation of anonymized recurring process failures.

Aggregation is not individual scoring: normalized cases may reveal recurring mechanisms only after de-identification and explicit sampling limits.

## 9. Implementation plan

### Phase 1 — Contract and pure extraction

- Add `ComplaintInput`, `Claim`, `ComplaintAnalysis`, and privacy schemas.
- Implement deterministic claim buckets and provenance preservation.
- Add source-span references and `reported/inferred/unverifiable` handling.
- Add unit fixtures for a job-search complaint, workplace complaint, and non-complaint question.

**Exit criteria:** malformed input is rejected; no inferred claim is emitted as a reported observation; EN/UK schema parity passes.

**Implemented:** deterministic claim segmentation with redacted source spans, explicit causal-claim separation, deterministic contact/username redaction, and `analyze_social_complaint` MCP access. Names, addresses, and identifiers remain an explicit manual-review risk in Phase 1. Phase 1 itself deliberately returned no case-space projection or nearby cases; Phase 2a below adds only direct observation mappings and structural retrieval.

### Phase 2 — Case-space projection

- Map only existing ontology IDs and case-space values.
- Reuse Γ validation and the shared nearby-case matcher.
- Return unknown coordinates explicitly.
- Add projection tests for protected traits, military status, worksite, latency, and cohort states.

**Exit criteria:** every assignment has provenance; no Γ-refuted projection is returned; mechanism scores cannot affect retrieval ranking.

**Implemented Phase 2a:** a versioned, conservative EN/UK phrase ruleset maps only directly reported observation phrases to existing `obs.*` IDs. Every mapping preserves its claim ID, matched source span, exact matched phrase, rule ID, and `reported` status. The shared nearby-scenario matcher receives only those mapped observation IDs plus an optional user-supplied stage. Causal claims, emotions, requests, unmatched text, and all case-space coordinates remain outside retrieval. Full coordinate projection remains pending explicit coordinate rules and Γ validation.

### Phase 3 — Explainable response renderer

- Add `/analyze/complaint` mode to the existing analyzer.
- Render observations, interpretations, nearby cases, missing information, and next tests separately.
- Add EN/UK language support.
- Add PII redaction preview before analysis and before any save/share action.

**Exit criteria:** a user can paste a complaint and receive a useful answer without knowing ontology IDs; mobile/dark/light accessibility passes.

**Implemented Phase 3a:** `/analyze#complaint-box` now runs the same browser-safe conservative extractor used by the validated MCP path. It renders direct reported mappings, causal claims that remain unestablished, structural nearby-case retrieval, unmapped facts, coordinate limits, a next check, and a one-click transfer of only mapped `obs.*` facts into Step H. The browser runs both explicit EN/UK phrase sets so a reader may paste either language regardless of UI locale; this is rule application, not language or causal inference. It is local-only: no complaint text is sent or saved. Contact details and usernames are redacted in the rendered extraction; names, addresses, and identifiers remain manual-review risks. A dedicated PII preview before rendering or any future sharing action remains pending.

### Phase 4 — MCP parity

- Add `analyze_social_complaint` MCP tool.
- Reuse the web implementation, not a second classifier.
- Return structured claims, projection, nearby cases, uncertainty, and prohibited conclusions.
- Add stdio `tools/list` and `tools/call` tests.

**Exit criteria:** web and MCP return equivalent normalized output for the same fixture.

**Implemented:** the browser-safe extractor and validated MCP facade share the same rule implementation. Contract tests assert equivalent redacted claims and observation mappings for the same fixture; MCP has separate stdio tool-list/tool-call coverage.

### Phase 5 — Diagnostic experiments

- Add a catalog of low-cost discriminating tests.
- Rank tests by information value, user effort, and privacy risk.
- Never expose a “probability of discrimination” or “probability of ATS rejection” from one anecdote.

**Exit criteria:** every high-level explanation has at least one falsifiable next check or is explicitly marked unresolved.

### Phase 6 — Consent-based corpus contribution

- Add opt-in contribution flow.
- Produce a de-identified normalized case, not a copied post.
- Preserve source provenance privately and sampling metadata publicly.
- Add deletion and withdrawal handling.

**Exit criteria:** no contribution occurs without explicit consent; public corpus cannot reconstruct the original author or post.

## 10. Acceptance scenarios

1. A post says “the ATS rejected me”; output separates that causal claim from the observed rejection timing.
2. A post contains anger but few facts; output acknowledges emotion and asks for missing observations without dismissing the author.
3. A post contains a concrete timeline; output maps it to nearby scenarios and names the stage bottleneck.
4. A post mentions a protected trait; output does not infer discrimination, but preserves the reported trait as relevant context.
5. A post contains PII; preview redacts it before analysis output.
6. An unknown or contradictory statement remains visible as uncertainty.
7. The same input through web and MCP yields the same projection and nearby-case ordering.
8. A single social post never changes population-level prevalence metrics.

## 11. Non-goals

- Automated diagnosis of the author.
- Fact-checking the entire internet.
- Legal, medical, HR, or hiring decisions.
- Sentiment scoring as a substitute for case analysis.
- Treating viral frequency as evidence of prevalence.
- Automatically adding social posts to the canonical registry.

## 12. Recommended first implementation slice

Start with one narrow vertical slice:

```
paste job-search complaint
  -> claim/observation separation
  -> case-space projection
  -> nearby scenarios
  -> missing signals
  -> one next diagnostic test
```

Use the existing job-search corpus as the fixture set. Do not add URL scraping, corpus contribution, or aggregation until the private paste flow is reliable and epistemically transparent.
