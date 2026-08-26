---
id: "HOBA-M-004"
type: "mechanism"
title: "Неоголошена невідповідність зарплатних очікувань"
summary: "Ринкова вартість кандидата перевищує внутрішній бюджет вакансії, який не був озвучений на старті."
operates_at:
  - "HOBA-B-004"
  - "HOBA-B-009"
emissions:
  -
    artifact: "HOBA-A-002"
    fidelity: "euphemism"
    likelihood: "high"
    evidence: ["EVD-005"]
  -
    artifact: "HOBA-A-005"
    fidelity: "direct"
    likelihood: "medium"
    evidence: ["EVD-005"]
  -
    artifact: "HOBA-A-013"
    fidelity: "euphemism"
    likelihood: "medium"
    evidence: ["EVD-002"]
facets:
  actor: "policy"
  nature: "rule"
  visibility: "opaque"
  removability: "intermediary"
amplifies:
  - "HOBA-M-013"
masks:
  - "HOBA-M-001"
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-005"
non_inferences:
  - "Rejection does not mean candidate is overpriced for the market, only mismatched with this specific employer budget."
---

# Неоголошена невідповідність зарплатних очікувань

Ринкова вартість кандидата перевищує внутрішній бюджет вакансії, який не був озвучений на старті.

### Structural Context
- **Actor:** `policy`
- **Nature:** `rule`
- **Removability:** `intermediary`

### Non-Inferences
- Rejection does not mean candidate is overpriced for the market, only mismatched with this specific employer budget.
