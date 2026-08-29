---
id: "mech.probation_used_as_extended_de_facto_interview"
type: "mechanism"
aliases:
  - "M-028"
title: "Probation Used as Extended De-Facto Interview"
summary: "Managers lower late-stage interview thresholds, treating the statutory probation period as an extended live trial where underperformance results in immediate low-friction dismissal."
operates_at:
  - "bar.probation_period_post_start_confirmation"
emissions:
  -
    artifact: "obs.offer_accepted_followed_by_delayed_start_date_or_post_signing_revocation"
    fidelity: "direct"
    likelihood: "medium"
    evidence:
      - "evidence.probation_period_limits_and_dismissal_standards_ukraine_labour_code_art_26_28"
      - "evidence.statutory_notice_and_contractual_probation_parameters_uk_employment_rights_act_1996"
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
evidence_level: "established"
evidence_ids:
  - "evidence.probation_period_limits_and_dismissal_standards_ukraine_labour_code_art_26_28"
  - "evidence.statutory_notice_and_contractual_probation_parameters_uk_employment_rights_act_1996"
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
    reading: "The interview process was truncated under the assumption that probation serves as the true filtering phase."
perspectives:
  -
    actor: "hiring-manager"
    sees: "Direct on-the-job output under real sprint pressure, treating probation as a higher-fidelity filter than multi-round panel interviews."
    reads: "Hiring fast and pruning early during probation reduces upfront interview coordination costs."
    does: "Replaces extensive technical testing with early probationary evaluation."
  -
    actor: "candidate"
    sees: "A full employment offer that operates in practice as a temporary contract with heightened termination exposure."
    reads: "The real hiring threshold was shifted post-start without explicit pre-acceptance disclosure."
    does: "Delivers aggressively during initial months while maintaining external professional networks."
  -
    actor: "employer-policy"
    sees: "Probation turnover rates and dismissal compliance documentation under the Ukrainian Labour Code's constraints."
    reads: "High probation turnover increases team onboarding costs while preserving statutory compliance."
    does: "Monitors probation pass rates and reviews termination justifications."
non_inferences:
  - "Does not establish that the employee committed gross misconduct."
---

# Probation Used as Extended De-Facto Interview

Managers lower late-stage interview thresholds, treating the statutory probation period as an extended live trial where underperformance results in immediate low-friction dismissal.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `incentive`
- **Removability:** `intermediary`

### Non-Inferences
- Does not establish that the employee committed gross misconduct.
