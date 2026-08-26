---
id: "HOBA-M-010"
type: "mechanism"
title: "Прихована шкала оцінки або неоголошений пріоритет"
summary: "Команда інтерв’ю оцінює кандидата за внутрішніми специфічними уподобаннями, які не були вказані в описі вакансії."
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

# Прихована шкала оцінки або неоголошений пріоритет

Команда інтерв’ю оцінює кандидата за внутрішніми специфічними уподобаннями, які не були вказані в описі вакансії.

### Structural Context
- **Actor:** `hiring-manager`
- **Nature:** `bias`
- **Removability:** `intermediary`

### Non-Inferences
- Failure to guess unstated preferences is not equivalent to lack of core competence.
