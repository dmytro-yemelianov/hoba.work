---
id: "record.contingency_placement_fee_commitment"
type: "record"
aliases:
  - "R-009"
title: "Contingency Placement Fee Commitment"
record_class: "placement-fee"
owner: "inside"
owner_actor: "actor.recruiter"
summary: "Placement commission contingent upon candidate starting and passing warranty period."
flows:
  - to: "record.external_agency_settlement"
    label: "agency invoice disbursement"
    percentage: 20
    fraction: 0.20
    split_type: "fee"
visibility_default: "opaque"
evidence_ids: []
status: "active"
evidence_level: "supported"
---

# Contingency Placement Fee Commitment

Placement commission contingent upon candidate starting and passing warranty period.
