---
id: "HOBA-M-019"
type: "mechanism"
title: "Take-Home Evaluation Fatigue & Asymmetry"
summary: "Reviewers perform hurried 5-minute scans of complex 15-hour take-home projects, missing subtle architectural patterns and tests."
operates_at:
  - "HOBA-B-006"
emissions:
  -
    artifact: "HOBA-A-006"
    fidelity: "noise"
    likelihood: "medium"
    evidence: ["EVD-006"]
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-001"]
facets:
  actor: "hiring-manager"
  nature: "noise"
  visibility: "opaque"
  removability: "none"
amplifies:
  - "HOBA-M-012"
masks:
  - "HOBA-M-001"
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-006"
non_inferences:
  - "Take-home rejection under evaluation fatigue does not measure true software engineering craftsmanship."
---

# Take-Home Evaluation Fatigue & Asymmetry

Reviewers perform hurried 5-minute scans of complex 15-hour take-home projects, missing subtle architectural patterns and tests.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `noise`
- **Removability:** `none`

### Non-Inferences
- Take-home rejection under evaluation fatigue does not measure true software engineering craftsmanship.
