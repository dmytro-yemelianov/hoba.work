---
id: "HOBA-M-005"
type: "mechanism"
title: "Попередньо обраний внутрішній кандидат"
summary: "Вакансія була опублікована для виконання формальних вимог чи комплаєнсу, хоча внутрішнього кандидата вже було визначено."
operates_at:
  - "HOBA-B-001"
  - "HOBA-B-003"
  - "HOBA-B-007"
emissions:
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-004"]
  -
    artifact: "HOBA-A-003"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["EVD-004"]
facets:
  actor: "policy"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies: []
masks:
  - "HOBA-M-002"
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-004"
non_inferences:
  - "Cannot be asserted as fact without internal hiring log confirmation."
---

# Попередньо обраний внутрішній кандидат

Вакансія була опублікована для виконання формальних вимог чи комплаєнсу, хоча внутрішнього кандидата вже було визначено.

### Structural Context
- **Actor:** `policy`
- **Nature:** `incentive`
- **Removability:** `none`

### Non-Inferences
- Cannot be asserted as fact without internal hiring log confirmation.
