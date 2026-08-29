---
id: "actor.employer_policy"
type: "actor"
slug: "employer-policy"
title: "Employer policy"
summary: "Finance, leadership and the people function: the layer that authorises headcount, fixes bands and writes the rules the funnel executes. Never meets a candidate."
controls:
  - "Whether a requisition is funded, and whether it stays funded"
  - "The band and the levelling grid"
  - "Whether postings must be published externally regardless of internal candidates"
  - "What may be disclosed, and what must not be"
blind_to:
  - "What a freeze looks like from the far end of a five-round process"
  - "How a compliance posting reads to someone who spent six weeks on it"
  - "The cumulative candidate hours a policy consumes"
incentives:
  - "Optionality: an approved requisition that can be paused costs less than one that cannot"
  - "Consistency and legal defensibility across every hire"
  - "Cost control, on a cycle measured in quarters rather than in conversations"
aliases:
  facet:
    - "policy"
  intervention:
    - "employer-policy"
specimens:
  -
    kind: "note"
    label: "Where the decisions actually sit"
    lines:
      -
        text: "Requisition funded: finance · Band: compensation · Level: levelling committee"
      -
        text: "External posting required regardless of an internal candidate: policy"
        tell: true
      -
        text: "Interviews conducted: the team. Rejection sent: the recruiter."
      -
        text: "The candidate only ever meets the last two rows."
    reading: "Several observations in this registry are the visible end of a decision taken in a row the candidate never sees."
recommendations:
  -
    id: "publish-the-band-on-the-posting"
    title: "Publish the band on the posting itself"
    rationale: "The band and the levelling grid are set in this layer, and nothing downstream can disclose a number this layer has not released. Publishing it turns the reconciliation at bar.compensation_levelling_reconciliation into arithmetic rather than a conversation that happens for the first time after the panel."
    cost: "medium"
    costs: "The published number becomes a commitment the band cannot be quietly revised against mid-search, and it is legible to everyone already employed at that level."
    targets:
      - "mech.unstated_compensation_band_discrepancy"
      - "bar.recruiter_screening_call"
      - "bar.compensation_levelling_reconciliation"
      - "pat.compensation_double_bind"
    interventions:
      - "int.upfront_compensation_band_disclosure"
  -
    id: "fund-before-publication"
    title: "Sign the headcount before the role is published"
    rationale: "This layer decides whether a requisition is funded, and bar.headcount_executive_budget_approval is the only gate that stops a process after every person the candidate met has said yes. Moving the finance signature ahead of publication makes the later approval a countersignature, so a published role is one whose headcount already exists."
    cost: "high"
    costs: "Budget is committed at publication rather than at the offer, and a requisition funded in advance is harder to pause than one approved at the end."
    targets:
      - "bar.headcount_executive_budget_approval"
      - "bar.requisition_approval_public_posting"
      - "mech.headcount_freeze_or_budget_cancellation"
      - "obs.position_closed_after_final_interview_without_hire"
    interventions: []
  -
    id: "expire-listing-when-authorisation-lapses"
    title: "Expire the listing when its authorisation lapses"
    rationale: "Whether a requisition stays funded is decided here, and that fact reaches no configuration screen on its own. A rule that withdraws the listing when authorisation lapses, and notifies everyone still inside the process, closes the gap between the decision and what the page shows."
    cost: "medium"
    costs: "A paused search cannot be kept warm: reopening means another trip through the approval chain and a posting that restarts from zero applicants, which is a direct charge on this layer's optionality."
    targets:
      - "mech.stale_or_orphaned_job_requisition"
      - "mech.headcount_freeze_or_budget_cancellation"
      - "bar.application_ingestion"
      - "pat.closed_then_reposted_requisition_motif"
      - "loop.inflated_requirements_search_saturation_loop"
      - "obs.complete_silence_after_submission"
      - "obs.position_closed_after_final_interview_without_hire"
      - "obs.offer_rescinded_or_delayed_due_to_internal_freeze"
    interventions:
      - "int.auto_close_stale_job_requisitions"
  -
    id: "declare-internal-candidacy-on-the-posting"
    title: "State on the posting that an internal candidacy exists"
    rationale: "The rule that a role is published externally regardless of an internal candidate sits in this layer, and so does what the posting may say. One line stating that an internal candidacy is in process gives an external applicant, at the point of applying, the fact the panel already has."
    cost: "medium"
    costs: "The external pool for those postings shrinks, which weakens the same posting as evidence of an open search, and an internal candidacy goes in writing before the search has concluded."
    targets:
      - "mech.pre_selected_internal_candidate"
      - "bar.requisition_approval_public_posting"
      - "obs.generic_closer_alignment_rejection_template"
      - "obs.position_closed_after_final_interview_without_hire"
    interventions: []
  -
    id: "scope-checks-and-show-discrepancies"
    title: "Narrow the checks and show the candidate any discrepancy"
    rationale: "Which checks a role requires, and whether a third-party record is put to the candidate before it decides anything, are both settled in this layer. At bar.reference_background_verification a mismatch between a vendor record and an application holds the offer, and only a policy rule makes the candidate's account part of the file before the hold becomes a decision."
    cost: "medium"
    costs: "Every discrepancy adds a round trip before countersignature, and the single standard check pack has to be split by role instead of running identically on every hire."
    targets:
      - "bar.reference_background_verification"
      - "bar.offer_closing_contract_execution"
      - "mech.reference_check_discrepancy_or_regulatory_ineligibility"
    interventions: []
status: "active"
evidence_level: "supported"
evidence_ids: []
---

# Employer policy

Finance, leadership and the people function: the layer that authorises headcount, fixes bands and writes the rules the funnel executes. Never meets a candidate.
