---
id: "record.employer_hiring_and_sourcing_budget"
type: "record"
aliases:
  - "R-008"
title: "Employer Hiring and Sourcing Budget"
record_class: "budget-line"
owner: "inside"
owner_actor: "employer-policy"
summary: "Operational recruiting budget covering external agency fees and search costs."
flows:
  - to: "record.contingency_placement_fee_commitment"
    label: "success fee commitment"
    percentage: 100
    fraction: 1.0
    split_type: "allocation"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Employer Hiring and Sourcing Budget

Operational recruiting budget covering external agency fees and search costs.
