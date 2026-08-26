---
id: "HOBA-M-006"
type: "mechanism"
title: "Застаріла або покинута вакансія"
summary: "Оголошення про роботу залишається активним на сайті, хоча команда припинила найм або зняла бюджет."
operates_at:
  - "HOBA-B-001"
  - "HOBA-B-002"
  - "HOBA-B-003"
emissions:
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "high"
    evidence: ["EVD-004"]
  -
    artifact: "HOBA-A-004"
    fidelity: "noise"
    likelihood: "medium"
    evidence: ["EVD-004"]
facets:
  actor: "system"
  nature: "void"
  visibility: "opaque"
  removability: "none"
amplifies:
  - "HOBA-M-020"
masks: []
status: "active"
evidence_level: "established"
honest_baseline: false
evidence_ids:
  - "EVD-004"
non_inferences:
  - "Application silence does not reflect candidate suitability."
---

# Застаріла або покинута вакансія

Оголошення про роботу залишається активним на сайті, хоча команда припинила найм або зняла бюджет.

### Structural Context
- **Actor:** `system`
- **Nature:** `void`
- **Removability:** `none`

### Non-Inferences
- Application silence does not reflect candidate suitability.
