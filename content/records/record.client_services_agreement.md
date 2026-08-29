---
id: "record.client_services_agreement"
type: "record"
aliases:
  - "R-005"
title: "Client Services Agreement"
record_class: "contract"
owner: "outside-party"
owner_actor: "actor.client"
summary: "Commercial contract defining billing rate and seat scope."
flows:
  - to: "record.vendor_margin_and_headcount_allocation"
    label: "vendor margin split"
    percentage: 100
    fraction: 1.0
    split_type: "margin"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Client Services Agreement

Commercial contract defining billing rate and seat scope.
