---
id: "HOBA-M-003"
type: "mechanism"
title: "ATS Parser Extraction Failure"
summary: "Multi-column formatting, graphics, custom fonts, or unsupported document layouts cause ATS parser to corrupt or omit critical work history."
operates_at:
  - "HOBA-B-001"
  - "HOBA-B-002"
emissions:
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-009"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-001"]
facets:
  actor: "system"
  nature: "noise"
  visibility: "inferable"
  removability: "candidate"
amplifies:
  - "HOBA-M-008"
masks: []
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Does not imply human recruiter evaluated and disliked candidate experience."
---

# ATS Parser Extraction Failure

Multi-column formatting, graphics, custom fonts, or unsupported document layouts cause ATS parser to corrupt or omit critical work history.

### Structural Context
- **Actor:** `system`
- **Nature:** `noise`
- **Removability:** `candidate`

### Non-Inferences
- Does not imply human recruiter evaluated and disliked candidate experience.
