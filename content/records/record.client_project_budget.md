---
id: "record.client_project_budget"
type: "record"
aliases:
  - "R-004"
title: "Client Project Budget"
record_class: "budget-line"
owner: "outside-party"
owner_actor: "client"
summary: "Client total budget line earmarked for third-party engineering services."
flows:
  - to: "record.client_services_agreement"
    label: "master services contract"
    percentage: 100
    fraction: 1.0
    split_type: "settlement"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Client Project Budget

Client total budget line earmarked for third-party engineering services.
