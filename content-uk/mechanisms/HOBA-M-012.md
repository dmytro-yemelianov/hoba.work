---
id: "HOBA-M-012"
type: "mechanism"
title: "Перевантаження інтерв’юерів та календарна сатурація"
summary: "Інженери-інтерв’юери перевантажені задачами спринтів, що призводить до постійних переносів та поверхневої перевірки."
operates_at:
  - "HOBA-B-005"
  - "HOBA-B-007"
  - "HOBA-B-008"
emissions:
  -
    artifact: "HOBA-A-007"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-001"
    fidelity: "noise"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "hiring-manager"
  nature: "noise"
  visibility: "inferable"
  removability: "intermediary"
amplifies:
  - "HOBA-M-019"
masks: []
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Rescheduling is an operational issue and does not indicate negative evaluation."
---

# Перевантаження інтерв’юерів та календарна сатурація

Інженери-інтерв’юери перевантажені задачами спринтів, що призводить до постійних переносів та поверхневої перевірки.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `noise`
- **Removability:** `intermediary`

### Non-Inferences
- Rescheduling is an operational issue and does not indicate negative evaluation.
