---
id: "HOBA-M-011"
type: "mechanism"
title: "Упередження та пенальті за перерву в роботі"
summary: "Алгоритми або рекрутери автоматично знижують пріоритет кандидатів із прогалинами у досвіді, незалежно від кваліфікації."
operates_at:
  - "HOBA-B-002"
  - "HOBA-B-003"
emissions:
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "high"
    evidence: ["EVD-003"]
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-003"]
facets:
  actor: "system"
  nature: "bias"
  visibility: "inferable"
  removability: "none"
amplifies:
  - "HOBA-M-008"
masks: []
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-003"
non_inferences:
  - "Employment gap does not correlate with underlying technical decline."
---

# Упередження та пенальті за перерву в роботі

Алгоритми або рекрутери автоматично знижують пріоритет кандидатів із прогалинами у досвіді, незалежно від кваліфікації.

### Structural Context
- **Actor:** `system`
- **Nature:** `bias`
- **Removability:** `none`

### Non-Inferences
- Employment gap does not correlate with underlying technical decline.
