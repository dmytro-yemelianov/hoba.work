---
id: "HOBA-M-001"
type: "mechanism"
title: "Об’єктивна нестача технічної кваліфікації"
summary: "Перевірений рівень технічних знань кандидата об’єктивно не досягає необхідного стандарту для цієї ролі."
operates_at:
  - "HOBA-B-005"
  - "HOBA-B-006"
  - "HOBA-B-007"
emissions:
  -
    artifact: "HOBA-A-008"
    fidelity: "direct"
    likelihood: "high"
    evidence: ["EVD-006"]
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "candidate"
  nature: "rule"
  visibility: "inferable"
  removability: "candidate"
amplifies: []
masks: []
status: "active"
evidence_level: "established"
honest_baseline: true
evidence_ids:
  - "EVD-006"
non_inferences:
  - "Rejection does not mean the candidate has no engineering ability, only that the requirement bar was unmet for this specific benchmark."
---

# Об’єктивна нестача технічної кваліфікації

Перевірений рівень технічних знань кандидата об’єктивно не досягає необхідного стандарту для цієї ролі.

### Structural Context
- **Actor:** `candidate`
- **Nature:** `rule`
- **Removability:** `candidate`

### Non-Inferences
- Rejection does not mean the candidate has no engineering ability, only that the requirement bar was unmet for this specific benchmark.
