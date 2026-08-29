---
id: "record.candidate_liquid_savings"
type: "record"
aliases:
  - "R-011"
title: "Ліквідні заощадження кандидата"
record_class: "runway"
owner: "inside"
owner_actor: "actor.candidate"
summary: "Особисті ліквідні заощадження, виділені для забезпечення періоду пошуку роботи."
flows:
  - to: "record.candidate_search_runway"
    label: "виділення коштів на період пошуку"
    percentage: 100
    fraction: 1.0
    split_type: "burn"
visibility_default: "observable"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Ліквідні заощадження кандидата

Особисті ліквідні заощадження, виділені для забезпечення періоду пошуку роботи.
