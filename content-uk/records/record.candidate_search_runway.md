---
id: "record.candidate_search_runway"
type: "record"
aliases:
  - "R-012"
title: "Запас автономності кандидата"
record_class: "runway"
owner: "inside"
owner_actor: "candidate"
summary: "Запас автономності в місяцях, розрахований на основі заощаджень та щомісячних витрат."
flows:
  - to: "record.search_month_burn_allocation"
    label: "щомісячні витрати на проживання"
    percentage: 100
    fraction: 1.0
    split_type: "burn"
visibility_default: "observable"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Запас автономності кандидата

Запас автономності в місяцях, розрахований на основі заощаджень та щомісячних витрат.
