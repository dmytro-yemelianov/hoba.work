---
id: "record.client_services_agreement"
type: "record"
aliases:
  - "R-005"
title: "Контракт на надання послуг із замовником"
record_class: "contract"
owner: "outside-party"
owner_actor: "actor.client"
summary: "Комерційний договір, що фіксує білінгову ставку та обсяг позиції."
flows:
  - to: "record.vendor_margin_and_headcount_allocation"
    label: "маржинальний розподіл вендора"
    percentage: 100
    fraction: 1.0
    split_type: "margin"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Контракт на надання послуг із замовником

Комерційний договір, що фіксує білінгову ставку та обсяг позиції.
