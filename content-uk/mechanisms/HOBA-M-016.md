---
id: "HOBA-M-016"
type: "mechanism"
title: "Спекулятивний сорсинг та формування \"резерву\" без вакансії"
summary: "Рекрутери ведуть переговори та збирають контакти на майбутнє без відкритої вакансії."
operates_at:
  - "HOBA-B-003"
  - "HOBA-B-004"
emissions:
  -
    artifact: "HOBA-A-012"
    fidelity: "distortion"
    likelihood: "high"
    evidence: ["EVD-001"]
  -
    artifact: "HOBA-A-001"
    fidelity: "void"
    likelihood: "medium"
    evidence: ["EVD-001"]
facets:
  actor: "recruiter"
  nature: "incentive"
  visibility: "opaque"
  removability: "none"
amplifies:
  - "HOBA-M-009"
masks: []
status: "active"
evidence_level: "supported"
honest_baseline: false
evidence_ids:
  - "EVD-001"
non_inferences:
  - "Ghosting after outbound message indicates absence of immediate opening, not profile rejection."
---

# Спекулятивний сорсинг та формування "резерву" без вакансії

Рекрутери ведуть переговори та збирають контакти на майбутнє без відкритої вакансії.

### Structural Context
- **Actor:** `recruiter`
- **Nature:** `incentive`
- **Removability:** `none`

### Non-Inferences
- Ghosting after outbound message indicates absence of immediate opening, not profile rejection.
