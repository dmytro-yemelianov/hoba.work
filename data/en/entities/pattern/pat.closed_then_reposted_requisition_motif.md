---
id: "pat.closed_then_reposted_requisition_motif"
type: "pattern"
aliases:
  - "P-002"
title: "Closed-Then-Reposted Requisition Motif"
summary: "A candidate completes multiple late-stage interviews, is rejected with a generic message, and sees the identical role reposted weeks later."
required_artifacts:
  - "obs.position_closed_after_final_interview_without_hire"
  - "obs.materially_similar_role_reposted_shortly_after_rejection"
compatible_mechanisms:
  - "mech.stronger_competing_candidate_in_final_cohort"
  - "mech.stale_or_orphaned_job_requisition"
  - "mech.hidden_evaluation_rubric_or_undisclosed_priority"
  - "mech.mid_process_role_requirement_redefinition"
trigger_rule: "The role is closed and the candidate rejected, and a materially similar listing is publicly reopened within 60 days."
establishes:
  - "The interviewed pool did not meet the requisition's requirements or target profile, or the search criteria changed mid-process."
specimens:
  -
    kind: "ats"
    label: "The sequence, as recorded"
    context: "one requisition, eleven weeks"
    lines:
      -
        at: "week 0"
        text: "Applied — req #4471"
      -
        at: "week 2"
        text: "Recruiter screen — passed"
      -
        at: "week 4"
        text: "Technical panel — passed"
      -
        at: "week 5"
        text: "Final round with hiring manager — completed"
      -
        at: "week 6"
        text: "Rejected — generic template, no specifics given"
        tell: true
      -
        at: "week 11"
        text: "req #4471 visible on the careers page again, text unchanged"
        tell: true
    reading: "Late-stage progress, a contentless rejection, and the same requisition number back on the board. The sequence is the observation; its cause is not in the sequence."
  -
    kind: "chat"
    label: "The question that splits the branches"
    lines:
      -
        speaker: "Candidate"
        at: "week 11"
        text: "I saw req #4471 listed again. Is this a new opening on the team, or the same one?"
      -
        speaker: "Recruiter"
        at: "week 12"
        text: "Same requisition. We restarted the search with a revised profile after the first round of interviews."
        tell: true
    reading: "A revised profile, an automated refresh and a genuinely new headcount are three different mechanisms with one appearance. This is the question that tells them apart."
non_inferences:
  - "Does not establish that the original job listing was fake or a ghost job."
  - "Does not establish that the candidate was intentionally misled."
interventions:
  - "int.auto_close_stale_job_requisitions"
  - "int.standardized_late_stage_rejection_feedback_taxonomy"
  - "int.recorded_finalist_standing_with_a_dated_re_entry_route"
perspectives:
  -
    actor: "actor.candidate"
    sees: "A generic rejection after a final round, and the same requisition number back on the careers page weeks later with the text unchanged."
    reads: "Either the profile was revised, or the platform refreshed the listing, or the headcount is new — and the sequence on its own does not separate them."
    does: "Asks whether the listing is the same requisition, and records the dates and the answer before deciding whether to reapply."
  -
    actor: "actor.recruiter"
    sees: "The requisition record moving from closed back to open with a revised profile, and a rejection template that is the same for every candidate at that stage."
    reads: "This is one continuous search that changed shape, not two openings."
    does: "Sends the standard wording, since a specific reason given at the close of one round can be quoted back at the next, and states the restart when a candidate asks directly."
  -
    actor: "actor.hiring_manager"
    sees: "Two finalists at the end of a loop, and the work the role exists to absorb still uncovered."
    reads: "A loop that ended without a hire is information about the profile, and the profile is the part of this the manager controls."
    does: "Rewrites the requirements and restarts the search on the same requisition, because a new requisition would go back through funding."
  -
    actor: "actor.ats_vendor"
    sees: "A requisition whose status returned to open, and a scheduled refresh that pushes open listings back out to aggregators with a current date."
    reads: "An open requisition is a listing to distribute; the refresh reads the status field and not the history behind it."
    does: "Republishes under the original identifier and stamps the posting with today's date, which is the default behaviour for any open requisition."
status: "active"
evidence_level: "supported"
evidence_ids:
  - "evidence.job_seekers_beware_of_ghost_jobs_clarify_capital_survey_of_hiring_managers"
---

# Closed-Then-Reposted Requisition Motif

A candidate completes multiple late-stage interviews, is rejected with a generic message, and sees the identical role reposted weeks later.

### Trigger Rule
The role is closed and the candidate rejected, and a materially similar listing is publicly reopened within 60 days.

### What this Establishes
- The interviewed pool did not meet the requisition's requirements or target profile, or the search criteria changed mid-process.

### What this Does NOT Establish
- Does not establish that the original job listing was fake or a ghost job.
- Does not establish that the candidate was intentionally misled.
