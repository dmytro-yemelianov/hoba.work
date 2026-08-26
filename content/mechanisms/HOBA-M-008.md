---
id: "HOBA-M-008"
type: "mechanism"
title: "Automated Keyword / Qualification Filter"
summary: "Deterministic filter rejecting applications missing exact acronyms, certifications, or specific years-of-experience thresholds."
operates_at:
  - "HOBA-B-002"
emissions:
  -
    artifact: "HOBA-A-009"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-001"]
facets:
  actor: "system"
  nature: "rule"
  visibility: "inferable"
  removability: "candidate"
amplifies:
  - "HOBA-M-011"
masks: []
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Passing keyword filters does not guarantee interview invitation."
---

# Automated Keyword / Qualification Filter

Deterministic filter rejecting applications missing exact acronyms, certifications, or specific years-of-experience thresholds.

### Structural Context
- **Actor:** `system`
- **Nature:** `rule`
- **Removability:** `candidate`

### Non-Inferences
- Passing keyword filters does not guarantee interview invitation.
