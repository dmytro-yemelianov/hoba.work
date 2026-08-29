---
id: "mech.headcount_freeze_or_budget_cancellation"
type: "mechanism"
aliases:
  - "M-007"
title: "Headcount Freeze or Budget Cancellation"
summary: "Executive leadership or finance halts all new hires across division due to macroeconomic factors or revenue shifts mid-interview process."
operates_at:
  - "bar.team_cross_functional_panel"
  - "bar.headcount_executive_budget_approval"
  - "bar.offer_closing_contract_execution"
emissions:
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
  -
    artifact: "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "policy"
  nature: "rule"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "mech.stale_or_orphaned_job_requisition"
masks:
  - "mech.genuine_technical_skill_shortfall"
  - "mech.stronger_competing_candidate_in_final_cohort"
perspectives:
  -
    actor: "actor.employer_policy"
    sees: "The register of open requisitions and the forecast the quarter is planned against. Which of those requisitions has a person standing in a final round is not a field in that view."
    reads: "An approved requisition is an option that can be paused, and pausing costs less than carrying it. The decision is taken at the level of the division, not of a process."
    does: "Suspends funding across the division from a stated date and passes the instruction downward. The processes already running are closed by the people holding them."
  -
    actor: "actor.recruiter"
    sees: "A date on which the requisition changes state in the system, and the instruction that arrives with it. The forecast behind it is not something the recruiter is shown."
    reads: "The pipeline is intact and has nowhere to arrive. Time-to-fill on this requisition stops being a number anyone can move."
    does: "Cancels the scheduled rounds and writes the message. The wording is the recruiter's; what may be disclosed is not."
  -
    actor: "actor.hiring_manager"
    sees: "The requisition is no longer funded, and the work it was opened to absorb stays with the team. The panel's recommendation now decides nothing."
    reads: "The search has ended for a reason that is not in the loop and not in the candidates. The gap remains, and the date it reopens is not the manager's to set."
    does: "Stops convening panels and redistributes the work across the team. Anyone already in the loop is handed to the recruiter to close."
  -
    actor: "actor.candidate"
    sees: "A final round cancelled, or an offer that does not arrive, on a date, with whatever reason the message states."
    reads: "The timing sits directly after the rounds already completed, so a cause above the process and a verdict on the process look the same from here."
    does: "Records the date and the wording, asks whether the requisition is paused or closed, and keeps the other processes running."
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
specimens:
  -
    kind: "email"
    label: "The freeze, as announced downward"
    lines:
      -
        text: "I have to pause our process. A hiring freeze was announced across the division this morning, effective immediately."
        tell: true
      -
        text: "Your final round was scheduled for Thursday. I am cancelling it rather than having you prepare for something I cannot honour."
      -
        text: "I will tell you plainly when I know anything, including if the answer is that this will not reopen."
    reading: "The cause is above the hiring loop and dated. Whether it is checkable against public news is the probe worth running."
non_inferences:
  - "Candidate performance in interview was not the causal trigger for process termination."
---

# Headcount Freeze or Budget Cancellation

Executive leadership or finance halts all new hires across division due to macroeconomic factors or revenue shifts mid-interview process.

### Structural Context
- **Actor:** `policy`
- **Nature:** `rule`
- **Removability:** `none`

### Causal Relations
- Amplifies `mech.stale_or_orphaned_job_requisition` — Stale or Orphaned Job Requisition
- Masks `mech.genuine_technical_skill_shortfall` — Genuine Technical Skill Shortfall
- Masks `mech.stronger_competing_candidate_in_final_cohort` — Stronger Competing Candidate in Final Cohort

### Non-Inferences
- Candidate performance in interview was not the causal trigger for process termination.
