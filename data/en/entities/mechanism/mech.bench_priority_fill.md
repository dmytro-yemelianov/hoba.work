---
id: "mech.bench_priority_fill"
type: "mechanism"
aliases:
  - "M-026"
title: "Bench-Priority Fill"
summary: "An engineer already employed and between projects becomes available mid-search, and the seat the external candidate is interviewing for is filled from the bench."
operates_at:
  - "bar.requisition_approval_public_posting"
  - "bar.inbound_screening_triage"
emissions:
  -
    artifact: "obs.generic_closer_alignment_rejection_template"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: []
    observed_at: ["screening"]
  -
    artifact: "obs.position_closed_after_final_interview_without_hire"
    observed_at: ["offer"]
    fidelity: "void"
    likelihood: "medium"
    evidence: []
  -
    artifact: "obs.rejection_naming_an_internal_hire_as_the_outcome"
    observed_at: ["offer"]
    fidelity: "direct"
    likelihood: "medium"
    evidence: []
facets:
  actor: "policy"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks: []
evidence_level: "compatible"
honest_baseline: true
evidence_ids: []
specimens:
  -
    kind: "ats"
    label: "Requisition timeline"
    lines:
      -
        at: "05 May"
        text: "Requisition opened — client seat, external search approved"
      -
        at: "26 May"
        text: "External candidate at panel stage"
      -
        at: "28 May"
        text: "Internal availability: engineer rolling off project end of month"
        tell: true
      -
        at: "02 Jun"
        text: "Requisition closed — filled internally"
    reading: "Nothing in the record was decided against the external candidate. A person the company already pays became free, and an employed engineer on the bench costs the margin every idle week. The search ended because its reason did."
perspectives:
  -
    actor: "actor.candidate"
    sees: "A process that was moving, then a closure — sometimes naming an internal hire, sometimes just the search ending."
    reads: "Indistinguishable from a role that was promised internally before it was posted. The difference — whether the internal person was available when the search began or became available during it — sits in a staffing record no message describes."
    does: "Notes the interval between the last positive signal and the closure; a short one is the only outside trace of an availability that changed mid-search."
  -
    actor: "actor.employer_policy"
    sees: "A bench that costs salary against no billing, and an open seat that fits someone on it."
    reads: "Filling the seat from the bench converts an idle cost into billed work in one move; continuing an external search past that point pays twice for the same seat."
    does: "Fills from the bench as soon as the dates line up, and closes the external search that the bench has made redundant."
  -
    actor: "actor.client"
    sees: "A seat filled on schedule with a profile the vendor vouches for, often faster than an external start date could have landed."
    reads: "Whether the person came from a search or from the bench is invisible in the deliverable, and the contract does not ask."
    does: "Accepts the staffing, unaware an external process ended somewhere so that this one could close on time."
non_inferences:
  - "Does not establish that the internal candidate was earmarked before the search was published — that is mech.pre_selected_internal_candidate, and from the outside the two are the same."
  - "Does not mean the external assessment found the candidate short: the search can end for reasons that never reached the assessment."
---

# Bench-Priority Fill

An engineer already employed and between projects becomes available mid-search, and the seat the external candidate is interviewing for is filled from the bench.

### Structural Context
- **Actor:** `policy`
- **Nature:** `incentive`
- **Removability:** `none`

### Non-Inferences
- Does not establish that the internal candidate was earmarked before the search was published — that is mech.pre_selected_internal_candidate, and from the outside the two are the same.
- Does not mean the external assessment found the candidate short: the search can end for reasons that never reached the assessment.
