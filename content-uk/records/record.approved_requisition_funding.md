---
id: "record.approved_requisition_funding"
type: "record"
aliases:
  - "R-002"
title: "Затверджене фінансування вакансії"
record_class: "requisition-funding"
owner: "inside"
owner_actor: "hiring-manager"
summary: "Затверджене фінансування ставки та зарплатний діапазон для активної вакансії."
flows:
  - to: "record.direct_engineering_payroll"
    label: "виплата винагороди найнятому фахівцю"
    percentage: 100
    fraction: 1.0
    split_type: "payroll"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Затверджене фінансування вакансії

Затверджене фінансування ставки та зарплатний діапазон для активної вакансії.
