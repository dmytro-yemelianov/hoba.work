---
id: "record.vendor_margin_and_headcount_allocation"
type: "record"
aliases:
  - "R-006"
title: "Vendor Margin and Headcount Allocation"
record_class: "requisition-funding"
owner: "inside"
owner_actor: "employer-policy"
summary: "Internal vendor allocation splitting client billing into gross margin and candidate cost."
flows:
  - to: "record.subcontractor_compensation"
    label: "contractor payroll allocation"
    percentage: 75
    fraction: 0.75
    split_type: "payroll"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Vendor Margin and Headcount Allocation

Internal vendor allocation splitting client billing into gross margin and candidate cost.
