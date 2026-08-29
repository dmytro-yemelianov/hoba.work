---
id: "record.client_project_budget"
type: "record"
aliases:
  - "R-004"
title: "Проєктний бюджет замовника"
record_class: "budget-line"
owner: "outside-party"
owner_actor: "client"
summary: "Бюджетний ліміт замовника, виділений на закупівлю зовнішніх інженерних послуг."
flows:
  - to: "record.client_services_agreement"
    label: "генеральний договір про надання послуг"
    percentage: 100
    fraction: 1.0
    split_type: "settlement"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Проєктний бюджет замовника

Бюджетний ліміт замовника, виділений на закупівлю зовнішніх інженерних послуг.
