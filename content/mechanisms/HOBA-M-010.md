---
id: "HOBA-M-010"
type: "mechanism"
title: "Hidden Evaluation Rubric or Undisclosed Priority"
summary: "The interview team grades candidate against specific undisclosed architectural dogmas, internal frameworks, or unwritten biases."
operates_at:
  - "HOBA-B-005"
  - "HOBA-B-007"
  - "HOBA-B-008"
emissions:
  -
    artifact: "HOBA-A-008"
    fidelity: "distortion"
    likelihood: "medium"
    evidence: ["EVD-006"]
  -
    artifact: "HOBA-A-014"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-006"]
facets:
  actor: "hiring-manager"
  nature: "bias"
  visibility: "opaque"
  removability: "intermediary"
amplifies:
  - "HOBA-M-022"
masks:
  - "HOBA-M-001"
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-006"
non_inferences:
  - "Failure to guess unstated preferences is not equivalent to lack of core competence."
---

# Hidden Evaluation Rubric or Undisclosed Priority

The interview team grades candidate against specific undisclosed architectural dogmas, internal frameworks, or unwritten biases.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `bias`
- **Removability:** `intermediary`

### Non-Inferences
- Failure to guess unstated preferences is not equivalent to lack of core competence.
