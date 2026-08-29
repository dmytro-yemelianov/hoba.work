---
id: "mech.speculative_sourcing_talent_pooling_without_opening"
type: "mechanism"
aliases:
  - "M-016"
title: "Speculative Sourcing / Talent Pooling Without Opening"
summary: "Recruiters open conversations and build candidate pools against headcount that has not been approved or funded."
operates_at:
  - "bar.requisition_approval_public_posting"
  - "bar.outbound_sourcing_talent_pool_contact"
  - "bar.inbound_screening_triage"
  - "bar.recruiter_screening_call"
emissions:
  -
    artifact: "obs.unsolicited_recruiter_outreach_followed_by_ghosting"
    fidelity: "distortion"
    likelihood: "high"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
  -
    artifact: "obs.complete_silence_after_submission"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["evidence.hidden_workers_untapped_talent_hbs_accenture"]
    observed_at: ["sourcing"]
facets:
  actor: "recruiter"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies:
  - "mech.recruiter_volume_quota_incentive_distortion"
masks: []
perspectives:
  -
    actor: "actor.recruiter"
    sees: "Planning signals about headcount that is not yet approved, and a market where the profiles worth contacting are contacted early."
    reads: "A pipeline built now converts if the requisition lands; a pipeline built after approval starts from zero, and time-to-fill is measured either way."
    does: "Opens conversations ahead of approval and holds them with no stage to move them into until the headcount is decided."
  -
    actor: "actor.candidate"
    sees: "Direct outreach describing a specific role, then a conversation, then no reply — and no posting to check the role against."
    reads: "Silence after a specific conversation reads as an assessment of the profile. Nothing in the exchange separates that from a requisition that was never opened."
    does: "Asks whether a requisition exists and is funded before spending rounds on it, and treats the answer as the date the process actually starts."
  -
    actor: "actor.employer_policy"
    sees: "Headcount requests arriving at planning with named candidates already attached to them."
    reads: "A team ready to move quickly if the role is approved. The conversations that produced the names are not part of the approval record."
    does: "Decides funding on the quarterly cycle, and an approval or a deferral closes conversations this layer never saw."
  -
    actor: "actor.ats_vendor"
    sees: "Contact records held in a talent pool with no requisition attached, and nurture sequences configured against them."
    reads: "A supported workflow behaving normally. The platform does not require a requisition to exist before outreach is sent from it."
    does: "Ships the pool, the sequences and the expiry defaults; whether a record is attached to an open requisition stays a field the customer fills or leaves blank."
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "evidence.hidden_workers_untapped_talent_hbs_accenture"
specimens:
  -
    kind: "chat"
    label: "What the outreach was actually for"
    lines:
      -
        speaker: "Candidate"
        at: "day 1"
        text: "Great talking today. To set expectations — is there an open requisition behind this?"
      -
        speaker: "Recruiter"
        at: "day 1"
        text: "Not yet. We are building a bench ahead of the Q3 planning round; if the headcount is approved you would be first in line."
        tell: true
      -
        speaker: "Candidate"
        at: "day 1"
        text: "Understood, thanks for saying so."
    reading: "A straight answer converts a mystery into a schedule. The same silence three months later means something entirely different once this line exists."
non_inferences:
  - "Ghosting after an outbound message indicates the absence of an immediate opening, not a rejection of the profile."
---

# Speculative Sourcing / Talent Pooling Without Opening

Recruiters open conversations and build candidate pools against headcount that has not been approved or funded.

### Structural Context
- **Actor:** `recruiter`
- **Nature:** `incentive`
- **Removability:** `none`

### Causal Relations
- Amplifies `mech.recruiter_volume_quota_incentive_distortion` — Recruiter Volume & Quota Incentive Distortion

### Non-Inferences
- Ghosting after an outbound message indicates the absence of an immediate opening, not a rejection of the profile.
