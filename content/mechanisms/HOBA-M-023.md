---
id: "HOBA-M-023"
type: "mechanism"
title: "Portfolio / Work Artifact Misinterpretation"
summary: "Screeners overlook candidate role architecture due to non-standard repository layout or unindexed open-source contributions."
operates_at:
  - "HOBA-B-003"
  - "HOBA-B-005"
emissions:
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-008"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["EVD-006"]
facets:
  actor: "candidate"
  nature: "noise"
  visibility: "inferable"
  removability: "candidate"
amplifies:
  - "HOBA-M-001"
masks: []
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Misinterpreted architecture can be corrected through structured documentation."
---

# Portfolio / Work Artifact Misinterpretation

Screeners overlook candidate role architecture due to non-standard repository layout or unindexed open-source contributions.

### Structural Context
- **Actor:** `candidate`
- **Nature:** `noise`
- **Removability:** `candidate`

### Non-Inferences
- Misinterpreted architecture can be corrected through structured documentation.
