---
id: "mech.mid_process_role_requirement_redefinition"
type: "mechanism"
aliases:
  - "M-013"
title: "Mid-Process Role Requirement Redefinition"
summary: "The team changes the stack, the seniority level or the project scope while candidates are mid-process, and the assessments already taken no longer apply."
operates_at:
  - "bar.hiring_manager_in_depth_review"
  - "bar.team_cross_functional_panel"
  - "bar.compensation_levelling_reconciliation"
emissions:
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
    observed_at: ["team"]
  -
    artifact: "obs.materially_similar_role_reposted_shortly_after_rejection"
    observed_at: ["sourcing"]
    fidelity: "direct"
    likelihood: "high"
    evidence: ["evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"]
facets:
  actor: "hiring-manager"
  nature: "noise"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "mech.unstated_compensation_band_discrepancy"
  - "mech.inflated_requisition_requirements_vs_actual_team_needs"
masks:
  - "mech.genuine_technical_skill_shortfall"
perspectives:
  -
    actor: "actor.hiring_manager"
    sees: "The scope the role has to absorb has moved since the requisition was written, and the panel notes in front of them were taken against the earlier description."
    reads: "Strong notes against a target that no longer exists. Re-running four rounds costs the team weeks it is already short of."
    does: "Rewrites the requirements, re-scores the existing notes against them, and decides at which level, if any, the candidate is still a candidate."
  -
    actor: "actor.recruiter"
    sees: "A requisition whose description changes while candidates are mid-loop, and a hiring manager asking for a profile that was not in the original brief."
    reads: "The pipeline built for the old brief no longer converts, and time-to-fill keeps counting from the date the requisition first opened."
    does: "Restates the role to everyone still in process, or closes them out with the standard wording and sources again against the new description."
  -
    actor: "actor.candidate"
    sees: "Four rounds of positive signal, then a rejection describing a role different from the one applied to, and a materially similar posting on the board afterwards."
    reads: "The rounds were passed and the target moved, or the rounds were not passed and the changed description is the courteous version. Both readings fit the same email."
    does: "Records the original description, the dates, and the wording of the change, and decides whether to ask which requirement is the new one."
  -
    actor: "actor.employer_policy"
    sees: "An amended requisition arriving for re-approval at a different level or band, with the original still counted as open."
    reads: "A level and band change on a requisition already approved, which is what the levelling grid exists to settle. Nothing in the amendment records the interview hours already spent against the old scope."
    does: "Approves or refuses the new level and band, and the process resumes or stops at the reconciliation step."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
specimens:
  -
    kind: "email"
    label: "The role that changed underneath"
    lines:
      -
        text: "Thank you for the four rounds — the panel notes were strong throughout."
      -
        text: "Since we opened this req the team has moved the service to Rust and folded the on-call leadership into the role. Weighted against the new profile we are looking for someone with production Rust and formal lead experience."
        tell: true
      -
        text: "I recognise you interviewed against the previous description. I am sorry about that."
    reading: "The assessments were not re-run; they were re-scored against a target that moved after they were taken."
non_inferences:
  - "The rejection was driven by a shift in the team's mandate, not by the candidate's interview answers."
---

# Mid-Process Role Requirement Redefinition

The team changes the stack, the seniority level or the project scope while candidates are mid-process, and the assessments already taken no longer apply.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `noise`
- **Removability:** `none`

### Causal Relations
- Amplifies `mech.unstated_compensation_band_discrepancy` — Unstated Compensation Band Discrepancy
- Amplifies `mech.inflated_requisition_requirements_vs_actual_team_needs` — Inflated Requisition Requirements vs Actual Team Needs
- Masks `mech.genuine_technical_skill_shortfall` — Genuine Technical Skill Shortfall

### Non-Inferences
- The rejection was driven by a shift in the team's mandate, not by the candidate's interview answers.
