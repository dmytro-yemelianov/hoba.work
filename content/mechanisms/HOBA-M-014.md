---
id: "HOBA-M-014"
type: "mechanism"
title: "Location or Timezone Compliance Constraint"
summary: "Company legal or tax entity cannot support remote employment contracts in candidate physical residency jurisdiction."
operates_at:
  - "HOBA-B-002"
  - "HOBA-B-004"
emissions:
  -
    artifact: "HOBA-A-009"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "policy"
  nature: "rule"
  visibility: "observable"
  removability: "intermediary"
amplifies: []
masks: []
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Legal geography barrier is completely independent of candidate technical competence."
---

# Location or Timezone Compliance Constraint

Company legal or tax entity cannot support remote employment contracts in candidate physical residency jurisdiction.

### Structural Context
- **Actor:** `policy`
- **Nature:** `rule`
- **Removability:** `intermediary`

### Non-Inferences
- Legal geography barrier is completely independent of candidate technical competence.
