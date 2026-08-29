---
id: "mech.pre_selected_internal_candidate"
type: "mechanism"
aliases:
  - "M-005"
title: "Pre-Selected Internal Candidate"
summary: "Requisition was publicly advertised to satisfy corporate policy or legal compliance while an internal employee was already earmarked for the role."
operates_at:
  - "bar.requisition_approval_public_posting"
  - "bar.application_ingestion"
  - "bar.inbound_screening_triage"
  - "bar.hiring_manager_in_depth_review"
emissions:
  -
    artifact: "obs.rejection_naming_an_internal_hire_as_the_outcome"
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
    observed_at: ["screening"]
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "policy"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks:
  - "mech.stronger_competing_candidate_in_final_cohort"
perspectives:
  -
    actor: "employer-policy"
    sees: "A funded requisition, and a posting rule that applies to every requisition regardless of who already works inside the scope."
    reads: "Consistency across hires is what makes a process defensible. A rule that holds for all requisitions cannot be switched off for one."
    does: "Publishes externally as the rule requires. What happens to the external pipeline afterwards is not reported back to this layer."
  -
    actor: "hiring-manager"
    sees: "Someone already covering part of the scope, and a slate of external candidates each assessed inside the hours the loop allows."
    reads: "Work already observed and work inferred from an interview are not the same evidence. Only one person on the slate has been watched doing the work itself."
    does: "Runs the external loop as posted and assesses each candidate against a bar the internal work already meets."
  -
    actor: "candidate"
    sees: "A live posting, scheduled rounds, and interviewers who prepare. The composition of the slate is not stated."
    reads: "Nothing in the process distinguishes it from one that is open. Whether a requisition is already promised internally is not a field the candidate is shown."
    does: "Can ask at the final round how many are being seen and whether any are internal. That answer is available on request and absent without one."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
  - "evidence.openings_that_exist_because_a_rule_requires_them_ukraine_civil_service_competitions"
specimens:
  -
    kind: "transcript"
    label: "Final round, an aside"
    context: "minute 41"
    lines:
      -
        speaker: "Candidate"
        at: "41:02"
        text: "How many people are you seeing for this?"
      -
        speaker: "Hiring manager"
        at: "41:11"
        text: "You are the third external. There is also someone internal who has been covering part of the scope since spring."
        tell: true
      -
        speaker: "Candidate"
        at: "41:26"
        text: "Understood. Is that a formal candidacy?"
      -
        speaker: "Hiring manager"
        at: "41:31"
        text: "It is. We post externally regardless — that is policy."
    reading: "Nothing improper is described. The posting is real, the process is real, and the odds were set before the first external application arrived."
non_inferences:
  - "Cannot be asserted as fact without internal hiring log confirmation."
---

# Pre-Selected Internal Candidate

Requisition was publicly advertised to satisfy corporate policy or legal compliance while an internal employee was already earmarked for the role.

### Structural Context
- **Actor:** `policy`
- **Nature:** `incentive`
- **Removability:** `none`

### Causal Relations
- Masks `mech.stronger_competing_candidate_in_final_cohort` — Stronger Competing Candidate in Final Cohort

### Non-Inferences
- Cannot be asserted as fact without internal hiring log confirmation.
