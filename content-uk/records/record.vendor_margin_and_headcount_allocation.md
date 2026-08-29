---
id: "record.vendor_margin_and_headcount_allocation"
type: "record"
aliases:
  - "R-006"
title: "Маржинальний розподіл та фінансування позиції вендором"
record_class: "requisition-funding"
owner: "inside"
owner_actor: "employer-policy"
summary: "Внутрішній розподіл виручки вендора між валовою маржею та витратами на спеціаліста."
flows:
  - to: "record.subcontractor_compensation"
    label: "виплата винагороди інженеру на проєкті"
    percentage: 75
    fraction: 0.75
    split_type: "payroll"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Маржинальний розподіл та фінансування позиції вендором

Внутрішній розподіл виручки вендора між валовою маржею та витратами на спеціаліста.
