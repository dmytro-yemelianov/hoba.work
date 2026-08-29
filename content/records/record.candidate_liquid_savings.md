---
id: "record.candidate_liquid_savings"
type: "record"
aliases:
  - "R-011"
title: "Candidate Liquid Savings"
record_class: "runway"
owner: "inside"
owner_actor: "actor.candidate"
summary: "Total liquid personal savings allocated to sustain the job search interval."
flows:
  - to: "record.candidate_search_runway"
    label: "search runway allocation"
    percentage: 100
    fraction: 1.0
    split_type: "burn"
visibility_default: "observable"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Candidate Liquid Savings

Total liquid personal savings allocated to sustain the job search interval.
