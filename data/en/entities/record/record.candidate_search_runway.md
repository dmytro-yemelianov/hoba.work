---
id: "record.candidate_search_runway"
type: "record"
aliases:
  - "R-012"
title: "Candidate Search Runway"
record_class: "runway"
owner: "inside"
owner_actor: "actor.candidate"
summary: "Available runway in months derived from personal savings and monthly burn rate."
flows:
  - to: "record.search_month_burn_allocation"
    label: "monthly living expenditure"
    percentage: 100
    fraction: 1.0
    split_type: "burn"
visibility_default: "observable"
evidence_ids: []
status: "active"
evidence_level: "unknown"
---

# Candidate Search Runway

Available runway in months derived from personal savings and monthly burn rate.
