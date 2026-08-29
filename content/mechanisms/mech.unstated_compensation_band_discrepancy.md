---
id: "mech.unstated_compensation_band_discrepancy"
type: "mechanism"
aliases:
  - "M-004"
title: "Unstated Compensation Band Discrepancy"
summary: "Candidate market rate exceeds budgeted compensation for the requisition, but salary band was never published or clarified early."
operates_at:
  - "bar.recruiter_screening_call"
  - "bar.compensation_levelling_reconciliation"
emissions:
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.salary_transparency_growth_slows_but_momentum_continues_indeed_hiring_lab"]
    observed_at: ["recruiter"]
  -
    artifact: "obs.compensation_band_reduced_or_altered_mid_process"
    fidelity: "direct"
    likelihood: "medium"
    evidence: ["evidence.salary_transparency_growth_slows_but_momentum_continues_indeed_hiring_lab"]
  -
    artifact: "obs.feedback_stating_candidate_is_overqualified_for_the_grade"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["evidence.too_good_to_hire_capability_and_inferences_about_commitment_in_labor_markets"]
    observed_at: ["recruiter"]
facets:
  actor: "policy"
  nature: "rule"
  visibility: "opaque"
  removability: "intermediary"
amplifies:
  - "mech.mid_process_role_requirement_redefinition"
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "employer-policy"
    sees: "The approved maximum for the requisition, the levelling grid it sits on, and the disclosure rules that apply to the posting."
    reads: "The band is a control on cost across every hire. Whether it is published is a separate question, answered by the rules of the jurisdiction."
    does: "Sets the ceiling and what may be stated, on a cycle measured in quarters. The hours one process spends above that ceiling appear nowhere in that cycle."
  -
    actor: "recruiter"
    sees: "The approved maximum in the requisition, and the candidate's stated expectation from the screen."
    reads: "A gap here decides the outcome whatever the panel returns."
    does: "Chooses when the number is stated, which is the point where this can still be closed early. Saying it early ends a pipeline on a metric that is measured, and saves rounds on one that is not."
  -
    actor: "candidate"
    sees: "A posting with no band, and a question about expectations asked before any number is offered."
    reads: "The figure given can be checked against nothing. The band, the level and the grid are all outside what the candidate is shown."
    does: "States a range and records when it was asked and what was said. Asking for the band at the screen is the one point where the gap can surface early."
  -
    actor: "public-policy"
    sees: "Whether the posting falls inside a jurisdiction where a band must be stated, and whether a stated band appears."
    reads: "A published band closes the branch a disclosure rule reaches. The level a candidate is assessed at, and the grid behind it, sit outside the text of the rule."
    does: "Writes to what is enforceable and measurable, which is the presence of a number in a posting rather than the reconciliation that happens later."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.salary_transparency_growth_slows_but_momentum_continues_indeed_hiring_lab"
  - "evidence.publishing_the_band_before_the_interview_becomes_a_duty_in_the_eu_directive_2023_970_art_5"
specimens:
  -
    kind: "chat"
    label: "The number nobody published"
    lines:
      -
        speaker: "Recruiter"
        at: "week 4"
        text: "Before the manager round — what were your expectations again?"
      -
        speaker: "Candidate"
        at: "week 4"
        text: "85–95k, as I mentioned at the screen."
      -
        speaker: "Recruiter"
        at: "week 4"
        text: "Right. I should be straight with you: the approved budget for this req tops out at 74k. It was never in the posting."
        tell: true
    reading: "The mismatch existed on day one and surfaced in week four. Four rounds were spent on a gap that a published band would have shown immediately."
non_inferences:
  - "Rejection does not mean candidate is overpriced for the market, only mismatched with this specific employer budget."
---

# Unstated Compensation Band Discrepancy

Candidate market rate exceeds budgeted compensation for the requisition, but salary band was never published or clarified early.

### Structural Context
- **Actor:** `policy`
- **Nature:** `rule`
- **Removability:** `intermediary`

### Causal Relations
- Amplifies `mech.mid_process_role_requirement_redefinition` — Mid-Process Role Requirement Redefinition
- Masks `mech.genuine_technical_skill_shortfall` — Genuine Technical Skill Shortfall

### Non-Inferences
- Rejection does not mean candidate is overpriced for the market, only mismatched with this specific employer budget.
