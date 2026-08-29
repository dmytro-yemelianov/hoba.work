---
id: "record.annual_engineering_department_budget"
type: "record"
aliases:
  - "R-001"
title: "Річний бюджет інженерного департаменту"
record_class: "budget-line"
owner: "inside"
owner_actor: "actor.employer_policy"
summary: "Річний операційний бюджетний ліміт, виділений на фонд оплати праці інженерних команд."
flows:
  - to: "record.approved_requisition_funding"
    label: "виділення коштів під реквізицію"
    percentage: 100
    fraction: 1.0
    split_type: "allocation"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Річний бюджет інженерного департаменту

Річний операційний бюджетний ліміт, виділений на фонд оплати праці інженерних команд.
