---
id: "int.outreach_states_the_requisition_behind_it"
type: "intervention"
aliases:
  - "I-009"
title: "Outreach States the Requisition Behind It"
summary: "Every outbound message names the requisition it is sent against and its state — approved and open, or a pool record against a forecast — and the pool records opened against a forecast are answered on the day planning decides it."
targets:
  - "bar.outbound_sourcing_talent_pool_contact"
  - "mech.speculative_sourcing_talent_pooling_without_opening"
  - "mech.bid_conditional_talent_pool"
actor: "recruiter-process"
scope: "organizational"
cost: "low"
evidence_level: "supported"
expected_effects:
  - "bar.outbound_sourcing_talent_pool_contact's pass condition is stated in the first message: whether a reply attaches to an authorised requisition or to a pool is part of what is sent"
  - "mech.speculative_sourcing_talent_pooling_without_opening becomes datable — a conversation held against an unapproved forecast carries the planning date it depends on"
  - "The silence after a speculative conversation acquires a bound: the planning decision goes to the records opened against that forecast"
measurements:
  - "unattached_outreach_rate"
  - "pool_record_age_days"
  - "planning_decision_notice_rate"
specimens:
  -
    kind: "chat"
    label: "The first message, and what it was attached to"
    subject: "Two outreach templates, one week apart"
    lines:
      -
        at: "day 0"
        speaker: "Recruiter"
        text: "Req 5512, approved, open since 4 May, level L4. This is sent against that requisition — if you reply, that is the process you enter."
        tell: true
      -
        at: "day 7"
        speaker: "Recruiter"
        text: "No requisition yet. This is a pool record against a Q3 forecast; planning decides on 12 September and you get the outcome either way."
        tell: true
      -
        at: "day 7"
        speaker: "Candidate"
        text: "Understood — the second one I will answer in September."
      -
        at: "12 Sep"
        speaker: "Recruiter"
        text: "Planning outcome: the forecast moved to Q1. The pool record is closed and I am not holding it open."
    reading: "Two templates instead of one. Whoever reads either of them knows which of the two conversations they are in before spending anything on it."
perspectives:
  -
    actor: "recruiter"
    sees: "Two outreach templates in the sequencer, and the field on the contact record that decides which one goes out."
    reads: "The reply rate on the pool template is not the reply rate on the requisition template, and both are counted against the same outreach target."
    does: "Sends the template the record's state selects, and books the planning date as the day the pool records opened against that forecast are answered."
  -
    actor: "candidate"
    sees: "A first message that says which of the two it is, with a requisition number on it or a planning date."
    reads: "A conversation against a forecast and a live process are separable before answering, and the silence that follows a deferred forecast has a date on it."
    does: "Answers both, and schedules rounds against the one with a requisition behind it."
  -
    actor: "employer-policy"
    sees: "Outreach going out under a template that names the approval state of headcount the approval cycle has not decided."
    reads: "A forecast named outside the company is a planning signal leaving the approval cycle before that cycle has settled anything."
    does: "Decides which forecasts may be named in outreach and which may only be described as a pool, and that decision is the boundary the templates are written inside."
status: "active"
evidence_ids:
  - "evidence.postings_without_a_fillable_requisition_measured_on_one_ats_platform_greenhouse"
---

# Outreach States the Requisition Behind It

Every outbound message names the requisition it is sent against and its state — approved and open, or a pool record against a forecast — and the pool records opened against a forecast are answered on the day planning decides it.

### Expected Effects
- bar.outbound_sourcing_talent_pool_contact's pass condition is stated in the first message: whether a reply attaches to an authorised requisition or to a pool is part of what is sent
- mech.speculative_sourcing_talent_pooling_without_opening becomes datable — a conversation held against an unapproved forecast carries the planning date it depends on
- The silence after a speculative conversation acquires a bound: the planning decision goes to the records opened against that forecast

### Measurements
- `unattached_outreach_rate`
- `pool_record_age_days`
- `planning_decision_notice_rate`
