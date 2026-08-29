---
id: "record.employer_hiring_and_sourcing_budget"
type: "record"
aliases:
  - "R-008"
title: "Бюджет роботодавця на найм і сорсинг"
record_class: "budget-line"
owner: "inside"
owner_actor: "actor.employer_policy"
summary: "Операційний рекрутинговий бюджет на покриття комісій агенцій та витрат на пошук."
flows:
  - to: "record.contingency_placement_fee_commitment"
    label: "зобов'язання з виплати комісії за успіх"
    percentage: 100
    fraction: 1.0
    split_type: "allocation"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Бюджет роботодавця на найм і сорсинг

Операційний рекрутинговий бюджет на покриття комісій агенцій та витрат на пошук.
