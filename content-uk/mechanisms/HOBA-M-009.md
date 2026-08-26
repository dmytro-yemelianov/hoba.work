---
id: "HOBA-M-009"
type: "mechanism"
title: "Спотворення через метрики та квоти рекрутера"
summary: "Рекрутери змушені швидко сканувати профілі (по 5-10 секунд) через великий обсяг заявок, віддаючи перевагу шаблонам."
operates_at:
  - "HOBA-B-003"
  - "HOBA-B-004"
emissions:
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-012"
    fidelity: "noise"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "recruiter"
  nature: "incentive"
  visibility: "inferable"
  removability: "intermediary"
amplifies:
  - "HOBA-M-012"
masks:
  - "HOBA-M-008"
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Does not mean recruiter is individually negligent; reflects structural capacity mismatch."
---

# Спотворення через метрики та квоти рекрутера

Рекрутери змушені швидко сканувати профілі (по 5-10 секунд) через великий обсяг заявок, віддаючи перевагу шаблонам.

### Structural Context
- **Actor:** `recruiter`
- **Nature:** `incentive`
- **Removability:** `intermediary`

### Non-Inferences
- Does not mean recruiter is individually negligent; reflects structural capacity mismatch.
