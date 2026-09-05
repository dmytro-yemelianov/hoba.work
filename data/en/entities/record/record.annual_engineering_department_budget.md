---
id: "record.annual_engineering_department_budget"
type: "record"
aliases:
  - "R-001"
title: "Annual Engineering Department Budget"
record_class: "budget-line"
owner: "inside"
owner_actor: "actor.employer_policy"
summary: "Annual operating budget allocation assigned to engineering department headcount."
flows:
  - to: "record.approved_requisition_funding"
    label: "requisition headcount allocation"
    percentage: 100
    fraction: 1.0
    split_type: "allocation"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "unknown"
---

# Annual Engineering Department Budget

Annual operating budget allocation assigned to engineering department headcount.
