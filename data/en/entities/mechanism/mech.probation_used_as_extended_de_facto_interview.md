---
id: "mech.probation_used_as_extended_de_facto_interview"
type: "mechanism"
aliases:
  - "M-028"
title: "Probation Used as Extended De-Facto Interview"
summary: "An employer may rely on probation as an additional selection stage, using on-the-job assessment to resolve uncertainty that the interview process left open."
operates_at:
  - "bar.probation_period_post_start_confirmation"
emissions:
  -
    artifact: "obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation"
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: []
    observed_at:
      - "post-offer"
  -
    artifact: "obs.rejection_naming_an_internal_hire_as_the_outcome"
    fidelity: "noise"
    likelihood: "medium"
    evidence: []
    observed_at:
      - "post-offer"
facets:
  actor: "hiring-manager"
  nature: "incentive"
  visibility: "inferable"
  removability: "intermediary"
amplifies: []
masks: []
honest_baseline: false
status: "active"
evidence_level: "compatible"
evidence_ids: []
specimens:
  -
    kind: "note"
    label: "Probation exit note"
    lines:
      -
        text: "Candidate onboarding evaluated over 60 days."
        tell: false
      -
        text: "Delivery pace did not ramp to senior independent output within month two."
        tell: true
      -
        text: "Notice issued under the statutory probation clause of the Ukrainian Labour Code."
        tell: false
    reading: "This composite illustrates the mechanism, but the exit note alone does not establish that the interview threshold was deliberately lowered."
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "Direct on-the-job output under real sprint pressure, treating probation as a higher-fidelity filter than multi-round panel interviews."
    reads: "Some managers may treat on-the-job evidence as more informative than another interview round, but that policy must be established rather than inferred from one exit."
    does: "May shorten pre-hire assessment and shift unresolved evaluation questions into documented probation reviews."
  -
    actor: "actor.candidate"
    sees: "An employment contract with a probation clause and a potentially different evaluation or termination procedure."
    reads: "A post-start evaluation may be carrying questions that were not resolved before acceptance, but the clause alone does not prove that."
    does: "Delivers aggressively during initial months while maintaining external professional networks."
  -
    actor: "actor.employer_policy"
    sees: "Probation turnover rates and dismissal compliance documentation under the Ukrainian Labour Code's constraints."
    reads: "High probation turnover increases team onboarding costs while preserving statutory compliance."
    does: "Monitors probation pass rates and reviews termination justifications."
non_inferences:
  - "Does not establish that the employee committed gross misconduct."
  - "Probation rules define legal boundaries; they do not establish that employers systematically lower interview thresholds or use probation as a filtering strategy."
---

# Probation Used as Extended De-Facto Interview

An employer may rely on probation as an additional selection stage, using on-the-job assessment to resolve uncertainty that the interview process left open.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `incentive`
- **Removability:** `intermediary`

### Non-Inferences
- Does not establish that the employee committed gross misconduct.
- Probation rules define legal boundaries; they do not establish that employers systematically lower interview thresholds or use probation as a filtering strategy.
