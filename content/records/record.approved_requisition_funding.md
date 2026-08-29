---
id: "record.approved_requisition_funding"
type: "record"
aliases:
  - "R-002"
title: "Approved Requisition Funding"
record_class: "requisition-funding"
owner: "inside"
owner_actor: "hiring-manager"
summary: "Headcount allocation and salary band approved for the active requisition."
flows:
  - to: "record.direct_engineering_payroll"
    label: "hired candidate compensation"
    percentage: 100
    fraction: 1.0
    split_type: "payroll"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Approved Requisition Funding

Headcount allocation and salary band approved for the active requisition.
