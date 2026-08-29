---
id: "record.contingency_placement_fee_commitment"
type: "record"
aliases:
  - "R-009"
title: "Комісія агенції за успішний найм"
record_class: "placement-fee"
owner: "inside"
owner_actor: "actor.recruiter"
summary: "Комісійна винагорода рекрутинговій агенції, прив'язана до виходу кандидата та проходження гарантійного терміну."
flows:
  - to: "record.external_agency_settlement"
    label: "оплата рахунку агенції"
    percentage: 20
    fraction: 0.20
    split_type: "fee"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Комісія агенції за успішний найм

Комісійна винагорода рекрутинговій агенції, прив'язана до виходу кандидата та проходження гарантійного терміну.
