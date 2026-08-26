---
id: "HOBA-M-021"
type: "mechanism"
title: "Розбіжність у бекграунді або регуляторна невідповідність"
summary: "Перевірка виявляє документальні розбіжності у датах роботи, відсутність диплому чи конфлікт інтересів."
operates_at:
  - "HOBA-B-011"
emissions:
  -
    artifact: "HOBA-A-011"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "candidate"
  nature: "rule"
  visibility: "observable"
  removability: "candidate"
amplifies: []
masks: []
status: "active"
evidence_level: "established"
honest_baseline: true
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Administrative mismatch in dates is distinct from fraudulent resume misrepresentation."
---

# Розбіжність у бекграунді або регуляторна невідповідність

Перевірка виявляє документальні розбіжності у датах роботи, відсутність диплому чи конфлікт інтересів.

### Structural Context
- **Actor:** `candidate`
- **Nature:** `rule`
- **Removability:** `candidate`

### Non-Inferences
- Administrative mismatch in dates is distinct from fraudulent resume misrepresentation.
