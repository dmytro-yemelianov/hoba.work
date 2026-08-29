---
id: "int.auto_close_stale_job_requisitions"
type: "intervention"
aliases:
  - "I-001"
title: "Auto-Close Stale Job Requisitions"
summary: "Implement automated ATS policy to expire public listings when headcount authorisation lapses or no interview activity occurs within 60 days."
targets:
  - "mech.stale_or_orphaned_job_requisition"
  - "bar.application_ingestion"
  - "pat.closed_then_reposted_requisition_motif"
  - "loop.inflated_requirements_search_saturation_loop"
actor: "employer-policy"
scope: "organizational"
cost: "low"
specimens:
  -
    kind: "ats"
    label: "The rule, and what it did"
    lines:
      -
        at: "config"
        text: "Policy: expire_listing when headcount_authorisation lapses OR no interview activity for 45 days"
      -
        at: "02:00"
        text: "req #4471 — last interview activity 47 days ago → listing withdrawn from careers page and aggregators"
        tell: true
      -
        at: "02:01"
        text: "Candidates with applications in flight: 84 — each notified that the search has closed, with the date."
    reading: "The same batch job that produces silent bulk rejections can be pointed at the listing instead of the candidate. The cost is a configuration line."
perspectives:
  -
    actor: "employer-policy"
    sees: "A configuration line, and the count of open requisitions it would withdraw this quarter, on the same cycle where headcount is reviewed."
    reads: "What is being spent is optionality: a listing that closes on a timer cannot be held open while funding is decided, and reopening it runs the approval chain again."
    does: "Sets the interval and what counts as activity, and decides whether a lapsed authorisation withdraws the listing or only flags it for review."
  -
    actor: "recruiter"
    sees: "Listings dropping off the careers page overnight, and the batch notification going to every application still in flight against them."
    reads: "A requisition closed on a timer is counted as closed rather than filled, and the pipeline built against it is gone if the search restarts."
    does: "Sends the closure notice with the date on it, and asks for the requisition to be reopened where the manager still intends to hire."
  -
    actor: "candidate"
    sees: "A message naming the requisition, the date the search closed, and the reason the listing came down."
    reads: "The process ended for a reason that has nothing to do with the application; there is nothing further to wait for and nothing left to infer."
    does: "Closes the file, stops holding capacity for a possible next round, and reapplies if the role is posted again."
  -
    actor: "ats-vendor"
    sees: "A customer enabling an expiry rule pointed at the listing, on the same scheduler that already expires unreviewed applications."
    reads: "This is an existing batch capability with a different target rather than new machinery; whether it runs is a customer setting."
    does: "Ships the rule as a configurable option, and its default value decides how many customers ever run it."
status: "active"
evidence_level: "supported"
expected_effects:
  - "mech.stale_or_orphaned_job_requisition stops operating: a listing cannot outlive the authorisation that funded it"
  - "Silence after applying acquires a bound — the record is closed and the closure is sent"
measurements:
  - "stale_requisition_rate"
  - "closure_latency_days"
evidence_ids:
  - "EVD-004"
---

# Auto-Close Stale Job Requisitions

Implement automated ATS policy to expire public listings when headcount authorisation lapses or no interview activity occurs within 60 days.

### Expected Effects
- mech.stale_or_orphaned_job_requisition stops operating: a listing cannot outlive the authorisation that funded it
- Silence after applying acquires a bound — the record is closed and the closure is sent

### Measurements
- `stale_requisition_rate`
- `closure_latency_days`
