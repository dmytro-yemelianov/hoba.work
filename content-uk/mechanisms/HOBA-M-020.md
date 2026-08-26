---
id: "HOBA-M-020"
type: "mechanism"
title: "Автоматичне закриття заявки за таймаутом в ATS"
summary: "Система ATS автоматично відправляє масові відмови всім нерозглянутим кандидатам після спливу 45–60 днів."
operates_at:
  - "HOBA-B-001"
  - "HOBA-B-003"
emissions:
  -
    artifact: "HOBA-A-002"
    fidelity: "void"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "system"
  nature: "rule"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks:
  - "HOBA-M-006"
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Bulk timeout rejection contains zero qualitative assessment of candidate profile."
---

# Автоматичне закриття заявки за таймаутом в ATS

Система ATS автоматично відправляє масові відмови всім нерозглянутим кандидатам після спливу 45–60 днів.

### Structural Context
- **Actor:** `system`
- **Nature:** `rule`
- **Removability:** `none`

### Non-Inferences
- Bulk timeout rejection contains zero qualitative assessment of candidate profile.
