---
id: "mech.automated_application_expiration_timeout"
type: "mechanism"
aliases:
  - "M-020"
title: "Automated Application Expiration Timeout"
summary: "The ATS is configured to reject in bulk every application still pending after 45 or 60 days."
operates_at:
  - "bar.application_ingestion"
  - "bar.inbound_screening_triage"
emissions:
  -
    artifact: "obs.rejection_after_the_application_sat_pending_for_months"
    fidelity: "direct"
    likelihood: "high"
    evidence: []
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "void"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["screening"]
  -
    artifact: "obs.complete_silence_after_submission"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["ingestion"]
facets:
  actor: "system"
  nature: "rule"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks:
  - "mech.stale_or_orphaned_job_requisition"
perspectives:
  -
    actor: "actor.ats_vendor"
    sees: "A scheduled job, the records matching status and age, and a count of notifications queued. Review activity is a stored field, and the threshold does not consult it."
    reads: "Records past the threshold are stale queue state. Nothing in the schema separates an application nobody opened from one that was assessed and declined."
    does: "Runs the job at the customer's configured threshold and sends the configured template. The setting ships enabled, and switching it off is a customer action."
  -
    actor: "actor.recruiter"
    sees: "The queue depth on the requisition drops overnight, and applications the recruiter never opened now carry the status Rejected."
    reads: "The backlog cleared at the threshold rather than through screening. The binding constraint was never a decision, but how many applications fit into the week."
    does: "Works the current inbound, which is what time-to-fill is measured against. The expired batch is not itemised anywhere the recruiter is asked to account for it."
  -
    actor: "actor.candidate"
    sees: "A rejection weeks after applying, in the same wording used for a rejection after an interview."
    reads: "A decision about the application. Nothing in the message separates a person's decision from a scheduled status change, and nothing says whether the role was live."
    does: "Records the date and stops following up. Whether to apply to this employer again is decided on a message that carries no reason."
  -
    actor: "actor.public_policy_and_industry_standards"
    sees: "The class of practice rather than the batch: an application status changed by rule, in jurisdictions where automated decision-making carries disclosure or explanation duties."
    reads: "A scheduled expiry is a decision only where the framing counts it as one. Where the rule lives on a configuration screen with a default, no filing records that a decision was made."
    does: "The available lever is a rule written for a class of systems — disclosure, explainability, a right to human review — and it arrives on a cycle longer than the threshold it would govern."
status: "active"
evidence_level: "proven"
honest_baseline: false
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
specimens:
  -
    kind: "ats"
    label: "Bulk expiry, as logged"
    context: "one batch, 312 applications"
    lines:
      -
        at: "02:00"
        text: "Scheduled job: expire_stale_applications"
      -
        at: "02:00"
        text: "Selecting applications with status=submitted and age>60d — 312 matched"
      -
        at: "02:00"
        text: "Human review recorded on 0 of 312"
        tell: true
      -
        at: "02:01"
        text: "Status set to Rejected — 312 notification emails queued"
    reading: "The rejection email is real and the review it implies never happened. Timing is the tell: everyone in the batch is notified in the same minute."
non_inferences:
  - "A bulk timeout rejection carries no assessment of the profile at all."
---

# Automated Application Expiration Timeout

The ATS is configured to reject in bulk every application still pending after 45 or 60 days.

### Structural Context
- **Actor:** `system`
- **Nature:** `rule`
- **Removability:** `none`

### Causal Relations
- Masks `mech.stale_or_orphaned_job_requisition` — Stale or Orphaned Job Requisition

### Non-Inferences
- A bulk timeout rejection carries no assessment of the profile at all.
