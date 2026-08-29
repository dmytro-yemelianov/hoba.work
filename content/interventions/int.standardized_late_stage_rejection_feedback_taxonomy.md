---
id: "int.standardized_late_stage_rejection_feedback_taxonomy"
type: "intervention"
aliases:
  - "I-003"
title: "Standardized Late-Stage Rejection Feedback Taxonomy"
summary: "Provide candidates reaching technical or panel stages with structured, rubric-based feedback categories rather than generic templates."
targets:
  - "mech.genuine_technical_skill_shortfall"
  - "mech.hidden_evaluation_rubric_or_undisclosed_priority"
  - "bar.hiring_manager_in_depth_review"
  - "bar.team_cross_functional_panel"
  - "bar.client_profile_approval_and_client_interview"
  - "pat.seniority_double_bind"
  - "pat.closed_then_reposted_requisition_motif"
  - "loop.inflated_requirements_search_saturation_loop"
actor: "recruiter-process"
scope: "organizational"
cost: "medium"
specimens:
  -
    kind: "email"
    label: "The rejection, rewritten to the taxonomy"
    subject: "Outcome — technical panel"
    lines:
      -
        text: "Category: technical depth · Sub-category: complexity reasoning · Round: technical panel, exercise 2"
        tell: true
      -
        text: "What we saw: a correct quadratic solution where the panel was looking for the linear approach, reached without prompting."
      -
        text: "What we did not assess: system design, collaboration, or domain knowledge — those rounds were positive or not reached."
      -
        text: "Re-application window: six months, straight to the technical panel."
    reading: "The same decision, expressed as a category with a scope. Note the second line: saying what was not assessed is what stops a single round becoming a verdict on the person."
perspectives:
  -
    actor: "recruiter"
    sees: "A panel recommendation, and a taxonomy that asks for a category, a round and a scope the recommendation does not contain."
    reads: "The wording is theirs to write, but the content is not: a category can only be sent where the panel recorded one."
    does: "Sends the structured note where the rubric was filled in, and the template where it was not."
  -
    actor: "hiring-manager"
    sees: "A rubric field per round that has to be completed before the outcome is recorded, and the same fields from the other interviewers."
    reads: "The cost is interviewer minutes booked before an outcome can be recorded; in return, two interviewers scoring one round differently becomes a number."
    does: "Records the category and what the round did not assess, and calibrates where the panel's entries disagree."
  -
    actor: "candidate"
    sees: "A category, the round it came from, an explicit list of what was not assessed, and a re-application window."
    reads: "One round stays a scored round rather than a verdict on the person, and the part of the process that was positive is stated rather than inferred."
    does: "Works on the named category, and reapplies inside the stated window instead of treating the door as closed."
  -
    actor: "employer-policy"
    sees: "A proposed change to what is sent to rejected candidates: from a template that says nothing to a note that names a category."
    reads: "Written feedback is consistent across every hire, which is what defensibility asks for, and is also a record that exists after the process ends."
    does: "Defines which categories may be sent and which may not, and that definition is the boundary the recruiter writes inside."
status: "active"
evidence_level: "supported"
expected_effects:
  - "The stage and the criterion behind a late rejection become part of what is sent"
  - "mech.hidden_evaluation_rubric_or_undisclosed_priority becomes checkable: a rubric that is reported has to exist before the round"
measurements:
  - "informative_feedback_ratio"
  - "interviewer_calibration_variance"
evidence_ids:
  - "EVD-006"
---

# Standardized Late-Stage Rejection Feedback Taxonomy

Provide candidates reaching technical or panel stages with structured, rubric-based feedback categories rather than generic templates.

### Expected Effects
- The stage and the criterion behind a late rejection become part of what is sent
- mech.hidden_evaluation_rubric_or_undisclosed_priority becomes checkable: a rubric that is reported has to exist before the round

### Measurements
- `informative_feedback_ratio`
- `interviewer_calibration_variance`
